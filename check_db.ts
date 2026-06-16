import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const config = await prisma.weddingConfig.findFirst();
  console.log(config);
}

main();
