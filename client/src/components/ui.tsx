import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function Heart({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 21s-7.5-4.6-9.5-9.2C1 8.3 3 5 6.3 5c2 0 3.5 1.1 4.2 2.4h3C14.2 6.1 15.7 5 17.7 5 21 5 23 8.3 21.5 11.8 19.500 16.4 12 21 12 21z" />
    </svg>
  )
}

type Variant = 'primary' | 'secondary'

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const styles =
    variant === 'primary'
      ? 'bg-love-700 text-white hover:bg-love-800 disabled:bg-love-300 disabled:text-love-900'
      : 'bg-white text-love-800 border-2 border-love-700 hover:bg-love-50 disabled:opacity-50'
  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold shadow-sm transition-colors disabled:cursor-not-allowed ${styles} ${className}`}
      {...props}
    />
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl border border-love-200 bg-white/90 p-5 shadow-lg shadow-love-200/40 sm:p-8 ${className}`}>
      {children}
    </section>
  )
}

export function Field({
  label,
  id,
  ...props
}: { label: string; id: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-ink-soft">
        {label}
      </label>
      <input
        id={id}
        className="min-h-12 w-full rounded-2xl border-2 border-love-300 bg-white px-4 text-base text-ink placeholder:text-ink-soft/70 focus:border-love-700"
        {...props}
      />
    </div>
  )
}

export function ErrorMessage({ message }: { message?: string | null }) {
  return (
    <div role="alert" aria-live="assertive">
      {message && <p className="mt-3 rounded-xl bg-love-50 px-4 py-2 text-sm font-medium text-danger">{message}</p>}
    </div>
  )
}

export function Loading({ text }: { text: string }) {
  return (
    <p role="status" className="py-16 text-center text-ink-soft">
      {text}
    </p>
  )
}

export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
      className="h-3 w-full overflow-hidden rounded-full bg-love-100"
    >
      <div className="h-full rounded-full bg-love-700 transition-all" style={{ width: `${(value / max) * 100}%` }} />
    </div>
  )
}
