import { json } from '@sveltejs/kit';
import { recordTacoConsumption, recordMultipleTacoConsumptions } from '$lib/userService.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.getSession();
	if (!session?.user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await request.json();
		
		// Handle both single and multiple taco consumption
		if (body.entries && Array.isArray(body.entries)) {
			// Multiple entries (new format)
			const result = await recordMultipleTacoConsumptions(
				session.user.id,
				body.entries,
				body.sessionId
			);
			return json(result);
		} else {
			// Single entry (backward compatibility)
			const { tacoTypeId, quantity, sessionId } = body;
			const result = await recordTacoConsumption(
				session.user.id,
				tacoTypeId,
				quantity,
				sessionId
			);
			return json(result);
		}
	} catch (error) {
		console.error('Error recording consumption:', error);
		if (error instanceof Error) {
			console.error('Error details:', {
				message: error.message,
				stack: error.stack
			});
		}
		return json({ error: 'Failed to record consumption' }, { status: 500 });
	}
};
