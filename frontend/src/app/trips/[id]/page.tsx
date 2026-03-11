import { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { TripDetail } from '@/components/trips/TripDetail'

export const metadata: Metadata = { title: 'Trip — TripCraft' }

export default function TripDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="md:grid md:grid-cols-[272px_1fr] min-h-[calc(100vh-62px)]">
        <Sidebar activeTab="trips" />
        <main className="p-4 sm:p-8 md:p-12 bg-surface">
          <TripDetail tripId={params.id} />
        </main>
      </div>
    </div>
  )
}
