import { PrismaClient } from '@prisma/client'
import InvitationClient from './components/InvitationClient'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

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
