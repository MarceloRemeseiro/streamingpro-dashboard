import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Obtener o crear preferencias
    let prefs = await prisma.userPreferences.findFirst();
    if (!prefs) {
      prefs = await prisma.userPreferences.create({
        data: { darkMode: false }
      });
    }
    return NextResponse.json(prefs);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error getting preferences' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { darkMode } = await request.json();
    
    // Actualizar o crear preferencias
    const prefs = await prisma.userPreferences.upsert({
      where: { id: (await prisma.userPreferences.findFirst())?.id || '' },
      create: { darkMode },
      update: { darkMode }
    });
    
    return NextResponse.json(prefs);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error updating preferences' },
      { status: 500 }
    );
  }
} 