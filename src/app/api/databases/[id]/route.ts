import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import docker from '@/lib/docker'
import { deleteProxyHost } from '@/lib/npm-api'

const DATABASE_DOMAIN = process.env.NEXT_PUBLIC_DATABASE_DOMAIN

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const database = await prisma.databaseInstance.findUnique({
      where: { id }
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const database = await prisma.databaseInstance.findUnique({
      where: { id }
    });

    if (!database) {
      return NextResponse.json(
        { error: 'Database not found' },
        { status: 404 }
      );
    }

    // Obtener estado actual del contenedor
    try {
      const container = docker.getContainer(database.containerId);
      const info = await container.inspect();
      const status = info.State.Running ? 'RUNNING' : 'STOPPED';

      return NextResponse.json({
        ...database,
        status
      });
    } catch (error) {
      console.error('Error al obtener el estado del contenedor:', error);
      return NextResponse.json({
        ...database,
        status: 'ERROR'
      });
    }
  } catch (error) {
    console.error('Error al obtener el estado de la base de datos:', error);
    return NextResponse.json(
      { error: 'Error getting database status' },
      { status: 500 }
    );
  }
} 