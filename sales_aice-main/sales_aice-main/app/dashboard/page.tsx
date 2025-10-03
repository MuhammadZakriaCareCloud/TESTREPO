"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PhoneIncoming, PhoneOutgoing, Users, History, CreditCard, Gauge } from "lucide-react";

// -----------------------------
// Types
// -----------------------------
interface DashboardData {
  // Summary Stats
  inboundCalls: number;      // Total inbound calls this billing cycle
  outboundCalls: number;     // Total outbound calls this billing cycle
  
  // Subscription Info
  planName: string;          // Current subscription plan/package
  planMinutesLimit: number;  // Total minutes in current billing cycle
  planMinutesUsed: number;   // Minutes used in current billing cycle
  renewalDateISO: string;    // Plan renewal/expiry date
  billingCycleStart: string; // Start of current billing cycle
  
  // Additional metrics
  totalCallsThisCycle: number;
  averageCallDuration: number; // in minutes
  callSuccessRate: number;     // percentage
}

// -----------------------------
// Helpers
// -----------------------------
function formatDate(dateISO: string) {
  try {
    const d = new Date(dateISO);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return dateISO;
  }
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

// -----------------------------
// UI Subcomponents
// -----------------------------
function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0E1627] p-4 sm:p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5">
          {icon}
        </div>
        <div>
          <p className="text-sm text-white/70">{label}</p>
          <p className="text-2xl font-semibold tracking-tight text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function UsageBar({ used, limit }: { used: number; limit: number }) {
  const pct = useMemo(() => clamp(Math.round((used / Math.max(limit, 1)) * 100)), [used, limit]);
  const remaining = Math.max(limit - used, 0);
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0E1627] p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-white/70">Minutes usage</p>
            <p className="text-lg font-medium text-white">
              {used} / {limit} min <span className="text-white/60">({pct}%)</span>
            </p>
          </div>
        </div>
      </div>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-white/80 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 text-sm text-white/70">Remaining: {remaining} min</div>
    </div>
  );
}

function QuickAction({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-white/10 bg-[#101c31] p-4 sm:p-5 hover:border-white/20 hover:bg-[#132040] transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
          {icon}
        </div>
        <div>
          <p className="text-base font-medium text-white">{label}</p>
          {/* <p className="text-sm text-white/60">Open</p> */}
        </div>
      </div>
    </Link>
  );
}

// -----------------------------
// Page
// -----------------------------
export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        // TODO: Replace with your real API endpoint (Next API route proxying Django, or direct Django URL)
        // Example: const res = await fetch("/api/dashboard", { credentials: "include" });
        // const json = await res.json();

        // --- MOCK DATA for now (remove when wiring backend) ---
        const mock: DashboardData = {
          // Summary Stats - Total calls this billing cycle
          inboundCalls: 128,
          outboundCalls: 96,
          totalCallsThisCycle: 224,
          
          // Current subscription plan/package
          planName: "Pro – 2,000 min",
          planMinutesLimit: 2000,
          planMinutesUsed: 742,
          
          // Plan renewal/expiry date and billing cycle
          renewalDateISO: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString(),
          billingCycleStart: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
          
          // Additional metrics
          averageCallDuration: 3.2, // minutes
          callSuccessRate: 94.5, // percentage
        };
        await new Promise((r) => setTimeout(r, 400));
        // -----------------------------------------------

        if (!isMounted) return;
        setData(mock);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message ?? "Failed to load dashboard");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#0B1220] text-white">
      <div className="mx-auto max-w-7xl px-4 py-25 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
            <p className="mt-1 text-white/70">Overview of your calling activity and subscription.</p>
            {data && (
              <p className="mt-1 text-sm text-white/50">
                Billing cycle: {formatDate(data.billingCycleStart)} - {formatDate(data.renewalDateISO)}
              </p>
            )}
          </div>
          {data && (
            <div className="flex flex-col gap-2 sm:items-end">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/90">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                Current plan: <span className="font-medium">{data.planName}</span>
              </div>
              <div className="text-sm text-white/70">
                Success rate: <span className="font-medium text-emerald-400">{data.callSuccessRate}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Summary & usage */}
        <section className="grid gap-4 md:grid-cols-3">
          {/* Stat cards - 2x2 grid on larger screens */}
          <div className="md:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {loading ? (
              <>
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </>
            ) : (
              <>
                <StatCard 
                  label="Inbound calls (this cycle)" 
                  value={data?.inboundCalls ?? 0} 
                  icon={<PhoneIncoming className="h-5 w-5" />} 
                />
                <StatCard 
                  label="Outbound calls (this cycle)" 
                  value={data?.outboundCalls ?? 0} 
                  icon={<PhoneOutgoing className="h-5 w-5" />} 
                />
                <StatCard 
                  label="Total calls (this cycle)" 
                  value={data?.totalCallsThisCycle ?? 0} 
                  icon={<Users className="h-5 w-5" />} 
                />
                <StatCard 
                  label="Avg call duration" 
                  value={`${data?.averageCallDuration ?? 0} min`} 
                  icon={<History className="h-5 w-5" />} 
                />
              </>
            )}
          </div>

          {/* Usage bar */}
          <div>
            {loading ? (
              <Skeleton className="h-32" />
            ) : (
              <UsageBar used={data?.planMinutesUsed ?? 0} limit={data?.planMinutesLimit ?? 0} />
            )}
            {!loading && data && (
              <div className="mt-2 space-y-1">
                <p className="text-sm text-white/70">Plan renews on {formatDate(data.renewalDateISO)}</p>
                <p className="text-xs text-white/50">
                  Days remaining: {Math.ceil((new Date(data.renewalDateISO).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
            {error}
          </div>
        )}

        {/* Quick actions */}
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold tracking-tight">Quick access</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <QuickAction href="/calls/inbound" label="Inbound Calls" icon={<PhoneIncoming className="h-5 w-5" />} />
            <QuickAction href="/calls/outbound" label="Outbound Calls" icon={<PhoneOutgoing className="h-5 w-5" />} />
            <QuickAction href="/agents" label="Agent Management" icon={<Users className="h-5 w-5" />} />
            <QuickAction href="/calls/history" label="Call Histories" icon={<History className="h-5 w-5" />} />
            <QuickAction href="/billing" label="Billing / Subscription" icon={<CreditCard className="h-5 w-5" />} />
          </div>
        </section>
      </div>
    </main>
  );
}

// -----------------------------
// Tiny skeleton helper (no external UI libs required)
// -----------------------------
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-white/5 ${className}`} />
  );
}
