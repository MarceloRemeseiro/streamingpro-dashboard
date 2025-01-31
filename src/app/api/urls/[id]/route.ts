import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: {
    id: string
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const data = await request.json()
  const url = await prisma.streamUrl.update({
    where: { id: params.id },
    data: {
      name: data.name,
      url: data.url,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate)
    }
  })
  return NextResponse.json(url)
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  await prisma.streamUrl.delete({
    where: { id: params.id }
  })
  return new NextResponse(null, { status: 204 })
} 