'use client'

import { useState, useEffect } from 'react'

const cache: Record<string, string | null> = {}

async function extractImageFromSummary(data: any): Promise<string | null> {
  if (data?.originalimage?.source) return data.originalimage.source
  if (data?.thumbnail?.source) {
    return (data.thumbnail.source as string).replace(/\/\d+px-/, '/1200px-')
  }
  return null
}

async function fetchWikiPhoto(city: string): Promise<string | null> {
  // 1. Try direct article summary
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city)}`
    )
    const data = await res.json()
    const url = await extractImageFromSummary(data)
    if (url) return url
  } catch {
    // continue to fallback
  }

  // 2. Fall back to Wikipedia search to find the best matching article
  try {
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(city)}&format=json&origin=*&srlimit=3`
    )
    const searchData = await searchRes.json()
    const results: Array<{ title: string }> = searchData?.query?.search ?? []

    for (const result of results) {
      if (result.title.toLowerCase() === city.toLowerCase()) continue // already tried exact match
      const res2 = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(result.title)}`
      )
      const data2 = await res2.json()
      const url = await extractImageFromSummary(data2)
      if (url) return url
    }
  } catch {
    // ignore
  }

  return null
}

/** Returns a Wikipedia landmark photo URL for the given destination city. */
export function useCityPhoto(destination: string): string | null {
  const city = destination.split(',')[0].trim()
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    Object.prototype.hasOwnProperty.call(cache, city) ? cache[city] : null
  )

  useEffect(() => {
    if (Object.prototype.hasOwnProperty.call(cache, city)) {
      setPhotoUrl(cache[city])
      return
    }

    fetchWikiPhoto(city).then(url => {
      cache[city] = url
      setPhotoUrl(url)
    })
  }, [city])

  return photoUrl
}
