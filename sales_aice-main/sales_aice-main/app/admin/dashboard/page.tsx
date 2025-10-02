'use client';

import { useEffect, useState } from 'react';
import {
  Users, Package, Plus, Settings, Phone
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../../context/auth-context';
import { axiosInstance } from '../../../utils/axiosInstance';

// ---------------- Types ----------------
type MiniUser = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  joined_at: string; // ISO
  status: 'active' | 'inactive' | 'banned';
};

type MiniPackage = {
  id: string;
  name: string;
  price_monthly: number;
  subscribers: number;
  minutes_included: number;
};

type SparkPoint = { x: number; y: number };

type AdminDashboardData = {
  metrics: {
    totalUsers: number;
    activeUsers: number;
    totalPackages: number;
    mrrUsd: number;
    callsToday: number;
    churnRatePct: number;
  };
  trends: {
    mrr: SparkPoint[];
    calls: SparkPoint[];
    users: SparkPoint[];
  };
  recentUsers: MiniUser[];
  topPackages: MiniPackage[];
};

// API may return price_monthly as a string
type ApiDashboardPayload = AdminDashboardData & {
  topPackages: Array<Omit<MiniPackage, 'price_monthly'> & { price_monthly: number | string }>;
};

function transformDashboard(api: ApiDashboardPayload): AdminDashboardData {
  return {
    ...api,
    topPackages: api.topPackages.map(p => ({
      ...p,
      price_monthly: typeof p.price_monthly === 'string'
        ? parseFloat(p.price_monthly)
        : p.price_monthly,
    })),
  };
}

// ---------- Real API call via axiosInstance ----------
async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const { data } = await axiosInstance.get<ApiDashboardPayload>('/api/accounts/admin/dashboard/');
  return transformDashboard(data);
}

// ---------------- Small UI bits ----------------
function CardSkeleton() {
  return <div className="rounded-lg border border-gray-800 bg-[#0E1627] p-4 animate-pulse h-28" />;
}

function StatCard({
  title, value, icon: Icon, hint, trend
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
  trend?: SparkPoint[];
}) {
  return (
    <div className="rounded-lg border border-gray-800 bg-[#0E1627] p-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <div className="text-2xl font-semibold mt-1">{value}</div>
        {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
      </div>
      <div className="flex items-center gap-4">
        {trend && <Sparkline data={trend} width={120} height={44} />}
        <div className="rounded-md border border-gray-700 p-2">
          <Icon className="h-5 w-5 text-gray-300" />
        </div>
      </div>
    </div>
  );
}

function Sparkline({ data, width = 120, height = 44 }: { data: SparkPoint[]; width?: number; height?: number }) {
  const minY = Math.min(...data.map(d => d.y));
  const maxY = Math.max(...data.map(d => d.y));
  const rangeY = Math.max(1, maxY - minY);
  const stepX = width / Math.max(1, data.length - 1);

  const path = data
    .map((d, i) => {
      const x = i * stepX;
      const y = height - ((d.y - minY) / rangeY) * height;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="opacity-90">
      <path d={path} fill="none" stroke="currentColor" className="text-gray-400" strokeWidth="2" />
    </svg>
  );
}

function SectionHeader({ title, cta }: { title: string; cta?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-lg font-semibold">{title}</h3>
      {cta}
    </div>
  );
}

function QuickGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Link href="/admin/users" className="group rounded-lg border border-gray-800 bg-[#0E1627] p-4 hover:border-gray-600 transition">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5" />
          <div>
            <p className="font-medium">Manage Users</p>
            <p className="text-xs text-gray-400">Roles, status</p>
          </div>
        </div>
      </Link>
      <Link href="/admin/packages" className="group rounded-lg border border-gray-800 bg-[#0E1627] p-4 hover:border-gray-600 transition">
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5" />
          <div>
            <p className="font-medium">Manage Packages</p>
            <p className="text-xs text-gray-400">Plans & prices</p>
          </div>
        </div>
      </Link>
      <Link href="/admin/settings" className="group rounded-lg border border-gray-800 bg-[#0E1627] p-4 hover:border-gray-600 transition">
        <div className="flex items-center gap-3">
          <Settings className="h-5 w-5" />
          <div>
            <p className="font-medium">Settings</p>
            <p className="text-xs text-gray-400">Billing, limits</p>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ---------------- Mini tables ----------------
function MiniTableUsers({ rows }: { rows: MiniUser[] }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-[#0E1627]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-gray-400 border-b border-gray-800">
            <tr>
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(u => (
              <tr key={u.id} className="border-b border-gray-900/40">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3 text-gray-300">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded-md border border-gray-700 px-2 py-0.5 text-xs">
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">{u.joined_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end px-4 py-2">
        <Link href="/admin/users" className="text-sm text-blue-400 hover:underline">View all users</Link>
      </div>
    </div>
  );
}

function MiniTablePackages({ rows }: { rows: MiniPackage[] }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-[#0E1627]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-gray-400 border-b border-gray-800">
            <tr>
              <th className="text-left px-4 py-3">Package</th>
              <th className="text-left px-4 py-3">Monthly</th>
              <th className="text-left px-4 py-3">Subscribers</th>
              <th className="text-left px-4 py-3">Minutes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(p => (
              <tr key={p.id} className="border-b border-gray-900/40">
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">${p.price_monthly}</td>
                <td className="px-4 py-3">{p.subscribers}</td>
                <td className="px-4 py-3">{p.minutes_included}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-2">
        <Link href="/admin/packages/new" className="flex items-center gap-1 text-sm text-blue-400 hover:underline">
          <Plus className="h-4 w-4" /> Create package
        </Link>
        <Link href="/admin/packages" className="text-sm text-blue-400 hover:underline">View all packages</Link>
      </div>
    </div>
  );
}

// ---------------- Main page ----------------
export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuth(); // not strictly required for the call, but useful to trigger refetch when it appears

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const payload = await fetchAdminDashboard();
        if (active) setData(payload);
      } catch (e: any) {
        if (active) setError(e?.message ?? 'Failed to load');
      }
    };

    // Call once on mount and whenever token changes (helps after login)
    load();
    return () => { active = false; };
  }, [accessToken]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-25 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-gray-400">Manage users, packages, and view system analytics.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/packages/new" className="rounded-md border border-gray-700 px-3 py-2 text-sm hover:bg-gray-800 flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Package
          </Link>
        </div>
      </div>

      {/* Quick actions */}
      <QuickGrid />

      {/* Metrics */}
      {!data && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950/30 p-4 text-sm">
          <p className="font-medium text-red-300">Couldn’t load dashboard.</p>
          <p className="text-red-400/90">{error}</p>
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <StatCard
              title="Total Users"
              value={data.metrics.totalUsers.toLocaleString()}
              icon={Users}
              trend={data.trends.users}
            />
            <StatCard
              title="Calls Today"
              value={data.metrics.callsToday.toLocaleString()}
              icon={Phone}
              trend={data.trends.calls}
            />
          </div>

          {/* Secondary KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg border border-gray-800 bg-[#0E1627] p-4">
              <SectionHeader title="Packages Summary" cta={<span className="text-sm text-gray-400">{data.metrics.totalPackages} total</span>} />
              <div className="space-y-2 text-sm">
                {data.topPackages.map(p => (
                  <div key={p.id} className="flex items-center justify-between border border-gray-800 rounded-md px-3 py-2">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-gray-400">${p.price_monthly}/mo · {p.subscribers} subs</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-gray-800 bg-[#0E1627] p-4">
              <SectionHeader title="Quick Create" />
              <div className="grid grid-cols-2 gap-2">
                <Link href="/admin/packages/new" className="rounded-md border border-gray-700 px-3 py-2 text-sm hover:bg-gray-800 flex items-center gap-2">
                  <Package className="h-4 w-4" /> Package
                </Link>
              </div>
            </div>
          </div>

          {/* Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <SectionHeader
                title="Recent Users"
                cta={<Link href="/admin/users" className="text-sm text-blue-400 hover:underline">All users</Link>}
              />
              <MiniTableUsers rows={data.recentUsers} />
            </div>
            <div>
              <SectionHeader
                title="Top Packages"
                cta={<Link href="/admin/packages" className="text-sm text-blue-400 hover:underline">All packages</Link>}
              />
              <MiniTablePackages rows={data.topPackages} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
