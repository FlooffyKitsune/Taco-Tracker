import { json } from '@sveltejs/kit';
import { prisma } from '$lib/database.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		const achievements = await prisma.achievement.findMany({
			orderBy: [
				{ category: 'asc' },
				{ requirement: 'asc' }
			]
		});

		return json(achievements);
	} catch (error) {
		console.error('Error fetching achievements:', error);
		return json({ error: 'Failed to fetch achievements' }, { status: 500 });
	}
};
