
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const settings = await (prisma as any).siteSettings.findMany();

  console.log(`--- TOTAL SETTINGS RECORDS: ${settings.length} ---`);
  settings.forEach((s: any) => {
    console.log(`ID: ${s.id}`);
    console.log(`About: ${s.aboutContent.substring(0, 30)}...`);
    console.log(`Contact: ${s.contactContent.substring(0, 30)}...`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
