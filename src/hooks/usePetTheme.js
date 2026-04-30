const THEMES = {
  dog: {
    primary: '#F59E0B',
    secondary: '#92400E',
    glow: 'rgba(245, 158, 11, 0.4)',
    name: 'Canino',
    gradient: 'linear-gradient(135deg, #F59E0B, #92400E)',
  },
  cat: {
    primary: '#7C3AED',
    secondary: '#94A3B8',
    glow: 'rgba(124, 58, 237, 0.4)',
    name: 'Felino',
    gradient: 'linear-gradient(135deg, #7C3AED, #94A3B8)',
  },
  rabbit: {
    primary: '#EC4899',
    secondary: '#34D399',
    glow: 'rgba(236, 72, 153, 0.4)',
    name: 'Lagomorfo',
    gradient: 'linear-gradient(135deg, #EC4899, #34D399)',
  },
  bird: {
    primary: '#06B6D4',
    secondary: '#F87171',
    glow: 'rgba(6, 182, 212, 0.4)',
    name: 'Ave',
    gradient: 'linear-gradient(135deg, #06B6D4, #F87171)',
  },
  reptile: {
    primary: '#059669',
    secondary: '#1F2937',
    glow: 'rgba(5, 150, 105, 0.4)',
    name: 'Reptil',
    gradient: 'linear-gradient(135deg, #059669, #374151)',
  },
  fish: {
    primary: '#1D4ED8',
    secondary: '#22D3EE',
    glow: 'rgba(29, 78, 216, 0.4)',
    name: 'Pez',
    gradient: 'linear-gradient(135deg, #1D4ED8, #22D3EE)',
  },
  hamster: {
    primary: '#EA580C',
    secondary: '#FEF3C7',
    glow: 'rgba(234, 88, 12, 0.4)',
    name: 'Roedor',
    gradient: 'linear-gradient(135deg, #EA580C, #F97316)',
  },
  other: {
    primary: '#7C3AED',
    secondary: '#8B5CF6',
    glow: 'rgba(124, 58, 237, 0.4)',
    name: 'Otro',
    gradient: 'linear-gradient(135deg, #7C3AED, #8B5CF6)',
  },
}

export function usePetTheme(species) {
  const theme = THEMES[species] || THEMES.other

  const apply = () => {
    document.documentElement.style.setProperty('--pet-primary', theme.primary)
    document.documentElement.style.setProperty('--pet-secondary', theme.secondary)
    document.documentElement.style.setProperty('--pet-glow', theme.glow)
  }

  return { ...theme, apply, themes: THEMES }
}
