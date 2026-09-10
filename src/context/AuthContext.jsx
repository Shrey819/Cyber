import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  COMPANIES, 
  INITIAL_USERS, 
  INITIAL_EMPLOYEE_SEARCHES, 
  INITIAL_COMPANY_API_KEYS, 
  INITIAL_COMPANY_VULNERABILITIES,
  DEMO_PERSONAS 
} from '../data/mockAuthData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Read persisted user or default to Super Developer for immediate preview if desired, or null
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('vortex_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved user', e);
    }
    // Default to Super Developer for quick testing
    return INITIAL_USERS[0];
  });

  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('vortex_users');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_USERS;
  });

  const [companies, setCompanies] = useState(COMPANIES);

  const [employeeSearches, setEmployeeSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('vortex_searches');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_EMPLOYEE_SEARCHES;
  });

  const [apiKeys, setApiKeys] = useState(() => {
    try {
      const saved = localStorage.getItem('vortex_api_keys');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_COMPANY_API_KEYS;
  });

  const [vulnerabilities, setVulnerabilities] = useState(() => {
    try {
      const saved = localStorage.getItem('vortex_vulns');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_COMPANY_VULNERABILITIES;
  });

  // Dynamic live system telemetry for Super Developer
  const [systemMetrics, setSystemMetrics] = useState({
    cpuLoad: 42.4,
    memoryUsed: 68.2,
    memoryTotalGb: 128,
    activeWsConnections: 18420,
    requestsPerSec: 4892,
    avgLatencyMs: 14.2,
    networkInMbps: 840,
    networkOutMbps: 2150,
    activeNodes: 32,
    healthyNodes: 32,
    cacheHitRatio: 98.6,
    dbConnectionsUsed: 142,
    dbConnectionsMax: 500,
    maintenanceMode: false,
  });

  // Live system logs for Super Developer console
  const [systemLogs, setSystemLogs] = useState([
    { id: 1, time: '23:54:12', level: 'INFO', module: 'K8S-INGRESS', msg: 'TLS Handshake established via Kyber-768 quantum safe cipher' },
    { id: 2, time: '23:54:02', level: 'WARN', module: 'WAF-RATE-LIMIT', msg: 'Rate limit triggered for IP 185.220.101.5 (240 req/sec blocked)' },
    { id: 3, time: '23:53:45', level: 'INFO', module: 'AUTH-GATEWAY', msg: 'Session token refreshed for marcus.mgr@apextech.com (mTLS verified)' },
    { id: 4, time: '23:53:20', level: 'SECURITY', module: 'THREAT-SCAN', msg: 'Outbound honeypot probe deflected from AS9009 (Russia/Mirai pattern)' },
    { id: 5, time: '23:52:55', level: 'INFO', module: 'REDIS-CLUSTER', msg: 'Shard 04 cache evictions: 0 (Hit ratio sustained at 98.6%)' },
    { id: 6, time: '23:52:10', level: 'AUDIT', module: 'ADMIN-AUDIT', msg: 'Platform Admin Sarah Jenkins initiated cross-tenant compliance audit' },
  ]);

  // Persist user changes to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('vortex_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('vortex_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('vortex_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('vortex_searches', JSON.stringify(employeeSearches));
  }, [employeeSearches]);

  useEffect(() => {
    localStorage.setItem('vortex_api_keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  // Telemetry jitter effect for realistic developer live metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => {
        const deltaCpu = (Math.random() - 0.48) * 3;
        const deltaReq = Math.floor((Math.random() - 0.48) * 120);
        const deltaLatency = (Math.random() - 0.5) * 0.8;
        return {
          ...prev,
          cpuLoad: Math.min(95, Math.max(20, +(prev.cpuLoad + deltaCpu).toFixed(1))),
          requestsPerSec: Math.max(1200, prev.requestsPerSec + deltaReq),
          avgLatencyMs: Math.min(60, Math.max(6, +(prev.avgLatencyMs + deltaLatency).toFixed(1))),
          networkInMbps: Math.floor(prev.networkInMbps + (Math.random() - 0.5) * 20),
          networkOutMbps: Math.floor(prev.networkOutMbps + (Math.random() - 0.5) * 45),
        };
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Login handler
  const login = (email, password) => {
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      const updatedUser = { ...foundUser, status: 'online', lastActive: 'Just now' };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === foundUser.id ? updatedUser : u));
      return { success: true, user: updatedUser };
    }

    // If new email, infer tenant from domain
    const domain = email.split('@')[1] || '';
    const matchedCompany = companies.find(c => c.domain.toLowerCase() === domain.toLowerCase());

    const isInternalVortex = domain.includes('vortex');
    const role = isInternalVortex ? 'super_developer' : matchedCompany ? 'employee' : 'employee';

    const newUser = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      email,
      role,
      roleLabel: isInternalVortex ? 'Super Developer' : matchedCompany ? 'Employee' : 'Independent Researcher',
      roleCategory: matchedCompany ? 'Company Staff' : 'Individual User',
      companyId: matchedCompany ? matchedCompany.id : null,
      companyName: matchedCompany ? matchedCompany.name : 'Independent (Individual Account)',
      isIndividual: !matchedCompany && !isInternalVortex,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      status: 'online',
      lastActive: 'Just now',
      location: 'Enterprise Remote Node',
      ipAddress: '172.56.21.90',
      mfaEnabled: true,
      securityClearance: 'LEVEL-2 AUTHENTICATED',
      sessionCreated: new Date().toISOString(),
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    return { success: true, user: newUser };
  };

  // Quick switch between the 5 demo roles
  const quickLogin = (roleKey) => {
    const targetUser = users.find(u => u.role === roleKey);
    if (targetUser) {
      const updatedUser = { ...targetUser, status: 'online', lastActive: 'Just now' };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === targetUser.id ? updatedUser : u));
      return updatedUser;
    }
    return null;
  };

  // Logout handler
  const logout = () => {
    if (currentUser) {
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, status: 'offline', lastActive: '5 mins ago' } : u));
    }
    setCurrentUser(null);
  };

  // Terminate/Revoke a specific user's session (Admin Manager & Super Developer capability)
  const revokeUserSession = (userId) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, status: 'offline', lastActive: 'Terminated by Admin' };
      }
      return u;
    }));

    if (currentUser && currentUser.id === userId) {
      logout();
    }
  };

  // Add employee search log (Senior Manager & Employee capability)
  const addEmployeeSearch = (query, category = 'General Search', riskLevel = 'low') => {
    const newLog = {
      id: `srch-${Date.now()}`,
      companyId: currentUser?.companyId || 'comp-apex',
      employeeId: currentUser?.id || 'usr-emp-apex-1',
      employeeName: currentUser?.name || 'Sophia Patel',
      query,
      category,
      riskLevel,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      device: 'Workstation Node / Secure Browser',
      ipAddress: currentUser?.ipAddress || '198.51.100.44',
    };
    setEmployeeSearches(prev => [newLog, ...prev]);
  };

  // Company Developer: Generate new API key
  const createApiKey = (keyData) => {
    const randomHex = Math.random().toString(36).substring(2, 10);
    const newKey = {
      id: `key-${Date.now()}`,
      companyId: currentUser?.companyId || 'comp-apex',
      name: keyData.name || 'New Custom Pipeline Key',
      keyPrefix: `vtx_live_${randomHex}...`,
      scopes: keyData.scopes || ['read:telemetry'],
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      callsThisMonth: '0',
      rateLimit: keyData.rateLimit || '2,500 req/min',
      status: 'active',
    };
    setApiKeys(prev => [newKey, ...prev]);
    return newKey;
  };

  // Company Developer: Revoke an API key
  const revokeApiKey = (keyId) => {
    setApiKeys(prev => prev.map(k => k.id === keyId ? { ...k, status: 'revoked' } : k));
  };

  // Company Developer: Trigger on-demand security scan
  const triggerVulnerabilityScan = (companyId) => {
    // Add simulated newly discovered item or refresh scan
    const newFinding = {
      id: `cve-${Date.now()}`,
      companyId: companyId || currentUser?.companyId || 'comp-apex',
      cve: 'CVE-2026-0914',
      title: 'Post-Quantum TLS Session Key Renegotiation Vulnerability',
      severity: 'medium',
      score: 5.4,
      affectedComponent: 'edge-gateway-v4.prod',
      status: 'Open',
      patchAvailable: true,
      recommendedAction: 'Apply upstream security hotfix KB-90142-PQC',
      discoveredDate: new Date().toISOString().split('T')[0],
    };
    setVulnerabilities(prev => [newFinding, ...prev]);
  };

  // Super Dev: Maintenance mode toggle
  const toggleMaintenanceMode = () => {
    setSystemMetrics(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }));
    setSystemLogs(prev => [
      {
        id: Date.now(),
        time: new Date().toTimeString().split(' ')[0],
        level: 'AUDIT',
        module: 'SYS-MAINT',
        msg: `Platform maintenance mode was ${!systemMetrics.maintenanceMode ? 'ENABLED' : 'DISABLED'} by ${currentUser?.name}`
      },
      ...prev
    ]);
  };

  // Super Dev: Purge cache
  const flushSystemCache = () => {
    setSystemLogs(prev => [
      {
        id: Date.now(),
        time: new Date().toTimeString().split(' ')[0],
        level: 'INFO',
        module: 'REDIS-FLUSH',
        msg: `Global Redis L1/L2 caches successfully invalidated across all 32 nodes.`
      },
      ...prev
    ]);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      companies,
      employeeSearches,
      apiKeys,
      vulnerabilities,
      systemMetrics,
      systemLogs,
      demoPersonas: DEMO_PERSONAS,
      login,
      quickLogin,
      logout,
      revokeUserSession,
      addEmployeeSearch,
      createApiKey,
      revokeApiKey,
      triggerVulnerabilityScan,
      toggleMaintenanceMode,
      flushSystemCache,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
