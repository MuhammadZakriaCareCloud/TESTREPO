'use client';
import React from 'react';
import Link from 'next/link';

export default function InboundCallsPage() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold">Inbound Calls</h1>
      <p className="mt-2 text-sm text-gray-400">Replace with your inbound calls UI or API calls.</p>
      <Link href="/dashboard">Back</Link>
    </main>
  );
}