from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import transaction
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import json
from datetime import datetime, timedelta

from .ai_agent_models import (
    AIAgent, CustomerProfile, CallSession, 
    AIAgentTraining, ScheduledCallback
)
from .homeai_integration import HomeAIService
from .twilio_service import TwilioCallService

User = get_user_model()


class AIAgentSetupAPIView(APIView):
    """
    Initial AI Agent setup for new client
    Jab client pehli bar subscribe karta hai to blank agent create hota hai
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'agent_name': openapi.Schema(type=openapi.TYPE_STRING, description='Agent ka naam'),
                'personality_type': openapi.Schema(type=openapi.TYPE_STRING, description='friendly/professional/persuasive'),
                'voice_model': openapi.Schema(type=openapi.TYPE_STRING, description='Voice model selection'),
                'working_hours_start': openapi.Schema(type=openapi.TYPE_STRING, description='09:00 format'),
                'working_hours_end': openapi.Schema(type=openapi.TYPE_STRING, description='18:00 format'),
                'business_info': openapi.Schema(type=openapi.TYPE_OBJECT, description='Client ki business info'),
                'sales_goals': openapi.Schema(type=openapi.TYPE_OBJECT, description='Sales targets'),
                'initial_script': openapi.Schema(type=openapi.TYPE_STRING, description='Initial sales script')
            },
            required=['agent_name', 'business_info']
        ),
        responses={201: "AI Agent created successfully"},
        operation_description="Create new AI Agent for client - completely blank initially",
        tags=['AI Agent Management']
    )
    def post(self, request):
        user = request.user
        
        # Check if agent already exists
        if hasattr(user, 'ai_agent'):
            return Response({
                'error': 'AI Agent already exists for this client',
                'agent_id': str(user.ai_agent.id)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data
        
        try:
            with transaction.atomic():
                # Create blank AI Agent
                ai_agent = AIAgent.objects.create(
                    client=user,
                    name=data.get('agent_name', f"{user.first_name}'s AI Assistant"),
                    personality_type=data.get('personality_type', 'friendly'),
                    voice_model=data.get('voice_model', 'en-US-female-1'),
                    status='training',  # Initially in training mode
                    training_level=0,   # Completely blank
                    working_hours_start=data.get('working_hours_start', '09:00'),
                    working_hours_end=data.get('working_hours_end', '18:00'),
                    conversation_memory={
                        'business_info': data.get('business_info', {}),
                        'created': datetime.now().isoformat(),
                        'initial_setup': True
                    }
                )
                
                # Create initial training session
                training = AIAgentTraining.objects.create(
                    ai_agent=ai_agent,
                    training_type='initial',
                    training_data={
                        'business_info': data.get('business_info', {}),
                        'personality_setup': data.get('personality_type', 'friendly'),
                        'voice_config': data.get('voice_model', 'en-US-female-1')
                    },
                    client_instructions=data.get('initial_script', ''),
                    sales_goals=data.get('sales_goals', {}),
                    product_info=data.get('business_info', {}),
                    completion_percentage=0
                )
                
                return Response({
                    'message': 'AI Agent created successfully - Ready for training',
                    'agent_id': str(ai_agent.id),
                    'status': ai_agent.status,
                    'training_level': ai_agent.training_level,
                    'next_step': 'Start initial training to make agent active'
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response({
                'error': f'Failed to create AI Agent: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


class AIAgentTrainingAPIView(APIView):
    """
    AI Agent training by client
    Client apne agent ko train karta hai initially
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        responses={200: "Agent training data"},
        operation_description="Get current training status and data",
        tags=['AI Agent Training']
    )
    def get(self, request):
        try:
            agent = request.user.ai_agent
            training_sessions = agent.training_sessions.all().order_by('-created_at')
            
            training_data = []
            for session in training_sessions:
                training_data.append({
                    'id': str(session.id),
                    'type': session.training_type,
                    'completion': session.completion_percentage,
                    'is_completed': session.is_completed,
                    'created_at': session.created_at.isoformat()
                })
            
            return Response({
                'agent_id': str(agent.id),
                'agent_name': agent.name,
                'current_status': agent.status,
                'training_level': agent.training_level,
                'training_sessions': training_data,
                'is_ready_for_calls': agent.is_ready_for_calls,
                'total_calls_handled': agent.calls_handled,
                'current_memory': agent.conversation_memory
            }, status=status.HTTP_200_OK)
            
        except AIAgent.DoesNotExist:
            return Response({
                'error': 'No AI Agent found. Please create one first.'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'training_type': openapi.Schema(
                    type=openapi.TYPE_STRING, 
                    enum=['script', 'objection_handling', 'product_knowledge'],
                    description='Type of training'
                ),
                'training_content': openapi.Schema(type=openapi.TYPE_STRING, description='Training content/script'),
                'product_details': openapi.Schema(type=openapi.TYPE_OBJECT, description='Product information'),
                'sales_techniques': openapi.Schema(
                    type=openapi.TYPE_ARRAY, 
                    items=openapi.Schema(type=openapi.TYPE_STRING),
                    description='Sales techniques to teach'
                ),
                'objection_responses': openapi.Schema(type=openapi.TYPE_OBJECT, description='How to handle objections'),
                'personality_adjustments': openapi.Schema(type=openapi.TYPE_OBJECT, description='Personality fine-tuning')
            },
            required=['training_type', 'training_content']
        ),
        responses={200: "Training completed successfully"},
        operation_description="Train the AI Agent with client-specific content",
        tags=['AI Agent Training']
    )
    def post(self, request):
        try:
            agent = request.user.ai_agent
            data = request.data
            
            # Create new training session
            training = AIAgentTraining.objects.create(
                ai_agent=agent,
                training_type=data.get('training_type'),
                training_data={
                    'content': data.get('training_content'),
                    'product_details': data.get('product_details', {}),
                    'sales_techniques': data.get('sales_techniques', []),
                    'objection_responses': data.get('objection_responses', {}),
                    'timestamp': datetime.now().isoformat()
                },
                client_instructions=data.get('training_content'),
                sales_goals=data.get('sales_goals', {}),
                product_info=data.get('product_details', {}),
                completion_percentage=100,
                is_completed=True
            )
            
            # Update agent's learning
            agent.conversation_memory.update({
                f'training_{data.get("training_type")}': {
                    'content': data.get('training_content'),
                    'trained_at': datetime.now().isoformat(),
                    'session_id': str(training.id)
                }
            })
            
            # Update training level
            training_sessions_completed = agent.training_sessions.filter(is_completed=True).count()
            agent.training_level = min(training_sessions_completed * 20, 100)
            
            # Update status based on training level
            if agent.training_level >= 20:
                agent.status = 'learning'  # Ready for learning mode
            elif agent.training_level >= 80:
                agent.status = 'active'    # Fully trained
            
            agent.save()
            
            return Response({
                'message': 'Training completed successfully',
                'training_id': str(training.id),
                'agent_training_level': agent.training_level,
                'agent_status': agent.status,
                'is_ready_for_calls': agent.is_ready_for_calls
            }, status=status.HTTP_200_OK)
            
        except AIAgent.DoesNotExist:
            return Response({
                'error': 'No AI Agent found. Please create one first.'
            }, status=status.HTTP_404_NOT_FOUND)


class AIAgentCallManagementAPIView(APIView):
    """
    AI Agent call management
    Agent apne calls manage karta hai - inbound, outbound, scheduled
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        parameters=[
            openapi.Parameter('call_type', openapi.IN_QUERY, description="inbound/outbound/scheduled", type=openapi.TYPE_STRING),
            openapi.Parameter('status', openapi.IN_QUERY, description="Call status filter", type=openapi.TYPE_STRING),
        ],
        responses={200: "Agent call history and management"},
        operation_description="Get AI Agent's call management dashboard",
        tags=['AI Agent Calls']
    )
    def get(self, request):
        try:
            agent = request.user.ai_agent
            
            # Filters
            call_type = request.query_params.get('call_type')
            status_filter = request.query_params.get('status')
            
            # Base queryset
            calls = agent.call_sessions.all().order_by('-initiated_at')
            
            if call_type:
                calls = calls.filter(call_type=call_type)
            if status_filter:
                calls = calls.filter(outcome=status_filter)
            
            # Recent calls
            recent_calls = calls[:20]
            call_data = []
            
            for call in recent_calls:
                call_data.append({
                    'id': str(call.id),
                    'phone_number': call.phone_number,
                    'call_type': call.call_type,
                    'outcome': call.outcome,
                    'duration': call.duration_formatted,
                    'initiated_at': call.initiated_at.isoformat(),
                    'customer_response': call.customer_response,
                    'followup_scheduled': call.followup_scheduled,
                    'followup_datetime': call.followup_datetime.isoformat() if call.followup_datetime else None
                })
            
            # Agent performance stats
            today = timezone.now().date()
            today_calls = calls.filter(initiated_at__date=today).count()
            successful_calls = calls.filter(outcome__in=['interested', 'converted']).count()
            
            # Scheduled callbacks
            upcoming_callbacks = agent.scheduled_callbacks.filter(
                status='scheduled',
                scheduled_datetime__gte=timezone.now()
            ).order_by('scheduled_datetime')[:10]
            
            callback_data = []
            for callback in upcoming_callbacks:
                callback_data.append({
                    'id': str(callback.id),
                    'customer_phone': callback.customer_profile.phone_number,
                    'customer_name': callback.customer_profile.name,
                    'scheduled_datetime': callback.scheduled_datetime.isoformat(),
                    'reason': callback.reason,
                    'priority_level': callback.priority_level
                })
            
            return Response({
                'agent_info': {
                    'id': str(agent.id),
                    'name': agent.name,
                    'status': agent.status,
                    'training_level': agent.training_level,
                    'is_ready_for_calls': agent.is_ready_for_calls
                },
                'performance': {
                    'total_calls': agent.calls_handled,
                    'today_calls': today_calls,
                    'successful_calls': successful_calls,
                    'conversion_rate': agent.conversion_rate,
                    'customer_satisfaction': agent.customer_satisfaction
                },
                'recent_calls': call_data,
                'upcoming_callbacks': callback_data,
                'call_stats': {
                    'inbound': calls.filter(call_type='inbound').count(),
                    'outbound': calls.filter(call_type='outbound').count(),
                    'scheduled': calls.filter(call_type='scheduled').count(),
                    'followup': calls.filter(call_type='followup').count()
                }
            }, status=status.HTTP_200_OK)
            
        except AIAgent.DoesNotExist:
            return Response({
                'error': 'No AI Agent found. Please create one first.'
            }, status=status.HTTP_404_NOT_FOUND)


class StartAICallAPIView(APIView):
    """
    Start AI-powered call (inbound/outbound)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'phone_number': openapi.Schema(type=openapi.TYPE_STRING, description='Customer phone number'),
                'call_type': openapi.Schema(type=openapi.TYPE_STRING, enum=['inbound', 'outbound', 'scheduled']),
                'context': openapi.Schema(type=openapi.TYPE_STRING, description='Call context/reason'),
                'scheduled_callback_id': openapi.Schema(type=openapi.TYPE_STRING, description='If this is a scheduled callback')
            },
            required=['phone_number', 'call_type']
        ),
        responses={200: "Call initiated successfully"},
        operation_description="Start AI-powered call with customer",
        tags=['AI Agent Calls']
    )
    def post(self, request):
        try:
            agent = request.user.ai_agent
            
            if not agent.is_ready_for_calls:
                return Response({
                    'error': 'Agent is not ready for calls yet. Please complete training first.',
                    'training_level': agent.training_level,
                    'required_level': 20
                }, status=status.HTTP_400_BAD_REQUEST)
            
            data = request.data
            phone_number = data.get('phone_number')
            call_type = data.get('call_type')
            
            # Get or create customer profile
            customer_profile, created = CustomerProfile.objects.get_or_create(
                ai_agent=agent,
                phone_number=phone_number,
                defaults={
                    'interest_level': 'warm',
                    'call_preference_time': 'anytime',
                    'conversation_notes': {
                        'created': datetime.now().isoformat(),
                        'source': call_type
                    }
                }
            )
            
            # Create call session
            call_session = CallSession.objects.create(
                ai_agent=agent,
                customer_profile=customer_profile,
                call_type=call_type,
                phone_number=phone_number,
                outcome='answered',  # Will be updated during call
                agent_notes=data.get('context', '')
            )
            
            # Handle scheduled callback
            if data.get('scheduled_callback_id'):
                try:
                    callback = ScheduledCallback.objects.get(
                        id=data.get('scheduled_callback_id'),
                        ai_agent=agent
                    )
                    callback.status = 'in_progress'
                    callback.save()
                    call_session.followup_scheduled = True
                except ScheduledCallback.DoesNotExist:
                    pass
            
            # Initialize Twilio call (simplified for demo)
            twilio_service = TwilioCallService()
            try:
                # twilio_call = twilio_service.initiate_call(
                #     to=phone_number,
                #     agent_config=agent.conversation_memory
                # )
                # call_session.twilio_call_sid = twilio_call.sid
                call_session.twilio_call_sid = f"demo_call_{call_session.id}"
                call_session.connected_at = timezone.now()
                call_session.save()
            except Exception as e:
                call_session.outcome = 'failed'
                call_session.agent_notes = f"Failed to connect: {str(e)}"
                call_session.save()
                
                return Response({
                    'error': f'Failed to initiate call: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({
                'message': 'Call initiated successfully',
                'call_id': str(call_session.id),
                'customer_profile': {
                    'phone_number': customer_profile.phone_number,
                    'name': customer_profile.name,
                    'interest_level': customer_profile.interest_level,
                    'total_calls': customer_profile.total_calls,
                    'is_new_customer': created
                },
                'call_details': {
                    'call_type': call_session.call_type,
                    'initiated_at': call_session.initiated_at.isoformat(),
                    'twilio_call_sid': call_session.twilio_call_sid
                }
            }, status=status.HTTP_200_OK)
            
        except AIAgent.DoesNotExist:
            return Response({
                'error': 'No AI Agent found. Please create one first.'
            }, status=status.HTTP_404_NOT_FOUND)


class CallOutcomeAPIView(APIView):
    """
    Update call outcome and let AI learn from it
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'call_id': openapi.Schema(type=openapi.TYPE_STRING, description='Call session ID'),
                'outcome': openapi.Schema(
                    type=openapi.TYPE_STRING, 
                    enum=['answered', 'no_answer', 'busy', 'interested', 'callback_requested', 'not_interested', 'converted'],
                    description='Call outcome'
                ),
                'customer_response': openapi.Schema(type=openapi.TYPE_STRING, description='Customer ka response'),
                'conversation_notes': openapi.Schema(type=openapi.TYPE_STRING, description='Conversation details'),
                'callback_requested': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='Customer ne callback manga?'),
                'callback_datetime': openapi.Schema(type=openapi.TYPE_STRING, description='Callback time if requested'),
                'sale_amount': openapi.Schema(type=openapi.TYPE_NUMBER, description='Sale amount if converted'),
                'customer_satisfaction': openapi.Schema(type=openapi.TYPE_INTEGER, description='1-5 rating')
            },
            required=['call_id', 'outcome']
        ),
        responses={200: "Call outcome updated and agent learned"},
        operation_description="Update call outcome and train AI agent from experience",
        tags=['AI Agent Learning']
    )
    def post(self, request):
        try:
            agent = request.user.ai_agent
            data = request.data
            
            # Get call session
            call_session = CallSession.objects.get(
                id=data.get('call_id'),
                ai_agent=agent
            )
            
            # Update call session
            call_session.outcome = data.get('outcome')
            call_session.customer_response = data.get('customer_response', '')
            call_session.agent_notes = data.get('conversation_notes', '')
            call_session.ended_at = timezone.now()
            
            # Calculate duration
            if call_session.connected_at:
                duration = (call_session.ended_at - call_session.connected_at).total_seconds()
                call_session.duration_seconds = int(duration)
            
            call_session.save()
            
            # Update customer profile
            customer_profile = call_session.customer_profile
            
            # Set interest level based on outcome
            if data.get('outcome') == 'converted':
                customer_profile.interest_level = 'converted'
                customer_profile.is_converted = True
                customer_profile.conversion_date = timezone.now()
            elif data.get('outcome') == 'interested':
                customer_profile.interest_level = 'hot'
            elif data.get('outcome') == 'not_interested':
                customer_profile.interest_level = 'cold'
            
            customer_profile.update_interaction(
                call_outcome=data.get('outcome'),
                notes=data.get('conversation_notes')
            )
            
            # Schedule callback if requested
            if data.get('callback_requested') and data.get('callback_datetime'):
                callback_datetime = datetime.fromisoformat(data.get('callback_datetime').replace('Z', '+00:00'))
                
                ScheduledCallback.objects.create(
                    ai_agent=agent,
                    customer_profile=customer_profile,
                    scheduled_datetime=callback_datetime,
                    reason=data.get('callback_reason', 'Customer requested callback'),
                    priority_level=3 if customer_profile.interest_level == 'hot' else 2
                )
                
                call_session.followup_scheduled = True
                call_session.followup_datetime = callback_datetime
                call_session.save()
            
            # AI Agent learning from this call
            learning_data = {
                'call_id': str(call_session.id),
                'outcome': data.get('outcome'),
                'customer_response': data.get('customer_response'),
                'customer_interest_level': customer_profile.interest_level,
                'call_duration': call_session.duration_seconds,
                'notes': data.get('conversation_notes'),
                'satisfaction': data.get('customer_satisfaction'),
                'successful': data.get('outcome') in ['interested', 'converted', 'callback_requested']
            }
            
            agent.update_learning_data(learning_data)
            
            # Update agent status based on experience
            if agent.calls_handled >= 10 and agent.status == 'learning':
                agent.status = 'active'
                agent.save()
            
            response_data = {
                'message': 'Call outcome updated and agent learned from experience',
                'call_outcome': call_session.outcome,
                'customer_updated': {
                    'interest_level': customer_profile.interest_level,
                    'total_calls': customer_profile.total_calls,
                    'is_converted': customer_profile.is_converted
                },
                'agent_learning': {
                    'total_calls_handled': agent.calls_handled,
                    'conversion_rate': agent.conversion_rate,
                    'new_status': agent.status
                }
            }
            
            if data.get('callback_requested'):
                response_data['callback_scheduled'] = {
                    'datetime': call_session.followup_datetime.isoformat(),
                    'reason': data.get('callback_reason', 'Customer requested callback')
                }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except CallSession.DoesNotExist:
            return Response({
                'error': 'Call session not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except AIAgent.DoesNotExist:
            return Response({
                'error': 'No AI Agent found'
            }, status=status.HTTP_404_NOT_FOUND)
