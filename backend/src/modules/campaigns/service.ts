import { CampaignStatus, type Campaign } from '@prisma/client'
import { prisma } from '../../lib/db.js'

export async function createCampaign(workspaceId: string, name: string): Promise<Campaign> {
  return prisma.campaign.create({
    data: { workspaceId, name },
  })
}

export async function getCampaign(id: string, workspaceId: string): Promise<Campaign | null> {
  return prisma.campaign.findFirst({
    where: { id, workspaceId },
  })
}

export async function listCampaigns(
  workspaceId: string,
  page: number,
  limit: number,
): Promise<{ campaigns: Campaign[]; total: number }> {
  const skip = (page - 1) * limit

  const [campaigns, total] = await prisma.$transaction([
    prisma.campaign.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.campaign.count({ where: { workspaceId } }),
  ])

  return { campaigns, total }
}

export async function enrollContacts(
  campaignId: string,
  contactIds: string[],
  workspaceId: string,
): Promise<{ enrolled: number; alreadyEnrolled: number }> {
  // Verify campaign belongs to workspace
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, workspaceId },
    select: { id: true },
  })

  if (!campaign) {
    throw Object.assign(new Error('Campaign not found'), { code: 'NOT_FOUND' })
  }

  // Find which contacts are already enrolled
  const existing = await prisma.campaignContact.findMany({
    where: { campaignId, contactId: { in: contactIds } },
    select: { contactId: true },
  })

  const alreadyEnrolledIds = new Set(existing.map((r) => r.contactId))
  const newContactIds = contactIds.filter((id) => !alreadyEnrolledIds.has(id))

  if (newContactIds.length > 0) {
    await prisma.$transaction([
      prisma.campaignContact.createMany({
        data: newContactIds.map((contactId) => ({ campaignId, contactId })),
        skipDuplicates: true,
      }),
      prisma.campaign.update({
        where: { id: campaignId },
        data: { targetCount: { increment: newContactIds.length } },
      }),
    ])
  }

  return {
    enrolled: newContactIds.length,
    alreadyEnrolled: alreadyEnrolledIds.size,
  }
}

export async function updateStatus(
  campaignId: string,
  workspaceId: string,
  status: CampaignStatus,
): Promise<Campaign> {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, workspaceId },
    select: { id: true },
  })

  if (!campaign) {
    throw Object.assign(new Error('Campaign not found'), { code: 'NOT_FOUND' })
  }

  return prisma.campaign.update({
    where: { id: campaignId },
    data: { status },
  })
}

export async function recordBounce(campaignId: string, contactId: string): Promise<void> {
  const campaignContact = await prisma.campaignContact.findUnique({
    where: { campaignId_contactId: { campaignId, contactId } },
    select: { id: true, status: true, campaign: { select: { workspaceId: true } } },
  })

  if (!campaignContact) {
    throw Object.assign(new Error('CampaignContact not found'), { code: 'NOT_FOUND' })
  }

  const wasAlreadyBounced = campaignContact.status === 'bounced'

  await prisma.$transaction([
    prisma.campaignContact.update({
      where: { campaignId_contactId: { campaignId, contactId } },
      data: { status: 'bounced' },
    }),
    ...(wasAlreadyBounced
      ? []
      : [
          prisma.campaign.update({
            where: { id: campaignId },
            data: { bounceCount: { increment: 1 } },
          }),
        ]),
  ])
}

export { CampaignStatus }
