'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { UpcomingTab } from '@/components/profile/UpcomingTab'
import { CompletedTab } from '@/components/profile/CompletedTab'
import { SettingsTab } from '@/components/profile/SettingsTab'
import { api } from '@/lib/api'

const TABS = ['Active', 'Completed', 'Settings'] as const
type Tab = typeof TABS[number]

export function ProfileContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('tab') as Tab) ?? 'Active'
  const [activeTab, setActiveTab] = useState<Tab>(
    TABS.includes(initialTab as Tab) ? initialTab : 'Active'
  )
  const [completedRefreshKey, setCompletedRefreshKey] = useState(0)
  const [pendingRequestCount, setPendingRequestCount] = useState(0)

  function handleTripCompleted() {
    setCompletedRefreshKey((k) => k + 1)
  }

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
      <div className="border-b border-mist px-4 sm:px-8 md:px-12">
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
              {tab === 'Settings' && pendingRequestCount > 0 && (
                <span className="absolute -top-0.5 -right-1 w-4 h-4 rounded-full bg-terra text-white text-[9px] font-bold flex items-center justify-center">
                  {pendingRequestCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'Active' && (
        <UpcomingTab onTripCompleted={handleTripCompleted} />
      )}

      {activeTab === 'Completed' && (
        <CompletedTab refreshKey={completedRefreshKey} />
      )}

      {activeTab === 'Settings' && <SettingsTab />}
    </>
  )
}
