function Frame({ title, children }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white text-slate-900 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <p className="text-xs font-semibold">{title}</p>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">Sample</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export function BillingStage() {
  return (
    <Frame title="Billing">
      <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500">Scan or search · cotton saree</div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span>Cotton saree × 1</span>
        <span className="font-medium">₹2,800</span>
      </div>
      <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-3">
        <p className="text-xs text-slate-500">GST 5% · sample</p>
        <p className="text-lg font-semibold">₹2,940</p>
      </div>
      <p className="home-pop mt-3 inline-flex rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">Sale completed</p>
    </Frame>
  );
}

export function InventoryStage() {
  const rows = [
    ['Kanjivaram saree', '8', false],
    ['Organza saree', '2', true],
    ['Cotton saree', '14', false],
  ];
  return (
    <Frame title="Inventory">
      <ul className="space-y-2 text-sm">
        {rows.map(([name, qty, low]) => (
          <li key={name} className="flex items-center justify-between">
            <span>{name}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs ${low ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-700'}`}>{qty}{low ? ' · low' : ''}</span>
          </li>
        ))}
      </ul>
    </Frame>
  );
}

export function BranchStage() {
  return (
    <Frame title="Branches">
      <div className="flex gap-2 text-xs">
        <span className="rounded-full bg-indigo-600 px-3 py-1 font-semibold text-white">Main Store</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">City Showroom</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-slate-50 p-3"><p className="text-slate-500">Sales</p><p className="font-semibold">₹28,400</p></div>
        <div className="rounded-2xl bg-slate-50 p-3"><p className="text-slate-500">Registers</p><p className="font-semibold">2 open</p></div>
      </div>
      <p className="mt-3 text-xs text-slate-500">Sample figures for one business. Another shop’s catalog stays separate.</p>
    </Frame>
  );
}

export function StaffStage() {
  const roles = [
    ['Owner/Admin', 'Business, subscription, and settings'],
    ['Branch Head', 'Assigned branch'],
    ['Cashier', 'Billing'],
    ['Inventory Staff', 'Products and stock'],
  ];
  return (
    <Frame title="Staff">
      <ul className="space-y-2 text-sm">
        {roles.map(([role, access]) => (
          <li key={role} className="flex items-center justify-between gap-3">
            <span className="font-medium">{role}</span>
            <span className="text-right text-xs text-slate-500">{access}</span>
          </li>
        ))}
      </ul>
    </Frame>
  );
}

export function AnalyticsStage() {
  const bars = [36, 58, 48, 76, 64, 88];
  return (
    <Frame title="Analytics">
      <div className="flex h-28 items-end gap-2">
        {bars.map((height, index) => (
          <div key={index} className="home-bar flex-1 rounded-t bg-indigo-500" style={{ height: `${height}%`, animationDelay: `${index * 0.06}s` }} />
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500">Sample month. Live charts read that business’s own sales.</p>
    </Frame>
  );
}

export function BrandStage() {
  return (
    <Frame title="Brand">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-sm font-semibold text-white">TS</span>
        <div>
          <p className="font-semibold">Takshi Silks</p>
          <p className="text-xs text-slate-500">Sample shop · accent follows this business</p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <span className="h-8 w-8 rounded-lg bg-indigo-600" />
        <span className="h-8 w-8 rounded-lg bg-emerald-600" />
        <span className="h-8 w-8 rounded-lg bg-[#6B238F]" />
      </div>
    </Frame>
  );
}

const STAGES = {
  billing: BillingStage,
  inventory: InventoryStage,
  branches: BranchStage,
  staff: StaffStage,
  analytics: AnalyticsStage,
  brand: BrandStage,
};

export function FeatureStage({ kind }) {
  const Stage = STAGES[kind] || BillingStage;
  return (
    <div className="rounded-[28px] bg-gradient-to-br from-indigo-500/25 to-cyan-300/10 p-3 sm:p-4">
      <Stage />
    </div>
  );
}
