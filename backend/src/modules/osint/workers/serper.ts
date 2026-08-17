export interface MapsResult {
  name: string
  address: string
  phone: string
  website: string
  rating: number
}

export async function googleMapsSearch(
  query: string,
  location: string,
  serperApiKey: string,
): Promise<MapsResult[]> {
  try {
    const res = await fetch('https://google.serper.dev/maps', {
      method: 'POST',
      headers: { 'X-API-KEY': serperApiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: `${query} ${location}`, gl: 'us', num: 20 }),
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return []

    const data = (await res.json()) as any
    return (data.places ?? []).map((p: any) => ({
      name: p.title ?? '',
      address: p.address ?? '',
      phone: p.phoneNumber ?? '',
      website: p.website ?? '',
      rating: p.rating ?? 0,
    }))
  } catch {
    return []
  }
}
