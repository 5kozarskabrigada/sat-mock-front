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
  console.log('Creating test admin user...');

  // Clean up existing test users
  const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@test.com' } });
  const existingStudent = await prisma.user.findUnique({ where: { email: 'student@test.com' } });
  
  if (existingAdmin) {
    await prisma.account.deleteMany({ where: { userId: existingAdmin.id } });
    await prisma.session.deleteMany({ where: { userId: existingAdmin.id } });
    await prisma.user.delete({ where: { id: existingAdmin.id } });
  }
  
  if (existingStudent) {
    await prisma.account.deleteMany({ where: { userId: existingStudent.id } });
    await prisma.session.deleteMany({ where: { userId: existingStudent.id } });
    await prisma.user.delete({ where: { id: existingStudent.id } });
  }

  // Hash password (Better Auth uses bcrypt)
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      emailVerified: new Date(),
    },
  });

  // Create account record for Better Auth (credential provider)
  await prisma.account.create({
    data: {
      userId: admin.id,
      accountId: admin.email,
      providerId: 'credential',
      password: hashedPassword,
    },
  });

  console.log('✅ Admin user created:', admin.email);
  console.log('   Email: admin@test.com');
  console.log('   Password: admin123');
  console.log('   Role:', admin.role);

  // Create test student
  const studentPassword = await bcrypt.hash('student123', 10);
  const student = await prisma.user.create({
    data: {
      email: 'student@test.com',
      username: 'student1',
      firstName: 'Test',
      lastName: 'Student',
      role: 'student',
      emailVerified: new Date(),
    },
  });

  // Create account record for student
  await prisma.account.create({
    data: {
      userId: student.id,
      accountId: student.email,
      providerId: 'credential',
      password: studentPassword,
    },
  });

  console.log('\n✅ Student user created:', student.email);
  console.log('   Email: student@test.com');
  console.log('   Password: student123');
  console.log('   Role:', student.role);
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
