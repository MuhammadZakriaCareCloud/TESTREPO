# HomeAI Voice & Twilio Calling Integration Guide

یہ document HomeAI API اور Twilio API کی complete integration کو explain کرتا ہے۔

## Overview

This Django backend integrates two powerful APIs:
- **HomeAI API**: AI-powered voice and conversation handling
- **Twilio API**: Real phone calling and telephony services

## API Endpoints

### 1. HomeAI Voice Configuration

#### Get Voice Settings
```
GET /api/agents/management/{agent_id}/voice/
```

**Response:**
```json
{
    "agent_id": "uuid",
    "agent_name": "Agent Name",
    "current_settings": {
        "voice_model": "en-US-female-1",
        "personality_type": "friendly",
        "response_speed": "fast",
        "language": "en-US"
    },
    "available_voices": [
        {
            "id": "en-US-female-1",
            "name": "Sarah (Professional Female)",
            "accent": "American"
        }
    ],
    "personality_options": [
        {
            "id": "friendly",
            "name": "Friendly & Casual",
            "description": "Warm and approachable tone"
        }
    ],
    "homeai_status": "connected"
}
```

#### Update Voice Settings
```
POST /api/agents/management/{agent_id}/voice/
```

**Request Body:**
```json
{
    "voice_model": "en-US-male-1",
    "personality_type": "professional",
    "conversation_style": "business-focused"
}
```

**Response:**
```json
{
    "message": "Voice configuration updated successfully",
    "homeai_persona_id": "persona_abc123",
    "voice_model": "en-US-male-1",
    "personality_type": "professional"
}
```

#### Test Voice Configuration
```
POST /api/agents/management/{agent_id}/voice/test/
```

**Request Body:**
```json
{
    "test_message": "Hello, this is a test of my voice configuration."
}
```

**Response:**
```json
{
    "test_successful": true,
    "agent_response": "Hello! I received your message...",
    "voice_url": "https://example.com/audio.mp3",
    "personality_detected": {
        "detected_tone": "professional",
        "confidence": 95,
        "emotion": "positive"
    },
    "response_time_ms": 150
}
```

### 2. Twilio Call Configuration

#### Get Call Settings
```
GET /api/agents/management/{agent_id}/calling/
```

**Response:**
```json
{
    "agent_id": "uuid",
    "agent_name": "Agent Name",
    "agent_type": "ai",
    "call_settings": {
        "auto_answer_inbound": true,
        "enable_call_recording": true,
        "call_timeout": 30,
        "max_call_duration": 1800,
        "enable_voicemail": true,
        "caller_id_number": "+1234567890"
    },
    "twilio_features": {
        "machine_detection": true,
        "call_screening": false,
        "call_forwarding": false,
        "conference_calls": false,
        "call_queuing": true
    },
    "phone_numbers": [
        {
            "number": "+1234567890",
            "type": "main",
            "active": true
        }
    ],
    "twilio_status": "connected"
}
```

#### Update Call Settings
```
POST /api/agents/management/{agent_id}/calling/
```

**Request Body:**
```json
{
    "call_settings": {
        "auto_answer_inbound": true,
        "enable_call_recording": true,
        "call_timeout": 45,
        "max_call_duration": 2400
    }
}
```

#### Test Call Configuration
```
POST /api/agents/management/{agent_id}/calling/test/
```

**Request Body:**
```json
{
    "test_number": "+1234567890"
}
```

**Response:**
```json
{
    "test_call_initiated": true,
    "call_sid": "CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "status": "queued",
    "test_number": "+1234567890",
    "estimated_duration": "30-60 seconds"
}
```

### 3. AI Voice Campaign Management

#### Start AI Voice Campaign
```
POST /api/agents/management/campaigns/start-ai/
```

**Request Body:**
```json
{
    "campaign_id": "uuid",
    "agent_id": "uuid",
    "voice_settings": {
        "personality": "professional",
        "call_objective": "sales"
    }
}
```

## Configuration

### Environment Variables (.env)

```bash
# HomeAI Configuration
HOMEAI_API_KEY=your-homeai-api-key-here
HOMEAI_BASE_URL=https://api.homeai.com/v1
HOMEAI_MODEL=gpt-4-voice

# Twilio Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid-here
TWILIO_AUTH_TOKEN=your-twilio-auth-token-here
TWILIO_PHONE_NUMBER=+1234567890
```

### Django Settings

```python
# HomeAI Settings
HOMEAI_API_KEY = config('HOMEAI_API_KEY', default='')
HOMEAI_BASE_URL = config('HOMEAI_BASE_URL', default='https://api.homeai.com/v1')
HOMEAI_MODEL = config('HOMEAI_MODEL', default='gpt-4-voice')

# Twilio Settings
TWILIO_ACCOUNT_SID = config('TWILIO_ACCOUNT_SID', default='')
TWILIO_AUTH_TOKEN = config('TWILIO_AUTH_TOKEN', default='')
TWILIO_PHONE_NUMBER = config('TWILIO_PHONE_NUMBER', default='')
```

## Usage Examples

### Python Client Example

```python
import requests

# Login and get token
login_response = requests.post(
    "http://127.0.0.1:8000/api/auth/login/",
    json={"email": "user@example.com", "password": "password"}
)
token = login_response.json()['tokens']['access']
headers = {"Authorization": f"Bearer {token}"}

# Configure HomeAI voice
voice_config = {
    "voice_model": "en-US-female-1",
    "personality_type": "friendly",
    "conversation_style": "conversational"
}
voice_response = requests.post(
    f"http://127.0.0.1:8000/api/agents/management/{agent_id}/voice/",
    headers=headers,
    json=voice_config
)

# Test voice configuration
test_response = requests.post(
    f"http://127.0.0.1:8000/api/agents/management/{agent_id}/voice/test/",
    headers=headers,
    json={"test_message": "Hello, how do I sound?"}
)

# Configure Twilio calling
call_config = {
    "call_settings": {
        "enable_call_recording": True,
        "call_timeout": 30
    }
}
call_response = requests.post(
    f"http://127.0.0.1:8000/api/agents/management/{agent_id}/calling/",
    headers=headers,
    json=call_config
)
```

### JavaScript/Frontend Example

```javascript
// Configure HomeAI Voice Settings
async function configureVoice(agentId, settings) {
    const response = await fetch(`/api/agents/management/${agentId}/voice/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
    });
    return response.json();
}

// Test Voice Configuration
async function testVoice(agentId, testMessage) {
    const response = await fetch(`/api/agents/management/${agentId}/voice/test/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test_message: testMessage })
    });
    return response.json();
}

// Usage
const voiceSettings = {
    voice_model: "en-US-female-1",
    personality_type: "professional"
};

configureVoice(agentId, voiceSettings)
    .then(result => console.log('Voice configured:', result));

testVoice(agentId, "Hello, this is a test message")
    .then(result => console.log('Voice test result:', result));
```

## Features

### HomeAI Integration Features

1. **Voice Model Selection**: Multiple voice options (male/female, different accents)
2. **Personality Configuration**: Friendly, Professional, Persuasive, Supportive, Custom
3. **Real-time Response Generation**: AI-powered conversation handling
4. **Voice Testing**: Test voice configuration before deployment
5. **Conversation Memory**: Agent learning and memory storage
6. **Sentiment Analysis**: Real-time emotion and intent detection
7. **Objection Handling**: Intelligent response to customer objections

### Twilio Integration Features

1. **Outbound Calling**: Automated phone calls to customers
2. **Inbound Call Handling**: Receive and route incoming calls
3. **Call Recording**: Automatic call recording for quality assurance
4. **Machine Detection**: Detect answering machines vs. humans
5. **Call Queuing**: Manage multiple simultaneous calls
6. **Conference Calls**: Multi-party conference calling
7. **SMS Integration**: Send follow-up messages
8. **Call Analytics**: Track call duration, success rates, etc.

## Testing

### Run Integration Tests

```bash
# Run the comprehensive test script
python test_homeai_twilio_integration.py
```

### Manual Testing

1. **Start Django Server**:
   ```bash
   python manage.py runserver
   ```

2. **Login and Get Token**:
   ```bash
   curl -X POST http://127.0.0.1:8000/api/auth/login/ \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com", "password": "password"}'
   ```

3. **Test HomeAI Voice Config**:
   ```bash
   curl -X GET http://127.0.0.1:8000/api/agents/management/{agent_id}/voice/ \
     -H "Authorization: Bearer {token}"
   ```

4. **Test Twilio Call Config**:
   ```bash
   curl -X GET http://127.0.0.1:8000/api/agents/management/{agent_id}/calling/ \
     -H "Authorization: Bearer {token}"
   ```

## Production Setup

### HomeAI API Setup

1. Get API key from HomeAI platform
2. Configure webhook endpoints for real-time responses
3. Set up voice model preferences
4. Configure conversation memory storage

### Twilio Setup

1. Create Twilio account and get credentials
2. Purchase phone numbers
3. Configure webhooks for call events
4. Set up call recording storage
5. Configure SMS capabilities

### Security Considerations

1. Store API keys securely in environment variables
2. Use HTTPS for all API communications
3. Implement rate limiting for API calls
4. Validate all phone numbers before calling
5. Log all call activities for audit trail

## Troubleshooting

### Common Issues

1. **HomeAI API Key Not Working**:
   - Check if API key is valid
   - Verify HomeAI account has sufficient credits
   - Check network connectivity

2. **Twilio Calls Failing**:
   - Verify Twilio credentials
   - Check phone number format (+1234567890)
   - Ensure account has sufficient balance
   - Check webhook URL accessibility

3. **Voice Test Not Working**:
   - Check if agent exists and is accessible
   - Verify user permissions
   - Check API endpoint URL

### Debug Mode

Enable debug logging in settings:

```python
LOGGING = {
    'version': 1,
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': 'voice_calling.log',
        },
    },
    'loggers': {
        'agents.homeai_integration': {
            'handlers': ['file'],
            'level': 'DEBUG',
        },
        'agents.twilio_service': {
            'handlers': ['file'],
            'level': 'DEBUG',
        },
    },
}
```

## API Response Codes

- **200**: Success
- **201**: Created successfully
- **400**: Bad request (invalid data)
- **401**: Unauthorized (invalid token)
- **404**: Agent not found
- **500**: Server error (API configuration issue)

## Conclusion

This integration provides a complete voice-enabled calling system using HomeAI for AI conversations and Twilio for actual phone calls. The system is designed to be scalable, secure, and easy to use.

For questions or support, check the API documentation or contact the development team.
