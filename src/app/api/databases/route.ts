import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import docker from '@/lib/docker'
import { DatabaseType, InstanceStatus } from '@prisma/client'
import { ProxyHostConfig } from '@/lib/npm-api'
import type { Container, ContainerInspectInfo } from 'dockerode'

interface NetworkContainer {
  Name: string;
  Id: string;
}

const DATABASE_DOMAIN = process.env.DATABASE_DOMAIN || 'localhost'

export async function GET() {
  try {
    const databases = await prisma.databaseInstance.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    // Actualizar estado real de cada contenedor
    const updatedDatabases = await Promise.all(
      databases.map(async (db) => {
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
          return { ...db, status: 'ERROR' }
        }
      })
    )
    
    return NextResponse.json(updatedDatabases)
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener las bases de datos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, dbType, subdomain, username, password, dbName } = await request.json()
    
    console.log('Docker info:', await docker.info())
    
    // 1. Crear contenedor Docker
    const existingContainers = await docker.listContainers({ all: true })
    const existingNames = existingContainers.map((c: any) => c.Names[0].replace('/', ''))

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
      // Si la red no existe, crearla
      await docker.createNetwork({ Name: 'app-network' })
    }

    const container = await createContainer(dbType, username, password, dbName, subdomain)
    const containerInfo = await container.inspect() as ContainerInspectInfo

    // Usar la misma lógica de puertos que en createContainer
    const containerPort = (() => {
      switch (dbType) {
        case DatabaseType.MYSQL:
          return '3306/tcp'
        case DatabaseType.POSTGRES:
          return '5432/tcp'
        case DatabaseType.MONGODB:
          return '27017/tcp'
        case DatabaseType.REDIS:
          return '6379/tcp'
        default:
          throw new Error('Tipo de base de datos no soportado')
      }
    })()

    const hostPort = containerInfo.NetworkSettings.Ports[containerPort][0].HostPort

    // Configurar proxy con el puerto correcto
    const proxyConfig: ProxyHostConfig = {
      domain_names: [`${subdomain}.${DATABASE_DOMAIN}`],
      forward_scheme: 'http',
      forward_host: containerName,
      forward_port: parseInt(containerPort.split('/')[0]), // Extraer solo el número del puerto
      ssl_forced: true
    }

    // Actualizar URL de conexión según el tipo
    const connectionUrl = (() => {
      const host = `${subdomain}.${DATABASE_DOMAIN}`
      
      switch (dbType) {
        case DatabaseType.MYSQL:
          return `mysql://${username}:${password}@${host}:${hostPort}/${dbName}`
        case DatabaseType.POSTGRES:
          return `postgres://${username}:${password}@${host}:${hostPort}/${dbName}`
        case DatabaseType.MONGODB:
          return `mongodb://${username}:${password}@${host}:${hostPort}/${dbName}`
        case DatabaseType.REDIS:
          return `redis://${username}:${password}@${host}:${hostPort}`
        default:
          throw new Error('Tipo de base de datos no soportado')
      }
    })()

    // Actualizar la creación en la base de datos
    const newDatabase = await prisma.databaseInstance.create({
      data: {
        name,
        dbType,
        subdomain,
        containerId: containerInfo.Id,
        connectionUrl,
        status: 'RUNNING',
        portMappings: containerInfo.NetworkSettings.Ports,
        environment: { username, password, dbName }
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
    [DatabaseType.MYSQL]: 'mysql:8',
    [DatabaseType.MONGODB]: 'mongo:6',
    [DatabaseType.REDIS]: 'redis:7'
  }

  const containerName = `db-${subdomain.replace(/[^a-z0-9]/g, '-')}`
  const imageName = imageMap[dbType]

  // Verificar si la imagen existe, si no, descargarla
  try {
    await docker.getImage(imageName).inspect()
  } catch (error) {
    console.log(`Error al descargar imagen ${imageName}:`, error instanceof Error ? error.message : 'Error desconocido')
    await new Promise((resolve, reject) => {
      docker.pull(imageName, (err: any, stream: any) => {
        if (err) return reject(err)
        
        docker.modem.followProgress(stream, (err: any, output: any) => {
          if (err) return reject(err)
          resolve(output)
        })
      })
    })
  }

  // Configurar variables de entorno según el tipo de base de datos
  const envVars = (() => {
    switch (dbType) {
      case DatabaseType.MYSQL:
        return [
          `MYSQL_USER=${username}`,
          `MYSQL_PASSWORD=${password}`,
          `MYSQL_DATABASE=${dbName}`,
          `MYSQL_ROOT_PASSWORD=${password}`
        ]
      case DatabaseType.POSTGRES:
        return [
          `POSTGRES_USER=${username}`,
          `POSTGRES_PASSWORD=${password}`,
          `POSTGRES_DB=${dbName}`
        ]
      case DatabaseType.MONGODB:
        return [
          `MONGO_INITDB_ROOT_USERNAME=${username}`,
          `MONGO_INITDB_ROOT_PASSWORD=${password}`,
          `MONGO_INITDB_DATABASE=${dbName}`
        ]
      case DatabaseType.REDIS:
        return [
          `REDIS_USER=${username}`,
          `REDIS_PASSWORD=${password}`
        ]
      default:
        return []
    }
  })()

  // Configurar puerto según el tipo de base de datos
  const port = (() => {
    switch (dbType) {
      case DatabaseType.MYSQL:
        return '3306/tcp'
      case DatabaseType.POSTGRES:
        return '5432/tcp'
      case DatabaseType.MONGODB:
        return '27017/tcp'
      case DatabaseType.REDIS:
        return '6379/tcp'
      default:
        throw new Error('Tipo de base de datos no soportado')
    }
  })()

  // Crear contenedor con puerto específico
  const container = await docker.createContainer({
    name: containerName,
    Image: imageName,
    Env: envVars,
    ExposedPorts: {
      [port]: {}
    },
    HostConfig: {
      PortBindings: {
        [port]: [
          {
            HostPort: '0' // Docker asignará un puerto disponible
          }
        ]
      }
    }
  })

  await container.start()
  
  // Obtener información actualizada después de iniciar
  const containerInfo = await container.inspect() as ContainerInspectInfo
  const hostPort = containerInfo.NetworkSettings.Ports[port][0].HostPort
  
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
    await container.stop()
    await container.remove()
    throw error
  }
  
  return container
} 