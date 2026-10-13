import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { useAuth } from '@core/auth/AuthProvider.jsx';
import { useDemo } from '@services/demo';
import { WorkspaceLayout } from './WorkspaceScreens.jsx';

const STEPS = ['Name', 'Type', 'Contact', 'Address', 'Tax', 'Logo', 'Theme', 'Branch', 'Plan', 'Review'];
const TYPES = [
  ['clothing', 'Clothing / retail'],
  ['supermarket', 'Supermarket'],
  ['tiles', 'Tiles / hardware'],
  ['retail', 'General retail'],
];
const THEMES = [
  ['#6B238F', 'Plum'],
  ['#1C6A4A', 'Green'],
  ['#1D4E89', 'Blue'],
  ['#A83454', 'Crimson'],
];
const DRAFT_KEY = 'innosify.onboarding.draft';

const empty = {
  name: '',
  businessType: 'retail',
  firstName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  gstin: '',
  logoDataUrl: null,
  primaryColor: '#6B238F',
  branchName: 'Main Branch',
  planCode: 'FREE',
};

export function OnboardingScreen() {
  const { state, dispatch } = useDemo();
  const { tenantUser, selectBusiness } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => {
    try {
      return { ...empty, ...JSON.parse(sessionStorage.getItem(DRAFT_KEY) || '{}'), email: tenantUser?.email || '' };
    } catch {
      return { ...empty, email: tenantUser?.email || '' };
    }
  });
  const [error, setError] = useState('');

  const saveDraft = (next) => {
    setForm(next);
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next));
  };
  const set = (key) => (event) => saveDraft({ ...form, [key]: event.target.value });

  const next = () => {
    if (step === 0 && form.name.trim().length < 2) return setError('Enter a business name.');
    if (step === 2 && !form.phone.trim()) return setError('Enter a contact number.');
    if (step === 7 && !form.branchName.trim()) return setError('Name the first branch.');
    setError('');
    setStep((value) => Math.min(value + 1, STEPS.length - 1));
  };

  const finish = () => {
    const result = dispatch({
      type: 'business.create',
      userId: tenantUser.id,
      ...form,
      legalName: form.name,
      secondaryColor: '#F4F0EA',
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const created = result.state.tenants.find((tenant) => tenant.name === form.name.trim());
    sessionStorage.removeItem(DRAFT_KEY);
    selectBusiness(created.id);
    navigate('/retail/dashboard');
  };

  return (
    <WorkspaceLayout>
      <h1 className="text-2xl font-semibold">Create a business</h1>
      <ol className="mt-4 flex flex-wrap gap-2">
        {STEPS.map((label, index) => (
          <li key={label} className={`rounded-full px-3 py-1 text-xs font-medium shadow-sm ${index === step ? 'bg-accent text-content-inverse' : 'bg-surface text-content-muted'}`}>{index + 1}. {label}</li>
        ))}
      </ol>
      <div className="premium-card mt-6 max-w-xl p-6">
        {step === 0 && <Input label="Business name" value={form.name} onChange={set('name')} />}
        {step === 1 && (
          <div className="grid gap-2">
            {TYPES.map(([id, label]) => (
              <button key={id} type="button" onClick={() => saveDraft({ ...form, businessType: id })} className={`rounded border px-3 py-2 text-left text-sm ${form.businessType === id ? 'border-accent bg-accent-muted' : 'border-border'}`}>{label}</button>
            ))}
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-3">
            <Input label="Owner name" value={form.firstName || `${tenantUser?.firstName || ''} ${tenantUser?.lastName || ''}`} onChange={set('firstName')} />
            <Input label="Phone" value={form.phone} onChange={set('phone')} />
            <Input label="Email" value={form.email} onChange={set('email')} />
          </div>
        )}
        {step === 3 && (
          <div className="grid gap-3">
            <Input label="Address" value={form.address} onChange={set('address')} />
            <Input label="City" value={form.city} onChange={set('city')} />
          </div>
        )}
        {step === 4 && <Input label="GSTIN (optional)" value={form.gstin} onChange={set('gstin')} />}
        {step === 5 && (
          <label className="text-sm">
            Logo
            <input className="mt-2 block text-sm" type="file" accept="image/*" onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => saveDraft({ ...form, logoDataUrl: reader.result });
              reader.readAsDataURL(file);
            }} />
            {form.logoDataUrl && <img src={form.logoDataUrl} alt="" className="mt-3 h-16 w-16 rounded object-cover" />}
          </label>
        )}
        {step === 6 && (
          <div className="flex gap-2">
            {THEMES.map(([color, label]) => (
              <button key={color} type="button" title={label} onClick={() => saveDraft({ ...form, primaryColor: color })} className={`h-10 w-10 rounded-full border-2 ${form.primaryColor === color ? 'border-content' : 'border-transparent'}`} style={{ background: color }} />
            ))}
          </div>
        )}
        {step === 7 && <Input label="First branch" value={form.branchName} onChange={set('branchName')} />}
        {step === 8 && (
          <div className="grid gap-2">
            {state.plans.filter((plan) => plan.active).map((plan) => (
              <button key={plan.code} type="button" onClick={() => saveDraft({ ...form, planCode: plan.code })} className={`rounded border px-3 py-2 text-left text-sm ${form.planCode === plan.code ? 'border-accent bg-accent-muted' : 'border-border'}`}>
                <span className="font-medium">{plan.name}</span>
                <span className="mt-1 block text-xs text-content-muted">{plan.description}{plan.trialDays ? ` · ${plan.trialDays}-day trial` : ''}</span>
              </button>
            ))}
          </div>
        )}
        {step === 9 && (
          <div className="space-y-1 text-sm">
            <p><span className="text-content-muted">Name:</span> {form.name}</p>
            <p><span className="text-content-muted">Type:</span> {form.businessType}</p>
            <p><span className="text-content-muted">Branch:</span> {form.branchName}</p>
            <p><span className="text-content-muted">Plan:</span> {form.planCode}</p>
            <p className="text-xs text-content-muted">Finish creates an isolated tenant in this browser.</p>
          </div>
        )}
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        <div className="mt-5 flex justify-between">
          <Button variant="outline" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}>Back</Button>
          {step < STEPS.length - 1 ? <Button onClick={next}>Next</Button> : <Button onClick={finish}>Finish</Button>}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
