import type { TacoType, TacoOrder, OrderResult } from './types.js';

export const TACO_TYPES: TacoType[] = [
	{ id: 'chicken', name: 'Chicken', emoji: '🐔', color: 'bg-yellow-400' },
	{ id: 'carne-asada', name: 'Carne Asada', emoji: '🥩', color: 'bg-amber-600' },
	{ id: 'chorizo', name: 'Chorizo', emoji: '🌶️', color: 'bg-orange-500' },
	{ id: 'carnitas', name: 'Carnitas', emoji: '🐷', color: 'bg-pink-400' },
	{ id: 'fish', name: 'Fish', emoji: '🐟', color: 'bg-blue-400' },
	{ id: 'lengua', name: 'Lengua', emoji: '👅', color: 'bg-purple-500' },
	{ id: 'pastor', name: 'Pastor', emoji: '🍖', color: 'bg-red-600' },
	{ id: 'vegetariano', name: 'Vegetariano', emoji: '🥬', color: 'bg-green-400' },
	{ id: 'shrimp', name: 'Shrimp', emoji: '🍤', color: 'bg-pink-500' },
	{ id: 'capechano', name: 'Capechano', emoji: '🔥', color: 'bg-amber-600' },
	{ id: 'beyond', name: 'Beyond', emoji: '🌱', color: 'bg-emerald-500' },
	{ id: 'quesabirria', name: 'Quesabirria', emoji: '🧀', color: 'bg-yellow-600' }
];

export const DEFAULT_TACO_DISTRIBUTION = [
	{ typeId: 'chicken', ratio: 2 },
	{ typeId: 'carne-asada', ratio: 2 },
	{ typeId: 'chorizo', ratio: 1 }
];

export const BUY_2_GET_1_MULTIPLIER = 2 / 3; // For buy 2 get 1 free deal

export function calculateTacoOrder(
	peopleCount: number,
	customDistribution?: { typeId: string; ratio: number }[]
): OrderResult {
	const distribution = customDistribution || DEFAULT_TACO_DISTRIBUTION;
	const totalRatio = distribution.reduce((sum, item) => sum + item.ratio, 0);
	const tacosPerPerson = Math.ceil(totalRatio);
	const totalTacos = tacosPerPerson * peopleCount;

	// Calculate each taco type quantity
	const orders: TacoOrder[] = distribution.map((item) => {
		const tacoType = TACO_TYPES.find((t) => t.id === item.typeId)!;
		const quantity = (item.ratio / totalRatio) * totalTacos;
		return {
			type: tacoType,
			quantity: Math.round(quantity)
		};
	});

	// Adjust for buy 2 get 1 free (round up to nearest multiple of 3)
	const adjustedTotal = Math.ceil(totalTacos / 3) * 3;
	const adjustment = adjustedTotal - totalTacos;

	if (adjustment > 0) {
		// Add extra tacos to the most popular type
		const popularType = orders.reduce((prev, current) =>
			prev.quantity > current.quantity ? prev : current
		);
		popularType.quantity += adjustment;
	}

	return {
		totalTacos: adjustedTotal,
		orders
	};
}
