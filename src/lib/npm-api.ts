const NPM_API = 'http://nginx-proxy-manager:81/api';

async function getToken() {
  const email = process.env.NPM_EMAIL;
  const password = process.env.NPM_PASSWORD;

  console.log('Intentando obtener token con:', { email });  // No logueamos la contraseña por seguridad

  try {
    const response = await fetch(`${NPM_API}/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identity: email,
        secret: password
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error respuesta NPM:', error);
      throw new Error(`Failed to get NPM token: ${error}`);
    }

    const data = await response.json();
    console.log('Token obtenido correctamente');
    return data.token;
  } catch (error) {
    console.error('Error completo:', error);
    throw error;
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