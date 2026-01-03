'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Baby, Calendar, Moon, Milk, Heart, Sparkles } from 'lucide-react';

interface QuizQuestion {
  id: number;
  question: string;
  subtitle?: string;
  options: {
    value: string;
    label: string;
    icon?: React.ReactNode;
  }[];
  multiSelect?: boolean;
}

interface OnboardingQuizProps {
  onComplete: (answers: Record<number, string | string[]>) => void;
}

export default function OnboardingQuiz({ onComplete }: OnboardingQuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});

  const questions: QuizQuestion[] = [
    {
      id: 1,
      question: 'Qual é a idade do seu bebê?',
      subtitle: 'Isso nos ajuda a personalizar as recomendações',
      options: [
        { value: '0-3', label: '0-3 meses', icon: <Baby className="w-5 h-5" /> },
        { value: '3-6', label: '3-6 meses', icon: <Baby className="w-5 h-5" /> },
        { value: '6-12', label: '6-12 meses', icon: <Baby className="w-5 h-5" /> },
        { value: '12+', label: 'Mais de 1 ano', icon: <Baby className="w-5 h-5" /> },
      ],
    },
    {
      id: 2,
      question: 'Como está o sono do seu bebê?',
      subtitle: 'Seja honesto, estamos aqui para ajudar',
      options: [
        { value: 'excelente', label: 'Excelente - dorme a noite toda', icon: <Moon className="w-5 h-5" /> },
        { value: 'bom', label: 'Bom - acorda 1-2 vezes', icon: <Moon className="w-5 h-5" /> },
        { value: 'regular', label: 'Regular - acorda várias vezes', icon: <Moon className="w-5 h-5" /> },
        { value: 'dificil', label: 'Difícil - mal consegue dormir', icon: <Moon className="w-5 h-5" /> },
      ],
    },
    {
      id: 3,
      question: 'Quais são seus maiores desafios?',
      subtitle: 'Selecione todos que se aplicam',
      multiSelect: true,
      options: [
        { value: 'sono', label: 'Estabelecer rotina de sono', icon: <Moon className="w-5 h-5" /> },
        { value: 'alimentacao', label: 'Horários de alimentação', icon: <Milk className="w-5 h-5" /> },
        { value: 'choro', label: 'Entender o choro', icon: <Heart className="w-5 h-5" /> },
        { value: 'rotina', label: 'Criar uma rotina', icon: <Calendar className="w-5 h-5" /> },
      ],
    },
    {
      id: 4,
      question: 'O que você mais precisa agora?',
      subtitle: 'Vamos focar no que é mais importante para você',
      options: [
        { value: 'sono', label: 'Melhorar o sono do bebê', icon: <Moon className="w-5 h-5" /> },
        { value: 'rastreamento', label: 'Rastrear atividades', icon: <Calendar className="w-5 h-5" /> },
        { value: 'orientacao', label: 'Orientação especializada', icon: <Sparkles className="w-5 h-5" /> },
        { value: 'comunidade', label: 'Apoio de outros pais', icon: <Heart className="w-5 h-5" /> },
      ],
    },
  ];

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleSelectOption = (value: string) => {
    if (currentQuestion.multiSelect) {
      const currentAnswers = (answers[currentQuestion.id] as string[]) || [];
      const newAnswers = currentAnswers.includes(value)
        ? currentAnswers.filter(v => v !== value)
        : [...currentAnswers, value];
      setAnswers({ ...answers, [currentQuestion.id]: newAnswers });
    } else {
      setAnswers({ ...answers, [currentQuestion.id]: value });
    }
  };

  const isOptionSelected = (value: string) => {
    const answer = answers[currentQuestion.id];
    if (currentQuestion.multiSelect) {
      return (answer as string[] || []).includes(value);
    }
    return answer === value;
  };

  const canProceed = () => {
    const answer = answers[currentQuestion.id];
    if (currentQuestion.multiSelect) {
      return (answer as string[] || []).length > 0;
    }
    return !!answer;
  };

  const handleNext = () => {
    if (isLastStep) {
      onComplete(answers);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/90 backdrop-blur-sm shadow-2xl border-0">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-100 rounded-t-2xl overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <CardContent className="p-8 sm:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              {currentQuestion.options[0]?.icon || <Baby className="w-8 h-8 text-white" />}
            </div>
            <div className="text-sm text-gray-500 mb-2">
              Pergunta {currentStep + 1} de {questions.length}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {currentQuestion.question}
            </h2>
            {currentQuestion.subtitle && (
              <p className="text-gray-600 text-sm sm:text-base">
                {currentQuestion.subtitle}
              </p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelectOption(option.value)}
                className={`w-full p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 text-left flex items-center gap-4 ${
                  isOptionSelected(option.value)
                    ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-md scale-[1.02]'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isOptionSelected(option.value)
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {option.icon}
                </div>
                <span className={`font-medium text-base sm:text-lg ${
                  isOptionSelected(option.value) ? 'text-purple-900' : 'text-gray-700'
                }`}>
                  {option.label}
                </span>
                {isOptionSelected(option.value) && (
                  <div className="ml-auto w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 h-12 rounded-xl border-2 border-gray-200 hover:bg-gray-50"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Voltar
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`h-12 rounded-xl font-semibold shadow-lg transition-all ${
                currentStep === 0 ? 'flex-1' : 'flex-[2]'
              } ${
                canProceed()
                  ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 hover:from-purple-700 hover:via-pink-600 hover:to-orange-500 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLastStep ? 'Começar' : 'Continuar'}
              {!isLastStep && <ChevronRight className="w-5 h-5 ml-1" />}
            </Button>
          </div>

          {/* Skip option */}
          {currentStep === 0 && (
            <button
              onClick={() => onComplete({})}
              className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Pular questionário
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
