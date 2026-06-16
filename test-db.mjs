import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.sgobfqcunirwcrolmprs:%40RasaJagak5@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
    }
  }
});

async function main() {
  const config = await prisma.weddingConfig.findFirst();
  console.log("Config:", config);
}

main().catch(console.error).finally(() => prisma.$disconnect());
