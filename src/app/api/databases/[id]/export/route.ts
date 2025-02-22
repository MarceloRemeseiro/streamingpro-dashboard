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
    const { id } = await params;  // Añadir await aquí
    const database = await prisma.databaseInstance.findUnique({
      where: { id }
    });

    if (!database) {
      return NextResponse.json(
        { error: 'Database not found' },
        { status: 404 }
      );
    }

    const { username, password, dbName } = database.environment as { 
      username: string;
      password: string;
      dbName: string;
    };
    
    const containerName = `db-${database.subdomain.replace(/[^a-z0-9]/g, '-')}`;
    let command: string;
    let contentType: string;
    
    switch (database.dbType) {
      case 'POSTGRES':
        command = `PGPASSWORD="${password}" pg_dump -h ${containerName} -p 5432 -U ${username} ${dbName} \
          --clean \
          --if-exists \
          --no-owner \
          --no-privileges`;
        contentType = 'application/sql';
        break;
        
      case 'MONGODB':
        command = `mongodump --host ${containerName} --port 27017 \
          --username ${username} --password ${password} \
          --authenticationDatabase admin \
          --db ${dbName} \
          --archive`;
        
        const { stdout } = await execAsync(command, { 
          encoding: 'buffer',
          maxBuffer: 50 * 1024 * 1024
        });

        return new NextResponse(stdout, {
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename=${database.name}-backup.archive`
          }
        });
        break;
        
      default:
        return NextResponse.json(
          { error: 'Tipo de base de datos no soportado' },
          { status: 400 }
        );
    }

    console.log('Ejecutando comando:', command);
    const { stdout } = await execAsync(command, { maxBuffer: 1024 * 1024 * 50 }); // Aumentado a 50MB

    return new NextResponse(stdout, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename=${database.name}-backup.${
          database.dbType === 'POSTGRES' ? 'sql' :
          database.dbType === 'MONGODB' ? 'archive' : 'rdb'
        }`
      }
    });

  } catch (error) {
    console.error('Error exporting database:', error);
    return NextResponse.json(
      { error: `Error exporting database: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 