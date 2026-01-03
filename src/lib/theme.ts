// Sistema de personalização de temas

export type ThemeColor = 'purple' | 'blue' | 'green' | 'pink' | 'orange';
export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeSettings {
  mode: ThemeMode;
  primaryColor: ThemeColor;
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
}

const THEME_COLORS = {
  purple: {
    primary: 'from-purple-600 via-pink-500 to-orange-400',
    light: 'from-purple-50 via-pink-50 to-orange-50',
    solid: 'bg-purple-600',
  },
  blue: {
    primary: 'from-blue-600 via-cyan-500 to-teal-400',
    light: 'from-blue-50 via-cyan-50 to-teal-50',
    solid: 'bg-blue-600',
  },
  green: {
    primary: 'from-green-600 via-emerald-500 to-teal-400',
    light: 'from-green-50 via-emerald-50 to-teal-50',
    solid: 'bg-green-600',
  },
  pink: {
    primary: 'from-pink-600 via-rose-500 to-red-400',
    light: 'from-pink-50 via-rose-50 to-red-50',
    solid: 'bg-pink-600',
  },
  orange: {
    primary: 'from-orange-600 via-amber-500 to-yellow-400',
    light: 'from-orange-50 via-amber-50 to-yellow-50',
    solid: 'bg-orange-600',
  },
};

// Obter configurações de tema
export function getThemeSettings(): ThemeSettings {
  if (typeof window === 'undefined') return getDefaultTheme();
  
  const settingsStr = localStorage.getItem('babyflow_theme_settings');
  if (!settingsStr) return getDefaultTheme();
  
  try {
    return JSON.parse(settingsStr);
  } catch {
    return getDefaultTheme();
  }
}

function getDefaultTheme(): ThemeSettings {
  return {
    mode: 'light',
    primaryColor: 'purple',
    fontSize: 'medium',
    reducedMotion: false,
  };
}

// Salvar configurações de tema
export function saveThemeSettings(settings: ThemeSettings): void {
  localStorage.setItem('babyflow_theme_settings', JSON.stringify(settings));
  applyTheme(settings);
}

// Aplicar tema
export function applyTheme(settings: ThemeSettings): void {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  // Aplicar modo (dark/light)
  if (settings.mode === 'dark') {
    root.classList.add('dark');
  } else if (settings.mode === 'light') {
    root.classList.remove('dark');
  } else {
    // Auto - seguir preferência do sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
  
  // Aplicar tamanho de fonte
  root.style.fontSize = settings.fontSize === 'small' ? '14px' : settings.fontSize === 'large' ? '18px' : '16px';
  
  // Aplicar redução de movimento
  if (settings.reducedMotion) {
    root.style.setProperty('--transition-duration', '0ms');
  } else {
    root.style.removeProperty('--transition-duration');
  }
}

// Obter classes de cor do tema
export function getThemeColors(color: ThemeColor = 'purple') {
  return THEME_COLORS[color];
}

// Inicializar tema
export function initializeTheme(): void {
  const settings = getThemeSettings();
  applyTheme(settings);
}
