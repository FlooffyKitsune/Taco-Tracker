import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export async function GET() {
	return json({
		nextauth_url: env.NEXTAUTH_URL,
		discord_client_id: env.DISCORD_CLIENT_ID ? 'SET' : 'NOT SET',
		nextauth_secret: env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
		environment: 'production'
	});
}
