const NPM_API = 'http://nginx-proxy-manager:81/api';

async function getToken() {
  const response = await fetch(`${NPM_API}/tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      identity: process.env.EMAIL,
      secret: process.env.PASSWORD
    })
  });

  if (!response.ok) {
    throw new Error('Failed to get NPM token');
  }

  const data = await response.json();
  return data.token;
}

export interface ProxyHostConfig {
  domain_names: string[];
  forward_scheme: 'http' | 'https';
  forward_host: string;
  forward_port: number;
  ssl_forced: boolean;
  certificate_id?: number;
}

export const createProxyHost = async (config: ProxyHostConfig) => {
  console.log('Creando proxy host con config:', config);
  
  try {
    const token = await getToken();
    const response = await fetch(`${NPM_API}/nginx/proxy-hosts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(config)
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Error creando proxy host:', error);
      throw new Error(`Error creando proxy host: ${error}`);
    }
    
    const data = await response.json();
    console.log('Proxy host creado:', data);
    return data;
  } catch (error) {
    console.error('Error en createProxyHost:', error);
    throw error;
  }
};

export const deleteProxyHost = async (domain: string) => {
  console.log('Buscando proxy host para eliminar:', domain);
  
  try {
    const token = await getToken();
    
    // Primero obtener la lista de proxy hosts
    const response = await fetch(`${NPM_API}/nginx/proxy-hosts`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const hosts = await response.json();
    const proxyHost = hosts.find((host: any) => 
      host.domain_names.includes(domain)
    );
    
    if (!proxyHost) {
      console.log('No se encontró proxy host para:', domain);
      return;
    }
    
    // Eliminar el proxy host encontrado
    const deleteResponse = await fetch(
      `${NPM_API}/nginx/proxy-hosts/${proxyHost.id}`, 
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (!deleteResponse.ok) {
      throw new Error('Error eliminando proxy host');
    }
    
    console.log('Proxy host eliminado:', domain);
  } catch (error) {
    console.error('Error en deleteProxyHost:', error);
    throw error;
  }
}; 