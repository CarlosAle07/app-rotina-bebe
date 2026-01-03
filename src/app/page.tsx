'use client';

import { useState, useEffect } from 'react';
import { Baby as BabyType, BabyEvent, AppSettings } from '@/lib/types';
import { getBaby, getEvents, getSettings, createEvent } from '@/lib/supabase-data';
import { getSubscription, isPremium, upgradeToPremium, getDailyEventLimit, getHistoricoDaysLimit } from '@/lib/subscription';
import { getCurrentUser, onAuthStateChange } from '@/lib/auth';
import { requestNotificationPermission, sendLocalNotification, scheduleReminder } from '@/lib/notifications';
import { trackEvent, getUserStats, unlockPremiumAchievement } from '@/lib/gamification';
import { initializeTheme } from '@/lib/theme';
import LoginScreen from '@/components/custom/login-screen';
import CadastroBebe from '@/components/custom/cadastro-bebe';
import OnboardingQuiz from '@/components/custom/onboarding-quiz';
import BotoesRegistro from '@/components/custom/botoes-registro';
import Historico from '@/components/custom/historico';
import Configuracoes from '@/components/custom/configuracoes';
import UpgradeModal from '@/components/custom/upgrade-modal';
import Paywall from '@/components/custom/paywall';
import SleepInsights from '@/components/custom/sleep-insights';
import AiChatAssistant from '@/components/custom/ai-chat-assistant';
import DashboardStats from '@/components/custom/dashboard-stats';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Clock, Settings, AlertCircle, Moon, Sun, Milk, Baby, Crown, Sparkles, TrendingUp, Lock, BarChart3, Bell, Trophy, Loader2 } from 'lucide-react';

type Tab = 'dashboard' | 'stats' | 'historico' | 'configuracoes';

export default function HomePage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [baby, setBaby] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [settings, setSettings] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [mounted, setMounted] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<string>('');
  const [premium, setPremium] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [userStats, setUserStats] = useState(getUserStats());

  useEffect(() => {
    setMounted(true);
    initializeTheme();
    checkAuth();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = onAuthStateChange((user) => {
      if (user) {
        setAuthenticated(true);
        loadData();
      } else {
        setAuthenticated(false);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    const user = await getCurrentUser();
    if (user) {
      setAuthenticated(true);
      await loadData();
      
      // Solicitar permissão para notificações
      requestNotificationPermission().then(granted => {
        if (granted) {
          sendLocalNotification(
            '🎉 Bem-vindo ao BabyFlow!',
            'Você receberá lembretes úteis para cuidar do seu bebê.',
            'achievement'
          );
        }
      });
    }
    setLoading(false);
  };

  const loadData = async () => {
    try {
      const [babyData, eventsData, settingsData] = await Promise.all([
        getBaby(),
        getEvents(),
        getSettings(),
      ]);

      setBaby(babyData);
      setEvents(eventsData);
      setSettings(settingsData);
      setPremium(isPremium());
      setUserStats(getUserStats());
      
      // Verificar se já completou o quiz
      const quizDone = localStorage.getItem('babyflow_quiz_completed');
      setQuizCompleted(!!quizDone);
      
      // Mostrar quiz apenas se tiver bebê cadastrado e não tiver completado
      if (babyData && !quizDone) {
        setShowQuiz(true);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleLogin = () => {
    setAuthenticated(true);
    loadData();
  };

  const handleQuizComplete = (answers: Record<number, string | string[]>) => {
    // Salvar respostas do quiz
    localStorage.setItem('babyflow_quiz_answers', JSON.stringify(answers));
    localStorage.setItem('babyflow_quiz_completed', 'true');
    setQuizCompleted(true);
    setShowQuiz(false);
    
    // Dar XP por completar quiz
    trackEvent('quiz_completed');
    setUserStats(getUserStats());
  };

  const handleUpgrade = (feature?: string) => {
    setUpgradeFeature(feature || '');
    setShowUpgradeModal(true);
  };

  const handleConfirmUpgrade = () => {
    upgradeToPremium();
    unlockPremiumAchievement();
    setShowUpgradeModal(false);
    setPremium(true);
    loadData();
    
    // Notificar upgrade
    sendLocalNotification(
      '👑 Bem-vindo ao Premium!',
      'Agora você tem acesso a todos os recursos do BabyFlow.',
      'achievement'
    );
  };

  const handleEventAdded = async () => {
    await loadData();
    
    // Rastrear evento para gamificação
    const newAchievements = trackEvent('event_added');
    setUserStats(getUserStats());
    
    // Notificar novas conquistas
    newAchievements.forEach(achievement => {
      sendLocalNotification(
        '🏆 Conquista desbloqueada!',
        `${achievement.icon} ${achievement.title}: ${achievement.description}`,
        'achievement'
      );
    });
    
    // Agendar lembretes inteligentes
    const lastFeeding = events.find(e => e.type === 'mamada');
    if (lastFeeding) {
      const timeSince = Date.now() - new Date(lastFeeding.timestamp).getTime();
      const minutesSince = timeSince / (1000 * 60);
      
      // Lembrar de alimentar em 3h
      if (minutesSince < 120) {
        scheduleReminder('feeding', 180 - minutesSince);
      }
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Tela de login
  if (!authenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Mostrar quiz de onboarding
  if (showQuiz && baby) {
    return <OnboardingQuiz onComplete={handleQuizComplete} />;
  }

  if (!baby) {
    return <CadastroBebe onComplete={loadData} />;
  }

  // Calcular estatísticas do dia
  const today = new Date().toDateString();
  const todayEvents = events.filter(e => new Date(e.timestamp).toDateString() === today);
  
  // Verificar limite de eventos diários
  const dailyLimit = getDailyEventLimit();
  const canAddEvent = premium || todayEvents.length < dailyLimit;
  
  // Filtrar histórico baseado no plano
  const historicoDaysLimit = getHistoricoDaysLimit();
  const filteredEvents = premium 
    ? events 
    : events.filter(e => {
        const eventDate = new Date(e.timestamp);
        const limitDate = new Date();
        limitDate.setDate(limitDate.getDate() - historicoDaysLimit);
        return eventDate >= limitDate;
      });
  
  const lastSleep = todayEvents.find(e => e.type === 'dormiu');
  const lastWake = todayEvents.find(e => e.type === 'acordou');
  const lastFeeding = todayEvents.find(e => e.type === 'mamada');
  const lastCry = todayEvents.find(e => e.type === 'choro');
  const lastDiaper = todayEvents.find(e => e.type === 'fralda');
  
  // Calcular tempo total de sono
  const sleepEvents = todayEvents.filter(e => e.type === 'dormiu' || e.type === 'acordou');
  let totalSleepMinutes = 0;
  for (let i = 0; i < sleepEvents.length - 1; i++) {
    if (sleepEvents[i].type === 'dormiu' && sleepEvents[i + 1].type === 'acordou') {
      const start = new Date(sleepEvents[i].timestamp);
      const end = new Date(sleepEvents[i + 1].timestamp);
      totalSleepMinutes += (end.getTime() - start.getTime()) / (1000 * 60);
    }
  }
  const sleepHours = Math.floor(totalSleepMinutes / 60);
  const sleepMinutes = Math.floor(totalSleepMinutes % 60);

  // Contar eventos do dia
  const feedingCount = todayEvents.filter(e => e.type === 'mamada').length;
  const diaperCount = todayEvents.filter(e => e.type === 'fralda').length;
  const napCount = todayEvents.filter(e => e.type === 'dormiu').length;

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '--:--';
    return new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} dias`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses`;
    return `${Math.floor(diffDays / 365)} anos`;
  };

  // Calcular progresso de nível
  const levelProgress = (userStats.xp % 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header estilo Huckleberry */}
      <div className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shadow-lg">
                <Baby className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                  BabyFlow
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">{baby.name} • {calculateAge(baby.birth_date)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Nível do usuário */}
              <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 px-3 py-2 rounded-xl">
                <Trophy className="w-4 h-4 text-amber-600" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-amber-900">Nível {userStats.level}</span>
                  <div className="w-16 h-1 bg-amber-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all"
                      style={{ width: `${levelProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {premium ? (
                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-2 rounded-xl shadow-md">
                  <Crown className="w-4 h-4" />
                  <span className="text-xs font-semibold hidden sm:inline">Premium</span>
                </div>
              ) : (
                <Button
                  onClick={() => handleUpgrade()}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 hover:from-purple-700 hover:via-pink-600 hover:to-orange-500 text-white shadow-md"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Upgrade</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Banner de limite para usuários free */}
            {!premium && (
              <Card className="bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 border-2 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Versão Gratuita: {todayEvents.length}/{dailyLimit} registros hoje
                        </p>
                        <p className="text-xs text-gray-600">
                          Histórico limitado a {historicoDaysLimit} dias
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleUpgrade('Desbloqueie registros ilimitados')}
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      Upgrade
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cards de estatísticas - estilo Huckleberry */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card Sono */}
              <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 border-0 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <CardContent className="p-5 relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Moon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white/90 text-sm font-medium">Sono Total</span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {sleepHours}h {sleepMinutes}m
                  </p>
                  <p className="text-white/70 text-xs">{napCount} sonecas hoje</p>
                </CardContent>
              </Card>

              {/* Card Alimentação */}
              <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 border-0 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <CardContent className="p-5 relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Milk className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white/90 text-sm font-medium">Alimentação</span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{feedingCount}x</p>
                  <p className="text-white/70 text-xs">Última: {formatTime(lastFeeding?.timestamp)}</p>
                </CardContent>
              </Card>

              {/* Card Fraldas */}
              <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <CardContent className="p-5 relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Sun className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white/90 text-sm font-medium">Fraldas</span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{diaperCount}x</p>
                  <p className="text-white/70 text-xs">Última: {formatTime(lastDiaper?.timestamp)}</p>
                </CardContent>
              </Card>
            </div>

            {/* Análise Inteligente de Sono */}
            <SleepInsights 
              events={events} 
              onUpgrade={() => handleUpgrade('Desbloqueie análises inteligentes de sono')} 
            />

            {/* Resumo detalhado */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                Atividades de hoje
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500 mb-1">Último sono</p>
                    <p className="text-xl font-bold text-indigo-600">{formatTime(lastSleep?.timestamp)}</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500 mb-1">Acordou às</p>
                    <p className="text-xl font-bold text-amber-600">{formatTime(lastWake?.timestamp)}</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500 mb-1">Última mamada</p>
                    <p className="text-xl font-bold text-blue-600">{formatTime(lastFeeding?.timestamp)}</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500 mb-1">Último choro</p>
                    <p className="text-xl font-bold text-rose-600">{formatTime(lastCry?.timestamp)}</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Alerta de vacina */}
            {baby.recent_vaccine_taken && (
              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-900 mb-1">Vacina recente</h3>
                      <p className="text-sm text-amber-800">
                        {baby.recent_vaccine_name && `${baby.recent_vaccine_name} - `}
                        É normal que o bebê apresente febre leve, irritabilidade ou sonolência nas próximas 48h.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botões de registro */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                Registrar atividade
              </h2>
              
              {!canAddEvent ? (
                <Paywall
                  feature="Limite de Registros Atingido"
                  description={`Você atingiu o limite de ${dailyLimit} registros por dia na versão gratuita.`}
                  onUpgrade={() => handleUpgrade('Desbloqueie registros ilimitados')}
                />
              ) : (
                <BotoesRegistro onEventAdded={handleEventAdded} />
              )}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <DashboardStats events={events} isPremium={premium} />
        )}

        {activeTab === 'historico' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                Histórico {!premium && `(últimos ${historicoDaysLimit} dias)`}
              </h2>
              {!premium && (
                <Button
                  onClick={() => handleUpgrade('Desbloqueie histórico completo')}
                  size="sm"
                  variant="outline"
                  className="border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  <Lock className="w-3 h-3 mr-1" />
                  Ver tudo
                </Button>
              )}
            </div>
            <Historico events={filteredEvents} />
          </div>
        )}

        {activeTab === 'configuracoes' && settings && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
              Configurações
            </h2>
            <Configuracoes baby={baby} settings={settings} onUpdate={loadData} />
          </div>
        )}
      </div>

      {/* Assistente Inteligente */}
      <AiChatAssistant 
        events={events} 
        onUpgrade={() => handleUpgrade('Desbloqueie o assistente inteligente')} 
      />

      {/* Bottom Navigation estilo Huckleberry */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex justify-around items-center">
            <Button
              variant="ghost"
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 flex flex-col items-center gap-1 h-auto py-3 rounded-2xl transition-all ${
                activeTab === 'dashboard' 
                  ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white hover:from-purple-600 hover:via-pink-600 hover:to-orange-500' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs font-medium">Início</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab('stats')}
              className={`flex-1 flex flex-col items-center gap-1 h-auto py-3 rounded-2xl transition-all ${
                activeTab === 'stats' 
                  ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white hover:from-purple-600 hover:via-pink-600 hover:to-orange-500' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs font-medium">Dashboard</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab('historico')}
              className={`flex-1 flex flex-col items-center gap-1 h-auto py-3 rounded-2xl transition-all ${
                activeTab === 'historico' 
                  ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white hover:from-purple-600 hover:via-pink-600 hover:to-orange-500' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="text-xs font-medium">Histórico</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab('configuracoes')}
              className={`flex-1 flex flex-col items-center gap-1 h-auto py-3 rounded-2xl transition-all ${
                activeTab === 'configuracoes' 
                  ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white hover:from-purple-600 hover:via-pink-600 hover:to-orange-500' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs font-medium">Ajustes</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Upgrade */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleConfirmUpgrade}
        feature={upgradeFeature}
      />
    </div>
  );
}
