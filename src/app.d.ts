import type { DefaultSession } from '@auth/core/types'

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			getSession(): Promise<Session | null>
		}
		// interface PageData {}
		// interface Platform {}
	}
}

declare module '@auth/core/types' {
	interface Session {
		user: {
			id: string
			totalTacosEaten?: number
			totalTacoSessions?: number
			achievements?: Array<{
				achievement: {
					id: string
					name: string
					description: string
					emoji: string
					category: string
					points: number
				}
				unlockedAt: Date
			}>
		} & DefaultSession['user']
	}
}

export {}
