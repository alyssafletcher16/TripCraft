import { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { ProfileHeader } from '@/components/profile/ProfileHeader'

export const metadata: Metadata = { title: 'Profile — TripCraft' }

export default function ProfilePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="grid grid-cols-[272px_1fr] min-h-[calc(100vh-62px)]">
        <Sidebar activeTab="profile" />
        <main className="bg-surface overflow-y-auto">
          <ProfileHeader />
          <div className="p-12">
            <p className="eyebrow mb-2">Trip Archive</p>
            <h2 className="font-serif text-3xl font-bold text-ink mb-8">Your journey</h2>
            {/* Past trips list will be built feature-by-feature */}
            <div className="card p-8 max-w-xl">
              <p className="text-slate text-sm">Trip archive coming soon…</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
