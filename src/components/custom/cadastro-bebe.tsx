'use client';

import { useState } from 'react';
import { createBaby } from '@/lib/supabase-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Baby as BabyIcon, Heart, Sparkles, Loader2 } from 'lucide-react';

interface CadastroBabeProps {
  onComplete: () => void;
}

export default function CadastroBebe({ onComplete }: CadastroBabeProps) {
  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    gender: 'male' as 'male' | 'female' | 'other',
    recent_vaccine_taken: false,
    recent_vaccine_name: '',
    recent_vaccine_date: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.birth_date || !formData.gender) {
      setError('Por favor, preencha os campos obrigatórios');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createBaby({
        name: formData.name,
        birth_date: formData.birth_date,
        gender: formData.gender,
        recent_vaccine_taken: formData.recent_vaccine_taken,
        recent_vaccine_name: formData.recent_vaccine_taken ? formData.recent_vaccine_name : null,
        recent_vaccine_date: formData.recent_vaccine_taken && formData.recent_vaccine_date 
          ? new Date(formData.recent_vaccine_date).toISOString() 
          : null,
      });
      
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar bebê');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl border-0 rounded-3xl overflow-hidden">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <BabyIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              Bem-vindo ao BabyFlow
              <Sparkles className="w-6 h-6" />
            </h1>
            <p className="text-white/90 text-base">Vamos conhecer seu bebê</p>
          </div>
        </div>
        
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name" className="text-base font-semibold text-gray-700 mb-2 block">
                Nome do bebê *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Ex: Maria"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12 text-base rounded-xl border-gray-200 focus:border-purple-300 focus:ring-purple-300"
                required
              />
            </div>

            <div>
              <Label htmlFor="birthDate" className="text-base font-semibold text-gray-700 mb-2 block">
                Data de nascimento *
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                className="h-12 text-base rounded-xl border-gray-200 focus:border-purple-300 focus:ring-purple-300"
                required
              />
            </div>

            <div>
              <Label className="text-base font-semibold text-gray-700 mb-3 block">Gênero *</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'male', label: 'Menino', emoji: '👦' },
                  { value: 'female', label: 'Menina', emoji: '👧' },
                  { value: 'other', label: 'Outro', emoji: '👶' }
                ].map((gender) => (
                  <Button
                    key={gender.value}
                    type="button"
                    variant={formData.gender === gender.value ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, gender: gender.value as 'male' | 'female' | 'other' })}
                    className={`h-20 text-base flex flex-col items-center justify-center gap-2 rounded-xl transition-all ${
                      formData.gender === gender.value
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                        : 'border-2 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    <span className="text-2xl">{gender.emoji}</span>
                    <span className="text-sm font-medium">{gender.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold text-gray-700 mb-3 block">
                Tomou vacina recentemente?
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={formData.recent_vaccine_taken ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, recent_vaccine_taken: true })}
                  className={`h-14 text-base rounded-xl transition-all ${
                    formData.recent_vaccine_taken
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'border-2 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  💉 Sim
                </Button>
                <Button
                  type="button"
                  variant={!formData.recent_vaccine_taken ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, recent_vaccine_taken: false })}
                  className={`h-14 text-base rounded-xl transition-all ${
                    !formData.recent_vaccine_taken
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'border-2 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  ✅ Não
                </Button>
              </div>
            </div>

            {formData.recent_vaccine_taken && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border-2 border-purple-200 space-y-3">
                <div>
                  <Label htmlFor="vaccineName" className="text-base font-semibold text-gray-700 mb-2 block">
                    Qual vacina?
                  </Label>
                  <Input
                    id="vaccineName"
                    type="text"
                    placeholder="Ex: BCG, Hepatite B..."
                    value={formData.recent_vaccine_name}
                    onChange={(e) => setFormData({ ...formData, recent_vaccine_name: e.target.value })}
                    className="h-12 text-base rounded-xl border-gray-200 focus:border-purple-300 focus:ring-purple-300"
                  />
                </div>
                <div>
                  <Label htmlFor="vaccineDate" className="text-base font-semibold text-gray-700 mb-2 block">
                    Quando?
                  </Label>
                  <Input
                    id="vaccineDate"
                    type="date"
                    value={formData.recent_vaccine_date}
                    onChange={(e) => setFormData({ ...formData, recent_vaccine_date: e.target.value })}
                    className="h-12 text-base rounded-xl border-gray-200 focus:border-purple-300 focus:ring-purple-300"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 text-lg font-bold mt-6 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5" />
                  Começar jornada
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
