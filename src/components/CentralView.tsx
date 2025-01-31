"use client";

import { useState, useEffect } from 'react';
import { 
  LuLink, 
  LuArrowDown, 
  LuArrowUp, 
  LuActivity,
  LuCheck,
  LuX,
  LuCpu,
  LuServer,
  LuUsers
} from 'react-icons/lu';
import useSWR from 'swr';
import { AuthService } from '@/lib/AuthService';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface StreamUrl {
  id: string;
  name: string;
  url: string;
  startDate: string;
  endDate: string;
}

interface StreamMetrics {
  inputs: {
    total: number;
    active: number;
  };
  outputs: {
    total: number;
    active: number;
  };
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
}

export default function CentralView() {
  const { data: streamUrls, error: urlsError, isLoading: urlsLoading } = useSWR<StreamUrl[]>('/api/urls', fetcher);
  const [authStatus, setAuthStatus] = useState<{[key: string]: boolean}>({});
  const [metrics, setMetrics] = useState<{[key: string]: StreamMetrics}>({});
  const [systemMetrics, setSystemMetrics] = useState<{[key: string]: SystemMetrics}>({});

  const formatMemory = (bytes: number) => {
    if (!bytes) return '0.00';
    const mb = Number(bytes) / (1024 * 1024);
    return mb.toFixed(2);
  };

  const formatCPU = (usage: number) => {
    if (usage === undefined || usage === null) return 'N/A';
    return `${usage.toFixed(2)}`;
  };

  const formatBandwidth = (mbit: number) => {
    return `${mbit.toFixed(1)} Mbit/s`;
  };

  useEffect(() => {
    async function checkAuth() {
      if (streamUrls) {
        const newAuthStatus: {[key: string]: boolean} = {};
        const newMetrics: {[key: string]: StreamMetrics} = {};
        const newSystemMetrics: {[key: string]: SystemMetrics} = {};
        
        for (const stream of streamUrls) {
          try {
            const authService = AuthService.getInstance(stream.url);
            const success = await authService.login();
            console.log('Auth response for', stream.url, ':', success);
            newAuthStatus[stream.url] = success;

            if (success) {
              const streamMetrics = await authService.getStreamMetrics();
              newMetrics[stream.url] = streamMetrics;

              // Obtener métricas del sistema usando el token existente
              const token = authService.getAccessToken();
              if (token) {
                const response = await fetch('/api/restreamer/metrics', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ 
                    url: stream.url,
                    token 
                  }),
                });

                if (response.ok) {
                  const sysMetrics = await response.json();
                  newSystemMetrics[stream.url] = sysMetrics;
                } else {
                  const errorText = await response.text();
                  console.error('Error al obtener métricas del sistema:', errorText);
                }
              } else {
                console.error('No hay token disponible para obtener métricas');
              }
            }
          } catch (error) {
            console.error(`Error al autenticar ${stream.url}:`, error);
            newAuthStatus[stream.url] = false;
          }
        }
        
        setAuthStatus(newAuthStatus);
        setMetrics(newMetrics);
        setSystemMetrics(newSystemMetrics);
      }
    }

    if (streamUrls) {
      checkAuth();
      // Actualizar cada 30 segundos
      const interval = setInterval(checkAuth, 30000);
      return () => clearInterval(interval);
    }
  }, [streamUrls]);

  if (urlsLoading) {
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Central de Emisión</h1>
        </div>
        <div className="text-gray-600 dark:text-gray-400">Cargando datos...</div>
      </div>
    );
  }

  if (urlsError) {
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Central de Emisión</h1>
        </div>
        <div className="text-red-500">Error al cargar los datos</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Central de Emisión</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nombre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Inputs
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Outputs
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Métricas
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {streamUrls?.map((stream) => (
                <tr key={stream.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                    <div className="flex items-center gap-2 group relative">
                      <div className={`w-2.5 h-2.5 rounded-full ${authStatus[stream.url] ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="cursor-help">{stream.name}</span>
                      <div className="invisible group-hover:visible absolute left-0 bottom-full mb-2 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-50 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <LuLink className="w-4 h-4" />
                          {stream.url}
                        </div>
                        <div className="absolute bottom-[-6px] left-4 w-3 h-3 bg-gray-800 transform rotate-45"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      {(metrics[stream.url]?.inputs.total || 0) > 0 ? (
                        <div className="flex items-center space-x-1">
                          <span className={metrics[stream.url]?.inputs.active > 0 ? 'text-green-500 font-medium' : ''}>
                            {metrics[stream.url]?.inputs.active || 0}
                          </span>
                          <span className="text-gray-400 font-medium">de</span>
                          <span className="text-gray-500 font-medium">
                            {metrics[stream.url]?.inputs.total || 0}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 font-medium">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      {(metrics[stream.url]?.outputs.total || 0) > 0 ? (
                        <div className="flex items-center space-x-1">
                          <span className={metrics[stream.url]?.outputs.active > 0 ? 'text-green-500 font-medium' : ''}>
                            {metrics[stream.url]?.outputs.active || 0}
                          </span>
                          <span className="text-gray-400 font-medium">de</span>
                          <span className="text-gray-500 font-medium">
                            {metrics[stream.url]?.outputs.total || 0}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 font-medium">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {systemMetrics[stream.url] ? (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <LuCpu className="w-4 h-4 text-blue-500" />
                          <span>{formatCPU(systemMetrics[stream.url].cpu.total)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <LuServer className="w-4 h-4 text-blue-500" />
                          <span>{formatMemory(systemMetrics[stream.url].memory.used)} MB</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <LuUsers className="w-4 h-4 text-blue-500" />
                          <span>{systemMetrics[stream.url].sessions.active} Viewer{systemMetrics[stream.url].sessions.active !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <LuArrowDown className="w-4 h-4 text-green-500" />
                          <span>{formatBandwidth(systemMetrics[stream.url].network.bandwidth_rx)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <LuArrowUp className="w-4 h-4 text-blue-500" />
                          <span>{formatBandwidth(systemMetrics[stream.url].network.bandwidth_tx)}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Sin datos</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 