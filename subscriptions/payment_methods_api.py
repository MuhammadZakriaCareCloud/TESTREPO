from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import stripe
import logging

logger = logging.getLogger(__name__)

from .models import PaymentMethod
from .stripe_service import BillingService, WebhookService

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


class PaymentMethodsAPIView(APIView):
    """
    Payment Methods Management API - List and Add payment methods
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        tags=['User - Payment Methods'],
        operation_summary="List Payment Methods",
        operation_description="Get user's saved payment methods with safe data only",
        responses={
            200: openapi.Response(
                description="Payment methods list",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'success': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                        'message': openapi.Schema(type=openapi.TYPE_STRING),
                        'payment_methods': openapi.Schema(
                            type=openapi.TYPE_ARRAY,
                            items=openapi.Schema(
                                type=openapi.TYPE_OBJECT,
                                properties={
                                    'id': openapi.Schema(type=openapi.TYPE_STRING),
                                    'card_type': openapi.Schema(type=openapi.TYPE_STRING),
                                    'last_four': openapi.Schema(type=openapi.TYPE_STRING),
                                    'exp_month': openapi.Schema(type=openapi.TYPE_INTEGER),
                                    'exp_year': openapi.Schema(type=openapi.TYPE_INTEGER),
                                    'is_default': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                                    'display_name': openapi.Schema(type=openapi.TYPE_STRING),
                                    'expires': openapi.Schema(type=openapi.TYPE_STRING),
                                }
                            )
                        ),
                        'total_methods': openapi.Schema(type=openapi.TYPE_INTEGER),
                    }
                )
            ),
            401: "Authentication required"
        }
    )
    def get(self, request):
        """List user's payment methods - only safe metadata"""
        try:
            # Get from local database (safe data only)
            payment_methods = PaymentMethod.objects.filter(
                user=request.user,
                is_active=True
            ).order_by('-is_default', '-created_at')
            
            methods_data = []
            for pm in payment_methods:
                methods_data.append({
                    'id': str(pm.id),
                    'card_type': pm.card_type,
                    'last_four': pm.last_four,
                    'exp_month': pm.exp_month,
                    'exp_year': pm.exp_year,
                    'is_default': pm.is_default,
                    'display_name': f"{pm.card_type.title()} •••• {pm.last_four}",
                    'expires': f"{pm.exp_month:02d}/{pm.exp_year}",
                    'created_at': pm.created_at.isoformat(),
                })
            
            return Response({
                'success': True,
                'message': f'Found {len(methods_data)} payment methods',
                'payment_methods': methods_data,
                'total_methods': len(methods_data)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching payment methods for user {request.user.id}: {str(e)}")
            return Response({
                'success': False,
                'error': f'Error fetching payment methods: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @swagger_auto_schema(
        tags=['User - Payment Methods'],
        operation_summary="Add Payment Method",
        operation_description="Add new payment method using Stripe payment method ID from frontend",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['payment_method_id'],
            properties={
                'payment_method_id': openapi.Schema(
                    type=openapi.TYPE_STRING, 
                    description="Stripe payment method ID from frontend (e.g., pm_1ABC123xyz)"
                ),
                'set_as_default': openapi.Schema(
                    type=openapi.TYPE_BOOLEAN, 
                    description="Set as default payment method",
                    default=False
                )
            }
        ),
        responses={
            201: "Payment method added successfully",
            400: "Bad request - validation error",
            401: "Authentication required"
        }
    )
    def post(self, request):
        """Add new payment method - receives token from frontend"""
        try:
            payment_method_id = request.data.get('payment_method_id')
            set_as_default = request.data.get('set_as_default', False)
            
            if not payment_method_id:
                return Response({
                    'success': False,
                    'error': 'payment_method_id is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if payment method already exists
            existing = PaymentMethod.objects.filter(
                user=request.user,
                stripe_payment_method_id=payment_method_id,
                is_active=True
            ).first()
            
            if existing:
                return Response({
                    'success': False,
                    'error': 'Payment method already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Use existing service to attach payment method
            result = WebhookService.attach_payment_method(request.user, payment_method_id)
            
            if not result['success']:
                logger.error(f"Failed to attach payment method for user {request.user.id}: {result['error']}")
                return Response({
                    'success': False,
                    'error': result['error']
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Store payment method using existing service
            stored_pm = BillingService.store_payment_method(request.user, payment_method_id)
            
            if not stored_pm:
                return Response({
                    'success': False,
                    'error': 'Failed to store payment method details'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Set as default if requested
            if set_as_default:
                # Remove default from all others
                PaymentMethod.objects.filter(
                    user=request.user,
                    is_default=True
                ).exclude(id=stored_pm.id).update(is_default=False)
                
                # Set this as default
                stored_pm.is_default = True
                stored_pm.save()
                
                # Update in Stripe if customer exists
                if hasattr(request.user, 'stripe_customer_id') and request.user.stripe_customer_id:
                    try:
                        stripe.Customer.modify(
                            request.user.stripe_customer_id,
                            invoice_settings={
                                'default_payment_method': payment_method_id
                            }
                        )
                    except stripe.error.StripeError as e:
                        logger.warning(f"Failed to set default in Stripe: {str(e)}")
            
            logger.info(f"Payment method added successfully for user {request.user.id}")
            
            return Response({
                'success': True,
                'message': 'Payment method added successfully',
                'payment_method': {
                    'id': str(stored_pm.id),
                    'display_name': f"{stored_pm.card_type.title()} •••• {stored_pm.last_four}",
                    'is_default': stored_pm.is_default
                },
                'set_as_default': stored_pm.is_default
            }, status=status.HTTP_201_CREATED)
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error adding payment method: {str(e)}")
            return Response({
                'success': False,
                'error': f'Payment processing error: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error adding payment method for user {request.user.id}: {str(e)}")
            return Response({
                'success': False,
                'error': f'Error adding payment method: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PaymentMethodDetailAPIView(APIView):
    """
    Individual Payment Method Management - Update and Delete
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @swagger_auto_schema(
        tags=['User - Payment Methods'],
        operation_summary="Update Payment Method",
        operation_description="Update payment method settings (set as default)",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'set_as_default': openapi.Schema(
                    type=openapi.TYPE_BOOLEAN,
                    description="Set this payment method as default"
                )
            }
        ),
        responses={
            200: "Payment method updated successfully",
            400: "Bad request",
            404: "Payment method not found",
            401: "Authentication required"
        }
    )
    def put(self, request, pm_id):
        """Update payment method (mainly for setting as default)"""
        try:
            payment_method = PaymentMethod.objects.get(
                id=pm_id,
                user=request.user,
                is_active=True
            )
            
            set_as_default = request.data.get('set_as_default', False)
            
            if set_as_default:
                # Remove default from all others
                PaymentMethod.objects.filter(
                    user=request.user,
                    is_default=True
                ).exclude(id=payment_method.id).update(is_default=False)
                
                # Set this as default
                payment_method.is_default = True
                payment_method.save()
                
                # Update in Stripe if customer exists
                if hasattr(request.user, 'stripe_customer_id') and request.user.stripe_customer_id:
                    try:
                        stripe.Customer.modify(
                            request.user.stripe_customer_id,
                            invoice_settings={
                                'default_payment_method': payment_method.stripe_payment_method_id
                            }
                        )
                    except stripe.error.StripeError as e:
                        logger.warning(f"Failed to update default in Stripe: {str(e)}")
                
                logger.info(f"Payment method {pm_id} set as default for user {request.user.id}")
            
            return Response({
                'success': True,
                'message': 'Payment method updated successfully',
                'payment_method': {
                    'id': str(payment_method.id),
                    'display_name': f"{payment_method.card_type.title()} •••• {payment_method.last_four}",
                    'is_default': payment_method.is_default
                }
            }, status=status.HTTP_200_OK)
            
        except PaymentMethod.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Payment method not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error updating payment method {pm_id} for user {request.user.id}: {str(e)}")
            return Response({
                'success': False,
                'error': f'Error updating payment method: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @swagger_auto_schema(
        tags=['User - Payment Methods'],
        operation_summary="Remove Payment Method",
        operation_description="Remove payment method from user account (soft delete)",
        responses={
            200: "Payment method removed successfully",
            400: "Cannot remove default or last payment method",
            404: "Payment method not found",
            401: "Authentication required"
        }
    )
    def delete(self, request, pm_id):
        """Remove payment method (soft delete)"""
        try:
            payment_method = PaymentMethod.objects.get(
                id=pm_id,
                user=request.user,
                is_active=True
            )
            
            # Check if it's the only payment method
            total_methods = PaymentMethod.objects.filter(
                user=request.user,
                is_active=True
            ).count()
            
            if total_methods == 1:
                return Response({
                    'success': False,
                    'error': 'Cannot remove the last payment method. Add another payment method first.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if it's default - user must set another as default first
            if payment_method.is_default:
                return Response({
                    'success': False,
                    'error': 'Cannot remove default payment method. Set another payment method as default first.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Detach from Stripe
            try:
                stripe.PaymentMethod.detach(payment_method.stripe_payment_method_id)
                logger.info(f"Payment method detached from Stripe: {payment_method.stripe_payment_method_id}")
            except stripe.error.StripeError as e:
                # Continue with local deletion even if Stripe detach fails
                logger.warning(f"Failed to detach from Stripe but continuing: {str(e)}")
            
            # Soft delete - mark as inactive
            payment_method.is_active = False
            payment_method.save()
            
            logger.info(f"Payment method {pm_id} removed for user {request.user.id}")
            
            return Response({
                'success': True,
                'message': 'Payment method removed successfully'
            }, status=status.HTTP_200_OK)
            
        except PaymentMethod.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Payment method not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error removing payment method {pm_id} for user {request.user.id}: {str(e)}")
            return Response({
                'success': False,
                'error': f'Error removing payment method: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


"""
PAYMENT METHOD DATA STORAGE EXPLANATION
=====================================

This file explains exactly where payment method data is stored:

1. STRIPE STORAGE (Secure, Full Data):
   - Full card numbers (encrypted)
   - CVV codes
   - Billing addresses
   - Payment method tokens
   - Customer relationships

2. YOUR DATABASE STORAGE (Safe Metadata Only):
   - Payment method reference IDs
   - Card brand (visa, mastercard)
   - Last 4 digits only
   - Expiry month/year
   - Default status flags
   - User relationships

SECURITY: No sensitive data in your database!
"""

# Your PaymentMethod model stores ONLY safe data:
# 
# class PaymentMethod(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     
#     # ✅ SAFE DATA STORED IN YOUR DB:
#     stripe_payment_method_id = models.CharField(max_length=100)  # "pm_1ABC123xyz" (just reference)
#     card_type = models.CharField(max_length=20)                  # "visa" 
#     last_four = models.CharField(max_length=4)                   # "4242"
#     exp_month = models.IntegerField()                            # 12
#     exp_year = models.IntegerField()                             # 2025
#     is_default = models.BooleanField(default=False)             # True/False
#     is_active = models.BooleanField(default=True)               # True/False
#     
#     # ❌ SENSITIVE DATA NOT STORED IN YOUR DB:
#     # - Full card number (4242 4242 4242 4242)
#     # - CVV code (123)
#     # - PIN numbers
#     # - Full cardholder name
#     # - Complete billing address
