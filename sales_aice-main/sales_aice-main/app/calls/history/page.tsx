'use client';
import React from 'react';
import Link from 'next/link';

export default function CallHistoryPage() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold">Call Histories</h1>
      <p className="mt-2 text-sm text-gray-400">Replace with your call history UI — list of past calls, filters, and details.</p>

      <div className="mt-6 rounded-lg border border-gray-800 bg-[#0E1627] p-4 text-sm text-gray-300">
        {/* Placeholder: replace with real table/list and fetch logic */}
        <p className="mb-2">No call history loaded. Add fetch + table here.</p>
        <div className="text-xs text-gray-500">Columns: Date, From, To, Direction, Duration, Status</div>
      </div>

      <div className="mt-6">
        <Link href="/dashboard" className="text-sm text-blue-400 hover:underline">Back to dashboard</Link>
      </div>
    </main>
  );
}