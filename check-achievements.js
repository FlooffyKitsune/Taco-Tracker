import { prisma } from './src/lib/database.js';

async function checkAchievements() {
  try {
    const achievements = await prisma.achievement.findMany();
    console.log('Current achievements:', JSON.stringify(achievements, null, 2));
    
    const users = await prisma.user.findMany({
      include: {
        consumptions: {
          include: {
            tacoType: true
          }
        }
      }
    });
    console.log('Users with consumptions:', JSON.stringify(users, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAchievements();
