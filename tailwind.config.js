/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				"weather-primary": "#1e90ff",
				"weather-secondary": "#00bfff",
			},
		},
		fontFamily: {
			Roboto: ["Roboto", "sans-serif"],
		},
		container: {
			padding: "2rem",
			center: true,
		},
		screens: {
			sm: "640px",
			md: "768px",
		},
	},
	plugins: [],
};
