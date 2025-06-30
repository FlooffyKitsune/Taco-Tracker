import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	try {
		return {
			session: await event.locals.getSession()
		};
	} catch (error) {
		console.error('Auth test load error:', error);
		return {
			session: null,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
};
