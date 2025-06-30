import { json } from '@sveltejs/kit';
import { checkAndUnlockAchievements } from '$lib/achievements';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
	try {
		const session = await locals.auth();
		
		if (!session?.user?.id) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const newAchievements = await checkAndUnlockAchievements(session.user.id);
		
		return json({ 
			success: true, 
			newAchievements,
			message: `Checked achievements for user. ${newAchievements.length} new achievements unlocked.`
		});
		
	} catch (error) {
		console.error('Error checking achievements:', error);
		return json({ error: 'Failed to check achievements' }, { status: 500 });
	}
};

export const GET: RequestHandler = async ({ locals }) => {
	try {
		const session = await locals.auth();
		
		if (!session?.user?.id) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const newAchievements = await checkAndUnlockAchievements(session.user.id);
		
		return json({ 
			success: true, 
			newAchievements,
			message: `Checked achievements for user. ${newAchievements.length} new achievements unlocked.`
		});
		
	} catch (error) {
		console.error('Error checking achievements:', error);
		return json({ error: 'Failed to check achievements' }, { status: 500 });
	}
};
