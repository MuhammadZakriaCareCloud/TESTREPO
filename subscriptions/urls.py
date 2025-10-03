from django.urls import path
from .package_views import (
    PackageSetupView,
    UserPackageSelectionView,
    SubscriptionActionView
)
from .simplified_views import (
    PackageSelectionAPIView,
    SubscriptionManagementAPIView,
    BillingInvoicesAPIView,
    StripeWebhookAPIView
)
from .billing_views import (
    SubscriptionPlansAPIView,
    CreateSubscriptionAPIView,
    SubscriptionManagementAPIView as BillingSubscriptionManagementAPIView,
    BillingHistoryAPIView,
    PaymentMethodsAPIView,
    UsageTrackingAPIView,
    StripeWebhookAPIView as BillingStripeWebhookAPIView
)
from . import views  # Keep old views for backward compatibility

urlpatterns = [
    # NEW: Complete Stripe Billing System
    path('api/plans/', SubscriptionPlansAPIView.as_view(), name='api-subscription-plans'),
    path('api/subscribe/', CreateSubscriptionAPIView.as_view(), name='api-create-subscription'),
    path('api/manage/', BillingSubscriptionManagementAPIView.as_view(), name='api-subscription-management'),
    path('api/billing-history/', BillingHistoryAPIView.as_view(), name='api-billing-history'),
    path('api/payment-methods/', PaymentMethodsAPIView.as_view(), name='api-payment-methods'),
    path('api/usage/', UsageTrackingAPIView.as_view(), name='api-usage-tracking'),
    path('api/stripe-webhook/', BillingStripeWebhookAPIView.as_view(), name='api-stripe-webhook'),
    
    # Package System (UI-focused)
    path('admin/packages/', PackageSetupView.as_view(), name='admin-package-setup'),
    path('user/packages/', UserPackageSelectionView.as_view(), name='user-package-selection'),
    path('user/actions/', SubscriptionActionView.as_view(), name='subscription-actions'),
    
    # Simplified System (Alternative)
    path('packages/', PackageSelectionAPIView.as_view(), name='package-selection'),
    path('manage/', SubscriptionManagementAPIView.as_view(), name='subscription-management'),
    path('invoices/', BillingInvoicesAPIView.as_view(), name='billing-invoices'),
    path('webhook/', StripeWebhookAPIView.as_view(), name='stripe-webhook'),
    
    # Legacy API endpoints (backward compatibility)
    path('plans/', views.SubscriptionPlansAPIView.as_view(), name='subscription-plans'),
    path('current/', views.UserSubscriptionAPIView.as_view(), name='current-subscription'),
    path('billing-history/', views.BillingHistoryAPIView.as_view(), name='billing-history'),
]
