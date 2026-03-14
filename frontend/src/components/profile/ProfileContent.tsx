'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { MyTripsTab } from '@/components/profile/MyTripsTab'
import { SettingsTab } from '@/components/profile/SettingsTab'
import { TravelersTab } from '@/components/profile/TravelersTab'
import { api } from '@/lib/api'

const TABS = ['My Trips', 'Travelers', 'Settings'] as const
type Tab = typeof TABS[number]

export function ProfileContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('tab') as Tab) ?? 'My Trips'
  const [activeTab, setActiveTab] = useState<Tab>(
    TABS.includes(initialTab as Tab) ? initialTab : 'My Trips'
  )
  const [pendingRequestCount, setPendingRequestCount] = useState(0)

  // Load pending follow request count for badge
  useEffect(() => {
    if (!session?.accessToken) return
    api.social.getRequests(session.accessToken)
      .then((data: any) => setPendingRequestCount(data.requests?.length ?? 0))
      .catch(() => {})
  }, [session])

  return (
    <>
      {/* Tab bar */}
      <div className="sticky top-0 z-10 bg-surface border-b border-mist px-4 sm:px-8 md:px-12">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors relative ${
                activeTab === tab
                  ? 'border-ocean text-ocean'
                  : 'border-transparent text-slate hover:text-ink'
              }`}
            >
              {tab}
              {tab === 'Travelers' && pendingRequestCount > 0 && (
                <span className="absolute -top-0.5 -right-1 w-4 h-4 rounded-full bg-terra text-white text-[9px] font-bold flex items-center justify-center">
                  {pendingRequestCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'My Trips' && <MyTripsTab />}
      {activeTab === 'Travelers' && <TravelersTab />}
      {activeTab === 'Settings' && <SettingsTab />}
    </>
  )
}
