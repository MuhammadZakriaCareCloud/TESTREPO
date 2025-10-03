from django.contrib.auth import get_user_model
from subscriptions.models import Subscription, SubscriptionPlan
from calls.models import CallSession
from django.utils import timezone
from datetime import timedelta
import random

User = get_user_model()

def create_test_data():
    # Get test user
    user = User.objects.get(email='testvoice@admin.com')
    print(f'Creating test data for user: {user.email}')

    # 1. Create subscription if not exists
    try:
        subscription = user.subscription
        print(f'User already has subscription: {subscription.plan.name}')
    except Subscription.DoesNotExist:
        # Get a subscription plan
        plan = SubscriptionPlan.objects.first()
        if plan:
            subscription = Subscription.objects.create(
                user=user,
                plan=plan,
                status='active',
                current_period_start=timezone.now(),
                current_period_end=timezone.now() + timedelta(days=30)
            )
            print(f'Created subscription: {plan.name}')

    # 2. Create test call sessions
    call_types = ['inbound', 'outbound']
    call_statuses = ['completed', 'answered', 'interested', 'converted', 'no_answer']
    phone_numbers = ['+1234567890', '+1987654321', '+1555666777', '+1444333222', '+1111222333']

    # Create calls for different days
    for i in range(15):  # 15 test calls
        days_ago = random.randint(0, 30)
        call_date = timezone.now() - timedelta(days=days_ago)
        
        call_type = random.choice(call_types)
        call = CallSession.objects.create(
            user=user,
            call_type=call_type,
            caller_number='+1800COMPANY' if call_type == 'inbound' else None,
            callee_number=random.choice(phone_numbers) if call_type == 'outbound' else None,
            status=random.choice(call_statuses),
            started_at=call_date,
            duration=random.randint(30, 600),  # 30 seconds to 10 minutes
            customer_satisfaction=random.randint(1, 5),
            outcome=random.choice(['interested', 'not_interested', 'callback', 'converted'])
        )

    print(f'Created 15 test call sessions')
    print(f'Total calls for user: {CallSession.objects.filter(user=user).count()}')
    print(f'Inbound calls: {CallSession.objects.filter(user=user, call_type="inbound").count()}')
    print(f'Outbound calls: {CallSession.objects.filter(user=user, call_type="outbound").count()}')

if __name__ == "__main__":
    create_test_data()
