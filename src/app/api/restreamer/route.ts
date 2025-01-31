import { log } from 'console';
import { NextResponse } from 'next/server';
import { RESTREAMER_CREDENTIALS } from '@/lib/constants';

function normalizeUrl(url: string): string {
  // Asegurarse de que la URL comienza con http:// o https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'http://' + url;
  }
  
  // Eliminar la barra final si existe
  url = url.replace(/\/$/, '');
  
  // Eliminar /api si existe al final
  url = url.replace(/\/api$/, '');
  
  return url;
}

export async function POST(request: Request) {
  try {
    
    const { url } = await request.json();
    const normalizedUrl = normalizeUrl(url);
    console.log('URL recibida:', url);
    console.log('URL normalizada:', normalizedUrl);
    console.log('Intentando conectar a:', `${normalizedUrl}/api/login`);

    const response = await fetch(`${normalizedUrl}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(RESTREAMER_CREDENTIALS)
    });

    if (!response.ok) {
      console.error('Error en la autenticación. Status:', response.status);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      throw new Error('Error en la autenticación');
    }

    const data = await response.json();
    console.log('Respuesta exitosa:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error completo:', error);
    return NextResponse.json(
      { error: 'Error al autenticar con el servidor restreamer' },
      { status: 500 }
    );
  }
} 