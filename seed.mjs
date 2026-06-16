import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.weddingConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      brideName: 'Davina',
      groomName: 'Rivaldi',
      brideParents: 'Putri dari Bapak Fulan & Ibu Fulanah',
      groomParents: 'Putra dari Bapak Fulan & Ibu Fulanah',
      akadDate: new Date('2026-12-20T08:00:00Z'),
      akadLocation: 'Masjid Raya Al-Azhar',
      resepsiDate: new Date('2026-12-20T11:00:00Z'),
      resepsiLocation: 'Gedung Serbaguna Senayan',
      storyText: 'Kami bertemu di kampus dan memutuskan untuk menempuh hidup baru bersama.',
      bankName: 'BCA',
      accountName: 'Rivaldi',
      accountNumber: '1234567890',
      coverImage: '/couple.jpg',
      musicUrl: '/wedding-song.mp3'
    }
  });
  console.log("Seeded successfully");
}

main().catch(console.error).finally(() => prisma.$disconnect());
