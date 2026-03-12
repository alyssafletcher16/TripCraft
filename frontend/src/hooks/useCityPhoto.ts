'use client'

import { useState, useEffect } from 'react'

const cache: Record<string, string | null> = {}

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

    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city)}`)
      .then(r => r.json())
      .then(data => {
        // Prefer originalimage; fall back to thumbnail. Scale up thumbnail if possible.
        let url: string | null = null
        if (data?.originalimage?.source) {
          url = data.originalimage.source
        } else if (data?.thumbnail?.source) {
          // Bump the width in the thumbnail URL for better resolution
          url = (data.thumbnail.source as string).replace(/\/\d+px-/, '/1200px-')
        }
        cache[city] = url
        setPhotoUrl(url)
      })
      .catch(() => {
        cache[city] = null
        setPhotoUrl(null)
      })
  }, [city])

  return photoUrl
}
