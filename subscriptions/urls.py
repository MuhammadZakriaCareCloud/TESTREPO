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
from . import views  # Keep old views for backward compatibility

urlpatterns = [
    # NEW: Complete Package System (According to Image)
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
