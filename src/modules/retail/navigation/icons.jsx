/**
 * Retail navigation icons (retail-owned, stroke = currentColor so the
 * generic NavigationShell active/inactive colors apply automatically).
 */

function Icon({ children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function DashboardIcon() {
  return (
    <Icon>
      <path d="M3 13.5A9 9 0 0 1 12 4a9 9 0 0 1 9 9.5" />
      <path d="M3 13.5h18" />
      <path d="M12 13.5 16 9" />
      <circle cx="12" cy="13.5" r="1.4" />
    </Icon>
  );
}

export function ProductsIcon() {
  return (
    <Icon>
      <path d="M6 8h15l-1.5 9h-12z" />
      <path d="M6 8 5 4H2" />
      <circle cx="9.5" cy="20" r="1.3" />
      <circle cx="17" cy="20" r="1.3" />
    </Icon>
  );
}

export function CategoriesIcon() {
  return (
    <Icon>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </Icon>
  );
}

export function RegistersIcon() {
  return (
    <Icon>
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M9 20h6" />
      <path d="M12 16v4" />
      <path d="M7 9.5h4M7 12.5h7" />
    </Icon>
  );
}

export function SalesIcon() {
  return (
    <Icon>
      <path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4L10 21l-2-1.4L6 21z" />
      <path d="M9.5 8h5M9.5 12h5" />
    </Icon>
  );
}

export function ReturnIcon() {
  return (
    <Icon>
      <path d="M8 5 4 9l4 4" />
      <path d="M4 9h9a7 7 0 0 1 0 14h-2" transform="translate(0 -3)" />
      <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
    </Icon>
  );
}

export function RefundsIcon() {
  return (
    <Icon>
      <rect x="3" y="6.5" width="18" height="12" rx="2" />
      <circle cx="12" cy="12.5" r="2.6" />
      <path d="M6.5 9.5h.01M17.5 15.5h.01" />
    </Icon>
  );
}

export function CustomersIcon() {
  return (
    <Icon>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
      <circle cx="17" cy="10" r="2.4" />
      <path d="M16 14.6a4.5 4.5 0 0 1 4.5 4.9" />
    </Icon>
  );
}
