import { json } from '@sveltejs/kit';
import { prisma } from '$lib/database.js';

export async function GET() {
	try {
		const tacoTypes = await prisma.tacoType.findMany({
			orderBy: { name: 'asc' }
		});
		return json(tacoTypes);
	} catch (error) {
		console.error('Error fetching taco types:', error);
		return json({ error: 'Failed to fetch taco types' }, { status: 500 });
	}
}
