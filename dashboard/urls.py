from django.urls import path
from . import views
from .user_dashboard_views import (
    UserDashboardAPIView,
    UserProfileConfigAPIView,
    UserCallHistoryAPIView,
    UserSubscriptionManagementAPIView
)
from .user_settings_views import (
    UserSettingsAPIView,
    UserPasswordChangeAPIView,
    UserAccountDeleteAPIView,
    UserExportDataAPIView
)
from .user_additional_views import (
    UserAvatarUploadAPIView,
    UserNotificationsAPIView,
    UserPreferencesAPIView
)
from .user_complete_dashboard import (
    UserCompleteDashboardAPIView,
    UserSubscriptionActionAPIView,
    UserAgentManagementAPIView
)

urlpatterns = [
    # General Dashboard
    path('stats/', views.DashboardStatsAPIView.as_view(), name='dashboard-stats'),
    path('quick-actions/', views.QuickActionsAPIView.as_view(), name='quick-actions'),
    path('execute-action/', views.execute_quick_action, name='execute-action'),
    
    # User Complete Dashboard - Sab kuch ek jagah
    path('user/complete/', UserCompleteDashboardAPIView.as_view(), name='user-complete-dashboard'),
    path('user/subscription-action/', UserSubscriptionActionAPIView.as_view(), name='user-subscription-action'),
    path('user/agent-management/', UserAgentManagementAPIView.as_view(), name='user-agent-management'),
    
    # User Dashboard & Configuration (Individual)
    path('user/', UserDashboardAPIView.as_view(), name='user-dashboard'),
    path('user/profile/', UserProfileConfigAPIView.as_view(), name='user-profile-config'),
    path('user/calls/', UserCallHistoryAPIView.as_view(), name='user-call-history'),
    path('user/subscription/', UserSubscriptionManagementAPIView.as_view(), name='user-subscription-management'),
    
    # User Settings & Account Management
    path('user/settings/', UserSettingsAPIView.as_view(), name='user-settings'),
    path('user/change-password/', UserPasswordChangeAPIView.as_view(), name='user-change-password'),
    path('user/delete-account/', UserAccountDeleteAPIView.as_view(), name='user-delete-account'),
    path('user/export-data/', UserExportDataAPIView.as_view(), name='user-export-data'),
    
    # User Additional Features
    path('user/avatar/', UserAvatarUploadAPIView.as_view(), name='user-avatar'),
    path('user/notifications/', UserNotificationsAPIView.as_view(), name='user-notifications'),
    path('user/preferences/', UserPreferencesAPIView.as_view(), name='user-preferences'),
    
    # Admin Only APIs
    path('admin/subscriptions/', views.AdminSubscriptionsAPIView.as_view(), name='admin-subscriptions'),
    path('admin/agents/', views.AdminAgentsAPIView.as_view(), name='admin-agents'),
    path('admin/users/', views.AdminUsersAPIView.as_view(), name='admin-users'),
]
