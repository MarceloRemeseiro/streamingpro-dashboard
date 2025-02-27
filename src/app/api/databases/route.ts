import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import docker from '@/lib/docker'
import { DatabaseType, DatabaseInstance } from '@prisma/client'
import { ProxyHostConfig } from '@/lib/npm-api'
import type { ContainerInspectInfo } from 'dockerode'
import { createProxyHost, checkDomainExists } from '@/lib/npm-api'

interface NetworkContainer {
  Name: string;
  Id: string;
}

interface DockerContainer {
  Names: string[];
  Id: string;
  State: string;
  Status: string;
}

interface PullError {
  message: string;
}

interface PullOutput {
  status: string;
  id?: string;
  progress?: string;
}

const DATABASE_DOMAIN = process.env.NEXT_PUBLIC_DATABASE_DOMAIN || 'localhost'

export async function GET() {
  try {
    const databases = await prisma.databaseInstance.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    // Actualizar estado real de cada contenedor
    const updatedDatabases = await Promise.all(
      databases.map(async (db: DatabaseInstance) => {
        try {
          const container = docker.getContainer(db.containerId)
          const info = await container.inspect()
          const status = info.State.Running ? 'RUNNING' : 'STOPPED'
          
          // Actualizar en DB si el estado cambió
          if (status !== db.status) {
            await prisma.databaseInstance.update({
              where: { id: db.id },
              data: { status }
            })
          }
          
          return { ...db, status }
        } catch (error) {
          console.error('Error al actualizar el estado de la base de datos:', error);
          return { ...db, status: 'ERROR' }
        }
      })
    )
    
    return NextResponse.json(updatedDatabases)
    
  } catch (error) {
    console.error('Error al obtener las bases de datos:', error);
    return NextResponse.json(
      { error: 'Error al obtener las bases de datos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Variables de entorno:', {
      NPM_EMAIL: process.env.NPM_EMAIL,
      // No logueamos NPM_PASSWORD por seguridad
    });

    const { name, dbType, subdomain, username, password, dbName } = await request.json()
    
    // Verificar si el subdominio ya existe
    const domainName = `${subdomain}.${DATABASE_DOMAIN}`;
    const exists = await checkDomainExists(domainName);
    
    if (exists) {
      return NextResponse.json(
        { error: `El subdominio ${subdomain} ya está en uso. Por favor, elige otro.` },
        { status: 400 }
      )
    }

    // También verificar en nuestra base de datos
    const existingDatabase = await prisma.databaseInstance.findUnique({
      where: { subdomain }
    });

    if (existingDatabase) {
      return NextResponse.json(
        { error: `El subdominio ${subdomain} ya está en uso. Por favor, elige otro.` },
        { status: 400 }
      )
    }

    console.log('Docker info:', await docker.info())
    
    // 1. Crear contenedor Docker
    const existingContainers = await docker.listContainers({ all: true })
    const existingNames = existingContainers.map((c: DockerContainer) => c.Names[0].replace('/', ''))

    const containerName = `db-${subdomain.replace(/[^a-z0-9]/g, '-')}`

    if (existingNames.includes(containerName)) {
      try {
        // Primero intentar eliminar el endpoint directamente de la red
        const network = docker.getNetwork('app-network')
        const networkInfo = await network.inspect()
        
        if (networkInfo.Containers) {
          const targetContainer = Object.values(networkInfo.Containers as Record<string, NetworkContainer>)
            .find((c: NetworkContainer) => c.Name === containerName)
          
          if (targetContainer) {
            await network.disconnect({ 
              Container: targetContainer.Id, 
              Force: true 
            })
          }
        }
      } catch (error) {
        console.log('Error limpiando red:', error instanceof Error ? error.message : 'Error desconocido')
      }
      
      const oldContainer = docker.getContainer(containerName)
      
      try {
        // Obtener información actualizada del contenedor
        const containerInfo = await oldContainer.inspect()
        
        // Detener si está corriendo
        if (containerInfo.State.Running) {
          await oldContainer.stop()
          console.log(`Contenedor ${containerName} detenido`)
        }
        
        // Desconectar de todas las redes
        const networks = Object.keys(containerInfo.NetworkSettings.Networks)
        await Promise.all(networks.map(async networkName => {
          const net = docker.getNetwork(networkName)
          await net.disconnect({ Container: oldContainer.id, Force: true })
          console.log(`Desconectado de ${networkName}`)
        }))
        
        // Eliminar contenedor
        await oldContainer.remove({ force: true })
        console.log(`Contenedor ${containerName} eliminado`)
        
      } catch (error) {
        console.error(`Error limpiando ${containerName}:`, error instanceof Error ? error.message : 'Error desconocido')
      }
      
      // Esperar 2 segundos para sincronización
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    const network = docker.getNetwork('app-network')
    try {
      await network.inspect()
    } catch (error) {
      console.error('Error al obtener la red:', error instanceof Error ? error.message : 'Error desconocido')
      // Si la red no existe, crearla
      await docker.createNetwork({ Name: 'app-network' })
    }

    const { container, volumeName, selectedPort } = await createContainer(dbType, username, password, dbName, subdomain)
    const containerInfo = await container.inspect() as ContainerInspectInfo

    // Primero definimos el puerto interno
    const containerPort = (() => {
      switch (dbType) {
        case DatabaseType.POSTGRES:
          return 5432;
        case DatabaseType.MONGODB:
          return 27017;
        default:
          throw new Error('Tipo de base de datos no soportado');
      }
    })();

    // Obtener el puerto mapeado del contenedor
    const dockerPort = `${containerPort}/tcp`;
    const hostPort = containerInfo.NetworkSettings.Ports[dockerPort][0].HostPort;

    // Configuración del proxy (usa el puerto EXPUESTO)
    const proxyConfig: ProxyHostConfig = {
      domain_names: [`${subdomain}.${DATABASE_DOMAIN}`],
      forward_scheme: 'http',
      forward_host: containerName,
      forward_port: parseInt(hostPort), // Usamos el puerto expuesto (55025)
      ssl_forced: true
    };

    console.log('Intentando crear proxy host para:', subdomain);
    await createProxyHost(proxyConfig);

    // URL de conexión (sin puerto expuesto)
    const connectionUrl = (() => {
      const host = `${subdomain}.${DATABASE_DOMAIN}`
      
      switch (dbType) {
        case DatabaseType.POSTGRES:
          return `postgres://${username}:${password}@${host}/${dbName}`;
        case DatabaseType.MONGODB:
          return `mongodb://${username}:${password}@${host}/${dbName}`
        default:
          throw new Error('Tipo de base de datos no soportado')
      }
    })()

    // Actualizar la creación en la base de datos
    const newDatabase = await prisma.databaseInstance.create({
      data: {
        name,
        dbType: dbType as DatabaseType,
        subdomain,
        containerId: containerInfo.Id,
        connectionUrl,
        status: 'RUNNING' as const,
        portMappings: containerInfo.NetworkSettings.Ports,
        environment: { username, password, dbName },
        volumes: volumeName,
        assignedPort: selectedPort
      }
    })
    
    return NextResponse.json(newDatabase, { status: 201 })
    
  } catch (error) {
    console.error('Error detallado:', error)
    return NextResponse.json(
      { 
        error: 'Error al crear la base de datos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

const createContainer = async (
  dbType: DatabaseType,
  username: string,
  password: string,
  dbName: string,
  subdomain: string
) => {
  const imageMap = {
    [DatabaseType.POSTGRES]: 'postgres:15',
    [DatabaseType.MONGODB]: 'mongo:6'
  };

  const containerName = `db-${subdomain.replace(/[^a-z0-9]/g, '-')}`;
  const volumeName = `${containerName}-data`;
  const imageName = imageMap[dbType];

  // Crear el volumen si no existe
  try {
    await docker.createVolume({
      Name: volumeName,
      Driver: 'local'
    });
  } catch (error) {
    console.log('El volumen ya existe o error al crear:', error);
  }

  // Verificar si la imagen existe, si no, descargarla
  try {
    await docker.getImage(imageName).inspect()
  } catch (error) {
    console.log(`Error al descargar imagen ${imageName}:`, error instanceof Error ? error.message : 'Error desconocido')
    await new Promise((resolve, reject) => {
      docker.pull(imageName, (err: PullError | null, stream: NodeJS.ReadableStream) => {
        if (err) return reject(err)
        
        docker.modem.followProgress(stream, (err: PullError | null, output: PullOutput[]) => {
          if (err) return reject(err)
          resolve(output)
        })
      })
    })
  }

  // Configurar variables de entorno según el tipo de base de datos
  const envVars = (() => {
    switch (dbType) {
      case DatabaseType.POSTGRES:
        return [
          `POSTGRES_USER=${username}`,
          `POSTGRES_PASSWORD=${password}`,
          `POSTGRES_DB=${dbName}`
        ];
      case DatabaseType.MONGODB:
        return [
          `MONGO_INITDB_ROOT_USERNAME=${username}`,
          `MONGO_INITDB_ROOT_PASSWORD=${password}`,
          `MONGO_INITDB_DATABASE=${dbName}`
        ];
      default:
        return [];
    }
  })();

  // Configurar puerto según el tipo de base de datos
  const port = (() => {
    switch (dbType) {
      case DatabaseType.POSTGRES:
        return '5432/tcp'
      case DatabaseType.MONGODB:
        return '27017/tcp'
      default:
        throw new Error('Tipo de base de datos no soportado')
    }
  })()

  // Configurar el punto de montaje según el tipo de BD
  const mountPoint = (() => {
    switch (dbType) {
      case DatabaseType.POSTGRES:
        return '/var/lib/postgresql/data';
      case DatabaseType.MONGODB:
        return '/data/db';
      default:
        throw new Error('Tipo de base de datos no soportado');
    }
  })();

  // Buscar un puerto disponible
  const existingContainers = await docker.listContainers({ all: true });
  const usedPorts = new Set(
    existingContainers.flatMap(container => {
      const ports = container.Ports || [];
      return ports.map(p => p.PublicPort);
    })
  );

  // Rango de puertos para cada tipo de base de datos
  const portRange = (() => {
    switch (dbType) {
      case DatabaseType.POSTGRES:
        return { start: 55000, end: 55999 };
      case DatabaseType.MONGODB:
        return { start: 56000, end: 56999 };
      default:
        throw new Error('Tipo de base de datos no soportado');
    }
  })();

  // Encontrar el primer puerto disponible en el rango
  let selectedPort;
  for (let p = portRange.start; p <= portRange.end; p++) {
    if (!usedPorts.has(p)) {
      selectedPort = p;
      break;
    }
  }

  if (!selectedPort) {
    throw new Error('No hay puertos disponibles en el rango asignado');
  }

  // Crear contenedor con volumen y puerto fijo
  const container = await docker.createContainer({
    name: containerName,
    Image: imageName,
    Env: envVars,
    ExposedPorts: {
      [port]: {}
    },
    HostConfig: {
      PortBindings: {
        [port]: [{ HostPort: selectedPort.toString() }]
      },
      Binds: [`${volumeName}:${mountPoint}`]
    }
  });

  await container.start()
  
  // Obtener información actualizada después de iniciar
/*   const containerInfo = await container.inspect() as ContainerInspectInfo
 */  
  // Conectar a la red
  try {
    const network = docker.getNetwork('app-network')
    await network.connect({ 
      Container: container.id,
      EndpointConfig: {
        Aliases: [containerName]
      }
    })
  } catch (error) {
    console.error('Error al conectar al contenedor:', error instanceof Error ? error.message : 'Error desconocido')
    await container.stop()
    await container.remove()
    throw error
  }
  
  return {
    container,
    volumeName,
    selectedPort
  };
} 