// Configuración para conectar con el Nginx del servidor
const NPM_API = process.env.NPM_API || 'http://localhost:81/api';
const NPM_EMAIL = process.env.NPM_EMAIL || '';
const NPM_PASSWORD = process.env.NPM_PASSWORD || '';
const NPM_API_KEY = process.env.NPM_API_KEY || '';

export async function getToken() {
  if (!NPM_API || !NPM_EMAIL) {
    throw new Error('NPM_API y NPM_EMAIL son requeridos')
  }

  try {
    console.log('Intentando obtener token con:', {
      api: NPM_API,
      email: NPM_EMAIL,
    });

    const response = await fetch(`${NPM_API}/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        identity: NPM_EMAIL,
        secret: NPM_PASSWORD
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Respuesta completa:', errorText);
      throw new Error(`Error al obtener token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error al obtener token:', error);
    return null;
  }
}

export interface ProxyHostConfig {
  domain_names: string[];
  forward_scheme: 'http' | 'https';
  forward_host: string;
  forward_port: number;
  ssl_forced: boolean;
  certificate_id?: number;
}

interface ProxyHost extends ProxyHostConfig {
  id: number;
  created_on: string;
  modified_on: string;
  owner_user_id: number;
  meta?: {
    letsencrypt_agree?: boolean;
    dns_challenge?: boolean;
  };
}

export const createProxyHost = async (config: ProxyHostConfig) => {
  console.log('Creando proxy host con config:', config);
  
  try {
    const token = await getToken();
    
    // Primero buscar si existe el proxy host
    const response = await fetch(`${NPM_API}/nginx/proxy-hosts`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const hosts = await response.json() as ProxyHost[];
    const existingHost = hosts.find((host: ProxyHost) => 
      host.domain_names.includes(config.domain_names[0])
    );

    // Si existe, eliminarlo
    if (existingHost) {
      await fetch(`${NPM_API}/nginx/proxy-hosts/${existingHost.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    }

    // Crear el nuevo proxy host
    const createResponse = await fetch(`${NPM_API}/nginx/proxy-hosts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(config)
    });
    
    if (!createResponse.ok) {
      const error = await createResponse.text();
      console.error('Error creando proxy host:', error);
      throw new Error(`Error creando proxy host: ${error}`);
    }
    
    const data = await createResponse.json();
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
    
    const hosts = await response.json() as ProxyHost[];
    const proxyHost = hosts.find((host: ProxyHost) => 
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

export const checkDomainExists = async (domain: string): Promise<boolean> => {
  try {
    const token = await getToken();
    const response = await fetch(`${NPM_API}/nginx/proxy-hosts`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const hosts = await response.json() as ProxyHost[];
    return hosts.some((host: ProxyHost) => host.domain_names.includes(domain));
  } catch (error) {
    console.error('Error checking domain:', error);
    throw error;
  }
}; 