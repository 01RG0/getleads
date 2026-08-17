export interface GHuntResult {
  email: string
  google_id?: string
  name?: string
  profile_photo?: string
  active_services: string[]
  maps_reviews_count: number
}

export async function lookupGmail(email: string): Promise<GHuntResult | null> {
  const workerUrl = process.env.GHUNT_WORKER_URL
  if (!workerUrl) return null

  try {
    const res = await fetch(workerUrl + '/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      signal: AbortSignal.timeout(60000),
    })
    if (!res.ok) return null

    const data = await res.json() as Partial<GHuntResult>
    return {
      email,
      google_id: data.google_id,
      name: data.name,
      profile_photo: data.profile_photo,
      active_services: data.active_services ?? [],
      maps_reviews_count: data.maps_reviews_count ?? 0,
    }
  } catch {
    return null
  }
}
