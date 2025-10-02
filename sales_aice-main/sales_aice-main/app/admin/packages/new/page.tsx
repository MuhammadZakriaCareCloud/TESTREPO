'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { axiosInstance } from '../../../../utils/axiosInstance'; // ← adjust if yours lives elsewhere
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

type CreatePayload = {
  name: string;
  price_monthly: number;
  minutes_inbound_limit: number;
  minutes_outbound_limit: number;
  minutes_total_limit: number;
  agents_allowed: number;
  analytics_access: boolean;
  features: {
    campaigns: number;
    api_access: boolean;
    advanced_analytics: boolean;
  };
  is_active: boolean;
};

export default function NewPackagePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // keep inputs as strings for UX; convert on submit
  const [name, setName] = useState('');
  const [price, setPrice] = useState<string>(''); // USD
  const [minutesTotal, setMinutesTotal] = useState<string>('0');
  const [minutesInbound, setMinutesInbound] = useState<string>('0');
  const [minutesOutbound, setMinutesOutbound] = useState<string>('0');
  const [agentsAllowed, setAgentsAllowed] = useState<string>('1');
  const [analyticsAccess, setAnalyticsAccess] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // features (no JSON textarea)
  const [campaigns, setCampaigns] = useState<string>('1');
  const [apiAccess, setApiAccess] = useState(false);
  const [advancedAnalytics, setAdvancedAnalytics] = useState(false);

  // if analytics_access is off, force advanced_analytics off too
  useEffect(() => {
    if (!analyticsAccess && advancedAnalytics) {
      setAdvancedAnalytics(false);
    }
  }, [analyticsAccess, advancedAnalytics]);

  const toInt = (v: string, fallback = 0) => {
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const toPrice = (v: string) => {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) && n >= 0 ? Number(n.toFixed(2)) : NaN;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const priceMonthly = toPrice(price);
    const total = toInt(minutesTotal);
    const inbound = toInt(minutesInbound);
    const outbound = toInt(minutesOutbound);
    const agents = Math.max(1, toInt(agentsAllowed, 1));
    const featCampaigns = toInt(campaigns);

    if (!name.trim()) return toast.error('Name is required');
    if (Number.isNaN(priceMonthly)) return toast.error('Enter a valid price (≥ 0)');
    if (featCampaigns < 0) return toast.error('Campaigns must be ≥ 0');

    // if total > 0, we’ll ignore inbound/outbound on the backend anyway
    const payload: CreatePayload = {
      name: name.trim(),
      price_monthly: priceMonthly,
      minutes_total_limit: total,
      minutes_inbound_limit: total > 0 ? 0 : inbound,
      minutes_outbound_limit: total > 0 ? 0 : outbound,
      agents_allowed: agents,
      analytics_access: analyticsAccess,
      is_active: isActive,
      features: {
        campaigns: featCampaigns,
        api_access: apiAccess,
        advanced_analytics: analyticsAccess ? advancedAnalytics : false,
      },
    };

    try {
      setSaving(true);
      await axiosInstance.post('/api/accounts/admin/packages/', payload);
      toast.success('Package created');
      router.push('/admin/packages');
    } catch (e: any) {
      // try to surface DRF field errors nicely
      const data = e?.response?.data;
      if (data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        const firstMsg = Array.isArray(data[firstKey]) ? data[firstKey][0] : JSON.stringify(data[firstKey]);
        toast.error(`${firstKey}: ${firstMsg}`);
      } else {
        toast.error(e?.message ?? 'Failed to create package');
      }
    } finally {
      setSaving(false);
    }
  };

  const totalMode = toInt(minutesTotal) > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-25 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">New Package</h1>
        <Link
          href="/admin/packages"
          className="rounded-md border border-gray-700 px-3 py-2 text-sm hover:bg-gray-800 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-800 bg-[#0E1627] p-4">
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
              value={price}
              onChange={(e) => setPrice(e.target.value)}
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
              onChange={(e) => setMinutesTotal(e.target.value)}
              placeholder="e.g. 2000"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              If set &gt; 0, inbound/outbound limits are ignored.
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-300">Agents Allowed</label>
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
              value={agentsAllowed}
              onChange={(e) => setAgentsAllowed(e.target.value)}
              placeholder="5"
            />
          </div>

          {/* In/Out minutes — disabled when total minutes mode is on */}
          <div>
            <label className="text-sm text-gray-300">Minutes — Inbound</label>
            <input
              type="number"
              min={0}
              disabled={totalMode}
              className="mt-1 w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-sm outline-none disabled:opacity-50"
              value={minutesInbound}
              onChange={(e) => setMinutesInbound(e.target.value)}
              placeholder="1000"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Minutes — Outbound</label>
            <input
              type="number"
              min={0}
              disabled={totalMode}
              className="mt-1 w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-sm outline-none disabled:opacity-50"
              value={minutesOutbound}
              onChange={(e) => setMinutesOutbound(e.target.value)}
              placeholder="1000"
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

          {/* Features (no raw JSON) */}
          <div>
            <label className="text-sm text-gray-300">Campaigns</label>
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-sm outline-none"
              value={campaigns}
              onChange={(e) => setCampaigns(e.target.value)}
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
              disabled={!analyticsAccess}
              onChange={(e) => setAdvancedAnalytics(e.target.checked)}
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
            <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Create Package'}
          </button>
        </div>
      </form>
    </div>
  );
}
