from django.core.management.base import BaseCommand
from django.conf import settings
import stripe
from subscriptions.models import SubscriptionPlan

stripe.api_key = settings.STRIPE_SECRET_KEY


class Command(BaseCommand):
    help = 'Create Stripe products and prices for subscription plans'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Creating Stripe products and prices...'))
        
        plans = SubscriptionPlan.objects.filter(is_active=True)
        
        for plan in plans:
            if not plan.stripe_product_id:
                # Create product
                try:
                    product = stripe.Product.create(
                        name=plan.name,
                        description=f"{plan.name} - {plan.max_agents} agents, {plan.max_minutes} minutes/{plan.billing_cycle}",
                        metadata={
                            'plan_id': str(plan.id),
                            'plan_type': plan.plan_type
                        }
                    )
                    
                    plan.stripe_product_id = product.id
                    self.stdout.write(f'Created product: {plan.name} ({product.id})')
                    
                except stripe.error.StripeError as e:
                    self.stdout.write(
                        self.style.ERROR(f'Error creating product for {plan.name}: {str(e)}')
                    )
                    continue
            
            if not plan.stripe_price_id:
                # Create price
                try:
                    price = stripe.Price.create(
                        product=plan.stripe_product_id,
                        unit_amount=int(plan.price * 100),  # Convert to cents
                        currency='usd',
                        recurring={
                            'interval': 'month' if plan.billing_cycle == 'monthly' else 'year',
                        },
                        metadata={
                            'plan_id': str(plan.id),
                            'plan_type': plan.plan_type
                        }
                    )
                    
                    plan.stripe_price_id = price.id
                    plan.save()
                    
                    self.stdout.write(f'Created price: {plan.name} (${plan.price}/{plan.billing_cycle}) - {price.id}')
                    
                except stripe.error.StripeError as e:
                    self.stdout.write(
                        self.style.ERROR(f'Error creating price for {plan.name}: {str(e)}')
                    )
                    continue
        
        self.stdout.write(self.style.SUCCESS('Stripe products and prices created successfully!'))
