/**
 * Admin Users Management Page
 * 
 * This page provides comprehensive user management functionality for administrators.
 * 
 * API Integration:
 * - Set USE_MOCK_DATA to false to enable real API calls
 * - Uncomment the API functions and import statements when ready
 * - The page will automatically switch between mock and real data
 * 
 * Features:
 * - View all users with filtering and search
 * - Ban/unban users
 * - Delete users (with confirmation)
 * - Export user data to CSV
 * - Real-time user statistics
 */

'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  Mail,
  Calendar,
  Phone,
  Crown,
  User,
  MoreVertical,
  Eye,
  Shield,
  AlertTriangle,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { axiosInstance } from '../../../utils/axiosInstance';

// ---------------- Types ----------------
type UserStatus = 'active' | 'inactive' | 'banned' | 'pending';
type UserRole = 'admin' | 'user';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  company?: string;
  joinedAt: string; // ISO date
  lastLoginAt?: string; // ISO date
  totalCalls: number;
  minutesUsed: number;
  currentPlan: string;
  billingStatus: 'active' | 'overdue' | 'cancelled';
  avatar?: string;
}

interface UsersData {
  users: User[];
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  stats: {
    newUsersThisMonth: number;
    totalRevenue: number;
    avgCallsPerUser: number;
  };
}

// ---------------- API Configuration ----------------
/**
 * API Integration Toggle
 * 
 * To switch from mock data to real API:
 * 1. Set USE_MOCK_DATA = false
 * 2. Uncomment the import: import { axiosInstance } from '../../../utils/axiosInstance';
 * 3. Uncomment the API functions below (fetchUsersFromAPI, updateUserStatusAPI, deleteUserAPI)
 * 4. Update the API endpoints to match your backend
 */
const USE_MOCK_DATA = false; // Set to false to use real API

// ---------------- API Functions ----------------
const fetchUsersFromAPI = async (): Promise<UsersData> => {
  try {
    const response = await axiosInstance.get('/api/accounts/admin/users/');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users from server');
  }
};

const updateUserStatusAPI = async (userId: string, status: UserStatus): Promise<User> => {
  try {
    const response = await axiosInstance.patch(`/api/admin/users/${userId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw new Error('Failed to update user status');
  }
};

const deleteUserAPI = async (userId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/admin/users/${userId}`);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user');
  }
};

// ---------------- Mock Data ----------------
const mockUsersData: UsersData = {
  users: [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@company.com',
      role: 'user',
      status: 'active',
      phone: '+1 (555) 123-4567',
      company: 'Tech Corp',
      joinedAt: '2024-08-15T10:30:00Z',
      lastLoginAt: '2025-10-03T14:20:00Z',
      totalCalls: 245,
      minutesUsed: 1250,
      currentPlan: 'Pro - 2000 min',
      billingStatus: 'active',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@startup.io',
      role: 'user',
      status: 'active',
      phone: '+1 (555) 987-6543',
      company: 'StartupIO',
      joinedAt: '2024-09-22T09:15:00Z',
      lastLoginAt: '2025-10-03T11:45:00Z',
      totalCalls: 89,
      minutesUsed: 420,
      currentPlan: 'Basic - 500 min',
      billingStatus: 'active',
    },
    {
      id: '3',
      name: 'Mike Chen',
      email: 'mike.chen@enterprise.com',
      role: 'admin',
      status: 'active',
      phone: '+1 (555) 456-7890',
      company: 'Enterprise Solutions',
      joinedAt: '2024-07-10T08:00:00Z',
      lastLoginAt: '2025-10-04T09:30:00Z',
      totalCalls: 567,
      minutesUsed: 2840,
      currentPlan: 'Enterprise - Unlimited',
      billingStatus: 'active',
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily.davis@freelance.com',
      role: 'user',
      status: 'inactive',
      phone: '+1 (555) 321-9876',
      company: 'Freelancer',
      joinedAt: '2024-06-05T12:45:00Z',
      lastLoginAt: '2025-09-15T16:20:00Z',
      totalCalls: 23,
      minutesUsed: 67,
      currentPlan: 'Basic - 500 min',
      billingStatus: 'overdue',
    },
    {
      id: '5',
      name: 'Robert Wilson',
      email: 'robert.wilson@spam.com',
      role: 'user',
      status: 'banned',
      phone: '+1 (555) 111-2222',
      company: 'Spam Inc',
      joinedAt: '2024-05-20T14:30:00Z',
      lastLoginAt: '2025-08-10T10:15:00Z',
      totalCalls: 1205,
      minutesUsed: 8500,
      currentPlan: 'Pro - 2000 min',
      billingStatus: 'cancelled',
    },
    {
      id: '6',
      name: 'Lisa Martinez',
      email: 'lisa.martinez@agency.com',
      role: 'user',
      status: 'pending',
      phone: '+1 (555) 789-0123',
      company: 'Marketing Agency',
      joinedAt: '2025-10-01T11:00:00Z',
      totalCalls: 0,
      minutesUsed: 0,
      currentPlan: 'Basic - 500 min',
      billingStatus: 'active',
    },
  ],
  totalUsers: 156,
  activeUsers: 98,
  bannedUsers: 12,
  stats: {
    newUsersThisMonth: 15,
    totalRevenue: 47500,
    avgCallsPerUser: 188,
  },
};

// ---------------- Helper Functions ----------------
function formatDate(dateISO: string) {
  try {
    const date = new Date(dateISO);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

function formatDateTime(dateISO: string) {
  try {
    const date = new Date(dateISO);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
}

function getStatusColor(status: UserStatus) {
  switch (status) {
    case 'active':
      return 'bg-emerald-600/20 text-emerald-300 border-emerald-600/30';
    case 'inactive':
      return 'bg-gray-600/20 text-gray-300 border-gray-600/30';
    case 'banned':
      return 'bg-red-600/20 text-red-300 border-red-600/30';
    case 'pending':
      return 'bg-yellow-600/20 text-yellow-300 border-yellow-600/30';
    default:
      return 'bg-gray-600/20 text-gray-300 border-gray-600/30';
  }
}

function getStatusIcon(status: UserStatus) {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-3 w-3" />;
    case 'inactive':
      return <XCircle className="h-3 w-3" />;
    case 'banned':
      return <Ban className="h-3 w-3" />;
    case 'pending':
      return <AlertTriangle className="h-3 w-3" />;
    default:
      return <XCircle className="h-3 w-3" />;
  }
}

function getRoleIcon(role: UserRole) {
  return role === 'admin' ? <Crown className="h-4 w-4 text-yellow-400" /> : <User className="h-4 w-4 text-gray-400" />;
}

// ---------------- Components ----------------
function StatsCard({ title, value, icon: Icon, change, changeType }: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-[#0E1627] p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-semibold text-white">{value}</p>
            {change && (
              <span className={`text-sm ${
                changeType === 'positive' ? 'text-emerald-400' : 
                changeType === 'negative' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {change}
              </span>
            )}
          </div>
        </div>
        <div className="rounded-lg bg-gray-700/50 p-3">
          <Icon className="h-6 w-6 text-gray-300" />
        </div>
      </div>
    </div>
  );
}

function UserActionsDropdown({ user, onEdit, onBan, onDelete, onView }: {
  user: User;
  onEdit: (user: User) => void;
  onBan: (user: User) => void;
  onDelete: (user: User) => void;
  onView: (user: User) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-md p-1 hover:bg-gray-700 transition-colors"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-48 rounded-md border border-gray-700 bg-[#1F2937] py-1 shadow-lg">
            <button
              onClick={() => { onView(user); setIsOpen(false); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-600"
            >
              <Eye className="h-4 w-4" />
              View Details
            </button>
            <button
              onClick={() => { onEdit(user); setIsOpen(false); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-600"
            >
              <Edit3 className="h-4 w-4" />
              Edit User
            </button>
            <button
              onClick={() => { onBan(user); setIsOpen(false); }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-600 ${
                user.status === 'banned' ? 'text-emerald-400' : 'text-yellow-400'
              }`}
            >
              {user.status === 'banned' ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
              {user.status === 'banned' ? 'Unban User' : 'Ban User'}
            </button>
            <button
              onClick={() => { onDelete(user); setIsOpen(false); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-600"
            >
              <Trash2 className="h-4 w-4" />
              Delete User
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------- Main Component ----------------
export default function AdminUsersPage() {
  const [data, setData] = useState<UsersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');


  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (USE_MOCK_DATA) {
          // Using mock data - simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));
          if (!isMounted) return;
          setData(mockUsersData);
        } else {
          // Real API call
          const usersData = await fetchUsersFromAPI();
          if (!isMounted) return;
          setData(usersData);
          
          console.log('Successfully fetched users from API');
        }
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message ?? 'Failed to load users');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadUsers();
    
    return () => { isMounted = false; };
  }, []);

  // Filter users based on search and filters
  const filteredUsers = data?.users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  }) || [];

  // Action handlers
  const handleViewUser = (user: User) => {
    alert(`Viewing user: ${user.name}\n\nThis would open a detailed view with:\n- Full profile information\n- Call history and analytics\n- Billing details\n- Activity logs`);
    // TODO: Navigate to user details page or open modal
  };

  const handleEditUser = (user: User) => {
    alert(`Editing user: ${user.name}\n\nThis would open a form to edit:\n- Personal information\n- Role and permissions\n- Plan and billing\n- Account settings`);
    // TODO: Open edit user modal or navigate to edit page
  };

  const handleBanUser = async (user: User) => {
    const action = user.status === 'banned' ? 'unban' : 'ban';
    const newStatus: UserStatus = user.status === 'banned' ? 'active' : 'banned';
    const confirmed = confirm(`Are you sure you want to ${action} ${user.name}?\n\nThis will ${action === 'ban' ? 'disable their access to the system' : 'restore their access'}.`);
    
    if (confirmed) {
      try {
        if (USE_MOCK_DATA) {
          // Update user status locally for mock data
          setData(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              users: prev.users.map(u => 
                u.id === user.id 
                  ? { ...u, status: newStatus }
                  : u
              )
            };
          });
        } else {
          // Real API call
          await updateUserStatusAPI(user.id, newStatus);
          // Refresh the data after API call
          const updatedData = await fetchUsersFromAPI();
          setData(updatedData);
          
          console.log('Successfully updated user status via API');
        }
        alert(`User ${user.name} has been ${action}ned successfully!`);
      } catch (error) {
        console.error('Error updating user status:', error);
        alert(`Failed to ${action} user. Please try again.`);
      }
    }
  };

  const handleDeleteUser = async (user: User) => {
    const confirmed = confirm(`⚠️ DANGER: Delete User\n\nAre you sure you want to permanently delete ${user.name}?\n\nThis action cannot be undone and will:\n- Remove all user data\n- Cancel active subscriptions\n- Delete call history\n\nType "DELETE" to confirm this is what you want to do.`);
    
    if (confirmed) {
      const doubleConfirm = prompt('Please type "DELETE" to confirm:');
      if (doubleConfirm === 'DELETE') {
        try {
          if (USE_MOCK_DATA) {
            // Remove user locally for mock data
            setData(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                users: prev.users.filter(u => u.id !== user.id),
                totalUsers: prev.totalUsers - 1
              };
            });
          } else {
            // Real API call
            await deleteUserAPI(user.id);
            // Refresh the data after API call
            const updatedData = await fetchUsersFromAPI();
            setData(updatedData);
            
            console.log('Successfully deleted user via API');
          }
          alert(`User ${user.name} has been deleted permanently.`);
        } catch (error) {
          console.error('Error deleting user:', error);
          alert('Failed to delete user. Please try again.');
        }
      } else {
        alert('Deletion cancelled - incorrect confirmation.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-25 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold flex items-center gap-3">
            <Users className="h-8 w-8" />
            User Management
          </h1>
          <p className="mt-2 text-gray-400">
            Manage all users in the system, view their activity, and control access
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              // Export users data as CSV
              const csvData = filteredUsers.map(user => ({
                Name: user.name,
                Email: user.email,
                Role: user.role,
                Status: user.status,
                Company: user.company || '',
                'Total Calls': user.totalCalls,
                'Minutes Used': user.minutesUsed,
                Plan: user.currentPlan,
                'Joined Date': formatDate(user.joinedAt),
                'Last Login': user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never'
              }));
              
              const csvContent = [
                Object.keys(csvData[0]).join(','),
                ...csvData.map(row => Object.values(row).join(','))
              ].join('\n');
              
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              window.URL.revokeObjectURL(url);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-700 hover:bg-gray-800 rounded-md text-sm transition-colors"
          >
            📊 Export CSV
          </button>
          <Link
            href="/admin/users/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add User
          </Link>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-700 hover:bg-gray-800 rounded-md text-sm transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {data && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Users"
            value={data.totalUsers}
            icon={Users}
            change="+12%"
            changeType="positive"
          />
          <StatsCard
            title="Active Users"
            value={data.activeUsers}
            icon={CheckCircle}
            change="+5%"
            changeType="positive"
          />
          <StatsCard
            title="New This Month"
            value={data.stats.newUsersThisMonth}
            icon={Calendar}
            change="+25%"
            changeType="positive"
          />
          <StatsCard
            title="Total Revenue"
            value={`$${data.stats.totalRevenue.toLocaleString()}`}
            icon={Shield}
            change="+18%"
            changeType="positive"
          />
        </div>
      )}

      {/* Filters and Search */}
      <div className="rounded-xl border border-gray-800 bg-[#0E1627] p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'all')}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
              <option value="pending">Pending</option>
            </select>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-gray-800 bg-[#0E1627] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading users...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="rounded-full bg-red-900/20 p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Failed to Load Users</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-700">
                <tr className="text-left text-sm text-gray-400">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Activity</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                      <p className="text-lg font-medium mb-2">No users found</p>
                      <p>Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-2 text-white font-semibold text-xs w-8 h-8 flex items-center justify-center">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-white">{user.name}</div>
                            <div className="text-gray-400 text-xs">{user.email}</div>
                            {user.company && (
                              <div className="text-gray-500 text-xs">{user.company}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(user.role)}
                          <span className="capitalize">{user.role}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium border ${getStatusColor(user.status)}`}>
                          {getStatusIcon(user.status)}
                          <span className="capitalize">{user.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs">
                          <div className="text-white">{user.totalCalls} calls</div>
                          <div className="text-gray-400">{user.minutesUsed} min used</div>
                          {user.lastLoginAt && (
                            <div className="text-gray-500">Last: {formatDateTime(user.lastLoginAt)}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs">
                          <div className="text-white">{user.currentPlan}</div>
                          <div className={`${
                            user.billingStatus === 'active' ? 'text-emerald-400' : 
                            user.billingStatus === 'overdue' ? 'text-red-400' : 'text-gray-400'
                          }`}>
                            {user.billingStatus}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {formatDate(user.joinedAt)}
                      </td>
                      <td className="px-6 py-4">
                        <UserActionsDropdown
                          user={user}
                          onView={handleViewUser}
                          onEdit={handleEditUser}
                          onBan={handleBanUser}
                          onDelete={handleDeleteUser}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results summary */}
      {data && (
        <div className="rounded-xl border border-gray-800 bg-[#0E1627] p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-sm text-gray-400">
              Showing <span className="text-white font-medium">{filteredUsers.length}</span> of <span className="text-white font-medium">{data.totalUsers}</span> users
              {(searchTerm || statusFilter !== 'all' || roleFilter !== 'all') && (
                <span className="ml-2 text-blue-400">
                  (filtered)
                </span>
              )}
            </div>
            
            <div className="flex gap-6 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span>{data.activeUsers} Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                <span>{data.users.filter(u => u.status === 'inactive').length} Inactive</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>{data.bannedUsers} Banned</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>{data.users.filter(u => u.status === 'pending').length} Pending</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Footer */}
      <div className="rounded-xl border border-gray-800 bg-[#0E1627] p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => alert('This would open a bulk import dialog to upload users from CSV/Excel files.')}
            className="flex items-center gap-3 p-4 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <div className="p-2 rounded-lg bg-blue-600/20">
              <Plus className="h-5 w-5 text-blue-400" />
            </div>
            <div className="text-left">
              <div className="font-medium">Bulk Import Users</div>
              <div className="text-sm text-gray-400">Upload CSV or Excel file</div>
            </div>
          </button>
          
          <button
            onClick={() => alert('This would show analytics about user activity, growth trends, and usage patterns.')}
            className="flex items-center gap-3 p-4 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <div className="p-2 rounded-lg bg-emerald-600/20">
              <Shield className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <div className="font-medium">User Analytics</div>
              <div className="text-sm text-gray-400">View detailed insights</div>
            </div>
          </button>
          
          <button
            onClick={() => alert('This would open system settings for user management, default permissions, and security policies.')}
            className="flex items-center gap-3 p-4 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <div className="p-2 rounded-lg bg-purple-600/20">
              <Settings className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-left">
              <div className="font-medium">System Settings</div>
              <div className="text-sm text-gray-400">Configure defaults</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
