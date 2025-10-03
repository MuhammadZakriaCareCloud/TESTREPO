'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, PhoneIncoming, Clock, User, Calendar, Filter, Search, Play, Download } from 'lucide-react';
// import { axiosInstance } from '../../../utils/axiosInstance'; // Uncomment when API is ready

// Types for inbound call data
type CallStatus = 'answered' | 'missed' | 'voicemail' | 'busy' | 'failed';
type CallDirection = 'inbound';

interface InboundCall {
  id: string;
  caller_number: string;
  caller_name?: string;
  agent_name?: string;
  status: CallStatus;
  duration: number; // in seconds
  start_time: string; // ISO string
  end_time?: string; // ISO string
  recording_url?: string;
  notes?: string;
  location?: string;
}

// Mock data for inbound calls
const mockInboundCalls: InboundCall[] = [
  {
    id: 'call_001',
    caller_number: '+1 (555) 123-4567',
    caller_name: 'John Smith',
    agent_name: 'Sarah Johnson',
    status: 'answered',
    duration: 180, // 3 minutes
    start_time: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    end_time: new Date(Date.now() - 1000 * 60 * 27).toISOString(),
    recording_url: '/recordings/call_001.mp3',
    notes: 'Customer inquiry about product pricing',
    location: 'New York, NY'
  },
  {
    id: 'call_002',
    caller_number: '+1 (555) 987-6543',
    caller_name: 'Emily Davis',
    agent_name: 'Mike Wilson',
    status: 'answered',
    duration: 420, // 7 minutes
    start_time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    end_time: new Date(Date.now() - 1000 * 60 * 60 * 2 + 420000).toISOString(),
    recording_url: '/recordings/call_002.mp3',
    notes: 'Support request - account access issue resolved',
    location: 'Los Angeles, CA'
  },
  {
    id: 'call_003',
    caller_number: '+1 (555) 456-7890',
    status: 'missed',
    duration: 0,
    start_time: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    location: 'Chicago, IL'
  },
  {
    id: 'call_004',
    caller_number: '+1 (555) 321-9876',
    caller_name: 'Robert Brown',
    agent_name: 'Lisa Chen',
    status: 'voicemail',
    duration: 45,
    start_time: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    notes: 'Left voicemail requesting callback',
    location: 'Houston, TX'
  },
  {
    id: 'call_005',
    caller_number: '+1 (555) 654-3210',
    caller_name: 'Amanda Wilson',
    agent_name: 'Tom Rodriguez',
    status: 'answered',
    duration: 660, // 11 minutes
    start_time: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    end_time: new Date(Date.now() - 1000 * 60 * 60 * 8 + 660000).toISOString(),
    recording_url: '/recordings/call_005.mp3',
    notes: 'Sales inquiry - follow-up scheduled',
    location: 'Miami, FL'
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
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getStatusColor(status: CallStatus): string {
  switch (status) {
    case 'answered': return 'bg-emerald-600/30 text-emerald-300';
    case 'missed': return 'bg-red-600/30 text-red-300';
    case 'voicemail': return 'bg-blue-600/30 text-blue-300';
    case 'busy': return 'bg-yellow-600/30 text-yellow-300';
    case 'failed': return 'bg-gray-600/30 text-gray-300';
    default: return 'bg-gray-600/30 text-gray-300';
  }
}

export default function InboundCallsPage() {
  const [calls, setCalls] = useState<InboundCall[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<InboundCall[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CallStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load inbound calls from API
  useEffect(() => {
    let mounted = true;

    const loadCalls = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // TODO: Replace with your actual API endpoint
        // const response = await axiosInstance.get<InboundCall[]>('/api/calls/inbound/');
        // if (!mounted) return;
        // setCalls(response.data);

        // --- MOCK DATA for now (remove when API is ready) ---
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        if (!mounted) return;
        setCalls(mockInboundCalls);
        // --------------------------------------------------

      } catch (e: any) {
        if (!mounted) return;
        setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to load inbound calls');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCalls();
    return () => { mounted = false; };
  }, []);

  // Filter calls based on search and status
  useEffect(() => {
    let filtered = calls;

    // Filter by search term (caller name, number, agent)
    if (searchTerm) {
      filtered = filtered.filter(call =>
        call.caller_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.caller_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.agent_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(call => call.status === statusFilter);
    }

    setFilteredCalls(filtered);
  }, [calls, searchTerm, statusFilter]);

  const handlePlayRecording = (recordingUrl: string) => {
    // In real app, this would open audio player or download file
    console.log('Playing recording:', recordingUrl);
    alert('Playing recording: ' + recordingUrl);
  };

  return (
    <main className="min-h-screen bg-[#0B1220] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <PhoneIncoming className="h-6 w-6" />
              Inbound Calls
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              View and manage incoming calls. Total: {filteredCalls.length} calls
            </p>
          </div>
          <div className="flex gap-2">
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
              placeholder="Search by caller name, number, or agent..."
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
              onChange={(e) => setStatusFilter(e.target.value as CallStatus | 'all')}
              className="bg-[#0E1627] border border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="answered">Answered</option>
              <option value="missed">Missed</option>
              <option value="voicemail">Voicemail</option>
              <option value="busy">Busy</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
            <p className="font-medium">Failed to load inbound calls</p>
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
                    <div className="h-4 w-20 bg-gray-700 rounded mb-2"></div>
                    <div className="h-6 w-8 bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-800 bg-[#0E1627] p-4 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-gray-700 rounded"></div>
                  <div>
                    <div className="h-4 w-16 bg-gray-700 rounded mb-2"></div>
                    <div className="h-6 w-6 bg-gray-700 rounded"></div>
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
                    <div className="h-6 w-12 bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-lg border border-gray-800 bg-[#0E1627] p-4">
                <div className="flex items-center gap-2">
                  <PhoneIncoming className="h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="text-sm text-gray-400">Total Inbound</p>
                    <p className="text-xl font-semibold">{calls.length}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-800 bg-[#0E1627] p-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">Answered</p>
                    <p className="text-xl font-semibold">{calls.filter(c => c.status === 'answered').length}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-800 bg-[#0E1627] p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-red-400" />
                  <div>
                    <p className="text-sm text-gray-400">Missed</p>
                    <p className="text-xl font-semibold">{calls.filter(c => c.status === 'missed').length}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-800 bg-[#0E1627] p-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Avg Duration</p>
                    <p className="text-xl font-semibold">
                      {formatDuration(Math.round(calls.filter(c => c.duration > 0).reduce((sum, c) => sum + c.duration, 0) / calls.filter(c => c.duration > 0).length || 0))}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Calls Table */}
        <div className="rounded-lg border border-gray-800 bg-[#0E1627] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-800">
                <tr className="text-left text-sm text-gray-400">
                  <th className="px-4 py-3">Caller</th>
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      Loading calls...
                    </td>
                  </tr>
                ) : filteredCalls.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      No calls found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCalls.map((call) => (
                    <tr key={call.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{call.caller_name || 'Unknown'}</div>
                          <div className="text-gray-400 text-xs">{call.caller_number}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-300">{call.agent_name || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(call.status)}`}>
                          {call.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-300">{formatDuration(call.duration)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-300">{formatTime(call.start_time)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-400 text-xs">{call.location || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {call.recording_url && (
                            <button
                              onClick={() => handlePlayRecording(call.recording_url!)}
                              className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded"
                              title="Play recording"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-400/10 rounded"
                            title="Download details"
                          >
                            <Download className="h-4 w-4" />
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

        {/* Call Notes */}
        {filteredCalls.some(call => call.notes) && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Recent Call Notes</h3>
            <div className="space-y-3">
              {filteredCalls
                .filter(call => call.notes)
                .slice(0, 3)
                .map(call => (
                  <div key={call.id} className="rounded-lg border border-gray-800 bg-[#0E1627] p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium">{call.caller_name || call.caller_number}</div>
                        <div className="text-xs text-gray-400 mt-1">{formatTime(call.start_time)} • {call.agent_name}</div>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${getStatusColor(call.status)}`}>
                        {call.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-2">{call.notes}</p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}