from django.db import models
from django.contrib.auth import get_user_model
import json
import uuid
from datetime import datetime, timedelta

User = get_user_model()


class AIAgent(models.Model):
    """
    Dedicated AI Agent for each client - complete sales automation
    Har client ka apna AI agent jo sab kuch handle karta hai
    """
    AGENT_STATUS_CHOICES = [
        ('training', 'Initial Training'),
        ('learning', 'Learning from Calls'),
        ('active', 'Fully Active'),
        ('optimizing', 'Performance Optimizing'),
        ('paused', 'Paused'),
    ]
    
    PERSONALITY_TYPES = [
        ('friendly', 'Friendly & Casual'),
        ('professional', 'Professional & Formal'),
        ('persuasive', 'Sales Focused'),
        ('supportive', 'Customer Support'),
        ('custom', 'Custom Trained'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.OneToOneField(User, on_delete=models.CASCADE, related_name='ai_agent')
    
    # Agent Identity
    name = models.CharField(max_length=100, help_text="Agent ka naam")
    personality_type = models.CharField(max_length=20, choices=PERSONALITY_TYPES, default='friendly')
    voice_model = models.CharField(max_length=50, default='en-US-female-1')
    
    # Agent Status & Learning
    status = models.CharField(max_length=20, choices=AGENT_STATUS_CHOICES, default='training')
    training_level = models.IntegerField(default=0, help_text="0-100 training completion")
    calls_handled = models.IntegerField(default=0)
    successful_conversions = models.IntegerField(default=0)
    
    # Learning Data
    conversation_memory = models.JSONField(default=dict, help_text="Agent ki memory aur learning")
    customer_preferences = models.JSONField(default=dict, help_text="Customer behavior patterns")
    sales_script = models.TextField(blank=True, help_text="Dynamic sales script")
    
    # Performance Metrics
    conversion_rate = models.FloatField(default=0.0)
    avg_call_duration = models.FloatField(default=0.0)
    customer_satisfaction = models.FloatField(default=0.0)
    
    # Configuration
    working_hours_start = models.TimeField(default='09:00')
    working_hours_end = models.TimeField(default='18:00')
    max_daily_calls = models.IntegerField(default=50)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'ai_agents'
        verbose_name = 'AI Agent'
        verbose_name_plural = 'AI Agents'
    
    def __str__(self):
        return f"{self.name} - {self.client.email}"
    
    @property
    def is_ready_for_calls(self):
        """Check if agent is ready for live calls"""
        return self.status in ['active', 'learning'] and self.training_level >= 20
    
    def update_learning_data(self, call_data):
        """Update agent learning from call experience"""
        # Add call insights to memory
        if 'learning_insights' not in self.conversation_memory:
            self.conversation_memory['learning_insights'] = []
        
        self.conversation_memory['learning_insights'].append({
            'timestamp': datetime.now().isoformat(),
            'call_outcome': call_data.get('outcome'),
            'customer_response': call_data.get('customer_response'),
            'improvement_notes': call_data.get('notes')
        })
        
        # Update performance
        self.calls_handled += 1
        if call_data.get('outcome') == 'successful':
            self.successful_conversions += 1
        
        self.conversion_rate = (self.successful_conversions / self.calls_handled) * 100
        self.save()


class CustomerProfile(models.Model):
    """
    Customer profile maintained by AI Agent
    Agent har customer ka detailed profile maintain karta hai
    """
    INTEREST_LEVELS = [
        ('cold', 'Not Interested'),
        ('warm', 'Somewhat Interested'),
        ('hot', 'Very Interested'),
        ('converted', 'Purchased'),
    ]
    
    CALL_PREFERENCES = [
        ('morning', 'Morning (9-12)'),
        ('afternoon', 'Afternoon (12-17)'),
        ('evening', 'Evening (17-20)'),
        ('anytime', 'Anytime'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ai_agent = models.ForeignKey(AIAgent, on_delete=models.CASCADE, related_name='customer_profiles')
    
    # Customer Info
    phone_number = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    
    # Behavioral Data
    interest_level = models.CharField(max_length=20, choices=INTEREST_LEVELS, default='warm')
    call_preference_time = models.CharField(max_length=20, choices=CALL_PREFERENCES, default='anytime')
    communication_style = models.CharField(max_length=50, blank=True, help_text="Formal, casual, etc")
    
    # Interaction History
    total_calls = models.IntegerField(default=0)
    successful_calls = models.IntegerField(default=0)
    last_interaction = models.DateTimeField(null=True, blank=True)
    next_followup = models.DateTimeField(null=True, blank=True)
    
    # Learning Data
    conversation_notes = models.JSONField(default=dict)
    preferences = models.JSONField(default=dict, help_text="Customer ki pasand, requirements")
    objections = models.JSONField(default=list, help_text="Customer ke objections aur responses")
    
    # Status
    is_do_not_call = models.BooleanField(default=False)
    is_converted = models.BooleanField(default=False)
    conversion_date = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'customer_profiles'
        unique_together = ['ai_agent', 'phone_number']
    
    def __str__(self):
        return f"{self.name or self.phone_number} - {self.interest_level}"
    
    def schedule_callback(self, callback_time):
        """Schedule next callback"""
        self.next_followup = callback_time
        self.save()
    
    def update_interaction(self, call_outcome, notes=None):
        """Update customer interaction data"""
        self.total_calls += 1
        self.last_interaction = datetime.now()
        
        if call_outcome == 'successful':
            self.successful_calls += 1
        elif call_outcome == 'converted':
            self.is_converted = True
            self.conversion_date = datetime.now()
            self.interest_level = 'converted'
        
        if notes:
            if 'call_notes' not in self.conversation_notes:
                self.conversation_notes['call_notes'] = []
            self.conversation_notes['call_notes'].append({
                'date': datetime.now().isoformat(),
                'outcome': call_outcome,
                'notes': notes
            })
        
        self.save()


class CallSession(models.Model):
    """
    Enhanced Call Session with AI Agent integration
    """
    CALL_TYPES = [
        ('inbound', 'Inbound'),
        ('outbound', 'Outbound'),
        ('scheduled', 'Scheduled Callback'),
        ('followup', 'Follow-up'),
    ]
    
    CALL_OUTCOMES = [
        ('answered', 'Call Answered'),
        ('no_answer', 'No Answer'),
        ('busy', 'Line Busy'),
        ('interested', 'Customer Interested'),
        ('callback_requested', 'Callback Requested'),
        ('not_interested', 'Not Interested'),
        ('converted', 'Sale Completed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ai_agent = models.ForeignKey(AIAgent, on_delete=models.CASCADE, related_name='call_sessions')
    customer_profile = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name='call_sessions')
    
    # Call Details
    call_type = models.CharField(max_length=20, choices=CALL_TYPES)
    phone_number = models.CharField(max_length=20)
    
    # Timing
    initiated_at = models.DateTimeField(auto_now_add=True)
    connected_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.IntegerField(default=0)
    
    # Call Outcome
    outcome = models.CharField(max_length=30, choices=CALL_OUTCOMES)
    customer_response = models.TextField(blank=True)
    agent_notes = models.TextField(blank=True)
    
    # AI Generated Data
    conversation_transcript = models.TextField(blank=True)
    sentiment_analysis = models.JSONField(default=dict)
    extracted_insights = models.JSONField(default=dict)
    
    # Follow-up
    followup_scheduled = models.BooleanField(default=False)
    followup_datetime = models.DateTimeField(null=True, blank=True)
    followup_reason = models.CharField(max_length=200, blank=True)
    
    # Twilio Integration
    twilio_call_sid = models.CharField(max_length=100, blank=True)
    recording_url = models.URLField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ai_call_sessions'
        ordering = ['-initiated_at']
    
    def __str__(self):
        return f"{self.phone_number} - {self.outcome} - {self.initiated_at.date()}"
    
    @property
    def duration_formatted(self):
        """Format duration in MM:SS"""
        if self.duration_seconds:
            minutes = self.duration_seconds // 60
            seconds = self.duration_seconds % 60
            return f"{minutes:02d}:{seconds:02d}"
        return "00:00"


class AIAgentTraining(models.Model):
    """
    Training sessions and data for AI Agent
    """
    TRAINING_TYPES = [
        ('initial', 'Initial Setup Training'),
        ('script', 'Sales Script Training'),
        ('objection_handling', 'Objection Handling'),
        ('product_knowledge', 'Product Knowledge'),
        ('real_time', 'Real-time Learning'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ai_agent = models.ForeignKey(AIAgent, on_delete=models.CASCADE, related_name='training_sessions')
    
    training_type = models.CharField(max_length=30, choices=TRAINING_TYPES)
    training_data = models.JSONField(help_text="Training content and scripts")
    completion_percentage = models.IntegerField(default=0)
    
    # Client provided training
    client_instructions = models.TextField(blank=True, help_text="Client ke instructions")
    sales_goals = models.JSONField(default=dict, help_text="Sales targets aur goals")
    product_info = models.JSONField(default=dict, help_text="Product/service details")
    
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'ai_agent_training'
    
    def __str__(self):
        return f"{self.ai_agent.name} - {self.training_type}"


class ScheduledCallback(models.Model):
    """
    Scheduled callbacks managed by AI Agent
    """
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('rescheduled', 'Rescheduled'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ai_agent = models.ForeignKey(AIAgent, on_delete=models.CASCADE, related_name='scheduled_callbacks')
    customer_profile = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE)
    
    scheduled_datetime = models.DateTimeField()
    reason = models.CharField(max_length=200, help_text="Callback ka reason")
    notes = models.TextField(blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    completed_at = models.DateTimeField(null=True, blank=True)
    rescheduled_from = models.DateTimeField(null=True, blank=True)
    
    # Auto-generated by AI
    priority_level = models.IntegerField(default=1, help_text="1-5 priority")
    expected_outcome = models.CharField(max_length=100, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'scheduled_callbacks'
        ordering = ['scheduled_datetime']
    
    def __str__(self):
        return f"Callback: {self.customer_profile.phone_number} - {self.scheduled_datetime}"
