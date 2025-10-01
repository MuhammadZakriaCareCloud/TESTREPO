from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import models
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from datetime import datetime, timedelta

from subscriptions.models import Subscription, BillingHistory, UsageMetrics
from calls.models import CallSession
from agents.models import Agent

User = get_user_model()


class UserDashboardAPIView(APIView):
    """User personal dashboard with configuration options"""
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        responses={
            200: "User dashboard data",
            401: "Unauthorized"
        },
        operation_description="Get user dashboard with personal stats and settings",
        tags=['User Dashboard'],
        security=[{'Bearer': []}]
    )
    def get(self, request):
        user = request.user
        today = timezone.now().date()
        this_month = timezone.now().replace(day=1)
        
        # User's subscription info
        subscription_info = None
        try:
            subscription = user.subscription
            subscription_info = {
                'id': str(subscription.id),
                'plan': {
                    'name': subscription.plan.name,
                    'price': float(subscription.plan.price),
                    'features': subscription.plan.features,
                    'call_limit': subscription.plan.call_limit,
                    'agent_limit': subscription.plan.agent_limit
                },
                'status': subscription.status,
                'current_period_start': subscription.current_period_start.isoformat(),
                'current_period_end': subscription.current_period_end.isoformat(),
                'days_remaining': subscription.days_remaining,
                'cancel_at_period_end': subscription.cancel_at_period_end
            }
        except Subscription.DoesNotExist:
            pass
        
        # Usage statistics
        usage_stats = {}
        if subscription_info:
            # Get current period usage
            usage = UsageMetrics.objects.filter(
                subscription=user.subscription,
                period_start__gte=this_month
            ).first()
            
            if usage:
                usage_stats = {
                    'calls_made': usage.calls_made,
                    'call_minutes': usage.call_minutes,
                    'api_requests': usage.api_requests,
                    'storage_used': usage.storage_used,
                    'agents_used': usage.agents_used
                }
        
        # Recent calls
        recent_calls = CallSession.objects.filter(
            user=user
        ).order_by('-started_at')[:5]
        
        call_data = []
        for call in recent_calls:
            call_data.append({
                'id': str(call.id),
                'phone_number': call.phone_number,
                'call_type': call.call_type,
                'status': call.status,
                'duration': call.call_duration_formatted,
                'started_at': call.started_at.isoformat(),
                'customer_satisfaction': call.customer_satisfaction,
                'agent': {
                    'name': call.agent.user.get_full_name(),
                    'employee_id': call.agent.employee_id
                } if call.agent else None
            })
        
        # Call statistics
        total_calls = CallSession.objects.filter(user=user).count()
        this_month_calls = CallSession.objects.filter(
            user=user,
            started_at__gte=this_month
        ).count()
        
        successful_calls = CallSession.objects.filter(
            user=user,
            status='completed'
        ).count()
        
        avg_call_duration = CallSession.objects.filter(
            user=user,
            status='completed'
        ).aggregate(
            avg_duration=models.Avg('call_duration')
        )['avg_duration'] or 0
        
        # Billing summary
        billing_summary = None
        if subscription_info:
            recent_billing = BillingHistory.objects.filter(
                subscription=user.subscription
            ).order_by('-created_at')[:3]
            
            billing_summary = {
                'next_billing_date': subscription_info['current_period_end'],
                'amount': subscription_info['plan']['price'],
                'recent_payments': [
                    {
                        'id': str(bill.id),
                        'amount': float(bill.amount),
                        'status': bill.status,
                        'created_at': bill.created_at.isoformat(),
                        'description': bill.description
                    } for bill in recent_billing
                ]
            }
        
        # User profile data
        profile_data = {
            'id': str(user.id),
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'full_name': user.get_full_name(),
            'phone': user.phone,
            'avatar': user.avatar.url if user.avatar else None,
            'is_verified': user.is_verified,
            'date_joined': user.date_joined.isoformat(),
            'last_login': user.last_login.isoformat() if user.last_login else None
        }
        
        dashboard_data = {
            'user': profile_data,
            'subscription': subscription_info,
            'usage_stats': usage_stats,
            'call_statistics': {
                'total_calls': total_calls,
                'this_month_calls': this_month_calls,
                'successful_calls': successful_calls,
                'success_rate': (successful_calls / total_calls * 100) if total_calls > 0 else 0,
                'avg_call_duration': float(avg_call_duration) if avg_call_duration else 0
            },
            'recent_calls': call_data,
            'billing_summary': billing_summary,
            'quick_stats': {
                'days_remaining': subscription_info['days_remaining'] if subscription_info else 0,
                'calls_this_month': this_month_calls,
                'plan_status': subscription_info['status'] if subscription_info else 'inactive'
            }
        }
        
        return Response(dashboard_data, status=status.HTTP_200_OK)


class UserProfileConfigAPIView(APIView):
    """User profile configuration and settings"""
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        responses={
            200: "User profile configuration",
            401: "Unauthorized"
        },
        operation_description="Get user profile configuration",
        tags=['User Dashboard'],
        security=[{'Bearer': []}]
    )
    def get(self, request):
        user = request.user
        
        # Get user profile data
        profile_data = {
            'personal_info': {
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'phone': user.phone,
                'avatar': user.avatar.url if user.avatar else None
            },
            'account_settings': {
                'is_verified': user.is_verified,
                'email_notifications': True,  # You can add this field to User model
                'sms_notifications': False,   # You can add this field to User model
                'marketing_emails': True     # You can add this field to User model
            },
            'security_settings': {
                'two_factor_enabled': False,  # You can implement 2FA later
                'last_password_change': user.date_joined.isoformat(),  # Track this separately
                'active_sessions': 1  # Track active JWT tokens
            }
        }
        
        return Response(profile_data, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'first_name': openapi.Schema(type=openapi.TYPE_STRING),
                'last_name': openapi.Schema(type=openapi.TYPE_STRING),
                'phone': openapi.Schema(type=openapi.TYPE_STRING),
                'email_notifications': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                'sms_notifications': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                'marketing_emails': openapi.Schema(type=openapi.TYPE_BOOLEAN)
            }
        ),
        responses={
            200: "Profile updated successfully",
            400: "Bad request",
            401: "Unauthorized"
        },
        operation_description="Update user profile configuration",
        tags=['User Dashboard'],
        security=[{'Bearer': []}]
    )
    def patch(self, request):
        user = request.user
        
        # Update personal info
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        if 'phone' in request.data:
            user.phone = request.data['phone']
        
        # Note: Add these fields to User model if you want to store them
        # For now, we'll just acknowledge the settings
        notification_settings = {}
        if 'email_notifications' in request.data:
            notification_settings['email_notifications'] = request.data['email_notifications']
        if 'sms_notifications' in request.data:
            notification_settings['sms_notifications'] = request.data['sms_notifications']  
        if 'marketing_emails' in request.data:
            notification_settings['marketing_emails'] = request.data['marketing_emails']
        
        user.save()
        
        return Response({
            'message': 'Profile updated successfully',
            'updated_fields': list(request.data.keys())
        }, status=status.HTTP_200_OK)


class UserCallHistoryAPIView(APIView):
    """User's call history with filtering"""
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        parameters=[
            openapi.Parameter('page', openapi.IN_QUERY, description="Page number", type=openapi.TYPE_INTEGER),
            openapi.Parameter('status', openapi.IN_QUERY, description="Filter by call status", type=openapi.TYPE_STRING),
            openapi.Parameter('date_from', openapi.IN_QUERY, description="Filter from date (YYYY-MM-DD)", type=openapi.TYPE_STRING),
            openapi.Parameter('date_to', openapi.IN_QUERY, description="Filter to date (YYYY-MM-DD)", type=openapi.TYPE_STRING),
        ],
        responses={
            200: "User call history",
            401: "Unauthorized"
        },
        operation_description="Get user's call history with filtering options",
        tags=['User Dashboard'],
        security=[{'Bearer': []}]
    )
    def get(self, request):
        user = request.user
        
        # Filter parameters
        page = int(request.query_params.get('page', 1))
        status_filter = request.query_params.get('status')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        # Base queryset
        calls = CallSession.objects.filter(user=user).order_by('-started_at')
        
        # Apply filters
        if status_filter:
            calls = calls.filter(status=status_filter)
        if date_from:
            calls = calls.filter(started_at__date__gte=date_from)
        if date_to:
            calls = calls.filter(started_at__date__lte=date_to)
        
        # Pagination
        limit = 20
        offset = (page - 1) * limit
        total_count = calls.count()
        calls = calls[offset:offset + limit]
        
        call_data = []
        for call in calls:
            call_data.append({
                'id': str(call.id),
                'phone_number': call.phone_number,
                'call_type': call.call_type,
                'status': call.status,
                'started_at': call.started_at.isoformat(),
                'ended_at': call.ended_at.isoformat() if call.ended_at else None,
                'duration': call.call_duration_formatted,
                'customer_satisfaction': call.customer_satisfaction,
                'recording_url': call.recording_url,
                'agent': {
                    'name': call.agent.user.get_full_name(),
                    'employee_id': call.agent.employee_id
                } if call.agent else None,
                'ai_transcript': call.ai_transcript[:200] + '...' if call.ai_transcript and len(call.ai_transcript) > 200 else call.ai_transcript
            })
        
        return Response({
            'calls': call_data,
            'pagination': {
                'current_page': page,
                'total_count': total_count,
                'total_pages': (total_count + limit - 1) // limit,
                'per_page': limit
            },
            'filters': {
                'status': status_filter,
                'date_from': date_from,
                'date_to': date_to
            }
        }, status=status.HTTP_200_OK)


class UserSubscriptionManagementAPIView(APIView):
    """User subscription management dashboard"""
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        responses={
            200: "Subscription management data",
            401: "Unauthorized"
        },
        operation_description="Get subscription management dashboard for user",
        tags=['User Dashboard'],
        security=[{'Bearer': []}]
    )
    def get(self, request):
        user = request.user
        
        # Current subscription
        current_subscription = None
        try:
            subscription = user.subscription
            current_subscription = {
                'id': str(subscription.id),
                'plan': {
                    'name': subscription.plan.name,
                    'price': float(subscription.plan.price),
                    'interval': subscription.plan.interval,
                    'features': subscription.plan.features,
                    'call_limit': subscription.plan.call_limit,
                    'agent_limit': subscription.plan.agent_limit
                },
                'status': subscription.status,
                'current_period_start': subscription.current_period_start.isoformat(),
                'current_period_end': subscription.current_period_end.isoformat(),
                'days_remaining': subscription.days_remaining,
                'cancel_at_period_end': subscription.cancel_at_period_end,
                'created_at': subscription.created_at.isoformat()
            }
        except Subscription.DoesNotExist:
            pass
        
        # Available plans for upgrade/downgrade
        from subscriptions.models import SubscriptionPlan
        available_plans = SubscriptionPlan.objects.filter(is_active=True)
        plans_data = []
        
        for plan in available_plans:
            is_current = current_subscription and current_subscription['plan']['name'] == plan.name
            plans_data.append({
                'id': str(plan.id),
                'name': plan.name,
                'price': float(plan.price),
                'interval': plan.interval,
                'features': plan.features,
                'call_limit': plan.call_limit,
                'agent_limit': plan.agent_limit,
                'is_current': is_current,
                'is_popular': plan.name.lower() == 'professional',  # Mark professional as popular
                'stripe_price_id': plan.stripe_price_id
            })
        
        # Billing history
        billing_history = []
        if current_subscription:
            bills = BillingHistory.objects.filter(
                subscription=user.subscription
            ).order_by('-created_at')[:10]
            
            for bill in bills:
                billing_history.append({
                    'id': str(bill.id),
                    'amount': float(bill.amount),
                    'status': bill.status,
                    'description': bill.description,
                    'invoice_url': bill.invoice_url,
                    'created_at': bill.created_at.isoformat()
                })
        
        # Usage for current period
        usage_data = None
        if current_subscription:
            usage = UsageMetrics.objects.filter(
                subscription=user.subscription
            ).order_by('-period_start').first()
            
            if usage:
                usage_data = {
                    'calls_made': usage.calls_made,
                    'call_minutes': usage.call_minutes,
                    'api_requests': usage.api_requests,
                    'storage_used': usage.storage_used,
                    'agents_used': usage.agents_used,
                    'period_start': usage.period_start.isoformat(),
                    'period_end': usage.period_end.isoformat()
                }
        
        return Response({
            'current_subscription': current_subscription,
            'available_plans': plans_data,
            'billing_history': billing_history,
            'current_usage': usage_data,
            'can_upgrade': current_subscription is not None,
            'can_cancel': current_subscription and current_subscription['status'] == 'active'
        }, status=status.HTTP_200_OK)
