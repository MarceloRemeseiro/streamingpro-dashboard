import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Guardar el archivo temporalmente
    const buffer = Buffer.from(await file.arrayBuffer());
    // Limpiar el nombre del archivo de caracteres especiales
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const tempPath = join('/tmp', `import-${Date.now()}-${safeFileName}`);
    await writeFile(tempPath, buffer);

    const containerName = `db-${database.subdomain.replace(/[^a-z0-9]/g, '-')}`;
    const { username, password, dbName } = database.environment as {
      username: string;
      password: string;
      dbName: string;
    };

    let command: string;
    let result;

    switch (database.dbType) {
      case 'POSTGRES':
        command = `PGPASSWORD="${password}" psql -h ${containerName} -U ${username} -d ${dbName} < ${tempPath}`;
        break;

      case 'MONGODB':
        command = `mongorestore --host ${containerName} --username ${username} --password ${password} \
          --authenticationDatabase admin \
          --nsInclude="${dbName}.*" \
          --archive=${tempPath}`;
        result = await execAsync(command);
        break;

      default:
        throw new Error('Tipo de base de datos no soportado');
    }

    if (result.stdout) console.log('Stdout:', result.stdout);
    if (result.stderr) console.error('Stderr:', result.stderr);

    // Limpiar archivo temporal
    await execAsync(`rm ${tempPath}`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error importing database:', error);
    return NextResponse.json(
      { error: `Error importing database: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 