
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
			/* ===========================================
			   CONFIGURACIÓN SISTEMA CAPITTAL
			   =========================================== */
			fontFamily: {
				sans: ['Manrope', 'system-ui', 'sans-serif'],
				manrope: ['Manrope', 'system-ui', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				// Border-radius consistente CAPITTAL 10px
				lg: '10px',
				md: '10px',
				sm: '10px',
				capittal: '10px',
			},
			borderWidth: {
				// Borde estándar CAPITTAL 0.5px
				'0.5': '0.5px',
				'capittal': '0.5px',
			},
			boxShadow: {
				// Sombras CAPITTAL
				'capittal-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
				'capittal-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
			},
			keyframes: {
				// Animaciones estándar Tailwind
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
				// Animaciones CAPITTAL
				'fade-in-capittal': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in-capittal': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'hover-lift-capittal': {
					'0%': {
						transform: 'translateY(0)'
					},
					'100%': {
						transform: 'translateY(-2px)'
					}
				}
			},
			animation: {
				// Animaciones estándar
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				// Animaciones CAPITTAL
				'fade-in-capittal': 'fade-in-capittal 0.3s ease-out',
				'scale-in-capittal': 'scale-in-capittal 0.2s ease-out',
				'hover-lift-capittal': 'hover-lift-capittal 0.2s ease-out',
			},
			transitionDuration: {
				// Duraciones estándar CAPITTAL
				'capittal': '200ms',
				'capittal-slow': '300ms',
			},
			transitionTimingFunction: {
				// Easing estándar CAPITTAL
				'capittal': 'cubic-bezier(0.4, 0, 0.2, 1)', // ease-out
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		// Plugin personalizado para utilidades CAPITTAL
		function({ addUtilities }: any) {
			const newUtilities = {
				// Utilidades de borde CAPITTAL
				'.border-capittal': {
					'border-width': '0.5px',
					'border-color': 'hsl(var(--border))',
				},
				// Utilidades de radius CAPITTAL
				'.rounded-capittal': {
					'border-radius': '10px',
				},
				// Utilidades de sombra CAPITTAL
				'.shadow-capittal': {
					'box-shadow': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
				},
				'.shadow-capittal-lg': {
					'box-shadow': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
				},
				// Efectos hover CAPITTAL
				'.hover-lift': {
					'transition': 'transform 200ms ease-out, box-shadow 200ms ease-out',
					'&:hover': {
						'transform': 'translateY(-2px)',
						'box-shadow': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
					}
				},
				// Transiciones estándar CAPITTAL
				'.transition-capittal': {
					'transition': 'all 200ms ease-out',
				},
				'.transition-capittal-slow': {
					'transition': 'all 300ms ease-out',
				}
			}
			addUtilities(newUtilities)
		}
	],
} satisfies Config;
