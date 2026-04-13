import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

// Load environment variables FIRST
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local'), override: true });

console.log('DATABASE_URL:', process.env.DATABASE_URL);

// Now import Prisma after env is loaded
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Cleaning up legacy test users...');

  const testUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: 'admin@test.com' },
        { email: 'student@test.com' },
        { username: 'admin' },
        { username: 'student1' },
      ],
    },
    select: { id: true, email: true, username: true },
  });

  for (const user of testUsers) {
    await prisma.account.deleteMany({ where: { userId: user.id } });
    await prisma.session.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log(`Removed test user: ${user.email || user.username}`);
  }

  console.log('No test users are created by this seed script.');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
