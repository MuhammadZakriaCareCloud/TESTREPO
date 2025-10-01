from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import models
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from datetime import datetime, timedelta
import stripe
from django.conf import settings

from subscriptions.models import Subscription, BillingHistory, UsageMetrics, SubscriptionPlan
from calls.models import CallSession
from agents.models import Agent

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

User = get_user_model()


class UserCompleteDashboardAPIView(APIView):
    """Complete user dashboard - subscription, agent, billing, calls - sab kuch ek jagah"""
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        responses={
            200: "Complete user dashboard with all management options",
            401: "Unauthorized"
        },
        operation_description="User ka complete dashboard - subscription, agent, billing, calls management",
        tags=['User Complete Dashboard'],
        security=[{'Bearer': []}]
    )
    def get(self, request):
        user = request.user
        today = timezone.now().date()
        this_month = timezone.now().replace(day=1)
        
        # 1. USER PROFILE INFO
        user_profile = {
            'id': str(user.id),
            'email': user.email,
            'full_name': user.get_full_name(),
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone': user.phone,
            'avatar': user.avatar.url if user.avatar else None,
            'role': user.role,
            'is_verified': user.is_verified,
            'date_joined': user.date_joined.isoformat(),
            'last_login': user.last_login.isoformat() if user.last_login else None
        }
        
        # 2. SUBSCRIPTION MANAGEMENT
        subscription_management = {
            'current_subscription': None,
            'available_plans': [],
            'can_upgrade': False,
            'can_downgrade': False,
            'subscription_status': 'inactive'
        }
        
        try:
            subscription = user.subscription
            subscription_management['current_subscription'] = {
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
                'stripe_subscription_id': subscription.stripe_subscription_id
            }
            subscription_management['subscription_status'] = subscription.status
            subscription_management['can_upgrade'] = True
            subscription_management['can_downgrade'] = True
        except Subscription.DoesNotExist:
            pass
        
        # Available plans for subscription
        all_plans = SubscriptionPlan.objects.filter(is_active=True)
        for plan in all_plans:
            is_current = (subscription_management['current_subscription'] and 
                         subscription_management['current_subscription']['plan']['name'] == plan.name)
            
            subscription_management['available_plans'].append({
                'id': str(plan.id),
                'name': plan.name,
                'price': float(plan.price),
                'interval': plan.interval,
                'features': plan.features,
                'call_limit': plan.call_limit,
                'agent_limit': plan.agent_limit,
                'is_current': is_current,
                'is_popular': plan.name.lower() == 'professional',
                'stripe_price_id': plan.stripe_price_id,
                'can_select': not is_current
            })
        
        # 3. AGENT MANAGEMENT
        agent_management = {
            'assigned_agents': [],
            'available_agents': [],
            'can_assign_agents': False,
            'agent_limit_reached': False,
            'current_agent_count': 0
        }
        
        # Get user's assigned agents
        user_agents = Agent.objects.filter(user=user, is_active=True)
        for agent in user_agents:
            agent_management['assigned_agents'].append({
                'id': str(agent.id),
                'name': agent.user.get_full_name(),
                'employee_id': agent.employee_id,
                'department': agent.department,
                'status': agent.status,
                'skill_level': agent.skill_level,
                'languages': agent.languages,
                'specializations': agent.specializations,
                'performance': {
                    'total_calls': agent.total_calls,
                    'success_rate': agent.success_rate,
                    'customer_satisfaction': agent.customer_satisfaction
                },
                'last_activity': agent.last_activity.isoformat(),
                'is_online': agent.status in ['available', 'busy', 'on_call']
            })
        
        agent_management['current_agent_count'] = len(agent_management['assigned_agents'])
        
        # Check if user can assign more agents
        if subscription_management['current_subscription']:
            agent_limit = subscription_management['current_subscription']['plan']['agent_limit']
            agent_management['can_assign_agents'] = agent_management['current_agent_count'] < agent_limit
            agent_management['agent_limit_reached'] = agent_management['current_agent_count'] >= agent_limit
            
            # Get available agents to assign
            if agent_management['can_assign_agents']:
                available_agents = Agent.objects.filter(
                    user__isnull=True,  # Unassigned agents
                    is_active=True
                )[:10]  # Limit to 10 for performance
                
                for agent in available_agents:
                    agent_management['available_agents'].append({
                        'id': str(agent.id),
                        'name': f"Agent {agent.employee_id}",
                        'employee_id': agent.employee_id,
                        'skill_level': agent.skill_level,
                        'languages': agent.languages,
                        'specializations': agent.specializations,
                        'can_assign': True
                    })
        
        # 4. BILLING MANAGEMENT
        billing_management = {
            'current_balance': 0.0,
            'next_billing_date': None,
            'next_billing_amount': 0.0,
            'billing_history': [],
            'payment_methods': [],
            'auto_pay_enabled': False
        }
        
        if subscription_management['current_subscription']:
            billing_management['next_billing_date'] = subscription_management['current_subscription']['current_period_end']
            billing_management['next_billing_amount'] = subscription_management['current_subscription']['plan']['price']
            
            # Get billing history
            billing_history = BillingHistory.objects.filter(
                subscription=user.subscription
            ).order_by('-created_at')[:10]
            
            for bill in billing_history:
                billing_management['billing_history'].append({
                    'id': str(bill.id),
                    'amount': float(bill.amount),
                    'status': bill.status,
                    'description': bill.description,
                    'invoice_url': bill.invoice_url,
                    'created_at': bill.created_at.isoformat(),
                    'stripe_invoice_id': bill.stripe_invoice_id
                })
        
        # 5. CALL STATISTICS & MANAGEMENT
        call_management = {
            'total_calls': 0,
            'this_month_calls': 0,
            'successful_calls': 0,
            'success_rate': 0.0,
            'average_call_duration': 0.0,
            'recent_calls': [],
            'call_limit_reached': False,
            'calls_remaining': 0
        }
        
        # Call statistics
        user_calls = CallSession.objects.filter(user=user)
        call_management['total_calls'] = user_calls.count()
        
        this_month_calls = user_calls.filter(started_at__gte=this_month)
        call_management['this_month_calls'] = this_month_calls.count()
        
        successful_calls = user_calls.filter(status='completed')
        call_management['successful_calls'] = successful_calls.count()
        
        if call_management['total_calls'] > 0:
            call_management['success_rate'] = (call_management['successful_calls'] / call_management['total_calls']) * 100
        
        # Average call duration
        avg_duration = successful_calls.aggregate(
            avg=models.Avg('call_duration')
        )['avg']
        call_management['average_call_duration'] = float(avg_duration) if avg_duration else 0.0
        
        # Check call limits
        if subscription_management['current_subscription']:
            call_limit = subscription_management['current_subscription']['plan']['call_limit']
            if call_limit > 0:  # -1 means unlimited
                call_management['calls_remaining'] = max(0, call_limit - call_management['this_month_calls'])
                call_management['call_limit_reached'] = call_management['this_month_calls'] >= call_limit
        
        # Recent calls
        recent_calls = user_calls.order_by('-started_at')[:5]
        for call in recent_calls:
            call_management['recent_calls'].append({
                'id': str(call.id),
                'phone_number': call.phone_number,
                'call_type': call.call_type,
                'status': call.status,
                'duration': call.call_duration_formatted,
                'started_at': call.started_at.isoformat(),
                'agent': {
                    'name': call.agent.user.get_full_name(),
                    'employee_id': call.agent.employee_id
                } if call.agent else None,
                'customer_satisfaction': call.customer_satisfaction
            })
        
        # 6. USAGE METRICS
        usage_metrics = {
            'current_period': {
                'calls_made': 0,
                'call_minutes': 0,
                'api_requests': 0,
                'storage_used': 0,
                'agents_used': 0
            },
            'limits': {
                'call_limit': -1,  # -1 means unlimited
                'agent_limit': 1,
                'storage_limit': 1000  # MB
            },
            'usage_percentage': {
                'calls': 0,
                'agents': 0,
                'storage': 0
            }
        }
        
        if subscription_management['current_subscription']:
            # Get current usage
            current_usage = UsageMetrics.objects.filter(
                subscription=user.subscription,
                period_start__gte=this_month
            ).first()
            
            if current_usage:
                usage_metrics['current_period'] = {
                    'calls_made': current_usage.calls_made,
                    'call_minutes': current_usage.call_minutes,
                    'api_requests': current_usage.api_requests,
                    'storage_used': current_usage.storage_used,
                    'agents_used': current_usage.agents_used
                }
            
            # Set limits from subscription plan
            plan = subscription_management['current_subscription']['plan']
            usage_metrics['limits']['call_limit'] = plan['call_limit']
            usage_metrics['limits']['agent_limit'] = plan['agent_limit']
            
            # Calculate usage percentages
            if plan['call_limit'] > 0:
                usage_metrics['usage_percentage']['calls'] = min(100, 
                    (usage_metrics['current_period']['calls_made'] / plan['call_limit']) * 100)
            
            if plan['agent_limit'] > 0:
                usage_metrics['usage_percentage']['agents'] = min(100,
                    (usage_metrics['current_period']['agents_used'] / plan['agent_limit']) * 100)
            
            usage_metrics['usage_percentage']['storage'] = min(100,
                (usage_metrics['current_period']['storage_used'] / usage_metrics['limits']['storage_limit']) * 100)
        
        # 7. QUICK ACTIONS
        quick_actions = [
            {
                'id': 'start_call',
                'title': 'Start New Call',
                'description': 'Initiate a new call session',
                'icon': 'phone',
                'enabled': not call_management['call_limit_reached'],
                'url': '/api/calls/start-call/'
            },
            {
                'id': 'upgrade_plan',
                'title': 'Upgrade Plan',
                'description': 'Upgrade your subscription plan',
                'icon': 'upgrade',
                'enabled': subscription_management['can_upgrade'],
                'url': '/api/subscriptions/update/'
            },
            {
                'id': 'assign_agent',
                'title': 'Assign Agent',
                'description': 'Assign a new agent to your account',
                'icon': 'user-plus',
                'enabled': agent_management['can_assign_agents'],
                'url': '/api/dashboard/user/assign-agent/'
            },
            {
                'id': 'view_billing',
                'title': 'View Billing',
                'description': 'Check billing history and invoices',
                'icon': 'receipt',
                'enabled': True,
                'url': '/api/subscriptions/billing-history/'
            }
        ]
        
        # 8. NOTIFICATIONS & ALERTS
        notifications = []
        
        # Check for important alerts
        if not subscription_management['current_subscription']:
            notifications.append({
                'type': 'warning',
                'title': 'No Active Subscription',
                'message': 'Please subscribe to a plan to access all features.',
                'action': 'Subscribe Now',
                'url': '/api/subscriptions/create/'
            })
        elif subscription_management['current_subscription']['days_remaining'] <= 3:
            notifications.append({
                'type': 'info',
                'title': 'Subscription Expiring Soon',
                'message': f'Your subscription expires in {subscription_management["current_subscription"]["days_remaining"]} days.',
                'action': 'Renew Now',
                'url': '/api/subscriptions/current/'
            })
        
        if call_management['call_limit_reached']:
            notifications.append({
                'type': 'warning',
                'title': 'Call Limit Reached',
                'message': 'You have reached your monthly call limit. Upgrade to make more calls.',
                'action': 'Upgrade Plan',
                'url': '/api/subscriptions/update/'
            })
        
        if agent_management['agent_limit_reached']:
            notifications.append({
                'type': 'info',
                'title': 'Agent Limit Reached',
                'message': 'You have reached your agent limit. Upgrade to assign more agents.',
                'action': 'Upgrade Plan',
                'url': '/api/subscriptions/update/'
            })
        
        # Final response
        complete_dashboard = {
            'user_profile': user_profile,
            'subscription_management': subscription_management,
            'agent_management': agent_management,
            'billing_management': billing_management,
            'call_management': call_management,
            'usage_metrics': usage_metrics,
            'quick_actions': quick_actions,
            'notifications': notifications,
            'dashboard_summary': {
                'subscription_active': subscription_management['subscription_status'] == 'active',
                'agents_assigned': agent_management['current_agent_count'],
                'calls_this_month': call_management['this_month_calls'],
                'next_billing': billing_management['next_billing_date'],
                'account_status': 'active' if subscription_management['subscription_status'] == 'active' else 'setup_required'
            }
        }
        
        return Response(complete_dashboard, status=status.HTTP_200_OK)


class UserSubscriptionActionAPIView(APIView):
    """User subscription actions - create, upgrade, cancel"""
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'action': openapi.Schema(
                    type=openapi.TYPE_STRING, 
                    enum=['create', 'upgrade', 'downgrade', 'cancel'],
                    description='Subscription action to perform'
                ),
                'plan_id': openapi.Schema(type=openapi.TYPE_STRING, description='Plan ID for create/upgrade'),
                'payment_method_id': openapi.Schema(type=openapi.TYPE_STRING, description='Stripe payment method ID')
            },
            required=['action']
        ),
        responses={
            200: "Subscription action completed",
            400: "Bad request",
            401: "Unauthorized"
        },
        operation_description="Perform subscription actions - create, upgrade, cancel",
        tags=['User Complete Dashboard'],
        security=[{'Bearer': []}]
    )
    def post(self, request):
        user = request.user
        action = request.data.get('action')
        plan_id = request.data.get('plan_id')
        
        if action == 'create':
            if not plan_id:
                return Response({'error': 'Plan ID required'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                plan = SubscriptionPlan.objects.get(id=plan_id)
                subscription = Subscription.objects.create(
                    user=user,
                    plan=plan,
                    status='active',
                    current_period_start=timezone.now(),
                    current_period_end=timezone.now() + timedelta(days=30)
                )
                
                return Response({
                    'message': 'Subscription created successfully',
                    'subscription_id': str(subscription.id),
                    'plan_name': plan.name
                }, status=status.HTTP_200_OK)
                
            except SubscriptionPlan.DoesNotExist:
                return Response({'error': 'Invalid plan'}, status=status.HTTP_400_BAD_REQUEST)
        
        elif action == 'cancel':
            try:
                subscription = user.subscription
                subscription.cancel_at_period_end = True
                subscription.save()
                
                return Response({
                    'message': 'Subscription will be cancelled at period end'
                }, status=status.HTTP_200_OK)
                
            except Subscription.DoesNotExist:
                return Response({'error': 'No subscription found'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)


class UserAgentManagementAPIView(APIView):
    """User agent management"""
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'action': openapi.Schema(type=openapi.TYPE_STRING, enum=['assign', 'remove']),
                'agent_id': openapi.Schema(type=openapi.TYPE_STRING)
            },
            required=['action', 'agent_id']
        ),
        responses={200: "Agent action completed"},
        operation_description="Manage user agents",
        tags=['User Complete Dashboard'],
        security=[{'Bearer': []}]
    )
    def post(self, request):
        user = request.user
        action = request.data.get('action')
        agent_id = request.data.get('agent_id')
        
        if action == 'assign':
            try:
                agent = Agent.objects.get(id=agent_id, user__isnull=True)
                agent.user = user
                agent.save()
                
                return Response({
                    'message': 'Agent assigned successfully',
                    'agent_id': str(agent.id)
                }, status=status.HTTP_200_OK)
                
            except Agent.DoesNotExist:
                return Response({'error': 'Agent not available'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
