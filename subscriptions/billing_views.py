"""
Stripe Billing API Views
Complete subscription management with Stripe integration
"""

from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.utils.decorators import method_decorator
from django.utils import timezone
from datetime import datetime, timedelta
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import stripe
import json
import logging

from .models import (
    SubscriptionPlan, Subscription, BillingHistory, 
    UsageAlert, SubscriptionAddon, UsageRecord
)
from .stripe_service import StripeService

User = get_user_model()
logger = logging.getLogger(__name__)

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


class SubscriptionPlansAPIView(APIView):
    """Get all available subscription plans with Stripe prices"""
    permission_classes = [permissions.AllowAny]
    
    @swagger_auto_schema(
        responses={200: "List of subscription plans"},
        operation_description="Get available subscription plans with Stripe pricing",
        tags=['Billing']
    )
    def get(self, request):
        try:
            plans = SubscriptionPlan.objects.filter(is_active=True).order_by('price')
            plans_data = []
            
            for plan in plans:
                plans_data.append({
                    'id': str(plan.id),
                    'name': plan.name,
                    'plan_type': plan.plan_type,
                    'price': float(plan.price),
                    'billing_cycle': plan.billing_cycle,
                    'stripe_price_id': plan.stripe_price_id,
                    'features': {
                        'call_minutes_limit': plan.call_minutes_limit,
                        'agents_allowed': plan.agents_allowed,
                        'ai_agents_allowed': plan.ai_agents_allowed,
                        'concurrent_calls': plan.concurrent_calls,
                        'analytics_access': plan.analytics_access,
                        'advanced_analytics': plan.advanced_analytics,
                        'api_access': plan.api_access,
                        'webhook_access': plan.webhook_access,
                        'custom_integration': plan.custom_integration,
                        'priority_support': plan.priority_support,
                        'call_recording': plan.call_recording,
                        'call_transcription': plan.call_transcription,
                        'sentiment_analysis': plan.sentiment_analysis,
                        'auto_campaigns': plan.auto_campaigns,
                        'crm_integration': plan.crm_integration,
                        'storage_gb': plan.storage_gb,
                    }
                })
            
            return Response({
                'success': True,
                'plans': plans_data
            })
            
        except Exception as e:
            logger.error(f"Error fetching subscription plans: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to fetch subscription plans'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CreateSubscriptionAPIView(APIView):
    """Create a new subscription with Stripe"""
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'plan_id': openapi.Schema(type=openapi.TYPE_STRING),
                'payment_method_id': openapi.Schema(type=openapi.TYPE_STRING),
                'billing_cycle': openapi.Schema(type=openapi.TYPE_STRING, enum=['monthly', 'yearly']),
            },
            required=['plan_id', 'payment_method_id']
        ),
        responses={200: "Subscription created successfully"},
        tags=['Billing']
    )
    def post(self, request):
        try:
            plan_id = request.data.get('plan_id')
            payment_method_id = request.data.get('payment_method_id')
            billing_cycle = request.data.get('billing_cycle', 'monthly')
            
            if not plan_id or not payment_method_id:
                return Response({
                    'success': False,
                    'error': 'Plan ID and payment method are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get the subscription plan
            try:
                plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
            except SubscriptionPlan.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'Invalid subscription plan'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Create subscription with Stripe
            stripe_service = StripeService()
            result = stripe_service.create_subscription(
                user=request.user,
                plan=plan,
                payment_method_id=payment_method_id,
                billing_cycle=billing_cycle
            )
            
            if result['success']:
                return Response({
                    'success': True,
                    'subscription': {
                        'id': result['subscription'].id,
                        'status': result['subscription'].status,
                        'current_period_start': result['subscription'].current_period_start,
                        'current_period_end': result['subscription'].current_period_end,
                        'client_secret': result.get('client_secret')
                    }
                })
            else:
                return Response({
                    'success': False,
                    'error': result['error']
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error creating subscription: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to create subscription'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SubscriptionManagementAPIView(APIView):
    """Manage user's subscription"""
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        responses={200: "Current subscription details"},
        operation_description="Get current user's subscription details",
        tags=['Billing']
    )
    def get(self, request):
        try:
            subscription = Subscription.objects.filter(
                user=request.user,
                status__in=['active', 'trialing', 'past_due']
            ).first()
            
            if not subscription:
                return Response({
                    'success': True,
                    'subscription': None,
                    'message': 'No active subscription found'
                })
            
            # Get usage data
            usage_data = self._get_usage_data(subscription)
            
            return Response({
                'success': True,
                'subscription': {
                    'id': str(subscription.id),
                    'plan': {
                        'name': subscription.plan.name,
                        'price': float(subscription.plan.price),
                        'billing_cycle': subscription.billing_cycle,
                    },
                    'status': subscription.status,
                    'current_period_start': subscription.current_period_start,
                    'current_period_end': subscription.current_period_end,
                    'cancel_at_period_end': subscription.cancel_at_period_end,
                    'usage': usage_data,
                    'stripe_subscription_id': subscription.stripe_subscription_id,
                }
            })
            
        except Exception as e:
            logger.error(f"Error fetching subscription: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to fetch subscription details'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'action': openapi.Schema(type=openapi.TYPE_STRING, enum=['upgrade', 'downgrade', 'cancel']),
                'new_plan_id': openapi.Schema(type=openapi.TYPE_STRING),
            },
            required=['action']
        ),
        responses={200: "Subscription updated successfully"},
        tags=['Billing']
    )
    def post(self, request):
        try:
            action = request.data.get('action')
            new_plan_id = request.data.get('new_plan_id')
            
            subscription = Subscription.objects.filter(
                user=request.user,
                status__in=['active', 'trialing', 'past_due']
            ).first()
            
            if not subscription:
                return Response({
                    'success': False,
                    'error': 'No active subscription found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            stripe_service = StripeService()
            
            if action == 'cancel':
                result = stripe_service.cancel_subscription(subscription)
            elif action in ['upgrade', 'downgrade']:
                if not new_plan_id:
                    return Response({
                        'success': False,
                        'error': 'New plan ID is required for upgrade/downgrade'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                try:
                    new_plan = SubscriptionPlan.objects.get(id=new_plan_id, is_active=True)
                except SubscriptionPlan.DoesNotExist:
                    return Response({
                        'success': False,
                        'error': 'Invalid new plan'
                    }, status=status.HTTP_404_NOT_FOUND)
                
                result = stripe_service.update_subscription(subscription, new_plan)
            else:
                return Response({
                    'success': False,
                    'error': 'Invalid action'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if result['success']:
                return Response({
                    'success': True,
                    'message': f'Subscription {action} successful',
                    'subscription': {
                        'status': result.get('status'),
                        'cancel_at_period_end': result.get('cancel_at_period_end', False)
                    }
                })
            else:
                return Response({
                    'success': False,
                    'error': result['error']
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error managing subscription: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to manage subscription'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_usage_data(self, subscription):
        """Get current usage data for the subscription"""
        try:
            current_period_start = subscription.current_period_start
            current_period_end = subscription.current_period_end
            
            # Get usage records for current billing period
            usage_records = UsageRecord.objects.filter(
                subscription=subscription,
                timestamp__gte=current_period_start,
                timestamp__lte=current_period_end
            )
            
            total_minutes = sum(record.minutes_used for record in usage_records if record.minutes_used)
            total_agents = subscription.plan.agents_allowed  # Current allowed agents
            
            return {
                'minutes_used': total_minutes,
                'minutes_limit': subscription.plan.call_minutes_limit,
                'minutes_remaining': max(0, subscription.plan.call_minutes_limit - total_minutes),
                'agents_used': total_agents,
                'agents_limit': subscription.plan.agents_allowed,
                'usage_percentage': min(100, (total_minutes / subscription.plan.call_minutes_limit) * 100) if subscription.plan.call_minutes_limit > 0 else 0
            }
        except Exception as e:
            logger.error(f"Error calculating usage data: {str(e)}")
            return {
                'minutes_used': 0,
                'minutes_limit': subscription.plan.call_minutes_limit,
                'minutes_remaining': subscription.plan.call_minutes_limit,
                'agents_used': 0,
                'agents_limit': subscription.plan.agents_allowed,
                'usage_percentage': 0
            }


class BillingHistoryAPIView(APIView):
    """Get user's billing history and invoices"""
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        responses={200: "Billing history"},
        operation_description="Get user's billing history and invoices",
        tags=['Billing']
    )
    def get(self, request):
        try:
            # Get billing history from database
            billing_history = BillingHistory.objects.filter(
                user=request.user
            ).order_by('-created_at')[:50]  # Last 50 records
            
            history_data = []
            for record in billing_history:
                history_data.append({
                    'id': str(record.id),
                    'amount': float(record.amount),
                    'description': record.description,
                    'status': record.status,
                    'invoice_url': record.invoice_url,
                    'stripe_invoice_id': record.stripe_invoice_id,
                    'created_at': record.created_at.isoformat(),
                })
            
            # Also get recent Stripe invoices
            stripe_service = StripeService()
            stripe_invoices = stripe_service.get_customer_invoices(request.user)
            
            return Response({
                'success': True,
                'billing_history': history_data,
                'stripe_invoices': stripe_invoices
            })
            
        except Exception as e:
            logger.error(f"Error fetching billing history: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to fetch billing history'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PaymentMethodsAPIView(APIView):
    """Manage payment methods"""
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        responses={200: "Payment methods"},
        operation_description="Get user's payment methods",
        tags=['Billing']
    )
    def get(self, request):
        try:
            stripe_service = StripeService()
            payment_methods = stripe_service.get_customer_payment_methods(request.user)
            
            return Response({
                'success': True,
                'payment_methods': payment_methods
            })
            
        except Exception as e:
            logger.error(f"Error fetching payment methods: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to fetch payment methods'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'payment_method_id': openapi.Schema(type=openapi.TYPE_STRING),
            },
            required=['payment_method_id']
        ),
        responses={200: "Payment method added successfully"},
        tags=['Billing']
    )
    def post(self, request):
        try:
            payment_method_id = request.data.get('payment_method_id')
            
            if not payment_method_id:
                return Response({
                    'success': False,
                    'error': 'Payment method ID is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            stripe_service = StripeService()
            result = stripe_service.attach_payment_method(request.user, payment_method_id)
            
            if result['success']:
                return Response({
                    'success': True,
                    'message': 'Payment method added successfully'
                })
            else:
                return Response({
                    'success': False,
                    'error': result['error']
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error adding payment method: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to add payment method'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UsageTrackingAPIView(APIView):
    """Track and report usage"""
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'minutes_used': openapi.Schema(type=openapi.TYPE_NUMBER),
                'agents_used': openapi.Schema(type=openapi.TYPE_INTEGER),
                'call_id': openapi.Schema(type=openapi.TYPE_STRING),
            },
            required=['minutes_used']
        ),
        responses={200: "Usage recorded successfully"},
        tags=['Billing']
    )
    def post(self, request):
        try:
            minutes_used = request.data.get('minutes_used', 0)
            agents_used = request.data.get('agents_used', 0)
            call_id = request.data.get('call_id')
            
            subscription = Subscription.objects.filter(
                user=request.user,
                status__in=['active', 'trialing', 'past_due']
            ).first()
            
            if not subscription:
                return Response({
                    'success': False,
                    'error': 'No active subscription found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Record usage
            usage_record = UsageRecord.objects.create(
                subscription=subscription,
                minutes_used=minutes_used,
                agents_used=agents_used,
                call_id=call_id,
                timestamp=timezone.now()
            )
            
            # Check for overage and create alerts if needed
            self._check_usage_alerts(subscription)
            
            return Response({
                'success': True,
                'message': 'Usage recorded successfully',
                'usage_record_id': str(usage_record.id)
            })
            
        except Exception as e:
            logger.error(f"Error recording usage: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to record usage'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _check_usage_alerts(self, subscription):
        """Check if usage alerts should be created"""
        try:
            # Get current period usage
            current_period_start = subscription.current_period_start
            current_period_end = subscription.current_period_end
            
            usage_records = UsageRecord.objects.filter(
                subscription=subscription,
                timestamp__gte=current_period_start,
                timestamp__lte=current_period_end
            )
            
            total_minutes = sum(record.minutes_used for record in usage_records if record.minutes_used)
            usage_percentage = (total_minutes / subscription.plan.call_minutes_limit) * 100 if subscription.plan.call_minutes_limit > 0 else 0
            
            # Create alerts at 80% and 100% usage
            alert_thresholds = [80, 100]
            
            for threshold in alert_thresholds:
                if usage_percentage >= threshold:
                    # Check if alert already exists for this threshold
                    existing_alert = UsageAlert.objects.filter(
                        subscription=subscription,
                        alert_type='usage_limit',
                        threshold_percentage=threshold,
                        created_at__gte=current_period_start
                    ).first()
                    
                    if not existing_alert:
                        UsageAlert.objects.create(
                            subscription=subscription,
                            alert_type='usage_limit',
                            threshold_percentage=threshold,
                            current_usage=total_minutes,
                            message=f"You have reached {threshold}% of your monthly call minutes limit"
                        )
                        
        except Exception as e:
            logger.error(f"Error checking usage alerts: {str(e)}")


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookAPIView(APIView):
    """Handle Stripe webhooks"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            # Invalid payload
            logger.error("Invalid Stripe webhook payload")
            return HttpResponse(status=400)
        except stripe.error.SignatureVerificationError:
            # Invalid signature
            logger.error("Invalid Stripe webhook signature")
            return HttpResponse(status=400)
        
        # Handle the event
        stripe_service = StripeService()
        result = stripe_service.handle_webhook_event(event)
        
        if result['success']:
            return HttpResponse(status=200)
        else:
            logger.error(f"Webhook handling failed: {result['error']}")
            return HttpResponse(status=400)
