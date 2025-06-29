import { json } from '@sveltejs/kit';
import { prisma } from '$lib/database.js';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ url }) => {
	try {
		const userId = url.searchParams.get('userId');
		
		if (!userId) {
			return json({ 
				success: false, 
				error: 'User ID is required' 
			}, { status: 400 });
		}

		console.log(`🗑️ Deleting user: ${userId}`);

		// Delete user (this will cascade delete all related data due to foreign key constraints)
		const deletedUser = await prisma.user.delete({
			where: { id: userId },
			include: {
				accounts: true,
				sessions: true,
				consumptions: true,
				achievements: true,
				createdSessions: true,
				sessionParticipants: true
			}
		});

		console.log(`✅ User deleted successfully: ${deletedUser.name || deletedUser.email}`);
		console.log(`   - ${deletedUser.accounts.length} accounts deleted`);
		console.log(`   - ${deletedUser.sessions.length} sessions deleted`);
		console.log(`   - ${deletedUser.consumptions.length} consumptions deleted`);
		console.log(`   - ${deletedUser.achievements.length} achievements deleted`);
		console.log(`   - ${deletedUser.createdSessions.length} created sessions deleted`);
		console.log(`   - ${deletedUser.sessionParticipants.length} session participations deleted`);

		return json({
			success: true,
			message: `User ${deletedUser.name || deletedUser.email} and all related data deleted successfully`,
			deletedData: {
				accounts: deletedUser.accounts.length,
				sessions: deletedUser.sessions.length,
				consumptions: deletedUser.consumptions.length,
				achievements: deletedUser.achievements.length,
				createdSessions: deletedUser.createdSessions.length,
				sessionParticipants: deletedUser.sessionParticipants.length
			}
		});

	} catch (error) {
		console.error('❌ Error deleting user:', error);
		return json({
			success: false,
			error: `Failed to delete user: ${error.message}`
		}, { status: 500 });
	}
};
