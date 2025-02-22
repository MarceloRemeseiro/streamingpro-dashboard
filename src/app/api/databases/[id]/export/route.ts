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
        
      case 'MYSQL':
        command = `mariadb -h ${containerName} -P 3306 -u ${username} -p${password} --skip-ssl ${dbName} -e "SELECT * FROM information_schema.tables WHERE table_schema = '${dbName}'" | while read table; do mariadb -h ${containerName} -P 3306 -u ${username} -p${password} --skip-ssl ${dbName} -e "SHOW CREATE TABLE \${table}; SELECT * FROM \${table};" ; done`;
        contentType = 'application/sql';
        break;
        
      case 'MONGODB':
        command = `mongodump --host ${containerName} --port 27017 \
          --username ${username} --password ${password} \
          --authenticationDatabase admin \
          --db ${dbName} \
          --archive`;
        
        // Ejecutar el comando y obtener el buffer directamente
        const { stdout } = await execAsync(command, { 
          encoding: 'buffer',  // Importante: especificar que queremos un buffer
          maxBuffer: 50 * 1024 * 1024  // 50MB
        });

        return new NextResponse(stdout, {
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename=${database.name}-backup.archive`
          }
        });
        break;
        
      case 'REDIS':
        // Primero hacer SAVE y luego obtener todas las claves y sus valores
        command = `redis-cli -h ${containerName} -p 6379 -a "${password}" --raw SAVE && \
          redis-cli -h ${containerName} -p 6379 -a "${password}" --raw KEYS "*" | while read key; do \
            echo "# Key: $key"; \
            redis-cli -h ${containerName} -p 6379 -a "${password}" --raw TYPE "$key" | { \
              read type; \
              case "$type" in \
                "string") redis-cli -h ${containerName} -p 6379 -a "${password}" --raw GET "$key";; \
                "list") redis-cli -h ${containerName} -p 6379 -a "${password}" --raw LRANGE "$key" 0 -1;; \
                "set") redis-cli -h ${containerName} -p 6379 -a "${password}" --raw SMEMBERS "$key";; \
                "hash") redis-cli -h ${containerName} -p 6379 -a "${password}" --raw HGETALL "$key";; \
                "zset") redis-cli -h ${containerName} -p 6379 -a "${password}" --raw ZRANGE "$key" 0 -1 WITHSCORES;; \
              esac; \
            }; \
            echo ""; \
          done`;
        contentType = 'text/plain';
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
          database.dbType === 'POSTGRES' || database.dbType === 'MYSQL' ? 'sql' :
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