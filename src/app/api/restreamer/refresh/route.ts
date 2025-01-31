import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url, refresh_token } = await request.json();
    const refreshUrl = `${url.replace(/\/$/, '')}/api/login/refresh`;

    console.log('Intentando refrescar token en:', refreshUrl);

    const response = await fetch(refreshUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${refresh_token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al refrescar token:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      return NextResponse.json(
        { error: 'Error al refrescar token' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error al refrescar token:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 