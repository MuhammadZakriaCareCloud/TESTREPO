from django.urls import path
from . import views

urlpatterns = [
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('me/', views.current_user, name='current-user'),
    
    # Admin role management
    path('change-role/', views.change_user_role, name='change-user-role'),
    path('admins/', views.admin_users, name='admin-users'),
    path('regular-users/', views.regular_users, name='regular-users'),
    path('deactivate-user/', views.deactivate_user, name='deactivate-user'),
]
