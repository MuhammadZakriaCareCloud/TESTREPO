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

# Configure Stripe (keys will be added later)
if hasattr(settings, 'STRIPE_SECRET_KEY') and settings.STRIPE_SECRET_KEY:
    stripe.api_key = settings.STRIPE_SECRET_KEY


class PackageSetupView(APIView):
    """
    Package Setup for Admin Only - Create/Update subscription packages
    Admin can define package features according to image
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        responses={200: "Packages setup for admin management"},
        operation_description="Admin setup for subscription packages",
        tags=['Subscriptions']
    )
    def get(self, request):
        if not request.user.role == 'admin':
            return Response({
                'error': 'Admin access required'
            }, status=status.HTTP_403_FORBIDDEN)
        
        packages = SubscriptionPlan.objects.all().order_by('price')
        admin_packages = []
        
        for package in packages:
            admin_packages.append({
                'id': str(package.id),
                'package_name': package.name,
                'plan_type': package.plan_type,
                'monthly_price': float(package.price),
                'features': {
                    'call_minutes_limit': package.call_minutes_limit,
                    'agents_allowed': package.agents_allowed,
                    'analytics_access': package.analytics_access,
                    'advanced_analytics': package.advanced_analytics,
                },
                'stripe_config': {
                    'price_id': package.stripe_price_id,
                    'product_id': package.stripe_product_id
                },
                'is_active': package.is_active,
                'created_at': package.created_at.isoformat()
            })
        
        return Response({
            'admin_packages': admin_packages,
            'total_packages': len(admin_packages),
            'stripe_configured': bool(getattr(settings, 'STRIPE_SECRET_KEY', None)),
            'instructions': {
                'stripe_setup': 'Add STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY in settings.py',
                'package_management': 'Use Django admin or create management commands',
                'user_flow': 'Users will see package selection on first login'
            }
        }, status=status.HTTP_200_OK)


class UserPackageSelectionView(APIView):
    """
    User Package Selection - First login or when not subscribed
    Shows feature comparison table like in the image
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        responses={200: "Available packages for user selection"},
        operation_description="Get packages for user selection with feature comparison",
        tags=['Subscriptions']
    )
    def get(self, request):
        user = request.user
        
        # Check if user needs to choose a package
        has_subscription = False
        try:
            subscription = user.subscription
            has_subscription = subscription.is_active
        except Subscription.DoesNotExist:
            pass
        
        packages = SubscriptionPlan.objects.filter(is_active=True).order_by('price')
        package_options = []
        
        for package in packages:
            package_options.append({
                'id': str(package.id),
                'package_name': package.name,
                'plan_type': package.plan_type,
                'monthly_price': float(package.price),
                'call_minutes_limit': package.call_minutes_limit,
                'agents_allowed': package.agents_allowed,
                'analytics_access': package.analytics_access,
                'advanced_analytics': package.advanced_analytics,
                'recommended': package.plan_type == 'pro',  # Pro is recommended
                'features_text': f"{package.call_minutes_limit} minutes, {package.agents_allowed} agents"
            })
        
        # Feature comparison matrix
        feature_comparison = {
            'features': [
                'Monthly Call Minutes',
                'Number of Agents', 
                'Access to Analytics/Explainability',
                'Advanced Analytics & API Access'
            ],
            'packages': {}
        }
        
        for package in package_options:
            feature_comparison['packages'][package['package_name']] = [
                f"{package['call_minutes_limit']} minutes",
                f"{package['agents_allowed']} agents",
                "✅ Yes" if package['analytics_access'] else "❌ No",
                "✅ Yes" if package['advanced_analytics'] else "❌ No"
            ]
        
        return Response({
            'user_needs_package_selection': not has_subscription,
            'current_subscription': self._get_current_subscription(user) if has_subscription else None,
            'available_packages': package_options,
            'feature_comparison': feature_comparison,
            'stripe_ready': bool(getattr(settings, 'STRIPE_PUBLISHABLE_KEY', None)),
            'selection_required': not has_subscription,
            'message': 'Select a package to continue' if not has_subscription else 'Current subscription active'
        }, status=status.HTTP_200_OK)
    
    def _get_current_subscription(self, user):
        """Get current subscription details"""
        try:
            subscription = user.subscription
            return {
                'package_name': subscription.plan.name,
                'status': subscription.status,
                'days_remaining': subscription.days_remaining,
                'usage_percentage': subscription.usage_percentage
            }
        except:
            return None


class SubscriptionActionView(APIView):
    """
    Complete Subscription Management - Subscribe, Upgrade, Downgrade, Cancel
    Handles all subscription actions in one place
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'action': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    enum=['subscribe', 'upgrade', 'downgrade', 'cancel', 'view_invoices'],
                    description='Action to perform on subscription'
                ),
                'package_id': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Required for subscribe/upgrade/downgrade actions'
                ),
                'payment_method_id': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Stripe payment method ID (required for new subscriptions)'
                )
            },
            required=['action']
        ),
        responses={
            200: "Subscription action completed successfully",
            400: "Bad request or validation error",
            402: "Payment required or failed"
        },
        operation_description="Manage subscription actions - subscribe, upgrade, downgrade, cancel",
        tags=['Subscriptions']
    )
    def post(self, request):
        user = request.user
        action = request.data.get('action')
        package_id = request.data.get('package_id')
        payment_method_id = request.data.get('payment_method_id')
        
        # Check Stripe configuration
        if not getattr(settings, 'STRIPE_SECRET_KEY', None):
            return Response({
                'error': 'Payment system not configured',
                'message': 'Stripe keys need to be added by admin'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        if action == 'subscribe':
            return self._handle_new_subscription(user, package_id, payment_method_id)
        elif action == 'upgrade':
            return self._handle_upgrade(user, package_id)
        elif action == 'downgrade':
            return self._handle_downgrade(user, package_id)
        elif action == 'cancel':
            return self._handle_cancellation(user)
        elif action == 'view_invoices':
            return self._get_billing_invoices(user)
        else:
            return Response({
                'error': 'Invalid action',
                'valid_actions': ['subscribe', 'upgrade', 'downgrade', 'cancel', 'view_invoices']
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def _handle_new_subscription(self, user, package_id, payment_method_id):
        """Handle new subscription creation"""
        if not package_id or not payment_method_id:
            return Response({
                'error': 'Package selection and payment method required',
                'required_fields': ['package_id', 'payment_method_id']
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            package = SubscriptionPlan.objects.get(id=package_id, is_active=True)
        except SubscriptionPlan.DoesNotExist:
            return Response({
                'error': 'Invalid package selected'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already has subscription
        if hasattr(user, 'subscription') and user.subscription.is_active:
            return Response({
                'error': 'User already has active subscription',
                'action_required': 'Use upgrade/downgrade instead'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Note: Actual Stripe integration will happen when keys are added
            # For now, create local subscription
            subscription, created = Subscription.objects.update_or_create(
                user=user,
                defaults={
                    'plan': package,
                    'status': 'active',
                    'stripe_subscription_id': f'sub_mock_{user.id}',  # Mock ID until Stripe is configured
                    'stripe_customer_id': f'cus_mock_{user.id}',
                    'current_period_start': timezone.now(),
                    'current_period_end': timezone.now() + timedelta(days=30),
                    'cancel_at_period_end': False,
                    'minutes_used_this_month': 0
                }
            )
            
            # Create billing record
            BillingHistory.objects.create(
                subscription=subscription,
                amount=package.price,
                status='paid',
                description=f'Subscription to {package.name} package'
            )
            
            return Response({
                'success': True,
                'message': f'Successfully subscribed to {package.name} package!',
                'subscription': {
                    'id': str(subscription.id),
                    'package_name': package.name,
                    'monthly_price': float(package.price),
                    'status': 'active',
                    'features': {
                        'call_minutes': package.call_minutes_limit,
                        'agents_allowed': package.agents_allowed,
                        'analytics': package.analytics_access,
                        'api_access': package.advanced_analytics
                    }
                },
                'next_steps': [
                    'Set up your AI agent',
                    'Start making calls',
                    'Monitor usage in dashboard'
                ]
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Subscription creation error: {str(e)}")
            return Response({
                'error': 'Subscription creation failed',
                'message': 'Please try again or contact support'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _handle_upgrade(self, user, package_id):
        """Handle subscription upgrade"""
        try:
            subscription = user.subscription
            new_package = SubscriptionPlan.objects.get(id=package_id, is_active=True)
            
            if new_package.price <= subscription.plan.price:
                return Response({
                    'error': 'Selected package is not an upgrade',
                    'current_price': float(subscription.plan.price),
                    'selected_price': float(new_package.price)
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update subscription
            subscription.plan = new_package
            subscription.save()
            
            return Response({
                'success': True,
                'message': f'Successfully upgraded to {new_package.name}!',
                'upgrade_details': {
                    'new_package': new_package.name,
                    'new_price': float(new_package.price),
                    'additional_features': {
                        'extra_minutes': new_package.call_minutes_limit - subscription.plan.call_minutes_limit,
                        'extra_agents': new_package.agents_allowed - subscription.plan.agents_allowed
                    }
                }
            }, status=status.HTTP_200_OK)
            
        except Subscription.DoesNotExist:
            return Response({
                'error': 'No active subscription found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def _handle_downgrade(self, user, package_id):
        """Handle subscription downgrade"""
        try:
            subscription = user.subscription
            new_package = SubscriptionPlan.objects.get(id=package_id, is_active=True)
            
            if new_package.price >= subscription.plan.price:
                return Response({
                    'error': 'Selected package is not a downgrade'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({
                'success': True,
                'message': f'Downgrade to {new_package.name} scheduled for next billing cycle',
                'effective_date': subscription.current_period_end.isoformat(),
                'current_access': 'You will keep current features until end of billing period'
            }, status=status.HTTP_200_OK)
            
        except Subscription.DoesNotExist:
            return Response({
                'error': 'No active subscription found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def _handle_cancellation(self, user):
        """Handle subscription cancellation"""
        try:
            subscription = user.subscription
            
            subscription.cancel_at_period_end = True
            subscription.save()
            
            return Response({
                'success': True,
                'message': 'Subscription will be cancelled at end of current billing period',
                'cancellation_date': subscription.current_period_end.isoformat(),
                'access_until': subscription.current_period_end.isoformat(),
                'refund_policy': 'No refunds for current period, access continues until period end'
            }, status=status.HTTP_200_OK)
            
        except Subscription.DoesNotExist:
            return Response({
                'error': 'No active subscription found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def _get_billing_invoices(self, user):
        """Get user's billing history and invoices"""
        try:
            subscription = user.subscription
            invoices = BillingHistory.objects.filter(
                subscription=subscription
            ).order_by('-created_at')[:10]
            
            invoice_list = []
            for invoice in invoices:
                invoice_list.append({
                    'id': str(invoice.id),
                    'amount': float(invoice.amount),
                    'status': invoice.status,
                    'description': invoice.description,
                    'date': invoice.created_at.isoformat(),
                    'download_available': bool(invoice.stripe_invoice_id)
                })
            
            return Response({
                'invoices': invoice_list,
                'total_invoices': len(invoice_list),
                'subscription_status': subscription.status
            }, status=status.HTTP_200_OK)
            
        except Subscription.DoesNotExist:
            return Response({
                'invoices': [],
                'message': 'No subscription found'
            }, status=status.HTTP_200_OK)
