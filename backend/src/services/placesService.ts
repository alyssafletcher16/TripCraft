import { prisma } from '../lib/prisma'

const API_KEY   = process.env.GOOGLE_PLACES_API_KEY ?? ''
const BASE      = 'https://places.googleapis.com/v1'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

export interface PlaceReview {
  author: string
  rating: number
  text:   string
}

export interface PlaceData {
  placeId:     string
  name:        string
  type:        string
  rating:      number
  reviewCount: number
  priceLevel:  number | null
  reviews:     PlaceReview[]
  photos:      string[]   // photo resource names (places/{id}/photos/{ref})
  address:     string
  website:     string | null
  phone:       string | null
  hours:       string[] | null  // weekday descriptions
}

const PRICE_MAP: Record<string, number> = {
  PRICE_LEVEL_FREE:           0,
  PRICE_LEVEL_INEXPENSIVE:    1,
  PRICE_LEVEL_MODERATE:       2,
  PRICE_LEVEL_EXPENSIVE:      3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
}

// ── Text Search → first result's place id ─────────────────────────────────────
async function findPlaceId(query: string, location: string): Promise<string | null> {
  const res = await fetch(`${BASE}/places:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type':    'application/json',
      'X-Goog-Api-Key':  API_KEY,
      'X-Goog-FieldMask': 'places.id',
    },
    body: JSON.stringify({ textQuery: `${query} ${location}` }),
  })

  const data = await res.json() as { places?: Array<{ id: string }> }
  if (!data.places?.length) return null
  return data.places[0].id
}

// ── Place Details ──────────────────────────────────────────────────────────────
async function fetchDetails(placeId: string, type: string): Promise<PlaceData | null> {
  const fieldMask = [
    'id', 'displayName', 'rating', 'userRatingCount', 'priceLevel',
    'reviews', 'photos', 'formattedAddress',
    'websiteUri', 'internationalPhoneNumber', 'regularOpeningHours',
    'primaryTypeDisplayName',
  ].join(',')

  const res  = await fetch(`${BASE}/places/${placeId}`, {
    headers: {
      'X-Goog-Api-Key':  API_KEY,
      'X-Goog-FieldMask': fieldMask,
    },
  })

  if (!res.ok) return null
  const r = await res.json() as {
    id?:                       string
    displayName?:              { text: string }
    rating?:                   number
    userRatingCount?:          number
    priceLevel?:               string
    reviews?:                  Array<{
      rating: number
      authorAttribution?: { displayName?: string }
      text?: { text?: string }
      originalText?: { text?: string }
    }>
    photos?:                   Array<{ name: string }>
    formattedAddress?:         string
    websiteUri?:               string
    internationalPhoneNumber?: string
    regularOpeningHours?:      { weekdayDescriptions?: string[] }
    primaryTypeDisplayName?:   { text: string }
  }

  return {
    placeId,
    name:        r.displayName?.text ?? 'Unknown',
    type:        type || (r.primaryTypeDisplayName?.text ?? 'place'),
    rating:      r.rating       ?? 0,
    reviewCount: r.userRatingCount ?? 0,
    priceLevel:  r.priceLevel ? (PRICE_MAP[r.priceLevel] ?? null) : null,
    reviews:     (r.reviews ?? []).slice(0, 5).map((rv) => ({
      author: rv.authorAttribution?.displayName ?? 'Anonymous',
      rating: rv.rating,
      text:   rv.text?.text ?? rv.originalText?.text ?? '',
    })),
    photos:  (r.photos ?? []).slice(0, 6).map((p) => p.name),
    address: r.formattedAddress          ?? '',
    website: r.websiteUri                ?? null,
    phone:   r.internationalPhoneNumber  ?? null,
    hours:   r.regularOpeningHours?.weekdayDescriptions ?? null,
  }
}

// ── Public: search + cache ─────────────────────────────────────────────────────
export async function searchPlace(query: string, location: string, type = 'place'): Promise<PlaceData | null> {
  const placeId = await findPlaceId(query, location)
  if (!placeId) return null

  // Check cache (< 24 h)
  const cached = await prisma.placeCache.findUnique({ where: { placeId } })
  if (cached && Date.now() - cached.lastFetched.getTime() < CACHE_TTL) {
    return {
      placeId:     cached.placeId,
      name:        cached.name,
      type:        cached.type,
      rating:      cached.rating,
      reviewCount: cached.reviewCount,
      priceLevel:  cached.priceLevel,
      reviews:     cached.reviews as PlaceReview[],
      photos:      cached.photos  as string[],
      address:     cached.address,
      website:     cached.website,
      phone:       cached.phone,
      hours:       cached.hours as string[] | null,
    }
  }

  // Fetch full details from Google
  const place = await fetchDetails(placeId, type)
  if (!place) return null

  // Upsert into cache
  await prisma.placeCache.upsert({
    where:  { placeId },
    update: {
      name: place.name, type: place.type, rating: place.rating,
      reviewCount: place.reviewCount, priceLevel: place.priceLevel,
      reviews: place.reviews, photos: place.photos, address: place.address,
      website: place.website, phone: place.phone,
      hours: place.hours ?? undefined, lastFetched: new Date(),
    },
    create: {
      placeId: place.placeId, name: place.name, type: place.type,
      rating: place.rating, reviewCount: place.reviewCount, priceLevel: place.priceLevel,
      reviews: place.reviews, photos: place.photos, address: place.address,
      website: place.website, phone: place.phone,
      hours: place.hours ?? undefined, lastFetched: new Date(),
    },
  })

  return place
}

// ── Public: get by placeId from cache only ────────────────────────────────────
export async function getPlaceById(placeId: string): Promise<PlaceData | null> {
  const cached = await prisma.placeCache.findUnique({ where: { placeId } })
  if (!cached) return null
  return {
    placeId:     cached.placeId,
    name:        cached.name,
    type:        cached.type,
    rating:      cached.rating,
    reviewCount: cached.reviewCount,
    priceLevel:  cached.priceLevel,
    reviews:     cached.reviews as PlaceReview[],
    photos:      cached.photos  as string[],
    address:     cached.address,
    website:     cached.website,
    phone:       cached.phone,
    hours:       cached.hours as string[] | null,
  }
}
