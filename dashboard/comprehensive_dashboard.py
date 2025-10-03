from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import datetime, timedelta
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from accounts.models import User
from subscriptions.models import Subscription, BillingHistory, UsageAlert, SubscriptionPlan
from calls.models import CallSession, CallQueue
from agents.ai_agent_models import AIAgent, CustomerProfile, ScheduledCallback
from dashboard.models import DashboardWidget, SystemNotification, ActivityLog

User = get_user_model()


class ComprehensiveDashboardAPIView(APIView):
    """
    Complete Dashboard API - Sab kuch ek jagah
    Returns all dashboard metrics in one response
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        tags=['Dashboard'],
        operation_summary="Comprehensive Dashboard",
        operation_description="Get all dashboard data in one API call - admin + user + agent metrics combined",
        responses={
            200: "Complete dashboard data with all metrics",
            401: "Unauthorized - Authentication required"
        }
    )
    def get(self, request):
        user = request.user
        today = timezone.now().date()
        this_month = timezone.now().replace(day=1)
        this_week = timezone.now() - timedelta(days=7)
        
        # Role-based data
        if user.role == 'admin':
            return self.get_admin_comprehensive_dashboard(request)
        elif user.role == 'agent':
            return self.get_agent_comprehensive_dashboard(request)
        else:
            return self.get_user_comprehensive_dashboard(request)
    
    def get_admin_comprehensive_dashboard(self, request):
        """Admin comprehensive dashboard with all system metrics"""
        today = timezone.now().date()
        this_month = timezone.now().replace(day=1)
        this_week = timezone.now() - timedelta(days=7)
        
        # 1. SUMMARY STATS
        summary_stats = {
            'total_users': User.objects.count(),
            'active_users': User.objects.filter(is_active=True).count(),
            'new_users_today': User.objects.filter(date_joined__date=today).count(),
            'new_users_this_week': User.objects.filter(date_joined__gte=this_week).count(),
            'new_users_this_month': User.objects.filter(date_joined__gte=this_month).count(),
        }
        
        # 2. SUBSCRIPTION METRICS
        subscription_stats = {
            'total_subscriptions': Subscription.objects.count(),
            'active_subscriptions': Subscription.objects.filter(status='active').count(),
            'inactive_subscriptions': Subscription.objects.filter(status='inactive').count(),
            'cancelled_subscriptions': Subscription.objects.filter(status='cancelled').count(),
            'new_subscriptions_today': Subscription.objects.filter(created_at__date=today).count(),
            'new_subscriptions_this_week': Subscription.objects.filter(created_at__gte=this_week).count(),
            'new_subscriptions_this_month': Subscription.objects.filter(created_at__gte=this_month).count(),
        }
        
        # Subscription by plans
        subscription_by_plans = list(Subscription.objects.filter(status='active').values(
            'plan__name', 'plan__price'
        ).annotate(count=Count('id')))
        
        # 3. BILLING & REVENUE
        billing_stats = {
            'total_revenue': BillingHistory.objects.filter(status='paid').aggregate(
                total=Sum('amount')
            )['total'] or 0,
            'revenue_today': BillingHistory.objects.filter(
                created_at__date=today, status='paid'
            ).aggregate(total=Sum('amount'))['total'] or 0,
            'revenue_this_week': BillingHistory.objects.filter(
                created_at__gte=this_week, status='paid'
            ).aggregate(total=Sum('amount'))['total'] or 0,
            'revenue_this_month': BillingHistory.objects.filter(
                created_at__gte=this_month, status='paid'
            ).aggregate(total=Sum('amount'))['total'] or 0,
            'pending_payments': BillingHistory.objects.filter(status='pending').count(),
            'failed_payments': BillingHistory.objects.filter(status='failed').count(),
        }
        
        # 4. CALL STATISTICS
        call_stats = {
            'total_calls': CallSession.objects.count(),
            'calls_today': CallSession.objects.filter(started_at__date=today).count(),
            'calls_this_week': CallSession.objects.filter(started_at__gte=this_week).count(),
            'calls_this_month': CallSession.objects.filter(started_at__gte=this_month).count(),
            'successful_calls': CallSession.objects.filter(
                status__in=['interested', 'converted', 'callback_requested']
            ).count(),
            'converted_calls': CallSession.objects.filter(status='converted').count(),
            'active_calls': CallSession.objects.filter(status='answered').count(),
            'queued_calls': CallQueue.objects.filter(status='waiting').count(),
        }
        
        # Call breakdown by type and status
        calls_by_type = list(CallSession.objects.values('call_type').annotate(count=Count('id')))
        calls_by_status = list(CallSession.objects.values('status').annotate(count=Count('id')))
        
        # 5. AI AGENT METRICS
        ai_agent_stats = {
            'total_agents': AIAgent.objects.count(),
            'active_agents': AIAgent.objects.filter(status='active').count(),
            'training_agents': AIAgent.objects.filter(status='training').count(),
            'learning_agents': AIAgent.objects.filter(status='learning').count(),
            'paused_agents': AIAgent.objects.filter(status='paused').count(),
            'agents_ready_for_calls': AIAgent.objects.filter(training_level__gte=20).count(),
        }
        
        # Agent performance summary
        agent_performance = {
            'total_calls_handled': AIAgent.objects.aggregate(
                total=Sum('calls_handled')
            )['total'] or 0,
            'total_conversions': AIAgent.objects.aggregate(
                total=Sum('successful_conversions')
            )['total'] or 0,
            'avg_conversion_rate': AIAgent.objects.aggregate(
                avg=Avg('conversion_rate')
            )['avg'] or 0,
            'avg_customer_satisfaction': AIAgent.objects.aggregate(
                avg=Avg('customer_satisfaction')
            )['avg'] or 0,
        }
        
        # 6. CUSTOMER MANAGEMENT
        customer_stats = {
            'total_customers': CustomerProfile.objects.count(),
            'hot_leads': CustomerProfile.objects.filter(interest_level='hot').count(),
            'warm_leads': CustomerProfile.objects.filter(interest_level='warm').count(),
            'cold_leads': CustomerProfile.objects.filter(interest_level='cold').count(),
            'converted_customers': CustomerProfile.objects.filter(is_converted=True).count(),
            'do_not_call_list': CustomerProfile.objects.filter(is_do_not_call=True).count(),
            'new_customers_today': CustomerProfile.objects.filter(created_at__date=today).count(),
            'new_customers_this_week': CustomerProfile.objects.filter(created_at__gte=this_week).count(),
        }
        
        # 7. SCHEDULED CALLBACKS
        callback_stats = {
            'total_callbacks': ScheduledCallback.objects.count(),
            'scheduled_callbacks': ScheduledCallback.objects.filter(status='scheduled').count(),
            'completed_callbacks': ScheduledCallback.objects.filter(status='completed').count(),
            'overdue_callbacks': ScheduledCallback.objects.filter(
                status='scheduled',
                scheduled_datetime__lt=timezone.now()
            ).count(),
            'callbacks_today': ScheduledCallback.objects.filter(
                scheduled_datetime__date=today
            ).count(),
            'callbacks_this_week': ScheduledCallback.objects.filter(
                scheduled_datetime__gte=this_week
            ).count(),
        }
        
        # 8. QUICK ACCESS BUTTONS (Admin Actions)
        quick_actions = [
            {
                'id': 'view_all_users',
                'title': 'View All Users',
                'description': 'Manage system users',
                'icon': 'users',
                'count': summary_stats['total_users'],
                'url': '/api/dashboard/admin/users/',
                'color': 'primary'
            },
            {
                'id': 'manage_subscriptions',
                'title': 'Manage Subscriptions',
                'description': 'View and manage subscriptions',
                'icon': 'credit-card',
                'count': subscription_stats['active_subscriptions'],
                'url': '/api/dashboard/admin/subscriptions/',
                'color': 'success'
            },
            {
                'id': 'view_agents',
                'title': 'AI Agents',
                'description': 'Manage AI agents',
                'icon': 'bot',
                'count': ai_agent_stats['active_agents'],
                'url': '/api/agents/ai/',
                'color': 'info'
            },
            {
                'id': 'call_monitoring',
                'title': 'Call Monitoring',
                'description': 'Monitor live calls',
                'icon': 'phone',
                'count': call_stats['active_calls'],
                'url': '/api/calls/monitor/',
                'color': 'warning'
            },
            {
                'id': 'billing_management',
                'title': 'Billing Management',
                'description': 'Handle payments and billing',
                'icon': 'dollar-sign',
                'count': billing_stats['pending_payments'],
                'url': '/api/subscriptions/billing/',
                'color': 'danger' if billing_stats['pending_payments'] > 0 else 'secondary'
            },
            {
                'id': 'system_settings',
                'title': 'System Settings',
                'description': 'Configure system settings',
                'icon': 'settings',
                'url': '/admin/',
                'color': 'dark'
            }
        ]
        
        # 9. RECENT ACTIVITIES
        recent_users = User.objects.order_by('-date_joined')[:5]
        recent_subscriptions = Subscription.objects.select_related('user', 'plan').order_by('-created_at')[:5]
        recent_calls = CallSession.objects.select_related('agent').order_by('-started_at')[:5]
        
        recent_activities = {
            'new_users': [
                {
                    'id': str(user.id),
                    'email': user.email,
                    'full_name': user.get_full_name(),
                    'role': user.role,
                    'date_joined': user.date_joined.isoformat(),
                } for user in recent_users
            ],
            'new_subscriptions': [
                {
                    'id': str(sub.id),
                    'user_email': sub.user.email,
                    'plan_name': sub.plan.name,
                    'status': sub.status,
                    'amount': float(sub.plan.price),
                    'created_at': sub.created_at.isoformat(),
                } for sub in recent_subscriptions
            ],
            'recent_calls': [
                {
                    'id': str(call.id),
                    'phone_number': call.caller_number,
                    'call_type': call.call_type,
                    'status': call.status,
                    'agent_name': call.agent.user.full_name if call.agent else 'System',
                    'started_at': call.started_at.isoformat(),
                } for call in recent_calls
            ]
        }
        
        # 10. ALERTS & NOTIFICATIONS  
        alerts = []
        
        # System alerts
        if billing_stats['failed_payments'] > 0:
            alerts.append({
                'type': 'error',
                'title': 'Failed Payments',
                'message': f'{billing_stats["failed_payments"]} payments failed. Immediate attention required.',
                'count': billing_stats['failed_payments'],
                'action_url': '/api/subscriptions/billing/?status=failed'
            })
        
        if callback_stats['overdue_callbacks'] > 0:
            alerts.append({
                'type': 'warning',
                'title': 'Overdue Callbacks',
                'message': f'{callback_stats["overdue_callbacks"]} callbacks are overdue.',
                'count': callback_stats['overdue_callbacks'],
                'action_url': '/api/agents/ai/callbacks/?overdue=true'
            })
        
        if ai_agent_stats['training_agents'] > ai_agent_stats['active_agents']:
            alerts.append({
                'type': 'info',
                'title': 'Agents Need Training',
                'message': f'{ai_agent_stats["training_agents"]} agents are still in training.',
                'count': ai_agent_stats['training_agents'],
                'action_url': '/api/agents/ai/?status=training'
            })
        
        # 11. PERFORMANCE TRENDS (Growth metrics)
        performance_trends = {
            'user_growth': {
                'today': summary_stats['new_users_today'],
                'week': summary_stats['new_users_this_week'],
                'month': summary_stats['new_users_this_month'],
                'trend': 'up' if summary_stats['new_users_this_week'] > 0 else 'stable'
            },
            'revenue_growth': {
                'today': float(billing_stats['revenue_today']),
                'week': float(billing_stats['revenue_this_week']),
                'month': float(billing_stats['revenue_this_month']),
                'trend': 'up' if billing_stats['revenue_this_week'] > 0 else 'stable'
            },
            'call_volume': {
                'today': call_stats['calls_today'],
                'week': call_stats['calls_this_week'],
                'month': call_stats['calls_this_month'],
                'trend': 'up' if call_stats['calls_this_week'] > 0 else 'stable'
            }
        }
        
        return Response({
            'dashboard_type': 'admin_comprehensive',
            'user_info': {
                'id': str(request.user.id),
                'email': request.user.email,
                'role': request.user.role,
                'full_name': request.user.get_full_name()
            },
            'summary_stats': summary_stats,
            'subscription_metrics': {
                **subscription_stats,
                'subscription_by_plans': subscription_by_plans
            },
            'billing_revenue': billing_stats,
            'call_statistics': {
                **call_stats,
                'calls_by_type': calls_by_type,
                'calls_by_status': calls_by_status
            },
            'ai_agent_metrics': {
                **ai_agent_stats,
                'performance': agent_performance
            },
            'customer_management': customer_stats,
            'callback_management': callback_stats,
            'quick_actions': quick_actions,
            'recent_activities': recent_activities,
            'alerts': alerts,
            'performance_trends': performance_trends,
            'generated_at': timezone.now().isoformat(),
            'data_freshness': 'real_time'
        }, status=status.HTTP_200_OK)
    
    def get_user_comprehensive_dashboard(self, request):
        """User comprehensive dashboard with personal metrics"""
        user = request.user
        today = timezone.now().date()
        this_month = timezone.now().replace(day=1)
        this_week = timezone.now() - timedelta(days=7)
        
        # 1. USER PROFILE & ACCOUNT
        user_profile = {
            'id': str(user.id),
            'email': user.email,
            'full_name': user.get_full_name(),
            'user_name': user.user_name,
            'phone': user.phone,
            'avatar': user.avatar.url if user.avatar else None,
            'is_verified': user.is_verified,
            'date_joined': user.date_joined.isoformat(),
            'account_status': 'active' if user.is_active else 'inactive'
        }
        
        # 2. SUBSCRIPTION STATUS (Complete Details)
        subscription_info = None
        try:
            subscription = user.subscription
            
            # Calculate time remaining details
            days_remaining = subscription.days_remaining
            total_days = (subscription.current_period_end - subscription.current_period_start).days
            days_used = total_days - days_remaining
            time_percentage = (days_used / total_days * 100) if total_days > 0 else 0
            
            subscription_info = {
                'id': str(subscription.id),
                'package_name': subscription.plan.name,
                'plan_type': subscription.plan.plan_type,
                'monthly_price': float(subscription.plan.price),
                'status': subscription.status,
                'billing_cycle': 'monthly',
                
                # Time Details
                'time_details': {
                    'days_remaining': days_remaining,
                    'total_days': total_days,
                    'days_used': days_used,
                    'time_percentage_used': time_percentage,
                    'current_period_start': subscription.current_period_start.isoformat(),
                    'current_period_end': subscription.current_period_end.isoformat(),
                    'next_billing_date': subscription.current_period_end.isoformat(),
                    'cancel_at_period_end': subscription.cancel_at_period_end
                },
                
                # Usage Details
                'usage_details': {
                    'minutes_used': subscription.minutes_used_this_month,
                    'minutes_limit': subscription.plan.call_minutes_limit,
                    'minutes_remaining': subscription.minutes_remaining,
                    'usage_percentage': subscription.usage_percentage,
                    'overage': max(0, subscription.minutes_used_this_month - subscription.plan.call_minutes_limit),
                    'usage_status': 'normal' if subscription.usage_percentage < 80 else 'warning' if subscription.usage_percentage < 100 else 'exceeded'
                },
                
                # Package Features
                'package_features': {
                    'agents_allowed': subscription.plan.agents_allowed,
                    'analytics_access': subscription.plan.analytics_access,
                    'advanced_analytics': subscription.plan.advanced_analytics,
                    'call_minutes_limit': subscription.plan.call_minutes_limit
                },
                
                # Subscription Health
                'subscription_health': {
                    'is_active': subscription.is_active,
                    'needs_attention': subscription.usage_percentage > 90 or days_remaining < 3,
                    'upgrade_recommended': subscription.usage_percentage > 85,
                    'billing_issues': False  # Will be true if payments fail
                }
            }
        except Subscription.DoesNotExist:
            subscription_info = {
                'status': 'no_subscription',
                'message': 'Please select a subscription package to continue',
                'package_selection_required': True,
                'available_packages_url': '/api/subscriptions/user/packages/'
            }
        
        # 3. AI AGENT STATUS
        ai_agent_info = None
        try:
            agent = user.ai_agent
            ai_agent_info = {
                'id': str(agent.id),
                'name': agent.name,
                'status': agent.status,
                'training_level': agent.training_level,
                'personality_type': agent.personality_type,
                'is_ready_for_calls': agent.is_ready_for_calls,
                'performance': {
                    'calls_handled': agent.calls_handled,
                    'successful_conversions': agent.successful_conversions,
                    'conversion_rate': agent.conversion_rate,
                    'customer_satisfaction': agent.customer_satisfaction
                },
                'working_hours': {
                    'start': agent.working_hours_start.strftime('%H:%M'),
                    'end': agent.working_hours_end.strftime('%H:%M')
                }
            }
        except AIAgent.DoesNotExist:
            ai_agent_info = {
                'status': 'no_agent',
                'message': 'No AI agent created yet',
                'setup_required': True
            }
        
        # 4. CALL STATISTICS (Complete Breakdown)
        if ai_agent_info and ai_agent_info.get('id'):
            # Get user's calls (not filtering by agent for now)
            user_calls = CallSession.objects.filter(user=user)
            
            # Total call counts
            total_calls = user_calls.count()
            inbound_calls = user_calls.filter(call_type='inbound').count()
            outbound_calls = user_calls.filter(call_type='outbound').count()
            
            # Time-based breakdowns
            calls_today = user_calls.filter(started_at__date=today).count()
            calls_this_week = user_calls.filter(started_at__gte=this_week).count()
            calls_this_month = user_calls.filter(started_at__gte=this_month).count()
            
            # Status statistics
            successful_calls = user_calls.filter(
                status__in=['interested', 'converted', 'callback_requested']
            ).count()
            converted_calls = user_calls.filter(status='converted').count()
            
            call_stats = {
                'total_calls': total_calls,
                'inbound_calls': inbound_calls,
                'outbound_calls': outbound_calls,
                'calls_today': calls_today,
                'calls_this_week': calls_this_week,
                'calls_this_month': calls_this_month,
                'successful_calls': successful_calls,
                'converted_calls': converted_calls,
                'success_rate': 0,
                'conversion_rate': 0,
                'call_breakdown': {
                    'inbound_percentage': (inbound_calls / total_calls * 100) if total_calls > 0 else 0,
                    'outbound_percentage': (outbound_calls / total_calls * 100) if total_calls > 0 else 0
                }
            }
            
            if call_stats['total_calls'] > 0:
                call_stats['success_rate'] = (call_stats['successful_calls'] / call_stats['total_calls']) * 100
                call_stats['conversion_rate'] = (call_stats['converted_calls'] / call_stats['total_calls']) * 100
            
            # Recent calls
            recent_calls = user_calls.order_by('-started_at')[:5]
            call_stats['recent_calls'] = [
                {
                    'id': str(call.id),
                    'phone_number': call.caller_number or call.callee_number,
                    'call_type': call.call_type,
                    'status': call.status,
                    'duration': str(call.duration) if call.duration else '0:00',
                    'started_at': call.started_at.isoformat(),
                    'notes': call.notes[:100] + '...' if call.notes and len(call.notes) > 100 else call.notes or ''
                } for call in recent_calls
            ]
        else:
            call_stats = {
                'total_calls': 0,
                'calls_today': 0,
                'calls_this_week': 0,
                'calls_this_month': 0,
                'successful_calls': 0,
                'converted_calls': 0,
                'success_rate': 0,
                'recent_calls': [],
                'message': 'Create an AI agent to start making calls'
            }
        
        # 5. CUSTOMER MANAGEMENT
        if ai_agent_info and ai_agent_info.get('id'):
            try:
                agent = user.ai_agent
                customers = CustomerProfile.objects.filter(ai_agent=agent)
            except:
                customers = CustomerProfile.objects.none()
            
            customer_stats = {
                'total_customers': customers.count(),
                'hot_leads': customers.filter(interest_level='hot').count(),
                'warm_leads': customers.filter(interest_level='warm').count(),
                'cold_leads': customers.filter(interest_level='cold').count(),
                'converted_customers': customers.filter(is_converted=True).count(),
                'new_customers_today': customers.filter(created_at__date=today).count(),
                'conversion_rate': 0
            }
            
            if customer_stats['total_customers'] > 0:
                customer_stats['conversion_rate'] = (customer_stats['converted_customers'] / customer_stats['total_customers']) * 100
        else:
            customer_stats = {
                'total_customers': 0,
                'hot_leads': 0,
                'warm_leads': 0,
                'cold_leads': 0,
                'converted_customers': 0,
                'new_customers_today': 0,
                'conversion_rate': 0,
                'message': 'No customers yet'
            }
        
        # 6. SCHEDULED CALLBACKS
        if ai_agent_info and ai_agent_info.get('id'):
            try:
                agent = user.ai_agent
                callbacks = ScheduledCallback.objects.filter(ai_agent=agent)
            except:
                callbacks = ScheduledCallback.objects.none()
            
            callback_stats = {
                'total_callbacks': callbacks.count(),
                'scheduled_callbacks': callbacks.filter(status='scheduled').count(),
                'completed_callbacks': callbacks.filter(status='completed').count(),
                'overdue_callbacks': callbacks.filter(
                    status='scheduled',
                    scheduled_datetime__lt=timezone.now()
                ).count(),
                'callbacks_today': callbacks.filter(
                    scheduled_datetime__date=today
                ).count(),
            }
            
            # Upcoming callbacks
            upcoming_callbacks = callbacks.filter(
                status='scheduled',
                scheduled_datetime__gte=timezone.now()
            ).order_by('scheduled_datetime')[:3]
            
            callback_stats['upcoming_callbacks'] = [
                {
                    'id': str(callback.id),
                    'customer_phone': callback.customer_profile.phone_number,
                    'customer_name': callback.customer_profile.name,
                    'scheduled_datetime': callback.scheduled_datetime.isoformat(),
                    'reason': callback.reason,
                    'priority_level': callback.priority_level
                } for callback in upcoming_callbacks
            ]
        else:
            callback_stats = {
                'total_callbacks': 0,
                'scheduled_callbacks': 0,
                'completed_callbacks': 0,
                'overdue_callbacks': 0,
                'callbacks_today': 0,
                'upcoming_callbacks': [],
                'message': 'No callbacks scheduled'
            }
        
        # 7. BILLING INFORMATION
        billing_info = None
        if subscription_info and subscription_info.get('status') != 'no_subscription':
            try:
                recent_bills = BillingHistory.objects.filter(
                    subscription=user.subscription
                ).order_by('-created_at')[:3]
                
                total_spent = BillingHistory.objects.filter(
                    subscription=user.subscription,
                    status='paid'
                ).aggregate(total=Sum('amount'))['total'] or 0
                
                billing_info = {
                    'next_billing_date': subscription_info['current_period_end'],
                    'next_amount': subscription_info['plan_price'],
                    'total_spent': float(total_spent),
                    'recent_payments': [
                        {
                            'id': str(bill.id),
                            'amount': float(bill.amount),
                            'status': bill.status,
                            'created_at': bill.created_at.isoformat(),
                            'description': bill.description
                        } for bill in recent_bills
                    ]
                }
            except:
                billing_info = {'message': 'No billing information available'}
        else:
            billing_info = {'message': 'No active subscription for billing'}
        
        # 8. QUICK ACTIONS
        quick_actions = [
            {
                'id': 'create_agent' if not ai_agent_info or ai_agent_info.get('status') == 'no_agent' else 'manage_agent',
                'title': 'Create AI Agent' if not ai_agent_info or ai_agent_info.get('status') == 'no_agent' else 'Manage AI Agent',
                'description': 'Set up your AI assistant' if not ai_agent_info or ai_agent_info.get('status') == 'no_agent' else 'Configure your AI agent',
                'icon': 'plus' if not ai_agent_info or ai_agent_info.get('status') == 'no_agent' else 'bot',
                'enabled': True,
                'url': '/api/agents/ai/setup/' if not ai_agent_info or ai_agent_info.get('status') == 'no_agent' else '/api/dashboard/ai-agent/',
                'color': 'primary'
            },
            {
                'id': 'start_call',
                'title': 'Start Call',
                'description': 'Make an AI-powered call',
                'icon': 'phone',
                'enabled': ai_agent_info and ai_agent_info.get('is_ready_for_calls', False),
                'url': '/api/agents/ai/start-call/',
                'color': 'success'
            },
            {
                'id': 'view_customers',
                'title': 'Customer Profiles',
                'description': 'Manage your customers',
                'icon': 'users',
                'count': customer_stats['total_customers'],
                'enabled': True,
                'url': '/api/agents/ai/customers/',
                'color': 'info'
            },
            {
                'id': 'manage_callbacks',
                'title': 'Scheduled Callbacks',
                'description': 'View scheduled calls',
                'icon': 'calendar',
                'count': callback_stats['scheduled_callbacks'],
                'enabled': True,
                'url': '/api/agents/ai/callbacks/',
                'color': 'warning'
            },
            {
                'id': 'subscription_management',
                'title': 'Subscription & Packages',
                'description': 'Manage your subscription plan',
                'icon': 'credit-card',
                'enabled': True,
                'url': '/api/subscriptions/user/packages/',
                'color': 'secondary'
            },
            {
                'id': 'account_settings',
                'title': 'Account Settings',
                'description': 'Update your profile',
                'icon': 'settings',
                'enabled': True,
                'url': '/api/dashboard/user/settings/',
                'color': 'dark'
            }
        ]
        
        # 9. ALERTS & NOTIFICATIONS
        alerts = []
        
        # Subscription alerts
        if subscription_info and subscription_info.get('status') == 'no_subscription':
            alerts.append({
                'type': 'warning',
                'title': 'No Subscription',
                'message': 'Subscribe to a plan to access all features',
                'action_text': 'Choose Plan',
                'action_url': '/api/subscriptions/plans/'
            })
        elif subscription_info and subscription_info.get('days_remaining', 0) <= 3:
            alerts.append({
                'type': 'info',
                'title': 'Subscription Expiring',
                'message': f'Your subscription expires in {subscription_info.get("days_remaining")} days',
                'action_text': 'Renew',
                'action_url': '/api/subscriptions/current/'
            })
        
        # Agent alerts
        if not ai_agent_info or ai_agent_info.get('status') == 'no_agent':
            alerts.append({
                'type': 'info',
                'title': 'Create AI Agent',
                'message': 'Set up your AI assistant to start making calls',
                'action_text': 'Create Agent',
                'action_url': '/api/agents/ai/setup/'
            })
        elif ai_agent_info and ai_agent_info.get('training_level', 0) < 20:
            alerts.append({
                'type': 'warning',
                'title': 'Agent Training Incomplete',
                'message': f'Your AI agent is {ai_agent_info.get("training_level")}% trained',
                'action_text': 'Continue Training',
                'action_url': '/api/agents/ai/training/'
            })
        
        # Callback alerts
        if callback_stats['overdue_callbacks'] > 0:
            alerts.append({
                'type': 'error',
                'title': 'Overdue Callbacks',
                'message': f'You have {callback_stats["overdue_callbacks"]} overdue callbacks',
                'action_text': 'View Callbacks',
                'action_url': '/api/agents/ai/callbacks/?overdue=true'
            })
        
        return Response({
            'dashboard_type': 'user_comprehensive',
            'user_profile': user_profile,
            'subscription_info': subscription_info,
            'ai_agent_info': ai_agent_info,
            'call_statistics': call_stats,
            'customer_management': customer_stats,
            'callback_management': callback_stats,
            'billing_info': billing_info,
            'quick_actions': quick_actions,
            'alerts': alerts,
            'dashboard_summary': {
                # Account Overview
                'account_status': subscription_info.get('status', 'no_subscription'),
                'subscription_active': subscription_info.get('status') == 'active' if subscription_info else False,
                'agent_ready': ai_agent_info.get('is_ready_for_calls', False) if ai_agent_info else False,
                
                # Call Statistics Summary
                'total_calls': call_stats['total_calls'],
                'inbound_calls': call_stats['inbound_calls'],
                'outbound_calls': call_stats['outbound_calls'],
                'calls_today': call_stats['calls_today'],
                'success_rate': call_stats.get('success_rate', 0),
                'conversion_rate': call_stats.get('conversion_rate', 0),
                
                # Subscription Summary
                'package_name': subscription_info.get('package_name') if subscription_info and subscription_info.get('status') != 'no_subscription' else None,
                'days_remaining': subscription_info.get('time_details', {}).get('days_remaining') if subscription_info and subscription_info.get('status') != 'no_subscription' else None,
                'usage_percentage': subscription_info.get('usage_details', {}).get('usage_percentage') if subscription_info and subscription_info.get('status') != 'no_subscription' else None,
                'minutes_remaining': subscription_info.get('usage_details', {}).get('minutes_remaining') if subscription_info and subscription_info.get('status') != 'no_subscription' else None,
                
                # Quick Status
                'pending_callbacks': callback_stats['scheduled_callbacks'],
                'overdue_callbacks': callback_stats['overdue_callbacks'],
                'needs_attention': len(alerts) > 0
            },
            'generated_at': timezone.now().isoformat(),
            'data_freshness': 'real_time'
        }, status=status.HTTP_200_OK)
    
    def get_agent_comprehensive_dashboard(self, request):
        """Agent comprehensive dashboard with agent-specific metrics"""
        try:
            agent = request.user.agent_profile
        except:
            return Response({
                'error': 'Agent profile not found',
                'message': 'Please contact admin to set up your agent profile'
            }, status=status.HTTP_404_NOT_FOUND)
        
        today = timezone.now().date()
        this_week = timezone.now() - timedelta(days=7)
        this_month = timezone.now().replace(day=1)
        
        # Agent performance metrics
        agent_stats = {
            'agent_status': agent.status,
            'calls_today': CallSession.objects.filter(
                agent=agent,
                started_at__date=today
            ).count(),
            'calls_this_week': CallSession.objects.filter(
                agent=agent,
                started_at__gte=this_week
            ).count(),
            'calls_this_month': CallSession.objects.filter(
                agent=agent,
                started_at__gte=this_month
            ).count(),
            'success_rate': agent.success_rate,
            'customer_satisfaction': agent.customer_satisfaction,
            'avg_call_duration': agent.avg_call_duration
        }
        
        # Queue information
        queue_info = {
            'total_queue': CallQueue.objects.filter(status='waiting').count(),
            'my_queue': CallQueue.objects.filter(assigned_agent=agent, status='waiting').count(),
            'in_progress': CallQueue.objects.filter(assigned_agent=agent, status='in_progress').count()
        }
        
        # Quick actions for agents
        quick_actions = [
            {
                'id': 'answer_call',
                'title': 'Answer Queue',
                'description': 'Handle incoming calls',
                'icon': 'phone-incoming',
                'count': queue_info['my_queue'],
                'enabled': queue_info['my_queue'] > 0,
                'url': '/api/calls/queue/next/',
                'color': 'success'
            },
            {
                'id': 'call_history',
                'title': 'My Calls',
                'description': 'View call history',
                'icon': 'history',
                'count': agent_stats['calls_today'],
                'enabled': True,
                'url': '/api/agents/call-history/',
                'color': 'info'
            },
            {
                'id': 'performance',
                'title': 'Performance',
                'description': 'View my metrics',
                'icon': 'trending-up',
                'enabled': True,
                'url': '/api/agents/performance/',
                'color': 'primary'
            }
        ]
        
        return Response({
            'dashboard_type': 'agent_comprehensive',
            'agent_info': {
                'id': str(agent.id),
                'user_email': request.user.email,
                'status': agent.status,
                'employee_id': agent.employee_id
            },
            'performance_metrics': agent_stats,
            'queue_information': queue_info,
            'quick_actions': quick_actions,
            'generated_at': timezone.now().isoformat()
        }, status=status.HTTP_200_OK)
