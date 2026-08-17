import { prisma } from '../../lib/db.js'

export interface IcpCriteria {
  industries?: string[]
  employeeRanges?: string[]
  countries?: string[]
  seniorities?: string[]
  departments?: string[]
  minConfidence?: number
}

export function computeIcpScore(contact: {
  company?: { industry?: string | null; employeeRange?: string | null; country?: string | null } | null
  seniority?: string | null
  department?: string | null
  confidenceScore?: { toNumber?: () => number } | number | null
}, criteria: IcpCriteria): number {
  let score = 0
  const conf = typeof contact.confidenceScore === 'object' && contact.confidenceScore !== null && 'toNumber' in contact.confidenceScore
    ? (contact.confidenceScore as { toNumber: () => number }).toNumber()
    : Number(contact.confidenceScore ?? 0)

  if (criteria.industries?.length && contact.company?.industry) {
    if (criteria.industries.some((i) => contact.company!.industry!.toLowerCase().includes(i.toLowerCase()))) score += 25
  }
  if (criteria.employeeRanges?.length && contact.company?.employeeRange) {
    if (criteria.employeeRanges.includes(contact.company.employeeRange)) score += 20
  }
  if (criteria.countries?.length && contact.company?.country) {
    if (criteria.countries.includes(contact.company.country)) score += 15
  }
  if (criteria.seniorities?.length && contact.seniority) {
    if (criteria.seniorities.includes(contact.seniority)) score += 20
  }
  if (criteria.departments?.length && contact.department) {
    if (criteria.departments.includes(contact.department)) score += 10
  }
  const minConf = criteria.minConfidence ?? 0.5
  if (conf >= minConf) score += 10

  return Math.min(100, score)
}

export async function scoreContactsInWorkspace(workspaceId: string, criteria: IcpCriteria): Promise<number> {
  const contacts = await prisma.contact.findMany({
    include: { company: { select: { industry: true, employeeRange: true, country: true } } },
  })

  const updates = contacts.map((c) => {
    const score = computeIcpScore(c, criteria)
    return prisma.contact.update({ where: { id: c.id }, data: { icpScore: score } })
  })

  await Promise.all(updates)
  return updates.length
}

export async function scoreContact(contactId: string, criteria: IcpCriteria): Promise<number> {
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: { company: { select: { industry: true, employeeRange: true, country: true } } },
  })
  if (!contact) throw new Error('Contact not found')
  const score = computeIcpScore(contact, criteria)
  await prisma.contact.update({ where: { id: contactId }, data: { icpScore: score } })
  return score
}
