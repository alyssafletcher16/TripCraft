'use client'

import { useEffect, useRef } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[500] bg-ink/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className={`bg-white rounded-3xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        {title && (
          <div className="flex items-center justify-between px-4 sm:px-7 py-4 sm:py-5 border-b border-mist">
            <h2 className="font-serif text-xl font-bold text-ink">{title}</h2>
            <button
              onClick={onClose}
              className="text-slate hover:text-ink transition-colors text-lg leading-none"
            >
              ✕
            </button>
          </div>
        )}
        <div className="p-4 sm:p-7">{children}</div>
      </div>
    </div>
  )
}
