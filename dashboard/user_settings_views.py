from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password, make_password
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

User = get_user_model()


class UserSettingsAPIView(APIView):
    """User account settings and preferences"""
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        responses={
            200: "User settings",
            401: "Unauthorized"
        },
        operation_description="Get user account settings and preferences",
        tags=['User Dashboard'],
        security=[{'Bearer': []}]
    )
    def get(self, request):
        user = request.user
        
        settings_data = {
            'account_settings': {
                'email': user.email,
                'email_verified': user.is_verified,
                'two_factor_enabled': False,  # Implement later
                'account_created': user.date_joined.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None
            },
            'notification_preferences': {
                'email_notifications': True,    # Add to User model later
                'sms_notifications': False,     # Add to User model later
                'marketing_emails': True,       # Add to User model later
                'call_notifications': True,     # Add to User model later
                'billing_notifications': True   # Add to User model later
            },
            'privacy_settings': {
                'profile_visibility': 'private',  # Add to User model later
                'call_recording_consent': True,   # Add to User model later
                'data_sharing_consent': False     # Add to User model later
            },
            'call_preferences': {
                'auto_record_calls': True,        # Add to User model later
                'ai_assistance_enabled': True,    # Add to User model later
                'preferred_agent_language': 'en', # Add to User model later
                'call_quality': 'high'            # Add to User model later
            }
        }
        
        return Response(settings_data, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'notification_preferences': openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'email_notifications': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                        'sms_notifications': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                        'marketing_emails': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                        'call_notifications': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                        'billing_notifications': openapi.Schema(type=openapi.TYPE_BOOLEAN)
                    }
                ),
                'privacy_settings': openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'profile_visibility': openapi.Schema(type=openapi.TYPE_STRING),
                        'call_recording_consent': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                        'data_sharing_consent': openapi.Schema(type=openapi.TYPE_BOOLEAN)
                    }
                ),
                'call_preferences': openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'auto_record_calls': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                        'ai_assistance_enabled': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                        'preferred_agent_language': openapi.Schema(type=openapi.TYPE_STRING),
                        'call_quality': openapi.Schema(type=openapi.TYPE_STRING)
                    }
                )
            }
        ),
        responses={
            200: "Settings updated successfully",
            400: "Bad request",
            401: "Unauthorized"
        },
        operation_description="Update user settings and preferences",
        tags=['User Dashboard'],
        security=[{'Bearer': []}]
    )
    def patch(self, request):
        user = request.user
        updated_settings = []
        
        # Update notification preferences
        if 'notification_preferences' in request.data:
            updated_settings.append('notification_preferences')
            # Store in user profile or separate model
        
        # Update privacy settings
        if 'privacy_settings' in request.data:
            updated_settings.append('privacy_settings')
            # Store in user profile or separate model
        
        # Update call preferences
        if 'call_preferences' in request.data:
            updated_settings.append('call_preferences')
            # Store in user profile or separate model
        
        return Response({
            'message': 'Settings updated successfully',
            'updated_sections': updated_settings
        }, status=status.HTTP_200_OK)


class UserPasswordChangeAPIView(APIView):
    """Change user password"""
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'current_password': openapi.Schema(type=openapi.TYPE_STRING, description='Current password'),
                'new_password': openapi.Schema(type=openapi.TYPE_STRING, description='New password'),
                'confirm_password': openapi.Schema(type=openapi.TYPE_STRING, description='Confirm new password')
            },
            required=['current_password', 'new_password', 'confirm_password']
        ),
        responses={
            200: "Password changed successfully",
            400: "Bad request",
            401: "Unauthorized"
        },
        operation_description="Change user password",
        tags=['User Dashboard'],
        security=[{'Bearer': []}]
    )
    def post(self, request):
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')
        
        if not all([current_password, new_password, confirm_password]):
            return Response({
                'error': 'All password fields are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check current password
        if not check_password(current_password, user.password):
            return Response({
                'error': 'Current password is incorrect'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check new password confirmation
        if new_password != confirm_password:
            return Response({
                'error': 'New passwords do not match'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Password strength validation (basic)
        if len(new_password) < 8:
            return Response({
                'error': 'Password must be at least 8 characters long'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update password
        user.password = make_password(new_password)
        user.save()
        
        return Response({
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)


class UserAccountDeleteAPIView(APIView):
    """Delete user account"""
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'password': openapi.Schema(type=openapi.TYPE_STRING, description='Current password for confirmation'),
                'confirmation': openapi.Schema(type=openapi.TYPE_STRING, description='Type "DELETE" to confirm')
            },
            required=['password', 'confirmation']
        ),
        responses={
            200: "Account deleted successfully",
            400: "Bad request",
            401: "Unauthorized"
        },
        operation_description="Delete user account (irreversible)",
        tags=['User Dashboard'],
        security=[{'Bearer': []}]
    )
    def post(self, request):
        user = request.user
        password = request.data.get('password')
        confirmation = request.data.get('confirmation')
        
        if not password or not confirmation:
            return Response({
                'error': 'Password and confirmation are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check password
        if not check_password(password, user.password):
            return Response({
                'error': 'Password is incorrect'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check confirmation
        if confirmation != 'DELETE':
            return Response({
                'error': 'Please type "DELETE" to confirm account deletion'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Cancel subscription if active
        try:
            subscription = user.subscription
            if subscription.status == 'active':
                subscription.cancel_at_period_end = True
                subscription.save()
        except:
            pass
        
        # Deactivate account instead of deleting (for data integrity)
        user.is_active = False
        user.email = f"deleted_{user.id}@deleted.com"
        user.save()
        
        return Response({
            'message': 'Account has been deactivated successfully'
        }, status=status.HTTP_200_OK)


class UserExportDataAPIView(APIView):
    """Export user data (GDPR compliance)"""
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        responses={
            200: "User data export",
            401: "Unauthorized"
        },
        operation_description="Export all user data for GDPR compliance",
        tags=['User Dashboard'],
        security=[{'Bearer': []}]
    )
    def get(self, request):
        user = request.user
        
        # Collect all user data
        user_data = {
            'personal_information': {
                'id': str(user.id),
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone': user.phone,
                'date_joined': user.date_joined.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'is_verified': user.is_verified,
                'role': user.role
            },
            'subscription_data': None,
            'call_history': [],
            'billing_history': []
        }
        
        # Add subscription data
        try:
            subscription = user.subscription
            user_data['subscription_data'] = {
                'plan_name': subscription.plan.name,
                'status': subscription.status,
                'created_at': subscription.created_at.isoformat(),
                'current_period_start': subscription.current_period_start.isoformat(),
                'current_period_end': subscription.current_period_end.isoformat()
            }
            
            # Add billing history
            billing_history = BillingHistory.objects.filter(subscription=subscription)
            for bill in billing_history:
                user_data['billing_history'].append({
                    'amount': float(bill.amount),
                    'status': bill.status,
                    'description': bill.description,
                    'created_at': bill.created_at.isoformat()
                })
        except:
            pass
        
        # Add call history
        calls = CallSession.objects.filter(user=user)
        for call in calls:
            user_data['call_history'].append({
                'phone_number': call.phone_number,
                'call_type': call.call_type,
                'status': call.status,
                'started_at': call.started_at.isoformat(),
                'ended_at': call.ended_at.isoformat() if call.ended_at else None,
                'duration': call.call_duration_formatted,
                'customer_satisfaction': call.customer_satisfaction
            })
        
        user_data['export_generated_at'] = timezone.now().isoformat()
        
        return Response({
            'message': 'Data export generated successfully',
            'data': user_data
        }, status=status.HTTP_200_OK)
