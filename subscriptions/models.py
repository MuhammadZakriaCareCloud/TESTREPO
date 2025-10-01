from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()


class SubscriptionPlan(models.Model):
    """Subscription plans available"""
    PLAN_TYPES = [
        ('basic', 'Basic'),
        ('premium', 'Premium'),
        ('enterprise', 'Enterprise'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    billing_cycle = models.CharField(max_length=20, choices=[
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ])
    
    # Features
    max_agents = models.IntegerField(default=1)
    max_minutes = models.IntegerField(default=1000)  # Monthly minutes
    inbound_calls = models.BooleanField(default=True)
    outbound_calls = models.BooleanField(default=True)
    ai_assistance = models.BooleanField(default=False)
    analytics = models.BooleanField(default=False)
    
    # Stripe related
    stripe_price_id = models.CharField(max_length=100, blank=True)
    stripe_product_id = models.CharField(max_length=100, blank=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - ${self.price}/{self.billing_cycle}"


class Subscription(models.Model):
    """User subscriptions"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
        ('suspended', 'Suspended'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscription')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='inactive')
    
    # Stripe related
    stripe_subscription_id = models.CharField(max_length=100, blank=True)
    stripe_customer_id = models.CharField(max_length=100, blank=True)
    
    # Subscription details
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField()
    next_billing_date = models.DateTimeField()
    
    # Usage tracking
    minutes_used = models.IntegerField(default=0)
    agents_used = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.plan.name}"
    
    @property
    def is_active(self):
        return self.status == 'active' and self.end_date > timezone.now()
    
    @property
    def days_remaining(self):
        if self.end_date > timezone.now():
            return (self.end_date - timezone.now()).days
        return 0


class BillingHistory(models.Model):
    """Billing and payment history"""
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name='billing_history')
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS)
    
    # Stripe related
    stripe_invoice_id = models.CharField(max_length=100, blank=True)
    stripe_payment_intent_id = models.CharField(max_length=100, blank=True)
    
    billing_period_start = models.DateTimeField()
    billing_period_end = models.DateTimeField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.subscription.user.email} - ${self.amount} - {self.status}"


class UsageMetrics(models.Model):
    """Track usage metrics per subscription"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name='usage_metrics')
    
    date = models.DateField(default=timezone.now)
    minutes_used = models.IntegerField(default=0)
    inbound_calls = models.IntegerField(default=0)
    outbound_calls = models.IntegerField(default=0)
    ai_requests = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['subscription', 'date']
        
    def __str__(self):
        return f"{self.subscription.user.email} - {self.date}"
