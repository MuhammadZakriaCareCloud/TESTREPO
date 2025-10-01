from django.urls import path
from . import views

urlpatterns = [
    # Subscription Plans
    path('plans/', views.SubscriptionPlansAPIView.as_view(), name='subscription-plans'),
    
    # Subscription Management
    path('create/', views.CreateSubscriptionAPIView.as_view(), name='create-subscription'),
    path('current/', views.UserSubscriptionAPIView.as_view(), name='current-subscription'),
    path('cancel/', views.CancelSubscriptionAPIView.as_view(), name='cancel-subscription'),
    path('update/', views.UpdateSubscriptionAPIView.as_view(), name='update-subscription'),
    path('billing-history/', views.BillingHistoryAPIView.as_view(), name='billing-history'),
    
    # Stripe Webhook
    path('webhook/', views.stripe_webhook, name='stripe-webhook'),
]
