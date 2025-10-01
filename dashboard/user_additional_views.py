from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from PIL import Image
import os

User = get_user_model()


class UserAvatarUploadAPIView(APIView):
    """Upload and manage user avatar"""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'avatar',
                openapi.IN_FORM,
                description="Avatar image file (JPG, PNG, max 5MB)",
                type=openapi.TYPE_FILE,
                required=True
            )
        ],
        responses={
            200: "Avatar uploaded successfully",
            400: "Bad request",
            401: "Unauthorized"
        },
        operation_description="Upload user avatar image",
        tags=['User Dashboard'],
        security=[{'Bearer': []}]
    )
    def post(self, request):
        user = request.user
        
        if 'avatar' not in request.FILES:
            return Response({
                'error': 'Avatar file is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        avatar_file = request.FILES['avatar']
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png']
        if avatar_file.content_type not in allowed_types:
            return Response({
                'error': 'Only JPG and PNG files are allowed'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file size (5MB max)
        max_size = 5 * 1024 * 1024  # 5MB
        if avatar_file.size > max_size:
            return Response({
                'error': 'File size cannot exceed 5MB'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Delete old avatar if exists
        if user.avatar:
            try:
                if os.path.isfile(user.avatar.path):
                    os.remove(user.avatar.path)
            except:
                pass
        
        # Save new avatar
        user.avatar = avatar_file
        user.save()
        
        # Optionally resize image
        try:
            if user.avatar:
                img = Image.open(user.avatar.path)
                if img.height > 300 or img.width > 300:
                    img.thumbnail((300, 300), Image.Resampling.LANCZOS)
                    img.save(user.avatar.path)
        except Exception as e:
            # If image processing fails, continue anyway
            pass
        
        return Response({
            'message': 'Avatar uploaded successfully',
            'avatar_url': user.avatar.url if user.avatar else None
        }, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        responses={
            200: "Avatar deleted successfully",
            401: "Unauthorized"
        },
        operation_description="Delete user avatar",
        tags=['User Dashboard'],
        security=[{'Bearer': []}]
    )
    def delete(self, request):
        user = request.user
        
        if user.avatar:
            try:
                if os.path.isfile(user.avatar.path):
                    os.remove(user.avatar.path)
            except:
                pass
            
            user.avatar = None
            user.save()
            
            return Response({
                'message': 'Avatar deleted successfully'
            }, status=status.HTTP_200_OK)
        
        return Response({
            'message': 'No avatar to delete'
        }, status=status.HTTP_200_OK)


class UserNotificationsAPIView(APIView):
    """User notifications management"""
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        parameters=[
            openapi.Parameter('unread_only', openapi.IN_QUERY, description="Show only unread notifications", type=openapi.TYPE_BOOLEAN),
            openapi.Parameter('page', openapi.IN_QUERY, description="Page number", type=openapi.TYPE_INTEGER),
        ],
        responses={
            200: "User notifications",
            401: "Unauthorized"
        },
        operation_description="Get user notifications",
        tags=['User Dashboard'],
        security=[{'Bearer': []}]
    )
    def get(self, request):
        user = request.user
        unread_only = request.query_params.get('unread_only', 'false').lower() == 'true'
        page = int(request.query_params.get('page', 1))
        
        # For now, we'll create mock notifications
        # In a real app, you'd have a Notification model
        notifications = [
            {
                'id': '1',
                'title': 'Welcome to Call Center Dashboard!',
                'message': 'Your account has been successfully created. Start by setting up your subscription.',
                'type': 'welcome',
                'is_read': False,
                'created_at': '2025-10-01T10:00:00Z',
                'action_url': '/dashboard/user/subscription/'
            },
            {
                'id': '2',
                'title': 'Subscription Payment Successful',
                'message': 'Your monthly subscription payment has been processed successfully.',
                'type': 'billing',
                'is_read': True,
                'created_at': '2025-09-15T09:30:00Z',
                'action_url': '/dashboard/user/subscription/'
            },
            {
                'id': '3',
                'title': 'Call Quality Improvement',
                'message': 'We\'ve upgraded our call quality systems. You should experience better audio clarity.',
                'type': 'feature',
                'is_read': False,
                'created_at': '2025-09-10T14:20:00Z',
                'action_url': None
            }
        ]
        
        # Filter unread if requested
        if unread_only:
            notifications = [n for n in notifications if not n['is_read']]
        
        # Pagination (mock)
        limit = 10
        start = (page - 1) * limit
        end = start + limit
        paginated_notifications = notifications[start:end]
        
        return Response({
            'notifications': paginated_notifications,
            'pagination': {
                'current_page': page,
                'total_count': len(notifications),
                'unread_count': len([n for n in notifications if not n['is_read']]),
                'total_pages': (len(notifications) + limit - 1) // limit,
                'per_page': limit
            }
        }, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'notification_id': openapi.Schema(type=openapi.TYPE_STRING, description='Notification ID to mark as read'),
                'mark_all_read': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='Mark all notifications as read')
            }
        ),
        responses={
            200: "Notification(s) marked as read",
            400: "Bad request",
            401: "Unauthorized"
        },
        operation_description="Mark notification(s) as read",
        tags=['User Dashboard'],
        security=[{'Bearer': []}]
    )
    def patch(self, request):
        notification_id = request.data.get('notification_id')
        mark_all_read = request.data.get('mark_all_read', False)
        
        if mark_all_read:
            # In a real app, you'd update all user's notifications
            return Response({
                'message': 'All notifications marked as read'
            }, status=status.HTTP_200_OK)
        elif notification_id:
            # In a real app, you'd update the specific notification
            return Response({
                'message': f'Notification {notification_id} marked as read'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Either notification_id or mark_all_read is required'
            }, status=status.HTTP_400_BAD_REQUEST)


class UserPreferencesAPIView(APIView):
    """User preferences and customization"""
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        responses={
            200: "User preferences",
            401: "Unauthorized"
        },
        operation_description="Get user dashboard preferences",
        tags=['User Dashboard'],
        security=[{'Bearer': []}]
    )
    def get(self, request):
        user = request.user
        
        # Mock preferences - in real app, store in user profile or separate model
        preferences = {
            'dashboard_layout': 'default',  # 'default', 'compact', 'detailed'
            'theme': 'light',              # 'light', 'dark', 'auto'
            'language': 'en',              # 'en', 'ur', 'ar', etc.
            'timezone': 'UTC',             # User timezone
            'date_format': 'DD/MM/YYYY',   # Date format preference
            'time_format': '24h',          # '12h' or '24h'
            'currency': 'USD',             # Currency for billing display
            'dashboard_widgets': [
                'subscription_status',
                'recent_calls',
                'call_statistics',
                'billing_summary',
                'quick_actions'
            ],
            'call_settings': {
                'auto_answer': False,
                'call_recording': True,
                'ai_assistance': True,
                'noise_cancellation': True
            },
            'notification_settings': {
                'desktop_notifications': True,
                'sound_notifications': True,
                'email_digest': 'daily',  # 'disabled', 'daily', 'weekly'
                'marketing_emails': False
            }
        }
        
        return Response({
            'preferences': preferences
        }, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'dashboard_layout': openapi.Schema(type=openapi.TYPE_STRING),
                'theme': openapi.Schema(type=openapi.TYPE_STRING),
                'language': openapi.Schema(type=openapi.TYPE_STRING),
                'timezone': openapi.Schema(type=openapi.TYPE_STRING),
                'date_format': openapi.Schema(type=openapi.TYPE_STRING),
                'time_format': openapi.Schema(type=openapi.TYPE_STRING),
                'currency': openapi.Schema(type=openapi.TYPE_STRING),
                'dashboard_widgets': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Items(type=openapi.TYPE_STRING)),
                'call_settings': openapi.Schema(type=openapi.TYPE_OBJECT),
                'notification_settings': openapi.Schema(type=openapi.TYPE_OBJECT)
            }
        ),
        responses={
            200: "Preferences updated successfully",
            400: "Bad request",
            401: "Unauthorized"
        },
        operation_description="Update user dashboard preferences",
        tags=['User Dashboard'],
        security=[{'Bearer': []}]
    )
    def patch(self, request):
        user = request.user
        updated_preferences = []
        
        # In a real app, you'd save these to user profile or preferences model
        valid_preferences = [
            'dashboard_layout', 'theme', 'language', 'timezone',
            'date_format', 'time_format', 'currency', 'dashboard_widgets',
            'call_settings', 'notification_settings'
        ]
        
        for pref in valid_preferences:
            if pref in request.data:
                updated_preferences.append(pref)
                # Save preference logic here
        
        return Response({
            'message': 'Preferences updated successfully',
            'updated_preferences': updated_preferences
        }, status=status.HTTP_200_OK)
