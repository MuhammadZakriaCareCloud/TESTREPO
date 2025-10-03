# 🚀 COMPLETE WEBHOOK CONFIGURATION GUIDE
# Step-by-step setup for HumeAI and Twilio

"""
STEP 1: GET YOUR DOMAIN/URL
==========================
"""

# Option A: Production Deployment
PRODUCTION_DOMAIN = "https://yourdomain.com"  # Replace with your actual domain

# Option B: Local Development (using ngrok)
"""
1. Download ngrok: https://ngrok.com/download
2. Run Django: python manage.py runserver 8000  
3. Run ngrok: ngrok http 8000
4. Copy HTTPS URL: https://abc123.ngrok.io
"""

LOCAL_DEVELOPMENT_URL = "https://abc123.ngrok.io"  # Replace with your ngrok URL

"""
STEP 2: HUME AI DASHBOARD CONFIGURATION
======================================
"""

# Go to: https://platform.hume.ai/dashboard/webhooks
HUME_AI_SETTINGS = {
    "webhook_name": "Django AI Agent Learning",
    "webhook_url": f"{PRODUCTION_DOMAIN}/agents/webhooks/hume-ai/",
    # For local development: f"{LOCAL_DEVELOPMENT_URL}/agents/webhooks/hume-ai/",
    
    "http_method": "POST",
    "content_type": "application/json",
    
    "events_to_subscribe": [
        "conversation.objection_detected",      # ✅ Customer objection
        "conversation.sentiment_changed",       # ✅ Mood change  
        "conversation.successful_response",     # ✅ Good response
        "conversation.ended",                   # ✅ Call finished
        "conversation.customer_engaged",        # ✅ Customer interested
        "conversation.agent_response_rated"     # ✅ Response effectiveness
    ],
    
    "authentication": {
        "type": "Bearer Token",
        "header_name": "Authorization", 
        "header_value": "Bearer your_webhook_secret_token"
    }
}

"""
STEP 3: TWILIO CONSOLE CONFIGURATION  
====================================
"""

# Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
TWILIO_PHONE_NUMBER_SETTINGS = {
    "voice_configuration": {
        "webhook_url": f"{PRODUCTION_DOMAIN}/agents/webhooks/twilio/voice/",
        "http_method": "POST",
        "status_callback_url": f"{PRODUCTION_DOMAIN}/agents/webhooks/twilio/status/",
        "status_callback_method": "POST",
        "status_callback_events": [
            "initiated", "ringing", "answered", 
            "completed", "busy", "no-answer"
        ]
    }
}

# Go to: https://console.twilio.com/us1/develop/voice/manage/twiml-apps  
TWILIO_TWIML_APP_SETTINGS = {
    "app_name": "AI Agent Call Center",
    "voice_request_url": f"{PRODUCTION_DOMAIN}/agents/webhooks/twilio/voice/",
    "voice_request_method": "POST", 
    "status_callback_url": f"{PRODUCTION_DOMAIN}/agents/webhooks/twilio/status/",
    "status_callback_method": "POST"
}

"""
STEP 4: EXACT URLS TO USE
========================
"""

# Replace 'yourdomain.com' with your actual domain
WEBHOOK_URLS_TO_CONFIGURE = {
    # HumeAI Dashboard → Webhooks → Add New Webhook
    "hume_ai_webhook": "https://yourdomain.com/agents/webhooks/hume-ai/",
    
    # Twilio Console → Phone Numbers → Your Number → Voice Configuration
    "twilio_voice_webhook": "https://yourdomain.com/agents/webhooks/twilio/voice/",
    "twilio_status_callback": "https://yourdomain.com/agents/webhooks/twilio/status/",
    
    # For testing purposes
    "manual_trigger": "https://yourdomain.com/agents/webhooks/manual-trigger/"
}

"""
STEP 5: TESTING CONFIGURATION
=============================
"""

# Test HumeAI webhook
TEST_HUME_AI = """
curl -X POST https://yourdomain.com/agents/webhooks/hume-ai/ \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your_token" \\
  -d '{
    "event_type": "customer_objection_detected",
    "conversation_id": "test_conv_123", 
    "objection_text": "This is too expensive",
    "agent_response": "I understand, let me show you the value",
    "customer_engagement_score": 7
  }'
"""

# Test Twilio webhook
TEST_TWILIO = """
curl -X POST https://yourdomain.com/agents/webhooks/twilio/status/ \\
  -d "CallStatus=completed&CallSid=test_call_123&CallDuration=120"
"""

"""
STEP 6: VERIFICATION CHECKLIST
==============================
"""

VERIFICATION_CHECKLIST = {
    "hume_ai": [
        "✅ Webhook URL added in HumeAI dashboard",
        "✅ Events selected (objection, sentiment, success, ended)",
        "✅ Authentication configured",
        "✅ Test webhook returns 200 OK"
    ],
    
    "twilio": [
        "✅ Voice webhook URL set in phone number config",
        "✅ Status callback URL configured", 
        "✅ TwiML app configured (if using)",
        "✅ Test call triggers webhook"
    ],
    
    "django": [
        "✅ Webhook URLs working (returns 200)",
        "✅ Database receives learning data",
        "✅ Agent memory gets updated",
        "✅ Logs show webhook processing"
    ]
}

"""
STEP 7: MONITORING & DEBUGGING
==============================
"""

# Django logs to monitor
MONITORING_COMMANDS = """
# Check webhook calls
tail -f logs/django.log | grep webhook

# Check learning data updates  
python manage.py shell
>>> from agents.models import AIAgent
>>> agent = AIAgent.objects.first()
>>> print(agent.conversation_memory['automatic_learning'])

# Check call sessions
>>> from agents.models import CallSession  
>>> recent_calls = CallSession.objects.order_by('-created_at')[:5]
>>> for call in recent_calls:
>>>     print(f"{call.twilio_call_sid}: {call.outcome}")
"""

# Common issues and solutions
TROUBLESHOOTING = {
    "webhook_not_called": [
        "Check if URLs are correct",
        "Verify ngrok is running (for local dev)",
        "Check firewall/security groups", 
        "Confirm webhook is enabled in HumeAI/Twilio"
    ],
    
    "webhook_returns_error": [
        "Check Django logs for errors",
        "Verify database connections",
        "Check authentication tokens",
        "Ensure proper request format"
    ],
    
    "learning_not_working": [
        "Verify call session exists",
        "Check agent permissions",
        "Confirm webhook data format",
        "Check learning API responses"
    ]
}

print("🎯 EXACT CONFIGURATION STEPS:")
print("1. Replace 'yourdomain.com' with your actual domain")
print("2. Configure HumeAI webhook URL")  
print("3. Configure Twilio voice & status webhooks")
print("4. Test with curl commands")
print("5. Monitor Django logs")
print("6. Verify learning data is saved")

print("\n🚀 YOUR WEBHOOK URLS:")
for name, url in WEBHOOK_URLS_TO_CONFIGURE.items():
    print(f"{name}: {url}")
    
print("\n✅ Setup complete - Agent will learn automatically!")
