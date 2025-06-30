// Client-safe utility functions for achievements
export function getCategoryColor(category: string): string {
	switch (category) {
		case 'consumption':
			return 'bg-orange-100 text-orange-800';
		case 'social':
			return 'bg-blue-100 text-blue-800';
		case 'streak':
			return 'bg-green-100 text-green-800';
		case 'special':
			return 'bg-purple-100 text-purple-800';
		default:
			return 'bg-gray-100 text-gray-800';
	}
}

export function getPointsColor(points: number): string {
	if (points >= 500) return 'text-purple-600';
	if (points >= 200) return 'text-yellow-600';
	if (points >= 100) return 'text-green-600';
	if (points >= 50) return 'text-blue-600';
	return 'text-gray-600';
}
