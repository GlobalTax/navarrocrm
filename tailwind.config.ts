
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
			fontFamily: {
				sans: ['General Sans', 'system-ui', 'sans-serif'],
			},
			fontSize: {
				// Micro texto (8px-10px) - Para timestamps, badges pequeños
				'micro': ['0.625rem', { lineHeight: '0.75rem', letterSpacing: '0.025em' }],
				'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
				
				// Texto base optimizado (12px-16px) - Para cuerpo de texto
				'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.015em' }],
				'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0.01em' }],
				'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0.005em' }],
				
				// Headers y títulos (18px-48px) - Para jerarquía clara
				'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '0em' }],
				'2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.015em' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }],
				'5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.035em' }],
				
				// Display sizes para dashboards (48px+)
				'6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.05em' }],
				'7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.05em' }],
				'8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.05em' }],
				'9xl': ['8rem', { lineHeight: '1', letterSpacing: '-0.05em' }],
			},
			fontWeight: {
				light: '300',
				normal: '300',
				medium: '500',
				semibold: '500',
				bold: '500',
				extrabold: '500',
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
				},
				academia: {
					DEFAULT: 'hsl(var(--academia-primary))',
					foreground: 'hsl(var(--academia-primary-foreground))',
					success: 'hsl(var(--academia-success))',
					'success-foreground': 'hsl(var(--academia-success-foreground))',
					'success-soft': 'hsl(var(--academia-success-soft))',
					warning: 'hsl(var(--academia-warning))',
					'warning-foreground': 'hsl(var(--academia-warning-foreground))',
					'warning-soft': 'hsl(var(--academia-warning-soft))',
					info: 'hsl(var(--academia-info))',
					'info-foreground': 'hsl(var(--academia-info-foreground))',
					'info-soft': 'hsl(var(--academia-info-soft))',
					error: 'hsl(var(--academia-error))',
					'error-foreground': 'hsl(var(--academia-error-foreground))',
					'error-soft': 'hsl(var(--academia-error-soft))',
					beginner: 'hsl(var(--academia-beginner))',
					'beginner-soft': 'hsl(var(--academia-beginner-soft))',
					intermediate: 'hsl(var(--academia-intermediate))',
					'intermediate-soft': 'hsl(var(--academia-intermediate-soft))',
					advanced: 'hsl(var(--academia-advanced))',
					'advanced-soft': 'hsl(var(--academia-advanced-soft))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
