'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles } from 'lucide-react';

interface PaywallProps {
  feature: string;
  description: string;
  onUpgrade: () => void;
}

export default function Paywall({ feature, description, onUpgrade }: PaywallProps) {
  return (
    <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border-2 border-purple-200 shadow-lg">
      <CardContent className="p-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Lock className="w-8 h-8 text-white" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {feature}
        </h3>
        
        <p className="text-sm text-gray-600 mb-6">
          {description}
        </p>

        <Button
          onClick={onUpgrade}
          className="w-full h-11 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 hover:from-purple-700 hover:via-pink-600 hover:to-orange-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Desbloquear Premium
        </Button>

        <p className="text-xs text-gray-500 mt-3">
          A partir de R$ 9,99/mês
        </p>
      </CardContent>
    </Card>
  );
}
