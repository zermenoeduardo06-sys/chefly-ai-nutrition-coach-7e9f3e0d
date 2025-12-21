import { loadStripe } from '@stripe/stripe-js';

// Stripe publishable key - safe to expose in client code
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51RsUkzRXGCRSzpK70sG0MfOXscTMjKcMB3b4G1Yhm0ZPkEmACcabOFImtyU8IjXarGR4UAPRSJCVZaJkaAiMKO3y00YiK7WQGs';

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
