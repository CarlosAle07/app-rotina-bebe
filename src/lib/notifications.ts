// Sistema de notificações push
// Em produção, integrar com Firebase Cloud Messaging ou OneSignal

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'reminder' | 'insight' | 'achievement' | 'alert';
  timestamp: string;
  read: boolean;
  data?: Record<string, any>;
}

export interface NotificationSettings {
  enabled: boolean;
  feedingReminders: boolean;
  sleepReminders: boolean;
  diaperReminders: boolean;
  insightNotifications: boolean;
  achievementNotifications: boolean;
}

// Obter configurações de notificação
export function getNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') return getDefaultSettings();
  
  const settingsStr = localStorage.getItem('babyflow_notification_settings');
  if (!settingsStr) return getDefaultSettings();
  
  try {
    return JSON.parse(settingsStr);
  } catch {
    return getDefaultSettings();
  }
}

function getDefaultSettings(): NotificationSettings {
  return {
    enabled: true,
    feedingReminders: true,
    sleepReminders: true,
    diaperReminders: true,
    insightNotifications: true,
    achievementNotifications: true,
  };
}

// Salvar configurações
export function saveNotificationSettings(settings: NotificationSettings): void {
  localStorage.setItem('babyflow_notification_settings', JSON.stringify(settings));
}

// Solicitar permissão para notificações
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('Notificações não suportadas neste navegador');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// Enviar notificação local
export function sendLocalNotification(title: string, body: string, type: 'reminder' | 'insight' | 'achievement' | 'alert' = 'reminder'): void {
  const settings = getNotificationSettings();
  
  if (!settings.enabled) return;
  
  // Verificar se tipo de notificação está habilitado
  if (type === 'reminder' && !settings.feedingReminders && !settings.sleepReminders && !settings.diaperReminders) return;
  if (type === 'insight' && !settings.insightNotifications) return;
  if (type === 'achievement' && !settings.achievementNotifications) return;

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: type,
    });
  }
  
  // Salvar no histórico
  saveNotificationToHistory({
    id: Math.random().toString(36).substr(2, 9),
    title,
    body,
    type,
    timestamp: new Date().toISOString(),
    read: false,
  });
}

// Salvar notificação no histórico
function saveNotificationToHistory(notification: Notification): void {
  const history = getNotificationHistory();
  history.unshift(notification);
  
  // Manter apenas últimas 50 notificações
  const trimmed = history.slice(0, 50);
  localStorage.setItem('babyflow_notifications', JSON.stringify(trimmed));
}

// Obter histórico de notificações
export function getNotificationHistory(): Notification[] {
  if (typeof window === 'undefined') return [];
  
  const historyStr = localStorage.getItem('babyflow_notifications');
  if (!historyStr) return [];
  
  try {
    return JSON.parse(historyStr);
  } catch {
    return [];
  }
}

// Marcar notificação como lida
export function markNotificationAsRead(id: string): void {
  const history = getNotificationHistory();
  const updated = history.map(n => n.id === id ? { ...n, read: true } : n);
  localStorage.setItem('babyflow_notifications', JSON.stringify(updated));
}

// Marcar todas como lidas
export function markAllNotificationsAsRead(): void {
  const history = getNotificationHistory();
  const updated = history.map(n => ({ ...n, read: true }));
  localStorage.setItem('babyflow_notifications', JSON.stringify(updated));
}

// Agendar lembrete
export function scheduleReminder(type: 'feeding' | 'sleep' | 'diaper', delayMinutes: number): void {
  const settings = getNotificationSettings();
  if (!settings.enabled) return;
  
  const messages = {
    feeding: {
      title: '🍼 Hora da mamada',
      body: 'Já faz um tempo desde a última alimentação. Verifique se o bebê está com fome.',
    },
    sleep: {
      title: '😴 Hora do soninho',
      body: 'Pode ser um bom momento para colocar o bebê para dormir.',
    },
    diaper: {
      title: '🧷 Verificar fralda',
      body: 'Lembre-se de verificar se a fralda precisa ser trocada.',
    },
  };

  setTimeout(() => {
    const message = messages[type];
    sendLocalNotification(message.title, message.body, 'reminder');
  }, delayMinutes * 60 * 1000);
}

// Enviar insight automático
export function sendInsightNotification(insight: string): void {
  sendLocalNotification('💡 Novo insight', insight, 'insight');
}

// Enviar conquista
export function sendAchievementNotification(achievement: string): void {
  sendLocalNotification('🏆 Conquista desbloqueada!', achievement, 'achievement');
}
