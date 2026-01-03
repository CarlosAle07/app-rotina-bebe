// Sistema de gamificação e conquistas

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number;
  target: number;
}

export interface UserStats {
  totalEvents: number;
  daysActive: number;
  currentStreak: number;
  longestStreak: number;
  achievements: Achievement[];
  level: number;
  xp: number;
}

// Conquistas disponíveis
const ACHIEVEMENTS: Omit<Achievement, 'unlockedAt' | 'progress'>[] = [
  {
    id: 'first_event',
    title: 'Primeiro Registro',
    description: 'Registre sua primeira atividade',
    icon: '🎯',
    target: 1,
  },
  {
    id: 'week_streak',
    title: 'Uma Semana Forte',
    description: 'Use o app por 7 dias seguidos',
    icon: '🔥',
    target: 7,
  },
  {
    id: 'month_streak',
    title: 'Mês Dedicado',
    description: 'Use o app por 30 dias seguidos',
    icon: '💪',
    target: 30,
  },
  {
    id: 'hundred_events',
    title: 'Centenário',
    description: 'Registre 100 atividades',
    icon: '💯',
    target: 100,
  },
  {
    id: 'sleep_master',
    title: 'Mestre do Sono',
    description: 'Registre 50 eventos de sono',
    icon: '😴',
    target: 50,
  },
  {
    id: 'feeding_pro',
    title: 'Pro da Alimentação',
    description: 'Registre 100 mamadas',
    icon: '🍼',
    target: 100,
  },
  {
    id: 'diaper_champion',
    title: 'Campeão das Fraldas',
    description: 'Registre 200 trocas de fralda',
    icon: '🧷',
    target: 200,
  },
  {
    id: 'premium_user',
    title: 'Usuário Premium',
    description: 'Assine o plano Premium',
    icon: '👑',
    target: 1,
  },
];

// Obter estatísticas do usuário
export function getUserStats(): UserStats {
  if (typeof window === 'undefined') return getDefaultStats();
  
  const statsStr = localStorage.getItem('babyflow_user_stats');
  if (!statsStr) return getDefaultStats();
  
  try {
    return JSON.parse(statsStr);
  } catch {
    return getDefaultStats();
  }
}

function getDefaultStats(): UserStats {
  return {
    totalEvents: 0,
    daysActive: 0,
    currentStreak: 0,
    longestStreak: 0,
    achievements: ACHIEVEMENTS.map(a => ({ ...a, progress: 0 })),
    level: 1,
    xp: 0,
  };
}

// Salvar estatísticas
function saveUserStats(stats: UserStats): void {
  localStorage.setItem('babyflow_user_stats', JSON.stringify(stats));
}

// Adicionar XP
export function addXP(amount: number): { levelUp: boolean; newLevel: number } {
  const stats = getUserStats();
  stats.xp += amount;
  
  // Calcular nível (100 XP por nível)
  const newLevel = Math.floor(stats.xp / 100) + 1;
  const levelUp = newLevel > stats.level;
  
  if (levelUp) {
    stats.level = newLevel;
  }
  
  saveUserStats(stats);
  return { levelUp, newLevel };
}

// Registrar evento (para gamificação)
export function trackEvent(eventType: string): Achievement[] {
  const stats = getUserStats();
  stats.totalEvents++;
  
  // Adicionar XP por evento
  const xpResult = addXP(5);
  
  // Atualizar streak
  updateStreak(stats);
  
  // Verificar conquistas
  const newAchievements = checkAchievements(stats, eventType);
  
  saveUserStats(stats);
  return newAchievements;
}

// Atualizar streak
function updateStreak(stats: UserStats): void {
  const today = new Date().toDateString();
  const lastActive = localStorage.getItem('babyflow_last_active');
  
  if (lastActive) {
    const lastDate = new Date(lastActive);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastDate.toDateString() === yesterday.toDateString()) {
      // Continuou o streak
      stats.currentStreak++;
    } else if (lastDate.toDateString() !== today) {
      // Quebrou o streak
      stats.currentStreak = 1;
    }
  } else {
    stats.currentStreak = 1;
  }
  
  if (stats.currentStreak > stats.longestStreak) {
    stats.longestStreak = stats.currentStreak;
  }
  
  localStorage.setItem('babyflow_last_active', today);
}

// Verificar conquistas
function checkAchievements(stats: UserStats, eventType: string): Achievement[] {
  const newAchievements: Achievement[] = [];
  
  stats.achievements = stats.achievements.map(achievement => {
    if (achievement.unlockedAt) return achievement; // Já desbloqueada
    
    let progress = achievement.progress;
    
    // Atualizar progresso baseado no tipo
    switch (achievement.id) {
      case 'first_event':
        progress = stats.totalEvents >= 1 ? 1 : 0;
        break;
      case 'week_streak':
        progress = stats.currentStreak;
        break;
      case 'month_streak':
        progress = stats.currentStreak;
        break;
      case 'hundred_events':
        progress = stats.totalEvents;
        break;
      case 'sleep_master':
        // Contar eventos de sono (implementar contagem específica)
        break;
      case 'feeding_pro':
        // Contar mamadas (implementar contagem específica)
        break;
      case 'diaper_champion':
        // Contar fraldas (implementar contagem específica)
        break;
    }
    
    // Verificar se desbloqueou
    if (progress >= achievement.target && !achievement.unlockedAt) {
      const unlocked = {
        ...achievement,
        progress,
        unlockedAt: new Date().toISOString(),
      };
      newAchievements.push(unlocked);
      return unlocked;
    }
    
    return { ...achievement, progress };
  });
  
  return newAchievements;
}

// Desbloquear conquista premium
export function unlockPremiumAchievement(): void {
  const stats = getUserStats();
  stats.achievements = stats.achievements.map(a => {
    if (a.id === 'premium_user' && !a.unlockedAt) {
      return {
        ...a,
        progress: 1,
        unlockedAt: new Date().toISOString(),
      };
    }
    return a;
  });
  saveUserStats(stats);
}

// Obter conquistas desbloqueadas
export function getUnlockedAchievements(): Achievement[] {
  const stats = getUserStats();
  return stats.achievements.filter(a => a.unlockedAt);
}

// Obter progresso geral
export function getOverallProgress(): number {
  const stats = getUserStats();
  const total = stats.achievements.length;
  const unlocked = stats.achievements.filter(a => a.unlockedAt).length;
  return Math.round((unlocked / total) * 100);
}
