import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { PublicTripView } from '@/components/discover/PublicTripView'

export default function PublicTripPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="md:grid md:grid-cols-[auto_1fr] min-h-[calc(100vh-62px)]">
        <Sidebar activeTab="discover" />
        <main className="p-4 sm:p-8 md:p-12 bg-surface">
          <PublicTripView tripId={params.id} />
        </main>
      </div>
    </div>
  )
}
