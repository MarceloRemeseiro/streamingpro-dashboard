import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import docker from '@/lib/docker'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (!action) {
      return NextResponse.json(
        { error: 'Parámetro "action" requerido' },
        { status: 400 }
      )
    }

    const database = await prisma.databaseInstance.findUnique({
      where: { id }
    })

    if (!database) {
      return NextResponse.json(
        { error: 'Base de datos no encontrada' }, 
        { status: 404 }
      )
    }

    const container = docker.getContainer(database.containerId)

    switch (action.toLowerCase()) {
      case 'start':
        await container.start()
        await prisma.databaseInstance.update({
          where: { id },
          data: { status: 'RUNNING' }
        })
        break
        
      case 'stop':
        await container.stop()
        await prisma.databaseInstance.update({
          where: { id },
          data: { status: 'STOPPED' }
        })
        break
        
      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error procesando acción:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 