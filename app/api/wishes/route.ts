import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const wishes = await prisma.wish.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(wishes);
  } catch (error) {
    console.error('Error fetching wishes:', error);
    return NextResponse.json({ error: 'Failed to fetch wishes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, status, message } = await request.json();

    if (!name || !status || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const wish = await prisma.wish.create({
      data: {
        name,
        status,
        message,
      }
    });

    return NextResponse.json(wish);
  } catch (error) {
    console.error('Error creating wish:', error);
    return NextResponse.json({ error: 'Failed to create wish' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await prisma.wish.delete({
      where: { id: Number(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting wish:', error);
    return NextResponse.json({ error: 'Failed to delete wish' }, { status: 500 });
  }
}
