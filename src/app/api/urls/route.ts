import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const urls = await prisma.streamUrl.findMany({
      select: {
        id: true,
        name: true,
        url: true,
        startDate: true,
        endDate: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return NextResponse.json(urls)
  } catch (error) {
    console.error('Error al obtener las URLs:', error)
    return NextResponse.json(
      { error: 'Error al obtener las URLs' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const data = await request.json()
  const url = await prisma.streamUrl.create({
    data: {
      name: data.name,
      url: data.url,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate)
    }
  })
  return NextResponse.json(url)
} 