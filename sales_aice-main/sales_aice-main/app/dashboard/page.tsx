"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PhoneIncoming, PhoneOutgoing, Users, History, CreditCard, Gauge, TrendingUp, BarChart3 } from "lucide-react";
import './dashboard-charts.css';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

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
  
  // Chart Data
  weeklyCallTrends: Array<{
    day: string;
    inbound: number;
    outbound: number;
    total: number;
  }>;
  
  hourlyActivity: Array<{
    hour: string;
    calls: number;
  }>;
  
  callTypeDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  
  monthlyUsage: Array<{
    month: string;
    minutes: number;
    calls: number;
  }>;
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
// Chart Components
// -----------------------------

// Weekly Call Trends Line Chart
function WeeklyTrendsChart({ data }: { data: DashboardData['weeklyCallTrends'] }) {
  return (
    <div className="chart-container rounded-2xl border border-white/10 bg-[#0E1627] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Weekly Call Trends</h3>
          <p className="text-sm text-white/60">Inbound vs Outbound calls this week</p>
        </div>
        <TrendingUp className="h-5 w-5 text-blue-400" />
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="day" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="inbound" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              name="Inbound"
            />
            <Line 
              type="monotone" 
              dataKey="outbound" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              name="Outbound"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Hourly Activity Bar Chart
function HourlyActivityChart({ data }: { data: DashboardData['hourlyActivity'] }) {
  return (
    <div className="chart-container rounded-2xl border border-white/10 bg-[#0E1627] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Daily Activity</h3>
          <p className="text-sm text-white/60">Calls by hour today</p>
        </div>
        <BarChart3 className="h-5 w-5 text-purple-400" />
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="hour" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Bar 
              dataKey="calls" 
              fill="#8B5CF6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Call Type Distribution Pie Chart
function CallTypeChart({ data }: { data: DashboardData['callTypeDistribution'] }) {
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight={500}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="chart-container rounded-2xl border border-white/10 bg-[#0E1627] p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">Call Distribution</h3>
        <p className="text-sm text-white/60">Breakdown by call type</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Legend 
              wrapperStyle={{
                color: '#F9FAFB',
                fontSize: '12px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Monthly Usage Area Chart
function MonthlyUsageChart({ data }: { data: DashboardData['monthlyUsage'] }) {
  return (
    <div className="chart-container rounded-2xl border border-white/10 bg-[#0E1627] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Monthly Usage</h3>
          <p className="text-sm text-white/60">Minutes and calls over time</p>
        </div>
        <Gauge className="h-5 w-5 text-emerald-400" />
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="minutes" 
              stroke="#10B981" 
              fillOpacity={1} 
              fill="url(#colorMinutes)"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
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
          
          // Chart Data
          weeklyCallTrends: [
            { day: 'Mon', inbound: 18, outbound: 12, total: 30 },
            { day: 'Tue', inbound: 22, outbound: 18, total: 40 },
            { day: 'Wed', inbound: 25, outbound: 15, total: 40 },
            { day: 'Thu', inbound: 20, outbound: 22, total: 42 },
            { day: 'Fri', inbound: 28, outbound: 20, total: 48 },
            { day: 'Sat', inbound: 15, outbound: 9, total: 24 },
            { day: 'Sun', inbound: 12, outbound: 8, total: 20 },
          ],
          
          hourlyActivity: [
            { hour: '9 AM', calls: 8 },
            { hour: '10 AM', calls: 15 },
            { hour: '11 AM', calls: 22 },
            { hour: '12 PM', calls: 18 },
            { hour: '1 PM', calls: 12 },
            { hour: '2 PM', calls: 25 },
            { hour: '3 PM', calls: 28 },
            { hour: '4 PM', calls: 24 },
            { hour: '5 PM', calls: 16 },
          ],
          
          callTypeDistribution: [
            { name: 'Sales Calls', value: 128, color: '#3B82F6' },
            { name: 'Support Calls', value: 96, color: '#10B981' },
            { name: 'Follow-ups', value: 45, color: '#F59E0B' },
            { name: 'Cold Calls', value: 32, color: '#EF4444' },
          ],
          
          monthlyUsage: [
            { month: 'Aug', minutes: 1850, calls: 180 },
            { month: 'Sep', minutes: 1920, calls: 195 },
            { month: 'Oct', minutes: 742, calls: 96 }, // Current month (partial)
          ],
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

        {/* Analytics Charts */}
        {data && (
          <section className="mt-8">
            <h2 className="mb-6 text-lg font-semibold tracking-tight">Analytics & Insights</h2>
            
            {/* Main charts grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Weekly trends - spans full width on smaller screens */}
              <div className="lg:col-span-2">
                <WeeklyTrendsChart data={data.weeklyCallTrends} />
              </div>
              
              {/* Hourly activity and call distribution */}
              <HourlyActivityChart data={data.hourlyActivity} />
              <CallTypeChart data={data.callTypeDistribution} />
              
              {/* Monthly usage - spans full width */}
              <div className="lg:col-span-2">
                <MonthlyUsageChart data={data.monthlyUsage} />
              </div>
            </div>
          </section>
        )}

        {/* Loading state for charts */}
        {loading && (
          <section className="mt-8">
            <h2 className="mb-6 text-lg font-semibold tracking-tight">Analytics & Insights</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <Skeleton className="h-80" />
              </div>
              <Skeleton className="h-80" />
              <Skeleton className="h-80" />
              <div className="lg:col-span-2">
                <Skeleton className="h-80" />
              </div>
            </div>
          </section>
        )}
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
