'use client';

import { BabyEvent } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Baby, Moon, Milk, Frown, Package, Syringe, FileText } from 'lucide-react';

interface HistoricoProps {
  events: BabyEvent[];
}

const eventIcons: Record<string, React.ReactNode> = {
  dormiu: <Moon className="w-5 h-5" />,
  acordou: <Baby className="w-5 h-5" />,
  mamada: <Milk className="w-5 h-5" />,
  choro: <Frown className="w-5 h-5" />,
  fralda: <Package className="w-5 h-5" />,
  vacina: <Syringe className="w-5 h-5" />,
  observacao: <FileText className="w-5 h-5" />,
};

const eventLabels: Record<string, string> = {
  dormiu: 'Dormiu',
  acordou: 'Acordou',
  mamada: 'Mamada',
  choro: 'Choro',
  fralda: 'Troca de fralda',
  vacina: 'Vacina',
  observacao: 'Observação',
};

const eventColors: Record<string, string> = {
  dormiu: 'bg-indigo-100 text-indigo-700',
  acordou: 'bg-yellow-100 text-yellow-700',
  mamada: 'bg-blue-100 text-blue-700',
  choro: 'bg-red-100 text-red-700',
  fralda: 'bg-green-100 text-green-700',
  vacina: 'bg-purple-100 text-purple-700',
  observacao: 'bg-gray-100 text-gray-700',
};

export default function Historico({ events }: HistoricoProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Nenhum evento registrado ainda</p>
        <p className="text-gray-400 text-sm mt-2">Use os botões acima para começar</p>
      </div>
    );
  }

  const groupedEvents = events.reduce((acc, event) => {
    const date = new Date(event.timestamp).toLocaleDateString('pt-BR');
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, BabyEvent[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedEvents).map(([date, dayEvents]) => (
        <div key={date}>
          <h3 className="text-lg font-semibold text-gray-700 mb-3 sticky top-0 bg-white/80 backdrop-blur-sm py-2">
            {date}
          </h3>
          <div className="space-y-2">
            {dayEvents.map((event) => (
              <Card key={event.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${eventColors[event.type]}`}>
                      {eventIcons[event.type]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-800">
                          {eventLabels[event.type]}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {new Date(event.timestamp).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {event.notes && (
                        <p className="text-sm text-gray-600 mt-1">{event.notes}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
