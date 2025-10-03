#!/usr/bin/env python
"""
AI Agent Activation and Training Script
Django Call Center Dashboard - Advanced Agent Setup
"""

import os
import sys
import django
from datetime import datetime, timedelta
import json

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from agents.ai_agent_models import AIAgent, AIAgentTraining, CustomerProfile
from subscriptions.models import UserSubscription, SubscriptionPlan

User = get_user_model()

class AgentActivationSystem:
    """Advanced AI Agent Activation and Training System"""
    
    def __init__(self):
        self.activated_agents = []
        self.training_sessions = []
        
    def create_sample_business_scenarios(self):
        """Create diverse business scenarios for training"""
        return [
            {
                'business_type': 'real_estate',
                'agent_name': 'PropertyPro AI',
                'personality': 'professional',
                'business_info': {
                    'company': 'Elite Properties',
                    'services': ['property_sales', 'rentals', 'property_management'],
                    'target_market': 'luxury_properties',
                    'average_deal_value': 500000,
                    'location': 'Downtown Metro Area'
                },
                'initial_script': """
                Hello! This is PropertyPro AI from Elite Properties. 
                I'm calling regarding your interest in luxury properties in the downtown area.
                We have some exclusive listings that match your criteria. 
                Do you have 2 minutes to discuss your property needs?
                """,
                'sales_goals': {
                    'monthly_target': 50,
                    'conversion_rate_target': 15,
                    'followup_strategy': 'aggressive'
                }
            },
            {
                'business_type': 'insurance',
                'agent_name': 'InsureWise AI',
                'personality': 'friendly',
                'business_info': {
                    'company': 'SecureLife Insurance',
                    'services': ['life_insurance', 'health_insurance', 'auto_insurance'],
                    'target_market': 'families',
                    'average_deal_value': 2400,
                    'location': 'Nationwide'
                },
                'initial_script': """
                Hi! This is InsureWise from SecureLife Insurance. 
                I'm calling because we're offering special family protection packages this month.
                Many families are saving up to 30% on their insurance premiums.
                Would you like to hear how we can help protect your family while saving money?
                """,
                'sales_goals': {
                    'monthly_target': 100,
                    'conversion_rate_target': 20,
                    'followup_strategy': 'consultative'
                }
            },
            {
                'business_type': 'solar_energy',
                'agent_name': 'SolarMax AI',
                'personality': 'persuasive',
                'business_info': {
                    'company': 'GreenPower Solutions',
                    'services': ['solar_installation', 'energy_consultation', 'financing'],
                    'target_market': 'homeowners',
                    'average_deal_value': 25000,
                    'location': 'California'
                },
                'initial_script': """
                Hello! This is SolarMax from GreenPower Solutions.
                I'm calling because your area qualifies for federal solar incentives ending soon.
                Homeowners in your neighborhood are eliminating their electricity bills completely.
                Can I show you how you can start saving money from day one with solar?
                """,
                'sales_goals': {
                    'monthly_target': 30,
                    'conversion_rate_target': 12,
                    'followup_strategy': 'urgency_based'
                }
            }
        ]
    
    def create_advanced_training_data(self, business_scenario):
        """Create comprehensive training data for agents"""
        return {
            'objection_handling': {
                'common_objections': [
                    {
                        'objection': "I'm not interested",
                        'response': "I understand completely. Many of our best clients said the same thing initially. What if I could show you something in just 60 seconds that could save you significant money? Would that be worth a minute of your time?",
                        'follow_up': "May I ask what specific concerns you have about [product/service]?"
                    },
                    {
                        'objection': "I need to think about it",
                        'response': "That's smart - this is an important decision. What specific aspects would you like to think through? Maybe I can help clarify those points right now.",
                        'follow_up': "What would need to happen for you to feel confident moving forward?"
                    },
                    {
                        'objection': "It's too expensive",
                        'response': "I appreciate your concern about the investment. Let me ask - what would be a comfortable budget for you? Often we can work within different price ranges.",
                        'follow_up': "Have you considered the long-term savings this could provide?"
                    },
                    {
                        'objection': "I want to shop around",
                        'response': "Absolutely, you should compare options. That's exactly what our other clients did before choosing us. What criteria are most important to you in making this decision?",
                        'follow_up': "What would make you choose one company over another?"
                    }
                ]
            },
            'sales_techniques': [
                {
                    'technique': 'assumptive_close',
                    'example': "Great! So when would be the best time for our team to come out - morning or afternoon works better for you?",
                    'when_to_use': 'when_customer_shows_interest'
                },
                {
                    'technique': 'scarcity_close',
                    'example': "We only have 3 slots left this month for installations. Should I reserve one for you?",
                    'when_to_use': 'when_customer_is_hesitating'
                },
                {
                    'technique': 'benefit_summary',
                    'example': "So let me make sure I understand - you want to save money, help the environment, and increase your home value. This solution does all three. Does that sound right?",
                    'when_to_use': 'before_asking_for_commitment'
                }
            ],
            'conversation_flow': {
                'opening': {
                    'greeting': business_scenario['initial_script'],
                    'permission_to_continue': "Do you have a quick moment?",
                    'benefit_hook': "I have something that could save you significant money"
                },
                'discovery': {
                    'qualifying_questions': [
                        "What's your biggest concern with [current situation]?",
                        "How important is [specific benefit] to you?",
                        "What would need to change for this to be perfect for you?"
                    ],
                    'pain_point_identification': [
                        "Tell me about your current [service/product]",
                        "What challenges are you facing with that?",
                        "How is that affecting your [budget/lifestyle/business]?"
                    ]
                },
                'presentation': {
                    'solution_positioning': "Based on what you've told me, here's how we can help...",
                    'benefit_statements': [
                        "This means you'll save...",
                        "You'll no longer have to worry about...",
                        "Instead of [current problem], you'll enjoy..."
                    ]
                },
                'closing': {
                    'trial_close': "How does this sound so far?",
                    'objection_handling': "What questions or concerns do you have?",
                    'final_close': "Are you ready to move forward with this?"
                }
            }
        }
    
    def activate_agent_for_user(self, user, business_scenario):
        """Activate and fully train an AI agent for a user"""
        
        print(f"🤖 Activating AI Agent for user: {user.email}")
        
        try:
            # Create AI Agent
            ai_agent = AIAgent.objects.create(
                client=user,
                name=business_scenario['agent_name'],
                personality_type=business_scenario['personality'],
                voice_model='en-US-female-1',
                status='training',
                training_level=0,
                working_hours_start='09:00',
                working_hours_end='18:00',
                conversation_memory={
                    'business_info': business_scenario['business_info'],
                    'created': datetime.now().isoformat(),
                    'activation_type': 'automated_setup'
                }
            )
            
            # Create comprehensive training data
            training_data = self.create_advanced_training_data(business_scenario)
            
            # Initial Business Setup Training
            initial_training = AIAgentTraining.objects.create(
                ai_agent=ai_agent,
                training_type='initial',
                training_data={
                    'business_setup': business_scenario['business_info'],
                    'personality_config': business_scenario['personality'],
                    'initial_script': business_scenario['initial_script']
                },
                client_instructions=business_scenario['initial_script'],
                sales_goals=business_scenario['sales_goals'],
                product_info=business_scenario['business_info'],
                completion_percentage=100,
                is_completed=True
            )
            
            # Script Training
            script_training = AIAgentTraining.objects.create(
                ai_agent=ai_agent,
                training_type='script',
                training_data={
                    'conversation_flow': training_data['conversation_flow'],
                    'opening_scripts': [business_scenario['initial_script']],
                    'closing_techniques': training_data['sales_techniques']
                },
                client_instructions=f"Advanced sales script training for {business_scenario['business_type']}",
                completion_percentage=100,
                is_completed=True
            )
            
            # Objection Handling Training
            objection_training = AIAgentTraining.objects.create(
                ai_agent=ai_agent,
                training_type='objection_handling',
                training_data=training_data['objection_handling'],
                client_instructions="Comprehensive objection handling responses",
                completion_percentage=100,
                is_completed=True
            )
            
            # Product Knowledge Training
            product_training = AIAgentTraining.objects.create(
                ai_agent=ai_agent,
                training_type='product_knowledge',
                training_data={
                    'product_details': business_scenario['business_info'],
                    'sales_techniques': training_data['sales_techniques'],
                    'target_market': business_scenario['business_info']['target_market']
                },
                client_instructions="Complete product and service knowledge",
                completion_percentage=100,
                is_completed=True
            )
            
            # Update agent with comprehensive memory
            memory_update = {
                'business_info': business_scenario['business_info'],
                'objection_responses': training_data['objection_handling'],
                'sales_techniques': training_data['sales_techniques'],
                'conversation_patterns': training_data['conversation_flow'],
                'training_completed': datetime.now().isoformat(),
                'fully_trained': True,
                'activation_method': 'automated_comprehensive_training'
            }
            
            ai_agent.conversation_memory.update(memory_update)
            ai_agent.training_level = 100  # Fully trained
            ai_agent.status = 'active'     # Ready for calls
            ai_agent.save()
            
            # Create sample customer profiles for testing
            self.create_sample_customers(ai_agent, business_scenario['business_type'])
            
            self.activated_agents.append({
                'agent_id': str(ai_agent.id),
                'agent_name': ai_agent.name,
                'user_email': user.email,
                'business_type': business_scenario['business_type'],
                'training_level': ai_agent.training_level,
                'status': ai_agent.status
            })
            
            print(f"✅ Agent '{ai_agent.name}' successfully activated and trained!")
            print(f"   - Training Level: {ai_agent.training_level}%")
            print(f"   - Status: {ai_agent.status}")
            print(f"   - Business Type: {business_scenario['business_type']}")
            
            return ai_agent
            
        except Exception as e:
            print(f"❌ Error activating agent: {str(e)}")
            return None
    
    def create_sample_customers(self, ai_agent, business_type):
        """Create sample customer profiles for testing"""
        
        customer_scenarios = {
            'real_estate': [
                {'phone': '+1234567801', 'name': 'John Smith', 'interest': 'hot', 'notes': 'Looking for luxury condo downtown'},
                {'phone': '+1234567802', 'name': 'Sarah Johnson', 'interest': 'warm', 'notes': 'First-time homebuyer, needs guidance'},
                {'phone': '+1234567803', 'name': 'Mike Chen', 'interest': 'cold', 'notes': 'Just browsing, not ready to buy'}
            ],
            'insurance': [
                {'phone': '+1234567804', 'name': 'Lisa Brown', 'interest': 'hot', 'notes': 'Current policy expires next month'},
                {'phone': '+1234567805', 'name': 'David Wilson', 'interest': 'warm', 'notes': 'Comparing insurance options'},
                {'phone': '+1234567806', 'name': 'Emma Davis', 'interest': 'cold', 'notes': 'Happy with current provider'}
            ],
            'solar_energy': [
                {'phone': '+1234567807', 'name': 'Robert Taylor', 'interest': 'hot', 'notes': 'High electricity bills, ready to switch'},
                {'phone': '+1234567808', 'name': 'Jennifer Garcia', 'interest': 'warm', 'notes': 'Interested in environmental benefits'},
                {'phone': '+1234567809', 'name': 'Kevin Martinez', 'interest': 'cold', 'notes': 'Skeptical about solar savings'}
            ]
        }
        
        customers = customer_scenarios.get(business_type, [])
        
        for customer_data in customers:
            CustomerProfile.objects.create(
                ai_agent=ai_agent,
                phone_number=customer_data['phone'],
                name=customer_data['name'],
                interest_level=customer_data['interest'],
                call_preference_time='anytime',
                conversation_notes={
                    'initial_notes': customer_data['notes'],
                    'created': datetime.now().isoformat(),
                    'source': 'automated_setup'
                }
            )
        
        print(f"   - Created {len(customers)} sample customer profiles")
    
    def setup_users_with_subscriptions(self):
        """Create sample users with active subscriptions"""
        
        # Get or create subscription plans
        try:
            premium_plan = SubscriptionPlan.objects.get(name='Premium Plan')
        except SubscriptionPlan.DoesNotExist:
            premium_plan = SubscriptionPlan.objects.create(
                name='Premium Plan',
                price=99.00,
                call_limit=1000,
                features=['ai_agent', 'advanced_analytics', 'custom_scripts'],
                is_active=True
            )
        
        # Sample users data
        sample_users = [
            {
                'email': 'realtor@example.com',
                'first_name': 'Alex',
                'last_name': 'Thompson',
                'role': 'client',
                'business_scenario': 'real_estate'
            },
            {
                'email': 'insurance@example.com', 
                'first_name': 'Maria',
                'last_name': 'Rodriguez',
                'role': 'client',
                'business_scenario': 'insurance'
            },
            {
                'email': 'solar@example.com',
                'first_name': 'James',
                'last_name': 'Patterson',
                'role': 'client', 
                'business_scenario': 'solar_energy'
            }
        ]
        
        created_users = []
        business_scenarios = self.create_sample_business_scenarios()
        
        for user_data in sample_users:
            # Create user
            user, created = User.objects.get_or_create(
                email=user_data['email'],
                defaults={
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                    'role': user_data['role'],
                    'is_active': True
                }
            )
            
            if created:
                user.set_password('demo123')
                user.save()
                print(f"✅ Created user: {user.email}")
            else:
                print(f"📝 User already exists: {user.email}")
            
            # Create subscription
            subscription, sub_created = UserSubscription.objects.get_or_create(
                user=user,
                defaults={
                    'plan': premium_plan,
                    'status': 'active',
                    'start_date': datetime.now().date(),
                    'end_date': (datetime.now() + timedelta(days=30)).date(),
                    'calls_used': 0
                }
            )
            
            if sub_created:
                print(f"✅ Created subscription for: {user.email}")
            
            # Find matching business scenario
            business_scenario = next(
                (scenario for scenario in business_scenarios 
                 if scenario['business_type'] == user_data['business_scenario']), 
                business_scenarios[0]
            )
            
            # Activate AI agent
            agent = self.activate_agent_for_user(user, business_scenario)
            
            created_users.append({
                'user': user,
                'agent': agent,
                'business_type': user_data['business_scenario']
            })
        
        return created_users
    
    def run_full_activation(self):
        """Run complete agent activation process"""
        
        print("🚀 Starting AI Agent Activation System...")
        print("=" * 60)
        
        # Setup users and subscriptions
        users = self.setup_users_with_subscriptions()
        
        print("\n" + "=" * 60)
        print("📊 ACTIVATION SUMMARY")
        print("=" * 60)
        
        print(f"✅ Total users created/updated: {len(users)}")
        print(f"✅ Total agents activated: {len(self.activated_agents)}")
        
        print("\n🤖 ACTIVATED AGENTS:")
        for agent in self.activated_agents:
            print(f"   • {agent['agent_name']} ({agent['business_type']})")
            print(f"     User: {agent['user_email']}")
            print(f"     Training: {agent['training_level']}% | Status: {agent['status']}")
            print(f"     Agent ID: {agent['agent_id']}")
            print()
        
        print("🎉 Agent Activation Complete!")
        print("\n📝 NEXT STEPS:")
        print("1. Login with any of the created user accounts (password: demo123)")
        print("2. Test the AI agents through the API endpoints")
        print("3. Use the dashboard to monitor agent performance")
        print("4. Try the dynamic learning features with sample calls")
        
        return self.activated_agents

def main():
    """Main execution function"""
    
    print("🤖 AI Agent Activation System")
    print("Django Call Center Dashboard")
    print("=" * 60)
    
    activation_system = AgentActivationSystem()
    
    try:
        activated_agents = activation_system.run_full_activation()
        
        print(f"\n✅ Successfully activated {len(activated_agents)} AI agents!")
        
        # Save activation results
        activation_results = {
            'activation_date': datetime.now().isoformat(),
            'activated_agents': activated_agents,
            'total_count': len(activated_agents)
        }
        
        with open('agent_activation_results.json', 'w') as f:
            json.dump(activation_results, f, indent=2)
        
        print("📁 Activation results saved to: agent_activation_results.json")
        
    except Exception as e:
        print(f"❌ Activation failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
