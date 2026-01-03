// Sistema de feedback do usuário

export interface Feedback {
  id: string;
  userId: string;
  type: 'bug' | 'feature' | 'improvement' | 'other';
  title: string;
  description: string;
  rating?: number;
  email?: string;
  timestamp: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

// Enviar feedback
export async function submitFeedback(feedback: Omit<Feedback, 'id' | 'timestamp' | 'status'>): Promise<boolean> {
  // Em produção, enviar para API/backend
  const newFeedback: Feedback = {
    ...feedback,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    status: 'pending',
  };
  
  // Salvar localmente (temporário)
  const feedbacks = getFeedbackHistory();
  feedbacks.push(newFeedback);
  localStorage.setItem('babyflow_feedbacks', JSON.stringify(feedbacks));
  
  // Simular envio para servidor
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Feedback enviado:', newFeedback);
      resolve(true);
    }, 1000);
  });
}

// Obter histórico de feedbacks
export function getFeedbackHistory(): Feedback[] {
  if (typeof window === 'undefined') return [];
  
  const feedbacksStr = localStorage.getItem('babyflow_feedbacks');
  if (!feedbacksStr) return [];
  
  try {
    return JSON.parse(feedbacksStr);
  } catch {
    return [];
  }
}

// Avaliar app
export async function rateApp(rating: number, comment?: string): Promise<boolean> {
  return submitFeedback({
    userId: 'current_user',
    type: 'other',
    title: `Avaliação: ${rating} estrelas`,
    description: comment || 'Sem comentário',
    rating,
  });
}
