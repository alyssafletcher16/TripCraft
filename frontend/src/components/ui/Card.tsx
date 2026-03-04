interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-2xl border border-mist
        ${hover ? 'transition-all duration-200 hover:border-terra/30 hover:shadow-md cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
