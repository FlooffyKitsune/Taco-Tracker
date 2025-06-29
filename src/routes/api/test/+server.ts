import { json } from '@sveltejs/kit';
import { prisma } from '$lib/database.js';

export async function GET() {
	try {
		// Test database connection
		await prisma.$connect();
		
		// Count existing records
		const tacoTypeCount = await prisma.tacoType.count();
		const achievementCount = await prisma.achievement.count();
		const userCount = await prisma.user.count();
		
		await prisma.$disconnect();
		
		return json({
			success: true,
			database: 'connected',
			counts: {
				tacoTypes: tacoTypeCount,
				achievements: achievementCount,
				users: userCount
			}
		});
	} catch (error) {
		console.error('Database test error:', error);
		return json({
			success: false,
			error: error.message,
			database: 'disconnected'
		}, { status: 500 });
	}
}
