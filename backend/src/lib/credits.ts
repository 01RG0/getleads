import { prisma } from './db.js'

export async function refundBounceCredit(workspaceId: string, contactId: string, campaignId?: string): Promise<void> {
  await prisma.$transaction([
    prisma.creditLedger.create({
      data: {
        workspaceId,
        amount: 1,
        transactionType: 'BOUNCE_REFUND',
        description: `Bounce refund for contact ${contactId}`,
        referenceId: campaignId ?? contactId,
      },
    }),
    prisma.workspace.update({ where: { id: workspaceId }, data: { creditBalance: { increment: 1 } } }),
  ])
}

export async function deductCredits(workspaceId: string, amount: number, description: string, referenceId?: string): Promise<void> {
  await prisma.$transaction([
    prisma.creditLedger.create({
      data: { workspaceId, amount: -amount, transactionType: 'ENRICHMENT_DEDUCTION', description, referenceId },
    }),
    prisma.workspace.update({ where: { id: workspaceId }, data: { creditBalance: { decrement: amount } } }),
  ])
}

export async function checkCredits(workspaceId: string, required: number): Promise<boolean> {
  const ws = await prisma.workspace.findUnique({ where: { id: workspaceId }, select: { creditBalance: true } })
  return (ws?.creditBalance ?? 0) >= required
}
