# Frontend Integration Examples for Comprehensive Dashboard

## React.js Dashboard Component

### 1. **Main Dashboard Container**
```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ComprehensiveDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get('/api/dashboard/comprehensive/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorAlert message={error} onRetry={fetchDashboardData} />;
  if (!dashboardData) return <EmptyDashboard />;

  // Render based on dashboard type
  switch (dashboardData.dashboard_type) {
    case 'admin_comprehensive':
      return <AdminDashboard data={dashboardData} />;
    case 'user_comprehensive':
      return <UserDashboard data={dashboardData} />;
    case 'agent_comprehensive':
      return <AgentDashboard data={dashboardData} />;
    default:
      return <ErrorAlert message="Invalid dashboard type" />;
  }
};

export default ComprehensiveDashboard;
```

### 2. **Admin Dashboard Component**
```jsx
const AdminDashboard = ({ data }) => {
  const {
    summary_stats,
    subscription_metrics,
    billing_revenue,
    call_statistics,
    ai_agent_metrics,
    customer_management,
    callback_management,
    quick_actions,
    recent_activities,
    alerts,
    performance_trends
  } = data;

  return (
    <div className="admin-dashboard">
      {/* Header Summary Cards */}
      <div className="summary-cards-grid">
        <SummaryCard
          title="Total Users"
          value={summary_stats.total_users}
          change={`+${summary_stats.new_users_today} today`}
          trend="up"
          icon="users"
          color="primary"
        />
        <SummaryCard
          title="Active Subscriptions"
          value={subscription_metrics.active_subscriptions}
          change={`+${subscription_metrics.new_subscriptions_today} today`}
          trend="up"
          icon="credit-card"
          color="success"
        />
        <SummaryCard
          title="Total Revenue"
          value={`$${billing_revenue.total_revenue.toLocaleString()}`}
          change={`+$${billing_revenue.revenue_today} today`}
          trend="up"
          icon="dollar-sign"
          color="warning"
        />
        <SummaryCard
          title="Active Calls"
          value={call_statistics.active_calls}
          change={`${call_statistics.calls_today} calls today`}
          trend="stable"
          icon="phone"
          color="info"
        />
      </div>

      {/* Alerts Panel */}
      {alerts.length > 0 && (
        <AlertsPanel alerts={alerts} />
      )}

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          {quick_actions.map(action => (
            <QuickActionCard
              key={action.id}
              title={action.title}
              description={action.description}
              icon={action.icon}
              count={action.count}
              color={action.color}
              onClick={() => window.location.href = action.url}
            />
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <MetricCard
          title="Subscription Breakdown"
          data={subscription_metrics.subscription_by_plans}
          type="donut-chart"
        />
        <MetricCard
          title="Call Outcomes"
          data={call_statistics.calls_by_outcome}
          type="bar-chart"
        />
        <MetricCard
          title="Agent Performance"
          data={ai_agent_metrics.performance}
          type="stat-list"
        />
        <MetricCard
          title="Customer Insights"
          data={customer_management}
          type="progress-bars"
        />
      </div>

      {/* Recent Activities */}
      <div className="recent-activities">
        <h3>Recent Activities</h3>
        <div className="activities-grid">
          <ActivityList
            title="New Users"
            items={recent_activities.new_users}
            type="users"
          />
          <ActivityList
            title="New Subscriptions"
            items={recent_activities.new_subscriptions}
            type="subscriptions"
          />
          <ActivityList
            title="Recent Calls"
            items={recent_activities.recent_calls}
            type="calls"
          />
        </div>
      </div>

      {/* Performance Trends */}
      <div className="performance-trends">
        <h3>Performance Trends</h3>
        <TrendsChart data={performance_trends} />
      </div>
    </div>
  );
};
```

### 3. **User Dashboard Component**
```jsx
const UserDashboard = ({ data }) => {
  const {
    user_profile,
    subscription_info,
    ai_agent_info,
    call_statistics,
    customer_management,
    callback_management,
    billing_info,
    quick_actions,
    alerts,
    summary
  } = data;

  return (
    <div className="user-dashboard">
      {/* User Header */}
      <div className="user-header">
        <UserProfileCard profile={user_profile} />
        <div className="quick-stats">
          <StatItem label="Calls Today" value={summary.calls_today} />
          <StatItem label="Success Rate" value={`${summary.conversion_rate}%`} />
          <StatItem label="Pending Callbacks" value={summary.pending_callbacks} />
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <AlertsPanel alerts={alerts} priority="user" />
      )}

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          {quick_actions.map(action => (
            <QuickActionCard
              key={action.id}
              title={action.title}
              description={action.description}
              icon={action.icon}
              count={action.count}
              enabled={action.enabled}
              color={action.color}
              onClick={() => action.enabled && (window.location.href = action.url)}
            />
          ))}
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Subscription Status */}
        <div className="dashboard-card">
          <h4>Subscription Status</h4>
          {subscription_info.status === 'no_subscription' ? (
            <NoSubscriptionMessage />
          ) : (
            <SubscriptionDetails subscription={subscription_info} />
          )}
        </div>

        {/* AI Agent Status */}
        <div className="dashboard-card">
          <h4>AI Agent Status</h4>
          {ai_agent_info.status === 'no_agent' ? (
            <NoAgentMessage />
          ) : (
            <AgentDetails agent={ai_agent_info} />
          )}
        </div>

        {/* Call Statistics */}
        <div className="dashboard-card">
          <h4>Call Performance</h4>
          <CallStatsChart data={call_statistics} />
          <RecentCallsList calls={call_statistics.recent_calls} />
        </div>

        {/* Customer Management */}
        <div className="dashboard-card">
          <h4>Customer Overview</h4>
          <CustomerStatsGrid data={customer_management} />
        </div>

        {/* Upcoming Callbacks */}
        <div className="dashboard-card">
          <h4>Upcoming Callbacks</h4>
          <CallbacksList callbacks={callback_management.upcoming_callbacks} />
        </div>

        {/* Billing Information */}
        <div className="dashboard-card">
          <h4>Billing Information</h4>
          <BillingOverview billing={billing_info} />
        </div>
      </div>
    </div>
  );
};
```

### 4. **Reusable Components**

```jsx
// Summary Card Component
const SummaryCard = ({ title, value, change, trend, icon, color }) => (
  <div className={`summary-card summary-card--${color}`}>
    <div className="summary-card__icon">
      <i className={`icon-${icon}`} />
    </div>
    <div className="summary-card__content">
      <h3 className="summary-card__title">{title}</h3>
      <div className="summary-card__value">{value}</div>
      <div className={`summary-card__change summary-card__change--${trend}`}>
        {change}
      </div>
    </div>
  </div>
);

// Quick Action Card Component
const QuickActionCard = ({ title, description, icon, count, enabled, color, onClick }) => (
  <div
    className={`quick-action-card quick-action-card--${color} ${!enabled ? 'disabled' : ''}`}
    onClick={onClick}
    style={{ cursor: enabled ? 'pointer' : 'not-allowed' }}
  >
    <div className="quick-action-card__icon">
      <i className={`icon-${icon}`} />
      {count && <span className="badge">{count}</span>}
    </div>
    <div className="quick-action-card__content">
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  </div>
);

// Alerts Panel Component
const AlertsPanel = ({ alerts }) => (
  <div className="alerts-panel">
    {alerts.map((alert, index) => (
      <div key={index} className={`alert alert--${alert.type}`}>
        <div className="alert__content">
          <h4 className="alert__title">{alert.title}</h4>
          <p className="alert__message">{alert.message}</p>
        </div>
        {alert.action_url && (
          <button
            className="alert__action"
            onClick={() => window.location.href = alert.action_url}
          >
            {alert.action_text || 'View Details'}
          </button>
        )}
      </div>
    ))}
  </div>
);
```

## Vue.js Implementation

### 1. **Vue Dashboard Component**
```vue
<template>
  <div class="comprehensive-dashboard">
    <div v-if="loading" class="loading-spinner">
      <p>Loading dashboard...</p>
    </div>
    
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="fetchDashboard" class="retry-btn">Retry</button>
    </div>
    
    <component
      v-else
      :is="dashboardComponent"
      :data="dashboardData"
      @refresh="fetchDashboard"
    />
  </div>
</template>

<script>
import axios from 'axios';
import AdminDashboard from './AdminDashboard.vue';
import UserDashboard from './UserDashboard.vue';
import AgentDashboard from './AgentDashboard.vue';

export default {
  name: 'ComprehensiveDashboard',
  components: {
    AdminDashboard,
    UserDashboard,
    AgentDashboard
  },
  data() {
    return {
      dashboardData: null,
      loading: true,
      error: null,
      refreshInterval: null
    };
  },
  computed: {
    dashboardComponent() {
      if (!this.dashboardData) return null;
      
      const typeMap = {
        'admin_comprehensive': 'AdminDashboard',
        'user_comprehensive': 'UserDashboard',
        'agent_comprehensive': 'AgentDashboard'
      };
      
      return typeMap[this.dashboardData.dashboard_type] || null;
    }
  },
  async mounted() {
    await this.fetchDashboard();
    this.startAutoRefresh();
  },
  beforeUnmount() {
    this.stopAutoRefresh();
  },
  methods: {
    async fetchDashboard() {
      try {
        this.loading = true;
        this.error = null;
        
        const token = localStorage.getItem('access_token');
        const response = await axios.get('/api/dashboard/comprehensive/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        this.dashboardData = response.data;
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to load dashboard';
        console.error('Dashboard fetch error:', err);
      } finally {
        this.loading = false;
      }
    },
    startAutoRefresh() {
      this.refreshInterval = setInterval(() => {
        this.fetchDashboard();
      }, 30000); // Refresh every 30 seconds
    },
    stopAutoRefresh() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
      }
    }
  }
};
</script>
```

## CSS Styling Examples

### 1. **Dashboard Grid Layout**
```css
.admin-dashboard {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.summary-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #3b82f6;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.summary-card--primary { border-left-color: #3b82f6; }
.summary-card--success { border-left-color: #10b981; }
.summary-card--warning { border-left-color: #f59e0b; }
.summary-card--info { border-left-color: #06b6d4; }

.summary-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  color: #64748b;
  font-size: 24px;
}

.summary-card__value {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 4px 0;
}

.summary-card__change {
  font-size: 0.875rem;
  font-weight: 500;
}

.summary-card__change--up { color: #10b981; }
.summary-card__change--down { color: #ef4444; }
.summary-card__change--stable { color: #64748b; }
```

### 2. **Quick Actions Grid**
```css
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.quick-action-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.quick-action-card:hover:not(.disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.quick-action-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.quick-action-card__icon {
  position: relative;
  margin-bottom: 12px;
}

.quick-action-card__icon i {
  font-size: 24px;
  color: #64748b;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.quick-action-card h4 {
  margin: 0 0 8px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.quick-action-card p {
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.4;
}
```

### 3. **Alerts Panel**
```css
.alerts-panel {
  margin-bottom: 30px;
}

.alert {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 12px;
  border-left: 4px solid;
}

.alert--error {
  background: #fef2f2;
  border-left-color: #ef4444;
  color: #991b1b;
}

.alert--warning {
  background: #fffbeb;
  border-left-color: #f59e0b;
  color: #92400e;
}

.alert--info {
  background: #eff6ff;
  border-left-color: #3b82f6;
  color: #1e40af;
}

.alert__title {
  font-weight: 600;
  margin: 0 0 4px 0;
}

.alert__message {
  margin: 0;
  font-size: 0.875rem;
}

.alert__action {
  background: transparent;
  border: 1px solid currentColor;
  color: inherit;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.alert__action:hover {
  background: currentColor;
  color: white;
}
```

## TypeScript Types

```typescript
// Dashboard Types
export interface DashboardData {
  dashboard_type: 'admin_comprehensive' | 'user_comprehensive' | 'agent_comprehensive';
  generated_at: string;
  data_freshness: 'real_time';
}

export interface AdminDashboardData extends DashboardData {
  dashboard_type: 'admin_comprehensive';
  user_info: UserInfo;
  summary_stats: SummaryStats;
  subscription_metrics: SubscriptionMetrics;
  billing_revenue: BillingRevenue;
  call_statistics: CallStatistics;
  ai_agent_metrics: AIAgentMetrics;
  customer_management: CustomerManagement;
  callback_management: CallbackManagement;
  quick_actions: QuickAction[];
  recent_activities: RecentActivities;
  alerts: Alert[];
  performance_trends: PerformanceTrends;
}

export interface UserDashboardData extends DashboardData {
  dashboard_type: 'user_comprehensive';
  user_profile: UserProfile;
  subscription_info: SubscriptionInfo;
  ai_agent_info: AIAgentInfo;
  call_statistics: UserCallStatistics;
  customer_management: CustomerManagement;
  callback_management: CallbackManagement;
  billing_info: BillingInfo;
  quick_actions: QuickAction[];
  alerts: Alert[];
  summary: UserSummary;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  count?: number;
  enabled?: boolean;
  url: string;
  color: 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'secondary' | 'dark';
}

export interface Alert {
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  action_text?: string;
  action_url?: string;
  count?: number;
}

// Component Props
export interface DashboardProps {
  data: AdminDashboardData | UserDashboardData;
  onRefresh?: () => void;
}
```

This comprehensive frontend integration guide shows you exactly how to implement the dashboard UI that matches your image using the single comprehensive API endpoint. The components are modular, reusable, and optimized for the data structure returned by the API!
