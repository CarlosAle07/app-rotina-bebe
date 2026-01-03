// Serviço de IA para análises e assistente inteligente

import { BabyEvent } from './types';

export interface SleepAnalysis {
  totalSleepHours: number;
  averageNapDuration: number;
  nightSleepQuality: 'excelente' | 'boa' | 'regular' | 'ruim';
  recommendations: string[];
  patterns: {
    bestSleepTime: string;
    worstSleepTime: string;
    napCount: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Análise de sono baseada nos últimos 7 dias
export function analyzeSleepPattern(events: BabyEvent[]): SleepAnalysis {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Filtrar eventos dos últimos 7 dias
  const recentEvents = events.filter(e => new Date(e.timestamp) >= sevenDaysAgo);
  
  // Calcular sono total
  const sleepEvents = recentEvents.filter(e => e.type === 'dormiu' || e.type === 'acordou');
  let totalSleepMinutes = 0;
  let napCount = 0;
  let napDurations: number[] = [];
  
  for (let i = 0; i < sleepEvents.length - 1; i++) {
    if (sleepEvents[i].type === 'dormiu' && sleepEvents[i + 1].type === 'acordou') {
      const start = new Date(sleepEvents[i].timestamp);
      const end = new Date(sleepEvents[i + 1].timestamp);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60);
      totalSleepMinutes += duration;
      napDurations.push(duration);
      napCount++;
    }
  }
  
  const totalSleepHours = totalSleepMinutes / 60;
  const averageNapDuration = napDurations.length > 0 
    ? napDurations.reduce((a, b) => a + b, 0) / napDurations.length 
    : 0;
  
  // Determinar qualidade do sono
  let nightSleepQuality: 'excelente' | 'boa' | 'regular' | 'ruim' = 'regular';
  const dailyAverage = totalSleepHours / 7;
  
  if (dailyAverage >= 14) nightSleepQuality = 'excelente';
  else if (dailyAverage >= 12) nightSleepQuality = 'boa';
  else if (dailyAverage >= 10) nightSleepQuality = 'regular';
  else nightSleepQuality = 'ruim';
  
  // Gerar recomendações
  const recommendations: string[] = [];
  
  if (dailyAverage < 12) {
    recommendations.push('Tente estabelecer uma rotina de sono mais consistente');
    recommendations.push('Crie um ambiente calmo e escuro para as sonecas');
  }
  
  if (napCount / 7 < 3) {
    recommendations.push('Considere adicionar mais sonecas durante o dia');
  }
  
  if (averageNapDuration < 30) {
    recommendations.push('Sonecas muito curtas podem indicar desconforto ou ambiente inadequado');
  }
  
  // Analisar últimas 24h para recomendações específicas
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recent24hEvents = events.filter(e => new Date(e.timestamp) >= last24h);
  
  const recentCries = recent24hEvents.filter(e => e.type === 'choro').length;
  const recentFeedings = recent24hEvents.filter(e => e.type === 'mamada').length;
  
  if (recentCries > 5) {
    recommendations.push('Muitos episódios de choro nas últimas 24h - verifique fome, fralda e conforto');
  }
  
  if (recentFeedings < 6) {
    recommendations.push('Certifique-se de que o bebê está se alimentando adequadamente');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Continue mantendo a rotina atual - está funcionando bem!');
    recommendations.push('Mantenha horários consistentes para dormir e acordar');
  }
  
  return {
    totalSleepHours,
    averageNapDuration,
    nightSleepQuality,
    recommendations,
    patterns: {
      bestSleepTime: '20:00 - 22:00',
      worstSleepTime: '14:00 - 16:00',
      napCount: Math.round(napCount / 7),
    },
  };
}

// Assistente inteligente com respostas contextuais
export async function chatWithAssistant(
  message: string,
  events: BabyEvent[],
  conversationHistory: ChatMessage[]
): Promise<string> {
  // Simular chamada à API de IA (OpenAI, Anthropic, etc)
  // Em produção, você faria uma chamada real à API
  
  const messageLower = message.toLowerCase();
  
  // Analisar contexto dos eventos recentes
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recentEvents = events.filter(e => new Date(e.timestamp) >= last24h);
  
  const recentCries = recentEvents.filter(e => e.type === 'choro').length;
  const recentFeedings = recentEvents.filter(e => e.type === 'mamada').length;
  const recentDiapers = recentEvents.filter(e => e.type === 'fralda').length;
  const lastFeeding = recentEvents.find(e => e.type === 'mamada');
  const lastDiaper = recentEvents.find(e => e.type === 'fralda');
  
  // Respostas contextuais baseadas em padrões
  if (messageLower.includes('choro') || messageLower.includes('chorando')) {
    let response = `Entendo sua preocupação. Nas últimas 24h, registrei ${recentCries} episódios de choro. `;
    
    if (lastFeeding) {
      const timeSinceFeeding = (now.getTime() - new Date(lastFeeding.timestamp).getTime()) / (1000 * 60);
      if (timeSinceFeeding > 180) {
        response += `A última mamada foi há ${Math.round(timeSinceFeeding / 60)} horas. O bebê pode estar com fome. `;
      }
    }
    
    if (lastDiaper) {
      const timeSinceDiaper = (now.getTime() - new Date(lastDiaper.timestamp).getTime()) / (1000 * 60);
      if (timeSinceDiaper > 180) {
        response += `A última troca de fralda foi há ${Math.round(timeSinceDiaper / 60)} horas. Verifique se precisa trocar. `;
      }
    }
    
    response += `\n\nAlgumas causas comuns de choro:\n`;
    response += `• Fome (mamadas a cada 2-3h são normais)\n`;
    response += `• Fralda suja ou molhada\n`;
    response += `• Desconforto (calor, frio, roupa apertada)\n`;
    response += `• Cansaço ou excesso de estímulos\n`;
    response += `• Cólicas (mais comum à noite)\n`;
    response += `• Necessidade de contato e carinho\n\n`;
    response += `Tente acalmar com movimentos suaves, sons brancos ou contato pele a pele.`;
    
    return response;
  }
  
  if (messageLower.includes('sono') || messageLower.includes('dormir')) {
    const analysis = analyzeSleepPattern(events);
    
    let response = `Analisando o padrão de sono dos últimos 7 dias:\n\n`;
    response += `📊 Sono total: ${analysis.totalSleepHours.toFixed(1)}h (média de ${(analysis.totalSleepHours / 7).toFixed(1)}h/dia)\n`;
    response += `😴 Qualidade: ${analysis.nightSleepQuality}\n`;
    response += `⏰ Sonecas por dia: ${analysis.patterns.napCount}\n\n`;
    response += `💡 Recomendações:\n`;
    analysis.recommendations.forEach((rec, i) => {
      response += `${i + 1}. ${rec}\n`;
    });
    
    return response;
  }
  
  if (messageLower.includes('alimenta') || messageLower.includes('mamada') || messageLower.includes('fome')) {
    let response = `Sobre alimentação:\n\n`;
    response += `📊 Nas últimas 24h: ${recentFeedings} mamadas\n\n`;
    
    if (recentFeedings < 6) {
      response += `⚠️ Isso está abaixo do recomendado. Recém-nascidos geralmente precisam de 8-12 mamadas por dia.\n\n`;
    } else if (recentFeedings > 12) {
      response += `✓ Frequência alta é normal nos primeiros meses - alimentação sob demanda.\n\n`;
    } else {
      response += `✓ Frequência adequada para a idade.\n\n`;
    }
    
    response += `Sinais de fome:\n`;
    response += `• Levar as mãos à boca\n`;
    response += `• Fazer movimentos de sucção\n`;
    response += `• Ficar inquieto\n`;
    response += `• Chorar (sinal tardio)\n\n`;
    response += `Dica: Não espere o choro para oferecer o peito/mamadeira.`;
    
    return response;
  }
  
  if (messageLower.includes('fralda') || messageLower.includes('cocô') || messageLower.includes('xixi')) {
    let response = `Sobre trocas de fralda:\n\n`;
    response += `📊 Nas últimas 24h: ${recentDiapers} trocas\n\n`;
    
    if (recentDiapers < 6) {
      response += `⚠️ Pode estar abaixo do esperado. Recém-nascidos geralmente precisam de 6-10 trocas por dia.\n\n`;
    }
    
    response += `Frequência normal:\n`;
    response += `• Recém-nascido: 8-10 fraldas/dia\n`;
    response += `• 1-3 meses: 6-8 fraldas/dia\n`;
    response += `• 3-6 meses: 5-7 fraldas/dia\n\n`;
    response += `⚠️ Sinais de alerta:\n`;
    response += `• Menos de 6 fraldas molhadas/dia\n`;
    response += `• Urina muito escura ou com cheiro forte\n`;
    response += `• Fezes com sangue ou muito líquidas\n`;
    response += `• Assaduras persistentes`;
    
    return response;
  }
  
  if (messageLower.includes('vacina')) {
    return `Sobre vacinas:\n\n` +
      `É normal que o bebê apresente:\n` +
      `• Febre leve (até 38°C)\n` +
      `• Irritabilidade\n` +
      `• Sonolência\n` +
      `• Vermelhidão no local da aplicação\n\n` +
      `Esses sintomas geralmente duram 24-48h.\n\n` +
      `⚠️ Procure atendimento se:\n` +
      `• Febre acima de 39°C\n` +
      `• Sintomas persistem por mais de 3 dias\n` +
      `• Bebê muito prostrado ou com dificuldade para respirar\n\n` +
      `Dica: Compressas frias no local e muito carinho ajudam!`;
  }
  
  // Resposta genérica
  return `Olá! Sou o assistente inteligente do BabyFlow. 👶\n\n` +
    `Posso ajudar com dúvidas sobre:\n` +
    `• Padrões de sono e rotina\n` +
    `• Alimentação e amamentação\n` +
    `• Choro e como acalmar\n` +
    `• Trocas de fralda\n` +
    `• Reações pós-vacina\n\n` +
    `Baseio minhas respostas nos registros do seu bebê para dar orientações personalizadas.\n\n` +
    `Como posso ajudar hoje?`;
}
