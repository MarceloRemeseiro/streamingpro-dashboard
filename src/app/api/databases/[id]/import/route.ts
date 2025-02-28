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
    console.error('Error al verificar la conexión:', error);
    return false;
  }
} 

// Función para convertir SQL de MySQL a PostgreSQL
async function convertMySQLToPostgreSQL(filePath: string): Promise<string> {
  const content = await readFile(filePath, 'utf8');
  
  // Detectar si es un archivo MySQL (buscar sintaxis típica de MySQL)
  const isMySQLFile = content.includes('`') || 
                      content.includes('AUTO_INCREMENT') || 
                      content.includes('UNLOCK TABLES') ||
                      content.includes('ENGINE=');
  
  if (!isMySQLFile) {
    return filePath; // Devolver el mismo archivo si no parece MySQL
  }
  
  console.log('Detectado archivo MySQL, convirtiendo a formato PostgreSQL...');
  
  // Crear un nuevo archivo con la conversión
  const newFilePath = `${filePath}.pg.sql`;
  
  // Procesar el dump línea por línea como en el script original
  const lines = content.split('\n');
  const tables = new Map<string, { create: string, inserts: string[] }>();
  let currentTable: string | null = null;
  let currentStatement: string[] = [];
  let isInCreateTable = false;

  // Procesar línea por línea
  for (const line of lines) {
    // Ignorar líneas de bloqueo y comentarios
    if (line.includes('LOCK TABLES') || line.includes('UNLOCK TABLES') || line.startsWith('/*')) {
      continue;
    }

    if (line.includes('CREATE TABLE')) {
      const tableMatch = line.match(/CREATE TABLE [`"]([^`"]*)[`"]/);
      if (tableMatch) {
        currentTable = tableMatch[1];
        isInCreateTable = true;
        currentStatement = [line];
        if (!tables.has(currentTable)) {
          tables.set(currentTable, { create: '', inserts: [] });
        }
      }
    } else if (line.includes('INSERT INTO')) {
      if (currentTable) {
        tables.get(currentTable)!.inserts.push(line);
      }
    } else if (isInCreateTable) {
      if (line.includes(';')) {
        isInCreateTable = false;
        currentStatement.push(line);
        tables.get(currentTable!)!.create = currentStatement.join('\n');
      } else {
        currentStatement.push(line);
      }
    }
  }

  // Generar el archivo PostgreSQL
  let postgresDump = 'BEGIN;\n\n';

  // Función para convertir una tabla
  function convertTable(tableName: string, createStatement: string, insertStatements: string[]): string {
    let result = `DROP TABLE IF EXISTS "${tableName}" CASCADE;\n`;
    
    // Convertir CREATE TABLE
    result += createStatement
      // Primero convertir los tipos de datos
      .replace(/int\(\d+\) NOT NULL AUTO_INCREMENT/g, 'SERIAL')
      .replace(/tinyint\(\d+\)/gi, 'BOOLEAN')
      .replace(/int\(\d+\)/g, 'INTEGER')
      .replace(/datetime\(\d+\)/g, 'TIMESTAMP')
      .replace(/varchar\((\d+)\)/g, 'VARCHAR($1)')
      .replace(/text/g, 'TEXT')
      // Luego convertir los identificadores
      .replace(/`([^`]*)`/g, '"$1"')
      // Finalmente limpiar la sintaxis MySQL
      .replace(/\) ENGINE=.*$/g, ');')
      .replace(/DEFAULT NULL/g, 'DEFAULT NULL')
      .replace(/PRIMARY KEY \(`([^`]*)`\)/g, 'PRIMARY KEY ("$1")');

    // Añadir INSERTs si existen
    if (insertStatements.length > 0) {
      result += '\n' + insertStatements
        .map((stmt: string) => stmt
          .replace(/`([^`]*)`/g, '"$1"')
          .replace(/,1,/g, ',true,')
          .replace(/,0,/g, ',false,')
          .replace(/\\''/g, "''")
          .replace(/\\'/g, "''")
        )
        .join('\n');
    }

    return result + '\n\n';
  }

  // Procesar cada tabla
  for (const [tableName, { create, inserts }] of tables.entries()) {
    postgresDump += convertTable(tableName, create, inserts);
  }

  postgresDump += 'COMMIT;\n';
  
  await writeFile(newFilePath, postgresDump);
  console.log(`Archivo convertido guardado en: ${newFilePath}`);
  
  return newFilePath;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
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
    let importPath = tempPath;

    switch (database.dbType) {
      case 'POSTGRES':
        // Convertir el archivo si es necesario
        importPath = await convertMySQLToPostgreSQL(tempPath);
        
        command = `PGPASSWORD="${password}" psql -h ${containerName} -U ${username} -d ${dbName} < ${importPath}`;
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
          --archive=${importPath}`;
        await execAsync(command);
        break;

      default:
        throw new Error('Tipo de base de datos no soportado');
    }

    // Limpiar archivos temporales
    await execAsync(`rm ${tempPath}`);
    if (importPath !== tempPath) {
      await execAsync(`rm ${importPath}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error importing database:', error);
    return NextResponse.json(
      { error: `Error importing database: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 