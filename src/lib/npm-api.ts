const NPM_API = 'http://nginx-proxy-manager:81/api';

export interface ProxyHostConfig {
  domain_names: string[];
  forward_scheme: 'http' | 'https';
  forward_host: string;
  forward_port: number;
  ssl_forced: boolean;
  certificate_id?: number;
}

export const createProxyHost = async (config: ProxyHostConfig) => {
  const response = await fetch(`${NPM_API}/nginx/proxy-hosts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + process.env.NPM_API_KEY
    },
    body: JSON.stringify(config)
  });
  
  return response.json();
}; 