from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.AgentProfileAPIView.as_view(), name='agent-profile'),
    path('status/', views.AgentStatusAPIView.as_view(), name='agent-status'),
    path('performance/', views.AgentPerformanceAPIView.as_view(), name='agent-performance'),
    path('call-history/', views.AgentCallHistoryAPIView.as_view(), name='agent-call-history'),
]
