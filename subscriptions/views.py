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

from .models import SubscriptionPlan, Subscription, BillingHistory, UsageMetrics

User = get_user_model()
logger = logging.getLogger(__name__)

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


class SubscriptionPlansAPIView(APIView):
    """Get all available subscription plans"""
    permission_classes = [permissions.AllowAny]
    
    @swagger_auto_schema(
        responses={200: "List of subscription plans"},
        operation_description="Get all available subscription plans",
        tags=['Subscriptions']
    )
    def get(self, request):
        plans = SubscriptionPlan.objects.filter(is_active=True).order_by('price')
        data = []
        
        for plan in plans:
            data.append({
                'id': str(plan.id),
                'name': plan.name,
                'plan_type': plan.plan_type,
                'price': float(plan.price),
                'billing_cycle': plan.billing_cycle,
                'max_agents': plan.max_agents,
                'max_minutes': plan.max_minutes,
                'inbound_calls': plan.inbound_calls,
                'outbound_calls': plan.outbound_calls,
                'ai_assistance': plan.ai_assistance,
                'analytics': plan.analytics,
                'stripe_price_id': plan.stripe_price_id
            })
        
        return Response(data, status=status.HTTP_200_OK)


class CreateSubscriptionAPIView(APIView):
    """Create new subscription"""
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'plan_id': openapi.Schema(type=openapi.TYPE_STRING, description='Subscription plan ID'),
                'payment_method_id': openapi.Schema(type=openapi.TYPE_STRING, description='Stripe payment method ID')
            },
            required=['plan_id', 'payment_method_id']
        ),
        responses={
            201: "Subscription created successfully",
            400: "Bad request"
        },
        operation_description="Create new subscription with Stripe",
        tags=['Subscriptions'],
        security=[{'Bearer': []}]
    )
    def post(self, request):
        try:
            user = request.user
            plan_id = request.data.get('plan_id')
            payment_method_id = request.data.get('payment_method_id')
            
            if not plan_id or not payment_method_id:
                return Response({
                    'error': 'Plan ID and payment method ID are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get subscription plan
            try:
                plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
            except SubscriptionPlan.DoesNotExist:
                return Response({
                    'error': 'Invalid subscription plan'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if user already has active subscription
            try:
                existing_subscription = user.subscription
                if existing_subscription.is_active:
                    return Response({
                        'error': 'User already has an active subscription'
                    }, status=status.HTTP_400_BAD_REQUEST)
            except Subscription.DoesNotExist:
                pass
            
            # Create Stripe customer
            customer = stripe.Customer.create(
                email=user.email,
                name=f"{user.first_name} {user.last_name}".strip(),
                payment_method=payment_method_id,
                invoice_settings={
                    'default_payment_method': payment_method_id,
                },
                metadata={
                    'user_id': str(user.id),
                    'user_email': user.email
                }
            )
            
            # Create Stripe subscription
            stripe_subscription = stripe.Subscription.create(
                customer=customer.id,
                items=[{
                    'price': plan.stripe_price_id,
                }],
                payment_behavior='default_incomplete',
                payment_settings={'save_default_payment_method': 'on_subscription'},
                expand=['latest_invoice.payment_intent'],
                metadata={
                    'user_id': str(user.id),
                    'plan_id': str(plan.id)
                }
            )
            
            # Calculate subscription dates
            start_date = timezone.now()
            if plan.billing_cycle == 'monthly':
                end_date = start_date + timedelta(days=30)
            else:  # yearly
                end_date = start_date + timedelta(days=365)
            
            # Create local subscription
            subscription, created = Subscription.objects.update_or_create(
                user=user,
                defaults={
                    'plan': plan,
                    'status': 'inactive',
                    'stripe_subscription_id': stripe_subscription.id,
                    'stripe_customer_id': customer.id,
                    'start_date': start_date,
                    'end_date': end_date,
                    'next_billing_date': end_date,
                    'minutes_used': 0,
                    'agents_used': 0,
                }
            )
            
            response_data = {
                'subscription_id': str(subscription.id),
                'client_secret': stripe_subscription.latest_invoice.payment_intent.client_secret,
                'stripe_subscription_id': stripe_subscription.id,
                'status': subscription.status,
                'plan': plan.name
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating subscription: {str(e)}")
            return Response({
                'error': f'Stripe error: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error creating subscription: {str(e)}")
            return Response({
                'error': 'Internal server error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserSubscriptionAPIView(APIView):
    """Get user's current subscription"""
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        responses={
            200: "User subscription details",
            404: "No subscription found"
        },
        operation_description="Get user's current subscription details",
        tags=['Subscriptions'],
        security=[{'Bearer': []}]
    )
    def get(self, request):
        try:
            subscription = request.user.subscription
            
            data = {
                'id': str(subscription.id),
                'plan': {
                    'name': subscription.plan.name,
                    'price': float(subscription.plan.price),
                    'billing_cycle': subscription.plan.billing_cycle,
                    'max_agents': subscription.plan.max_agents,
                    'max_minutes': subscription.plan.max_minutes,
                },
                'status': subscription.status,
                'start_date': subscription.start_date.isoformat(),
                'end_date': subscription.end_date.isoformat(),
                'next_billing_date': subscription.next_billing_date.isoformat(),
                'minutes_used': subscription.minutes_used,
                'agents_used': subscription.agents_used,
                'days_remaining': subscription.days_remaining,
                'usage_percentage': (subscription.minutes_used / subscription.plan.max_minutes * 100) if subscription.plan.max_minutes > 0 else 0
            }
            
            return Response(data, status=status.HTTP_200_OK)
        except Subscription.DoesNotExist:
            return Response({
                'error': 'No subscription found'
            }, status=status.HTTP_404_NOT_FOUND)


class BillingHistoryAPIView(APIView):
    """Get user's billing history"""
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        responses={200: "Billing history"},
        operation_description="Get user's billing history",
        tags=['Subscriptions'],
        security=[{'Bearer': []}]
    )
    def get(self, request):
        try:
            subscription = request.user.subscription
            billing_history = BillingHistory.objects.filter(
                subscription=subscription
            ).order_by('-created_at')
            
            data = []
            for bill in billing_history:
                data.append({
                    'id': str(bill.id),
                    'amount': float(bill.amount),
                    'currency': bill.currency,
                    'status': bill.status,
                    'billing_period_start': bill.billing_period_start.isoformat(),
                    'billing_period_end': bill.billing_period_end.isoformat(),
                    'created_at': bill.created_at.isoformat(),
                    'paid_at': bill.paid_at.isoformat() if bill.paid_at else None
                })
            
            return Response(data, status=status.HTTP_200_OK)
            
        except Subscription.DoesNotExist:
            return Response([], status=status.HTTP_200_OK)


class CancelSubscriptionAPIView(APIView):
    """Cancel user's subscription"""
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'cancel_at_period_end': openapi.Schema(
                    type=openapi.TYPE_BOOLEAN, 
                    description='Cancel at end of current period',
                    default=True
                )
            }
        ),
        responses={
            200: "Subscription cancelled successfully",
            404: "No subscription found",
            400: "Bad request"
        },
        operation_description="Cancel user's subscription",
        operation_summary="Cancel Subscription",
        tags=['Subscriptions'],
        security=[{'Bearer': []}]
    )
    def post(self, request):
        try:
            subscription = request.user.subscription
            cancel_at_period_end = request.data.get('cancel_at_period_end', True)
            
            if not subscription.stripe_subscription_id:
                return Response({
                    'error': 'No Stripe subscription found'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # For testing purposes, just update local subscription
            # In production, you would call Stripe API here
            if cancel_at_period_end:
                subscription.status = 'cancelled'
            else:
                subscription.status = 'cancelled'
                subscription.end_date = timezone.now()
            
            subscription.save()
            
            return Response({
                'message': 'Subscription cancelled successfully',
                'cancel_at_period_end': cancel_at_period_end,
                'status': subscription.status
            }, status=status.HTTP_200_OK)
            
        except Subscription.DoesNotExist:
            return Response({
                'error': 'No subscription found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error cancelling subscription: {str(e)}")
            return Response({
                'error': 'Internal server error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UpdateSubscriptionAPIView(APIView):
    """Update subscription plan"""
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'plan_id': openapi.Schema(type=openapi.TYPE_STRING, description='New subscription plan ID')
            },
            required=['plan_id']
        ),
        responses={
            200: "Subscription updated successfully",
            400: "Bad request",
            404: "Subscription not found"
        },
        operation_description="Update subscription to different plan",
        operation_summary="Update Subscription Plan",
        tags=['Subscriptions'],
        security=[{'Bearer': []}]
    )
    def put(self, request):
        try:
            subscription = request.user.subscription
            new_plan_id = request.data.get('plan_id')
            
            if not new_plan_id:
                return Response({
                    'error': 'Plan ID is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get new plan
            try:
                new_plan = SubscriptionPlan.objects.get(id=new_plan_id, is_active=True)
            except SubscriptionPlan.DoesNotExist:
                return Response({
                    'error': 'Invalid subscription plan'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update local subscription (in production, update Stripe subscription too)
            old_plan = subscription.plan.name
            subscription.plan = new_plan
            subscription.save()
            
            return Response({
                'message': f'Subscription updated from {old_plan} to {new_plan.name}',
                'plan': {
                    'name': new_plan.name,
                    'price': float(new_plan.price),
                    'billing_cycle': new_plan.billing_cycle,
                    'max_agents': new_plan.max_agents,
                    'max_minutes': new_plan.max_minutes,
                }
            }, status=status.HTTP_200_OK)
            
        except Subscription.DoesNotExist:
            return Response({
                'error': 'No subscription found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error updating subscription: {str(e)}")
            return Response({
                'error': 'Internal server error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='post',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        description='Stripe webhook payload'
    ),
    responses={
        200: "Webhook processed successfully",
        400: "Invalid payload or signature"
    },
    operation_description="Handle Stripe webhook events for subscription updates",
    operation_summary="Stripe Webhook Handler",
    tags=['Subscriptions']
)
@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def stripe_webhook(request):
    """Handle Stripe webhooks"""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        logger.error("Invalid payload in Stripe webhook")
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        logger.error("Invalid signature in Stripe webhook")
        return HttpResponse(status=400)
    
    # Handle the event
    if event['type'] == 'invoice.payment_succeeded':
        handle_payment_succeeded(event['data']['object'])
    elif event['type'] == 'invoice.payment_failed':
        handle_payment_failed(event['data']['object'])
    elif event['type'] == 'customer.subscription.updated':
        handle_subscription_updated(event['data']['object'])
    elif event['type'] == 'customer.subscription.deleted':
        handle_subscription_deleted(event['data']['object'])
    
    return HttpResponse(status=200)


def handle_payment_succeeded(invoice):
    """Handle successful payment"""
    try:
        subscription_id = invoice['subscription']
        amount = invoice['amount_paid'] / 100  # Convert from cents
        
        subscription = Subscription.objects.get(stripe_subscription_id=subscription_id)
        
        # Create billing history
        BillingHistory.objects.create(
            subscription=subscription,
            amount=amount,
            currency=invoice['currency'].upper(),
            status='paid',
            stripe_invoice_id=invoice['id'],
            billing_period_start=datetime.fromtimestamp(invoice['period_start'], tz=timezone.utc),
            billing_period_end=datetime.fromtimestamp(invoice['period_end'], tz=timezone.utc),
            paid_at=timezone.now()
        )
        
        subscription.status = 'active'
        subscription.save()
        
    except Subscription.DoesNotExist:
        logger.error(f"Subscription not found for invoice {invoice['id']}")
    except Exception as e:
        logger.error(f"Error handling payment: {str(e)}")


def handle_payment_failed(invoice):
    """Handle failed payment"""
    try:
        subscription_id = invoice['subscription']
        subscription = Subscription.objects.get(stripe_subscription_id=subscription_id)
        subscription.status = 'suspended'
        subscription.save()
        
    except Subscription.DoesNotExist:
        logger.error(f"Subscription not found for failed payment")


def handle_subscription_updated(stripe_subscription):
    """Handle subscription updates"""
    try:
        subscription = Subscription.objects.get(
            stripe_subscription_id=stripe_subscription['id']
        )
        
        subscription.end_date = datetime.fromtimestamp(
            stripe_subscription['current_period_end'], tz=timezone.utc
        )
        subscription.next_billing_date = datetime.fromtimestamp(
            stripe_subscription['current_period_end'], tz=timezone.utc
        )
        
        if stripe_subscription['status'] == 'active':
            subscription.status = 'active'
        elif stripe_subscription['status'] == 'canceled':
            subscription.status = 'cancelled'
        
        subscription.save()
        
    except Subscription.DoesNotExist:
        logger.error(f"Subscription not found: {stripe_subscription['id']}")


def handle_subscription_deleted(stripe_subscription):
    """Handle subscription deletion"""
    try:
        subscription = Subscription.objects.get(
            stripe_subscription_id=stripe_subscription['id']
        )
        subscription.status = 'cancelled'
        subscription.end_date = timezone.now()
        subscription.save()
        
    except Subscription.DoesNotExist:
        logger.error(f"Subscription not found for deletion")
