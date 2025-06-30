import { json } from '@sveltejs/kit';
import { getUserStats } from '$lib/userService.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const session = await locals.getSession();
	if (!session?.user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const userId = url.searchParams.get('userId') || session.user.id;
		const stats = await getUserStats(userId);
		
		if (!stats) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		return json(stats);
	} catch (error) {
		console.error('Error fetching user stats:', error);
		return json({ error: 'Failed to fetch user stats' }, { status: 500 });
	}
};
