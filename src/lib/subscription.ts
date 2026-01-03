import { Subscription, SubscriptionPlan, PLAN_FEATURES } from './types';

const SUBSCRIPTION_KEY = 'babyflow_subscription';

export function getSubscription(): Subscription {
  if (typeof window === 'undefined') {
    return { plan: 'free' };
  }

  const stored = localStorage.getItem(SUBSCRIPTION_KEY);
  if (!stored) {
    return { plan: 'free' };
  }

  try {
    const subscription: Subscription = JSON.parse(stored);
    
    // Verificar se a assinatura expirou
    if (subscription.expiryDate) {
      const expiry = new Date(subscription.expiryDate);
      if (expiry < new Date()) {
        return { plan: 'free' };
      }
    }
    
    return subscription;
  } catch {
    return { plan: 'free' };
  }
}

export function setSubscription(subscription: Subscription): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
}

export function upgradeToPremium(): void {
  const subscription: Subscription = {
    plan: 'premium',
    startDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 ano
  };
  setSubscription(subscription);
}

export function isPremium(): boolean {
  return getSubscription().plan === 'premium';
}

export function canUseFeature(feature: keyof typeof PLAN_FEATURES.free): boolean {
  const subscription = getSubscription();
  const features = PLAN_FEATURES[subscription.plan];
  return features[feature] as boolean;
}

export function getDailyEventLimit(): number {
  const subscription = getSubscription();
  return PLAN_FEATURES[subscription.plan].maxDailyEvents;
}

export function getHistoricoDaysLimit(): number {
  const subscription = getSubscription();
  return PLAN_FEATURES[subscription.plan].historicoDays;
}
