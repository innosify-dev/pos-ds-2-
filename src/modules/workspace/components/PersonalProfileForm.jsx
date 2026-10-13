import { useEffect, useState } from 'react';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { useAuth } from '@core/auth/AuthProvider.jsx';
import { accountInitials, accountName } from '@core/auth/AccountMenu.jsx';
import { useDemo } from '@services/demo';

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_BYTES = 512 * 1024;

function splitName(value) {
  const parts = String(value || '').trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') };
}

export function PersonalProfileForm() {
  const { tenantUser } = useAuth();
  const { dispatch } = useDemo();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarDataUrl, setAvatarDataUrl] = useState('');
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!tenantUser || editing) return;
    setFullName(accountName(tenantUser) === tenantUser.email ? '' : accountName(tenantUser));
    setPhone(tenantUser.phone || '');
    setAvatarDataUrl(tenantUser.avatarDataUrl || '');
    setAvatarChanged(false);
  }, [tenantUser, editing]);

  if (!tenantUser) return null;

  const reset = () => {
    setEditing(false);
    setErrors({});
    setNotice(null);
    setFullName(`${tenantUser.firstName || ''} ${tenantUser.lastName || ''}`.trim());
    setPhone(tenantUser.phone || '');
    setAvatarDataUrl(tenantUser.avatarDataUrl || '');
    setAvatarChanged(false);
  };

  const onFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      setErrors((current) => ({ ...current, avatar: 'Use a PNG, JPG, or WebP image.' }));
      return;
    }
    if (file.size > MAX_BYTES) {
      setErrors((current) => ({ ...current, avatar: 'Use an image under 512 KB. It stays in this browser only.' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarDataUrl(String(reader.result || ''));
      setAvatarChanged(true);
      setErrors((current) => ({ ...current, avatar: undefined }));
    };
    reader.readAsDataURL(file);
  };

  const save = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    const { firstName, lastName } = splitName(fullName);
    if (!firstName) nextErrors.fullName = 'Enter your name.';
    if (phone.trim() && !/^[0-9+\-\s()]{8,16}$/.test(phone.trim())) nextErrors.phone = 'Enter a valid mobile number.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    setNotice(null);
    await new Promise((resolve) => { setTimeout(resolve, 0); });
    const result = dispatch({
      type: 'user.profile',
      userId: tenantUser.id,
      firstName,
      lastName,
      phone: phone.trim(),
      ...(avatarChanged ? { avatarDataUrl: avatarDataUrl || null } : {}),
    });
    setSaving(false);
    if (!result.ok) {
      setNotice({ tone: 'danger', text: result.error });
      return;
    }
    setEditing(false);
    setAvatarChanged(false);
    setNotice({ tone: 'success', text: 'Saved in this browser’s demo store. Nothing was sent to a server.' });
  };

  const preview = avatarDataUrl || (!editing ? tenantUser.avatarDataUrl : '');

  return (
    <form onSubmit={save} className="space-y-5">
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-accent text-lg font-semibold text-content-inverse">
          {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : accountInitials(tenantUser)}
        </span>
        <div>
          <p className="text-sm font-medium text-content">Profile photo</p>
          <p className="mt-1 max-w-md text-xs text-content-muted">
            Initials are used until you choose an image. A chosen photo is stored only in this browser’s demo data. It is not uploaded to a server.
          </p>
          {editing && (
            <div className="mt-2 flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-content hover:bg-surface-muted">
                Choose image
                <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={onFile} />
              </label>
              {preview && (
                <button
                  type="button"
                  className="rounded-xl px-3 py-1.5 text-xs font-medium text-content-muted hover:text-content"
                  onClick={() => { setAvatarDataUrl(''); setAvatarChanged(true); }}
                >
                  Remove photo
                </button>
              )}
            </div>
          )}
          {errors.avatar && <p className="mt-1 text-xs text-danger">{errors.avatar}</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Full name"
          value={editing ? fullName : `${tenantUser.firstName || ''} ${tenantUser.lastName || ''}`.trim()}
          onChange={(event) => setFullName(event.target.value)}
          disabled={!editing || saving}
          error={errors.fullName}
          autoComplete="name"
        />
        <Input
          label="Phone number"
          value={editing ? phone : (tenantUser.phone || '')}
          onChange={(event) => setPhone(event.target.value)}
          disabled={!editing || saving}
          error={errors.phone}
          autoComplete="tel"
          hint="Optional"
        />
        <Input label="Email address" value={tenantUser.email} disabled hint="Email stays read-only. This demo has no verified email-change flow." />
      </div>

      {notice && (
        <p className={notice.tone === 'danger' ? 'text-sm text-danger' : 'text-sm text-success'} role="status">
          {notice.text}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {!editing ? (
          <Button type="button" onClick={() => { setEditing(true); setNotice(null); }}>Edit Profile</Button>
        ) : (
          <>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
            <Button type="button" variant="outline" disabled={saving} onClick={reset}>Cancel</Button>
          </>
        )}
      </div>
    </form>
  );
}
