/**
 * Stripe Client Configuration
 * 
 * This file configures Stripe for client-side payment processing
 * Make sure to set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment variables
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

// Make sure to add your Stripe publishable key to environment variables
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment variables.');
}

// Singleton pattern for Stripe instance
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey || '');
  }
  return stripePromise;
};

// Types for Stripe payment processing
export interface PaymentIntentData {
  client_secret: string;
  payment_intent_id: string;
  amount: number;
  currency: string;
}

export interface SubscriptionPaymentData {
  package_id: string | number;
  amount: number;
  currency: string;
  customer_email?: string;
  customer_name?: string;
}

// Helper function to format amount for Stripe (cents)
export const formatStripeAmount = (amount: number): number => {
  return Math.round(amount * 100); // Convert dollars to cents
};

// Helper function to format amount from Stripe (dollars)
export const formatStripeAmountToDisplay = (amount: number): number => {
  return amount / 100; // Convert cents to dollars
};