'use client';
import React from 'react';
import Link from 'next/link';

type Invoice = { id: string; date: string; amount: number; status: 'paid' | 'due' | 'failed' };

const mockInvoices: Invoice[] = [
  { id: 'inv_001', date: '2025-09-01', amount: 29.99, status: 'paid' },
  { id: 'inv_002', date: '2025-08-01', amount: 29.99, status: 'paid' },
  { id: 'inv_003', date: '2025-07-01', amount: 29.99, status: 'paid' },
];

function formatCurrency(n: number) {
  return `$${n.toFixed(2)}`;
}

export default function BillingPage() {
  const currentPlan = { name: 'Pro', priceMonthly: 29.99, nextBilling: '2025-10-01' };

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Billing & Subscription</h1>
            <p className="mt-1 text-sm text-gray-400">Manage plan, payment method and view invoices.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard" className="rounded-md border border-gray-700 px-3 py-2 text-sm hover:bg-gray-800">
              Back
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-gray-800 bg-[#0E1627] p-4">
            <h2 className="text-lg font-medium">Current Plan</h2>
            <div className="mt-3 text-sm text-gray-300">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="font-semibold">{currentPlan.name}</div>
                  <div className="text-xs text-gray-400">Billed monthly</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-semibold">{formatCurrency(currentPlan.priceMonthly)}/mo</div>
                  <div className="text-xs text-gray-400">Next: {currentPlan.nextBilling}</div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Link href="/billing/portal" className="rounded-md border border-gray-700 px-3 py-2 text-sm hover:bg-gray-800">
                  Manage subscription
                </Link>
                <Link href="/billing/method" className="rounded-md border border-gray-700 px-3 py-2 text-sm hover:bg-gray-800">
                  Update payment method
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-800 bg-[#0E1627] p-4">
            <h2 className="text-lg font-medium">Payment Method</h2>
            <div className="mt-3 text-sm text-gray-300">
              <div>Visa •••• 4242</div>
              <div className="text-xs text-gray-400 mt-1">Expires 12/2026</div>
              <div className="mt-4">
                <Link href="/billing/method" className="rounded-md border border-gray-700 px-3 py-2 text-sm hover:bg-gray-800">
                  Update payment method
                </Link>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-6 rounded-lg border border-gray-800 bg-[#0E1627] p-4">
          <h3 className="text-lg font-medium">Invoices</h3>
          <div className="mt-3 text-sm">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="text-left text-gray-400">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Invoice</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {mockInvoices.map(inv => (
                  <tr key={inv.id} className="border-t border-gray-800">
                    <td className="px-3 py-3 text-gray-300">{new Date(inv.date).toLocaleDateString()}</td>
                    <td className="px-3 py-3">{inv.id}</td>
                    <td className="px-3 py-3">{formatCurrency(inv.amount)}</td>
                    <td className="px-3 py-3 text-sm">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${inv.status === 'paid' ? 'bg-emerald-600/30 text-emerald-300' : 'bg-yellow-600/20 text-yellow-200'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <Link href={`/billing/invoices/${inv.id}`} className="text-sm text-blue-400 hover:underline">Download</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 text-xs text-gray-500">
              This is placeholder UI. Replace mock data with API calls to your billing backend.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}