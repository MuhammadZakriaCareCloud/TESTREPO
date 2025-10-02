'use client';
import React from 'react';
import Link from 'next/link';

type Agent = {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'paused';
  joined_at: string;
};

const mockAgents: Agent[] = [
  { id: 'a1', name: 'Sara Khan', email: 'sara@example.com', status: 'active', joined_at: new Date().toISOString() },
  { id: 'a2', name: 'Omar Ali', email: 'omar@example.com', status: 'paused', joined_at: new Date(Date.now() - 86400000 * 30).toISOString() },
  { id: 'a3', name: 'Ayesha Iqbal', email: 'ayesha@example.com', status: 'inactive', joined_at: new Date(Date.now() - 86400000 * 90).toISOString() },
];

export default function AgentsPage() {
  return (
    <main className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Agent Management</h1>
            <p className="mt-1 text-sm text-gray-400">View and manage agents who handle calls.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/agents/new" className="rounded-md border border-gray-700 px-3 py-2 text-sm hover:bg-gray-800">
              New Agent
            </Link>
            <Link href="/dashboard" className="rounded-md border border-gray-700 px-3 py-2 text-sm hover:bg-gray-800">
              Back
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-gray-800 bg-[#0E1627] p-4">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {mockAgents.map(agent => (
                <tr key={agent.id} className="border-t border-gray-800">
                  <td className="px-3 py-3">{agent.name}</td>
                  <td className="px-3 py-3 text-gray-300">{agent.email}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${agent.status === 'active' ? 'bg-emerald-600/30 text-emerald-300' : 'bg-yellow-600/20 text-yellow-200'}`}>
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-gray-400">{new Date(agent.joined_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 text-sm text-gray-400">
            {/* TODO: replace mock data with real API fetch and add actions (edit, disable, view stats) */}
            This is placeholder data. Wire an API call to list agents and implement actions.
          </div>
        </div>
      </div>
    </main>
  );
}