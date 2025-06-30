import { json } from '@sveltejs/kit';
import { prisma } from '$lib/database.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const session = await locals.getSession();
	if (!session?.user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const userId = url.searchParams.get('userId') || session.user.id;
		
		// Get recent sessions this user participated in
		const recentSessions = await prisma.tacoSession.findMany({
			where: {
				participants: {
					some: {
						userId: userId
					}
				}
			},
			include: {
				createdBy: true,
				participants: {
					include: {
						user: true
					}
				},
				consumptions: {
					include: {
						tacoType: true,
						user: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			},
			take: 10
		});

		// Transform to expected format
		const transformedSessions = recentSessions.map(session => ({
			id: session.id,
			name: session.name || 'Taco Session',
			date: new Date(session.createdAt).toLocaleDateString(),
			createdBy: session.createdBy?.name || 'Unknown',
			peopleCount: session.participants.length,
			participants: session.participants.map(p => ({
				id: p.user.id,
				name: p.user.name || p.user.globalName || p.user.username || 'Unknown'
			})),
			// Group consumptions by taco type to simulate "orders"
			orders: (() => {
				const tacoTypeMap = new Map();
				session.consumptions.forEach(consumption => {
					const typeId = consumption.tacoTypeId;
					const existing = tacoTypeMap.get(typeId) || { 
						type: consumption.tacoType, 
						quantity: 0 
					};
					existing.quantity += consumption.quantity;
					tacoTypeMap.set(typeId, existing);
				});
				return Array.from(tacoTypeMap.values());
			})(),
			consumptions: session.consumptions,
			completedAt: session.completedAt
		}));

		return json(transformedSessions);
	} catch (error) {
		console.error('Error fetching recent sessions:', error);
		return json({ error: 'Failed to fetch recent sessions' }, { status: 500 });
	}
};
