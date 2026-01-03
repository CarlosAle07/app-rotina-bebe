'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BabyEvent } from '@/lib/types';
import { analyzeSleepPattern, SleepAnalysis } from '@/lib/ai-service';
import { isPremium } from '@/lib/subscription';
import { Moon, TrendingUp, Clock, Sparkles, Lock, Crown } from 'lucide-react';

interface SleepInsightsProps {
  events: BabyEvent[];
  onUpgrade: () => void;
}

export default function SleepInsights({ events, onUpgrade }: SleepInsightsProps) {
  const [analysis, setAnalysis] = useState<SleepAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const premium = isPremium();

  useEffect(() => {
    if (premium) {
      setLoading(true);
      // Simular processamento de IA
      setTimeout(() => {
        const result = analyzeSleepPattern(events);
        setAnalysis(result);
        setLoading(false);
      }, 1000);
    } else {
      setLoading(false);
    }
  }, [events, premium]);

  if (!premium) {
    return (
      <Card className="bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 border-2 border-purple-300 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-gray-900">Análise Inteligente de Sono</h3>
                <Crown className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Desbloqueie insights personalizados sobre o padrão de sono do seu bebê com base em análise de IA dos últimos 7 dias.
              </p>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Padrões e Tendências</p>
                <p className="text-xs text-gray-600">Identifique os melhores horários para sono</p>
              </div>
              <Lock className="w-4 h-4 text-gray-400" />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                <Moon className="w-5 h-5 text-pink-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Qualidade do Sono</p>
                <p className="text-xs text-gray-600">Avaliação detalhada e personalizada</p>
              </div>
              <Lock className="w-4 h-4 text-gray-400" />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Recomendações Personalizadas</p>
                <p className="text-xs text-gray-600">Ações práticas baseadas nas últimas 24h</p>
              </div>
              <Lock className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-4 border border-amber-200">
            <p className="text-sm text-amber-900 font-medium mb-2">
              💡 Versão Gratuita: Histórico limitado a 7 dias
            </p>
            <p className="text-xs text-amber-800">
              Com o Premium, você obtém análises mais assertivas baseadas em todo o histórico do seu bebê, sem limitações!
            </p>
          </div>

          <Button
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 hover:from-purple-700 hover:via-pink-600 hover:to-orange-500 text-white font-semibold py-6 rounded-xl shadow-lg"
          >
            <Crown className="w-5 h-5 mr-2" />
            Desbloquear Análise Inteligente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Analisando padrões...</h3>
              <p className="text-sm text-gray-600">Processando dados dos últimos 7 dias</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  const qualityColors = {
    excelente: 'from-green-500 to-emerald-600',
    boa: 'from-blue-500 to-cyan-600',
    regular: 'from-yellow-500 to-orange-500',
    ruim: 'from-red-500 to-rose-600',
  };

  const qualityEmojis = {
    excelente: '🌟',
    boa: '😊',
    regular: '😐',
    ruim: '😟',
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">Análise Inteligente de Sono</h3>
            <p className="text-sm text-gray-600">Baseado nos últimos 7 dias</p>
          </div>
          <div className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-lg text-xs font-semibold">
            <Crown className="w-3 h-3" />
            Premium
          </div>
        </div>

        {/* Estatísticas principais */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-medium text-indigo-900">Sono Total</span>
            </div>
            <p className="text-2xl font-bold text-indigo-600">
              {analysis.totalSleepHours.toFixed(1)}h
            </p>
            <p className="text-xs text-indigo-700 mt-1">
              Média: {(analysis.totalSleepHours / 7).toFixed(1)}h/dia
            </p>
          </div>

          <div className={`bg-gradient-to-br ${qualityColors[analysis.nightSleepQuality]} rounded-xl p-4 text-white shadow-lg`}>
            <div className="flex items-center gap-2 mb-2">
              <Moon className="w-4 h-4" />
              <span className="text-xs font-medium">Qualidade</span>
            </div>
            <p className="text-2xl font-bold capitalize">
              {qualityEmojis[analysis.nightSleepQuality]} {analysis.nightSleepQuality}
            </p>
            <p className="text-xs opacity-90 mt-1">
              {analysis.patterns.napCount} sonecas/dia
            </p>
          </div>
        </div>

        {/* Padrões identificados */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 mb-6 border border-blue-100">
          <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Padrões Identificados
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700">Melhor horário para dormir:</span>
              <span className="font-semibold text-blue-900">{analysis.patterns.bestSleepTime}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700">Duração média das sonecas:</span>
              <span className="font-semibold text-blue-900">{Math.round(analysis.averageNapDuration)}min</span>
            </div>
          </div>
        </div>

        {/* Recomendações */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Recomendações Personalizadas
          </h4>
          <div className="space-y-2">
            {analysis.recommendations.map((rec, index) => (
              <div
                key={index}
                className="flex items-start gap-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-700 flex-1">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Nota sobre análise */}
        <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-200">
          <p className="text-xs text-amber-900">
            💡 <strong>Análise baseada em IA:</strong> Estas recomendações são geradas automaticamente com base nos registros das últimas 24 horas e padrões dos últimos 7 dias. Para orientações médicas específicas, consulte sempre um pediatra.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
