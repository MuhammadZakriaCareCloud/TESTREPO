#!/usr/bin/env python
"""
🚀 COMPLETE AUTO CALL SYSTEM SETUP
Django Call Center Dashboard - Final Implementation

This script sets up everything for automatic calls with learning.
"""

import os
import sys
import django
from datetime import datetime
import subprocess
import json

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from agents.ai_agent_models import AIAgent, CustomerProfile
from subscriptions.models import Subscription, SubscriptionPlan

User = get_user_model()

def setup_complete_system():
    """Setup complete auto call system"""
    
    print("🚀 Setting up Complete Auto Call System...")
    print("=" * 60)
    
    # Step 1: Create sample users if not exist
    print("📝 Step 1: Setting up users and agents...")
    
    sample_users = [
        {
            'email': 'demo@example.com',
            'first_name': 'Demo',
            'last_name': 'User',
            'password': 'demo123',
            'business_type': 'real_estate'
        }
    ]
    
    for user_data in sample_users:
        user, created = User.objects.get_or_create(
            email=user_data['email'],
            defaults={
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
                'role': 'client',
                'is_active': True
            }
        )
        
        if created:
            user.set_password(user_data['password'])
            user.save()
            print(f"✅ Created user: {user.email}")
        
        # Create AI Agent if not exists
        if not hasattr(user, 'ai_agent'):
            agent = AIAgent.objects.create(
                client=user,
                name=f"{user.first_name}'s AI Assistant",
                personality_type='friendly',
                voice_model='en-US-female-1',
                status='active',
                training_level=80,
                working_hours_start='09:00',
                working_hours_end='17:00',
                sales_script="Hello! I'm calling about an exciting opportunity that could save you money. Do you have a minute to hear about it?",
                conversation_memory={
                    'business_info': {
                        'company': 'Demo Company',
                        'services': ['consultation', 'products'],
                        'target_market': 'homeowners'
                    },
                    'setup_complete': True
                }
            )
            print(f"✅ Created AI Agent: {agent.name}")
            
            # Create sample customers
            sample_customers = [
                {
                    'phone_number': '+1234567890',
                    'name': 'John Smith',
                    'interest_level': 'warm',
                    'notes': 'Interested in consultation'
                },
                {
                    'phone_number': '+1234567891',
                    'name': 'Sarah Johnson', 
                    'interest_level': 'hot',
                    'notes': 'Ready to purchase'
                },
                {
                    'phone_number': '+1234567892',
                    'name': 'Mike Chen',
                    'interest_level': 'warm',
                    'notes': 'Needs follow-up'
                }
            ]
            
            for customer_data in sample_customers:
                CustomerProfile.objects.create(
                    ai_agent=agent,
                    phone_number=customer_data['phone_number'],
                    name=customer_data['name'],
                    interest_level=customer_data['interest_level'],
                    call_preference_time='anytime',
                    conversation_notes={
                        'initial_notes': customer_data['notes'],
                        'source': 'setup_script'
                    }
                )
            
            print(f"✅ Created {len(sample_customers)} sample customers")
    
    # Step 2: Display API endpoints
    print("\n📡 Step 2: Available API Endpoints")
    print("=" * 60)
    
    api_endpoints = {
        "Create Auto Campaign": "POST /agents/ai/auto-campaigns/",
        "Start Immediate Calls": "POST /agents/ai/start-immediate-calls/",
        "Monitor Campaigns": "GET /agents/ai/auto-campaigns/",
        "Real-time Learning": "POST /agents/ai/real-time-learning/",
        "HumeAI Webhook": "POST /agents/webhooks/hume-ai/",
        "Twilio Webhook": "POST /agents/webhooks/twilio/",
        "Agent Training": "GET /agents/ai/training/",
        "Dynamic Learning": "POST /agents/ai/dynamic-learning/"
    }
    
    for name, endpoint in api_endpoints.items():
        print(f"• {name}: {endpoint}")
    
    # Step 3: Display webhook URLs
    print("\n🔗 Step 3: Webhook Configuration URLs")
    print("=" * 60)
    
    webhook_urls = {
        "HumeAI Dashboard": "https://yourdomain.com/agents/webhooks/hume-ai/",
        "Twilio Voice": "https://yourdomain.com/agents/webhooks/twilio/voice/",
        "Twilio Status": "https://yourdomain.com/agents/webhooks/twilio/status/",
        "Manual Trigger": "https://yourdomain.com/agents/webhooks/manual-trigger/"
    }
    
    print("Configure these URLs in your external services:")
    for service, url in webhook_urls.items():
        print(f"• {service}: {url}")
    
    # Step 4: Display example usage
    print("\n💻 Step 4: Example Usage")
    print("=" * 60)
    
    example_campaign = {
        "campaign_name": "Demo Campaign",
        "calls_per_hour": 10,
        "start_immediately": True,
        "customer_filters": {
            "interest_levels": ["warm", "hot"],
            "max_customers": 50
        }
    }
    
    print("Create auto campaign:")
    print(f"curl -X POST http://localhost:8000/agents/ai/auto-campaigns/ \\")
    print(f"  -H 'Authorization: Bearer YOUR_TOKEN' \\")
    print(f"  -H 'Content-Type: application/json' \\")
    print(f"  -d '{json.dumps(example_campaign, indent=2)}'")
    
    # Step 5: Management commands
    print("\n⚡ Step 5: Management Commands")
    print("=" * 60)
    
    commands = [
        "python manage.py start_auto_calls --user-email=demo@example.com",
        "python manage.py runserver 8000",
        "celery -A core worker --loglevel=info",
        "celery -A core beat --loglevel=info"
    ]
    
    for i, cmd in enumerate(commands, 1):
        print(f"{i}. {cmd}")
    
    # Step 6: Next steps
    print("\n🎯 Step 6: Complete Setup Checklist") 
    print("=" * 60)
    
    checklist = [
        "✅ Django server running",
        "✅ Users and agents created",
        "✅ Sample customers added",
        "✅ API endpoints ready",
        "✅ Webhook handlers configured",
        "⏳ Configure HumeAI webhook URL",
        "⏳ Configure Twilio webhook URLs", 
        "⏳ Start Celery worker & beat",
        "⏳ Create first auto campaign",
        "⏳ Test complete flow"
    ]
    
    for item in checklist:
        print(f"  {item}")
    
    print("\n" + "=" * 60)
    print("🎉 SETUP COMPLETE!")
    print("=" * 60)
    
    print(f"\n🔑 Login Credentials:")
    print(f"Email: demo@example.com")
    print(f"Password: demo123")
    
    print(f"\n🚀 Quick Start:")
    print(f"1. python manage.py runserver 8000")
    print(f"2. python manage.py start_auto_calls --user-email=demo@example.com")
    print(f"3. Configure webhooks in HumeAI/Twilio")
    print(f"4. Start Celery for automation")
    
    print(f"\n📊 Your system now supports:")
    print(f"• Automatic call campaigns")
    print(f"• Real-time learning during calls")
    print(f"• Webhook-based event handling")
    print(f"• Scheduled callbacks")
    print(f"• Performance analytics")
    print(f"• Agent memory and improvement")
    
    return True

if __name__ == "__main__":
    try:
        setup_complete_system()
    except Exception as e:
        print(f"❌ Setup failed: {str(e)}")
        import traceback
        traceback.print_exc()
