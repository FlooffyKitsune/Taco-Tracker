// Debug utility for development mode
// Only shows debug information for specific developers in development environment

const DEVELOPER_ACCOUNTS = [
	'Floofy',
	// Add more developer usernames/emails here as needed
];

export function isDebugMode(user?: { name?: string | null; email?: string | null }): boolean {
	// Never show debug in production
	if (import.meta.env.PROD) {
		return false;
	}
	
	if (!user) return false;
	
	// Check if it's a developer account
	const isDeveloper = DEVELOPER_ACCOUNTS.some(dev => 
		user.name?.toLowerCase().includes(dev.toLowerCase()) ||
		user.email?.toLowerCase().includes(dev.toLowerCase())
	);
	
	// Only show in development AND for developer accounts
	return isDeveloper && import.meta.env.DEV;
}

export function debugLog(message: string, ...args: any[]): void {
	if (import.meta.env.DEV) {
		console.log(`[TACO-DEBUG] ${message}`, ...args);
	}
}

export function debugWarn(message: string, ...args: any[]): void {
	if (import.meta.env.DEV) {
		console.warn(`[TACO-DEBUG] ${message}`, ...args);
	}
}

export function debugError(message: string, ...args: any[]): void {
	if (import.meta.env.DEV) {
		console.error(`[TACO-DEBUG] ${message}`, ...args);
	}
}

export function isDevAccount(user?: { name?: string | null; email?: string | null }): boolean {
	if (!user) return false;
	
	// Check if it's a developer account (same logic as debug mode but without env checks)
	return DEVELOPER_ACCOUNTS.some(dev => 
		user.name?.toLowerCase().includes(dev.toLowerCase()) ||
		user.email?.toLowerCase().includes(dev.toLowerCase())
	);
}
