import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { useAuth } from '@core/auth/AuthProvider.jsx';
import { useDemo } from '@services/demo';
import { hasPermission, permissionForPath } from '@services/demo/permissions.js';
import { DEMO_PASSWORD } from '@services/demo/seed.js';
import { AuthLayout, FormErrorMessage, GoogleAuthButton, PasswordInput } from '@modules/public/components/auth/AuthChrome.jsx';
import { LoginShowcase } from '@modules/public/components/auth/LoginShowcase.jsx';
import { DemoAccess } from '@modules/public/components/auth/DemoAccess.jsx';

function AuthFrame({ kicker, title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section className="auth-panel relative hidden overflow-hidden text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link to="/" className="relative z-10 flex items-center gap-3 text-sm font-semibold">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">IP</span>
          Innosify POS
        </Link>
        <div className="relative z-10 max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Multi-tenant point of sale</p>
          <h2 className="mt-3 text-4xl font-semibold leading-tight">One platform. A separate brand for every shop.</h2>
          <ul className="mt-6 space-y-3 text-sm text-white/80">
            <li>Catalogs, staff, and sales stay inside each business</li>
            <li>Cashiers bill. Owners manage the subscription</li>
            <li>Payments in this demo are simulated</li>
          </ul>
        </div>
        <p className="relative z-10 text-xs text-white/60">Innosify POS · customer demo sign-in</p>
      </section>
      <section className="flex min-h-screen flex-col justify-center px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2 text-sm font-semibold lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-xs text-content-inverse">IP</span>
            Innosify POS
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{kicker}</p>
          <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
          {subtitle && <p className="mt-2 text-sm leading-relaxed text-content-muted">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer}
        </div>
      </section>
    </div>
  );
}

function loginMessage(error) {
  if (error === 'Those demo credentials were not recognised.') return 'Those credentials were not recognised.';
  if (error === 'This demo account is inactive.') return 'This account is inactive.';
  if (error === 'This business is suspended in the demo.') return 'This business is suspended.';
  return error;
}

export function LoginScreen() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(params.get('expired') ? 'Your session expired. Sign in again.' : '');

  const submit = (event) => {
    event.preventDefault();
    if (pending) return;
    const identity = email.trim();
    const nextFields = {};
    if (!identity) nextFields.email = 'Enter your email address.';
    if (!password) nextFields.password = 'Enter your password.';
    setFieldErrors(nextFields);
    if (nextFields.email || nextFields.password) {
      setError('');
      return;
    }
    setPending(true);
    setError('');
    const result = login({ email: identity, password, scope: 'tenant' });
    if (!result.ok) {
      setPending(false);
      setError(loginMessage(result.error));
      return;
    }
    const next = params.get('next');
    const permission = next?.startsWith('/retail') ? permissionForPath(next) : null;
    const allowNext = Boolean(permission && result.role && hasPermission(result.role, permission));
    navigate(allowNext ? next : result.to);
  };

  const explore = (role) => {
    if (pending) return;
    setPending(true);
    setError('');
    const result = login({
      email: role.email,
      password: DEMO_PASSWORD,
      scope: role.scope,
      tenantId: role.tenantId,
    });
    setPending(false);
    if (!result.ok) {
      setError(loginMessage(result.error));
      return;
    }
    navigate(result.to);
  };

  return (
    <AuthLayout variant="login" aside={<LoginShowcase />} title="Welcome back" subtitle="Sign in to manage your business with Innosify POS.">
      <form onSubmit={submit} className="space-y-3" noValidate>
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="username"
          error={fieldErrors.email}
          required
        />
        <PasswordInput
          label="Password"
          shown={showPassword}
          onToggle={() => setShowPassword((value) => !value)}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          error={fieldErrors.password}
          required
        />
        <div className="flex justify-end text-sm">
          <Link to="/forgot-password" className="font-medium text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">Forgot password</Link>
        </div>
        <FormErrorMessage>{error}</FormErrorMessage>
        <Button className="w-full" type="submit" size="lg" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
        <div className="flex items-center gap-3 text-xs text-content-muted">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>
        <GoogleAuthButton />
        <p className="text-center text-sm text-content-muted">
          New to Innosify POS? <Link to="/signup" className="font-semibold text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">Create account</Link>
        </p>
      </form>
      <DemoAccess pending={pending} onExplore={explore} />
    </AuthLayout>
  );
}

function signupIssues(form) {
  const issues = {};
  if (!form.fullName.trim()) issues.fullName = 'Enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) issues.email = 'Enter a valid email address.';
  if (form.phone.trim() && !/^[0-9+\-\s()]{8,16}$/.test(form.phone.trim())) issues.phone = 'Enter a valid mobile number.';
  if (form.password.length < 8) issues.password = 'Use at least 8 characters.';
  if (form.password !== form.confirm) issues.confirm = 'Passwords do not match.';
  return issues;
}

function passwordGuidance(password) {
  if (!password) return 'At least 8 characters.';
  if (password.length < 8) return 'Use at least 8 characters.';
  if (password.length < 12) return 'Meets the minimum length.';
  return 'A longer password is harder to guess.';
}

export function SignupScreen() {
  const { dispatch } = useDemo();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    if (pending) return;
    const issues = signupIssues(form);
    setErrors(issues);
    setFormError('');
    if (Object.keys(issues).length) return;
    setPending(true);
    const created = dispatch({
      type: 'user.signup',
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      password: form.password,
    });
    if (!created.ok) {
      setPending(false);
      setFormError(created.error);
      return;
    }
    const result = login({ email: form.email, password: form.password, scope: 'tenant' });
    if (!result.ok) {
      setPending(false);
      setFormError(result.error);
      return;
    }
    navigate('/app/businesses/new');
  };

  return (
    <AuthLayout variant="login" aside={<LoginShowcase />} title="Start your retail journey" subtitle="Create your Innosify POS account and bring your business operations together.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Input label="Full name" value={form.fullName} onChange={set('fullName')} autoComplete="name" error={errors.fullName} required />
        <Input label="Email address" type="email" value={form.email} onChange={set('email')} autoComplete="email" error={errors.email} required />
        <Input label="Mobile number" value={form.phone} onChange={set('phone')} autoComplete="tel" hint="Optional" error={errors.phone} />
        <PasswordInput
          label="Password"
          shown={showPassword}
          onToggle={() => setShowPassword((value) => !value)}
          value={form.password}
          onChange={set('password')}
          autoComplete="new-password"
          hint={passwordGuidance(form.password)}
          error={errors.password}
          required
        />
        <PasswordInput
          label="Confirm password"
          shown={showConfirm}
          onToggle={() => setShowConfirm((value) => !value)}
          value={form.confirm}
          onChange={set('confirm')}
          autoComplete="new-password"
          error={errors.confirm}
          required
        />
        <FormErrorMessage>{formError}</FormErrorMessage>
        <Button className="w-full" type="submit" size="lg" disabled={pending}>{pending ? 'Creating account…' : 'Create account'}</Button>
        <div className="flex items-center gap-3 text-xs text-content-muted">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>
        <GoogleAuthButton />
        <p className="text-center text-sm text-content-muted">
          Already have an account? <Link to="/login" className="font-semibold text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export function ForgotPasswordScreen() {
  const { state, dispatch } = useDemo();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const user = state.users.find((item) => item.email === email.trim().toLowerCase());
    const value = `demo-reset-${Date.now().toString(36)}`;
    if (user) {
      dispatch({ type: 'reset.tokens', token: { token: value, email: user.email, usedAt: null } });
      setToken(value);
    } else {
      setToken('sent');
    }
  };

  return (
    <AuthFrame kicker="Account recovery" title="Forgot password" subtitle="No email is sent. If the demo account exists, a reset token is shown here.">
      <form onSubmit={submit} className="premium-card p-6">
        <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <Button className="mt-4 w-full" type="submit">Send reset link</Button>
        {token && token !== 'sent' && (
          <p className="mt-4 text-sm">Demo reset token: <Link className="text-accent" to={`/reset-password?token=${token}`}>{token}</Link></p>
        )}
        {token === 'sent' && <p className="mt-4 text-sm text-content-muted">If that account exists, reset instructions are ready. In this demo, unknown emails show the same confirmation.</p>}
      </form>
    </AuthFrame>
  );
}

export function ResetPasswordScreen() {
  const { dispatch } = useDemo();
  const [params] = useSearchParams();
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const submit = (event) => {
    event.preventDefault();
    const result = dispatch({ type: 'user.password', token: params.get('token'), password });
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setMessage('Password updated for this browser demo.');
    setTimeout(() => navigate('/login'), 600);
  };

  return (
    <AuthFrame kicker="New password" title="Reset password" subtitle="This only changes the demo password stored in your browser.">
      <form onSubmit={submit} className="premium-card p-6">
        <Input label="New password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        {message && <p className="mt-3 text-sm">{message}</p>}
        <Button className="mt-4 w-full" type="submit">Update password</Button>
      </form>
    </AuthFrame>
  );
}

export function AcceptInvitationScreen() {
  const { dispatch } = useDemo();
  const { login } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: 'New', lastName: 'Cashier', password: DEMO_PASSWORD });
  const [error, setError] = useState('');
  const token = params.get('token') || 'demo-invite-token';

  const submit = (event) => {
    event.preventDefault();
    const result = dispatch({ type: 'invitation.accept', token, ...form });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const invitation = result.state.invitations.find((item) => item.token === token);
    const email = invitation?.email || 'new.cashier@demo.takshi.test';
    const signed = login({ email, password: form.password, scope: 'tenant', tenantId: invitation?.tenantId });
    navigate(signed.to || '/retail/pos');
  };

  return (
    <AuthFrame kicker="Team invite" title="Accept invitation" subtitle={`Demo token ${token} joins Takshi Silks as a cashier when you use the seeded invite.`}>
      <form onSubmit={submit} className="premium-card p-6">
        <div className="mt-4 grid gap-3">
          <Input label="First name" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} />
          <Input label="Last name" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} />
          <Input label="Password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        </div>
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        <Button className="mt-4 w-full" type="submit">Join business</Button>
      </form>
    </AuthFrame>
  );
}
