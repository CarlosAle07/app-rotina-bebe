// Sistema de internacionalização (i18n)

export type Language = 'pt-BR' | 'en-US' | 'es-ES';

export interface Translations {
  [key: string]: string | Translations;
}

const translations: Record<Language, Translations> = {
  'pt-BR': {
    app: {
      name: 'BabyFlow',
      tagline: 'Acompanhe o desenvolvimento do seu bebê',
    },
    auth: {
      login: 'Entrar',
      signup: 'Cadastrar',
      logout: 'Sair',
      email: 'Email',
      password: 'Senha',
      continueWithGoogle: 'Continuar com Google',
      continueWithFacebook: 'Continuar com Facebook',
    },
    tabs: {
      home: 'Início',
      dashboard: 'Dashboard',
      history: 'Histórico',
      settings: 'Ajustes',
    },
    events: {
      sleep: 'Dormiu',
      wake: 'Acordou',
      feeding: 'Mamada',
      diaper: 'Fralda',
      cry: 'Choro',
      vaccine: 'Vacina',
    },
    premium: {
      title: 'Desbloqueie o Premium',
      monthly: 'Mensal',
      quarterly: 'Trimestral',
      yearly: 'Anual',
      upgrade: 'Fazer Upgrade',
    },
    notifications: {
      feedingReminder: 'Hora da mamada',
      sleepReminder: 'Hora do soninho',
      diaperReminder: 'Verificar fralda',
    },
  },
  'en-US': {
    app: {
      name: 'BabyFlow',
      tagline: 'Track your baby\'s development',
    },
    auth: {
      login: 'Login',
      signup: 'Sign Up',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      continueWithGoogle: 'Continue with Google',
      continueWithFacebook: 'Continue with Facebook',
    },
    tabs: {
      home: 'Home',
      dashboard: 'Dashboard',
      history: 'History',
      settings: 'Settings',
    },
    events: {
      sleep: 'Sleep',
      wake: 'Wake',
      feeding: 'Feeding',
      diaper: 'Diaper',
      cry: 'Cry',
      vaccine: 'Vaccine',
    },
    premium: {
      title: 'Unlock Premium',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly',
      upgrade: 'Upgrade',
    },
    notifications: {
      feedingReminder: 'Feeding time',
      sleepReminder: 'Nap time',
      diaperReminder: 'Check diaper',
    },
  },
  'es-ES': {
    app: {
      name: 'BabyFlow',
      tagline: 'Sigue el desarrollo de tu bebé',
    },
    auth: {
      login: 'Iniciar sesión',
      signup: 'Registrarse',
      logout: 'Cerrar sesión',
      email: 'Correo',
      password: 'Contraseña',
      continueWithGoogle: 'Continuar con Google',
      continueWithFacebook: 'Continuar con Facebook',
    },
    tabs: {
      home: 'Inicio',
      dashboard: 'Panel',
      history: 'Historial',
      settings: 'Ajustes',
    },
    events: {
      sleep: 'Durmió',
      wake: 'Despertó',
      feeding: 'Alimentación',
      diaper: 'Pañal',
      cry: 'Llanto',
      vaccine: 'Vacuna',
    },
    premium: {
      title: 'Desbloquear Premium',
      monthly: 'Mensual',
      quarterly: 'Trimestral',
      yearly: 'Anual',
      upgrade: 'Mejorar',
    },
    notifications: {
      feedingReminder: 'Hora de alimentar',
      sleepReminder: 'Hora de dormir',
      diaperReminder: 'Revisar pañal',
    },
  },
};

// Obter idioma atual
export function getCurrentLanguage(): Language {
  if (typeof window === 'undefined') return 'pt-BR';
  
  const saved = localStorage.getItem('babyflow_language');
  if (saved && isValidLanguage(saved)) {
    return saved as Language;
  }
  
  // Detectar idioma do navegador
  const browserLang = navigator.language;
  if (browserLang.startsWith('pt')) return 'pt-BR';
  if (browserLang.startsWith('es')) return 'es-ES';
  return 'en-US';
}

function isValidLanguage(lang: string): boolean {
  return ['pt-BR', 'en-US', 'es-ES'].includes(lang);
}

// Definir idioma
export function setLanguage(language: Language): void {
  localStorage.setItem('babyflow_language', language);
}

// Obter tradução
export function t(key: string, language?: Language): string {
  const lang = language || getCurrentLanguage();
  const keys = key.split('.');
  
  let value: any = translations[lang];
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key; // Retornar chave se não encontrar tradução
    }
  }
  
  return typeof value === 'string' ? value : key;
}

// Hook para usar traduções (para React)
export function useTranslation() {
  const language = getCurrentLanguage();
  
  return {
    t: (key: string) => t(key, language),
    language,
    setLanguage,
  };
}
