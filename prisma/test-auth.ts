import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const email = 'danayasa2@gmail.com';
  const password = 'Lemarikaca01#';
  
  const user = await (prisma as any).user.findUnique({
    where: { email }
  });

  if (!user) {
    console.log('❌ User not found in DB');
    return;
  }

  const isValid = await bcrypt.compare(password, user.password);
  console.log(`🔍 Checking password for ${email}...`);
  console.log(`DB Hash: ${user.password}`);
  console.log(`Input Password: ${password}`);
  console.log(`Match Result: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
}

check().finally(() => prisma.$disconnect());
