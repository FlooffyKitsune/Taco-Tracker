import { json } from '@sveltejs/kit';
import { getUserAchievements } from '$lib/achievements.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const session = await locals.getSession();
	if (!session?.user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const userId = url.searchParams.get('userId') || session.user.id;
		const achievements = await getUserAchievements(userId);
		return json(achievements);
	} catch (error) {
		console.error('Error fetching user achievements:', error);
		return json({ error: 'Failed to fetch user achievements' }, { status: 500 });
	}
};
