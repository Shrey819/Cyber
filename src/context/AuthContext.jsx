import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  COMPANIES as MOCK_COMPANIES, 
  INITIAL_USERS as MOCK_USERS, 
  DEMO_PERSONAS,
  ROLE_CREDENTIALS,
  detectRoleFromInput
} from '../data/mockAuthData';

const AuthContext = createContext(null);
const API_URL = 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('vortex_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return MOCK_USERS[0];
  });

  const [users, setUsers] = useState(MOCK_USERS);
  const [companies, setCompanies] = useState(MOCK_COMPANIES);

  // Sync users & companies from Neon PostgreSQL
  const fetchNeonUsers = async () => {
    try {
      const [uRes, cRes] = await Promise.all([
        fetch(`${API_URL}/users`),
        fetch(`${API_URL}/companies`)
      ]);
      if (uRes.ok && cRes.ok) {
        const uData = await uRes.json();
        const cData = await cRes.json();
        if (Array.isArray(uData) && uData.length > 0) setUsers(uData);
        if (Array.isArray(cData) && cData.length > 0) setCompanies(cData);
      }
    } catch (e) {
      console.warn('Neon backend fetch fallback to local:', e.message);
    }
  };

  useEffect(() => {
    fetchNeonUsers();
  }, []);

  const [apiKeys, setApiKeys] = useState(() => {
    try {
      const saved = localStorage.getItem('vortex_api_keys');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'key-1', companyId: 'comp-apex', name: 'Production Telemetry Ingest', keyPrefix: 'vtx_live_9482', created: '2026-09-08', scope: ['read:telemetry', 'write:events'] },
      { id: 'key-2', companyId: 'comp-apex', name: 'Staging CI/CD Scanner', keyPrefix: 'vtx_test_3310', created: '2026-09-10', scope: ['read:vulns'] }
    ];
  });

  const [vulnerabilities, setVulnerabilities] = useState(() => {
    try {
      const saved = localStorage.getItem('vortex_vulns');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'vuln-1', companyId: 'comp-apex', severity: 'Critical', title: 'SQL Injection in /api/v1/checkout', asset: 'api.apextech.com', status: 'Open', reportedAt: 'Today' },
      { id: 'vuln-2', companyId: 'comp-apex', severity: 'High', title: 'Missing Content-Security-Policy header', asset: 'portal.apextech.com', status: 'In Progress', reportedAt: 'Yesterday' }
    ];
  });

  const [employeeSearches, setEmployeeSearches] = useState([]);

  const createApiKey = (name, scope) => {
    const newK = {
      id: `key-${Date.now()}`,
      companyId: currentUser?.companyId || 'comp-apex',
      name,
      keyPrefix: `vtx_live_${Math.floor(1000 + Math.random() * 9000)}`,
      created: new Date().toISOString().split('T')[0],
      scope: scope || ['read:telemetry']
    };
    setApiKeys(prev => [newK, ...prev]);
    return newK;
  };

  const revokeApiKey = (id) => {
    setApiKeys(prev => prev.filter(k => k.id !== id));
  };

  const triggerVulnerabilityScan = (domain) => {
    return { status: 'queued', domain };
  };

  const addEmployeeSearch = (query) => {
    setEmployeeSearches(prev => [{ query, time: new Date().toLocaleTimeString() }, ...prev]);
  };

  useEffect(() => {
    localStorage.setItem('vortex_api_keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  useEffect(() => {
    localStorage.setItem('vortex_vulns', JSON.stringify(vulnerabilities));
  }, [vulnerabilities]);

  // Telemetry for Super Developer
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

  const [systemLogs, setSystemLogs] = useState([
    { id: 1, time: '19:54:12', level: 'INFO', module: 'NEON-PG', msg: 'Connected to Neon PostgreSQL over TLS 1.3 / Port 443' },
    { id: 2, time: '19:54:02', level: 'INFO', module: 'AUTH-GATEWAY', msg: 'Zero-Trust authorization policies synchronized with neondb' },
  ]);

  const toggleMaintenanceMode = () => {
    setSystemMetrics(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }));
  };

  const flushSystemCache = () => {
    setSystemLogs(prev => [
      {
        id: Date.now(),
        time: new Date().toTimeString().split(' ')[0],
        level: 'INFO',
        module: 'REDIS-FLUSH',
        msg: 'Cache invalidated.'
      },
      ...prev
    ]);
  };

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('vortex_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('vortex_current_user');
    }
  }, [currentUser]);

  // Login via Neon Backend (with fallback only if server offline)
  const login = async (rawInput, rawPass) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: rawInput, password: rawPass })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.user);
        return { success: true, user: data.user, roleLabel: data.user.roleLabel };
      } else {
        // Database explicitly checked credentials and returned accurate error (Incorrect password / User not found)
        return { 
          success: false, 
          error: data.error || 'Authentication failed. Please check your credentials.' 
        };
      }
    } catch (e) {
      console.warn('Backend login unavailable, trying local fallback...', e.message);
    }

    // Local fallback only if backend server is unreachable
    const cleanInput = rawInput.toLowerCase().trim();
    const matchedRole = detectRoleFromInput(rawInput);
    if (matchedRole && rawPass.length >= 3) {
      const targetUser = users.find(u => u.role === matchedRole.roleKey) || MOCK_USERS.find(u => u.role === matchedRole.roleKey);
      if (targetUser) {
        const updated = { ...targetUser, status: 'online' };
        setCurrentUser(updated);
        return { success: true, user: updated, roleLabel: matchedRole.roleLabel };
      }
    }

    const foundUser = users.find(u => u.email.toLowerCase() === cleanInput || u.id.toLowerCase() === cleanInput);
    if (foundUser) {
      if (foundUser.password && foundUser.password !== rawPass) {
        return { success: false, error: 'Incorrect password for this user account.' };
      }
      const updated = { ...foundUser, status: 'online' };
      setCurrentUser(updated);
      return { success: true, user: updated, roleLabel: updated.roleLabel };
    }

    return { success: false, error: 'User account not found with this email or user ID.' };
  };

  // Register User via Neon Backend
  const registerUser = async (formData) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.user);
        fetchNeonUsers();
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || 'Failed to register in Neon.' };
    } catch (e) {
      return { success: false, error: 'Neon Backend connection error: ' + e.message };
    }
  };

  // Update Password in Neon Backend
  const updateUserPassword = async (email, newPassword) => {
    try {
      const res = await fetch(`${API_URL}/auth/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(prev => prev.map(u => 
          (u.email?.toLowerCase() === email.toLowerCase() || u.id?.toLowerCase() === email.toLowerCase())
            ? { ...u, password: newPassword, password_hash: newPassword }
            : u
        ));
        return { success: true, message: data.message };
      }
      return { success: false, error: data.error || 'Failed to update password.' };
    } catch (e) {
      return { success: false, error: 'Backend error: ' + e.message };
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const revokeUserSession = (userId) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'offline' } : u));
    if (currentUser?.id === userId) logout();
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      setCurrentUser,
      users,
      setUsers,
      companies,
      setCompanies,
      apiKeys,
      vulnerabilities,
      employeeSearches,
      createApiKey,
      revokeApiKey,
      triggerVulnerabilityScan,
      addEmployeeSearch,
      systemMetrics,
      systemLogs,
      toggleMaintenanceMode,
      flushSystemCache,
      demoPersonas: DEMO_PERSONAS,
      roleCredentials: ROLE_CREDENTIALS,
      detectRole: detectRoleFromInput,
      login,
      logout,
      registerUser,
      updateUserPassword,
      revokeUserSession,
      refetchNeon: fetchNeonUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
