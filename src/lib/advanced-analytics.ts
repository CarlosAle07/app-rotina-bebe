// Sistema de análise de dados avançada (Premium)

import { BabyEvent } from './types';

export interface AdvancedAnalytics {
  sleepTrends: SleepTrend[];
  feedingPatterns: FeedingPattern[];
  growthPredictions: GrowthPrediction[];
  behaviorInsights: BehaviorInsight[];
  recommendations: Recommendation[];
}

export interface SleepTrend {
  date: string;
  totalHours: number;
  napCount: number;
  quality: number; // 0-100
  nightWakings: number;
}

export interface FeedingPattern {
  timeOfDay: string;
  frequency: number;
  averageInterval: number; // minutos
  consistency: number; // 0-100
}

export interface GrowthPrediction {
  metric: 'weight' | 'height' | 'development';
  current: number;
  predicted: number;
  confidence: number; // 0-100
  timeframe: string;
}

export interface BehaviorInsight {
  type: 'sleep' | 'feeding' | 'mood' | 'development';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'success';
  actionable: boolean;
}

export interface Recommendation {
  category: 'sleep' | 'feeding' | 'routine' | 'health';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedImpact: string;
}

// Gerar análise avançada
export function generateAdvancedAnalytics(events: BabyEvent[]): AdvancedAnalytics {
  return {
    sleepTrends: analyzeSleepTrends(events),
    feedingPatterns: analyzeFeedingPatterns(events),
    growthPredictions: generateGrowthPredictions(events),
    behaviorInsights: generateBehaviorInsights(events),
    recommendations: generateRecommendations(events),
  };
}

// Analisar tendências de sono
function analyzeSleepTrends(events: BabyEvent[]): SleepTrend[] {
  const trends: SleepTrend[] = [];
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  
  // Agrupar por dia
  const dayGroups = new Map<string, BabyEvent[]>();
  events
    .filter(e => new Date(e.timestamp) >= last30Days)
    .forEach(event => {
      const day = new Date(event.timestamp).toDateString();
      if (!dayGroups.has(day)) {
        dayGroups.set(day, []);
      }
      dayGroups.get(day)!.push(event);
    });
  
  // Calcular métricas por dia
  dayGroups.forEach((dayEvents, date) => {
    const sleepEvents = dayEvents.filter(e => e.type === 'dormiu' || e.type === 'acordou');
    let totalMinutes = 0;
    let napCount = 0;
    let nightWakings = 0;
    
    for (let i = 0; i < sleepEvents.length - 1; i++) {
      if (sleepEvents[i].type === 'dormiu' && sleepEvents[i + 1].type === 'acordou') {
        const start = new Date(sleepEvents[i].timestamp);
        const end = new Date(sleepEvents[i + 1].timestamp);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60);
        totalMinutes += duration;
        napCount++;
        
        // Detectar acordadas noturnas (entre 22h e 6h)
        const hour = start.getHours();
        if (hour >= 22 || hour < 6) {
          nightWakings++;
        }
      }
    }
    
    const totalHours = totalMinutes / 60;
    const quality = calculateSleepQuality(totalHours, napCount, nightWakings);
    
    trends.push({
      date,
      totalHours,
      napCount,
      quality,
      nightWakings,
    });
  });
  
  return trends.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function calculateSleepQuality(hours: number, naps: number, wakings: number): number {
  let quality = 50; // Base
  
  // Horas de sono (ideal: 12-16h)
  if (hours >= 12 && hours <= 16) quality += 30;
  else if (hours >= 10 && hours < 12) quality += 15;
  else if (hours < 10) quality -= 20;
  
  // Número de sonecas (ideal: 3-4)
  if (naps >= 3 && naps <= 4) quality += 10;
  else if (naps < 2) quality -= 10;
  
  // Acordadas noturnas (menos é melhor)
  quality -= wakings * 10;
  
  return Math.max(0, Math.min(100, quality));
}

// Analisar padrões de alimentação
function analyzeFeedingPatterns(events: BabyEvent[]): FeedingPattern[] {
  const patterns: FeedingPattern[] = [];
  const feedingEvents = events.filter(e => e.type === 'mamada');
  
  // Agrupar por período do dia
  const periods = {
    'Madrugada (0-6h)': { events: [] as BabyEvent[], intervals: [] as number[] },
    'Manhã (6-12h)': { events: [] as BabyEvent[], intervals: [] as number[] },
    'Tarde (12-18h)': { events: [] as BabyEvent[], intervals: [] as number[] },
    'Noite (18-24h)': { events: [] as BabyEvent[], intervals: [] as number[] },
  };
  
  feedingEvents.forEach(event => {
    const hour = new Date(event.timestamp).getHours();
    if (hour >= 0 && hour < 6) periods['Madrugada (0-6h)'].events.push(event);
    else if (hour >= 6 && hour < 12) periods['Manhã (6-12h)'].events.push(event);
    else if (hour >= 12 && hour < 18) periods['Tarde (12-18h)'].events.push(event);
    else periods['Noite (18-24h)'].events.push(event);
  });
  
  // Calcular intervalos
  Object.entries(periods).forEach(([timeOfDay, data]) => {
    const sortedEvents = data.events.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const interval = (new Date(sortedEvents[i + 1].timestamp).getTime() - 
                       new Date(sortedEvents[i].timestamp).getTime()) / (1000 * 60);
      data.intervals.push(interval);
    }
    
    const frequency = data.events.length;
    const averageInterval = data.intervals.length > 0
      ? data.intervals.reduce((a, b) => a + b, 0) / data.intervals.length
      : 0;
    
    // Calcular consistência (menor desvio padrão = mais consistente)
    const consistency = calculateConsistency(data.intervals);
    
    patterns.push({
      timeOfDay,
      frequency,
      averageInterval,
      consistency,
    });
  });
  
  return patterns;
}

function calculateConsistency(intervals: number[]): number {
  if (intervals.length < 2) return 50;
  
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);
  
  // Converter desvio padrão em score de consistência (0-100)
  // Menor desvio = maior consistência
  const consistency = Math.max(0, 100 - (stdDev / mean) * 100);
  return Math.min(100, consistency);
}

// Gerar previsões de crescimento
function generateGrowthPredictions(events: BabyEvent[]): GrowthPrediction[] {
  // Simulação - em produção, usar ML real
  return [
    {
      metric: 'weight',
      current: 5.2,
      predicted: 5.8,
      confidence: 85,
      timeframe: '30 dias',
    },
    {
      metric: 'height',
      current: 52,
      predicted: 55,
      confidence: 80,
      timeframe: '30 dias',
    },
    {
      metric: 'development',
      current: 75,
      predicted: 85,
      confidence: 70,
      timeframe: '30 dias',
    },
  ];
}

// Gerar insights comportamentais
function generateBehaviorInsights(events: BabyEvent[]): BehaviorInsight[] {
  const insights: BehaviorInsight[] = [];
  const last7Days = events.filter(e => {
    const date = new Date(e.timestamp);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date >= weekAgo;
  });
  
  // Analisar padrão de choro
  const cryEvents = last7Days.filter(e => e.type === 'choro');
  if (cryEvents.length > 20) {
    insights.push({
      type: 'mood',
      title: 'Aumento no choro detectado',
      description: 'O bebê tem chorado mais que o normal nos últimos 7 dias. Pode indicar desconforto, cólicas ou necessidade de ajuste na rotina.',
      severity: 'warning',
      actionable: true,
    });
  }
  
  // Analisar sono
  const sleepEvents = last7Days.filter(e => e.type === 'dormiu' || e.type === 'acordou');
  if (sleepEvents.length < 14) {
    insights.push({
      type: 'sleep',
      title: 'Poucos registros de sono',
      description: 'Registre mais eventos de sono para obter análises mais precisas sobre o padrão de descanso do bebê.',
      severity: 'info',
      actionable: true,
    });
  }
  
  // Padrão positivo
  const feedingEvents = last7Days.filter(e => e.type === 'mamada');
  if (feedingEvents.length >= 42 && feedingEvents.length <= 56) {
    insights.push({
      type: 'feeding',
      title: 'Padrão de alimentação saudável',
      description: 'O bebê está se alimentando com frequência adequada (6-8x por dia). Continue mantendo essa rotina!',
      severity: 'success',
      actionable: false,
    });
  }
  
  return insights;
}

// Gerar recomendações personalizadas
function generateRecommendations(events: BabyEvent[]): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const last7Days = events.filter(e => {
    const date = new Date(e.timestamp);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date >= weekAgo;
  });
  
  // Recomendação de rotina de sono
  recommendations.push({
    category: 'sleep',
    title: 'Estabeleça uma rotina de sono consistente',
    description: 'Tente colocar o bebê para dormir no mesmo horário todos os dias. Isso ajuda a regular o relógio biológico e melhora a qualidade do sono.',
    priority: 'high',
    estimatedImpact: 'Melhora de 30-40% na qualidade do sono em 2 semanas',
  });
  
  // Recomendação de alimentação
  const feedingEvents = last7Days.filter(e => e.type === 'mamada');
  if (feedingEvents.length < 42) {
    recommendations.push({
      category: 'feeding',
      title: 'Aumente a frequência de alimentação',
      description: 'O bebê está se alimentando menos que o recomendado. Tente oferecer o peito/mamadeira a cada 2-3 horas durante o dia.',
      priority: 'high',
      estimatedImpact: 'Melhor ganho de peso e desenvolvimento',
    });
  }
  
  // Recomendação de rotina
  recommendations.push({
    category: 'routine',
    title: 'Crie rituais de transição',
    description: 'Estabeleça rituais antes de dormir (banho, massagem, música suave) para sinalizar ao bebê que é hora de descansar.',
    priority: 'medium',
    estimatedImpact: 'Redução de 20-30% no tempo para adormecer',
  });
  
  return recommendations;
}

// Exportar dados para PDF/Excel
export function exportData(events: BabyEvent[], format: 'pdf' | 'excel'): Blob {
  // Simulação - em produção, usar biblioteca real (jsPDF, xlsx)
  const data = JSON.stringify(events, null, 2);
  return new Blob([data], { type: format === 'pdf' ? 'application/pdf' : 'application/vnd.ms-excel' });
}
