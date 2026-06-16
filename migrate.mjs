import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const oldConfig = {
  "id":1,
  "groomName":"Dhikri Maulana Saputra",
  "groomParents":"Putra dari Bapak Fulan & Ibu Fulanah",
  "groomIG":"@david_ig",
  "brideName":"Davina Rhilla Cantika ",
  "brideParents":"Putri dari Bapak Fulan & Ibu Fulanah",
  "brideIG":"@maria_ig",
  "akadDate": new Date(1783018800000),
  "akadLocation":"Masjid Agung, Jl. Sudirman No. 1",
  "resepsiDate": new Date(1783105200000),
  "resepsiLocation":"Gedung Serbaguna, Jl. Gatot Subroto No. 2",
  "mapsLink":"https://maps.google.com",
  "bankName":"BCA",
  "bankAccount":"1234567890",
  "bankHolder":"David",
  "bridePhoto":"/uploads/1781497677217-WhatsAppImage20260615at08.47.12.jpeg",
  "galleryPhotos":"[\"/uploads/1781497683321-WhatsAppImage20260615at08.43.11.jpeg\",\"/uploads/1781497683333-WhatsAppImage20260615at08.43.121.jpeg\",\"/uploads/1781497683349-WhatsAppImage20260615at08.43.12.jpeg\"]",
  "groomPhoto":"/uploads/1781497672970-WhatsAppImage20260615at08.47.11.jpeg",
  "musicUrl":"/uploads/1781505303563-leberchinvitationwedding375839.mp3"
};

const guests = [
  {"id":1,"name":"Selvi dan Keluarga","slug":"Selvi%20dan%20Keluarga","isRSVP":false,"status":"Sudah Dikirim","wish":null,"createdAt": new Date(1781504556075)}
];

const wishes = [
  {"id":3,"name":"Tes","status":"hadir","message":"Hadir","createdAt": new Date(1781506925655)},
  {"id":4,"name":"Tes 2","status":"hadir","message":"Hadir","createdAt": new Date(1781506932251)}
];

async function main() {
  await prisma.weddingConfig.upsert({
    where: { id: 1 },
    update: oldConfig,
    create: oldConfig
  });
  
  for (const g of guests) {
    await prisma.guest.upsert({ where: { id: g.id }, update: g, create: g });
  }

  for (const w of wishes) {
    await prisma.wish.upsert({ where: { id: w.id }, update: w, create: w });
  }
  
  console.log("Migration complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
