import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Full Database Seeding...');

  // 1. Settings
  await prisma.systemSetting.create({
    data: { loanDurationDays: 14, fineRatePerDay: 500 }
  });

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);

  // 2. Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@library.com' },
    update: {},
    create: { name: 'System Admin', email: 'admin@library.com', password: hashedPassword, role: 'admin' },
  });
  console.log('✅ Created admin:', admin.email);

  // 3. Books & Copies
  const book1 = await prisma.book.create({
    data: {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '9780743273565',
      copies: {
        create: [
          { barcode: 'LIB-GG-001', available: true },
          { barcode: 'LIB-GG-002', available: true }
        ]
      }
    }
  });

  const book2 = await prisma.book.create({
    data: {
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      isbn: '9780061120084',
      copies: {
        create: [
          { barcode: 'LIB-TK-001', available: true }
        ]
      }
    }
  });
  console.log('✅ Created books & copies');

  // 4. Members
  const member1 = await prisma.member.create({
    data: { 
      fullName: 'Alice Johnson', 
      dateOfBirth: new Date('2005-06-15'),
      gender: 'Female',
      phone: '0999123456',
      email: 'alice@mail.com', 
      address: 'Area 47',
      location: 'Lilongwe',
      school: 'Lilongwe Girls Secondary',
      studentId: 'LGS-001',
      guardianName: 'Thomas Johnson',
      guardianPhone: '0888654321',
      guardianRelation: 'Father',
      fineBalance: 0 
    }
  });

  const member2 = await prisma.member.create({
    data: { 
      fullName: 'Bob Smith', 
      dateOfBirth: new Date('2006-11-20'),
      gender: 'Male',
      phone: '0999789012',
      email: 'bob@mail.com', 
      address: 'Area 10',
      location: 'Lilongwe',
      school: 'Kamuzu Academy',
      studentId: 'KA-204',
      guardianName: 'Mary Smith',
      guardianPhone: '0888111222',
      guardianRelation: 'Mother',
      fineBalance: 0 
    }
  });
  console.log('✅ Created members');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
