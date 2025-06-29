import { json } from '@sveltejs/kit';
import { prisma } from '$lib/database.js';

export async function GET() {
	try {
		const accounts = await prisma.account.findMany({
			include: {
				user: true
			}
		});
		
		const sessions = await prisma.session.findMany({
			include: {
				user: true
			}
		});
		
		return json({
			success: true,
			accounts: accounts.length,
			sessions: sessions.length,
			accountDetails: accounts,
			sessionDetails: sessions
		});
	} catch (error) {
		return json({
			success: false,
			error: error.message
		}, { status: 500 });
	}
}

export async function DELETE() {
	try {
		// Delete all accounts and sessions
		await prisma.account.deleteMany({});
		await prisma.session.deleteMany({});
		
		return json({
			success: true,
			message: "All accounts and sessions deleted"
		});
	} catch (error) {
		return json({
			success: false,
			error: error.message
		}, { status: 500 });
	}
}
