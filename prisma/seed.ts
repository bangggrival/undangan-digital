import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.weddingConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      groomName: "David",
      brideName: "Maria",
      akadDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
    },
  })
  console.log("Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
