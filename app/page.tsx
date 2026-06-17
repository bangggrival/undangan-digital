import { PrismaClient } from '@prisma/client'
import InvitationClient from './components/InvitationClient'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ to?: string, nama?: string }> }): Promise<import('next').Metadata> {
  const resolvedParams = await searchParams;
  const config = await prisma.weddingConfig.findFirst();
  const guestName = resolvedParams.to || resolvedParams.nama || 'Tamu Undangan';

  if (!config) return { title: 'Undangan Pernikahan' };

  let imageUrl = config.ogImage || '';
  if (!imageUrl && config.galleryPhotos) {
    try {
      const photos = typeof config.galleryPhotos === 'string' ? JSON.parse(config.galleryPhotos) : config.galleryPhotos;
      if (photos.length > 0) imageUrl = photos[0];
    } catch(e) {}
  }
  if (!imageUrl && config.bridePhoto) imageUrl = config.bridePhoto;

  return {
    title: `The Wedding of ${config.brideName.split(' ')[0]} & ${config.groomName.split(' ')[0]}`,
    description: `Kepada Yth. ${guestName}, kami mengundang Anda untuk hadir di acara pernikahan kami.`,
    openGraph: {
      title: `The Wedding of ${config.brideName.split(' ')[0]} & ${config.groomName.split(' ')[0]}`,
      description: `Kepada Yth. ${guestName}, kami mengundang Anda untuk hadir di acara pernikahan kami.`,
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default async function Home({ searchParams }: { searchParams: Promise<{ to?: string, nama?: string }> }) {
  const resolvedParams = await searchParams;
  const config = await prisma.weddingConfig.findFirst()
  
  if (!config) {
    return <div style={{padding: '2rem', textAlign: 'center'}}>Setup database configuration first.</div>
  }

  const guestName = resolvedParams.to || resolvedParams.nama || 'Tamu Undangan'

  const initialWishes = await prisma.wish.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return <InvitationClient config={config} initialWishes={initialWishes} guestName={guestName} />
}
