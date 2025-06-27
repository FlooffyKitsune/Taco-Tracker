/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				'taco-orange': '#3b82f6', // Blue
				'taco-red': '#a855f7',    // Purple  
				'taco-yellow': '#14b8a6'  // Teal
			}
		}
	},
	plugins: []
};
