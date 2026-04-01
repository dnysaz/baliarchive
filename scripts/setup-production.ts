
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting BaliArchive Production Setup...');

  // 1. Seed SiteSettings (Crucial for About, Terms, Contact)
  console.log('--- Setting up SiteSettings (ID: 1) ---');
  const existingSettings = await (prisma as any).siteSettings.findFirst({
    where: { id: 1 }
  });

  if (!existingSettings) {
    await (prisma as any).siteSettings.create({
      data: {
        id: 1,
        aboutTitle: 'About BaliArchive',
        aboutContent: '<p>Welcome to BaliArchive. We are dedicated to preserving and sharing the rich culture and destinations of Bali.</p>',
        termsTitle: 'Terms & Conditions',
        termsContent: '<p>Please read our terms and conditions carefully before using our platform.</p>',
        contactTitle: 'Contact Us',
        contactContent: '<p>Have questions? Send us a message below.</p>',
        seoTitle: 'BaliArchive — Digital Archive of Bali',
        seoDescription: 'Explore the hidden gems and rich culture of Bali through our curated digital archive.',
        keywords: 'bali, travel, archive, culture, destinations',
        ogImage: 'https://baliarchive.com/og-image.jpg'
      }
    });
    console.log('✅ SiteSettings initialized.');
  } else {
    console.log('ℹ️ SiteSettings already exists (ID: 1), skipping.');
  }

  // 2. Seed Admin User (If using Credentials Provider)
  console.log('--- Setting up Admin User ---');
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@baliarchive.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'bali12345';
  
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await (prisma as any).user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword, // Reset password if needed
    },
    create: {
      email: adminEmail,
      name: 'BaliArchive Admin',
      password: hashedPassword,
      role: 'ADMIN' // Ensure role is ADMIN if your schema supports it
    }
  });

  console.log(`✅ Admin user ready: ${adminEmail}`);
  console.log(`⚠️  Default password is: ${adminPassword}`);
  console.log('💡 Tip: Change this via the login/admin dashboard later.');

  console.log('--- Setup Complete! ---');
}

main()
  .catch((e) => {
    console.error('❌ Setup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
