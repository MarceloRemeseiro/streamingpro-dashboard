import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import docker from '@/lib/docker'
import { deleteProxyHost } from '@/lib/npm-api'

const DATABASE_DOMAIN = process.env.DATABASE_DOMAIN || 'localhost'

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
      // Eliminar el proxy host
      const domain = `${database.subdomain}.${DATABASE_DOMAIN}`;
      console.log('Intentando eliminar proxy host para:', domain);
      await deleteProxyHost(domain);

      // Intentar eliminar el contenedor Docker
      const container = docker.getContainer(database.containerId)
      await container.stop().catch(() => {}) 
      await container.remove({ force: true }).catch(() => {}) 
    } catch (error) {
      console.error('Error al eliminar contenedor o proxy:', error)
    }

    // Eliminar volumen
    if (database.volumes) {
      try {
        const volume = docker.getVolume(database.volumes);
        await volume.remove().catch(() => {});
      } catch (error) {
        console.error('Error al eliminar volumen:', error);
      }
    }

    // Eliminar de la base de datos
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