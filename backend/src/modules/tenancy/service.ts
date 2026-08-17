import { CreditTxType } from '@prisma/client'
import { randomBytes, createHash } from 'crypto'
import { prisma } from '../../lib/db.js'

export { CreditTxType }

export async function deductCredits(
  workspaceId: string,
  amount: number,
  type: CreditTxType,
  description: string,
  userId?: string,
): Promise<boolean> {
  try {
    await prisma.$transaction(async (tx) => {
      const ws = await tx.workspace.findUnique({
        where: { id: workspaceId },
        select: { creditBalance: true },
      })
      if (!ws || ws.creditBalance < amount) throw new Error('insufficient_credits')

      await tx.workspace.update({
        where: { id: workspaceId },
        data: { creditBalance: { decrement: amount } },
      })

      await tx.creditLedger.create({
        data: {
          workspaceId,
          userId: userId ?? null,
          amount: -amount,
          transactionType: type,
          description,
        },
      })
    })
    return true
  } catch {
    return false
  }
}

export async function getBalance(
  workspaceId: string,
): Promise<{ balance: number; quota: number } | null> {
  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { creditBalance: true, monthlyCreditQuota: true },
  })
  if (!ws) return null
  return { balance: ws.creditBalance, quota: ws.monthlyCreditQuota }
}

export async function allocateToChild(
  parentId: string,
  childId: string,
  amount: number,
  userId: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const parent = await tx.workspace.findUnique({
      where: { id: parentId },
      select: { creditBalance: true },
    })
    if (!parent || parent.creditBalance < amount) throw new Error('insufficient_credits')

    await tx.workspace.update({ where: { id: parentId }, data: { creditBalance: { decrement: amount } } })
    await tx.workspace.update({ where: { id: childId }, data: { creditBalance: { increment: amount } } })

    await tx.creditLedger.create({
      data: {
        workspaceId: parentId,
        userId,
        amount: -amount,
        transactionType: CreditTxType.AGENCY_CHILD_TRANSFER,
        description: `Transfer to child workspace ${childId}`,
        referenceId: childId,
      },
    })
    await tx.creditLedger.create({
      data: {
        workspaceId: childId,
        userId,
        amount,
        transactionType: CreditTxType.AGENCY_CHILD_TRANSFER,
        description: `Transfer from parent workspace ${parentId}`,
        referenceId: parentId,
      },
    })
  })
}

export async function issueApiKey(workspaceId: string, name: string): Promise<{ raw: string; id: string; keyPrefix: string; createdAt: Date }> {
  const raw = 'ls_' + randomBytes(32).toString('hex')
  const prefix = raw.slice(0, 10)
  const hash = createHash('sha256').update(raw).digest('hex')
  const rec = await prisma.apiKey.create({ data: { workspaceId, name, keyPrefix: prefix, keyHash: hash }, select: { id: true, keyPrefix: true, createdAt: true } })
  return { raw, id: rec.id, keyPrefix: rec.keyPrefix, createdAt: rec.createdAt }
}

export async function revokeApiKey(keyId: string, workspaceId: string): Promise<void> {
  await prisma.apiKey.deleteMany({ where: { id: keyId, workspaceId } })
}

export async function listApiKeys(workspaceId: string) {
  return prisma.apiKey.findMany({ where: { workspaceId }, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, keyPrefix: true, lastUsedAt: true, expiresAt: true, createdAt: true } })
}
