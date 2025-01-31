import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    console.log('URL recibida:', url);
    const loginUrl = `${url.replace(/\/$/, '')}/api/login`;
    console.log('loginUrl:', loginUrl);
    console.log('Intentando autenticar con Restreamer en:', loginUrl);

    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'Lumar1234'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en la respuesta de Restreamer:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      return NextResponse.json(
        { error: 'Error al autenticar con Restreamer' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error al autenticar con Restreamer:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 