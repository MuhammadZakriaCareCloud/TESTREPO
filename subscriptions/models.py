from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()


class SubscriptionPlan(models.Model):
    """Subscription packages with defined features"""
    PLAN_TYPES = [
        ('starter', 'Starter'),
        ('pro', 'Pro'),
        ('enterprise', 'Enterprise'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)  # e.g., Starter, Pro, Enterprise
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Core Features
    call_minutes_limit = models.IntegerField(default=1000, help_text="Monthly call minutes (inbound, outbound, or total)")
    agents_allowed = models.IntegerField(default=1, help_text="Number of agents allowed")
    
    # Analytics & Features
    analytics_access = models.BooleanField(default=False, help_text="Access to analytics/explainability")
    advanced_analytics = models.BooleanField(default=False, help_text="Advanced analytics, API access")
    
    # Stripe Integration
    stripe_price_id = models.CharField(max_length=100, blank=True)
    stripe_product_id = models.CharField(max_length=100, blank=True)
    
    # Admin features
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - ${self.price}/{self.billing_cycle}"


class Subscription(models.Model):
    """User subscription management"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscription')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Stripe Integration
    stripe_subscription_id = models.CharField(max_length=100, blank=True)
    stripe_customer_id = models.CharField(max_length=100, blank=True)
    
    # Billing Period
    current_period_start = models.DateTimeField(default=timezone.now)
    current_period_end = models.DateTimeField()
    cancel_at_period_end = models.BooleanField(default=False)
    
    # Usage Tracking
    minutes_used_this_month = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.plan.name}"
    
    @property
    def is_active(self):
        return self.status == 'active' and self.current_period_end > timezone.now()
    
    @property
    def days_remaining(self):
        if self.current_period_end > timezone.now():
            return (self.current_period_end - timezone.now()).days
        return 0
    
    @property
    def minutes_remaining(self):
        return max(0, self.plan.call_minutes_limit - self.minutes_used_this_month)
    
    @property
    def usage_percentage(self):
        if self.plan.call_minutes_limit == 0:
            return 0
        return min(100, (self.minutes_used_this_month / self.plan.call_minutes_limit) * 100)


class BillingHistory(models.Model):
    """Payment history and invoices"""
    PAYMENT_STATUS = [
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('pending', 'Pending'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name='billing_history')
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS)
    description = models.CharField(max_length=255, blank=True)
    
    # Stripe Integration
    stripe_invoice_id = models.CharField(max_length=100, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.subscription.user.email} - ${self.amount} - {self.status}"


class UsageAlert(models.Model):
    """Usage alerts when limits are near/exceeded"""
    ALERT_TYPES = [
        ('limit_warning', 'Limit Warning (80%)'),
        ('limit_exceeded', 'Limit Exceeded'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name='usage_alerts')
    
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.subscription.user.email} - {self.alert_type}"
