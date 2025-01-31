import { RESTREAMER_CREDENTIALS } from './constants';

interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

interface RequestBody {
  [key: string]: string | number | boolean | null | undefined;
}

interface ProcessState {
  command: string[];
  order: string;
  cpu_usage: number;
  memory_bytes: number;
  progress?: {
    inputs: Array<{
      state: string;
      exec: string;
      bitrate_kbit?: number;
    }>;
    outputs: Array<{
      state: string;
      exec: string;
      bitrate_kbit?: number;
    }>;
  };
}

interface Process {
  id: string;
  state?: ProcessState;
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

export class AuthService {
  private static instances: { [key: string]: AuthService } = {};
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private baseUrl: string;

  private constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  public static getInstance(baseUrl: string): AuthService {
    if (!AuthService.instances[baseUrl]) {
      AuthService.instances[baseUrl] = new AuthService(baseUrl);
    }
    return AuthService.instances[baseUrl];
  }

  private getApiUrl(path: string): string {
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  public async request<T>(method: string, path: string, body?: RequestBody): Promise<T> {
    if (!this.accessToken) {
      const success = await this.login();
      if (!success) {
        throw new Error('No se pudo autenticar con Restreamer');
      }
    }

    try {
      const url = this.getApiUrl(path);
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Si el token expiró, intentamos refrescarlo
          const success = await this.refreshAccessToken();
          if (!success) {
            // Si no se pudo refrescar, intentamos login completo
            const loginSuccess = await this.login();
            if (!loginSuccess) {
              throw new Error('No se pudo renovar la autenticación');
            }
          }
          return this.request<T>(method, path, body);
        }

        const errorText = await response.text();
        console.error(`Error en la petición ${method}:`, {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url
        });
        throw new Error(`Error en la petición: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`Error en la petición ${method}:`, {
        error,
        path,
        method,
        body
      });
      throw error;
    }
  }

  public async login(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(RESTREAMER_CREDENTIALS),
      });

      if (!response.ok) {
        console.error('Error en login:', await response.text());
        return false;
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      return true;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch('/api/restreamer/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: this.baseUrl,
          refresh_token: this.refreshToken
        })
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      return true;
    } catch (error) {
      console.error('Error al refrescar token:', error);
      return false;
    }
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public setAccessToken(token: string): void {
    this.accessToken = token;
  }

  public logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
  }

  public async getStreamMetrics(): Promise<StreamMetrics> {
    try {
      // Obtener todos los procesos
      const processes = await this.request<Process[]>('GET', '/api/v3/process');
      

      // Filtrar procesos excluyendo snapshots
      const filteredProcesses = processes.filter(p => !p.id.includes('snapshot'));
      
      // Separar inputs y outputs
      const outputs = filteredProcesses.filter(p => p.id.includes('egress'));
      const inputs = filteredProcesses.filter(p => !p.id.includes('egress'));

      // Obtener estado detallado de cada proceso
      const processStates = await Promise.all(
        filteredProcesses.map(async (process) => {
          try {
            const state = await this.request<ProcessState>('GET', `/api/v3/process/${process.id}/state`);
            return { ...process, state };
          } catch (error) {
            console.error(`Error al obtener estado del proceso ${process.id}:`, error);
            return process;
          }
        })
      );
      

      // Actualizar los arrays con los estados detallados
      const processesWithState = processStates.reduce((acc, process) => {
        acc[process.id] = process;
        return acc;
      }, {} as Record<string, Process>);

      // Contar activos basándonos en el estado detallado
      const activeInputs = inputs.filter(p => {
        const state = processesWithState[p.id]?.state ;
        return state?.progress?.inputs.some(input => input.exec === 'running');
      }).length;

      const activeOutputs = outputs.filter(p => {
        const state = processesWithState[p.id]?.state;
        return state?.progress?.outputs.some(output => output.state === 'running');
      }).length;


      return {
        inputs: {
          total: inputs.length,
          active: activeInputs
        },
        outputs: {
          total: outputs.length,
          active: activeOutputs
        }
      };
    } catch (error) {
      console.error('Error al obtener métricas:', error);
      return {
        inputs: { total: 0, active: 0 },
        outputs: { total: 0, active: 0 }
      };
    }
  }
} 