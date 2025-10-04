# Dashboard API Integration

This document explains how the dashboard integrates with the backend API.

## API Endpoint

**URL:** `/api/dashboard/comprehensive/`  
**Method:** `GET`  
**Description:** Fetches comprehensive dashboard data including call statistics, subscription usage, and chart data.

## Implementation Status

Currently using **MOCK DATA** for development and testing.

### To Switch to Real API:

1. **Update Configuration**
   ```typescript
   // In app/dashboard/page.tsx
   const USE_MOCK_DATA = false; // Change to false
   ```

2. **Uncomment API Integration**
   ```typescript
   // Uncomment this import:
   import { axiosInstance } from '../../utils/axiosInstance';
   
   // Uncomment this function:
   const fetchDashboardData = async (): Promise<DashboardData> => {
     const response = await axiosInstance.get('/api/dashboard/comprehensive/');
     return response.data;
   };
   ```

3. **Ensure Backend API Returns Correct Format**

## Expected API Response Format

```json
{
  "inboundCalls": 158,
  "outboundCalls": 112,
  "totalCallsThisCycle": 270,
  "planName": "Enterprise – 5,000 min",
  "planMinutesLimit": 5000,
  "planMinutesUsed": 1842,
  "renewalDateISO": "2025-10-19T10:30:00.000Z",
  "billingCycleStart": "2024-09-19T10:30:00.000Z",
  "averageCallDuration": 4.1,
  "callSuccessRate": 96.2,
  "weeklyCallTrends": [
    {
      "day": "Mon",
      "inbound": 25,
      "outbound": 18,
      "total": 43
    }
    // ... more days
  ],
  "hourlyActivity": [
    {
      "hour": "9 AM",
      "calls": 12
    }
    // ... more hours
  ],
  "callTypeDistribution": [
    {
      "name": "Sales Calls",
      "value": 158,
      "color": "#3B82F6"
    }
    // ... more types
  ],
  "monthlyUsage": [
    {
      "month": "Oct",
      "minutes": 1842,
      "calls": 270
    }
    // ... more months
  ]
}
```

## Testing the API

### Test Next.js API Route
A sample API route is provided at `app/api/dashboard/comprehensive/route.ts`.

To test it:
```bash
curl http://localhost:3001/api/dashboard/comprehensive/
```

### Backend Integration Options

1. **Direct Database Queries** - Query your database directly in the API route
2. **Django Proxy** - Forward requests to your Django backend
3. **External API** - Call external services for data

### Example Django Proxy Implementation

```typescript
// In app/api/dashboard/comprehensive/route.ts
export async function GET(request: NextRequest) {
  try {
    const djangoResponse = await fetch('http://your-django-backend/api/dashboard/comprehensive/', {
      headers: {
        'Authorization': request.headers.get('authorization') || '',
        'Content-Type': 'application/json',
      },
    });
    
    if (!djangoResponse.ok) {
      throw new Error('Django API request failed');
    }
    
    const data = await djangoResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
```

## Features

- ✅ **Mock Data Support** - Development and testing
- ✅ **Error Handling** - Graceful error states
- ✅ **Loading States** - User feedback during data loading
- ✅ **TypeScript Types** - Full type safety
- ✅ **Responsive Design** - Works on all screen sizes
- ✅ **Interactive Charts** - Using Recharts library

## Charts and Visualizations

The dashboard includes:
- **Weekly Call Trends** - Line chart showing inbound vs outbound calls
- **Hourly Activity** - Bar chart of calls by hour
- **Call Type Distribution** - Pie chart of different call types
- **Monthly Usage** - Area chart of usage over time

All charts are responsive and interactive with hover tooltips.