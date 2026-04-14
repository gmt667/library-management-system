import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.member.update({ where: { email: 'alice@mail.com' }, data: { fineBalance: 5000 } })
  .then(() => console.log('Added 5000 MK fine balance to Alice.'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
