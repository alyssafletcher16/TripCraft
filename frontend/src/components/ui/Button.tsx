import { ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'ghost' | 'outline' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variants: Record<Variant, string> = {
  primary: 'bg-terra text-white hover:bg-terra-lt hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(196,96,58,0.4)]',
  ghost:   'text-white/60 border border-white/15 hover:border-white/35 hover:text-white',
  outline: 'border border-mist bg-white text-ink hover:border-terra hover:text-terra',
  danger:  'bg-danger/10 text-danger border border-danger/30 hover:bg-danger hover:text-white',
}

const sizes: Record<Size, string> = {
  sm:  'px-4 py-1.5 text-xs rounded-full',
  md:  'px-6 py-2.5 text-sm rounded-full',
  lg:  'px-8 py-3.5 text-sm rounded-full',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          font-medium transition-all duration-200 inline-flex items-center gap-2
          disabled:opacity-50 disabled:pointer-events-none
          ${variants[variant]} ${sizes[size]} ${className}
        `}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
