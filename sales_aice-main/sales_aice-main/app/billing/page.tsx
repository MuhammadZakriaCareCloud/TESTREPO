// ...existing code...
'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Clock,
  Phone,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Settings,
  Plus,
  DollarSign,
  Download,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
// import { axiosInstance } from '../../utils/axiosInstance'; // Uncomment when API is ready

// Enhanced types for comprehensive billing
type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'failed' | 'processing';
type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing' | 'paused';
type PaymentMethodType = 'card' | 'bank' | 'paypal';

interface Invoice {
  id: string;
  invoice_number: string;
  date: string;
  due_date?: string;
  amount: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  description: string;
  period_start: string;
  period_end: string;
  download_url?: string;
  items: InvoiceItem[];
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  brand?: string; // For cards
  last4?: string; // For cards
  exp_month?: string;
  exp_year?: string;
  bank_name?: string; // For bank accounts
  account_last4?: string; // For bank accounts
  email?: string; // For PayPal
  is_default: boolean;
  created_at: string;
}

interface Subscription {
  id: string;
  plan_name: string;
  plan_id: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  price_monthly: number;
  price_yearly?: number;
  billing_cycle: 'monthly' | 'yearly';
  trial_end?: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  features: string[];
  usage: {
    calls_used: number;
    calls_limit: number;
    minutes_used: number;
    minutes_limit: number;
  };
}

interface BillingData {
  subscription: Subscription;
  upcoming_invoice?: {
    amount: number;
    date: string;
    description: string;
  };
  payment_methods: PaymentMethod[];
  invoices: Invoice[];
  billing_address?: {
    name: string;
    company?: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

// Mock data for comprehensive billing
const mockBillingData: BillingData = {
  subscription: {
    id: 'sub_123',
    plan_name: 'Professional Plan',
    plan_id: 'plan_pro',
    status: 'active',
    current_period_start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    current_period_end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(),
    price_monthly: 49.99,
    price_yearly: 499.99,
    billing_cycle: 'monthly',
    cancel_at_period_end: false,
    features: [
      'Up to 5,000 minutes/month',
      'Advanced AI agents',
      'Real-time analytics',
      'Priority support',
      'Custom integrations'
    ],
    usage: {
      calls_used: 342,
      calls_limit: 1000,
      minutes_used: 1847,
      minutes_limit: 5000
    }
  },
  upcoming_invoice: {
    amount: 49.99,
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(),
    description: 'Professional Plan - Monthly billing'
  },
  payment_methods: [
    {
      id: 'pm_001',
      type: 'card',
      brand: 'Visa',
      last4: '4242',
      exp_month: '12',
      exp_year: '2027',
      is_default: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString()
    },
    {
      id: 'pm_002',
      type: 'card',
      brand: 'Mastercard',
      last4: '8888',
      exp_month: '06',
      exp_year: '2026',
      is_default: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
    }
  ],
  invoices: [
    {
      id: 'inv_001',
      invoice_number: 'INV-2025-001',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      amount: 49.99,
      tax: 4.00,
      total: 53.99,
      status: 'paid',
      description: 'Professional Plan - October 2025',
      period_start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
      period_end: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      download_url: '/invoices/inv_001.pdf',
      items: [
        {
          description: 'Professional Plan (Monthly)',
          quantity: 1,
          unit_price: 49.99,
          total: 49.99
        }
      ]
    },
    {
      id: 'inv_002',
      invoice_number: 'INV-2025-002',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
      amount: 49.99,
      tax: 4.00,
      total: 53.99,
      status: 'paid',
      description: 'Professional Plan - September 2025',
      period_start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
      period_end: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
      download_url: '/invoices/inv_002.pdf',
      items: [
        {
          description: 'Professional Plan (Monthly)',
          quantity: 1,
          unit_price: 49.99,
          total: 49.99
        }
      ]
    }
  ],
  billing_address: {
    name: 'John Smith',
    company: 'Acme Corporation',
    address_line1: '123 Business St',
    city: 'New York',
    state: 'NY',
    postal_code: '10001',
    country: 'US'
  }
};

// Helper functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getStatusColor(status: InvoiceStatus | SubscriptionStatus): string {
  switch (status) {
    case 'paid':
    case 'active': return 'bg-emerald-600/30 text-emerald-300';
    case 'pending':
    case 'processing': return 'bg-blue-600/30 text-blue-300';
    case 'overdue':
    case 'past_due': return 'bg-red-600/30 text-red-300';
    case 'failed': return 'bg-red-600/30 text-red-300';
    case 'trialing': return 'bg-purple-600/30 text-purple-300';
    case 'canceled':
    case 'paused': return 'bg-gray-600/30 text-gray-300';
    default: return 'bg-gray-600/30 text-gray-300';
  }
}

function getStatusIcon(status: InvoiceStatus | SubscriptionStatus) {
  switch (status) {
    case 'paid':
    case 'active': return <CheckCircle className="h-4 w-4" />;
    case 'pending':
    case 'processing': return <Clock className="h-4 w-4" />;
    case 'overdue':
    case 'past_due':
    case 'failed': return <AlertCircle className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
}

export default function BillingPage() {
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with your actual API endpoint
        // const response = await axiosInstance.get<BillingData>('/api/billing/');
        // if (!mounted) return;
        // setBillingData(response.data);

        // --- MOCK DATA for now (remove when API is ready) ---
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
        if (!mounted) return;
        setBillingData(mockBillingData);
        // --------------------------------------------------

      } catch (e: any) {
        if (!mounted) return;
        setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to load billing data');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  const handleDownloadInvoice = (invoiceId: string, downloadUrl: string) => {
    console.log('Downloading invoice:', invoiceId);
    // In real app, this would trigger download
    window.open(downloadUrl, '_blank');
  };

  const handleChangePaymentMethod = () => {
    console.log('Change payment method');
    alert('Change payment method - would open payment form');
  };

  const handleCancelSubscription = () => {
    console.log('Cancel subscription');
    if (confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) {
      alert('Subscription cancellation would be processed');
    }
  };

  const handleUpgradePlan = () => {
    console.log('Upgrade plan');
    alert('Plan upgrade - would show available plans');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0B1220] text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-gray-700 rounded mb-4"></div>
            <div className="h-4 w-96 bg-gray-700 rounded mb-8"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#0B1220] text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-300 mb-2">Failed to Load Billing Data</h2>
            <p className="text-red-200/80 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!billingData) return null;

  const subscription = billingData.subscription;
  const usage = subscription.usage;
  const usagePercentage = Math.round((usage.minutes_used / usage.minutes_limit) * 100);
  const callsPercentage = Math.round((usage.calls_used / usage.calls_limit) * 100);

  return (
    <main className="min-h-screen bg-[#0B1220] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold flex items-center gap-2">
              <CreditCard className="h-8 w-8" />
              Billing & Subscription
            </h1>
            <p className="mt-2 text-gray-400">
              Manage your subscription, payment methods, and billing history
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleUpgradePlan}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium"
            >
              <TrendingUp className="h-4 w-4" />
              Upgrade Plan
            </button>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-700 hover:bg-gray-800 rounded-md text-sm"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Subscription Overview */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Current Plan */}
          <div className="lg:col-span-2 rounded-xl border border-gray-800 bg-[#0E1627] p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">{subscription.plan_name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(subscription.status)}
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(subscription.status)}`}>
                    {subscription.status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {formatCurrency(subscription.price_monthly)}
                  <span className="text-sm font-normal text-gray-400">/month</span>
                </div>
                {subscription.price_yearly && (
                  <div className="text-sm text-gray-400">
                    {formatCurrency(subscription.price_yearly)}/year (save 17%)
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Plan Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {subscription.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next billing */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <div>
                <div className="text-sm text-gray-400">Next billing date</div>
                <div className="font-medium">{formatDate(subscription.current_period_end)}</div>
              </div>
              {billingData.upcoming_invoice && (
                <div className="text-right">
                  <div className="text-sm text-gray-400">Amount due</div>
                  <div className="font-medium">{formatCurrency(billingData.upcoming_invoice.amount)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Usage Stats */}
          <div className="space-y-4">
            {/* Minutes Usage */}
            <div className="rounded-xl border border-gray-800 bg-[#0E1627] p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium">Minutes Usage</span>
                </div>
                <span className="text-sm text-gray-400">{usagePercentage}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full transition-all ${usagePercentage > 80 ? 'bg-red-500' : usagePercentage > 60 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-400">
                {usage.minutes_used.toLocaleString()} / {usage.minutes_limit.toLocaleString()} minutes
              </div>
            </div>

            {/* Calls Usage */}
            <div className="rounded-xl border border-gray-800 bg-[#0E1627] p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-medium">Calls Usage</span>
                </div>
                <span className="text-sm text-gray-400">{callsPercentage}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full transition-all ${callsPercentage > 80 ? 'bg-red-500' : callsPercentage > 60 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(callsPercentage, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-400">
                {usage.calls_used.toLocaleString()} / {usage.calls_limit.toLocaleString()} calls
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods & Billing Address */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {/* Payment Methods */}
          <div className="rounded-xl border border-gray-800 bg-[#0E1627] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Payment Methods</h2>
              <button 
                onClick={handleChangePaymentMethod}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-700 hover:bg-gray-800 rounded-md"
              >
                <Plus className="h-4 w-4" />
                Add Method
              </button>
            </div>
            
            <div className="space-y-3">
              {billingData.payment_methods.map((method) => (
                <div 
                  key={method.id} 
                  className={`p-4 rounded-lg border ${method.is_default ? 'border-blue-500 bg-blue-500/5' : 'border-gray-700'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-gray-700">
                        {method.type === 'card' ? (
                          <CreditCard className="h-4 w-4" />
                        ) : (
                          <DollarSign className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {method.type === 'card' 
                            ? `${method.brand} •••• ${method.last4}`
                            : method.type === 'bank'
                            ? `${method.bank_name} •••• ${method.account_last4}`
                            : method.email
                          }
                        </div>
                        {method.type === 'card' && (
                          <div className="text-sm text-gray-400">
                            Expires {method.exp_month}/{method.exp_year}
                          </div>
                        )}
                        {method.is_default && (
                          <div className="text-xs text-blue-400 font-medium">Default</div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-1 text-gray-400 hover:text-gray-300">
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Billing Address */}
          {billingData.billing_address && (
            <div className="rounded-xl border border-gray-800 bg-[#0E1627] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Billing Address</h2>
                <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-700 hover:bg-gray-800 rounded-md">
                  <Settings className="h-4 w-4" />
                  Edit
                </button>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="font-medium">{billingData.billing_address.name}</div>
                {billingData.billing_address.company && (
                  <div className="text-gray-400">{billingData.billing_address.company}</div>
                )}
                <div className="text-gray-300">
                  {billingData.billing_address.address_line1}
                  {billingData.billing_address.address_line2 && (
                    <><br />{billingData.billing_address.address_line2}</>
                  )}
                </div>
                <div className="text-gray-300">
                  {billingData.billing_address.city}, {billingData.billing_address.state} {billingData.billing_address.postal_code}
                </div>
                <div className="text-gray-300">{billingData.billing_address.country}</div>
              </div>
            </div>
          )}
        </div>

        {/* Invoice History */}
        <div className="rounded-xl border border-gray-800 bg-[#0E1627] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Invoice History</h2>
            <div className="text-sm text-gray-400">
              {billingData.invoices.length} invoices
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-700">
                <tr className="text-left text-sm text-gray-400">
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {billingData.invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                    <td className="px-4 py-4">
                      <div className="font-medium">{invoice.invoice_number}</div>
                      <div className="text-xs text-gray-400">{invoice.description}</div>
                    </td>
                    <td className="px-4 py-4 text-gray-300">
                      <div className="text-xs">
                        {formatDate(invoice.period_start)} - {formatDate(invoice.period_end)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium">{formatCurrency(invoice.total)}</div>
                      <div className="text-xs text-gray-400">
                        Subtotal: {formatCurrency(invoice.amount)}
                        {invoice.tax > 0 && ` + Tax: ${formatCurrency(invoice.tax)}`}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-300">
                      {formatDate(invoice.date)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {invoice.download_url && (
                          <button
                            onClick={() => handleDownloadInvoice(invoice.id, invoice.download_url!)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-gray-700 hover:bg-gray-800 rounded"
                          >
                            <Download className="h-3 w-3" />
                            PDF
                          </button>
                        )}
                        <button className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-400 hover:text-blue-300">
                          <ExternalLink className="h-3 w-3" />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subscription Management */}
        <div className="rounded-xl border border-gray-800 bg-[#0E1627] p-6">
          <h2 className="text-xl font-semibold mb-4">Subscription Management</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleUpgradePlan}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium"
            >
              <TrendingUp className="h-4 w-4" />
              Upgrade Plan
            </button>
            <button 
              onClick={handleChangePaymentMethod}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-700 hover:bg-gray-800 rounded-md text-sm"
            >
              <CreditCard className="h-4 w-4" />
              Update Payment Method
            </button>
            <button 
              onClick={handleCancelSubscription}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-red-700 text-red-400 hover:bg-red-900/20 rounded-md text-sm"
            >
              <AlertCircle className="h-4 w-4" />
              Cancel Subscription
            </button>
          </div>
          
          {subscription.cancel_at_period_end && (
            <div className="mt-4 p-4 rounded-lg border border-yellow-700 bg-yellow-900/20">
              <div className="flex items-center gap-2 text-yellow-400">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Subscription Scheduled for Cancellation</span>
              </div>
              <p className="text-sm text-yellow-300 mt-1">
                Your subscription will be canceled at the end of the current billing period on {formatDate(subscription.current_period_end)}.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
// ...existing code...