'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { axiosInstance } from '../../../../utils/axiosInstance'; // adjust if needed
import { ArrowLeft, Pencil } from 'lucide-react';

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
  subscribers?: number;
};

function normalize(p: AdminPackage) {
  return {
    ...p,
    price_monthly: typeof p.price_monthly === 'string' ? parseFloat(p.price_monthly) : p.price_monthly,
  };
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-gray-900/40 py-2">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-200">{value}</span>
    </div>
  );
}

const yesNo = (b: boolean) => (b ? 'Yes' : 'No');

export default function PackageDetailPage() {
  const params = useParams<{ id: string }>();
  const pkgId = useMemo(() => params?.id, [params?.id]);

  const [data, setData] = useState<AdminPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pkgId) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axiosInstance.get<AdminPackage>(`/api/accounts/admin/packages/${pkgId}/`);
        setData(normalize(data));
      } catch (e: any) {
        const msg = e?.response?.status === 404 ? 'Package not found' : (e?.message ?? 'Failed to load');
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [pkgId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="rounded-lg border border-gray-800 bg-[#0E1627] p-4 animate-pulse h-24" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <div className="rounded-lg border border-red-800 bg-red-950/30 p-4 text-sm">
          <p className="font-medium text-red-300">Couldn’t load package.</p>
          <p className="text-red-400/90">{error ?? 'Unknown error'}</p>
        </div>
        <Link href="/admin/packages" className="text-sm text-blue-400 hover:underline">
          ← Back to packages
        </Link>
      </div>
    );
  }

  const minutes =
    data.minutes_total_limit && data.minutes_total_limit > 0
      ? `${data.minutes_total_limit} total`
      : `${data.minutes_inbound_limit}/${data.minutes_outbound_limit} in/out`;

  const feats = {
    campaigns: data.features?.campaigns ?? 0,
    api_access: !!data.features?.api_access,
    advanced_analytics: !!data.features?.advanced_analytics,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-25 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{data.name}</h1>
          <p className="text-sm text-gray-400">Package details</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/packages"
            className="rounded-md border border-gray-700 px-3 py-2 text-sm hover:bg-gray-800 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <Link
            href={`/admin/packages/${data.id}/edit`}
            className="rounded-md border border-gray-700 px-3 py-2 text-sm hover:bg-gray-800 flex items-center gap-2"
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-gray-800 bg-[#0E1627] p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <FieldRow label="Price (mo)" value={`$${(data as any).price_monthly}`} />
            <FieldRow label="Minutes" value={minutes} />
            <FieldRow label="Agents Allowed" value={data.agents_allowed} />
            <FieldRow label="Analytics Access" value={yesNo(data.analytics_access)} />
            <FieldRow label="Active" value={yesNo(data.is_active)} />
            <FieldRow label="Subscribers" value={data.subscribers ?? '-'} />
            <FieldRow label="Created At" value={new Date(data.created_at).toLocaleString()} />
          </div>

          {/* Features displayed like other data */}
          <div>
            <div className="text-gray-300 font-medium mb-2">Features</div>
            <FieldRow label="Campaigns" value={feats.campaigns} />
            <FieldRow label="API Access" value={yesNo(feats.api_access)} />
            <FieldRow
              label="Advanced Analytics"
              value={yesNo(data.analytics_access && feats.advanced_analytics)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
