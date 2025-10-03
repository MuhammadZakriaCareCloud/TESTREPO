from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.conf import settings
from django.utils import timezone
from datetime import datetime, timedelta
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import stripe
import logging

from .models import SubscriptionPlan, Subscription, BillingHistory, UsageAlert

User = get_user_model()
logger = logging.getLogger(__name__)

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


class PackageSelectionAPIView(APIView):
    """Package selection for users - first login or when not subscribed"""
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        responses={200: "Available packages with feature comparison"},
        operation_description="Get available packages for selection with feature comparison table",
        tags=['Subscriptions']
    )
    def get(self, request):
        user = request.user
        
        # Check if user needs to choose a package
        has_subscription = hasattr(user, 'subscription') and user.subscription.is_active
        
        packages = SubscriptionPlan.objects.filter(is_active=True).order_by('price')
        package_data = []
        
        for package in packages:
            package_data.append({
                'id': str(package.id),
                'package_name': package.name,
                'monthly_price': float(package.price),
                'call_minutes_limit': package.call_minutes_limit,
                'agents_allowed': package.agents_allowed,
                'analytics_access': package.analytics_access,
                'advanced_analytics': package.advanced_analytics,
                'stripe_price_id': package.stripe_price_id,
                'recommended': package.plan_type == 'pro'  # Highlight Pro as recommended
            })
        
        return Response({
            'user_needs_package_selection': not has_subscription,
            'available_packages': package_data,
            'feature_comparison': {
                'call_minutes': [p['call_minutes_limit'] for p in package_data],
                'agents': [p['agents_allowed'] for p in package_data],
                'analytics': [p['analytics_access'] for p in package_data],
                'advanced_features': [p['advanced_analytics'] for p in package_data]
            }
        }, status=status.HTTP_200_OK)


class SubscriptionManagementAPIView(APIView):
    """Complete subscription management - subscribe, upgrade, downgrade, cancel"""
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        responses={200: "Current subscription details"},
        operation_description="Get current subscription status and management options",
        tags=['Subscriptions']
    )
    def get(self, request):
        user = request.user
        
        try:
            subscription = user.subscription
            
            # Get usage billing alerts if limits are near
            usage_alerts = []
            if subscription.usage_percentage > 80:
                usage_alerts.append({
                    'type': 'warning',
                    'message': f'You have used {subscription.usage_percentage:.1f}% of your monthly minutes',
                    'minutes_used': subscription.minutes_used_this_month,
                    'minutes_limit': subscription.plan.call_minutes_limit
                })
            
            return Response({
                'subscription': {
                    'id': str(subscription.id),
                    'package_name': subscription.plan.name,
                    'status': subscription.status,
                    'monthly_price': float(subscription.plan.price),
                    'current_period_end': subscription.current_period_end.isoformat(),
                    'days_remaining': subscription.days_remaining,
                    'cancel_at_period_end': subscription.cancel_at_period_end
                },
                'usage': {
                    'minutes_used': subscription.minutes_used_this_month,
                    'minutes_limit': subscription.plan.call_minutes_limit,
                    'minutes_remaining': subscription.minutes_remaining,
                    'usage_percentage': subscription.usage_percentage
                },
                'features': {
                    'agents_allowed': subscription.plan.agents_allowed,
                    'analytics_access': subscription.plan.analytics_access,
                    'advanced_analytics': subscription.plan.advanced_analytics
                },
                'usage_alerts': usage_alerts,
                'management_options': {
                    'can_upgrade': True,
                    'can_downgrade': subscription.plan.plan_type != 'starter',
                    'can_cancel': subscription.status == 'active'
                }
            }, status=status.HTTP_200_OK)
            
        except Subscription.DoesNotExist:
            return Response({
                'subscription': None,
                'message': 'No active subscription found',
                'needs_package_selection': True
            }, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'action': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    enum=['subscribe', 'upgrade', 'downgrade', 'cancel'],
                    description='Action to perform'
                ),
                'package_id': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Required for subscribe/upgrade/downgrade'
                ),
                'payment_method_id': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Required for subscribe'
                )
            },
            required=['action']
        ),
        responses={
            200: "Subscription action completed",
            400: "Bad request"
        },
        operation_description="Manage subscription - subscribe, upgrade, downgrade, or cancel",
        tags=['Subscriptions']
    )
    def post(self, request):
        user = request.user
        action = request.data.get('action')
        package_id = request.data.get('package_id')
        payment_method_id = request.data.get('payment_method_id')
        
        if action == 'subscribe':
            return self._handle_subscribe(user, package_id, payment_method_id)
        elif action == 'upgrade':
            return self._handle_upgrade(user, package_id)
        elif action == 'downgrade':
            return self._handle_downgrade(user, package_id)
        elif action == 'cancel':
            return self._handle_cancel(user)
        else:
            return Response({
                'error': 'Invalid action. Use: subscribe, upgrade, downgrade, or cancel'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def _handle_subscribe(self, user, package_id, payment_method_id):
        """Handle new subscription"""
        if not package_id or not payment_method_id:
            return Response({
                'error': 'Package ID and payment method required for subscription'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            package = SubscriptionPlan.objects.get(id=package_id, is_active=True)
        except SubscriptionPlan.DoesNotExist:
            return Response({
                'error': 'Invalid package selected'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Create Stripe customer if doesn't exist
            try:
                customer = stripe.Customer.retrieve(user.stripe_customer_id)
            except:
                customer = stripe.Customer.create(
                    email=user.email,
                    name=user.get_full_name(),
                    payment_method=payment_method_id
                )
                user.stripe_customer_id = customer.id
                user.save()
            
            # Create Stripe subscription
            stripe_subscription = stripe.Subscription.create(
                customer=customer.id,
                items=[{'price': package.stripe_price_id}],
                default_payment_method=payment_method_id
            )
            
            # Create local subscription
            subscription, created = Subscription.objects.update_or_create(
                user=user,
                defaults={
                    'plan': package,
                    'status': 'active',
                    'stripe_subscription_id': stripe_subscription.id,
                    'stripe_customer_id': customer.id,
                    'current_period_start': timezone.now(),
                    'current_period_end': timezone.now() + timedelta(days=30),
                    'cancel_at_period_end': False,
                    'minutes_used_this_month': 0
                }
            )
            
            return Response({
                'message': 'Successfully subscribed to package',
                'subscription_id': str(subscription.id),
                'package_name': package.name,
                'status': 'active'
            }, status=status.HTTP_200_OK)
            
        except stripe.error.StripeError as e:
            return Response({
                'error': f'Payment failed: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def _handle_upgrade(self, user, package_id):
        """Handle subscription upgrade"""
        try:
            subscription = user.subscription
            new_package = SubscriptionPlan.objects.get(id=package_id, is_active=True)
            
            if new_package.price <= subscription.plan.price:
                return Response({
                    'error': 'Selected package is not an upgrade'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update Stripe subscription
            stripe.Subscription.modify(
                subscription.stripe_subscription_id,
                items=[{
                    'id': subscription.stripe_subscription_id,
                    'price': new_package.stripe_price_id,
                }],
                proration_behavior='always_invoice'
            )
            
            # Update local subscription
            subscription.plan = new_package
            subscription.save()
            
            return Response({
                'message': f'Successfully upgraded to {new_package.name}',
                'new_package': new_package.name,
                'new_price': float(new_package.price)
            }, status=status.HTTP_200_OK)
            
        except Subscription.DoesNotExist:
            return Response({
                'error': 'No active subscription found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def _handle_downgrade(self, user, package_id):
        """Handle subscription downgrade"""
        try:
            subscription = user.subscription
            new_package = SubscriptionPlan.objects.get(id=package_id, is_active=True)
            
            if new_package.price >= subscription.plan.price:
                return Response({
                    'error': 'Selected package is not a downgrade'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Schedule downgrade at period end
            stripe.Subscription.modify(
                subscription.stripe_subscription_id,
                items=[{
                    'id': subscription.stripe_subscription_id,
                    'price': new_package.stripe_price_id,
                }],
                proration_behavior='none'  # Apply at next billing cycle
            )
            
            return Response({
                'message': f'Downgrade to {new_package.name} scheduled for next billing cycle',
                'effective_date': subscription.current_period_end.isoformat()
            }, status=status.HTTP_200_OK)
            
        except Subscription.DoesNotExist:
            return Response({
                'error': 'No active subscription found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def _handle_cancel(self, user):
        """Handle subscription cancellation"""
        try:
            subscription = user.subscription
            
            # Cancel Stripe subscription at period end
            stripe.Subscription.modify(
                subscription.stripe_subscription_id,
                cancel_at_period_end=True
            )
            
            # Update local subscription
            subscription.cancel_at_period_end = True
            subscription.save()
            
            return Response({
                'message': 'Subscription will be cancelled at the end of current billing period',
                'cancellation_date': subscription.current_period_end.isoformat(),
                'access_until': subscription.current_period_end.isoformat()
            }, status=status.HTTP_200_OK)
            
        except Subscription.DoesNotExist:
            return Response({
                'error': 'No active subscription found'
            }, status=status.HTTP_404_NOT_FOUND)


class BillingInvoicesAPIView(APIView):
    """View billing invoices and download"""
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        responses={200: "Billing history and invoices"},
        operation_description="Get billing history with invoice download links",
        tags=['Subscriptions']
    )
    def get(self, request):
        try:
            subscription = request.user.subscription
            billing_history = BillingHistory.objects.filter(
                subscription=subscription
            ).order_by('-created_at')[:10]  # Last 10 payments
            
            invoices = []
            for bill in billing_history:
                invoices.append({
                    'id': str(bill.id),
                    'amount': float(bill.amount),
                    'status': bill.status,
                    'description': bill.description,
                    'created_at': bill.created_at.isoformat(),
                    'stripe_invoice_id': bill.stripe_invoice_id,
                    'download_url': f'/api/subscriptions/invoice/{bill.stripe_invoice_id}/download/' if bill.stripe_invoice_id else None
                })
            
            return Response({
                'billing_history': invoices,
                'total_invoices': len(invoices)
            }, status=status.HTTP_200_OK)
            
        except Subscription.DoesNotExist:
            return Response({
                'billing_history': [],
                'message': 'No subscription found'
            }, status=status.HTTP_200_OK)


class StripeWebhookAPIView(APIView):
    """Handle Stripe webhooks for payment updates"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            return Response({'error': 'Invalid payload'}, status=400)
        except stripe.error.SignatureVerificationError:
            return Response({'error': 'Invalid signature'}, status=400)
        
        # Handle payment success
        if event['type'] == 'invoice.payment_succeeded':
            self._handle_payment_success(event['data']['object'])
        # Handle payment failure
        elif event['type'] == 'invoice.payment_failed':
            self._handle_payment_failure(event['data']['object'])
        # Handle subscription cancellation
        elif event['type'] == 'customer.subscription.deleted':
            self._handle_subscription_cancelled(event['data']['object'])
        
        return Response({'received': True}, status=200)
    
    def _handle_payment_success(self, invoice):
        """Handle successful payment"""
        try:
            subscription = Subscription.objects.get(
                stripe_subscription_id=invoice['subscription']
            )
            
            # Create billing record
            BillingHistory.objects.create(
                subscription=subscription,
                amount=invoice['amount_paid'] / 100,  # Convert from cents
                status='paid',
                description=f"Payment for {subscription.plan.name}",
                stripe_invoice_id=invoice['id']
            )
            
            # Reset monthly usage
            subscription.minutes_used_this_month = 0
            subscription.status = 'active'
            subscription.save()
            
        except Subscription.DoesNotExist:
            logger.error(f"Subscription not found for invoice: {invoice['id']}")
    
    def _handle_payment_failure(self, invoice):
        """Handle failed payment"""
        try:
            subscription = Subscription.objects.get(
                stripe_subscription_id=invoice['subscription']
            )
            
            # Create failed billing record
            BillingHistory.objects.create(
                subscription=subscription,
                amount=invoice['amount_due'] / 100,
                status='failed',
                description=f"Failed payment for {subscription.plan.name}",
                stripe_invoice_id=invoice['id']
            )
            
            # Create usage alert
            UsageAlert.objects.create(
                subscription=subscription,
                alert_type='payment_failed',
                message='Payment failed. Please update your payment method.'
            )
            
        except Subscription.DoesNotExist:
            logger.error(f"Subscription not found for failed invoice: {invoice['id']}")
    
    def _handle_subscription_cancelled(self, subscription_data):
        """Handle subscription cancellation"""
        try:
            subscription = Subscription.objects.get(
                stripe_subscription_id=subscription_data['id']
            )
            subscription.status = 'cancelled'
            subscription.save()
            
        except Subscription.DoesNotExist:
            logger.error(f"Subscription not found: {subscription_data['id']}")
