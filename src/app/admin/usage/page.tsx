'use client';

import { useState, useEffect } from 'react';
import { usageAPI } from '@/lib/api-client';

interface UserUsage {
  user_id: string;
  user_role: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  total_requests: number;
  total_response_ms: number;
  total_response_sec: number;
  active_days: number;
  first_request: string;
  last_request: string;
  pct_of_total_time: number;
  pct_of_total_requests: number;
}

interface UsageData {
  period: { from: string; to: string };
  totals: {
    user_count: number;
    student_count: number;
    admin_count: number;
    total_requests: number;
    total_response_ms: number;
    total_response_sec: number;
    student_response_ms: number;
    admin_response_ms: number;
  };
  users: UserUsage[];
}

interface SummaryData {
  period: { from: string; to: string };
  by_role: Array<{ user_role: string; requests: number; total_ms: number }>;
  top_endpoints: Array<{ path: string; requests: number; total_ms: number; avg_ms: number }>;
  by_day: Array<{ day: string; requests: number; unique_users: number; total_ms: number }>;
}

export default function UsagePage() {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'summary'>('users');
  const [sortField, setSortField] = useState<keyof UserUsage>('total_response_ms');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Cost inputs
  const [hetznerCost, setHetznerCost] = useState(0);
  const [neonCost, setNeonCost] = useState(0);
  
  // Date filter
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    // Set default date range to current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    setFromDate(startOfMonth.toISOString().split('T')[0]);
    setToDate(now.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (!fromDate || !toDate) return;
    loadUsageData();
  }, [fromDate, toDate]);

  const loadUsageData = async () => {
    try {
      setLoading(true);
      const [usageResponse, summaryResponse] = await Promise.all([
        usageAPI.getPerStudentUsage(fromDate, toDate),
        usageAPI.getUsageSummary(fromDate, toDate),
      ]);
      setUsageData(usageResponse.data);
      setSummaryData(summaryResponse.data);
    } catch (error) {
      console.error('Failed to load usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof UserUsage) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortedUsers = () => {
    if (!usageData) return [];
    return [...usageData.users].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  };

  const totalCost = hetznerCost + neonCost;
  const studentPct = usageData ? (usageData.totals.student_response_ms / usageData.totals.total_response_ms) * 100 : 0;
  const adminPct = usageData ? (usageData.totals.admin_response_ms / usageData.totals.total_response_ms) * 100 : 0;

  const calculateUserCost = (user: UserUsage) => {
    if (!usageData || totalCost === 0) return 0;
    const pct = user.pct_of_total_time / 100;
    return (pct * totalCost).toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading usage data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Usage & Costs</h1>
        <p className="mt-2 text-gray-600">Track API usage and infrastructure costs per user</p>
      </div>

      {/* Date Filter */}
      <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex-1"></div>
        </div>
      </div>

      {/* Cost Input Section */}
      <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Monthly Infrastructure Costs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hetzner (Server) Cost ($)</label>
            <input
              type="number"
              value={hetznerCost}
              onChange={(e) => setHetznerCost(Number(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter monthly Hetzner cost"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Neon (Database) Cost ($)</label>
            <input
              type="number"
              value={neonCost}
              onChange={(e) => setNeonCost(Number(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter monthly Neon cost"
            />
          </div>
        </div>
      </div>

      {/* Cost Cards */}
      {usageData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Hetzner Cost Card */}
          <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Hetzner Cost</h3>
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900">${hetznerCost.toFixed(2)}</div>
            <div className="mt-2 text-sm text-gray-600">
              <div>Students: ${((studentPct / 100) * hetznerCost).toFixed(2)} ({studentPct.toFixed(1)}%)</div>
              <div>Admins: ${((adminPct / 100) * hetznerCost).toFixed(2)} ({adminPct.toFixed(1)}%)</div>
            </div>
          </div>

          {/* Neon Cost Card */}
          <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Neon Cost</h3>
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900">${neonCost.toFixed(2)}</div>
            <div className="mt-2 text-sm text-gray-600">
              <div>Students: ${((studentPct / 100) * neonCost).toFixed(2)} ({studentPct.toFixed(1)}%)</div>
              <div>Admins: ${((adminPct / 100) * neonCost).toFixed(2)} ({adminPct.toFixed(1)}%)</div>
            </div>
          </div>

          {/* Combined Cost Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Total Cost</h3>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold">${totalCost.toFixed(2)}</div>
            <div className="mt-2 text-sm text-indigo-100">
              <div>Students: ${((studentPct / 100) * totalCost).toFixed(2)} ({studentPct.toFixed(1)}%)</div>
              <div>Admins: ${((adminPct / 100) * totalCost).toFixed(2)} ({adminPct.toFixed(1)}%)</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Per-User Usage
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`${
              activeTab === 'summary'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Summary
          </button>
        </nav>
      </div>

      {/* Per-User Tab */}
      {activeTab === 'users' && usageData && (
        <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    onClick={() => handleSort('email')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    User {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th
                    onClick={() => handleSort('total_requests')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Requests {sortField === 'total_requests' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('total_response_sec')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Response Time (s) {sortField === 'total_response_sec' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('active_days')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Active Days {sortField === 'active_days' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('pct_of_total_time')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    % Share {sortField === 'pct_of_total_time' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Est. Cost ($)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getSortedUsers().map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.email}</div>
                      <div className="text-xs text-gray-500">{user.first_name} {user.last_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.user_role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {user.user_role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.total_requests}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.total_response_sec}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.active_days}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.pct_of_total_time}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${calculateUserCost(user)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {usageData.users.length === 0 && (
            <div className="text-center py-12 text-gray-500">No usage data available for this period</div>
          )}
        </div>
      )}

      {/* Summary Tab */}
      {activeTab === 'summary' && summaryData && (
        <div className="space-y-6">
          {/* By Role */}
          <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Usage by Role</h3>
            <div className="space-y-3">
              {summaryData.by_role.map((item) => (
                <div key={item.user_role} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.user_role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {item.user_role}
                    </span>
                    <span className="text-sm text-gray-600">{item.requests} requests</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">{(item.total_ms / 1000).toFixed(2)}s</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Endpoints */}
          <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Endpoints</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Path</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requests</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Time (s)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg (ms)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {summaryData.top_endpoints.map((item) => (
                    <tr key={item.path} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.path}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.requests}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(item.total_ms / 1000).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.avg_ms}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Daily Activity */}
          <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Activity</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requests</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Users</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Time (s)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {summaryData.by_day.map((item) => (
                    <tr key={item.day} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.day}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.requests}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.unique_users}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(item.total_ms / 1000).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
