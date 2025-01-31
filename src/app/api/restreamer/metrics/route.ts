import { NextResponse } from 'next/server';
import { RESTREAMER_CREDENTIALS } from '@/lib/constants';

interface ProcessState {
  state: string;
  cpu_usage: number;
  memory_bytes: number;
  traffic_in_bytes?: number;
  traffic_out_bytes?: number;
  bitrate_kbit?: number;
}

interface Process {
  id: string;
  name: string;
  type: string;
  state: ProcessState;
}

interface SystemMetrics {
  cpu: {
    total: number;
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  network: {
    bandwidth_rx: number;
    bandwidth_tx: number;
    max_bandwidth_rx: number;
    max_bandwidth_tx: number;
  };
  sessions: {
    active: number;
    max: number;
  };
  processes: Array<{
    id: string;
    name: string;
    type: string;
    state: string;
    cpu: number;
    memory: number;
  }>;
}

export async function POST(request: Request) {
  try {
    const { url, token } = await request.json();
    console.log('URL recibida:', url);
    
    if (!token) {
      throw new Error('No se proporcionó token de acceso');
    }

    const baseUrl = url.replace(/\/$/, '');

    // Obtener datos de los tres endpoints usando el token proporcionado
    const [processesResponse, metricsResponse, sessionsResponse] = await Promise.all([
      fetch(`${baseUrl}/api/v3/process`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }),
      fetch(`${baseUrl}/api/v3/metrics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }),
      fetch(`${baseUrl}/api/v3/session/active?collectors=rtmp,hls,srt`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    ]);

    // Verificar cada respuesta individualmente
    if (!processesResponse.ok) {
      const errorText = await processesResponse.text();
      throw new Error(`Error en /process: ${processesResponse.status} - ${errorText}`);
    }
    if (!metricsResponse.ok) {
      const errorText = await metricsResponse.text();
      throw new Error(`Error en /metrics: ${metricsResponse.status} - ${errorText}`);
    }
    if (!sessionsResponse.ok) {
      const errorText = await sessionsResponse.text();
      throw new Error(`Error en /session: ${sessionsResponse.status} - ${errorText}`);
    }

    const [processes, metrics, sessions] = await Promise.all([
      processesResponse.json(),
      metricsResponse.json(),
      sessionsResponse.json()
    ]);

    console.log('Datos recibidos del servidor:');
    console.log('- Procesos:', processes);
    console.log('- Métricas:', metrics);
    console.log('- Sesiones:', sessions);

    // Encontrar métricas específicas
    const cpuCores = metrics.find((m: any) => m.name === 'cpu_ncpu')?.value || 0;
    const totalCpuUsage = processes.reduce((acc: number, process: Process) => {
      return acc + (process.state?.cpu_usage || 0);
    }, 0);

    console.log('CPU Cores:', cpuCores);
    console.log('Total CPU Usage:', totalCpuUsage);

    // Calcular métricas de red y sesiones
    let totalRxBitrate = 0;
    let totalTxBitrate = 0;
    let totalSessions = 0;

    // Procesar sesiones activas
    Object.values(sessions).forEach((sessionList: any) => {
      if (Array.isArray(sessionList)) {
        sessionList.forEach(session => {
          totalRxBitrate += session.bandwidth_rx_kbit || 0;
          totalTxBitrate += session.bandwidth_tx_kbit || 0;
          totalSessions++;
        });
      }
    });

    console.log('Métricas de red y sesiones:');
    console.log('- RX Bitrate:', totalRxBitrate);
    console.log('- TX Bitrate:', totalTxBitrate);
    console.log('- Total Sesiones:', totalSessions);

    // Convertir kbit/s a Mbit/s
    totalRxBitrate = totalRxBitrate / 1000;
    totalTxBitrate = totalTxBitrate / 1000;

    // Procesar métricas del sistema
    const systemMetrics: SystemMetrics = {
      cpu: {
        total: totalCpuUsage,
        cores: cpuCores
      },
      memory: {
        total: processes.reduce((acc: number, process: Process) => {
          return acc + (process.state?.memory_bytes || 0);
        }, 0),
        used: processes.reduce((acc: number, process: Process) => {
          return acc + (process.state?.memory_bytes || 0);
        }, 0),
        free: 0,
        percentage: 0
      },
      network: {
        bandwidth_rx: totalRxBitrate,
        bandwidth_tx: totalTxBitrate,
        max_bandwidth_rx: 0,
        max_bandwidth_tx: 0
      },
      sessions: {
        active: totalSessions,
        max: Math.max(totalSessions, 0)
      },
      processes: processes.map((process: Process) => ({
        id: process.id,
        name: process.name,
        type: process.type,
        state: process.state?.state || 'unknown',
        cpu: process.state?.cpu_usage || 0,
        memory: process.state?.memory_bytes || 0
      }))
    };

    console.log('Métricas del sistema procesadas:', systemMetrics);

    return NextResponse.json(systemMetrics);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al obtener métricas' },
      { status: 500 }
    );
  }
} 