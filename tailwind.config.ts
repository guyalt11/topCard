
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				// Utility colors
				border: 'var(--border)',
				input: 'var(--input)',
				ring: 'var(--ring)',

				// Core 7 colors
				background: 'var(--background)',
				foreground: 'var(--foreground)',
				light: {
					DEFAULT: 'var(--light)',
					foreground: 'var(--light-foreground)'
				},
				primary: {
					DEFAULT: 'var(--primary)',
					foreground: 'var(--primary-foreground)'
				},
				secondary: {
					DEFAULT: 'var(--secondary)',
					foreground: 'var(--secondary-foreground)'
				},
				treitary: {
					DEFAULT: 'var(--treitary)',
					foreground: 'var(--treitary-foreground)'
				},
				danger: {
					DEFAULT: 'var(--danger)',
					foreground: 'var(--danger-foreground)'
				},
				destructive: {
					DEFAULT: 'var(--danger)',
					foreground: 'var(--danger-foreground)'
				},
				dark: {
					DEFAULT: 'var(--dark)',
					foreground: 'var(--dark-foreground)'
				},

				// Additional utility colors
				difficulty: {
					hard: 'var(--difficulty-hard)',
					ok: 'var(--difficulty-ok)',
					good: 'var(--difficulty-good)',
					perfect: 'var(--difficulty-perfect)'
				},
				gender: {
					male: 'var(--gender-male)',
					female: 'var(--gender-female)',
					neuter: 'var(--gender-neuter)',
					common: 'var(--gender-common)'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			transformOrigin: {
				"3d": "50% 50% 0",
			},
			transform: {
				"3d": "perspective(1000px)",
			},
			rotate: {
				"y-180": "rotateY(180deg)",
			},
			perspective: {
				"1000": "1000px",
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'flip': {
					'0%': {
						transform: 'rotateY(0deg)',
						opacity: '1'
					},
					'50%': {
						transform: 'rotateY(90deg)',
						opacity: '0.5'
					},
					'100%': {
						transform: 'rotateY(0deg)',
						opacity: '1'
					}
				},
				'caret-blink': {
					'0%,70%,100%': { opacity: '1' },
					'20%,50%': { opacity: '0' },
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'flip': 'flip 0.5s ease-out',
				'caret-blink': 'caret-blink 1.25s ease-out infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
