import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  FileText, 
  Download, 
  Filter, 
  Clock, 
  Laptop, 
  ArrowUpRight, 
  Eye, 
  Flag, 
  ShieldCheck,
  Building2,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function SeniorManagerDashboard() {
  const { currentUser, users, employeeSearches, companies } = useAuth();

  // Find the manager's company
  const companyId = currentUser?.companyId || 'comp-apex';
  const company = companies.find(c => c.id === companyId) || companies[0];

  // Filter employees belonging to this company
  const companyEmployees = users.filter(
    u => u.companyId === companyId && u.role === 'employee'
  );

  // Filter searches for this company
  const companySearches = employeeSearches.filter(
    s => s.companyId === companyId
  );

  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [searchQueryTerm, setSearchQueryTerm] = useState('');
  const [flaggedIds, setFlaggedIds] = useState([]);
  const [alertNotice, setAlertNotice] = useState(null);

  // Filtered searches
  const filteredSearches = companySearches.filter(item => {
    const matchesEmployee = 
      selectedEmployeeFilter === 'ALL' || item.employeeId === selectedEmployeeFilter;
    const matchesRisk = 
      riskFilter === 'ALL' || item.riskLevel.toLowerCase() === riskFilter.toLowerCase();
    const matchesTerm = 
      searchQueryTerm === '' || 
      item.query.toLowerCase().includes(searchQueryTerm.toLowerCase()) ||
      item.employeeName.toLowerCase().includes(searchQueryTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQueryTerm.toLowerCase());
    return matchesEmployee && matchesRisk && matchesTerm;
  });

  const handleFlagSearch = (searchId, employeeName) => {
    if (flaggedIds.includes(searchId)) {
      setFlaggedIds(flaggedIds.filter(id => id !== searchId));
      setAlertNotice(`Unflagged search activity for ${employeeName}`);
    } else {
      setFlaggedIds([...flaggedIds, searchId]);
      setAlertNotice(`Flagged search activity by ${employeeName} for Security Compliance Review`);
    }
    setTimeout(() => setAlertNotice(null), 4000);
  };

  const handleExportAudit = () => {
    setAlertNotice(`Exported ${filteredSearches.length} activity audit records as CSV for ${company.name}`);
    setTimeout(() => setAlertNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Alert Notice */}
      {alertNotice && (
        <div className="p-3 bg-cyan-950/70 border border-cyan-500/40 rounded-xl text-cyan-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>{alertNotice}</span>
          </div>
          <button onClick={() => setAlertNotice(null)} className="text-cyan-400 hover:text-white text-xs">Dismiss</button>
        </div>
      )}

      {/* Hero Header */}
      <div className="p-5 sm:p-6 bg-[#0B0F19] border border-cyan-500/20 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                SENIOR MANAGEMENT COMMAND
              </span>
              <span className="text-xs text-cyan-400 font-mono">
                Tenant: {company.name}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Company Employee Activity & Threat Search Monitor
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Real-time audit log of team members' internal searches, queries, threat research, and workstation activity within {company.name}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportAudit}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:border-cyan-500/50"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Audit Trail (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Threat / Anomaly Detection Banner */}
      <div className="p-4 bg-rose-950/30 border border-rose-800/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-rose-200 flex items-center gap-2">
              <span>High-Risk Search Patterns Detected (2 Alerts)</span>
              <span className="px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300 text-[10px] font-mono font-bold">
                POLICY FLAG
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Workstation queries containing keywords <code className="text-rose-300 bg-rose-950/60 px-1 py-0.5 rounded font-mono">"salary payroll bucket"</code> and <code className="text-rose-300 bg-rose-950/60 px-1 py-0.5 rounded font-mono">"decrypted passkey"</code> were flagged for review.
            </p>
          </div>
        </div>

        <button 
          onClick={() => {
            setRiskFilter('critical');
            setSearchQueryTerm('');
          }}
          className="px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/50 text-rose-200 text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap"
        >
          View Critical Searches
        </button>
      </div>

      {/* Employee Team Roster Cards */}
      <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>{company.name} Workforce Roster ({companyEmployees.length} Staff)</span>
            </h3>
            <p className="text-xs text-slate-400">Current status of direct reports and employees</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            {companyEmployees.filter(e => e.status === 'online').length} Active Now
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {companyEmployees.map((emp) => {
            const isOnline = emp.status === 'online';
            const isIdle = emp.status === 'idle';

            return (
              <div 
                key={emp.id} 
                onClick={() => setSelectedEmployeeFilter(selectedEmployeeFilter === emp.id ? 'ALL' : emp.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedEmployeeFilter === emp.id
                    ? 'bg-cyan-950/40 border-cyan-500/60 ring-1 ring-cyan-500/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                    />
                    <span 
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0B0F19] ${
                        isOnline ? 'bg-emerald-400 animate-pulse' : isIdle ? 'bg-amber-400' : 'bg-slate-600'
                      }`}
                    ></span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white truncate">{emp.name}</h4>
                      <span className="text-[10px] font-mono text-slate-400 capitalize">{emp.status}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono truncate">{emp.email}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">IP: {emp.ipAddress}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Section: Employee Search History & Activity Logs */}
      <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Employee Query & Activity Feed</span>
            </h3>
            <p className="text-xs text-slate-400">
              Complete surveillance of terms searched, threat research lookups, and workstation events.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedEmployeeFilter}
              onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
            >
              <option value="ALL">All Employees</option>
              {companyEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="critical">Critical Risk</option>
              <option value="high">High Risk</option>
              <option value="elevated">Elevated</option>
              <option value="low">Low Risk</option>
            </select>
          </div>
        </div>

        {/* Search within queries */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQueryTerm}
            onChange={(e) => setSearchQueryTerm(e.target.value)}
            placeholder="Search query text, employee names, categories, or keywords..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Activity Table */}
        <div className="border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-3 bg-slate-900/80 border-b border-slate-800 text-xs font-mono text-slate-400 flex justify-between items-center">
            <span>EMPLOYEE SEARCH LOGS & TELEMETRY</span>
            <span>{filteredSearches.length} QUERIES LOGGED</span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {filteredSearches.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No employee search activity matching your filter criteria.
              </div>
            ) : (
              filteredSearches.map((item) => {
                const isFlagged = flaggedIds.includes(item.id);
                const riskBadge = 
                  item.riskLevel === 'critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' :
                  item.riskLevel === 'high' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                  item.riskLevel === 'elevated' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' :
                  'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

                return (
                  <div key={item.id} className="p-4 hover:bg-slate-900/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">{item.employeeName}</span>
                        <span className="text-slate-600">•</span>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-mono border font-bold uppercase ${riskBadge}`}>
                          {item.riskLevel} RISK
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.2 rounded">
                          {item.category}
                        </span>
                      </div>

                      {/* The query string */}
                      <div className="flex items-start gap-2 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                        <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <code className="text-xs font-mono text-slate-200 break-all">
                          "{item.query}"
                        </code>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {item.timestamp}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Laptop className="w-3 h-3 text-slate-400" />
                          {item.device}
                        </span>
                        <span>•</span>
                        <span>IP: {item.ipAddress}</span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => handleFlagSearch(item.id, item.employeeName)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer border ${
                          isFlagged
                            ? 'bg-rose-900/60 border-rose-500 text-rose-200'
                            : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        <Flag className="w-3 h-3 text-rose-400" />
                        <span>{isFlagged ? 'Flagged' : 'Flag Query'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
