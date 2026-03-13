'use client'

import { createContext, useContext, useState } from 'react'

interface SidebarContextValue {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
  desktopCollapsed: boolean
  toggleDesktop: () => void
  refreshKey: number
  incrementRefreshKey: () => void
}

const SidebarContext = createContext<SidebarContextValue>({
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
  desktopCollapsed: false,
  toggleDesktop: () => {},
  refreshKey: 0,
  incrementRefreshKey: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [desktopCollapsed, setDesktopCollapsed] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  return (
    <SidebarContext.Provider value={{
      isOpen,
      open:   () => setIsOpen(true),
      close:  () => setIsOpen(false),
      toggle: () => setIsOpen((o) => !o),
      desktopCollapsed,
      toggleDesktop: () => setDesktopCollapsed((c) => !c),
      refreshKey,
      incrementRefreshKey: () => setRefreshKey((k) => k + 1),
    }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => useContext(SidebarContext)
