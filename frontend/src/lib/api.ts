const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'API error')
  }
  if (res.status === 204) return undefined as unknown as T
  return res.json()
}

// ─── Users ───────────────────────────────────────────────────────────────────
export const api = {
  users: {
    register: (data: { email: string; password: string; name: string }) =>
      request('/api/users/register', { method: 'POST', body: JSON.stringify(data) }),

    me: (token: string) => request('/api/users/me', {}, token),
  },

  // ─── Trips ───────────────────────────────────────────────────────────────
  trips: {
    list: (token: string) =>
      request<{ id: string; title: string; destination: string }[]>('/api/trips', {}, token),

    get: (id: string, token: string) => request(`/api/trips/${id}`, {}, token),

    create: (data: Record<string, unknown>, token: string) =>
      request('/api/trips', { method: 'POST', body: JSON.stringify(data) }, token),

    update: (id: string, data: Record<string, unknown>, token: string) =>
      request(`/api/trips/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, token),

    delete: (id: string, token: string) =>
      request(`/api/trips/${id}`, { method: 'DELETE' }, token),
  },

  // ─── Days ─────────────────────────────────────────────────────────────────
  days: {
    list: (tripId: string, token: string) =>
      request(`/api/trips/${tripId}/days`, {}, token),

    create: (tripId: string, data: Record<string, unknown>, token: string) =>
      request(`/api/trips/${tripId}/days`, { method: 'POST', body: JSON.stringify(data) }, token),

    update: (tripId: string, dayId: string, data: Record<string, unknown>, token: string) =>
      request(`/api/trips/${tripId}/days/${dayId}`, { method: 'PATCH', body: JSON.stringify(data) }, token),

    delete: (tripId: string, dayId: string, token: string) =>
      request(`/api/trips/${tripId}/days/${dayId}`, { method: 'DELETE' }, token),
  },

  // ─── Blocks ───────────────────────────────────────────────────────────────
  blocks: {
    list: (dayId: string, token: string) =>
      request(`/api/days/${dayId}/blocks`, {}, token),

    create: (dayId: string, data: Record<string, unknown>, token: string) =>
      request(`/api/days/${dayId}/blocks`, { method: 'POST', body: JSON.stringify(data) }, token),

    update: (dayId: string, blockId: string, data: Record<string, unknown>, token: string) =>
      request(`/api/days/${dayId}/blocks/${blockId}`, { method: 'PATCH', body: JSON.stringify(data) }, token),

    delete: (dayId: string, blockId: string, token: string) =>
      request(`/api/days/${dayId}/blocks/${blockId}`, { method: 'DELETE' }, token),
  },

  // ─── Reflections ──────────────────────────────────────────────────────────
  reflections: {
    get: (tripId: string, token: string) =>
      request(`/api/trips/${tripId}/reflection`, {}, token),

    save: (tripId: string, data: Record<string, unknown>, token: string) =>
      request(`/api/trips/${tripId}/reflection`, { method: 'PUT', body: JSON.stringify(data) }, token),
  },

  // ─── Discover ─────────────────────────────────────────────────────────────
  discover: {
    feed: (params?: { vibe?: string; sort?: string; limit?: number; offset?: number }) => {
      const qs = new URLSearchParams(params as Record<string, string>).toString()
      return request(`/api/discover${qs ? '?' + qs : ''}`)
    },

    upvote: (tripId: string, token: string) =>
      request(`/api/discover/${tripId}/upvote`, { method: 'POST' }, token),
  },
}
