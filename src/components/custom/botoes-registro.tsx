'use client';

import { useState } from 'react';
import { EventType, BabyEvent } from '@/lib/types';
import { saveEvent } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Baby, Moon, Milk, Frown, Package, Syringe, FileText } from 'lucide-react';

interface BotoesRegistroProps {
  onEventAdded: () => void;
}

const eventButtons: { type: EventType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: 'dormiu', label: 'Dormiu', icon: <Moon className="w-6 h-6" />, color: 'from-indigo-500 to-purple-600' },
  { type: 'acordou', label: 'Acordou', icon: <Baby className="w-6 h-6" />, color: 'from-amber-400 to-orange-500' },
  { type: 'mamada', label: 'Mamada', icon: <Milk className="w-6 h-6" />, color: 'from-blue-500 to-cyan-600' },
  { type: 'choro', label: 'Choro', icon: <Frown className="w-6 h-6" />, color: 'from-rose-400 to-pink-600' },
  { type: 'fralda', label: 'Fralda', icon: <Package className="w-6 h-6" />, color: 'from-emerald-500 to-teal-600' },
  { type: 'vacina', label: 'Vacina', icon: <Syringe className="w-6 h-6" />, color: 'from-purple-500 to-pink-600' },
  { type: 'observacao', label: 'Nota', icon: <FileText className="w-6 h-6" />, color: 'from-slate-500 to-gray-600' },
];

export default function BotoesRegistro({ onEventAdded }: BotoesRegistroProps) {
  const [selectedType, setSelectedType] = useState<EventType | null>(null);
  const [notes, setNotes] = useState('');

  const handleQuickRegister = (type: EventType) => {
    const event: BabyEvent = {
      id: Date.now().toString(),
      type,
      timestamp: new Date().toISOString(),
    };
    saveEvent(event);
    onEventAdded();
  };

  const handleRegisterWithNotes = () => {
    if (!selectedType) return;

    const event: BabyEvent = {
      id: Date.now().toString(),
      type: selectedType,
      timestamp: new Date().toISOString(),
      notes: notes.trim() || undefined,
    };
    saveEvent(event);
    setNotes('');
    setSelectedType(null);
    onEventAdded();
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {eventButtons.map((btn) => (
          <Button
            key={btn.type}
            onClick={() => setSelectedType(btn.type)}
            className={`h-28 sm:h-32 flex flex-col items-center justify-center gap-3 bg-gradient-to-br ${btn.color} text-white hover:scale-105 transition-all shadow-lg hover:shadow-xl border-0 rounded-2xl relative overflow-hidden group`}
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"></div>
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                {btn.icon}
              </div>
              <span className="text-sm font-semibold">{btn.label}</span>
            </div>
          </Button>
        ))}
      </div>

      <Dialog open={!!selectedType} onOpenChange={() => setSelectedType(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Registrar {eventButtons.find(b => b.type === selectedType)?.label}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4">
              <p className="text-sm text-gray-700 font-medium">
                🕐 {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div>
              <Textarea
                placeholder="Adicionar observação (opcional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-28 rounded-2xl border-gray-200 focus:border-purple-300 focus:ring-purple-300"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  if (selectedType) handleQuickRegister(selectedType);
                  setSelectedType(null);
                }}
                variant="outline"
                className="flex-1 h-12 rounded-xl border-2 hover:bg-gray-50"
              >
                Sem nota
              </Button>
              <Button
                onClick={handleRegisterWithNotes}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
              >
                Registrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
