import { prisma } from '../../lib/db.js'
import type { BulkJob } from '@prisma/client'

export async function createBulkJob(workspaceId: string, totalRows: number): Promise<{ id: string }> {
  return prisma.bulkJob.create({
    data: { workspaceId, totalRows, status: 'PENDING' },
    select: { id: true },
  })
}

export async function updateBulkProgress(
  jobId: string,
  processedRows: number,
  successRows: number,
  failedRows: number,
): Promise<void> {
  await prisma.bulkJob.update({
    where: { id: jobId },
    data: { processedRows, successRows, failedRows, status: 'PROCESSING' },
  })
}

export async function completeBulkJob(jobId: string): Promise<void> {
  await prisma.bulkJob.update({ where: { id: jobId }, data: { status: 'DONE' } })
}

export async function failBulkJob(jobId: string): Promise<void> {
  await prisma.bulkJob.update({ where: { id: jobId }, data: { status: 'FAILED' } })
}

export async function getBulkJob(jobId: string): Promise<BulkJob | null> {
  return prisma.bulkJob.findUnique({ where: { id: jobId } })
}
