import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET() {
  const config = await prisma.weddingConfig.findFirst()
  
  if (!config) {
    return new NextResponse('Not Found', { status: 404 })
  }

  let base64String = config.ogImage || '';
  if (!base64String && config.galleryPhotos) {
    try {
      const photos = typeof config.galleryPhotos === 'string' ? JSON.parse(config.galleryPhotos) : config.galleryPhotos;
      if (photos.length > 0) base64String = photos[0];
    } catch(e) {}
  }
  if (!base64String && config.bridePhoto) base64String = config.bridePhoto;

  if (!base64String || !base64String.startsWith('data:image/')) {
    // We don't have a valid base64 image
    return new NextResponse('Not Found', { status: 404 })
  }

  // Extract the base64 part
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
  if (!matches || matches.length !== 3) {
    return new NextResponse('Invalid image data', { status: 400 })
  }

  const contentType = matches[1]
  const imageBuffer = Buffer.from(matches[2], 'base64')

  return new NextResponse(imageBuffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=60, s-maxage=60',
    },
  })
}
