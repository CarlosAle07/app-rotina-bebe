// Tipos para o app de rotina do bebê

export interface Baby {
  name: string;
  birthDate: string;
  gender: 'masculino' | 'feminino' | 'outro';
  weight?: number;
  height?: number;
  recentVaccine?: {
    taken: boolean;
    name?: string;
    date?: string;
  };
}

export type EventType = 
  | 'dormiu' 
  | 'acordou' 
  | 'mamada' 
  | 'choro' 
  | 'fralda' 
  | 'vacina' 
  | 'observacao';

export interface BabyEvent {
  id: string;
  type: EventType;
  timestamp: string;
  notes?: string;
}

export interface AppSettings {
  notifications: {
    enabled: boolean;
    feedingInterval?: number; // em minutos
    sleepInterval?: number; // em minutos
  };
}

// Sistema de assinatura
export type SubscriptionPlan = 'free' | 'premium';

export interface Subscription {
  plan: SubscriptionPlan;
  startDate?: string;
  expiryDate?: string;
}

export interface PlanFeatures {
  maxDailyEvents: number;
  historicoDays: number;
  exportData: boolean;
  analytics: boolean;
  multipleChildren: boolean;
  cloudSync: boolean;
  customReminders: boolean;
  growthCharts: boolean;
}

export const PLAN_FEATURES: Record<SubscriptionPlan, PlanFeatures> = {
  free: {
    maxDailyEvents: 10,
    historicoDays: 7,
    exportData: false,
    analytics: false,
    multipleChildren: false,
    cloudSync: false,
    customReminders: false,
    growthCharts: false,
  },
  premium: {
    maxDailyEvents: Infinity,
    historicoDays: Infinity,
    exportData: true,
    analytics: true,
    multipleChildren: true,
    cloudSync: true,
    customReminders: true,
    growthCharts: true,
  },
};
