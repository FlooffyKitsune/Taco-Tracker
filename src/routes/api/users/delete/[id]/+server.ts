import { json } from '@sveltejs/kit';
import { prisma } from '$lib/database.js';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const session = await locals.getSession();
	if (!session?.user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const consumptionId = params.id;
		
		// First, get the consumption to check ownership and get quantity
		const consumption = await prisma.tacoConsumption.findUnique({
			where: { id: consumptionId },
			select: { userId: true, quantity: true }
		});

		if (!consumption) {
			return json({ error: 'Consumption not found' }, { status: 404 });
		}

		// Check if the consumption belongs to the current user
		if (consumption.userId !== session.user.id) {
			return json({ error: 'Forbidden' }, { status: 403 });
		}

		// Delete the consumption
		await prisma.tacoConsumption.delete({
			where: { id: consumptionId }
		});

		// Update user's total tacos eaten
		await prisma.user.update({
			where: { id: session.user.id },
			data: {
				totalTacosEaten: {
					decrement: consumption.quantity
				}
			}
		});

		return json({ success: true });
	} catch (error) {
		console.error('Error deleting consumption:', error);
		return json({ error: 'Failed to delete consumption' }, { status: 500 });
	}
};
