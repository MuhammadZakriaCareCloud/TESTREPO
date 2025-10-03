'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { axiosInstance } from '../../../../../utils/axiosInstance';
import { toast } from 'sonner';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

type AdminPackage = {
  id: number | string;
  name: string;
  price_monthly: number | string;
  minutes_inbound_limit: number;
  minutes_outbound_limit: number;
  minutes_total_limit: number;
  agents_allowed: number;
  analytics_access: boolean;
  features: { campaigns?: number; api_access?: boolean; advanced_analytics?: boolean } | null;
  is_active: boolean;
  created_at: string;
};

function normalize(p: AdminPackage): AdminPackage & { price_monthly: number } {
  return { ...p, price_monthly: typeof p.price_monthly === 'string' ? parseFloat(p.price_monthly) : p.price_monthly };
}

export default function EditPackagePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const pkgId = useMemo(() => params?.id, [params?.id]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [name, setName] = useState('');
  const [priceMonthly, setPriceMonthly] = useState<string>('');
  const [minutesTotal, setMinutesTotal] = useState<number>(0);
  const [minutesInbound, setMinutesInbound] = useState<number>(0);
  const [minutesOutbound, setMinutesOutbound] = useState<number>(0);
  const [agentsAllowed, setAgentsAllowed] = useState<number>(1);
  const [analyticsAccess, setAnalyticsAccess] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(true);

  // features (no JSON)
  const [campaigns, setCampaigns] = useState<number>(1);
  const [apiAccess, setApiAccess] = useState<boolean>(false);
  const [advancedAnalytics, setAdvancedAnalytics] = useState<boolean>(false);

  // Load
  useEffect(() => {
    if (!pkgId) return;
    (async () => {
      try {debugger
        setLoading(true);
        setError(null);
        const { data } = await axiosInstance.get<AdminPackage>(`/api/accounts/admin/packages/${pkgId}/`);
        const p = normalize(data);

        setName(p.name);
        setPriceMonthly(String(p.price_monthly ?? ''));
        setMinutesTotal(p.minutes_total_limit ?? 0);
        setMinutesInbound(p.minutes_inbound_limit ?? 0);
        setMinutesOutbound(p.minutes_outbound_limit ?? 0);
        setAgentsAllowed(p.agents_allowed ?? 1);
        setAnalyticsAccess(!!p.analytics_access);
        setIsActive(!!p.is_active);

        setCampaigns(p.features?.campaigns ?? 1);
        setApiAccess(!!p.features?.api_access);
        setAdvancedAnalytics(!!p.features?.advanced_analytics);
      } catch (e: any) {
        const msg = e?.response?.status === 404 ? 'Package not found' : (e?.message ?? 'Failed to load package');
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [pkgId]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return toast.error('Name is required');

    const price = parseFloat(priceMonthly);
    if (Number.isNaN(price) || price < 0) return toast.error('Price must be ≥ 0');
    if (campaigns < 0) return toast.error('Campaigns must be ≥ 0');

    const payload = {
      name,
      price_monthly: price,
      minutes_total_limit: Number(minutesTotal) || 0,
      minutes_inbound_limit: Number(minutesInbound) || 0,
      minutes_outbound_limit: Number(minutesOutbound) || 0,
      agents_allowed: Number(agentsAllowed) || 1,
      analytics_access: !!analyticsAccess,
      is_active: !!isActive,
      features: {
        campaigns: Number(campaigns) || 0,
        api_access: !!apiAccess,
        advanced_analytics: !!advancedAnalytics,
      },
    };

    try {debugger
      setSaving(true);
      await axiosInstance.patch(`/api/accounts/admin/packages/${pkgId}/`, payload);
      toast.success('Package saved');
      router.push('/admin/packages');
    } catch (e: any) {
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : (e?.message ?? 'Failed to save package');
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    const ok = confirm('Delete this package? This cannot be undone.');
    if (!ok) return;
    try {debugger
      setDeleting(true);
      await axiosInstance.delete(`/api/accounts/admin/packages/${pkgId}/`);
      toast.success('Package deleted');
      router.push('/admin/packages');
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? (e?.message ?? 'Failed to delete package');
      toast.error(msg);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="rounded-lg border border-gray-800 bg-[#0E1627] p-4 animate-pulse h-24" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="rounded-lg border border-red-800 bg-red-950/30 p-4 text-sm">
          <p className="font-medium text-red-300">Couldn’t load package.</p>
          <p className="text-red-400/90">{error}</p>
        </div>
        <Link href="/admin/packages" className="text-sm text-blue-400 hover:underline">← Back to packages</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-25 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Package</h1>
        <div className="flex gap-2">
          <Link href="/admin/packages" className="rounded-md border border-gray-700 px-3 py-2 text-sm hover:bg-gray-800">
            <ArrowLeft className="h-4 w-4 inline mr-1" /> Back
          </Link>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="rounded-md border border-red-800 text-red-300 px-3 py-2 text-sm hover:bg-red-900/30 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4 inline mr-1" /> {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      <form onSubmit={onSave} className="space-y-4 rounded-lg border border-gray-800 bg-[#0E1627] p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-300">Name</label>
            <input
              className="mt-1 w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pro"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Monthly Price (USD)</label>
            <input
              type="number"
              step="0.01"
              min={0}
              className="mt-1 w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
              value={priceMonthly}
              onChange={(e) => setPriceMonthly(e.target.value)}
              placeholder="79.00"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Minutes — Total (optional)</label>
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
              value={minutesTotal}
              onChange={(e) => setMinutesTotal(Number(e.target.value))}
              placeholder="e.g. 2000"
            />
            <p className="text-[11px] text-gray-500 mt-1">If set &gt; 0, inbound/outbound limits can be ignored.</p>
          </div>

          <div>
            <label className="text-sm text-gray-300">Minutes — Inbound</label>
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
              value={minutesInbound}
              onChange={(e) => setMinutesInbound(Number(e.target.value))}
              placeholder="1000"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Minutes — Outbound</label>
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
              value={minutesOutbound}
              onChange={(e) => setMinutesOutbound(Number(e.target.value))}
              placeholder="1000"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Agents Allowed</label>
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
              value={agentsAllowed}
              onChange={(e) => setAgentsAllowed(Number(e.target.value))}
              placeholder="5"
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              id="analytics_access"
              type="checkbox"
              checked={analyticsAccess}
              onChange={(e) => setAnalyticsAccess(e.target.checked)}
            />
            <label htmlFor="analytics_access" className="text-sm text-gray-300">Analytics Access</label>
          </div>

          {/* Features — simple fields */}
          <div>
            <label className="text-sm text-gray-300">Campaigns</label>
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
              value={campaigns}
              onChange={(e) => setCampaigns(Number(e.target.value))}
              placeholder="1"
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              id="api_access"
              type="checkbox"
              checked={apiAccess}
              onChange={(e) => setApiAccess(e.target.checked)}
            />
            <label htmlFor="api_access" className="text-sm text-gray-300">API Access</label>
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              id="advanced_analytics"
              type="checkbox"
              checked={advancedAnalytics}
              onChange={(e) => setAdvancedAnalytics(e.target.checked)}
              // disabled={!analyticsAccess}
            />
            <label htmlFor="advanced_analytics" className="text-sm text-gray-300">Advanced Analytics</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="is_active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <label htmlFor="is_active" className="text-sm text-gray-300">Active</label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            disabled={saving}
            type="submit"
            className="rounded-md border border-gray-700 px-3 py-2 text-sm hover:bg-gray-800 flex items-center gap-2 disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
