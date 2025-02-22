import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

// Función de espera
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Función para verificar conexión
async function checkConnection(containerName: string, username: string, password: string, dbName: string) {
  const command = `PGPASSWORD="${password}" psql -h ${containerName} -U ${username} -d ${dbName} -c "\\l"`;
  try {
    await execAsync(command);
    return true;
  } catch (error) {
    return false;
  }
}

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
    const tempPath = join('/tmp', `import-${Date.now()}-${file.name}`);
    await writeFile(tempPath, buffer);

    const containerName = `db-${database.subdomain.replace(/[^a-z0-9]/g, '-')}`;
    const { username, password, dbName } = database.environment as {
      username: string;
      password: string;
      dbName: string;
    };

    // Esperar a que la base de datos esté lista (máximo 30 segundos)
    for (let i = 0; i < 15; i++) {
      console.log(`Intento ${i + 1} de conectar a la base de datos...`);
      if (await checkConnection(containerName, username, password, dbName)) {
        break;
      }
      await wait(2000); // Esperar 2 segundos entre intentos
    }

    let command: string;

    switch (database.dbType) {
      case 'POSTGRES':
        command = `PGPASSWORD="${password}" psql -h ${containerName} -U ${username} -d ${dbName} < ${tempPath}`;
        console.log('Ejecutando comando de importación:', command);
        try {
          const result = await execAsync(command);
          console.log('Resultado:', result.stdout);
          console.error('Errores:', result.stderr);
        } catch (error) {
          console.error('Error completo:', error);
          throw error;
        }
        break;

      case 'MONGODB':
        command = `mongorestore --host ${containerName} --username ${username} --password ${password} \
          --authenticationDatabase admin \
          --nsInclude="${dbName}.*" \
          --archive=${tempPath}`;
        await execAsync(command);
        break;

      default:
        throw new Error('Tipo de base de datos no soportado');
    }

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