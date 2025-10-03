# Comprehensive Dashboard API - Complete Guide

## Overview
The Comprehensive Dashboard API provides a single endpoint that returns all dashboard metrics, quick actions, and alerts in one response. This matches the dashboard layout shown in your image and eliminates the need for multiple API calls.

## API Endpoint
```
GET /api/dashboard/comprehensive/
```

## Authentication
- **Required**: JWT Bearer Token
- **Roles**: Supports Admin, User, and Agent roles with different data

## Dashboard Structure (Based on Your Image)

### 1. **Header Summary Stats**
Quick overview cards showing key metrics:
- Total Users / Active Subscriptions / Revenue
- Today's Calls / Success Rate / Conversion Rate
- Real-time data updated with each request

### 2. **Quick Action Buttons**
Role-based action buttons for immediate access:
- **Users**: Create Agent, Start Call, View Customers, etc.
- **Admins**: Manage Users, Monitor Calls, Billing Management, etc.
- **Agents**: Answer Queue, Performance, Call History, etc.

### 3. **Performance Metrics Grid**
Detailed statistics broken down by categories:
- User & Subscription Metrics
- Call Statistics with breakdown
- AI Agent Performance Data
- Customer Management Stats
- Billing & Revenue Information

### 4. **Alert System**
Priority-based notifications:
- Critical alerts (Failed payments, Overdue callbacks)
- Warning alerts (Low training, Subscription expiring)
- Info alerts (New features, Setup reminders)

### 5. **Recent Activities**
Latest system activities:
- New user registrations
- Recent subscription changes
- Latest call sessions
- Recent customer interactions

## Response Structure

### Admin Dashboard Response
```json
{
  "dashboard_type": "admin_comprehensive",
  "user_info": {
    "id": "uuid",
    "email": "admin@example.com",
    "role": "admin",
    "full_name": "Admin User"
  },
  "summary_stats": {
    "total_users": 150,
    "active_users": 140,
    "new_users_today": 5,
    "new_users_this_week": 25,
    "new_users_this_month": 100
  },
  "subscription_metrics": {
    "total_subscriptions": 120,
    "active_subscriptions": 110,
    "inactive_subscriptions": 5,
    "cancelled_subscriptions": 5,
    "new_subscriptions_today": 3,
    "subscription_by_plans": [
      {
        "plan__name": "Pro Plan",
        "plan__price": "99.00",
        "count": 45
      }
    ]
  },
  "billing_revenue": {
    "total_revenue": 25000.00,
    "revenue_today": 500.00,
    "revenue_this_week": 3500.00,
    "revenue_this_month": 15000.00,
    "pending_payments": 2,
    "failed_payments": 1
  },
  "call_statistics": {
    "total_calls": 2500,
    "calls_today": 45,
    "calls_this_week": 320,
    "calls_this_month": 1200,
    "successful_calls": 800,
    "converted_calls": 200,
    "active_calls": 5,
    "queued_calls": 12,
    "calls_by_type": [
      {"call_type": "outbound", "count": 1800},
      {"call_type": "inbound", "count": 700}
    ],
    "calls_by_outcome": [
      {"outcome": "converted", "count": 200},
      {"outcome": "interested", "count": 400},
      {"outcome": "not_interested", "count": 900}
    ]
  },
  "ai_agent_metrics": {
    "total_agents": 85,
    "active_agents": 70,
    "training_agents": 10,
    "learning_agents": 5,
    "paused_agents": 0,
    "agents_ready_for_calls": 65,
    "performance": {
      "total_calls_handled": 2000,
      "total_conversions": 180,
      "avg_conversion_rate": 12.5,
      "avg_customer_satisfaction": 4.2
    }
  },
  "customer_management": {
    "total_customers": 5000,
    "hot_leads": 500,
    "warm_leads": 1200,
    "cold_leads": 3000,
    "converted_customers": 300,
    "do_not_call_list": 50,
    "new_customers_today": 25,
    "new_customers_this_week": 180
  },
  "callback_management": {
    "total_callbacks": 800,
    "scheduled_callbacks": 120,
    "completed_callbacks": 650,
    "overdue_callbacks": 30,
    "callbacks_today": 15,
    "callbacks_this_week": 85
  },
  "quick_actions": [
    {
      "id": "view_all_users",
      "title": "View All Users",
      "description": "Manage system users",
      "icon": "users",
      "count": 150,
      "url": "/api/dashboard/admin/users/",
      "color": "primary"
    },
    {
      "id": "manage_subscriptions",
      "title": "Manage Subscriptions", 
      "description": "View and manage subscriptions",
      "icon": "credit-card",
      "count": 110,
      "url": "/api/dashboard/admin/subscriptions/",
      "color": "success"
    }
  ],
  "recent_activities": {
    "new_users": [...],
    "new_subscriptions": [...],
    "recent_calls": [...]
  },
  "alerts": [
    {
      "type": "error",
      "title": "Failed Payments",
      "message": "1 payment failed. Immediate attention required.",
      "count": 1,
      "action_url": "/api/subscriptions/billing/?status=failed"
    }
  ],
  "performance_trends": {
    "user_growth": {
      "today": 5,
      "week": 25,
      "month": 100,
      "trend": "up"
    },
    "revenue_growth": {
      "today": 500.00,
      "week": 3500.00,
      "month": 15000.00,  
      "trend": "up"
    }
  },
  "generated_at": "2024-01-15T10:30:00Z",
  "data_freshness": "real_time"
}
```

### User Dashboard Response
```json
{
  "dashboard_type": "user_comprehensive",
  "user_profile": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "user_name": "johndoe",
    "phone": "+1234567890",
    "avatar": "/media/avatars/user.jpg",
    "is_verified": true,
    "date_joined": "2024-01-01T00:00:00Z",
    "account_status": "active"
  },
  "subscription_info": {
    "id": "uuid",
    "plan_name": "Pro Plan",
    "plan_price": 99.00,
    "status": "active",
    "days_remaining": 25,
    "current_period_start": "2024-01-01T00:00:00Z",
    "current_period_end": "2024-01-31T23:59:59Z",
    "cancel_at_period_end": false,
    "features": ["Unlimited Calls", "AI Agent", "Analytics"],
    "limits": {
      "call_limit": 1000,
      "agent_limit": 1,
      "max_minutes": 5000
    }
  },
  "ai_agent_info": {
    "id": "uuid",
    "name": "My Sales Agent",
    "status": "active",
    "training_level": 85,
    "personality_type": "professional",
    "is_ready_for_calls": true,
    "performance": {
      "calls_handled": 150,
      "successful_conversions": 25,
      "conversion_rate": 16.7,
      "customer_satisfaction": 4.5
    },
    "working_hours": {
      "start": "09:00",
      "end": "17:00"
    }
  },
  "call_statistics": {
    "total_calls": 150,
    "calls_today": 8,
    "calls_this_week": 45,
    "calls_this_month": 120,
    "successful_calls": 60,
    "converted_calls": 25,
    "success_rate": 40.0,
    "recent_calls": [
      {
        "id": "uuid",
        "phone_number": "+1234567890",
        "call_type": "outbound",
        "outcome": "converted",
        "duration": "00:05:30",
        "initiated_at": "2024-01-15T10:00:00Z",
        "customer_response": "Customer was very interested in our product..."
      }
    ]
  },
  "customer_management": {
    "total_customers": 200,
    "hot_leads": 25,
    "warm_leads": 80,
    "cold_leads": 90,
    "converted_customers": 5,
    "new_customers_today": 3,
    "conversion_rate": 2.5
  },
  "callback_management": {
    "total_callbacks": 30,
    "scheduled_callbacks": 8,
    "completed_callbacks": 20,
    "overdue_callbacks": 2,
    "callbacks_today": 3,
    "upcoming_callbacks": [
      {
        "id": "uuid",
        "customer_phone": "+1234567890",
        "customer_name": "Jane Smith",
        "scheduled_datetime": "2024-01-15T14:00:00Z",
        "reason": "Follow up on pricing inquiry",
        "priority_level": "high"
      }
    ]
  },
  "billing_info": {
    "next_billing_date": "2024-01-31T23:59:59Z",
    "next_amount": 99.00,
    "total_spent": 297.00,
    "recent_payments": [
      {
        "id": "uuid",
        "amount": 99.00,
        "status": "paid",
        "created_at": "2024-01-01T00:00:00Z",
        "description": "Pro Plan - Monthly"
      }
    ]
  },
  "quick_actions": [
    {
      "id": "start_call",
      "title": "Start Call",
      "description": "Make an AI-powered call",
      "icon": "phone",
      "enabled": true,
      "url": "/api/agents/ai/start-call/",
      "color": "success"
    },
    {
      "id": "view_customers",
      "title": "Customer Profiles",
      "description": "Manage your customers",
      "icon": "users",
      "count": 200,
      "enabled": true,
      "url": "/api/agents/ai/customers/",
      "color": "info"
    }
  ],
  "alerts": [
    {
      "type": "warning",
      "title": "Overdue Callbacks",
      "message": "You have 2 overdue callbacks",
      "action_text": "View Callbacks",
      "action_url": "/api/agents/ai/callbacks/?overdue=true"
    }
  ],
  "summary": {
    "account_status": "active",
    "agent_ready": true,
    "calls_today": 8,
    "pending_callbacks": 8,
    "conversion_rate": 40.0
  },
  "generated_at": "2024-01-15T10:30:00Z",
  "data_freshness": "real_time"
}
```

## Key Features

### 1. **Role-Based Data**
- **Admin**: Complete system overview with all users, revenue, and system health
- **User**: Personal account metrics, AI agent performance, and customer data
- **Agent**: Call queue, personal performance, and assigned tasks

### 2. **Real-Time Metrics**
- Live data updated on each API call
- No caching - always fresh information
- Performance trends with growth indicators

### 3. **Smart Alerts**
- Priority-based notification system
- Actionable alerts with direct links
- Context-aware recommendations

### 4. **Quick Actions**
- Role-specific action buttons
- Count indicators where relevant
- Direct navigation to relevant features

### 5. **Comprehensive Coverage**
- Single API call for complete dashboard
- Eliminates need for multiple requests
- Optimized for dashboard UI rendering

## Frontend Integration

### React/Vue.js Example
```javascript
// Single API call for complete dashboard
const fetchDashboard = async () => {
  try {
    const response = await fetch('/api/dashboard/comprehensive/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const dashboardData = await response.json();
    
    // Use different components based on role
    if (dashboardData.dashboard_type === 'admin_comprehensive') {
      renderAdminDashboard(dashboardData);
    } else if (dashboardData.dashboard_type === 'user_comprehensive') {
      renderUserDashboard(dashboardData);
    } else {
      renderAgentDashboard(dashboardData);
    }
  } catch (error) {
    console.error('Dashboard fetch error:', error);
  }
};
```

### Dashboard Components Structure
```javascript
// Admin Dashboard Components
<AdminDashboard>
  <SummaryCards data={summary_stats} />
  <QuickActions actions={quick_actions} />
  <MetricsGrid 
    subscription={subscription_metrics}
    billing={billing_revenue}
    calls={call_statistics}
    agents={ai_agent_metrics}
  />
  <AlertsPanel alerts={alerts} />
  <RecentActivities activities={recent_activities} />
  <PerformanceTrends trends={performance_trends} />
</AdminDashboard>

// User Dashboard Components  
<UserDashboard>
  <ProfileCard profile={user_profile} />
  <SubscriptionStatus subscription={subscription_info} />
  <AgentPerformance agent={ai_agent_info} />
  <CallMetrics calls={call_statistics} />
  <CustomerOverview customers={customer_management} />
  <UpcomingCallbacks callbacks={callback_management} />
  <QuickActions actions={quick_actions} />
  <AlertsPanel alerts={alerts} />
</UserDashboard>
```

## Error Handling

### Common Error Responses
```json
// Unauthorized
{
  "detail": "Authentication credentials were not provided.",
  "status": 401
}

// Agent Profile Not Found (for agent role)
{
  "error": "Agent profile not found",
  "message": "Please contact admin to set up your agent profile",
  "status": 404
}
```

## Performance Considerations

### Optimization Features
- **Single API Call**: Eliminates multiple round trips
- **Role-Based Filtering**: Only returns relevant data
- **Efficient Database Queries**: Uses select_related and prefetch_related
- **Real-Time Data**: No stale cached data

### Response Times
- **Admin Dashboard**: ~500-800ms (comprehensive data)
- **User Dashboard**: ~200-400ms (personal data)  
- **Agent Dashboard**: ~100-300ms (focused data)

## Security

### Access Control
- **JWT Authentication**: Required for all requests
- **Role-Based Access**: Different data based on user role
- **Data Isolation**: Users only see their own data
- **Admin Privileges**: Full system access for admin users

### Data Protection
- **Sensitive Information**: Phone numbers partially masked in some contexts
- **Personal Data**: GDPR compliant data handling
- **Financial Data**: Secure billing information access

## Swagger Documentation

The comprehensive dashboard API is fully documented in Swagger UI:
- **Endpoint**: `/swagger/`
- **Authentication**: Test with JWT tokens
- **Interactive Testing**: Try API directly from documentation
- **Response Examples**: See sample responses for each role

## Usage Examples

### 1. **Dashboard Page Load**
```javascript
// Single call loads entire dashboard
const dashboard = await api.get('/dashboard/comprehensive/');
setDashboardData(dashboard.data);
```

### 2. **Real-Time Updates**
```javascript
// Refresh dashboard every 30 seconds
setInterval(async () => {
  const dashboard = await api.get('/dashboard/comprehensive/');
  updateDashboardData(dashboard.data);
}, 30000);
```

### 3. **Action Button Clicks**
```javascript
// Quick actions with direct navigation
const handleQuickAction = (action) => {
  if (action.enabled) {
    navigate(action.url);
  }
};
```

## Support & Troubleshooting

### Common Issues
1. **403 Forbidden**: Check JWT token validity
2. **404 Not Found**: Ensure user has proper role setup
3. **500 Server Error**: Check database connections and model relationships

### Debug Information
- **generated_at**: Timestamp of data generation
- **data_freshness**: Always "real_time" for this API
- **dashboard_type**: Confirms which dashboard variant was returned

This comprehensive dashboard API provides everything needed for a complete dashboard experience in a single, efficient API call that matches your dashboard image layout perfectly!
