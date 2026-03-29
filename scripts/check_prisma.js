const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSchema() {
  console.log('Available models in Prisma Client:');
  console.log(Object.keys(prisma).filter(k => k.charAt(0) === k.charAt(0).toLowerCase() && !k.startsWith('_')));
  await prisma.$disconnect();
}

checkSchema().catch(e => {
  console.error(e);
  process.exit(1);
});
