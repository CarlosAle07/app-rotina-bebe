'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Check, Sparkles } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  feature?: string;
}

export default function UpgradeModal({ isOpen, onClose, onUpgrade, feature }: UpgradeModalProps) {
  if (!isOpen) return null;

  const premiumFeatures = [
    'Registros ilimitados por dia',
    'Histórico completo sem limite de tempo',
    'Análises inteligentes de sono',
    'Assistente IA para dúvidas',
    'Gráficos e análises avançadas',
    'Exportar dados em PDF e Excel',
    'Múltiplos bebês',
    'Sincronização na nuvem',
    'Lembretes personalizados',
    'Gráficos de crescimento',
    'Suporte prioritário',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-lg bg-white shadow-2xl border-0 overflow-hidden">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>

          <div className="relative z-10 text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Desbloqueie o Premium
            </h2>
            <p className="text-white/90 text-sm">
              {feature || 'Aproveite todos os recursos sem limites'}
            </p>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Planos */}
          <div className="space-y-4 mb-6">
            {/* Plano Mensal */}
            <div className="border-2 border-gray-200 rounded-2xl p-4 hover:border-purple-300 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">Mensal</h3>
                  <p className="text-xs text-gray-500">Renovação automática</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">R$ 19,90</p>
                  <p className="text-xs text-gray-500">por mês</p>
                </div>
              </div>
            </div>

            {/* Plano Trimestral - NOVO */}
            <div className="border-2 border-pink-400 rounded-2xl p-4 bg-gradient-to-br from-pink-50 to-orange-50 relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                ECONOMIZE 25%
              </div>
              <div className="flex items-center justify-between mb-2 mt-2">
                <div>
                  <h3 className="font-semibold text-gray-900">Trimestral</h3>
                  <p className="text-xs text-gray-500">3 meses de acesso</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                    R$ 44,90
                  </p>
                  <p className="text-xs text-gray-500">R$ 14,97/mês</p>
                </div>
              </div>
            </div>

            {/* Plano Anual - Destaque */}
            <div className="border-2 border-purple-500 rounded-2xl p-4 bg-gradient-to-br from-purple-50 to-pink-50 relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                ECONOMIZE 50%
              </div>
              <div className="flex items-center justify-between mb-2 mt-2">
                <div>
                  <h3 className="font-semibold text-gray-900">Anual</h3>
                  <p className="text-xs text-gray-500">Melhor custo-benefício</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    R$ 119,90
                  </p>
                  <p className="text-xs text-gray-500">R$ 9,99/mês</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Tudo que você ganha:</h3>
            <div className="space-y-2">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={onUpgrade}
            className="w-full h-12 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 hover:from-purple-700 hover:via-pink-600 hover:to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Começar agora
          </Button>

          <p className="text-xs text-center text-gray-500 mt-4">
            Cancele quando quiser. Sem taxas ocultas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
