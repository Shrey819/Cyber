import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  UserCheck, 
  UserX, 
  ShieldCheck, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Shield, 
  Briefcase, 
  KeyRound, 
  Check, 
  Plus, 
  Trash2, 
  Lock, 
  Layers, 
  ChevronRight, 
  Package,
  Eye,
  EyeOff,
  Copy,
  Tag,
  CreditCard,
  Sparkles,
  ExternalLink,
  Laptop,
  Terminal,
  X,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../context/StoreContext';
import { formatINR } from '../../../data/mockStoreData';

export default function SeniorManagerDashboard() {
  const { currentUser, users, setUsers } = useAuth();
  const { 
    products, 
    orders, 
    allocations = [], 
    assignProductSeat, 
    revokeProductSeat, 
    fetchCompanyAllocations, 
    inviteTeamMember 
  } = useStore();

  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'team' | 'all'
  const [toastMessage, setToastMessage] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);
  const [processingUser, setProcessingUser] = useState(null);
  const [assignModalMember, setAssignModalMember] = useState(null);
  const [modalSelectedProduct, setModalSelectedProduct] = useState('');

  // Invitation Form
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role: 'employee',
    designation: 'Security Analyst',
    tempPassword: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const togglePasswordVisibility = (userId) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    showToast(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const companyId = currentUser?.companyId || currentUser?.company_id || 'comp-quantum';
  const companyName = currentUser?.companyName || currentUser?.company_name || 'QuantumShield Defense Networks Pvt Ltd';

  // Fetch company allocations on mount
  useEffect(() => {
    if (companyId && fetchCompanyAllocations) {
      fetchCompanyAllocations(companyId);
    }
  }, [companyId]);

  // 1. My Company's Staff Members (Filtered from live DB or fallback)
  let teamMembers = users.filter(u => 
    (u.companyId === companyId || u.company_id === companyId) && 
    u.id !== currentUser?.id
  );

  // Fallback defaults for QuantumShield if loading
  if (teamMembers.length === 0 && companyId === 'comp-quantum') {
    teamMembers = [
      {
        id: 'usr-tech-quantum',
        name: 'Vikram Deshmukh',
        email: 'vikram.tech@quantumshield.in',
        role: 'employee',
        roleLabel: 'Principal Security Architect (Tech Lead)',
        designation: 'Lead DevSecOps & Offensive Security Architect',
        password: 'tech123',
        status: 'online',
        securityClearance: 'OPERATIONAL TIER-1 (TECH LEAD)'
      },
      {
        id: 'usr-emp-quantum',
        name: 'Ananya Sen',
        email: 'ananya.sec@quantumshield.in',
        role: 'employee',
        roleLabel: 'SOC Incident Responder',
        designation: 'Junior SecOps Analyst',
        password: 'employee123',
        status: 'online',
        securityClearance: 'OPERATIONAL TIER-2'
      }
    ];
  }

  // 2. Purchased Products for this company from Orders
  const myCompanyOrders = orders.filter(o => 
    o.companyId === companyId || 
    o.company_id === companyId || 
    o.companyName?.toLowerCase() === companyName?.toLowerCase()
  );

  let purchasedItems = myCompanyOrders.flatMap(o => {
    const rawItems = Array.isArray(o.items) ? o.items : [];
    return rawItems.map(item => ({
      ...item,
      orderId: o.id,
      orderStatus: o.orderStatus || o.order_status || 'Completed',
      paymentStatus: o.paymentStatus || o.payment_status || 'Paid',
      paymentMethod: o.paymentMethod || o.payment_method || 'RTGS / Wire Transfer',
      orderDate: o.createdAt || o.created_at || 'Recent'
    }));
  });

  // Ensure default QuantumShield products show up reliably
  if (purchasedItems.length === 0) {
    if (companyId === 'comp-quantum') {
      purchasedItems = [
        {
          id: 'prod-red-team',
          name: 'Full-Scope Red Team Adversary Simulation',
          price: 285000,
          quantity: 1,
          maxSeats: 25,
          billingCycle: 'One-Time Project',
          paymentStatus: 'Paid',
          orderStatus: 'Processing',
          paymentMethod: 'RTGS / Wire Transfer',
          orderId: 'ORD-IN-2026-7832',
          categoryName: 'VAPT & Offensive Security'
        },
        {
          id: 'prod-cloud-guard',
          name: 'Cloud Armor & Kubernetes DevSecOps',
          price: 64999,
          quantity: 1,
          maxSeats: 15,
          billingCycle: 'Monthly',
          paymentStatus: 'Paid',
          orderStatus: 'Processing',
          paymentMethod: 'RTGS / Wire Transfer',
          orderId: 'ORD-IN-2026-7832',
          categoryName: 'Cloud Security Posture'
        }
      ];
    } else {
      purchasedItems = [
        {
          id: 'prod-web-scan',
          name: 'Vortex Web Application & API Shield',
          price: 39999,
          quantity: 1,
          maxSeats: 10,
          billingCycle: 'Monthly',
          paymentStatus: 'Paid',
          orderStatus: 'Completed',
          paymentMethod: 'Corporate Net Banking',
          orderId: 'ORD-IN-2026-8491',
          categoryName: 'VAPT & Application Security'
        },
        {
          id: 'prod-cloud-guard',
          name: 'Cloud Armor & Kubernetes DevSecOps',
          price: 64999,
          quantity: 1,
          maxSeats: 15,
          billingCycle: 'Monthly',
          paymentStatus: 'Paid',
          orderStatus: 'Completed',
          paymentMethod: 'Corporate Net Banking',
          orderId: 'ORD-IN-2026-8491',
          categoryName: 'Cloud Security Posture'
        }
      ];
    }
  }

  const totalCompanySpend = purchasedItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

  // Helper to get Product Details (Name, Price, Category)
  const getProductInfo = (productId) => {
    if (!productId) return { id: '', name: 'Unknown Tool', price: 0 };
    const cleanId = typeof productId === 'string' ? productId.trim() : '';
    const fromPurchased = purchasedItems.find(p => (p.id || p.productId) === cleanId);
    if (fromPurchased) return fromPurchased;
    const fromProducts = (products || []).find(p => p.id === cleanId);
    if (fromProducts) return fromProducts;
    const fallbackMap = {
      'prod-red-team': { id: 'prod-red-team', name: 'Full-Scope Red Team Adversary Simulation', price: 285000 },
      'prod-cloud-guard': { id: 'prod-cloud-guard', name: 'Cloud Armor & Kubernetes DevSecOps', price: 64999 },
      'prod-web-scan': { id: 'prod-web-scan', name: 'Vortex Web Application & API Shield', price: 39999 },
      'prod-compliance-hub': { id: 'prod-compliance-hub', name: 'Automated ISO 27001 & DPDP Audit Readiness', price: 52999 },
      'prod-247-soc': { id: 'prod-247-soc', name: '24/7 Managed SOC & MDR Response Unit', price: 159999 }
    };
    return fallbackMap[cleanId] || { id: cleanId, name: cleanId, price: 0 };
  };

  // Normalize Allocations List from Neon DB
  let companyAllocationsList = [];
  if (Array.isArray(allocations)) {
    companyAllocationsList = allocations.filter(a => a.companyId === companyId || a.company_id === companyId);
  } else if (Array.isArray(allocations?._rawList) && allocations._rawList.length > 0) {
    companyAllocationsList = allocations._rawList.filter(a => a.companyId === companyId || a.company_id === companyId);
  } else if (allocations && allocations[companyId]) {
    companyAllocationsList = Object.entries(allocations[companyId]).flatMap(([prodId, data]) => 
      (data.assignedUserIds || []).map(uId => ({
        companyId,
        productId: prodId,
        userId: uId
      }))
    );
  }

  // Get available products for an employee (strictly company's purchased products only)
  const getAvailableProductsForMember = (userId) => {
    const memberAlloc = companyAllocationsList.filter(a => 
      (a.userId === userId || a.user_id === userId)
    );
    const assignedIds = new Set(memberAlloc.map(a => a.productId || a.product_id));

    // Only products purchased by this company that are not yet assigned to this user
    const unassignedPurchased = purchasedItems.filter(p => !assignedIds.has(p.id || p.productId));

    return {
      purchased: unassignedPurchased,
      totalCount: unassignedPurchased.length
    };
  };

  // Real-time Database Assignment Handler
  const handleAssignSeat = async (targetCompanyId, productId, userId, userName) => {
    if (!targetCompanyId || !productId || !userId) return;
    setProcessingUser(userId);
    try {
      const prod = getProductInfo(productId);
      const prodName = prod?.name || productId;
      const res = await assignProductSeat(targetCompanyId, productId, userId);
      if (res && res.error) {
        showToast(`❌ Error: ${res.error}`);
      } else {
        showToast(`🛡️ Assigned "${prodName}" to ${userName}! Real-time DB updated.`);
      }
    } catch (err) {
      showToast(`❌ Failed to assign: ${err.message}`);
    } finally {
      setProcessingUser(null);
    }
  };

  // Real-time Database Revocation Handler
  const handleRevokeSeat = async (targetCompanyId, productId, userId, userName) => {
    if (!targetCompanyId || !productId || !userId) return;
    setProcessingUser(userId);
    try {
      const prod = getProductInfo(productId);
      const prodName = prod?.name || productId;
      const res = await revokeProductSeat(targetCompanyId, productId, userId);
      if (res && res.error) {
        showToast(`❌ Error: ${res.error}`);
      } else {
        showToast(`⚠️ Revoked "${prodName}" from ${userName}. Real-time DB updated.`);
      }
    } catch (err) {
      showToast(`❌ Failed to revoke: ${err.message}`);
    } finally {
      setProcessingUser(null);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteForm.name || !inviteForm.email) return;

    if (inviteTeamMember) {
      const res = await inviteTeamMember({
        companyId,
        companyName,
        name: inviteForm.name,
        email: inviteForm.email,
        role: inviteForm.role,
        tempPassword: inviteForm.tempPassword || 'employee123'
      });

      if (res && res.success) {
        setShowInviteModal(false);
        setInviteForm({ name: '', email: '', role: 'employee', designation: 'Security Analyst', tempPassword: '' });
        showToast(`Invited ${res.user.name} saved into PostgreSQL database!`);
        return;
      } else {
        showToast(`Invite error: ${res?.error || 'Failed to invite'}`);
        return;
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center justify-between animate-fadeIn shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white text-xs">Dismiss</button>
        </div>
      )}

      {/* Top Banner / Executive Manager Summary */}
      <div className="p-5 sm:p-6 bg-[#0B0F19] border border-cyan-500/20 rounded-2xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold uppercase tracking-wider">
                COMPANY MANAGER PORTAL
              </span>
              <span className="text-xs text-slate-300 font-mono font-medium">
                {companyName}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{currentUser?.name || 'Company Manager'}</span>
              <span className="text-xs font-normal text-slate-400 font-mono">({currentUser?.email})</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Overview of all cybersecurity products purchased by <span className="text-cyan-400 font-semibold">{companyName}</span> and active credentials for your technical employees and operational staff.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Invite New Employee</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Products Purchased</span>
            <span className="text-base font-bold text-cyan-400">{purchasedItems.length} Products</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Total Investment</span>
            <span className="text-base font-bold text-emerald-400">{formatINR(totalCompanySpend)}</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Existing Employees</span>
            <span className="text-base font-bold text-purple-300">{teamMembers.length} Staff Accounts</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Assigned Seats</span>
            <span className="text-base font-bold text-amber-300">{companyAllocationsList.length} Active Seats</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'products'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Products Purchased & Pricing ({purchasedItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'team'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Existing Employees & Passwords ({teamMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>View All Together</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. PRODUCTS PURCHASED: ITEM NAME LIST AND PRICE */}
      {/* ========================================================================= */}
      {(activeTab === 'products' || activeTab === 'all') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-cyan-400" />
                <span>Purchased Products & Pricing Breakdown</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Every product item licensed by <span className="text-slate-200 font-semibold">{companyName}</span> with official unit pricing and seat capacity.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl">
              Total Spend: {formatINR(totalCompanySpend)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {purchasedItems.map((prod, idx) => {
              // Find which employees have been allocated this product
              const itemAllocations = companyAllocationsList.filter(a => 
                a.productId === (prod.id || prod.productId) || 
                a.product_id === (prod.id || prod.productId)
              );
              const assignedUserIds = new Set(itemAllocations.map(a => a.userId || a.user_id));
              const availableMembers = teamMembers.filter(m => !assignedUserIds.has(m.id));

              return (
                <div 
                  key={prod.id || idx} 
                  className="bg-[#0B0F19] border border-cyan-500/30 hover:border-cyan-500/50 rounded-2xl p-5 flex flex-col justify-between shadow-xl transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-bl-full pointer-events-none" />

                  <div>
                    {/* Top Row: Category & Price */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <span className="px-2.5 py-0.5 bg-cyan-500/10 border border-cyan-500/30 rounded-md text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                        {prod.categoryName || 'Cybersecurity Suite'}
                      </span>
                      <div className="text-right">
                        <span className="text-lg font-black text-emerald-400 font-mono block">
                          {formatINR(prod.price)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono block">
                          {prod.billingCycle || 'One-Time Project'}
                        </span>
                      </div>
                    </div>

                    {/* Product Name */}
                    <h3 className="text-base font-bold text-white tracking-tight leading-snug mb-1.5">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      {prod.description || 'Enterprise security scanner and telemetry protection licensed for your organization.'}
                    </p>

                    {/* Order Reference & Seats Pill */}
                    <div className="flex flex-wrap items-center gap-2 mb-4 text-[10px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        Order Ref: <span className="text-amber-300">{prod.orderId || 'ORD-IN-2026-7832'}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        Seats: <span className="text-cyan-300">{itemAllocations.length} / {prod.maxSeats || 15} Active</span>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        {prod.paymentStatus || 'Paid'}
                      </span>
                    </div>

                    {/* Currently Delegated Employees */}
                    <div className="pt-3 border-t border-slate-800/80">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                        Assigned Employees ({itemAllocations.length}):
                      </span>

                      {itemAllocations.length === 0 ? (
                        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-center text-xs text-slate-500 italic">
                          No employees assigned to this tool yet. Use the dropdown below to allocate a seat.
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {itemAllocations.map(al => {
                            const empMember = teamMembers.find(m => m.id === (al.userId || al.user_id));
                            const empName = empMember?.name || al.userName || al.user_name || 'Staff Member';
                            const empRole = empMember?.roleLabel || empMember?.role_label || 'Employee';

                            return (
                              <div 
                                key={al.id || `${al.productId}-${al.userId}`} 
                                className="flex items-center justify-between p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs"
                              >
                                <div>
                                  <span className="font-semibold text-slate-200 block">{empName}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">{empRole}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    revokeProductSeat(companyId, prod.id || prod.productId, al.userId || al.user_id);
                                    showToast(`Revoked seat from ${empName}`);
                                  }}
                                  className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                                >
                                  Revoke Seat
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Assign Seat to Employee Dropdown */}
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1.5 uppercase">
                      Delegate Seat to Employee:
                    </span>
                    <div className="flex items-center gap-2">
                      <select
                        id={`select-user-${prod.id || idx}`}
                        className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                        defaultValue=""
                      >
                        <option value="" disabled>Select an employee...</option>
                        {availableMembers.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.roleLabel || m.designation || 'Staff'})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const selectEl = document.getElementById(`select-user-${prod.id || idx}`);
                          const userId = selectEl.value;
                          if (!userId) {
                            showToast('Please select an employee first.');
                            return;
                          }
                          assignProductSeat(companyId, prod.id || prod.productId, userId);
                          showToast(`Seat assigned to team member!`);
                        }}
                        className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl shrink-0 transition-colors cursor-pointer"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EXISTING EMPLOYEES: NAME, ROLE AND PASSWORD DIRECTORY */}
      {/* ========================================================================= */}
      {(activeTab === 'team' || activeTab === 'all') && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span>Existing Employees & Passwords Directory</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Full list of team members registered under <span className="text-slate-200 font-semibold">{companyName}</span> with credentials and assigned tool access.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-xl">
              {teamMembers.length} Active Accounts
            </span>
          </div>

          <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#080B11] text-slate-400 border-b border-slate-800 uppercase tracking-wider font-mono text-[10px]">
                    <th className="py-3.5 px-4 font-semibold">EMPLOYEE NAME</th>
                    <th className="py-3.5 px-4 font-semibold">ROLE & DESIGNATION</th>
                    <th className="py-3.5 px-4 font-semibold">LOGIN EMAIL / ID</th>
                    <th className="py-3.5 px-4 font-semibold">PASSWORD</th>
                    <th className="py-3.5 px-4 font-semibold">ASSIGNED PRODUCTS</th>
                    <th className="py-3.5 px-4 font-semibold text-center">STATUS</th>
                    <th className="py-3.5 px-4 font-semibold text-center">MANAGE ACCESS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {teamMembers.map((member) => {
                    const memberAllocations = companyAllocationsList.filter(a => 
                      (a.userId === member.id || a.user_id === member.id)
                    );
                    const memberPassword = member.password || member.password_hash || (member.email?.includes('tech') ? 'tech123' : 'employee123');
                    const isPasswordRevealed = visiblePasswords[member.id];
                    const available = getAvailableProductsForMember(member.id);

                    return (
                      <tr key={member.id} className="hover:bg-slate-900/40 transition-colors">
                        {/* Employee Name */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-white text-sm block">{member.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">ID: {member.id}</span>
                        </td>

                        {/* Role & Designation */}
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 inline-block mb-1">
                            {member.roleLabel || member.role_label || member.role}
                          </span>
                          <span className="text-[11px] text-slate-400 block font-medium">
                            {member.designation || 'Technical Staff'}
                          </span>
                        </td>

                        {/* Login ID / Email */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-200 text-xs">{member.email}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(member.email, `${member.name}'s Email`)}
                              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                              title="Copy Login Email"
                            >
                              {copiedKey === `${member.name}'s Email` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Password (with Eye Show/Hide and Copy) */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5 w-fit">
                            <span className="font-mono font-bold text-amber-300 text-xs tracking-wider">
                              {isPasswordRevealed ? memberPassword : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(member.id)}
                              className="text-slate-400 hover:text-white ml-1 transition-colors"
                              title={isPasswordRevealed ? "Hide Password" : "Show Password"}
                            >
                              {isPasswordRevealed ? (
                                <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(memberPassword, `${member.name}'s Password`)}
                              className="text-slate-400 hover:text-white transition-colors"
                              title="Copy Password"
                            >
                              {copiedKey === `${member.name}'s Password` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Assigned Products (Interactive Revoke & Quick Assign) */}
                        <td className="py-3.5 px-4 min-w-[280px]">
                          {memberAllocations.length === 0 ? (
                            <div className="text-slate-500 italic text-[11px] mb-2 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 text-slate-600" />
                              <span>No tools assigned</span>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {memberAllocations.map(al => {
                                const prodId = al.productId || al.product_id;
                                const prodInfo = getProductInfo(prodId);
                                const prodName = prodInfo?.name || al.productName || al.product_name || prodId;

                                return (
                                  <span 
                                    key={al.id || `${prodId}-${member.id}`} 
                                    className="group inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-200 border border-cyan-500/30 hover:border-cyan-500/60 rounded-lg text-[11px] font-medium shadow-sm transition-all"
                                    title={`${prodName} (${prodId})`}
                                  >
                                    <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                    <span className="truncate max-w-[155px] font-semibold">{prodName}</span>
                                    <button
                                      type="button"
                                      disabled={processingUser === member.id}
                                      onClick={() => handleRevokeSeat(companyId, prodId, member.id, member.name)}
                                      className="p-0.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded transition-all cursor-pointer ml-0.5"
                                      title={`Revoke ${prodName} from ${member.name} (Real-time DB)`}
                                    >
                                      <X className="w-3.5 h-3.5 text-rose-400 hover:scale-110" />
                                    </button>
                                  </span>
                                );
                              })}
                            </div>
                          )}

                          {/* Quick Inline Assign Product Dropdown (Purchased Products Only) */}
                          {available.totalCount > 0 ? (
                            <div className="flex items-center gap-1.5">
                              <select
                                id={`inline-assign-${member.id}`}
                                disabled={processingUser === member.id}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleAssignSeat(companyId, e.target.value, member.id, member.name);
                                    e.target.value = '';
                                  }
                                }}
                                defaultValue=""
                                className="bg-slate-900 border border-slate-700/80 hover:border-cyan-500/60 text-cyan-300 hover:text-cyan-200 text-[11px] rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-400 font-mono transition-colors cursor-pointer max-w-[250px] truncate"
                              >
                                <option value="" disabled>+ Assign Purchased Tool...</option>
                                {available.purchased.map(p => (
                                  <option key={p.id || p.productId} value={p.id || p.productId}>
                                    🛡️ {p.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <span className="text-[10px] text-emerald-400/80 font-mono flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> All purchased tools assigned
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            member.status === 'online' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {member.status?.toUpperCase() || 'ONLINE'}
                          </span>
                        </td>

                        {/* Manage Access Action Button */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setAssignModalMember(member);
                              setModalSelectedProduct('');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:border-purple-400 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm"
                            title="Open tool assignment manager for this member"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                            <span>Manage Access</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INVITE TEAM MEMBER */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0B0F19] border border-cyan-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-1">Invite Internal Team Member</h3>
            <p className="text-xs text-slate-400 mb-4">Add a new Employee or Developer to {companyName}.</p>

            <form onSubmit={handleInviteMember} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neha Verma"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="neha@quantumshield.in"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Role & Permissions</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="employee">Employee / Technical Staff</option>
                  <option value="company_developer">Company Developer (Vulnerability Scanner execution)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Login Password</label>
                <input
                  type="password"
                  placeholder="Set login password (default: employee123)"
                  value={inviteForm.tempPassword}
                  onChange={(e) => setInviteForm({ ...inviteForm, tempPassword: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer"
                >
                  Save & Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANAGE TOOL ACCESS FOR EMPLOYEE */}
      {assignModalMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0B0F19] border border-cyan-500/40 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
            <button
              type="button"
              onClick={() => setAssignModalMember(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold font-mono text-sm">
                {assignModalMember.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Manage Product Access: {assignModalMember.name}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {assignModalMember.roleLabel || assignModalMember.designation || 'Staff'} • <span className="font-mono text-cyan-400">{assignModalMember.email}</span>
                </p>
              </div>
            </div>

            {/* Currently Assigned Tools */}
            <div className="mb-5 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>Active Product Allocations</span>
                <span className="text-cyan-400 font-mono text-[11px]">
                  {companyAllocationsList.filter(a => a.userId === assignModalMember.id || a.user_id === assignModalMember.id).length} Active
                </span>
              </h4>

              {(() => {
                const mAllocations = companyAllocationsList.filter(a => 
                  (a.userId === assignModalMember.id || a.user_id === assignModalMember.id)
                );
                if (mAllocations.length === 0) {
                  return (
                    <div className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-lg text-xs text-slate-500 italic">
                      No security products currently assigned to this user.
                    </div>
                  );
                }
                return (
                  <div className="space-y-2">
                    {mAllocations.map(al => {
                      const prodId = al.productId || al.product_id;
                      const pInfo = getProductInfo(prodId);
                      return (
                        <div key={prodId} className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-700/60 rounded-xl">
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
                            <div className="truncate">
                              <span className="text-xs font-bold text-white block truncate">{pInfo.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono block">ID: {prodId}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={processingUser === assignModalMember.id}
                            onClick={() => handleRevokeSeat(companyId, prodId, assignModalMember.id, assignModalMember.name)}
                            className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer"
                          >
                            Revoke Seat
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Assign New Product Form (Purchased Products Only) */}
            {(() => {
              const modalAvailable = getAvailableProductsForMember(assignModalMember.id);
              return (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Assign Purchased Security Tool
                  </h4>
                  {modalAvailable.totalCount === 0 ? (
                    <p className="text-xs text-emerald-400 font-mono py-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> All company purchased products are already assigned to this employee.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <select
                        value={modalSelectedProduct}
                        onChange={(e) => setModalSelectedProduct(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer font-mono"
                      >
                        <option value="">Select a purchased product to assign...</option>
                        {modalAvailable.purchased.map(p => (
                          <option key={p.id || p.productId} value={p.id || p.productId}>
                            🛡️ {p.name}
                          </option>
                        ))}
                      </select>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setAssignModalMember(null)}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-medium transition-colors cursor-pointer"
                        >
                          Close
                        </button>
                        <button
                          type="button"
                          disabled={!modalSelectedProduct || processingUser === assignModalMember.id}
                          onClick={async () => {
                            if (!modalSelectedProduct) return;
                            await handleAssignSeat(companyId, modalSelectedProduct, assignModalMember.id, assignModalMember.name);
                            setModalSelectedProduct('');
                          }}
                          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-lg"
                        >
                          Confirm Assignment
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
