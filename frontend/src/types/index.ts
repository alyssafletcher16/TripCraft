export type TripStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'DRAFT'
export type BlockType = 'TRANSPORT' | 'STAY' | 'ACTIVITY' | 'FOOD' | 'NOTE'
export type BookingStatus = 'BOOKED' | 'PENDING' | 'CANCELLED'
export type InsightType = 'INFO' | 'WARNING' | 'DANGER'

export interface User {
  id: string
  email: string
  name: string | null
  avatar: string | null
}

export interface Trip {
  id: string
  userId: string
  title: string
  destination: string
  country: string | null
  startDate: string | null
  endDate: string | null
  travelers: number
  budget: number | null
  budgetType: 'total' | 'per_person'
  status: TripStatus
  isPublic: boolean
  rank: number | null
  coverEmoji: string | null
  vibes: TripVibe[]
  days: ItineraryDay[]
  reflection?: TripReflection
  insights: TripInsight[]
  checklist: ChecklistItem[]
  _count?: { upvotes: number }
  createdAt: string
  updatedAt: string
}

export interface TripVibe {
  id: string
  tripId: string
  vibe: string
}

export interface ItineraryDay {
  id: string
  tripId: string
  dayNum: number
  name: string
  theme: string | null
  date: string | null
  blocks: Block[]
  photos: DayPhoto[]
}

export interface Block {
  id: string
  dayId: string
  type: BlockType
  title: string
  detail: string | null
  price: string | null
  priceValue: number | null
  status: BookingStatus
  confCode: string | null
  cancelPolicy: string | null
  cancelSafe: boolean
  bookingUrl: string | null
  emoji: string | null
  bgColor: string | null
  sortOrder: number
  createdAt: string
}

export interface DayPhoto {
  id: string
  dayId: string
  url: string | null
  emoji: string | null
  caption: string | null
  sortOrder: number
}

export interface TripReflection {
  id: string
  tripId: string
  rank: number | null
  expectation: string | null
  sentence: string | null
  changes: string[]
  bestDecision: string | null
  regret: string | null
  rebook: Record<string, string> | null
  tripTitle: string | null
  createdAt: string
  updatedAt: string
}

export interface TripInsight {
  id: string
  tripId: string
  type: InsightType
  text: string
  source: string | null
  color: string | null
}

export interface ChecklistItem {
  id: string
  tripId: string
  label: string
  deadline: string | null
  done: boolean
  sortOrder: number
}

// NextAuth session extension
declare module 'next-auth' {
  interface Session {
    accessToken?: string
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
    }
  }
}
