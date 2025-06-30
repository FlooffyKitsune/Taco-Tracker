import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test simple query
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users in database`);
    
    // Test taco types
    const tacoTypes = await prisma.tacoType.findMany();
    console.log(`✅ Found ${tacoTypes.length} taco types`);
    
    // Test if we can find a specific user
    const testUser = await prisma.user.findFirst();
    if (testUser) {
      console.log(`✅ Found test user: ${testUser.name} (${testUser.id})`);
    } else {
      console.log('❌ No users found');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
