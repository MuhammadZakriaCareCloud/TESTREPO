'use client';

import React, { useState } from 'react';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Initialize Stripe
console.log('Stripe Key from env:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

// Types
interface PaymentFormProps {
  packageName: string;
  packagePrice: number;
  packageId: string | number;
  onPaymentSuccess: (response: any) => void;
  onPaymentError: (error: string) => void;
  onCancel: () => void;
  isProcessing: boolean;
}

interface CustomerInfo {
  name: string;
  email: string;
}

// Stripe card element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#1a1a1a',
      '::placeholder': {
        color: '#6b7280',
      },
      iconColor: '#6b7280',
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
  hidePostalCode: true,
};

// Inner payment form component
function PaymentFormInner({
  packageName,
  packagePrice,
  packageId,
  onPaymentSuccess,
  onPaymentError,
  onCancel,
  isProcessing
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: ''
  });
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const handleCustomerInfoChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleCardChange = (event: any) => {
    setCardError(event.error ? event.error.message : null);
    setCardComplete(event.complete);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isSubmitting || isProcessing || !stripe || !elements) {
      return;
    }

    if (!customerInfo.name.trim() || !customerInfo.email.trim()) {
      setPaymentError('Please fill in all customer information');
      return;
    }

    if (!cardComplete) {
      setPaymentError('Please complete your card information');
      return;
    }

    setIsSubmitting(true);
    setPaymentError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: customerInfo.name,
          email: customerInfo.email,
        },
      });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }

      console.log('Payment Method Created:', paymentMethod);

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockResponse = {
        success: true,
        payment_intent_id: `pi_${Date.now()}`,
        payment_method_id: paymentMethod.id,
        amount: packagePrice * 100,
        currency: 'usd',
        status: 'succeeded',
        package_id: packageId,
        package_name: packageName,
        customer: {
          name: customerInfo.name,
          email: customerInfo.email
        }
      };

      onPaymentSuccess(mockResponse);

    } catch (err: any) {
      const errorMessage = err?.message || 'Payment failed. Please try again.';
      setPaymentError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return (
      customerInfo.name.trim() &&
      customerInfo.email.trim() &&
      customerInfo.email.includes('@') &&
      cardComplete
    );
  };

  return (
    <div className="bg-[#0E1627] rounded-xl border border-gray-800 p-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-lg bg-blue-600/20 p-2">
          <CreditCard className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Payment Details</h3>
          <p className="text-sm text-gray-400">Secure payment with Stripe</p>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300">{packageName}</span>
          <span className="font-semibold text-white">${packagePrice}/month</span>
        </div>
        <div className="text-xs text-gray-500">Billed monthly • Cancel anytime</div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={customerInfo.name}
              onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={customerInfo.email}
              onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Card Information
          </label>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
            <CardElement
              options={cardElementOptions}
              onChange={handleCardChange}
            />
          </div>
          {cardError && (
            <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
              <AlertCircle className="h-4 w-4" />
              {cardError}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-gray-400 text-xs mb-6">
          <Lock className="h-3 w-3" />
          <span>Your payment information is secure and encrypted</span>
        </div>

        {paymentError && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
            <AlertCircle className="h-4 w-4" />
            {paymentError}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isFormValid() || isSubmitting || !stripe}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Pay ${packagePrice}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function PaymentForm(props: PaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormInner {...props} />
    </Elements>
  );
}