interface RestreamerAuth {
  access_token: string;
  refresh_token: string;
}

interface RestreamerMetrics {
  inputs: {
    total: number;
    active: number;
  };
  outputs: {
    total: number;
    active: number;
  };
  metrics: {
    cpu: number;
    ram: number;
    dataIn: string;
    dataOut: string;
    viewers: number;
  };
}

export async function getRestreamerAuth(baseUrl: string): Promise<RestreamerAuth> {
  try {
    const response = await fetch('/api/restreamer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: baseUrl })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw new Error('Error al autenticar');
    }

    return response.json();
  } catch (error) {
    console.error('Error al autenticar:', error);
    throw error;
  }
}

export async function getRestreamerMetrics(baseUrl: string): Promise<RestreamerMetrics> {
  try {
    const response = await fetch('/api/restreamer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: baseUrl })
    });

    if (!response.ok) {
      throw new Error('Error al obtener las métricas');
    }

    return response.json();
  } catch (error) {
    console.error('Error al obtener las métricas:', error);
    throw error;
  }
} 