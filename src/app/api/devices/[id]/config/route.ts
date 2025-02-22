import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const config = await prisma.deviceConfig.findFirst({
      where: { device: { deviceId: (await params).id } },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({
      clientServer: config?.clientServer || process.env.DEFAULT_CLIENT_SERVER || 'http://localhost:3001',
      srtUrl: config?.srtUrl,
      updatedAt: config?.updatedAt || new Date()
    })
  } catch (error) {
    console.error('Error getting device config:', error)
    return NextResponse.json(
      { error: 'Error getting device config' },
      { status: 400 }
    )
  }
} 