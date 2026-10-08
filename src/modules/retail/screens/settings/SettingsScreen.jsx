import { useEffect, useState } from 'react';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { PanelCard } from '@shared/display/PanelCard';
import { useTheme } from '@core/theme';
import { accentOptions, notificationToggles, readWorkingHours, saveWorkingHours, settingsSections, shapeOptions, sidebarOptions, storeProfile } from '@modules/retail/data';
import { cn } from '@utils/cn';

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300',
        checked ? 'bg-accent' : 'bg-border-strong'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-ivory shadow transition-transform duration-300 ease-out',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}

const ACCENT_STORAGE_KEY = 'takshi-accent';
const SHAPE_STORAGE_KEY = 'takshi-shape';
const SIDEBAR_STORAGE_KEY = 'takshi-sidebar';

const SIDEBAR_COLORS = {
  ink: '#0A0A0B',
  plum: '#42134F',
  graphite: '#27272A',
};

function applyAccentToRoot(option) {
  const root = document.documentElement;
  root.style.setProperty('--rgb-accent', option.rgb);
  root.style.setProperty('--rgb-brand', option.rgb);
  root.style.setProperty('--rgb-accent-muted', option.muted);
  root.style.setProperty('--color-accent', option.hex);
  root.style.setProperty('--color-accent-hover', option.hex);
}

function applyShapeToRoot(option) {
  const root = document.documentElement;
  root.style.setProperty('--radius-default', option.radius);
  root.style.setProperty('--radius-lg', option.radiusLg);
}

function applySidebarToRoot(option) {
  const color = SIDEBAR_COLORS[option?.id ?? option] ?? SIDEBAR_COLORS.ink;
  document.documentElement.style.setProperty('--color-sidebar', color);
}

/**
 * Settings screen — profile, notifications and appearance.
 * Accent colour and theme mode apply instantly to the whole app.
 */
export function SettingsScreen() {
  const [section, setSection] = useState('appearance');
  const [accent, setAccent] = useState(() => localStorage.getItem(ACCENT_STORAGE_KEY) ?? 'plum');
  const [shape, setShape] = useState(() => localStorage.getItem(SHAPE_STORAGE_KEY) ?? 'round');
  const [sidebar, setSidebar] = useState(() => localStorage.getItem(SIDEBAR_STORAGE_KEY) ?? 'ink');
  const [toggles, setToggles] = useState(() =>
    Object.fromEntries(notificationToggles.map((toggle) => [toggle.id, toggle.enabled]))
  );
  const [hours, setHours] = useState(readWorkingHours);
  const [hoursError, setHoursError] = useState('');
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const storedAccent = accentOptions.find((option) => option.id === localStorage.getItem(ACCENT_STORAGE_KEY));
    if (storedAccent) applyAccentToRoot(storedAccent);

    const storedShape = shapeOptions.find((option) => option.id === localStorage.getItem(SHAPE_STORAGE_KEY));
    if (storedShape) applyShapeToRoot(storedShape);

    const storedSidebar = sidebarOptions.find((option) => option.id === localStorage.getItem(SIDEBAR_STORAGE_KEY));
    if (storedSidebar) applySidebarToRoot(storedSidebar);
  }, []);

  const applyAccent = (option) => {
    setAccent(option.id);
    localStorage.setItem(ACCENT_STORAGE_KEY, option.id);
    applyAccentToRoot(option);
  };

  const applyShape = (option) => {
    setShape(option.id);
    localStorage.setItem(SHAPE_STORAGE_KEY, option.id);
    applyShapeToRoot(option);
  };

  const applySidebar = (option) => {
    setSidebar(option.id);
    localStorage.setItem(SIDEBAR_STORAGE_KEY, option.id);
    applySidebarToRoot(option);
  };

  const updateHours = (next) => {
    setHours(next);
    const saved = saveWorkingHours(next);
    setHoursError(saved ? '' : 'Closing time must be at least an hour after opening.');
  };

  return (
    <div className="flex flex-col gap-4 bg-surface-elevated/40 p-5">
      <header className="animate-fade-up">
        <h2 className="text-base font-semibold text-content">Settings</h2>
        <p className="mt-0.5 text-xs text-content-muted">
          Configure your store profile, notifications and appearance.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
        <nav className="animate-fade-up flex flex-row gap-1 lg:flex-col" style={{ animationDelay: '80ms' }}>
          {settingsSections.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={cn(
                'flex items-center gap-2 rounded px-3 py-2 text-left text-sm font-medium transition-colors',
                section === item.id
                  ? 'bg-accent-muted text-accent'
                  : 'text-content-muted hover:bg-surface-muted hover:text-content'
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="animate-fade-up" style={{ animationDelay: '140ms' }}>
          {section === 'profile' && (
            <PanelCard title="Store Profile" subtitle="Used on invoices and reports" className="max-w-2xl">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input label="Store name" defaultValue={storeProfile.storeName} />
                <Input label="Owner" defaultValue={storeProfile.ownerName} />
                <Input label="Email" defaultValue={storeProfile.email} />
                <Input label="Phone" defaultValue={storeProfile.phone} />
                <Input label="GST number" defaultValue={storeProfile.gstNumber} />
                <Input label="Currency" defaultValue={storeProfile.currency} />
                <Input
                  label="Opening time"
                  type="time"
                  value={hours.openingTime}
                  hint="Start of the working day on the dashboard tracker"
                  onChange={(event) => updateHours({ ...hours, openingTime: event.target.value })}
                />
                <Input
                  label="Closing time"
                  type="time"
                  value={hours.closingTime}
                  error={hoursError}
                  onChange={(event) => updateHours({ ...hours, closingTime: event.target.value })}
                />
                <label className="flex flex-col gap-1.5 text-sm font-medium text-content sm:col-span-2">
                  Address
                  <Input defaultValue={storeProfile.address} />
                </label>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button variant="primary">Save changes</Button>
              </div>
            </PanelCard>
          )}

          {section === 'notifications' && (
            <PanelCard title="Notifications" subtitle="Choose what the store should be alerted about" className="max-w-2xl">
              <ul className="flex flex-col divide-y divide-border/60">
                {notificationToggles.map((toggle, index) => (
                  <li
                    key={toggle.id}
                    className="animate-fade-up flex items-center justify-between gap-4 py-3"
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-content">{toggle.label}</p>
                      <p className="text-[11px] text-content-muted">{toggle.hint}</p>
                    </div>
                    <Toggle
                      label={toggle.label}
                      checked={toggles[toggle.id]}
                      onChange={(next) => setToggles((prev) => ({ ...prev, [toggle.id]: next }))}
                    />
                  </li>
                ))}
              </ul>
            </PanelCard>
          )}

          {section === 'appearance' && (
            <div className="flex max-w-2xl flex-col gap-4">
              <PanelCard title="Appearance" subtitle="Pick an accent colour, corner shape and interface mode">
                <p className="text-xs font-medium text-content">Accent color</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {accentOptions.map((option, index) => (
                    <button
                      key={option.id}
                      type="button"
                      title={option.label}
                      onClick={() => applyAccent(option)}
                      className={cn(
                        'animate-pop-in h-8 w-8 rounded-full border-2 transition-transform hover:scale-110',
                        accent === option.id ? 'border-accent ring-2 ring-accent/25' : 'border-border'
                      )}
                      style={{ backgroundColor: option.hex, animationDelay: `${index * 40}ms` }}
                    >
                      <span className="sr-only">{option.label}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-content-muted">
                  Selected: {accentOptions.find((option) => option.id === accent)?.label}
                </p>

                <p className="mt-4 text-xs font-medium text-content">Shape</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {shapeOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => applyShape(option)}
                      style={{ borderRadius: option.radius }}
                      className={cn(
                        'h-12 w-20 border-2 bg-surface-muted transition-colors',
                        shape === option.id ? 'border-accent' : 'border-border hover:border-border-strong'
                      )}
                    >
                      <span className="text-[11px] font-medium text-content">{option.label}</span>
                    </button>
                  ))}
                </div>

                <p className="mt-4 text-xs font-medium text-content">Sidebar</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sidebarOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => applySidebar(option)}
                      style={{ backgroundColor: SIDEBAR_COLORS[option.id] }}
                      className={cn(
                        'h-8 w-16 rounded border-2 transition-transform hover:scale-105',
                        sidebar === option.id ? 'border-accent ring-2 ring-accent/25' : 'border-border'
                      )}
                    >
                      <span className="text-[10px] font-medium text-white">{option.label}</span>
                    </button>
                  ))}
                </div>

                <p className="mt-4 text-xs font-medium text-content">Mode</p>
                <div className="mt-2 inline-flex rounded-full bg-surface-muted p-1">
                  {['light', 'dark'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setTheme(mode)}
                      className={cn(
                        'rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-colors',
                        theme === mode ? 'bg-surface text-content shadow-sm' : 'text-content-muted hover:text-content'
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </PanelCard>

              <PanelCard title="Data" subtitle="Export or import your store catalogue">
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary">Export CSV</Button>
                  <Button variant="outline">Import CSV</Button>
                  <Button variant="ghost">Reset demo data</Button>
                </div>
              </PanelCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}