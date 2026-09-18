export function Card({ className = '', children, ...props }) {
  return (
    <div className={`bg-white rounded-xl2 shadow-card border border-ink-100 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Button({ variant = 'primary', className = '', children, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition px-5 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700',
    secondary: 'bg-white text-teal-700 border border-teal-200 hover:bg-teal-50',
    amber: 'bg-amber-500 text-white hover:bg-amber-600',
    ghost: 'text-ink-700 hover:bg-ink-50',
    danger: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
  };
  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Badge({ tone = 'teal', children }) {
  const tones = {
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    grey: 'bg-ink-50 text-ink-400 border-ink-100'
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${tones[tone] || tones.teal}`}>
      {children}
    </span>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-ink-100 px-3.5 py-2.5 text-sm focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none transition ${props.className || ''}`}
    />
  );
}

export function Label({ children }) {
  return <label className="block text-xs font-semibold text-ink-400 uppercase tracking-wide mb-1.5">{children}</label>;
}
