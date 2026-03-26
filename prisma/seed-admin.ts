import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'danayasa2@gmail.com';
  const password = 'Lemarikaca01#';
  const name = 'Admin';

  console.log(`🌱 Seeding admin: ${email} with password: ${password}`);

  if (!email || !password) {
    console.error('❌ Error: ADMIN_EMAIL or ADMIN_PASSWORD not found in .env');
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await (prisma as any).user.upsert({
    where: { email },
    update: { 
      password: hashedPassword,
      name: name
    },
    create: {
      email,
      name: name,
      password: hashedPassword,
    },
  });

  console.log(`Admin user created/updated: ${admin.email}`);
  console.log(`Username: Admin`);
  console.log(`Password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
