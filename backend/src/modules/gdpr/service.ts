import { prisma } from '../../lib/db.js'

export async function addToSuppressionList(workspaceId: string, email: string, reason: string): Promise<void> {
  await prisma.suppressionList.upsert({
    where: { workspaceId_email: { workspaceId, email: email.toLowerCase() } },
    create: { workspaceId, email: email.toLowerCase(), reason },
    update: { reason },
  })
}

export async function removeFromSuppressionList(workspaceId: string, email: string): Promise<boolean> {
  const existing = await prisma.suppressionList.findUnique({
    where: { workspaceId_email: { workspaceId, email: email.toLowerCase() } },
  })
  if (!existing) return false
  await prisma.suppressionList.delete({
    where: { workspaceId_email: { workspaceId, email: email.toLowerCase() } },
  })
  return true
}

export async function isSuppressed(workspaceId: string, email: string): Promise<boolean> {
  const entry = await prisma.suppressionList.findUnique({
    where: { workspaceId_email: { workspaceId, email: email.toLowerCase() } },
  })
  return entry !== null
}

export async function logConsent(contactId: string, action: string, ipAddress?: string): Promise<void> {
  await prisma.consentLog.create({ data: { contactId, action, ipAddress } })
}

export async function purgeContact(contactId: string): Promise<void> {
  await prisma.contact.update({
    where: { id: contactId },
    data: {
      email: null,
      phone: null,
      linkedinUrl: null,
      firstName: '[PURGED]',
      lastName: '[PURGED]',
    },
  })
  await prisma.consentLog.create({ data: { contactId, action: 'gdpr_purge' } })
}

export async function exportContactData(contactId: string): Promise<Record<string, unknown> | null> {
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: { verifications: true, consentLogs: true, company: { select: { name: true, domain: true } } },
  })
  return contact as Record<string, unknown> | null
}
