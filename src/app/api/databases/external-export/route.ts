import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  const { dbType, host, port, username, password, dbName } = await request.json();
  
  let command = '';  // Initialize with empty string
  
  switch (dbType) {
    case 'POSTGRES':
      command = `PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${username} ${dbName} \
        --clean \
        --if-exists \
        --no-owner \
        --no-privileges`;
      break;
      
    case 'MONGODB':
      command = `mongodump --host ${host} --port ${port} \
        --username ${username} --password ${password} \
        --authenticationDatabase admin \
        --db ${dbName} \
        --archive`;
      break;
  }
  
  const { stdout } = await execAsync(command, { 
    encoding: 'buffer',
    maxBuffer: 50 * 1024 * 1024
  });
  
  return new NextResponse(stdout, {
    headers: {
      'Content-Type': dbType === 'POSTGRES' ? 'application/sql' : 'application/octet-stream',
      'Content-Disposition': `attachment; filename=external-backup.${dbType === 'POSTGRES' ? 'sql' : 'archive'}`
    }
  });
} 