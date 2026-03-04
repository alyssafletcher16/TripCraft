import { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'

export const metadata: Metadata = { title: 'New Trip — TripCraft' }

export default function NewTripPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="grid grid-cols-[272px_1fr] min-h-[calc(100vh-62px)]">
        <Sidebar activeTab="new" />
        <main className="p-12 bg-surface">
          <p className="eyebrow mb-2">Plan a Trip</p>
          <h1 className="page-title mb-8">Where to?</h1>
          {/* NewTripBuilder wizard will be built feature-by-feature */}
          <div className="card p-8 max-w-xl">
            <p className="text-slate text-sm">Trip builder coming soon…</p>
          </div>
        </main>
      </div>
    </div>
  )
}
