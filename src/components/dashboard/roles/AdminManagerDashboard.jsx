import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  UserCheck, 
  UserX, 
  ShieldCheck, 
  Globe, 
  ChevronRight, 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  LogOut, 
  Clock, 
  Shield, 
  Briefcase,
  Laptop
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function AdminManagerDashboard() {
  const { users, companies, revokeUserSession } = useAuth();

  const [selectedCompanyId, setSelectedCompanyId] = useState('comp-apex');
  const [activeTab, setActiveTab] = useState('companies'); // 'companies' or 'individual'
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState(null);

  // Groupings and metrics
  const totalLoginsToday = 1420;
  const individualUsers = users.filter(u => u.isIndividual);
  const companyUsers = users.filter(u => !u.isIndividual && u.companyId);
  const onlineUsers = users.filter(u => u.status === 'online');

  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || companies[0];
  const selectedCompanyMembers = users.filter(u => u.companyId === selectedCompany.id);

  // Filtered members for the selected company
  const filteredCompanyMembers = selectedCompanyMembers.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Filtered individual users
  const filteredIndividualUsers = individualUsers.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRevoke = (user) => {
    revokeUserSession(user.id);
    setToastMessage(`Session revoked for ${user.name} (${user.email})`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 bg-amber-950/70 border border-amber-500/40 rounded-xl text-amber-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-amber-400 hover:text-white text-xs">Dismiss</button>
        </div>
      )}

      {/* Hero Header */}
      <div className="p-5 sm:p-6 bg-[#0B0F19] border border-amber-500/20 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                PLATFORM OPERATIONS OVERSIGHT
              </span>
              <span className="text-xs text-amber-400 font-mono">
                {companies.length} Registered Enterprise Tenants
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Multi-Tenant Company Logins & Identity Management
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Inspect total logins, audit individual vs company-affiliated users, view real-time online members per company, and manage session clearance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('companies')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                activeTab === 'companies'
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Company Affiliated</span>
            </button>

            <button
              onClick={() => setActiveTab('individual')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                activeTab === 'individual'
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Individual Users ({individualUsers.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Logins Today */}
        <div className="p-4 sm:p-5 bg-[#0B0F19] border border-slate-800 rounded-xl relative">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase">Total Daily Logins</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white mb-1">
            {totalLoginsToday.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
            <span>+14.8% vs yesterday</span>
          </p>
        </div>

        {/* Total Online Now */}
        <div className="p-4 sm:p-5 bg-[#0B0F19] border border-slate-800 rounded-xl relative">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase">Live Active Sessions</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white mb-1">
            {onlineUsers.length} <span className="text-xs font-normal text-slate-400">logged in</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Across individual & enterprise
          </p>
        </div>

        {/* Company Affiliated Users */}
        <div className="p-4 sm:p-5 bg-[#0B0F19] border border-slate-800 rounded-xl relative">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase">Company Affiliated</span>
            <Building2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white mb-1">
            {companyUsers.length} <span className="text-xs font-normal text-slate-400">users</span>
          </div>
          <p className="text-[11px] text-cyan-400 font-mono">
            Aligned with {companies.length} enterprise tenants
          </p>
        </div>

        {/* Individual Users */}
        <div className="p-4 sm:p-5 bg-[#0B0F19] border border-slate-800 rounded-xl relative">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase">Individual Accounts</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white mb-1">
            {individualUsers.length} <span className="text-xs font-normal text-slate-400">users</span>
          </div>
          <p className="text-[11px] text-purple-400 font-mono">
            Freelance & standalone accounts
          </p>
        </div>
      </div>

      {activeTab === 'companies' ? (
        /* Company Deep-Dive View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Company Directory List */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Select Company to Inspect</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                {companies.length} Available
              </span>
            </div>

            <div className="space-y-2">
              {companies.map((comp) => {
                const isSelected = comp.id === selectedCompanyId;
                const compMembers = users.filter(u => u.companyId === comp.id);
                const onlineCount = compMembers.filter(u => u.status === 'online').length;

                return (
                  <div
                    key={comp.id}
                    onClick={() => setSelectedCompanyId(comp.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-slate-900 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30'
                        : 'bg-[#0B0F19] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <h4 className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                          {comp.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-mono">@{comp.domain}</p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {comp.tier}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-slate-800/80">
                      <span className="text-slate-400">Active Logins:</span>
                      <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        {onlineCount} / {compMembers.length} online
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Company Detailed Breakdown */}
          <div className="lg:col-span-2 space-y-4">
            {/* Selected Company Profile Banner */}
            <div className="p-4 sm:p-5 bg-[#0B0F19] border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold">
                    INSPECTING TENANT
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{selectedCompany.industry}</span>
                </div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{selectedCompany.name}</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Total Allocated Seats: <span className="text-white font-mono">{selectedCompany.seatsTotal}</span> | Compliance Score: <span className="text-emerald-400 font-mono">{selectedCompany.complianceScore}%</span>
                </p>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer font-mono"
                >
                  <option value="ALL">All Roles</option>
                  <option value="senior_manager">Senior Manager</option>
                  <option value="employee">Employees</option>
                  <option value="company_developer">Company Developers</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer font-mono"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="online">Online Only</option>
                  <option value="idle">Idle</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>

            {/* Search within this company */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search users in ${selectedCompany.name} by name or email...`}
                className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Company Users Table with Role Categorization */}
            <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="p-3 bg-slate-900/80 border-b border-slate-800 text-xs font-mono text-slate-400 flex justify-between items-center">
                <span>USERS REGISTERED IN {selectedCompany.name.toUpperCase()}</span>
                <span>{filteredCompanyMembers.length} MEMBERS</span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {filteredCompanyMembers.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No users found matching your search or role filter in this company.
                  </div>
                ) : (
                  filteredCompanyMembers.map((member) => {
                    const isOnline = member.status === 'online';
                    const isIdle = member.status === 'idle';

                    const roleBadgeClass = 
                      member.role === 'senior_manager' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' :
                      member.role === 'company_developer' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                      'bg-rose-500/20 text-rose-300 border-rose-500/40';

                    return (
                      <div key={member.id} className="p-3.5 sm:p-4 hover:bg-slate-900/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* Avatar & Online status indicator */}
                          <div className="relative">
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                            />
                            <span 
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0B0F19] ${
                                isOnline ? 'bg-emerald-400 animate-pulse' : isIdle ? 'bg-amber-400' : 'bg-slate-600'
                              }`}
                              title={member.status}
                            ></span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-white">{member.name}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border font-semibold ${roleBadgeClass}`}>
                                {member.roleLabel}
                              </span>
                              {isOnline && (
                                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                                  ONLINE NOW
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{member.email}</p>
                            <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono mt-1">
                              <span>IP: {member.ipAddress}</span>
                              <span>•</span>
                              <span>Loc: {member.location}</span>
                              <span>•</span>
                              <span>Last: {member.lastActive}</span>
                            </div>
                          </div>
                        </div>

                        {/* Session Actions */}
                        <div className="flex items-center gap-2 shrink-0 sm:self-center">
                          {isOnline ? (
                            <button
                              onClick={() => handleRevoke(member)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/70 border border-rose-800/60 text-rose-300 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                              title="Terminate active session immediately"
                            >
                              <LogOut className="w-3 h-3" />
                              <span>Revoke Session</span>
                            </button>
                          ) : (
                            <span className="text-[11px] font-mono text-slate-500 px-2 py-1 bg-slate-900 rounded-lg">
                              No Active Session
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Individual Users View */
        <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Individual & Freelance Security Researchers</span>
              </h2>
              <p className="text-xs text-slate-400">
                Independent accounts operating without enterprise tenant affiliation.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter individual researchers..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden">
            {filteredIndividualUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No individual users found matching the search.
              </div>
            ) : (
              filteredIndividualUsers.map((user) => {
                const isOnline = user.status === 'online';
                return (
                  <div key={user.id} className="p-4 hover:bg-slate-900/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                        />
                        <span 
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0B0F19] ${
                            isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                          }`}
                        ></span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{user.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold">
                            {user.roleLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{user.email}</p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono mt-1">
                          <span>Clearance: {user.securityClearance}</span>
                          <span>•</span>
                          <span>IP: {user.ipAddress}</span>
                          <span>•</span>
                          <span>{user.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isOnline ? (
                        <button
                          onClick={() => handleRevoke(user)}
                          className="px-3 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/70 border border-rose-800/60 text-rose-300 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <LogOut className="w-3 h-3" />
                          <span>Revoke Access</span>
                        </button>
                      ) : (
                        <span className="text-xs font-mono text-slate-500">Offline</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
