'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, RefreshCcw, Pencil, Eye } from 'lucide-react';
import { axiosInstance } from '../../../utils/axiosInstance';
import { toast } from 'sonner';

type AdminPackage = {
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
  subscribers?: number;
};

function normalize(p: AdminPackage) {
  return {
    ...p,
    price_monthly:
      typeof p.price_monthly === 'string' ? parseFloat(p.price_monthly) : p.price_monthly,
  };
}

export default function PackagesListPage() {
  const [rows, setRows] = useState<AdminPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {debugger
      setLoading(true);
      setError(null);
      const { data } = await axiosInstance.get<AdminPackage[]>('/api/subscriptions/packages/');
      setRows(data.map(normalize));
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string | number, name: string) => {
    const ok = confirm(`Delete package "${name}"? This cannot be undone.`);
    if (!ok) return;
    try {debugger
      setDeletingId(id);
      await axiosInstance.delete(`/api/accounts/admin/packages/${id}/`);
      toast.success('Package deleted');
      setRows(prev => prev.filter(r => r.id !== id));
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-25 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Packages</h1>
          <p className="text-sm text-gray-400">Create, manage, and delete subscription packages.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="rounded-md border border-gray-700 px-3 py-2 text-sm hover:bg-gray-800 flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" /> Refresh
          </button>
          <Link
            href="/admin/packages/new"
            className="rounded-md border border-gray-700 px-3 py-2 text-sm hover:bg-gray-800 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> New Package
          </Link>
        </div>
      </div>

      {loading && (
        <div className="rounded-lg border border-gray-800 bg-[#0E1627] p-4 animate-pulse h-24" />
      )}

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950/30 p-4 text-sm">
          <p className="font-medium text-red-300">Couldn’t load packages.</p>
          <p className="text-red-400/90">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="rounded-lg border border-gray-800 bg-[#0E1627]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Price (mo)</th>
                  <th className="text-left px-4 py-3">Minutes</th>
                  <th className="text-left px-4 py-3">Agents</th>
                  <th className="text-left px-4 py-3">Analytics</th>
                  <th className="text-left px-4 py-3">Subscribers</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(p => {
                  const pn = normalize(p);
                  return (
                    <tr key={p.id} className="border-b border-gray-900/40">
                      <td className="px-4 py-3 font-medium">
                        <Link href={`/admin/packages/${p.id}`} className="hover:underline">
                          {p.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">${pn.price_monthly}</td>
                      <td className="px-4 py-3">
                        {p.minutes_total_limit
                          ? `${p.minutes_total_limit} total`
                          : `${p.minutes_inbound_limit}/${p.minutes_outbound_limit} in/out`}
                      </td>
                      <td className="px-4 py-3">{p.agents_allowed}</td>
                      <td className="px-4 py-3">{p.analytics_access ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-3">{p.subscribers ?? '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/packages/${p.id}`}
                            className="rounded-md border border-gray-700 px-2 py-1 text-xs hover:bg-gray-800 flex items-center gap-1"
                            title="View"
                          >
                            <Eye className="h-4 w-4" /> View
                          </Link>
                          <Link
                            href={`/admin/packages/${p.id}/edit`}
                            className="rounded-md border border-gray-700 px-2 py-1 text-xs hover:bg-gray-800 flex items-center gap-1"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" /> Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            disabled={deletingId === p.id}
                            className="rounded-md border border-red-800 text-red-300 px-2 py-1 text-xs hover:bg-red-900/30 flex items-center gap-1 disabled:opacity-60"
                            title="Delete package"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                      No packages yet. Create one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
