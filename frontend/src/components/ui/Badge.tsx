type BadgeVariant = 'ocean' | 'terra' | 'gold' | 'green' | 'caution' | 'danger' | 'slate'

const variants: Record<BadgeVariant, string> = {
  ocean:   'bg-ocean/10 text-ocean border-ocean/20',
  terra:   'bg-terra/15 text-terra border-terra/30',
  gold:    'bg-gold/15 text-gold border-gold/30',
  green:   'bg-success/10 text-success border-success/20',
  caution: 'bg-caution/10 text-caution border-caution/20',
  danger:  'bg-danger/10 text-danger border-danger/20',
  slate:   'bg-slate/10 text-slate border-slate/20',
}

export function Badge({
  children,
  variant = 'slate',
}: {
  children: React.ReactNode
  variant?: BadgeVariant
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border tracking-[0.5px] uppercase ${variants[variant]}`}
    >
      {children}
    </span>
  )
}
