import { json } from '@sveltejs/kit';
import { getLeaderboard } from '$lib/userService.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const session = await locals.getSession();
	if (!session?.user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const leaderboard = await getLeaderboard();
		return json(leaderboard);
	} catch (error) {
		console.error('Error fetching leaderboard:', error);
		return json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
	}
};
