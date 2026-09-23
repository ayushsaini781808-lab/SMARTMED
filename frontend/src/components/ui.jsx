// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-xl shadow-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({ variant = 'primary', className = '', children, ...props }) {
  const base =
    'inline-flex items-center justify-center gap-1.5 font-medium rounded-md transition-colors text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary:
      'bg-ink-900 text-white hover:bg-ink-700 dark:bg-ink-50 dark:text-ink-900 dark:hover:bg-ink-200',
    secondary:
      'bg-white dark:bg-ink-800 text-ink-700 dark:text-ink-200 border border-ink-200 dark:border-ink-600 hover:bg-ink-50 dark:hover:bg-ink-700',
    amber:
      'bg-amber-500 text-white hover:bg-amber-600',
    ghost:
      'text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-700',
    danger:
      'bg-white dark:bg-ink-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950'
  };
  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ tone = 'teal', children }) {
  const tones = {
    teal: 'bg-teal-50  dark:bg-teal-950  text-teal-700  dark:text-teal-300  border-teal-100  dark:border-teal-900',
    amber: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900',
    red: 'bg-red-50   dark:bg-red-950   text-red-700   dark:text-red-300   border-red-100   dark:border-red-900',
    grey: 'bg-ink-50   dark:bg-ink-700   text-ink-500   dark:text-ink-300   border-ink-100   dark:border-ink-600'
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${tones[tone] || tones.teal}`}
    >
      {children}
    </span>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-50 placeholder-ink-400 dark:placeholder-ink-500 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors ${className}`}
    />
  );
}

// ─── Label ────────────────────────────────────────────────────────────────────
export function Label({ children }) {
  return (
    <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wide mb-1.5">
      {children}
    </label>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ className = '' }) {
  return <hr className={`border-ink-100 dark:border-ink-700 ${className}`} />;
}
