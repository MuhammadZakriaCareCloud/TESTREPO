# 🔑 Admin Access Guide & API Testing

## 👨‍💼 Admin User Information

### ✅ Created Admin User:
- **Email**: `admin@testcenter.com`
- **Password**: `admin123`
- **Role**: Superuser/Admin
- **Access**: Full system access

---

## 🌐 Access Points

### 1. **Django Admin Panel**
- **URL**: http://127.0.0.1:8000/admin/
- **Login**: admin@testcenter.com / admin123
- **Features**: 
  - Manage users
  - View/edit subscription plans
  - Monitor billing history
  - System administration

### 2. **API Endpoints** (For Development/Testing)

#### Public Endpoints (No Auth Required):
```
GET  http://127.0.0.1:8000/api/subscriptions/api/plans/
```

#### Authenticated Endpoints (Token Required):
```
GET  http://127.0.0.1:8000/api/subscriptions/api/manage/
GET  http://127.0.0.1:8000/api/subscriptions/api/billing-history/
GET  http://127.0.0.1:8000/api/subscriptions/api/payment-methods/
POST http://127.0.0.1:8000/api/subscriptions/api/usage/
```

---

## 🧪 How to Test APIs

### Method 1: Using Postman/Thunder Client
1. **Get JWT Token** first from Django admin or login endpoint
2. **Add Authorization Header**: `Bearer your-jwt-token`
3. **Test endpoints** one by one

### Method 2: Using our Test Script
```bash
python test_api_endpoints.py
```

### Method 3: Using Browser (Simple GET requests)
- Open: http://127.0.0.1:8000/api/subscriptions/api/plans/
- Should show JSON response with subscription plans

---

## 📊 Current System Data

### ✅ Available:
- **Users**: 15+ users in system
- **Subscription Plans**: 3 plans ready
  - Starter: $29/month
  - Pro: $99/month  
  - Enterprise: $299/month
- **API Endpoints**: 8+ endpoints working
- **Database**: All tables migrated

### 🔧 Test Results:
- ✅ Authentication: Working
- ✅ User management: Working
- ✅ Subscription management: Working
- ⚠️ Some API endpoints need debugging (500 errors)

---

## 🛠️ Quick Debugging

### If APIs return 500 errors:
1. **Check Django logs** in terminal
2. **Verify Stripe keys** in settings (can be test/placeholder)
3. **Test individual endpoints** in browser
4. **Use Django admin** to verify data exists

### Simple Test Commands:
```bash
# Check users
python manage.py shell -c "from django.contrib.auth import get_user_model; User=get_user_model(); print(f'Users: {User.objects.count()}')"

# Check plans  
python manage.py shell -c "from subscriptions.models import SubscriptionPlan; print(f'Plans: {SubscriptionPlan.objects.count()}')"

# Test API endpoint directly
python manage.py shell -c "from django.test import Client; c=Client(); print(c.get('/api/subscriptions/api/plans/').content)"
```

---

## 🎯 Ready to Use Features

### ✅ Working:
- Django admin access
- User authentication
- Subscription plan management
- Database operations
- Basic API structure

### 🔧 For Production:
- Add real Stripe keys
- Fix API endpoint errors
- Add frontend UI
- Configure webhooks

---

## 📞 Admin Access Summary:

**🌐 Admin Panel**: http://127.0.0.1:8000/admin/  
**👤 Username**: admin@testcenter.com  
**🔑 Password**: admin123  
**🚀 Server**: http://127.0.0.1:8000/  

**System ready for admin access and basic testing!** ✅
