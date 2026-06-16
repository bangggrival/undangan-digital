import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = await prisma.weddingConfig.findFirst();
  return NextResponse.json(config);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { id, updatedAt, ...updateData } = body;
  const config = await prisma.weddingConfig.upsert({
    where: { id: 1 },
    update: updateData,
    create: { id: 1, ...updateData }
  });
  return NextResponse.json(config);
}
