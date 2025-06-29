import { json } from '@sveltejs/kit';
import { prisma } from '$lib/database.js';

async function addEmailConstraint() {
	try {
		// Add unique constraint on email field
		await prisma.$executeRaw`ALTER TABLE "User" ADD CONSTRAINT "User_email_key" UNIQUE ("email")`;
		
		return json({
			success: true,
			message: "Unique constraint added to email field successfully"
		});
	} catch (error) {
		// If constraint already exists, that's fine
		if (error.message.includes('already exists')) {
			return json({
				success: true,
				message: "Email unique constraint already exists"
			});
		}
		
		return json({
			success: false,
			error: error.message
		}, { status: 500 });
	}
}

export async function POST() {
	return await addEmailConstraint();
}

export async function GET() {
	return await addEmailConstraint();
}
