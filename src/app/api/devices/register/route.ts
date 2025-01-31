import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deviceRegistrationSchema } from '@/lib/schemas/device'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const validated = deviceRegistrationSchema.parse(data)

    const device = await prisma.device.upsert({
      where: { deviceId: validated.deviceId },
      update: {
        ...validated,
        lastSeen: new Date(),
        capabilities: validated.capabilities
      },
      create: {
        ...validated,
        lastSeen: new Date(),
        capabilities: validated.capabilities
      }
    })

    return NextResponse.json({
      clientServer: process.env.DEFAULT_CLIENT_SERVER || 'http://localhost:3001',
      checkInterval: 300
    })
  } catch (error) {
    console.error('Error registering device:', error)
    return NextResponse.json(
      { error: 'Error registering device' },
      { status: 400 }
    )
  }
} 