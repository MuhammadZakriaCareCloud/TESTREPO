# AI Agent Complete CRUD System - API Documentation

## 🎯 Overview

Aapke Django backend mein ab **complete CRUD system** implement ho gaya hai AI Agents, Customer Profiles, aur Scheduled Callbacks ke liye. Har component ka complete Create, Read, Update, Delete functionality available hai.

## 📊 Available CRUD Operations

### 1. **AI Agent CRUD** - Complete Agent Management

#### **List & Create AI Agents**
```http
GET  /api/agents/ai/           # List all agents
POST /api/agents/ai/           # Create new agent
```

**Create Agent Example:**
```json
POST /api/agents/ai/
{
  "name": "Sarah - Sales Expert",
  "personality_type": "friendly",
  "voice_model": "en-US-female-1",
  "working_hours_start": "09:00",
  "working_hours_end": "18:00",
  "max_daily_calls": 50,
  "business_info": {
    "company_name": "TechSolutions Inc",
    "product_description": "Cloud software for businesses"
  },
  "sales_goals": {
    "target_conversions": 100,
    "avg_deal_size": 1500
  },
  "initial_script": "Hi, this is Sarah from TechSolutions..."
}
```

#### **Agent Detail Operations**
```http
GET    /api/agents/ai/{id}/    # Get agent details
PUT    /api/agents/ai/{id}/    # Update agent completely
PATCH  /api/agents/ai/{id}/    # Partial update
DELETE /api/agents/ai/{id}/    # Delete agent
```

**Update Agent Example:**
```json
PUT /api/agents/ai/{agent-id}/
{
  "name": "Sarah - Advanced Sales AI",
  "personality_type": "persuasive",
  "status": "active",
  "max_daily_calls": 75,
  "business_info": {
    "company_name": "TechSolutions Inc",
    "updated_features": ["New AI features", "Better analytics"]
  }
}
```

#### **Bulk Agent Operations** (Admin Only)
```http
POST /api/agents/ai/bulk-actions/
```
**Bulk Actions:**
- `activate` - Activate multiple agents
- `pause` - Pause multiple agents  
- `reset_training` - Reset training for agents
- `delete_inactive` - Delete inactive agents

#### **Agent Statistics**
```http
GET /api/agents/ai/stats/?agent_id={id}&time_period=month
```

---

### 2. **Customer Profile CRUD** - Customer Management

#### **List & Create Customers**
```http
GET  /api/agents/ai/customers/           # List all customers
POST /api/agents/ai/customers/           # Create new customer
```

**Create Customer Example:**
```json
POST /api/agents/ai/customers/
{
  "phone_number": "+1234567890",
  "name": "John Smith",
  "email": "john@example.com",
  "interest_level": "warm",
  "call_preference_time": "afternoon",
  "communication_style": "professional",
  "preferences": {
    "preferred_language": "English",
    "budget_range": "$1000-5000",
    "decision_timeline": "3 months"
  },
  "notes": "Interested in cloud automation solutions"
}
```

#### **Customer Detail Operations**
```http
GET    /api/agents/ai/customers/{id}/    # Get customer details with call history
PUT    /api/agents/ai/customers/{id}/    # Update customer
PATCH  /api/agents/ai/customers/{id}/    # Partial update
DELETE /api/agents/ai/customers/{id}/    # Delete customer
```

**Customer Filtering:**
```http
GET /api/agents/ai/customers/?interest_level=hot&converted=false&search=john
```

---

### 3. **Scheduled Callback CRUD** - Callback Management

#### **List & Create Callbacks**
```http
GET  /api/agents/ai/callbacks/           # List all callbacks
POST /api/agents/ai/callbacks/           # Schedule new callback
```

**Schedule Callback Example:**
```json
POST /api/agents/ai/callbacks/
{
  "customer_phone": "+1234567890",
  "scheduled_datetime": "2025-10-02T14:30:00Z",
  "reason": "Follow-up on pricing discussion",
  "notes": "Customer wants to discuss enterprise package",
  "priority_level": 3,
  "expected_outcome": "Quote approval"
}
```

#### **Callback Detail Operations**
```http
GET    /api/agents/ai/callbacks/{id}/    # Get callback details
PUT    /api/agents/ai/callbacks/{id}/    # Update callback
PATCH  /api/agents/ai/callbacks/{id}/    # Partial update  
DELETE /api/agents/ai/callbacks/{id}/    # Delete callback
```

**Callback Filtering:**
```http
GET /api/agents/ai/callbacks/?status=scheduled&overdue=true&today=true
```

#### **Bulk Callback Operations**
```http
POST /api/agents/ai/callbacks/bulk-actions/
```
**Bulk Actions:**
- `complete` - Mark callbacks as completed
- `reschedule` - Reschedule multiple callbacks
- `cancel` - Cancel callbacks
- `delete_completed` - Delete completed callbacks

---

## 🔐 Authentication & Permissions

### **User Roles & Access:**
- **Client**: Can only see/manage their own AI agent and data
- **Admin**: Can see/manage all agents and perform bulk operations
- **Agent**: Can view and update their assigned agent data

### **Authentication:**
```javascript
// All requests require JWT token
headers: {
  'Authorization': 'Bearer your-jwt-token',
  'Content-Type': 'application/json'
}
```

---

## 💡 Complete CRUD Workflow Examples

### **1. Create Complete AI Agent Setup**
```javascript
// Step 1: Create AI Agent
const agentResponse = await fetch('/api/agents/ai/', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token },
  body: JSON.stringify({
    name: "My Sales AI",
    personality_type: "friendly",
    business_info: { company_name: "My Company" }
  })
});

const agent = await agentResponse.json();
console.log('Agent created:', agent.agent.id);

// Step 2: Add customers
const customerResponse = await fetch('/api/agents/ai/customers/', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token },
  body: JSON.stringify({
    phone_number: "+1234567890",
    name: "John Doe",
    interest_level: "hot"
  })
});

// Step 3: Schedule callback
const callbackResponse = await fetch('/api/agents/ai/callbacks/', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token },
  body: JSON.stringify({
    customer_phone: "+1234567890",
    scheduled_datetime: "2025-10-02T15:00:00Z",
    reason: "Initial sales call"
  })
});
```

### **2. Update Agent Performance**
```javascript  
// Update agent based on performance
const updateResponse = await fetch(`/api/agents/ai/${agentId}/`, {
  method: 'PATCH',
  headers: { 'Authorization': 'Bearer ' + token },
  body: JSON.stringify({
    status: "active",
    max_daily_calls: 100,
    personality_type: "persuasive"
  })
});
```

### **3. Manage Customer Journey**
```javascript
// Update customer interest level after call
const customerUpdate = await fetch(`/api/agents/ai/customers/${customerId}/`, {
  method: 'PATCH',
  headers: { 'Authorization': 'Bearer ' + token },
  body: JSON.stringify({
    interest_level: "converted",
    notes: "Customer purchased premium package"
  })
});

// Schedule follow-up callback
const followUpCallback = await fetch('/api/agents/ai/callbacks/', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token },
  body: JSON.stringify({
    customer_phone: customerPhone,
    scheduled_datetime: "2025-10-10T10:00:00Z",
    reason: "Onboarding call",
    priority_level: 4
  })
});
```

### **4. Bulk Operations** (Admin)
```javascript
// Bulk activate agents
const bulkResponse = await fetch('/api/agents/ai/bulk-actions/', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + adminToken },
  body: JSON.stringify({
    action: "activate",
    filters: { status: "training", training_level_gt: 50 }
  })
});

// Bulk reschedule overdue callbacks
const bulkCallbacks = await fetch('/api/agents/ai/callbacks/bulk-actions/', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token },
  body: JSON.stringify({
    action: "reschedule",
    filters: { overdue: true },
    new_datetime: "2025-10-02T09:00:00Z"
  })
});
```

---

## 📈 Response Formats

### **Success Response:**
```json
{
  "message": "Operation completed successfully",
  "data": { /* object data */ },
  "timestamp": "2025-10-01T12:00:00Z"
}
```

### **List Response:**
```json
{
  "items": [ /* array of objects */ ],
  "total_count": 150,
  "summary": {
    "active": 100,
    "inactive": 50
  }
}
```

### **Error Response:**
```json
{
  "error": "Detailed error message",
  "code": "VALIDATION_ERROR",
  "details": {
    "field_name": ["Field specific error"]
  }
}
```

---

## 🎯 Key Features

### ✅ **Complete CRUD Operations**
- Create, Read, Update, Delete for all entities
- Bulk operations for efficiency
- Advanced filtering and search
- Detailed statistics and analytics

### ✅ **Smart Relationships**
- Automatic customer profile creation
- Callback-customer linking
- Agent-customer relationship management
- Call history integration

### ✅ **Data Validation**
- Phone number validation
- Datetime validation
- Business logic enforcement
- Conflict detection

### ✅ **Security & Permissions**
- Role-based access control
- User isolation (clients see only their data)
- Admin privileges for bulk operations
- JWT authentication on all endpoints

### ✅ **Real-time Updates**
- Automatic status updates
- Performance metric calculations
- Relationship maintenance
- Activity logging

---

## 🚀 Ready for Production!

Aapka complete CRUD system ready hai! Har component ka full lifecycle management available hai:

1. **AI Agents** - Create, train, manage, delete
2. **Customers** - Add, update, track, remove  
3. **Callbacks** - Schedule, modify, complete, bulk manage
4. **Statistics** - Comprehensive analytics and reporting

**Next Steps:**
- Frontend integration with these APIs
- Real-time updates via WebSockets
- Advanced reporting dashboards
- Mobile app integration

All endpoints documented in Swagger: `http://localhost:8000/swagger/` 🎉
