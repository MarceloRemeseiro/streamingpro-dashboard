import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const database = await prisma.databaseInstance.findUnique({
      where: { id: params.id }
    })

    if (!database) {
      return NextResponse.json(
        { error: 'Database not found' },
        { status: 404 }
      )
    }

    if (database.dbType !== 'POSTGRES') {
      return NextResponse.json(
        { error: 'Only PostgreSQL databases supported for now' },
        { status: 400 }
      )
    }

    const { username, password, dbName } = database.environment as { 
      username: string;
      password: string;
      dbName: string;
    }
    
    // Usar el nombre del contenedor como host
    const containerName = `db-${database.subdomain.replace(/[^a-z0-9]/g, '-')}`;
    
    // Ejecutar pg_dump usando el nombre del contenedor
    const { stdout } = await execAsync(
      `PGPASSWORD="${password}" pg_dump -h ${containerName} -p 5432 -U ${username} ${dbName}`,
      { maxBuffer: 1024 * 1024 * 10 } // 10MB buffer
    )

    // Crear respuesta con el contenido SQL
    return new NextResponse(stdout, {
      headers: {
        'Content-Type': 'application/sql',
        'Content-Disposition': `attachment; filename=${database.name}-backup.sql`
      }
    })

  } catch (error) {
    console.error('Error exporting database:', error)
    return NextResponse.json(
      { error: 'Error exporting database' },
      { status: 500 }
    )
  }
} 