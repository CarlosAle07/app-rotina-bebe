// Funções para gerenciar localStorage

import { Baby, BabyEvent, AppSettings } from './types';

const BABY_KEY = 'baby_tracker_baby';
const EVENTS_KEY = 'baby_tracker_events';
const SETTINGS_KEY = 'baby_tracker_settings';

// Baby
export const saveBaby = (baby: Baby): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(BABY_KEY, JSON.stringify(baby));
  }
};

export const getBaby = (): Baby | null => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(BABY_KEY);
    return data ? JSON.parse(data) : null;
  }
  return null;
};

export const deleteBaby = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(BABY_KEY);
  }
};

// Events
export const saveEvent = (event: BabyEvent): void => {
  if (typeof window !== 'undefined') {
    const events = getEvents();
    events.unshift(event); // Adiciona no início
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  }
};

export const getEvents = (): BabyEvent[] => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(EVENTS_KEY);
    return data ? JSON.parse(data) : [];
  }
  return [];
};

export const deleteAllEvents = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(EVENTS_KEY);
  }
};

export const deleteEvent = (id: string): void => {
  if (typeof window !== 'undefined') {
    const events = getEvents().filter(e => e.id !== id);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  }
};

// Settings
export const saveSettings = (settings: AppSettings): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
};

export const getSettings = (): AppSettings => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : {
      notifications: {
        enabled: false,
        feedingInterval: 180, // 3 horas
        sleepInterval: 120, // 2 horas
      }
    };
  }
  return {
    notifications: {
      enabled: false,
      feedingInterval: 180,
      sleepInterval: 120,
    }
  };
};

// Utilitários
export const exportData = (): string => {
  const baby = getBaby();
  const events = getEvents();
  const settings = getSettings();
  
  return JSON.stringify({
    baby,
    events,
    settings,
    exportDate: new Date().toISOString(),
  }, null, 2);
};
