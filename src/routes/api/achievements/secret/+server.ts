import { json } from '@sveltejs/kit';
import { unlockSecretAchievement } from '$lib/achievements';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const session = await locals.auth();
		
		if (!session?.user?.id) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const achievement = await unlockSecretAchievement(session.user.id);
		
		if (achievement) {
			return json({ success: true, achievement });
		} else {
			return json({ success: false, message: 'Achievement already unlocked or not found' });
		}
		
	} catch (error) {
		console.error('Error unlocking secret achievement:', error);
		return json({ error: 'Failed to unlock achievement' }, { status: 500 });
	}
};
