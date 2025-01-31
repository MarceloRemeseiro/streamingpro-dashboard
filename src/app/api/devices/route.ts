import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const devices = await prisma.device.findMany({
    include: {
      configs: {
        orderBy: { updatedAt: 'desc' },
        take: 1
      }
    }
  })

  return NextResponse.json(devices)
} 