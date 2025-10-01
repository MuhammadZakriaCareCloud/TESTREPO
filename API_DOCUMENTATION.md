# Call Center Dashboard API Documentation

## Overview
This Django backend provides a comprehensive call center dashboard system with role-based access, Stripe-powered subscriptions, Twilio integration for calls, and HomeAI assistance.

## Features
- **Role-based Authentication**: Admin, User, Agent roles
- **Subscription Management**: Stripe-powered billing
- **Call Management**: Twilio integration for phone calls
- **AI Assistance**: HomeAI integration for call support
- **Dashboard Analytics**: Real-time statistics and performance metrics
- **Agent Management**: Performance tracking and status management

## Authentication
All API endpoints require JWT authentication (except webhooks). Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication (`/api/auth/`)
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/logout/` - Logout user
- `POST /api/auth/refresh/` - Refresh JWT token
- `POST /api/auth/password/reset/` - Request password reset
- `POST /api/auth/password/reset/confirm/` - Confirm password reset

### Subscriptions (`/api/subscriptions/`)
- `GET /api/subscriptions/plans/` - List all subscription plans
- `POST /api/subscriptions/create/` - Create new subscription
- `GET /api/subscriptions/current/` - Get current user's subscription
- `GET /api/subscriptions/billing-history/` - Get billing history
- `POST /api/subscriptions/cancel/` - Cancel subscription
- `PUT /api/subscriptions/update/` - Update subscription
- `POST /api/subscriptions/stripe-webhook/` - Stripe webhook endpoint (no auth required)

### Dashboard (`/api/dashboard/`)
- `GET /api/dashboard/stats/` - Get dashboard statistics (role-based)
- `GET /api/dashboard/quick-actions/` - Get quick actions for dashboard
- `GET /api/dashboard/admin/subscriptions/` - Admin: View all subscriptions
- `GET /api/dashboard/admin/agents/` - Admin: View all agents
- `GET /api/dashboard/admin/users/` - Admin: View all users

### Calls (`/api/calls/`)
- `GET /api/calls/sessions/` - Get call sessions (role-based)
- `GET /api/calls/queue/` - Get current call queue status
- `POST /api/calls/start-call/` - Start a new call session
- `POST /api/calls/twilio-webhook/` - Twilio webhook for call events (no auth required)
- `POST /api/calls/ai-assistance/` - Get AI assistance during calls
- `GET /api/calls/quick-actions/` - Get quick actions for calls

### Agents (`/api/agents/`)
- `GET /api/agents/profile/` - Get agent profile
- `PATCH /api/agents/profile/` - Update agent profile
- `POST /api/agents/status/` - Update agent status
- `GET /api/agents/performance/` - Get agent performance statistics
- `GET /api/agents/call-history/` - Get agent call history

## Role-based Access

### Admin Role
- Full access to all endpoints
- Can view system-wide statistics
- Can manage all users, agents, and subscriptions
- Dashboard shows comprehensive analytics

### Agent Role
- Can manage their own profile and status
- Can view and manage assigned calls
- Can access AI assistance during calls
- Dashboard shows agent-specific metrics

### User Role
- Can manage their own subscription
- Can view their own call history
- Limited dashboard with user-specific data

## Sample Requests

### Register a New User
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure_password",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user"
  }'
```

### Create a Subscription
```bash
curl -X POST http://localhost:8000/api/subscriptions/create/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "plan_id": "plan_basic_monthly",
    "payment_method_id": "pm_card_visa"
  }'
```

### Start a Call
```bash
curl -X POST http://localhost:8000/api/calls/start-call/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "phone_number": "+1234567890",
    "call_type": "outbound",
    "priority": "medium"
  }'
```

### Get Dashboard Stats
```bash
curl -X GET http://localhost:8000/api/dashboard/stats/ \
  -H "Authorization: Bearer <token>"
```

## Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
# Basic Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=sqlite:///db.sqlite3

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_LIVE_MODE=False

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# HomeAI Integration
HOMEAI_API_KEY=your_homeai_api_key
HOMEAI_API_URL=https://api.homeai.com/v1

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Create Environment File**
   ```bash
   cp .env.example .env
   # Edit .env with your actual configuration
   ```

3. **Run Migrations**
   ```bash
   python manage.py migrate
   ```

4. **Create Stripe Products** (Development)
   ```bash
   python manage.py create_stripe_products
   ```

5. **Create Sample Data** (Optional)
   ```bash
   python manage.py create_sample_data
   ```

6. **Create Superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start Development Server**
   ```bash
   python manage.py runserver
   ```

## API Documentation
- Swagger UI: http://localhost:8000/swagger/
- ReDoc: http://localhost:8000/redoc/
- Admin Panel: http://localhost:8000/admin/

## Production Considerations

1. **Security**
   - Set `DEBUG=False` in production
   - Use strong `SECRET_KEY`
   - Configure proper `ALLOWED_HOSTS`
   - Use HTTPS in production
   - Set up proper CORS settings

2. **Database**
   - Use PostgreSQL in production
   - Set up database backups
   - Configure connection pooling

3. **Monitoring**
   - Set up logging
   - Configure error tracking (Sentry)
   - Monitor API performance

4. **Webhooks**
   - Configure proper webhook endpoints for Stripe and Twilio
   - Use webhook signing verification
   - Handle webhook retries properly

## Support
For API support or questions, refer to the Swagger documentation at `/swagger/` or contact the development team.
