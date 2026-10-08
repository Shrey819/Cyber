import React, { useState } from 'react';
import { 
  Cpu, 
  Server, 
  Activity, 
  Zap, 
  Users, 
  Database, 
  HardDrive, 
  Terminal, 
  Radio, 
  AlertTriangle, 
  ShieldAlert, 
  RefreshCw, 
  CheckCircle2, 
  Power, 
  Layers, 
  Clock, 
  ArrowUpRight, 
  Sliders, 
  Wifi,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function SuperDevDashboard() {
  const { 
    systemMetrics, 
    systemLogs, 
    users, 
    companies, 
    toggleMaintenanceMode, 
    flushSystemCache 
  } = useAuth();

  const [logFilter, setLogFilter] = useState('ALL');
  const [logSearch, setLogSearch] = useState('');
  const [actionNotice, setActionNotice] = useState(null);

  const onlineUsers = users.filter(u => u.status === 'online');
  const filteredLogs = systemLogs.filter(log => {
    const matchesFilter = logFilter === 'ALL' || log.level === logFilter;
    const matchesSearch = logSearch === '' || 
      log.msg.toLowerCase().includes(logSearch.toLowerCase()) || 
      log.module.toLowerCase().includes(logSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleFlushCache = () => {
    flushSystemCache();
    setActionNotice('Global Redis caches flushed across all 32 edge clusters.');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleToggleMaintenance = () => {
    toggleMaintenanceMode();
    setActionNotice(
      systemMetrics.maintenanceMode 
        ? 'Platform returned to normal production state.' 
        : 'Platform put into scheduled Maintenance Mode.'
    );
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      {actionNotice && (
        <div className="p-3 bg-cyan-950/60 border border-cyan-500/40 rounded-xl text-cyan-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span className="font-mono">{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-cyan-400 hover:text-white text-xs">Dismiss</button>
        </div>
      )}

      {/* Hero Telemetry & Status Bar */}
      <div className="p-3.5 xs:p-5 sm:p-6 bg-[#0B0F19] border border-cyan-500/20 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
              <span className="px-2 py-0.5 rounded-full text-[9px] xs:text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                ROOT DEVELOPER CONSOLE
              </span>
              <span className="flex items-center gap-1.5 text-[11px] sm:text-xs text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                LIVE CLUSTER TELEMETRY
              </span>
            </div>
            <h1 className="text-lg xs:text-xl sm:text-2xl font-black text-white tracking-tight">
              Global Platform Infrastructure & Load Monitor
            </h1>
            <p className="text-[11px] xs:text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Real-time hardware load, microservice health, memory pressure, active distributed sessions, and live kernel logs across all global edge nodes.
            </p>
          </div>

          {/* Quick System Action Buttons */}
          <div className="grid grid-cols-2 gap-1.5 xs:gap-2 w-full lg:w-auto">
            <button
              onClick={handleFlushCache}
              className="px-2.5 xs:px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[11px] xs:text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm hover:border-cyan-500/50"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">Flush Cache</span>
            </button>

            <button
              onClick={handleToggleMaintenance}
              className={`px-2.5 xs:px-3.5 py-2 rounded-xl text-[11px] xs:text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                systemMetrics.maintenanceMode
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/60'
              }`}
            >
              <Power className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{systemMetrics.maintenanceMode ? 'Exit Maint.' : 'Maintenance'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Core Telemetry Grid: CPU, RAM, Network, Users (2x2 on mobile, 4-col on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-2.5 sm:gap-4">
        {/* Metric 1: CPU Load */}
        <div className="p-2.5 xs:p-3 sm:p-5 bg-[#0B0F19] border border-slate-800 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider truncate">CPU Load</span>
            <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xl xs:text-2xl sm:text-3xl font-black font-mono text-white">
              {systemMetrics.cpuLoad}%
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <Activity className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              32 vCPUs
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-700 ${
                systemMetrics.cpuLoad > 80 ? 'bg-rose-500' : systemMetrics.cpuLoad > 60 ? 'bg-amber-400' : 'bg-cyan-400'
              }`}
              style={{ width: `${systemMetrics.cpuLoad}%` }}
            ></div>
          </div>
          <div className="hidden xs:flex justify-between items-center text-[9px] sm:text-[10px] text-slate-500 font-mono mt-2">
            <span>Avg: 1.14</span>
            <span>3.8 GHz</span>
          </div>
        </div>

        {/* Metric 2: Memory Load */}
        <div className="p-3 sm:p-5 bg-[#0B0F19] border border-slate-800 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider truncate">Memory</span>
            <HardDrive className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 shrink-0" />
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xl xs:text-2xl sm:text-3xl font-black font-mono text-white">
              {systemMetrics.memoryUsed}%
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 truncate">
              {systemMetrics.memoryTotalGb} GB
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-400 transition-all duration-700"
              style={{ width: `${systemMetrics.memoryUsed}%` }}
            ></div>
          </div>
          <div className="hidden xs:flex justify-between items-center text-[9px] sm:text-[10px] text-slate-500 font-mono mt-2">
            <span>Swap: 2.1G</span>
            <span>41.5G Cache</span>
          </div>
        </div>

        {/* Metric 3: Network Throughput & Requests */}
        <div className="p-3 sm:p-5 bg-[#0B0F19] border border-slate-800 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider truncate">Traffic</span>
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xl xs:text-2xl sm:text-3xl font-black font-mono text-white">
              {systemMetrics.requestsPerSec.toLocaleString()}
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono text-cyan-400">
              req/s
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 w-3/4 animate-pulse"></div>
          </div>
          <div className="hidden xs:flex justify-between items-center text-[9px] sm:text-[10px] text-slate-500 font-mono mt-2">
            <span>In: {systemMetrics.networkInMbps}M</span>
            <span>Out: {systemMetrics.networkOutMbps}M</span>
          </div>
        </div>

        {/* Metric 4: Active Users & WebSockets */}
        <div className="p-3 sm:p-5 bg-[#0B0F19] border border-slate-800 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider truncate">Active Users</span>
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xl xs:text-2xl sm:text-3xl font-black font-mono text-white">
              {onlineUsers.length}
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono text-emerald-400">
              {systemMetrics.activeWsConnections.toLocaleString()} WS
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 w-4/5"></div>
          </div>
          <div className="hidden xs:flex justify-between items-center text-[9px] sm:text-[10px] text-slate-500 font-mono mt-2">
            <span>Clusters: 32/32</span>
            <span>Zero-Fail</span>
          </div>
        </div>
      </div>

      {/* Cluster Microservice Grid & Database Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subsystems Health */}
        <div className="lg:col-span-1 p-5 bg-[#0B0F19] border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Core Service Cluster Health</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              100% OPERATIONAL
            </span>
          </div>

          <div className="space-y-2.5">
            {[
              { name: 'API Gateway (Envoy / mTLS)', status: 'Optimal', latency: '2.4ms', nodes: '12 pods', ok: true },
              { name: 'Auth & SSO Identity Engine', status: 'Optimal', latency: '4.8ms', nodes: '8 pods', ok: true },
              { name: 'Redis Cache Cluster Shards', status: 'Optimal', hit: '98.6%', nodes: '16 nodes', ok: true },
              { name: 'PostgreSQL Primary + Replicas', status: 'Healthy', pool: '142/500 conns', nodes: '4 instances', ok: true },
              { name: 'Autonomous Threat Hunter', status: 'Active', rate: '4,812 pkt/s', nodes: '6 workers', ok: true },
              { name: 'Quantum Key Distribution (QKD)', status: 'Standby', cipher: 'Kyber-768', nodes: '2 HSMs', ok: true },
            ].map((svc, idx) => (
              <div key={idx} className="p-2.5 bg-slate-900/70 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="font-medium text-slate-200">{svc.name}</span>
                </div>
                <div className="text-right font-mono text-[11px] text-slate-400">
                  <span className="text-emerald-400">{svc.latency || svc.hit || svc.rate || svc.pool || svc.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Database Pool Meter */}
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 font-mono text-xs space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>Database Pool Utilization:</span>
              <span className="text-cyan-400">142 / 500 connections</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400" style={{ width: '28.4%' }}></div>
            </div>
          </div>
        </div>

        {/* Live Kernel & Diagnostic Logs Terminal */}
        <div className="lg:col-span-2 p-5 bg-[#0B0F19] border border-slate-800 rounded-2xl flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Live Platform Diagnostic & Security Stream</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                STDOUT / KERNEL
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5">
              {['ALL', 'INFO', 'WARN', 'SECURITY', 'AUDIT'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLogFilter(lvl)}
                  className={`px-2 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                    logFilter === lvl
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar within terminal */}
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              placeholder="Search kernel messages, IPs, modules, or tokens..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          {/* Terminal Console View */}
          <div className="flex-1 min-h-[280px] max-h-[360px] overflow-y-auto bg-black/90 p-3 rounded-xl border border-slate-900 font-mono text-[11px] space-y-2 scrollbar-none">
            {filteredLogs.length === 0 ? (
              <div className="text-slate-500 text-center py-8">No matching log entries found for this filter.</div>
            ) : (
              filteredLogs.map((log) => {
                const levelColor = 
                  log.level === 'SECURITY' ? 'text-rose-400 bg-rose-950/40 border-rose-800/40' :
                  log.level === 'WARN' ? 'text-amber-400 bg-amber-950/40 border-amber-800/40' :
                  log.level === 'AUDIT' ? 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40' :
                  'text-emerald-400 bg-emerald-950/40 border-emerald-800/40';

                return (
                  <div key={log.id} className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-2 leading-relaxed hover:bg-slate-900/50 p-1 rounded transition-colors">
                    <span className="text-slate-500 shrink-0">[{log.time}]</span>
                    <span className={`px-1.5 py-0.2 rounded border text-[9px] font-bold shrink-0 ${levelColor}`}>
                      {log.level}
                    </span>
                    <span className="text-purple-300 shrink-0">&lt;{log.module}&gt;</span>
                    <span className="text-slate-300 break-all">{log.msg}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Global Technical Diagnostics & Environment */}
      <div className="p-5 bg-[#0B0F19] border border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Runtime Environment & Platform Configuration</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Build 2026.09.11-rc4-linux-amd64</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
            <span className="text-slate-500 font-mono text-[11px]">KUBERNETES ORCHESTRATION</span>
            <p className="font-mono text-slate-200">Cluster: vtx-prod-eu-central-1</p>
            <p className="text-[11px] text-slate-400">Autoscaler: 32 / 64 nodes (Max Surge: 15%)</p>
          </div>

          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
            <span className="text-slate-500 font-mono text-[11px]">POST-QUANTUM CRYPTO</span>
            <p className="font-mono text-slate-200">Algorithm: Kyber-768 + Dilithium-3</p>
            <p className="text-[11px] text-emerald-400">NIST FIPS 203 / 204 Standard Enforced</p>
          </div>

          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
            <span className="text-slate-500 font-mono text-[11px]">ZERO-TRUST ACCESS BROKER</span>
            <p className="font-mono text-slate-200">Policy: Continuous Mutual TLS (mTLS)</p>
            <p className="text-[11px] text-cyan-400">Token Ephemeral Expiration: 15 Minutes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
