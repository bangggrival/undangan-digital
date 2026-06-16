import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const guests = await prisma.guest.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(guests);
}

export async function POST(request: Request) {
  const { name } = await request.json();
  
  const formattedName = encodeURIComponent(name);

  const guest = await prisma.guest.create({
    data: {
      name,
      slug: formattedName,
      status: "Belum Dikirim"
    }
  });
  
  return NextResponse.json(guest);
}

export async function DELETE(request: Request) {
    const { id } = await request.json();
    await prisma.guest.delete({ where: { id: Number(id) }});
    return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
    const { id, status } = await request.json();
    const guest = await prisma.guest.update({
        where: { id: Number(id) },
        data: { status }
    });
    return NextResponse.json(guest);
}
