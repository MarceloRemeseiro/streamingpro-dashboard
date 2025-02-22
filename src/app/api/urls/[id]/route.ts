import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const data = await request.json()
  const url = await prisma.streamUrl.update({
    where: { id },
    data: {
      name: data.name,
      url: data.url,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate)
    }
  })
  return NextResponse.json(url)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.streamUrl.delete({
    where: { id }
  })
  return new NextResponse(null, { status: 204 })
} 