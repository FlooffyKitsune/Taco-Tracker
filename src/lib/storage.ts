import type { TacoSession, TacoConsumption, MultiTacoConsumption } from './types.js';
import { browser } from '$app/environment';

const STORAGE_KEYS = {
	SESSIONS: 'taco-tracker-sessions',
	CONSUMPTIONS: 'taco-tracker-consumptions',
	MULTI_CONSUMPTIONS: 'taco-tracker-multi-consumptions'
};

export class TacoStorage {
	static getSessions(): TacoSession[] {
		if (!browser) return [];
		try {
			const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
			return data ? JSON.parse(data) : [];
		} catch {
			return [];
		}
	}

	static saveSession(session: TacoSession): void {
		if (!browser) return;
		try {
			const sessions = this.getSessions();
			const existingIndex = sessions.findIndex((s) => s.id === session.id);

			if (existingIndex >= 0) {
				sessions[existingIndex] = session;
			} else {
				sessions.push(session);
			}

			localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
		} catch (error) {
			console.error('Failed to save session:', error);
		}
	}

	static deleteSession(sessionId: string): void {
		if (!browser) return;
		try {
			const sessions = this.getSessions().filter((s) => s.id !== sessionId);
			localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
		} catch (error) {
			console.error('Failed to delete session:', error);
		}
	}

	static getConsumptions(): TacoConsumption[] {
		if (!browser) return [];
		try {
			const data = localStorage.getItem(STORAGE_KEYS.CONSUMPTIONS);
			return data ? JSON.parse(data) : [];
		} catch {
			return [];
		}
	}

	static saveConsumption(consumption: TacoConsumption): void {
		if (!browser) return;
		try {
			const consumptions = this.getConsumptions();
			consumptions.push(consumption);
			localStorage.setItem(STORAGE_KEYS.CONSUMPTIONS, JSON.stringify(consumptions));
		} catch (error) {
			console.error('Failed to save consumption:', error);
		}
	}

	static deleteConsumption(consumptionId: string): void {
		if (!browser) return;
		try {
			const consumptions = this.getConsumptions().filter((c) => c.id !== consumptionId);
			localStorage.setItem(STORAGE_KEYS.CONSUMPTIONS, JSON.stringify(consumptions));
		} catch (error) {
			console.error('Failed to delete consumption:', error);
		}
	}

	static getConsumptionsByDate(date: string): TacoConsumption[] {
		return this.getConsumptions().filter((c) => c.date === date);
	}

	static getTotalTacosConsumed(): number {
		return this.getConsumptions().reduce((total, consumption) => total + consumption.quantity, 0);
	}

	static getFavoriteTacoType(): string {
		const consumptions = this.getConsumptions();
		const typeCount: Record<string, number> = {};

		consumptions.forEach((consumption) => {
			typeCount[consumption.tacoType.id] =
				(typeCount[consumption.tacoType.id] || 0) + consumption.quantity;
		});

		const favorite = Object.entries(typeCount).reduce(
			(max: { type: string; count: number }, [type, count]: [string, number]) =>
				count > max.count ? { type, count } : max,
			{ type: '', count: 0 }
		);

		return favorite.type;
	}

	static getMultiConsumptions(): MultiTacoConsumption[] {
		if (!browser) return [];
		try {
			const data = localStorage.getItem(STORAGE_KEYS.MULTI_CONSUMPTIONS);
			return data ? JSON.parse(data) : [];
		} catch {
			return [];
		}
	}

	static saveMultiConsumption(consumption: MultiTacoConsumption): void {
		if (!browser) return;
		try {
			const consumptions = this.getMultiConsumptions();
			consumptions.push(consumption);
			localStorage.setItem(STORAGE_KEYS.MULTI_CONSUMPTIONS, JSON.stringify(consumptions));
		} catch (error) {
			console.error('Failed to save multi-consumption:', error);
		}
	}

	static deleteMultiConsumption(consumptionId: string): void {
		if (!browser) return;
		try {
			const consumptions = this.getMultiConsumptions().filter((c) => c.id !== consumptionId);
			localStorage.setItem(STORAGE_KEYS.MULTI_CONSUMPTIONS, JSON.stringify(consumptions));
		} catch (error) {
			console.error('Failed to delete multi-consumption:', error);
		}
	}

	static getMultiConsumptionsByDate(date: string): MultiTacoConsumption[] {
		return this.getMultiConsumptions().filter((c) => c.date === date);
	}

	static getLeaderboard(): Array<{ name: string; totalTacos: number; sessions: number }> {
		const multiConsumptions = this.getMultiConsumptions();
		const leaderboard: Record<string, { totalTacos: number; sessions: number }> = {};

		multiConsumptions.forEach((consumption) => {
			if (!leaderboard[consumption.personName]) {
				leaderboard[consumption.personName] = { totalTacos: 0, sessions: 0 };
			}
			leaderboard[consumption.personName].totalTacos += consumption.totalTacos;
			leaderboard[consumption.personName].sessions += 1;
		});

		return Object.entries(leaderboard)
			.map(([name, stats]) => ({ name, ...stats }))
			.sort((a, b) => b.totalTacos - a.totalTacos);
	}
}
