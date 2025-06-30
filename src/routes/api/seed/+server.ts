import { json } from '@sveltejs/kit';
import { prisma } from '$lib/database.js';
import { DEFAULT_ACHIEVEMENTS } from '$lib/achievements.js';

const DEFAULT_TACO_TYPES = [
	{ name: 'Carne Asada', emoji: '🥩', color: '#8B4513' },
	{ name: 'Al Pastor', emoji: '🍖', color: '#FF6B6B' },
	{ name: 'Carnitas', emoji: '🐷', color: '#DEB887' },
	{ name: 'Pollo', emoji: '🐔', color: '#FFD700' },
	{ name: 'Pescado', emoji: '🐟', color: '#4169E1' },
	{ name: 'Camarones', emoji: '🦐', color: '#FF69B4' },
	{ name: 'Vegetariano', emoji: '🥬', color: '#32CD32' },
	{ name: 'Barbacoa', emoji: '🔥', color: '#8B0000' },
	{ name: 'Chorizo', emoji: '🌶️', color: '#DC143C' },
	{ name: 'Lengua', emoji: '👅', color: '#A0522D' },
	{ name: 'Suadero', emoji: '🥓', color: '#CD853F' },
	{ name: 'Rajas con Queso', emoji: '🧀', color: '#FFFF00' }
];

async function seedDatabase() {
	try {
		console.log('🌱 Starting database seeding...');
		
		// Test database connection
		console.log('📡 Testing database connection...');
		await prisma.$connect();
		console.log('✅ Database connected successfully');

		// Clean up legacy achievements first
		console.log('🧹 Cleaning up legacy achievements...');
		await prisma.achievement.deleteMany({
			where: {
				name: 'Daily Warrior'
			}
		});
		console.log('✅ Legacy achievements cleaned up');

		// Create taco types
		console.log('🌮 Creating taco types...');
		let tacoTypesCreated = 0;
		for (const tacoType of DEFAULT_TACO_TYPES) {
			const result = await prisma.tacoType.upsert({
				where: { name: tacoType.name },
				update: {},
				create: tacoType
			});
			tacoTypesCreated++;
			console.log(`✅ Created/Updated taco type: ${tacoType.name}`);
		}

		// Create achievements
		console.log('🏆 Creating achievements...');
		let achievementsCreated = 0;
		for (const achievement of DEFAULT_ACHIEVEMENTS) {
			const result = await prisma.achievement.upsert({
				where: { name: achievement.name },
				update: {
					description: achievement.description,
					icon: achievement.icon,
					category: achievement.category,
					requirement: achievement.requirement
				},
				create: achievement
			});
			achievementsCreated++;
			console.log(`✅ Created/Updated achievement: ${achievement.name}`);
		}

		console.log(`🎉 Seeding completed! Created ${tacoTypesCreated} taco types and ${achievementsCreated} achievements`);

		return json({ 
			success: true, 
			message: `Database seeded successfully! Created ${tacoTypesCreated} taco types and ${achievementsCreated} achievements.`,
			tacoTypesCreated,
			achievementsCreated
		});
	} catch (error) {
		console.error('❌ Seeding error:', error);
		return json({ 
			success: false, 
			error: `Failed to seed database: ${error instanceof Error ? error.message : 'Unknown error'}`,
			details: error
		}, { status: 500 });
	} finally {		await prisma.$disconnect();
	}
}

export async function POST() {
	return await seedDatabase();
}

export async function GET() {
	return await seedDatabase();
}
