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
