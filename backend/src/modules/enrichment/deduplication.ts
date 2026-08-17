import { createHash } from 'crypto'
import { prisma } from '../../lib/db.js'

function jaroWinkler(s1: string, s2: string): number {
  if (s1 === s2) return 1
  const l1 = s1.length, l2 = s2.length
  const matchDist = Math.max(Math.floor(Math.max(l1, l2) / 2) - 1, 0)
  const s1Matches = new Array(l1).fill(false)
  const s2Matches = new Array(l2).fill(false)
  let matches = 0, transpositions = 0

  for (let i = 0; i < l1; i++) {
    const start = Math.max(0, i - matchDist)
    const end = Math.min(i + matchDist + 1, l2)
    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue
      s1Matches[i] = s2Matches[j] = true
      matches++
      break
    }
  }
  if (matches === 0) return 0

  let k = 0
  for (let i = 0; i < l1; i++) {
    if (!s1Matches[i]) continue
    while (!s2Matches[k]) k++
    if (s1[i] !== s2[k]) transpositions++
    k++
  }

  const jaro = (matches / l1 + matches / l2 + (matches - transpositions / 2) / matches) / 3
  const prefix = Math.min(4, [...s1].findIndex((c, i) => c !== s2[i]) < 0 ? Math.min(l1, l2) : [...s1].findIndex((c, i) => c !== s2[i]))
  return jaro + prefix * 0.1 * (1 - jaro)
}

export async function findDuplicate(
  email: string | undefined,
  firstName: string,
  lastName: string,
  domain: string,
): Promise<{ id: string } | null> {
  // Exact email match first (fast path)
  if (email) {
    const emailHash = createHash('sha256').update(email.toLowerCase()).digest('hex')
    const byEmail = await prisma.contact.findFirst({
      where: { email: email.toLowerCase() },
      select: { id: true },
    })
    if (byEmail) return byEmail
    void emailHash // suppress unused var warning
  }

  // Fuzzy name + domain match
  const candidates = await prisma.contact.findMany({
    where: {
      company: { domain: domain.toLowerCase() },
    },
    select: { id: true, firstName: true, lastName: true },
    take: 50,
  })

  const fn = firstName.toLowerCase()
  const ln = lastName.toLowerCase()
  for (const c of candidates) {
    const fnSim = jaroWinkler(fn, (c.firstName ?? '').toLowerCase())
    const lnSim = jaroWinkler(ln, (c.lastName ?? '').toLowerCase())
    if (fnSim >= 0.92 && lnSim >= 0.92) return { id: c.id }
  }

  return null
}

export async function mergeContactData(
  existingId: string,
  newData: Record<string, unknown>,
): Promise<void> {
  const existing = await prisma.contact.findUnique({ where: { id: existingId } })
  if (!existing) return

  const updates: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(newData)) {
    if (value !== null && value !== undefined && (existing as Record<string, unknown>)[key] == null) {
      updates[key] = value
    }
  }

  if (Object.keys(updates).length > 0) {
    await prisma.contact.update({ where: { id: existingId }, data: updates })
  }
}
