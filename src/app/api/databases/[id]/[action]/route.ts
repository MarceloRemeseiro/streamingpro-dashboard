import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import docker from '@/lib/docker'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Obtener parámetros de la URL usando el nuevo método de Next.js 15
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const action = searchParams.get('action')

    if (!id || !action) {
      return NextResponse.json(
        { error: 'Missing parameters' },
        { status: 400 }
      )
    }

    const database = await prisma.databaseInstance.findUnique({
      where: { id }
    })

    if (!database) {
      return NextResponse.json({ error: 'Database not found' }, { status: 404 })
    }

    const container = docker.getContainer(database.containerId)

    // Validar acción permitida
    if (!['start', 'stop'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Ejecutar acción
    if (action === 'start') {
      await container.start()
      await prisma.databaseInstance.update({
        where: { id },
        data: { status: 'RUNNING' }
      })
    } else {
      await container.stop()
      await prisma.databaseInstance.update({
        where: { id },
        data: { status: 'STOPPED' }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 