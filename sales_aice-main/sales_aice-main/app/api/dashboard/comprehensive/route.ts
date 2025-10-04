/**
 * Dashboard Comprehensive API Route
 * 
 * This is an example Next.js API route that demonstrates the expected
 * response format for the dashboard data.
 * 
 * In production, this would typically proxy to your Django backend
 * or fetch data from your database.
 * 
 * Endpoint: GET /api/dashboard/comprehensive/
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // TODO: Replace with actual data fetching logic
    // This could be:
    // 1. Direct database queries
    // 2. Proxy to Django backend
    // 3. External API calls
    
    // Example of proxying to Django backend:
    // const djangoResponse = await fetch('http://your-django-api/dashboard/comprehensive/', {
    //   headers: {
    //     'Authorization': request.headers.get('authorization') || '',
    //     'Content-Type': 'application/json',
    //   },
    // });
    // const data = await djangoResponse.json();
    // return NextResponse.json(data);

    // Mock response data (replace with real data)
    const dashboardData = {
      // Summary Stats - Total calls this billing cycle
      inboundCalls: 158,
      outboundCalls: 112,
      totalCallsThisCycle: 270,
      
      // Current subscription plan/package
      planName: "Enterprise – 5,000 min",
      planMinutesLimit: 5000,
      planMinutesUsed: 1842,
      
      // Plan renewal/expiry date and billing cycle
      renewalDateISO: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(),
      billingCycleStart: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
      
      // Additional metrics
      averageCallDuration: 4.1, // minutes
      callSuccessRate: 96.2, // percentage
      
      // Chart Data
      weeklyCallTrends: [
        { day: 'Mon', inbound: 25, outbound: 18, total: 43 },
        { day: 'Tue', inbound: 28, outbound: 22, total: 50 },
        { day: 'Wed', inbound: 32, outbound: 19, total: 51 },
        { day: 'Thu', inbound: 24, outbound: 28, total: 52 },
        { day: 'Fri', inbound: 35, outbound: 25, total: 60 },
        { day: 'Sat', inbound: 18, outbound: 12, total: 30 },
        { day: 'Sun', inbound: 14, outbound: 10, total: 24 },
      ],
      
      hourlyActivity: [
        { hour: '8 AM', calls: 5 },
        { hour: '9 AM', calls: 12 },
        { hour: '10 AM', calls: 18 },
        { hour: '11 AM', calls: 25 },
        { hour: '12 PM', calls: 22 },
        { hour: '1 PM', calls: 15 },
        { hour: '2 PM', calls: 28 },
        { hour: '3 PM', calls: 32 },
        { hour: '4 PM', calls: 28 },
        { hour: '5 PM', calls: 20 },
        { hour: '6 PM', calls: 8 },
      ],
      
      callTypeDistribution: [
        { name: 'Sales Calls', value: 158, color: '#3B82F6' },
        { name: 'Support Calls', value: 112, color: '#10B981' },
        { name: 'Follow-ups', value: 68, color: '#F59E0B' },
        { name: 'Cold Calls', value: 42, color: '#EF4444' },
      ],
      
      monthlyUsage: [
        { month: 'Jul', minutes: 4850, calls: 380 },
        { month: 'Aug', minutes: 4920, calls: 395 },
        { month: 'Sep', minutes: 4680, calls: 356 },
        { month: 'Oct', minutes: 1842, calls: 270 }, // Current month (partial)
      ],
    };

    // Add some random variation to make it feel more realistic
    const variation = Math.random() * 0.1 - 0.05; // ±5% variation
    dashboardData.inboundCalls += Math.floor(dashboardData.inboundCalls * variation);
    dashboardData.outboundCalls += Math.floor(dashboardData.outboundCalls * variation);
    dashboardData.totalCallsThisCycle = dashboardData.inboundCalls + dashboardData.outboundCalls;

    return NextResponse.json(dashboardData);
    
  } catch (error) {
    console.error('Dashboard API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle CORS if needed
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}