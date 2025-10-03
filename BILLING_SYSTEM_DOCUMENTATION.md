# Stripe Billing System Documentation

## Overview

The Django Call Center Dashboard now includes a comprehensive Stripe billing system with advanced subscription management, usage tracking, and automated billing features.

## Features

### ✅ Core Billing Features
- **Multi-tier subscription plans** with customizable features
- **Stripe payment processing** with secure webhooks
- **Usage tracking and overage billing** for call minutes and agents
- **Automated billing cycles** (monthly/yearly)
- **Payment method management** with multiple cards support
- **Invoice generation and history** with PDF downloads
- **Usage alerts and notifications** at 80% and 100% thresholds
- **Subscription lifecycle management** (create, upgrade, downgrade, cancel)

### ✅ Advanced Features
- **Proration handling** for mid-cycle plan changes
- **Trial periods** with configurable duration
- **Grace periods** for failed payments
- **Automatic retry logic** for failed charges
- **Webhook event processing** for real-time updates
- **Add-on services** for extra features
- **White-label billing** for enterprise customers

## Architecture

### Models (`subscriptions/models.py`)

#### SubscriptionPlan
- Defines available subscription tiers
- Includes feature limits and pricing
- Stripe product/price integration

#### Subscription
- User's active subscription
- Tracks billing periods and status
- Links to Stripe subscription

#### BillingHistory
- Complete invoice and payment history
- Supports subscription and overage billing
- PDF invoice storage

#### UsageRecord
- Tracks call minutes and agent usage
- Supports real-time usage monitoring
- Enables overage calculations

#### UsageAlert
- Configurable usage notifications  
- Multiple alert types and priorities
- Action-required alerts

### API Endpoints

#### Subscription Management
```
GET    /subscriptions/api/plans/              # List available plans
POST   /subscriptions/api/subscribe/          # Create new subscription
GET    /subscriptions/api/manage/             # Get current subscription
POST   /subscriptions/api/manage/             # Update subscription (upgrade/cancel)
```

#### Billing & Payments
```
GET    /subscriptions/api/billing-history/    # Get billing history
GET    /subscriptions/api/payment-methods/    # List payment methods
POST   /subscriptions/api/payment-methods/    # Add payment method
POST   /subscriptions/api/usage/              # Record usage
```

#### Webhooks
```
POST   /subscriptions/api/stripe-webhook/     # Stripe webhook endpoint
```

## Setup Instructions

### 1. Environment Configuration

Update your `.env` file with Stripe credentials:

```bash
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_LIVE_MODE=False

# Stripe Payment URLs (Frontend)
STRIPE_SUCCESS_URL=http://localhost:3000/billing/success
STRIPE_CANCEL_URL=http://localhost:3000/billing/cancel

# Subscription Settings
TRIAL_PERIOD_DAYS=14
GRACE_PERIOD_DAYS=3
MAX_PAYMENT_RETRIES=3
```

### 2. Database Migration

Run migrations to create billing tables:

```bash
python manage.py makemigrations subscriptions
python manage.py migrate
```

### 3. Create Subscription Plans

Create your subscription plans in the Django admin or via management command:

```bash
python manage.py setup_packages
```

### 4. Sync with Stripe

Create Stripe products and prices for your plans:

```bash
python manage.py create_stripe_products
```

### 5. Configure Webhooks

In your Stripe dashboard:

1. Go to Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/subscriptions/api/stripe-webhook/`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `invoice.created`
   - `payment_method.attached`
   - `setup_intent.succeeded`

## Usage Examples

### Creating a Subscription

```python
from subscriptions.stripe_service import StripeService

stripe_service = StripeService()

# Create subscription
result = stripe_service.create_subscription(
    user=user,
    plan=subscription_plan,
    payment_method_id='pm_1234567890',
    billing_cycle='monthly'
)

if result['success']:
    subscription = result['subscription']
    print(f"Subscription created: {subscription.id}")
```

### Tracking Usage

```python
from subscriptions.models import UsageRecord

# Record call usage
UsageRecord.objects.create(
    subscription=user.subscription,
    minutes_used=45,
    call_id='call_123',
    timestamp=timezone.now()
)
```

### Managing Subscriptions

```python
# Upgrade subscription
new_plan = SubscriptionPlan.objects.get(name='Professional')
result = stripe_service.update_subscription(subscription, new_plan)

# Cancel subscription  
result = stripe_service.cancel_subscription(subscription)
```

## API Usage

### Get Available Plans

```javascript
fetch('/subscriptions/api/plans/')
  .then(response => response.json())
  .then(data => {
    console.log('Available plans:', data.plans);
  });
```

### Create Subscription

```javascript
fetch('/subscriptions/api/subscribe/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    plan_id: 'plan_123',
    payment_method_id: 'pm_123',
    billing_cycle: 'monthly'
  })
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('Subscription created:', data.subscription);
  }
});
```

### Track Usage

```javascript
fetch('/subscriptions/api/usage/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    minutes_used: 30,
    call_id: 'call_456'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Usage recorded:', data.success);
});
```

## Testing

### Run Test Suite

Test the complete billing system:

```bash
python test_billing_system.py
```

This will test:
- Subscription plan creation
- Customer management
- Usage tracking
- Billing history
- Stripe API integration

### Manual Testing

1. **Create subscription plans** in Django admin
2. **Run Stripe sync** to create products/prices
3. **Test subscription creation** via API
4. **Simulate webhook events** using Stripe CLI
5. **Verify billing history** and usage tracking

## Webhook Event Handling

The system handles these Stripe webhook events:

### `customer.subscription.created`
- Creates local subscription record
- Sets up billing cycle
- Sends welcome email

### `customer.subscription.updated`
- Updates subscription status
- Handles plan changes
- Updates billing periods

### `invoice.payment_succeeded`
- Records successful payment
- Creates billing history record
- Resets failed payment attempts

### `invoice.payment_failed`
- Increments failed attempt counter
- Creates payment failure alert
- Triggers retry logic

### `customer.subscription.deleted`
- Marks subscription as cancelled
- Records cancellation date
- Preserves historical data

## Security Considerations

### Webhook Security
- All webhooks verify Stripe signatures
- Endpoint is CSRF-exempt but signature-protected
- Idempotent event processing

### Payment Security
- No card data stored locally
- PCI compliance through Stripe
- Secure payment method tokenization

### API Security
- JWT authentication required
- User-scoped data access
- Rate limiting on endpoints

## Monitoring & Alerts

### Usage Alerts
- 80% usage threshold warning
- 100% usage limit notification
- Overage charge notifications

### Payment Alerts
- Failed payment notifications
- Subscription cancellation alerts
- Trial expiration reminders

### System Monitoring
- Webhook event processing logs
- Failed payment retry tracking
- Usage anomaly detection

## Production Deployment

### Environment Variables
```bash
# Production Stripe keys
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_LIVE_MODE=True

# Production URLs
STRIPE_SUCCESS_URL=https://yourdomain.com/billing/success
STRIPE_CANCEL_URL=https://yourdomain.com/billing/cancel
```

### SSL Requirements
- HTTPS required for webhook endpoints
- SSL certificate for payment pages
- Secure cookie settings

### Database Considerations
- Index on subscription status fields
- Archive old billing records
- Regular backup of payment data

## Troubleshooting

### Common Issues

#### Webhook Events Not Processing
1. Check webhook URL is accessible
2. Verify webhook secret matches
3. Check SSL certificate validity
4. Review webhook event logs

#### Payment Failures
1. Check payment method validity
2. Verify customer has sufficient funds
3. Review Stripe error messages
4. Check for declined transactions

#### Subscription Sync Issues
1. Compare Stripe vs local data
2. Check for webhook processing delays
3. Verify plan/price mappings
4. Review subscription status updates

### Debug Commands

```bash
# Check Stripe connection
python manage.py shell -c "import stripe; print(stripe.Account.retrieve())"

# Sync subscription data
python manage.py create_stripe_products --force-update

# Test webhook processing
python manage.py shell -c "from subscriptions.stripe_service import StripeService; StripeService().test_webhook_processing()"
```

## Support

For billing system support:

1. **Check logs** in Django admin → Log entries
2. **Review Stripe dashboard** for payment issues
3. **Test webhook endpoints** using Stripe CLI
4. **Run billing test suite** to verify functionality

The billing system is designed to be robust, scalable, and fully integrated with your call center dashboard. It provides complete subscription lifecycle management with enterprise-grade features.
