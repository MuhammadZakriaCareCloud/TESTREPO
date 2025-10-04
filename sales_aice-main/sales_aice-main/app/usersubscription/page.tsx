/**
 * User Subscription Page - Package Selection
 * 
 * This page allows users to:
 * - View available subscription packages
 * - Compare features across different plans
 * - Subscribe to a selected package
 * - View pricing and limits
 * 
 * API Integration: 
 * - GET /api/subscriptions/admin/packages/ - Fetches available packages
 * - POST /api/subscriptions/subscribe/ - Subscribes user to selected package
 * 
 * Status: Using REAL API (USE_MOCK_DATA = false)
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Star, Zap, Shield, BarChart3, Users, Phone, Clock, CreditCard, CheckCircle } from 'lucide-react';
import { axiosInstance } from '../../utils/axiosInstance';
import PaymentForm from '../../components/PaymentForm';

// -----------------------------
// Types
// -----------------------------
type ApiResponse = {
  success: boolean;
  message: string;
  packages: Package[];
};

type Package = {
  id: number | string;
  name: string;
  price_monthly: number | string;
  minutes_inbound_limit: number;
  minutes_outbound_limit: number;
  minutes_total_limit: number;
  agents_allowed: number;
  analytics_access: boolean;
  features: Record<string, any>;
  is_active: boolean;
  created_at: string;
  description?: string;
  popular?: boolean;
};

// -----------------------------
// API Configuration
// -----------------------------
const USE_MOCK_DATA = false; // Set to false to use real API

// Mock data for development
const mockPackages: Package[] = [
  {
    id: 1,
    name: "Starter",
    price_monthly: 29,
    minutes_inbound_limit: 500,
    minutes_outbound_limit: 300,
    minutes_total_limit: 800,
    agents_allowed: 2,
    analytics_access: false,
    features: {
      call_recording: true,
      basic_analytics: false,
      priority_support: false,
      custom_scripts: false,
      api_access: false
    },
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    description: "Perfect for small businesses getting started with AI calling"
  },
  {
    id: 2,
    name: "Professional",
    price_monthly: 79,
    minutes_inbound_limit: 1500,
    minutes_outbound_limit: 1000,
    minutes_total_limit: 2500,
    agents_allowed: 5,
    analytics_access: true,
    features: {
      call_recording: true,
      basic_analytics: true,
      priority_support: true,
      custom_scripts: true,
      api_access: false
    },
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    description: "Ideal for growing teams that need advanced features",
    popular: true
  },
  {
    id: 3,
    name: "Enterprise",
    price_monthly: 199,
    minutes_inbound_limit: 5000,
    minutes_outbound_limit: 3000,
    minutes_total_limit: 8000,
    agents_allowed: 15,
    analytics_access: true,
    features: {
      call_recording: true,
      basic_analytics: true,
      priority_support: true,
      custom_scripts: true,
      api_access: true
    },
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    description: "For large organizations with high-volume calling needs"
  }
];

// -----------------------------
// Helper Functions
// -----------------------------
function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return numPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function getFeatureIcon(feature: string) {
  switch (feature) {
    case 'call_recording': return <Phone className="h-4 w-4" />;
    case 'basic_analytics': return <BarChart3 className="h-4 w-4" />;
    case 'priority_support': return <Shield className="h-4 w-4" />;
    case 'custom_scripts': return <Zap className="h-4 w-4" />;
    case 'api_access': return <CreditCard className="h-4 w-4" />;
    default: return <Check className="h-4 w-4" />;
  }
}

function getFeatureLabel(feature: string): string {
  switch (feature) {
    case 'call_recording': return 'Call Recording';
    case 'basic_analytics': return 'Advanced Analytics';
    case 'priority_support': return 'Priority Support';
    case 'custom_scripts': return 'Custom Scripts';
    case 'api_access': return 'API Access';
    default: return feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}

// Plan Confirmation Modal Component
function PlanConfirmationModal({
  isOpen,
  package: pkg,
  onConfirm,
  onCancel,
  isLoading
}: {
  isOpen: boolean;
  package: Package | null;
  onConfirm: (pkg: Package) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  if (!isOpen || !pkg) return null;

  const price = typeof pkg.price_monthly === 'string' ? parseFloat(pkg.price_monthly) : pkg.price_monthly;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="mx-4 max-w-lg w-full rounded-2xl border border-white/10 bg-[#0E1627] p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Confirm Your Subscription
          </h2>
          <p className="text-gray-400">
            You're about to subscribe to the following plan:
          </p>
        </div>

        {/* Plan Details */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-white">{pkg.name}</h3>
            {pkg.popular && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-1 text-xs font-medium text-white">
                <Star className="h-3 w-3" />
                Popular
              </span>
            )}
          </div>
          
          <div className="text-3xl font-bold text-white mb-4">
            ${formatPrice(price)}<span className="text-lg text-gray-400">/month</span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <span className="text-gray-300">
                {pkg.minutes_total_limit ? 
                  `${pkg.minutes_total_limit.toLocaleString()} total minutes` :
                  `${pkg.minutes_inbound_limit.toLocaleString()} inbound + ${pkg.minutes_outbound_limit.toLocaleString()} outbound`
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-400" />
              <span className="text-gray-300">{pkg.agents_allowed} AI agents</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-400" />
              <span className="text-gray-300">
                {pkg.analytics_access ? 'Advanced Analytics' : 'Basic Analytics'}
              </span>
            </div>
          </div>
        </div>

        {/* Billing Information */}
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 mb-6">
          <h4 className="text-sm font-semibold text-yellow-300 mb-2">Billing Information</h4>
          <ul className="text-xs text-yellow-200/80 space-y-1">
            <li>• Your first payment will be processed immediately</li>
            <li>• Subscription renews automatically every month</li>
            <li>• You can cancel anytime from your dashboard</li>
            <li>• No setup fees or hidden charges</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 py-3 px-4 font-medium text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(pkg)}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-green-600 hover:bg-green-700 py-3 px-4 font-medium text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              'Proceed to Payment'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Payment Processing Modal Component
function PaymentProcessingModal({
  isOpen,
  packageName,
  step
}: {
  isOpen: boolean;
  packageName: string;
  step: 'validating' | 'processing' | 'confirming';
}) {
  if (!isOpen) return null;

  const getStepInfo = () => {
    switch (step) {
      case 'validating':
        return {
          title: 'Validating Package',
          description: 'Verifying your package selection...',
          icon: <Shield className="h-8 w-8 text-blue-400" />
        };
      case 'processing':
        return {
          title: 'Processing Payment',
          description: 'Securely processing your subscription...',
          icon: <CreditCard className="h-8 w-8 text-yellow-400" />
        };
      case 'confirming':
        return {
          title: 'Confirming Subscription',
          description: 'Setting up your account...',
          icon: <CheckCircle className="h-8 w-8 text-green-400" />
        };
    }
  };

  const stepInfo = getStepInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="mx-4 max-w-sm w-full rounded-2xl border border-white/10 bg-[#0E1627] p-8 text-center">
        {/* Processing Icon */}
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-white/5 p-4 animate-pulse">
            {stepInfo.icon}
          </div>
        </div>

        {/* Processing Message */}
        <h2 className="text-xl font-bold text-white mb-2">
          {stepInfo.title}
        </h2>
        <p className="text-gray-400 mb-4">
          {stepInfo.description}
        </p>
        <p className="text-sm text-gray-500">
          Package: <span className="text-white">{packageName}</span>
        </p>

        {/* Loading Spinner */}
        <div className="flex justify-center mt-6">
          <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center items-center gap-2 mt-6">
          <div className={`w-3 h-3 rounded-full ${step === 'validating' ? 'bg-blue-600' : step === 'processing' || step === 'confirming' ? 'bg-blue-600' : 'bg-gray-600'}`}></div>
          <div className={`w-3 h-3 rounded-full ${step === 'processing' ? 'bg-yellow-500' : step === 'confirming' ? 'bg-yellow-500' : 'bg-gray-600'}`}></div>
          <div className={`w-3 h-3 rounded-full ${step === 'confirming' ? 'bg-green-500' : 'bg-gray-600'}`}></div>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Please don't close this window...
        </p>
      </div>
    </div>
  );
}

// Payment Modal Component
function PaymentModal({
  isOpen,
  package: pkg,
  onPaymentSuccess,
  onPaymentError,
  onCancel,
  isProcessing
}: {
  isOpen: boolean;
  package: Package | null;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  onCancel: () => void;
  isProcessing: boolean;
}) {
  if (!isOpen || !pkg) return null;

  const price = typeof pkg.price_monthly === 'string' ? parseFloat(pkg.price_monthly) : pkg.price_monthly;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0E1627]">
        {/* Header */}
        <div className="sticky top-0 bg-[#0E1627] border-b border-white/10 p-6 pb-4">
          <h2 className="text-2xl font-bold text-white mb-2">
            Complete Your Payment
          </h2>
          <p className="text-gray-400">
            {pkg.name} Plan - ${price}/month
          </p>
        </div>

        {/* Payment Form */}
        <div className="p-6">
          <PaymentForm
            packageName={pkg.name}
            packagePrice={price}
            packageId={pkg.id}
            onPaymentSuccess={onPaymentSuccess}
            onPaymentError={onPaymentError}
            onCancel={onCancel}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  );
}

// Success Modal Component
function SubscriptionSuccessModal({ 
  isOpen, 
  packageName, 
  packagePrice, 
  countdown,
  onGoToDashboard 
}: {
  isOpen: boolean;
  packageName: string;
  packagePrice: number;
  countdown: number;
  onGoToDashboard: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="mx-4 max-w-md w-full rounded-2xl border border-green-500/30 bg-[#0E1627] p-8 shadow-2xl">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-green-500/20 p-3">
            <Check className="h-12 w-12 text-green-400" />
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Subscription Successful! 🎉
          </h2>
          <p className="text-gray-400">
            You have successfully subscribed to the <span className="text-green-400 font-semibold">{packageName}</span> plan
          </p>
        </div>

        {/* Package Details */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Plan:</span>
            <span className="text-white font-semibold">{packageName}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-300">Monthly Cost:</span>
            <span className="text-green-400 font-bold">${packagePrice}/month</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-300">Status:</span>
            <span className="text-green-400 font-semibold">Active</span>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-2">What's Next?</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              Access your dashboard to start making AI calls
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              Configure your AI agents
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              Monitor your call analytics
            </li>
          </ul>
        </div>

        {/* Auto Redirect */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-400">
            Redirecting to dashboard in <span className="text-white font-bold">{countdown}</span> seconds...
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onGoToDashboard}
          className="w-full rounded-lg bg-green-600 hover:bg-green-700 py-3 px-4 font-medium text-white transition-colors"
        >
          Go to Dashboard Now
        </button>
      </div>
    </div>
  );
}

// -----------------------------
// Components
// -----------------------------
function PackageCard({ pkg, onSubscribe, isSubscribing }: {
  pkg: Package;
  onSubscribe: (pkg: Package) => void;
  isSubscribing: boolean;
}) {
  const price = typeof pkg.price_monthly === 'string' ? parseFloat(pkg.price_monthly) : pkg.price_monthly;
  
  return (
    <div className={`relative rounded-2xl border bg-[#0E1627] p-6 shadow-sm transition-all hover:shadow-lg ${
      pkg.popular 
        ? 'border-blue-500/50 ring-1 ring-blue-500/20' 
        : 'border-white/10 hover:border-white/20'
    }`}>
      {pkg.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
            <Star className="h-3 w-3" />
            Most Popular
          </div>
        </div>
      )}
      
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white">{pkg.name}</h3>
        {pkg.description && (
          <p className="mt-2 text-sm text-gray-400">{pkg.description}</p>
        )}
        
        <div className="mt-4">
          <span className="text-4xl font-bold text-white">${formatPrice(price)}</span>
          <span className="text-gray-400">/month</span>
        </div>
      </div>

      {/* Features */}
      <div className="mt-6 space-y-4">
        {/* Minutes */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600/20">
            <Clock className="h-3 w-3 text-blue-400" />
          </div>
          <span className="text-gray-300">
            {pkg.minutes_total_limit ? 
              `${pkg.minutes_total_limit.toLocaleString()} total minutes` :
              `${pkg.minutes_inbound_limit.toLocaleString()} inbound, ${pkg.minutes_outbound_limit.toLocaleString()} outbound`
            }
          </span>
        </div>

        {/* Agents */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600/20">
            <Users className="h-3 w-3 text-green-400" />
          </div>
          <span className="text-gray-300">
            {pkg.agents_allowed} AI {pkg.agents_allowed === 1 ? 'agent' : 'agents'}
          </span>
        </div>

        {/* Analytics */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600/20">
            <BarChart3 className="h-3 w-3 text-purple-400" />
          </div>
          <span className="text-gray-300">
            {pkg.analytics_access ? 'Advanced Analytics' : 'Basic Analytics'}
          </span>
        </div>

        {/* Additional Features */}
        {pkg.features && Object.entries(pkg.features).map(([key, value]) => (
          <div key={key} className="flex items-center gap-3 text-sm">
            <div className={`flex h-5 w-5 items-center justify-center rounded-full ${
              value ? 'bg-emerald-600/20' : 'bg-gray-600/20'
            }`}>
              {value ? (
                <Check className="h-3 w-3 text-emerald-400" />
              ) : (
                <X className="h-3 w-3 text-gray-500" />
              )}
            </div>
            <span className={value ? 'text-gray-300' : 'text-gray-500'}>
              {getFeatureLabel(key)}
            </span>
          </div>
        ))}
      </div>

      {/* Subscribe Button */}
      <button
        onClick={() => onSubscribe(pkg)}
        disabled={isSubscribing}
        className={`mt-6 w-full rounded-lg py-3 px-4 font-medium transition-colors flex items-center justify-center gap-2 ${
          pkg.popular
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-white/5 hover:bg-white/10 text-white border border-white/20'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isSubscribing ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Processing...
          </>
        ) : (
          'Choose Plan'
        )}
      </button>
    </div>
  );
}

// -----------------------------
// Main Component
// -----------------------------
export default function UserSubscriptionPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribingTo, setSubscribingTo] = useState<string | number | null>(null);
  const [subscriptionSuccess, setSubscriptionSuccess] = useState<{
    show: boolean;
    packageName: string;
    packagePrice: number;
  }>({ show: false, packageName: '', packagePrice: 0 });
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [processingPayment, setProcessingPayment] = useState<{
    show: boolean;
    packageName: string;
    step: 'validating' | 'processing' | 'confirming';
  }>({ show: false, packageName: '', step: 'validating' });
  const [confirmSubscription, setConfirmSubscription] = useState<{
    show: boolean;
    package: Package | null;
  }>({ show: false, package: null });
  const [showPaymentForm, setShowPaymentForm] = useState<{
    show: boolean;
    package: Package | null;
  }>({ show: false, package: null });

  // Load packages
  useEffect(() => {
    const loadPackages = async () => {
      try {
        setLoading(true);
        setError(null);

        if (USE_MOCK_DATA) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));
          setPackages(mockPackages);
        } else {
          // Real API call
          const response = await axiosInstance.get<ApiResponse>('/api/subscriptions/admin/packages/');
          const activePackages = response.data.packages.filter(pkg => pkg.is_active);
          setPackages(activePackages);
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load packages');
      } finally {
        setLoading(false);
      }
    };

    loadPackages();
  }, []);

  // Show confirmation modal
  const handleSubscribe = (pkg: Package) => {
    setConfirmSubscription({
      show: true,
      package: pkg
    });
  };

  // Handle confirmed subscription - show payment form
  const handleConfirmedSubscribe = async (pkg: Package) => {
    // Close confirmation modal and show payment form
    setConfirmSubscription({ show: false, package: null });
    setShowPaymentForm({ show: true, package: pkg });
  };

  // Handle successful payment
  const handlePaymentSuccess = async (response: any) => {
    const pkg = showPaymentForm.package;
    if (!pkg) return;

    // Close payment form
    setShowPaymentForm({ show: false, package: null });
    
    console.log('Payment successful:', response);
    
    // Hide any processing modals
    setProcessingPayment({ show: false, packageName: '', step: 'validating' });
    
    // Show success screen
    const price = typeof pkg.price_monthly === 'string' ? parseFloat(pkg.price_monthly) : pkg.price_monthly;
    setSubscriptionSuccess({
      show: true,
      packageName: pkg.name,
      packagePrice: price
    });
    
    // Start countdown and redirect
    startRedirectCountdown();
  };

  // Handle payment error
  const handlePaymentError = (error: string) => {
    // Close payment form
    setShowPaymentForm({ show: false, package: null });
    alert('Payment failed: ' + error);
  };

  // Handle payment cancellation
  const handlePaymentCancel = () => {
    setShowPaymentForm({ show: false, package: null });
  };

  // Start redirect countdown
  const startRedirectCountdown = () => {
    setRedirectCountdown(5);
    const interval = setInterval(() => {
      setRedirectCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      {/* Plan Confirmation Modal */}
      <PlanConfirmationModal
        isOpen={confirmSubscription.show}
        package={confirmSubscription.package}
        onConfirm={handleConfirmedSubscribe}
        onCancel={() => setConfirmSubscription({ show: false, package: null })}
        isLoading={subscribingTo !== null}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentForm.show}
        package={showPaymentForm.package}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
        onCancel={handlePaymentCancel}
        isProcessing={subscribingTo !== null}
      />

      {/* Payment Processing Modal */}
      <PaymentProcessingModal
        isOpen={processingPayment.show}
        packageName={processingPayment.packageName}
        step={processingPayment.step}
      />

      {/* Success Modal */}
      <SubscriptionSuccessModal
        isOpen={subscriptionSuccess.show}
        packageName={subscriptionSuccess.packageName}
        packagePrice={subscriptionSuccess.packagePrice}
        countdown={redirectCountdown}
        onGoToDashboard={() => router.push('/dashboard')}
      />
      
      <div className="mx-auto max-w-7xl px-4 py-25 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Choose Your AI Calling Plan
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Select the perfect package for your business needs. Start making AI-powered calls today.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl border border-white/10 bg-[#0E1627] p-6 animate-pulse">
                <div className="h-6 bg-white/10 rounded mb-4"></div>
                <div className="h-4 bg-white/5 rounded mb-6"></div>
                <div className="h-12 bg-white/10 rounded mb-6"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(j => (
                    <div key={j} className="h-4 bg-white/5 rounded"></div>
                  ))}
                </div>
                <div className="h-12 bg-white/10 rounded mt-6"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center">
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-red-300 mb-2">Failed to Load Packages</h3>
              <p className="text-red-400/90 text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Packages Grid */}
        {!loading && !error && packages.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {packages.map(pkg => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                onSubscribe={handleSubscribe}
                isSubscribing={subscribingTo === pkg.id}
              />
            ))}
          </div>
        )}

        {/* No Packages */}
        {!loading && !error && packages.length === 0 && (
          <div className="text-center">
            <div className="rounded-xl border border-gray-800 bg-[#0E1627] p-12 max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-2">No Packages Available</h3>
              <p className="text-gray-400 text-sm">
                No subscription packages are currently available. Please check back later.
              </p>
            </div>
          </div>
        )}

        {/* Features Comparison */}
        {!loading && !error && packages.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8">Feature Comparison</h2>
            <div className="rounded-xl border border-white/10 bg-[#0E1627] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-800">
                    <tr>
                      <th className="text-left px-6 py-4 font-medium">Features</th>
                      {packages.map(pkg => (
                        <th key={pkg.id} className="text-center px-6 py-4 font-medium">
                          {pkg.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-800/50">
                      <td className="px-6 py-4 font-medium">Monthly Price</td>
                      {packages.map(pkg => (
                        <td key={pkg.id} className="text-center px-6 py-4">
                          ${formatPrice(pkg.price_monthly)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="px-6 py-4 font-medium">Total Minutes</td>
                      {packages.map(pkg => (
                        <td key={pkg.id} className="text-center px-6 py-4">
                          {pkg.minutes_total_limit?.toLocaleString() || 
                           `${pkg.minutes_inbound_limit + pkg.minutes_outbound_limit}`}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="px-6 py-4 font-medium">AI Agents</td>
                      {packages.map(pkg => (
                        <td key={pkg.id} className="text-center px-6 py-4">
                          {pkg.agents_allowed}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="px-6 py-4 font-medium">Advanced Analytics</td>
                      {packages.map(pkg => (
                        <td key={pkg.id} className="text-center px-6 py-4">
                          {pkg.analytics_access ? (
                            <Check className="h-5 w-5 text-green-400 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-gray-500 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                    {/* Dynamic feature rows */}
                    {Object.keys(packages[0]?.features || {}).map(featureKey => (
                      <tr key={featureKey} className="border-b border-gray-800/50">
                        <td className="px-6 py-4 font-medium">{getFeatureLabel(featureKey)}</td>
                        {packages.map(pkg => (
                          <td key={pkg.id} className="text-center px-6 py-4">
                            {pkg.features[featureKey] ? (
                              <Check className="h-5 w-5 text-green-400 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-gray-500 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Support Section */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold mb-4">Need Help Choosing?</h3>
          <p className="text-gray-400 mb-6">
            Our team is here to help you find the perfect plan for your business needs.
          </p>
          <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg font-medium transition-colors">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
}