export interface TacoType {
	id: string;
	name: string;
	emoji: string;
	color: string;
}

export interface TacoOrder {
	type: TacoType;
	quantity: number;
}

export interface OrderResult {
	totalTacos: number;
	orders: TacoOrder[];
}

export interface TacoConsumption {
	id: string;
	date: string;
	personName: string;
	tacoType: TacoType;
	quantity: number;
}

export interface TacoConsumptionEntry {
	tacoType: TacoType;
	quantity: number;
}

export interface MultiTacoConsumption {
	id: string;
	date: string;
	personName: string;
	entries: TacoConsumptionEntry[];
	totalTacos: number;
}

export interface TacoSession {
	id: string;
	date: string;
	peopleCount: number;
	orders: TacoOrder[];
	consumptions: TacoConsumption[];
}

// New user-focused types
export interface User {
	id: string;
	name: string | null;
	email: string | null;
	image: string | null;
	discordId: string | null;
	username: string | null;
	globalName: string | null;
	totalTacosEaten: number;
	totalTacoSessions: number;
	joinedAt: Date;
	lastActiveAt: Date;
}

export interface Achievement {
	id: string;
	name: string;
	description: string;
	emoji: string;
	category: string;
	points: number;
	isHidden: boolean;
}

export interface UserAchievement {
	id: string;
	userId: string;
	achievementId: string;
	unlockedAt: Date;
	achievement: Achievement;
}

export interface TacoSessionWithParticipants {
	id: string;
	date: Date;
	totalTacos: number;
	isActive: boolean;
	createdBy: User;
	participants: Array<{
		user: User;
		tacosOrdered: number;
		tacosConsumed: number;
		joinedAt: Date;
	}>;
	orders: Array<{
		id: string;
		tacoType: TacoType;
		quantity: number;
		orderedAt: Date;
	}>;
}
