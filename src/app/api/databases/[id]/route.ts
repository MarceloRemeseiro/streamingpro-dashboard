import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import docker from '@/lib/docker'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id
  
  try {
    const database = await prisma.databaseInstance.findUnique({
      where: { id }
    })

    if (!database) {
      return NextResponse.json({ error: 'Database not found' }, { status: 404 })
    }

    try {
      // Intentar eliminar el contenedor Docker si existe
      const container = docker.getContainer(database.containerId)
      await container.stop().catch(() => {}) // Ignorar error si ya está detenido
      await container.remove({ force: true }).catch(() => {}) // Ignorar error si no existe
    } catch (error) {
      console.log('Error al eliminar contenedor Docker:', error)
      // Continuar con la eliminación en la base de datos
    }

    // Eliminar de la base de datos independientemente del estado del contenedor
    await prisma.databaseInstance.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting database:', error)
    return NextResponse.json(
      { error: 'Error deleting database' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    if (!action) {
      return NextResponse.json(
        { error: 'Missing action parameter' },
        { status: 400 }
      )
    }
    
    const database = await prisma.databaseInstance.findUnique({
      where: { id: params.id }
    })

    if (!database) {
      return NextResponse.json({ error: 'Database not found' }, { status: 404 })
    }

    // Detener y eliminar el contenedor
    const container = docker.getContainer(database.containerId)
    await container.stop()
    await container.remove({ force: true })

    // Eliminar de la base de datos
    await prisma.databaseInstance.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting database:', error)
    return NextResponse.json(
      { error: 'Error deleting database' },
      { status: 500 }
    )
  }
} 