'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, User, Phone, Clock, Search, Filter, Edit, Settings, Trash2, Plus, PhoneCall, Activity, Calendar, Mail, Shield, MoreVertical } from 'lucide-react';
// import { axiosInstance } from '../../utils/axiosInstance'; // Uncomment when API is ready

// Types for agent data
type AgentStatus = 'active' | 'inactive' | 'busy' | 'away' | 'offline';
type AgentRole = 'agent' | 'supervisor' | 'admin';

interface Agent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: AgentRole;
  status: AgentStatus;
  avatar?: string;
  joined_at: string;
  last_active?: string;
  
  // Performance metrics
  total_calls: number;
  calls_today: number;
  avg_call_duration: number; // in seconds
  success_rate: number; // percentage
  rating: number; // 1-5 star rating
  
  // Current activity
  current_call?: {
    direction: 'inbound' | 'outbound';
    duration: number; // seconds since call started
    caller_number: string;
  };
  
  // Schedule info
  shift_start?: string;
  shift_end?: string;
  timezone?: string;
  
  // Specializations
  skills: string[];
  languages: string[];
}

// Mock data for agents
const mockAgents: Agent[] = [
  {
    id: 'agent_001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+1 (555) 123-4567',
    role: 'supervisor',
    status: 'active',
    avatar: '/avatars/sarah.jpg',
    joined_at: new Date(Date.now() - 86400000 * 365).toISOString(), // 1 year ago
    last_active: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min ago
    
    total_calls: 2847,
    calls_today: 23,
    avg_call_duration: 285, // 4m 45s
    success_rate: 94.2,
    rating: 4.8,
    
    current_call: {
      direction: 'inbound',
      duration: 180, // 3 minutes into call
      caller_number: '+1 (555) 987-6543'
    },
    
    shift_start: '09:00',
    shift_end: '17:00',
    timezone: 'EST',
    
    skills: ['Sales', 'Technical Support', 'Account Management'],
    languages: ['English', 'Spanish']
  },
  {
    id: 'agent_002',
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    phone: '+1 (555) 234-5678',
    role: 'agent',
    status: 'active',
    avatar: '/avatars/michael.jpg',
    joined_at: new Date(Date.now() - 86400000 * 180).toISOString(), // 6 months ago
    last_active: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 min ago
    
    total_calls: 1456,
    calls_today: 18,
    avg_call_duration: 320, // 5m 20s
    success_rate: 87.5,
    rating: 4.6,
    
    shift_start: '08:00',
    shift_end: '16:00',
    timezone: 'EST',
    
    skills: ['Customer Service', 'Product Support'],
    languages: ['English', 'Mandarin']
  },
  {
    id: 'agent_003',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@company.com',
    phone: '+1 (555) 345-6789',
    role: 'agent',
    status: 'busy',
    avatar: '/avatars/emily.jpg',
    joined_at: new Date(Date.now() - 86400000 * 90).toISOString(), // 3 months ago
    last_active: new Date(Date.now() - 1000 * 60 * 1).toISOString(), // 1 min ago
    
    total_calls: 892,
    calls_today: 15,
    avg_call_duration: 245, // 4m 5s
    success_rate: 91.3,
    rating: 4.7,
    
    current_call: {
      direction: 'outbound',
      duration: 420, // 7 minutes into call
      caller_number: '+1 (555) 876-5432'
    },
    
    shift_start: '10:00',
    shift_end: '18:00',
    timezone: 'EST',
    
    skills: ['Sales', 'Lead Qualification'],
    languages: ['English', 'Spanish', 'Portuguese']
  },
  {
    id: 'agent_004',
    name: 'David Park',
    email: 'david.park@company.com',
    phone: '+1 (555) 456-7890',
    role: 'agent',
    status: 'away',
    avatar: '/avatars/david.jpg',
    joined_at: new Date(Date.now() - 86400000 * 45).toISOString(), // 1.5 months ago
    last_active: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min ago
    
    total_calls: 578,
    calls_today: 12,
    avg_call_duration: 195, // 3m 15s
    success_rate: 89.7,
    rating: 4.4,
    
    shift_start: '12:00',
    shift_end: '20:00',
    timezone: 'EST',
    
    skills: ['Technical Support', 'Troubleshooting'],
    languages: ['English', 'Korean']
  },
  {
    id: 'agent_005',
    name: 'Lisa Thompson',
    email: 'lisa.thompson@company.com',
    phone: '+1 (555) 567-8901',
    role: 'agent',
    status: 'inactive',
    avatar: '/avatars/lisa.jpg',
    joined_at: new Date(Date.now() - 86400000 * 30).toISOString(), // 1 month ago
    last_active: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    
    total_calls: 324,
    calls_today: 0,
    avg_call_duration: 210, // 3m 30s
    success_rate: 85.2,
    rating: 4.3,
    
    shift_start: '14:00',
    shift_end: '22:00',
    timezone: 'EST',
    
    skills: ['Customer Service', 'Order Processing'],
    languages: ['English']
  },
  {
    id: 'agent_006',
    name: 'Alex Wilson',
    email: 'alex.wilson@company.com',
    phone: '+1 (555) 678-9012',
    role: 'admin',
    status: 'active',
    avatar: '/avatars/alex.jpg',
    joined_at: new Date(Date.now() - 86400000 * 730).toISOString(), // 2 years ago
    last_active: new Date(Date.now() - 1000 * 60 * 1).toISOString(), // 1 min ago
    
    total_calls: 3521,
    calls_today: 5, // Admins take fewer calls
    avg_call_duration: 380, // 6m 20s - longer for complex issues
    success_rate: 96.8,
    rating: 4.9,
    
    shift_start: '08:00',
    shift_end: '17:00',
    timezone: 'EST',
    
    skills: ['Administration', 'Training', 'Quality Assurance', 'Escalations'],
    languages: ['English', 'French']
  }
];

// Helper functions
function formatDuration(seconds: number): string {
  if (seconds === 0) return '0s';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) return `${remainingSeconds}s`;
  return `${minutes}m ${remainingSeconds}s`;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

function getStatusColor(status: AgentStatus): string {
  switch (status) {
    case 'active': return 'bg-emerald-600/30 text-emerald-300';
    case 'busy': return 'bg-blue-600/30 text-blue-300';
    case 'away': return 'bg-yellow-600/30 text-yellow-300';
    case 'inactive': return 'bg-gray-600/30 text-gray-300';
    case 'offline': return 'bg-red-600/30 text-red-300';
    default: return 'bg-gray-600/30 text-gray-300';
  }
}

function getRoleColor(role: AgentRole): string {
  switch (role) {
    case 'admin': return 'bg-purple-600/20 text-purple-300';
    case 'supervisor': return 'bg-blue-600/20 text-blue-300';
    case 'agent': return 'bg-green-600/20 text-green-300';
    default: return 'bg-gray-600/20 text-gray-300';
  }
}

function getStatusIcon(status: AgentStatus) {
  switch (status) {
    case 'active': return <div className="h-2 w-2 rounded-full bg-emerald-400"></div>;
    case 'busy': return <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></div>;
    case 'away': return <div className="h-2 w-2 rounded-full bg-yellow-400"></div>;
    case 'inactive': return <div className="h-2 w-2 rounded-full bg-gray-400"></div>;
    case 'offline': return <div className="h-2 w-2 rounded-full bg-red-400"></div>;
    default: return <div className="h-2 w-2 rounded-full bg-gray-400"></div>;
  }
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AgentStatus | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<AgentRole | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load agents from API
  useEffect(() => {
    let mounted = true;

    const loadAgents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // TODO: Replace with your actual API endpoint
        // const response = await axiosInstance.get<Agent[]>('/api/agents/');
        // if (!mounted) return;
        // setAgents(response.data);

        // --- MOCK DATA for now (remove when API is ready) ---
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
        if (!mounted) return;
        setAgents(mockAgents);
        // --------------------------------------------------

      } catch (e: any) {
        if (!mounted) return;
        setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to load agents');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadAgents();
    return () => { mounted = false; };
  }, []);

  // Filter agents based on search, status, and role
  useEffect(() => {
    let filtered = agents;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(agent => agent.status === statusFilter);
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(agent => agent.role === roleFilter);
    }

    setFilteredAgents(filtered);
  }, [agents, searchTerm, statusFilter, roleFilter]);

  const handleNewAgent = () => {
    console.log('Creating new agent');
    alert('New agent feature - would open agent creation form');
  };

  const handleEditAgent = (agentId: string) => {
    console.log('Editing agent:', agentId);
    alert(`Edit agent ${agentId} - would open edit form`);
  };

  const handleDeleteAgent = (agentId: string) => {
    console.log('Deleting agent:', agentId);
    if (confirm('Are you sure you want to delete this agent?')) {
      setAgents(prev => prev.filter(a => a.id !== agentId));
    }
  };

  // Calculate stats
  const activeAgents = agents.filter(a => a.status === 'active').length;
  const busyAgents = agents.filter(a => a.status === 'busy').length;
  const totalCallsToday = agents.reduce((sum, a) => sum + a.calls_today, 0);
  const avgSuccessRate = agents.reduce((sum, a) => sum + a.success_rate, 0) / (agents.length || 1);

  return (
    <main className="min-h-screen bg-[#0B1220] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Users className="h-6 w-6" />
              Agent Management
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Manage agents, monitor performance, and track activity. Total: {filteredAgents.length} agents
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleNewAgent}
              className="rounded-md bg-blue-600 hover:bg-blue-700 px-3 py-2 text-sm flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Agent
            </button>
            <Link 
              href="/dashboard" 
              className="rounded-md border border-gray-700 px-3 py-2 text-sm hover:bg-gray-800"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#0E1627] border border-gray-700 rounded-md text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AgentStatus | 'all')}
              className="bg-[#0E1627] border border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="busy">Busy</option>
              <option value="away">Away</option>
              <option value="inactive">Inactive</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as AgentRole | 'all')}
            className="bg-[#0E1627] border border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="agent">Agent</option>
            <option value="supervisor">Supervisor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
            <p className="font-medium">Failed to load agents</p>
            <p className="mt-1 text-red-200/80">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {loading ? (
            <>
              <div className="rounded-lg border border-gray-800 bg-[#0E1627] p-4 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-gray-700 rounded"></div>
                  <div>
                    <div className="h-4 w-16 bg-gray-700 rounded mb-2"></div>
                    <div className="h-6 w-8 bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-800 bg-[#0E1627] p-4 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-gray-700 rounded"></div>
                  <div>
                    <div className="h-4 w-12 bg-gray-700 rounded mb-2"></div>
                    <div className="h-6 w-6 bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-800 bg-[#0E1627] p-4 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-gray-700 rounded"></div>
                  <div>
                    <div className="h-4 w-20 bg-gray-700 rounded mb-2"></div>
                    <div className="h-6 w-10 bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-800 bg-[#0E1627] p-4 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-gray-700 rounded"></div>
                  <div>
                    <div className="h-4 w-18 bg-gray-700 rounded mb-2"></div>
                    <div className="h-6 w-12 bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-lg border border-gray-800 bg-[#0E1627] p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Total Agents</p>
                    <p className="text-xl font-semibold">{agents.length}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-800 bg-[#0E1627] p-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">Active</p>
                    <p className="text-xl font-semibold">{activeAgents}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-800 bg-[#0E1627] p-4">
                <div className="flex items-center gap-2">
                  <PhoneCall className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">Calls Today</p>
                    <p className="text-xl font-semibold">{totalCallsToday}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-800 bg-[#0E1627] p-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="text-sm text-gray-400">Avg Success Rate</p>
                    <p className="text-xl font-semibold">{avgSuccessRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Agents Table */}
        <div className="rounded-lg border border-gray-800 bg-[#0E1627] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-800">
                <tr className="text-left text-sm text-gray-400">
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Performance</th>
                  <th className="px-4 py-3">Activity</th>
                  <th className="px-4 py-3">Skills</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      Loading agents...
                    </td>
                  </tr>
                ) : filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      No agents found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAgents.map((agent) => (
                    <tr key={agent.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                              {agent.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="absolute -bottom-1 -right-1">
                              {getStatusIcon(agent.status)}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{agent.name}</div>
                            <div className="text-gray-400 text-xs flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {agent.email}
                            </div>
                            {agent.phone && (
                              <div className="text-gray-500 text-xs flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {agent.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getRoleColor(agent.role)}`}>
                          {agent.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                          {agent.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(agent.status)}`}>
                            {agent.status}
                          </span>
                          {agent.current_call && (
                            <div className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                              <PhoneCall className="h-3 w-3" />
                              {agent.current_call.direction} - {formatDuration(agent.current_call.duration)}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            Last active: {formatTime(agent.last_active || agent.joined_at)}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium">{agent.calls_today} calls today</div>
                          <div className="text-xs text-gray-400">
                            {agent.total_calls.toLocaleString()} total • {agent.success_rate}% success
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <div className="text-xs text-yellow-400">
                              {'★'.repeat(Math.floor(agent.rating))}{'☆'.repeat(5 - Math.floor(agent.rating))}
                            </div>
                            <span className="text-xs text-gray-500">({agent.rating})</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-xs text-gray-400">
                            Avg call: {formatDuration(agent.avg_call_duration)}
                          </div>
                          {agent.shift_start && agent.shift_end && (
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              {agent.shift_start} - {agent.shift_end} {agent.timezone}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            Joined: {new Date(agent.joined_at).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-1">
                            {agent.skills.slice(0, 2).map(skill => (
                              <span key={skill} className="inline-flex items-center rounded px-1.5 py-0.5 text-xs bg-blue-600/20 text-blue-300">
                                {skill}
                              </span>
                            ))}
                            {agent.skills.length > 2 && (
                              <span className="text-xs text-gray-500">+{agent.skills.length - 2} more</span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {agent.languages.slice(0, 2).map(lang => (
                              <span key={lang} className="inline-flex items-center rounded px-1.5 py-0.5 text-xs bg-green-600/20 text-green-300">
                                {lang}
                              </span>
                            ))}
                            {agent.languages.length > 2 && (
                              <span className="text-xs text-gray-500">+{agent.languages.length - 2} more</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditAgent(agent.id)}
                            className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded"
                            title="Edit agent"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-400/10 rounded"
                            title="Settings"
                          >
                            <Settings className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAgent(agent.id)}
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded"
                            title="Delete agent"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Currently Active Agents Section */}
        {filteredAgents.some(agent => agent.current_call) && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <PhoneCall className="h-5 w-5 text-blue-400" />
              Currently on Calls
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAgents
                .filter(agent => agent.current_call)
                .map(agent => (
                  <div key={agent.id} className="rounded-lg border border-blue-700/30 bg-blue-900/10 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                            {agent.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="absolute -bottom-1 -right-1">
                            <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></div>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">{agent.name}</div>
                          <div className="text-xs text-gray-400">
                            {agent.current_call!.direction} call • {formatDuration(agent.current_call!.duration)}
                          </div>
                          <div className="text-xs text-blue-400">
                            {agent.current_call!.caller_number}
                          </div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${getStatusColor(agent.status)}`}>
                        {agent.status}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}