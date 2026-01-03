'use client';

import { Card, CardContent } from '@/components/ui/card';
import { BabyEvent } from '@/lib/types';
import { Moon, Sun, Milk, Baby, TrendingUp, TrendingDown, Minus, Clock, Calendar, Zap } from 'lucide-react';

interface DashboardStatsProps {
  events: BabyEvent[];
  isPremium: boolean;
}

export default function DashboardStats({ events, isPremium }: DashboardStatsProps) {
  // Calcular estatísticas dos últimos 7 dias
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  
  const recentEvents = events.filter(e => new Date(e.timestamp) >= last7Days);
  
  // Calcular médias
  const calculateDailyAverage = (eventType: string) => {
    const eventsByDay: Record<string, number> = {};
    recentEvents
      .filter(e => e.type === eventType)
      .forEach(e => {
        const day = new Date(e.timestamp).toDateString();
        eventsByDay[day] = (eventsByDay[day] || 0) + 1;
      });
    
    const days = Object.keys(eventsByDay).length;
    const total = Object.values(eventsByDay).reduce((sum, count) => sum + count, 0);
    return days > 0 ? (total / days).toFixed(1) : '0';
  };

  // Calcular tempo médio de sono por dia
  const calculateAverageSleep = () => {
    const sleepByDay: Record<string, number> = {};
    
    const sleepEvents = recentEvents.filter(e => e.type === 'dormiu' || e.type === 'acordou');
    
    for (let i = 0; i < sleepEvents.length - 1; i++) {
      if (sleepEvents[i].type === 'dormiu' && sleepEvents[i + 1].type === 'acordou') {
        const start = new Date(sleepEvents[i].timestamp);
        const end = new Date(sleepEvents[i + 1].timestamp);
        const day = start.toDateString();
        const minutes = (end.getTime() - start.getTime()) / (1000 * 60);
        sleepByDay[day] = (sleepByDay[day] || 0) + minutes;
      }
    }
    
    const days = Object.keys(sleepByDay).length;
    const totalMinutes = Object.values(sleepByDay).reduce((sum, mins) => sum + mins, 0);
    const avgMinutes = days > 0 ? totalMinutes / days : 0;
    
    const hours = Math.floor(avgMinutes / 60);
    const minutes = Math.floor(avgMinutes % 60);
    return { hours, minutes, totalMinutes: avgMinutes };
  };

  // Calcular tendências (comparar últimos 3 dias com 4 dias anteriores)
  const calculateTrend = (eventType: string) => {
    const now = new Date();
    const last3Days = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recent = events.filter(e => 
      e.type === eventType && 
      new Date(e.timestamp) >= last3Days
    ).length;
    
    const previous = events.filter(e => 
      e.type === eventType && 
      new Date(e.timestamp) >= last7Days && 
      new Date(e.timestamp) < last3Days
    ).length;
    
    if (previous === 0) return 'stable';
    const change = ((recent - previous) / previous) * 100;
    
    if (change > 10) return 'up';
    if (change < -10) return 'down';
    return 'stable';
  };

  const avgFeedings = calculateDailyAverage('mamada');
  const avgDiapers = calculateDailyAverage('fralda');
  const avgSleep = calculateAverageSleep();
  const avgNaps = calculateDailyAverage('dormiu');
  
  const feedingTrend = calculateTrend('mamada');
  const sleepTrend = avgSleep.totalMinutes > 600 ? 'up' : avgSleep.totalMinutes < 480 ? 'down' : 'stable';
  const cryTrend = calculateTrend('choro');

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = (trend: string, isGoodWhenUp: boolean = true) => {
    if (trend === 'stable') return 'text-gray-500';
    if (trend === 'up') return isGoodWhenUp ? 'text-green-500' : 'text-red-500';
    return isGoodWhenUp ? 'text-red-500' : 'text-green-500';
  };

  // Calcular padrão de sono
  const getSleepPattern = () => {
    if (avgSleep.totalMinutes >= 660) return { label: 'Excelente', color: 'text-green-600', bg: 'bg-green-50' };
    if (avgSleep.totalMinutes >= 540) return { label: 'Bom', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (avgSleep.totalMinutes >= 420) return { label: 'Regular', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { label: 'Precisa melhorar', color: 'text-orange-600', bg: 'bg-orange-50' };
  };

  const sleepPattern = getSleepPattern();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
          Dashboard - Últimos 7 dias
        </h2>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Atualizado agora</span>
        </div>
      </div>

      {/* Cards principais de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card Sono Médio */}
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-100 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                  <Moon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Sono Médio/Dia</p>
                  <p className="text-2xl font-bold text-indigo-900">
                    {avgSleep.hours}h {avgSleep.minutes}m
                  </p>
                </div>
              </div>
              <div className={`flex items-center gap-1 ${getTrendColor(sleepTrend)}`}>
                {getTrendIcon(sleepTrend)}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${sleepPattern.bg} ${sleepPattern.color}`}>
                {sleepPattern.label}
              </div>
              <div className="text-xs text-gray-600">
                ~{avgNaps} sonecas/dia
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Alimentação */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-100 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md">
                  <Milk className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Mamadas/Dia</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {avgFeedings}x
                  </p>
                </div>
              </div>
              <div className={`flex items-center gap-1 ${getTrendColor(feedingTrend)}`}>
                {getTrendIcon(feedingTrend)}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-600">
                Padrão regular
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <Clock className="w-3 h-3" />
                A cada ~3h
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Fraldas */}
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-100 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                  <Sun className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Trocas/Dia</p>
                  <p className="text-2xl font-bold text-emerald-900">
                    {avgDiapers}x
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-500">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-600">
                Saudável
              </div>
              <div className="text-xs text-gray-600">
                Dentro do esperado
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Choro */}
        <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-100 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md">
                  <Baby className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Episódios de Choro</p>
                  <p className="text-2xl font-bold text-rose-900">
                    {calculateDailyAverage('choro')}x/dia
                  </p>
                </div>
              </div>
              <div className={`flex items-center gap-1 ${getTrendColor(cryTrend, false)}`}>
                {getTrendIcon(cryTrend)}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-600">
                {cryTrend === 'down' ? 'Melhorando' : cryTrend === 'up' ? 'Aumentou' : 'Estável'}
              </div>
              <div className="text-xs text-gray-600">
                Últimos 3 dias
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card de Insights */}
      <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border-2 border-purple-100 shadow-md">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">Insights da Semana</h3>
          </div>
          
          <div className="space-y-3">
            {avgSleep.totalMinutes < 600 && (
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Sono abaixo do ideal</p>
                  <p className="text-xs text-gray-600">Bebês nessa idade precisam de 11-14h de sono por dia. Tente estabelecer uma rotina mais consistente.</p>
                </div>
              </div>
            )}
            
            {feedingTrend === 'up' && (
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Aumento na alimentação</p>
                  <p className="text-xs text-gray-600">Pode indicar surto de crescimento. É normal e temporário!</p>
                </div>
              </div>
            )}
            
            {cryTrend === 'down' && (
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Menos episódios de choro</p>
                  <p className="text-xs text-gray-600">Ótimo progresso! Continue com a rotina atual.</p>
                </div>
              </div>
            )}

            {avgSleep.totalMinutes >= 660 && cryTrend !== 'up' && (
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Rotina estabelecida com sucesso!</p>
                  <p className="text-xs text-gray-600">Seu bebê está dormindo bem e se adaptando à rotina. Continue assim!</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
