"""
Custom schema generator to control Swagger tags
"""
from drf_yasg.generators import OpenAPISchemaGenerator
from drf_yasg import openapi
import logging

logger = logging.getLogger(__name__)


class CustomSchemaGenerator(OpenAPISchemaGenerator):
    """
    Custom schema generator that filters and organizes Swagger tags
    """
    
    # Define our official tags - only these should appear in Swagger
    OFFICIAL_TAGS = {
        'Dashboard',
        'Authentication', 
        'User Management',
        'Subscriptions',
        'AI Agents',
        'Calls'
    }
    
    # Map auto-generated lowercase tags to our official tags
    TAG_MAPPING = {
        'accounts': 'User Management',
        'authentication': 'Authentication',
        'dashboard': 'Dashboard',
        'subscriptions': 'Subscriptions',
        'agents': 'AI Agents',
        'calls': 'Calls',
    }
    
    def get_schema(self, request=None, public=False):
        """Override to customize the schema"""
        schema = super().get_schema(request, public)
        
        # Clean up paths first to collect all tags being used
        self._clean_path_tags(schema)
        
        # Create official tags list
        official_tags = []
        for tag_name in sorted(self.OFFICIAL_TAGS):
            official_tags.append({
                'name': tag_name,
                'description': self._get_tag_description(tag_name)
            })
        
        # Always set official tags, regardless of what was auto-generated
        schema.tags = official_tags
        
        return schema
    
    def _clean_path_tags(self, schema):
        """Clean up tags in paths"""
        if not hasattr(schema, 'paths') or not schema.paths:
            return
            
        for path, path_item in schema.paths.items():
            for method, operation in path_item.items():
                if hasattr(operation, 'tags') and operation.tags:
                    # Map tags to official ones
                    cleaned_tags = []
                    for tag in operation.tags:
                        if tag in self.TAG_MAPPING:
                            official_tag = self.TAG_MAPPING[tag]
                            if official_tag not in cleaned_tags:
                                cleaned_tags.append(official_tag)
                        elif tag in self.OFFICIAL_TAGS:
                            if tag not in cleaned_tags:
                                cleaned_tags.append(tag)
                    
                    operation.tags = cleaned_tags
    
    def _get_tag_description(self, tag_name):
        """Get description for official tags"""
        descriptions = {
            'Dashboard': 'Admin and user dashboard APIs for system overview and management',
            'Authentication': 'User authentication and authorization APIs',
            'User Management': 'User account management and role administration APIs',
            'Subscriptions': 'Subscription and billing management APIs',
            'AI Agents': 'AI Agent creation, training, and management APIs',
            'Calls': 'Call management and history APIs'
        }
        return descriptions.get(tag_name, f'{tag_name} related APIs')
