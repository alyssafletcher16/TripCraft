import { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'

export const metadata: Metadata = { title: 'Discover — TripCraft' }

export default function DiscoverPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="grid grid-cols-[272px_1fr] min-h-[calc(100vh-62px)]">
        <Sidebar activeTab="discover" />
        <main className="p-12 bg-surface">
          <p className="eyebrow mb-2">Community</p>
          <h1 className="page-title mb-2">Discover trips</h1>
          <p className="text-slate text-sm mb-10">
            Browse public itineraries from the TripCraft community.
          </p>
          {/* Map + community cards will be built feature-by-feature */}
          <div className="card p-8 max-w-xl">
            <p className="text-slate text-sm">Community feed coming soon…</p>
          </div>
        </main>
      </div>
    </div>
  )
}
