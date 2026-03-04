import { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'

export const metadata: Metadata = { title: 'Trip Detail — TripCraft' }

export default function TripDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="grid grid-cols-[272px_1fr] min-h-[calc(100vh-62px)]">
        <Sidebar activeTab="trips" />
        <main className="p-12 bg-surface">
          <p className="eyebrow mb-2">Trip Detail</p>
          <h1 className="page-title mb-2">Loading trip…</h1>
          <p className="text-slate text-sm">ID: {params.id}</p>
          {/* Full itinerary view will be built feature-by-feature */}
        </main>
      </div>
    </div>
  )
}
