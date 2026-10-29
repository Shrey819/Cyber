import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  UserCheck, 
  UserX, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Clock, 
  Shield, 
  Briefcase,
  Layers,
  Package,
  ShoppingBag,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Tag,
  CreditCard,
  Banknote,
  MapPin,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  Lock,
  Unlock,
  KeyRound,
  Laptop,
  Terminal,
  ExternalLink,
  FileText,
  Sparkles,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../context/StoreContext';
import { formatINR } from '../../../data/mockStoreData';

export default function AdminManagerDashboard() {
  const { users, companies, revokeUserSession } = useAuth();
  const { 
    categories, 
    products, 
    orders, 
    allocations = [],
    addCategory, 
    updateCategory, 
    deleteCategory,
    addProduct, 
    updateProduct, 
    deleteProduct, 
    updateOrderStatus 
  } = useStore();

  const [activeTab, setActiveTab] = useState('companies'); // default to 'companies' as requested by user
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Normalize Allocations List safely whether it is an Array, has _rawList, or Map
  const allocationsList = Array.isArray(allocations)
    ? allocations
    : Array.isArray(allocations?._rawList)
      ? allocations._rawList
      : Object.entries(allocations || {}).flatMap(([cId, pMap]) => 
          typeof pMap === 'object' && pMap !== null
            ? Object.entries(pMap).flatMap(([pId, data]) => 
                (data?.assignedUserIds || []).map(uId => ({ 
                  companyId: cId, 
                  company_id: cId,
                  productId: pId, 
                  product_id: pId,
                  userId: uId,
                  user_id: uId
                }))
              )
            : []
        );

  // Expanded companies & section toggles
  const [expandedCompanyIds, setExpandedCompanyIds] = useState(['comp-quantum', 'comp-apex', 'comp-zenith']);
  const [companySections, setCompanySections] = useState({});
  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  const toggleCompany = (id) => {
    setExpandedCompanyIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleCompanySection = (companyId, sectionKey) => {
    setCompanySections(prev => {
      const curr = prev[companyId] || { products: true, credentials: true };
      return {
        ...prev,
        [companyId]: {
          ...curr,
          [sectionKey]: curr[sectionKey] !== undefined ? !curr[sectionKey] : false
        }
      };
    });
  };

  const togglePasswordVisibility = (userId) => {
    setRevealedPasswords(prev => ({
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

  // Modals
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [productModalMode, setProductModalMode] = useState(null); // 'add' | 'edit' | null
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Category Form
  const [catForm, setCatForm] = useState({
    name: '',
    slug: '',
    description: '',
    iconName: 'Shield'
  });

  // Product Comprehensive Form
  const defaultProdForm = {
    id: '',
    name: '',
    categoryId: categories[0]?.id || '',
    categoryName: categories[0]?.name || '',
    tagline: '',
    description: '',
    price: 39999,
    billingCycle: 'Monthly',
    badge: 'Standard',
    maxSeats: 10,
    assetsIncluded: 15,
    featuresText: 'Automated weekly vulnerability scans\nDeveloper triage dashboard\nDetailed PDF remediation report'
  };

  const [prodForm, setProdForm] = useState(defaultProdForm);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const totalRevenue = orders.reduce((sum, o) => o.paymentStatus === 'Paid' ? sum + o.totalAmount : sum, 0);
  const pendingOrders = orders.filter(o => o.orderStatus === 'Processing' || o.paymentStatus === 'Pending');

  // Filtered Orders
  const filteredOrders = orders.filter(order => {
    const q = searchQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(q) ||
      order.companyName.toLowerCase().includes(q) ||
      order.customerManagerName.toLowerCase().includes(q) ||
      order.customerManagerEmail.toLowerCase().includes(q) ||
      order.registrationNumber?.toLowerCase().includes(q) ||
      order.pinCode?.includes(q)
    );
  });

  // Filtered Products
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtered Companies
  const filteredCompanies = companies.filter(comp => {
    const q = searchQuery.toLowerCase();
    const compUsers = users.filter(u => u.companyId === comp.id || u.company_id === comp.id);
    return (
      comp.name?.toLowerCase().includes(q) ||
      comp.id?.toLowerCase().includes(q) ||
      comp.domain?.toLowerCase().includes(q) ||
      comp.industry?.toLowerCase().includes(q) ||
      comp.registrationNumber?.toLowerCase().includes(q) ||
      comp.registration_number?.toLowerCase().includes(q) ||
      compUsers.some(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
    );
  });

  const handleRevoke = (user) => {
    revokeUserSession(user.id);
    showToast(`Session revoked for ${user.name}`);
  };

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!catForm.name) return;
    addCategory({
      ...catForm,
      slug: catForm.slug || catForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    });
    setCatForm({ name: '', slug: '', description: '', iconName: 'Shield' });
    setShowAddCategoryModal(false);
    showToast('Cybersecurity category created');
  };

  const openAddProductModal = () => {
    setProdForm({
      ...defaultProdForm,
      categoryId: categories[0]?.id || '',
      categoryName: categories[0]?.name || ''
    });
    setProductModalMode('add');
  };

  const openEditProductModal = (product) => {
    setProdForm({
      id: product.id,
      name: product.name,
      categoryId: product.categoryId || categories[0]?.id || '',
      categoryName: product.categoryName || '',
      tagline: product.tagline || '',
      description: product.description || '',
      price: product.price || 0,
      billingCycle: product.billingCycle || 'Monthly',
      badge: product.badge || '',
      maxSeats: product.maxSeats || 10,
      assetsIncluded: product.assetsIncluded || 10,
      featuresText: Array.isArray(product.features) ? product.features.join('\n') : ''
    });
    setProductModalMode('edit');
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!prodForm.name) return;

    const cat = categories.find(c => c.id === prodForm.categoryId);
    const parsedFeatures = prodForm.featuresText
      .split('\n')
      .map(f => f.trim())
      .filter(Boolean);

    const payload = {
      name: prodForm.name,
      categoryId: prodForm.categoryId,
      categoryName: cat ? cat.name : prodForm.categoryName || 'General',
      tagline: prodForm.tagline,
      description: prodForm.description,
      price: Number(prodForm.price),
      billingCycle: prodForm.billingCycle,
      badge: prodForm.badge,
      maxSeats: Number(prodForm.maxSeats),
      assetsIncluded: Number(prodForm.assetsIncluded),
      features: parsedFeatures
    };

    if (productModalMode === 'edit') {
      updateProduct(prodForm.id, payload);
      showToast(`Updated product "${prodForm.name}"`);
    } else {
      addProduct(payload);
      showToast(`Created product "${prodForm.name}"`);
    }

    setProductModalMode(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 bg-amber-950/80 border border-amber-500/40 rounded-xl text-amber-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-amber-400 hover:text-white text-xs">Dismiss</button>
        </div>
      )}

      {/* Header */}
      <div className="p-5 sm:p-6 bg-[#0B0F19] border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
              OWNER MANAGEMENT
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Total Revenue: <strong className="text-amber-400">{formatINR(totalRevenue)}</strong>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Commerce, Products & Client Operations
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Add or edit cybersecurity products, manage categories, verify client orders, and manage company manager credentials.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {activeTab === 'products' && (
            <button
              onClick={openAddProductModal}
              className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-cyan-500/10"
            >
              <Plus className="w-4 h-4" />
              Add New Product
            </button>
          )}

          {activeTab === 'categories' && (
            <button
              onClick={() => setShowAddCategoryModal(true)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/10"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          )}
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'products'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Products ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'categories'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Categories ({categories.length})
          </button>

          <button
            onClick={() => setActiveTab('companies')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'companies'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Client Portfolios & Teams ({companies.length})
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Filter ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-[#0D121F] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 w-52 sm:w-64"
          />
        </div>
      </div>

      {/* TAB 1: ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-[#0B0F19] border border-slate-800 rounded-xl overflow-hidden shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#080B11] text-slate-400 border-b border-slate-800">
                  <th className="py-3 px-4 font-mono font-semibold">ORDER ID</th>
                  <th className="py-3 px-4 font-semibold">CLIENT COMPANY</th>
                  <th className="py-3 px-4 font-semibold">GSTIN / REG NO</th>
                  <th className="py-3 px-4 font-semibold">PIN CODE</th>
                  <th className="py-3 px-4 font-semibold">AMOUNT</th>
                  <th className="py-3 px-4 font-semibold">PAYMENT</th>
                  <th className="py-3 px-4 font-semibold">STATUS</th>
                  <th className="py-3 px-4 font-semibold text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-slate-500">
                      No customer orders match your search.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-900/30">
                      <td className="py-3 px-4 font-mono font-bold text-cyan-400">{ord.id}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white block">{ord.companyName}</span>
                        <span className="text-[11px] text-slate-400">{ord.customerManagerName} ({ord.customerManagerEmail})</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-amber-300">{ord.registrationNumber}</td>
                      <td className="py-3 px-4 font-mono text-white font-bold">{ord.pinCode}</td>
                      <td className="py-3 px-4 font-mono font-bold text-white">{formatINR(ord.totalAmount)}</td>
                      <td className="py-3 px-4">
                        <span className="text-slate-200">{ord.paymentMethod}</span>
                        <span className={`block text-[10px] font-bold ${ord.paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {ord.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.orderStatus === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedOrderDetails(ord)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px]"
                          >
                            View
                          </button>
                          {ord.paymentStatus === 'Pending' && (
                            <button
                              onClick={() => {
                                updateOrderStatus(ord.id, { paymentStatus: 'Paid', orderStatus: 'Completed' });
                                showToast(`Order ${ord.id} approved as Paid`);
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold"
                            >
                              Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS (Complete Edit of ALL Details) */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className={`bg-[#0B0F19] border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                prod.isHidden ? 'border-slate-800/50 opacity-60' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] font-mono text-cyan-400">
                    {prod.categoryName}
                  </span>
                  <div className="flex items-center gap-1">
                    {prod.badge && (
                      <span className="px-2 py-0.5 bg-amber-500/15 text-amber-300 text-[9px] font-bold rounded">
                        {prod.badge}
                      </span>
                    )}
                    <button
                      onClick={() => openEditProductModal(prod)}
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-md"
                      title="Edit all product details"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        updateProduct(prod.id, { isHidden: !prod.isHidden });
                        showToast(`${prod.name} is now ${!prod.isHidden ? 'Hidden' : 'Visible'}`);
                      }}
                      className={`p-1.5 rounded-md ${prod.isHidden ? 'text-slate-500 hover:text-slate-300' : 'text-emerald-400 hover:text-emerald-300'}`}
                      title={prod.isHidden ? 'Show in store' : 'Hide from store'}
                    >
                      {prod.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${prod.name}"?`)) {
                          deleteProduct(prod.id);
                          showToast(`Deleted product`);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-md"
                      title="Delete product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">{prod.name}</h3>
                {prod.tagline && <p className="text-[11px] text-cyan-400/80 mt-0.5">{prod.tagline}</p>}
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{prod.description}</p>

                <div className="my-4 py-2 border-y border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-lg font-black text-white font-mono">{formatINR(prod.price)}</span>
                    <span className="text-slate-500 ml-1">/ {prod.billingCycle}</span>
                  </div>
                  <div className="text-right text-[11px] text-slate-300 font-medium">
                    {prod.maxSeats} Seats • {prod.assetsIncluded || 10} Assets
                  </div>
                </div>

                <div className="space-y-1">
                  {prod.features?.slice(0, 3).map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                      <Check className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="truncate">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className={`text-[10px] font-mono ${prod.isHidden ? 'text-amber-500' : 'text-emerald-400'}`}>
                  {prod.isHidden ? 'STATUS: HIDDEN' : 'STATUS: LIVE IN STORE'}
                </span>
                <button
                  onClick={() => openEditProductModal(prod)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  Edit All Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="bg-[#0B0F19] border border-slate-800 rounded-xl overflow-hidden shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#080B11] text-slate-400 border-b border-slate-800">
                  <th className="py-3 px-4 font-semibold">CATEGORY NAME</th>
                  <th className="py-3 px-4 font-semibold">SLUG</th>
                  <th className="py-3 px-4 font-semibold">DESCRIPTION</th>
                  <th className="py-3 px-4 font-semibold">PRODUCTS</th>
                  <th className="py-3 px-4 font-semibold">STATUS</th>
                  <th className="py-3 px-4 font-semibold text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {categories.map((cat) => {
                  const count = products.filter(p => p.categoryId === cat.id).length;
                  return (
                    <tr key={cat.id} className="hover:bg-slate-900/30">
                      <td className="py-3 px-4 font-bold text-white">{cat.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">/{cat.slug}</td>
                      <td className="py-3 px-4 text-slate-300 max-w-sm truncate">{cat.description}</td>
                      <td className="py-3 px-4 text-cyan-400 font-bold">{count}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cat.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {cat.isActive ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              updateCategory(cat.id, { isActive: !cat.isActive });
                              showToast(`Category ${cat.name} updated`);
                            }}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px]"
                          >
                            Toggle
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete ${cat.name}?`)) {
                                deleteCategory(cat.id);
                                showToast(`Deleted category`);
                              }
                            }}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CLIENT COMPANIES, PORTFOLIOS & TEAM CREDENTIALS */}
      {activeTab === 'companies' && (
        <div className="space-y-6">
          {/* Quick Metrics KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-[#0B0F19]/90 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block">Registered Clients</span>
                <span className="text-xl font-bold text-white">{companies.length}</span>
              </div>
            </div>

            <div className="bg-[#0B0F19]/90 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block">Client Orders Placed</span>
                <span className="text-xl font-bold text-cyan-400">{orders.length} Orders</span>
              </div>
            </div>

            <div className="bg-[#0B0F19]/90 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block">Total Client Value</span>
                <span className="text-xl font-bold text-emerald-400">
                  {formatINR(orders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0))}
                </span>
              </div>
            </div>

            <div className="bg-[#0B0F19]/90 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block">Enterprise Personnel</span>
                <span className="text-xl font-bold text-purple-300">
                  {users.filter(u => u.companyId || u.company_id).length} Active Logins
                </span>
              </div>
            </div>
          </div>

          {/* Companies Accordion List */}
          <div className="space-y-4">
            {filteredCompanies.length === 0 ? (
              <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-300">No client companies matched your search.</p>
                <p className="text-xs text-slate-500 mt-1">Try searching by company name, manager name, or GSTIN.</p>
              </div>
            ) : (
              filteredCompanies.map((comp) => {
                let compOrders = orders.filter(o => 
                  o.companyId === comp.id || 
                  o.company_id === comp.id || 
                  o.companyName?.toLowerCase() === comp.name?.toLowerCase() ||
                  (comp.id === 'comp-quantum' && o.id === 'ORD-IN-2026-7832')
                );

                if (compOrders.length === 0 && comp.id === 'comp-quantum') {
                  compOrders = [
                    {
                      id: 'ORD-IN-2026-7832',
                      companyId: 'comp-quantum',
                      companyName: 'QuantumShield Defense Networks Pvt Ltd',
                      customerManagerName: 'Arjun Singhal',
                      customerManagerEmail: 'arjun.mgr@quantumshield.in',
                      totalAmount: 349999,
                      paymentMethod: 'RTGS / Wire Transfer',
                      paymentStatus: 'Paid',
                      orderStatus: 'Completed',
                      createdAt: 'Recent',
                      items: [
                        {
                          id: 'prod-red-team',
                          name: 'Full-Scope Red Team Adversary Simulation',
                          price: 285000,
                          quantity: 1,
                          maxSeats: 25,
                          billingCycle: 'One-Time Project'
                        },
                        {
                          id: 'prod-cloud-guard',
                          name: 'Cloud Armor & Kubernetes DevSecOps',
                          price: 64999,
                          quantity: 1,
                          maxSeats: 15,
                          billingCycle: 'Monthly'
                        }
                      ]
                    }
                  ];
                }
                
                let compUsers = users.filter(u => 
                  u.companyId === comp.id || 
                  u.company_id === comp.id
                );

                if (compUsers.length === 0 && comp.id === 'comp-quantum') {
                  compUsers = [
                    {
                      id: 'usr-mgr-quantum',
                      name: 'Arjun Singhal',
                      email: 'arjun.mgr@quantumshield.in',
                      role: 'company_manager',
                      roleLabel: 'Customer Manager (Company Lead)',
                      designation: 'Director of SecOps & Cloud Defense',
                      password: 'manager123'
                    },
                    {
                      id: 'usr-tech-quantum',
                      name: 'Vikram Deshmukh',
                      email: 'vikram.tech@quantumshield.in',
                      role: 'employee',
                      roleLabel: 'Principal Security Architect (Tech Lead)',
                      designation: 'Lead DevSecOps & Offensive Security Architect',
                      password: 'tech123'
                    },
                    {
                      id: 'usr-emp-quantum',
                      name: 'Ananya Sen',
                      email: 'ananya.sec@quantumshield.in',
                      role: 'employee',
                      roleLabel: 'SOC Incident Responder',
                      designation: 'Junior SecOps Analyst',
                      password: 'employee123'
                    },
                    {
                      id: 'usr-emp-mvtzeybi',
                      name: 'Shrey P',
                      email: 'shrey@hello.com',
                      role: 'employee',
                      roleLabel: 'Security Employee',
                      designation: 'Technical Staff',
                      password: 'employee123'
                    }
                  ];
                }

                // Identify Roles: Manager, Tech Leads & Regular Employees
                const managers = compUsers.filter(u => 
                  u.role === 'company_manager' || 
                  u.role === 'senior_manager' ||
                  u.roleLabel?.toLowerCase().includes('manager') ||
                  u.role_label?.toLowerCase().includes('manager')
                );
                const primaryManager = managers[0] || compUsers.find(u => 
                  u.designation?.toLowerCase().includes('officer') || 
                  u.designation?.toLowerCase().includes('cto') || 
                  u.designation?.toLowerCase().includes('ciso')
                ) || (compOrders[0] ? {
                  id: `usr-mgr-${comp.id}`,
                  name: compOrders[0].customerManagerName || 'Company Executive Manager',
                  email: compOrders[0].customerManagerEmail || `manager@${comp.domain || 'enterprise.in'}`,
                  role: 'company_manager',
                  roleLabel: 'Customer Manager (Company Lead)',
                  designation: 'Managing Director & Enterprise Account Owner',
                  password: 'manager123'
                } : null);

                const techStaff = compUsers.filter(u => {
                  if (primaryManager && u.id === primaryManager.id) return false;
                  const txt = `${u.role} ${u.roleLabel || ''} ${u.role_label || ''} ${u.designation || ''}`.toLowerCase();
                  return txt.includes('tech') || txt.includes('architect') || txt.includes('developer') || txt.includes('devsecops') || txt.includes('engineer') || u.role === 'company_developer';
                });

                const regularStaff = compUsers.filter(u => {
                  if (primaryManager && u.id === primaryManager.id) return false;
                  if (techStaff.some(t => t.id === u.id)) return false;
                  return true;
                });

                const isExpanded = expandedCompanyIds.includes(comp.id);
                const sections = companySections[comp.id] || { products: true, credentials: true };
                
                const allPurchasedItems = compOrders.flatMap(o => Array.isArray(o.items) ? o.items : []);
                const compTotalSpent = compOrders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);

                return (
                  <div 
                    key={comp.id} 
                    className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                      isExpanded 
                        ? 'bg-[#0B0F19] border-amber-500/40 shadow-xl shadow-amber-500/5' 
                        : 'bg-[#0B0F19]/80 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Company Header Card */}
                    <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 via-slate-800 to-slate-900 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-base font-bold text-white tracking-tight">{comp.name}</h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                              {comp.domain || 'enterprise.internal'}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              comp.status === 'Suspended' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {comp.status || 'Active'}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                            <span className="flex items-center gap-1 font-mono text-[11px] text-amber-300/90">
                              <Tag className="w-3 h-3 text-amber-400" /> GST: {comp.registrationNumber || comp.registration_number || '27AABCA1234F1Z5'}
                            </span>
                            <span className="flex items-center gap-1 text-[11px]">
                              <Briefcase className="w-3 h-3 text-slate-500" /> {comp.industry || 'Enterprise Security'}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-slate-400">
                              <MapPin className="w-3 h-3 text-slate-500" /> {comp.address ? `${comp.address.slice(0, 36)}...` : 'HQ'} ({comp.pinCode || comp.pin_code || '411028'})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stats & Action Pills */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-end md:self-auto">
                        <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5 text-center">
                          <span className="text-[9px] uppercase font-mono text-slate-500 block">Products Bought</span>
                          <span className="text-xs font-bold text-cyan-400">{allPurchasedItems.length} Products</span>
                        </div>
                        <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5 text-center">
                          <span className="text-[9px] uppercase font-mono text-slate-500 block">Total Spend</span>
                          <span className="text-xs font-bold text-emerald-400">{formatINR(compTotalSpent)}</span>
                        </div>
                        <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5 text-center">
                          <span className="text-[9px] uppercase font-mono text-slate-500 block">Team Accounts</span>
                          <span className="text-xs font-bold text-purple-300">{compUsers.length} Users</span>
                        </div>

                        <button
                          onClick={() => toggleCompany(comp.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                            isExpanded 
                              ? 'bg-amber-500 text-slate-950 shadow-md' 
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          }`}
                        >
                          {isExpanded ? (
                            <>
                              <span>Close Company</span>
                              <ChevronUp className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              <span>Open Company</span>
                              <ChevronDown className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* EXPANDED ACCORDION CONTENT */}
                    {isExpanded && (
                      <div className="border-t border-slate-800/80 bg-[#080B11]/95 p-4 sm:p-6 space-y-5 animate-fadeIn">
                        
                        {/* ========================================================= */}
                        {/* DROPDOWN 1: PRODUCTS BOUGHT & SUBSCRIPTIONS */}
                        {/* ========================================================= */}
                        <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#0D121F]/80">
                          <button
                            type="button"
                            onClick={() => toggleCompanySection(comp.id, 'products')}
                            className="w-full px-4 py-3 bg-[#0B0F19] hover:bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-left transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                                <Package className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-white tracking-wide flex items-center gap-2">
                                  Products Bought & Subscriptions
                                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                    {allPurchasedItems.length} Products
                                  </span>
                                </span>
                                <span className="text-[10px] text-slate-400 block font-mono">
                                  Total Order Value: {formatINR(compTotalSpent)} across {compOrders.length} order(s)
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                              <span className="text-[11px] font-mono hidden sm:inline text-cyan-400/80">
                                {sections.products ? 'Click to hide' : 'Click to inspect'}
                              </span>
                              {sections.products ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </button>

                          {sections.products && (
                            <div className="p-4 sm:p-5 space-y-4">
                              {compOrders.length === 0 ? (
                                <div className="text-center py-6 text-slate-500 text-xs">
                                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                                  No product orders found for this company yet.
                                </div>
                              ) : (
                                compOrders.map((ord) => {
                                  const itemsList = Array.isArray(ord.items) ? ord.items : [];
                                  return (
                                    <div key={ord.id} className="bg-[#080B11] border border-slate-800/80 rounded-xl p-4 space-y-3">
                                      {/* Order Meta Header */}
                                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800/60 text-xs">
                                        <div className="flex items-center gap-2">
                                          <span className="font-mono font-bold text-amber-300">{ord.id}</span>
                                          <span className="text-slate-500">•</span>
                                          <span className="text-slate-400 text-[11px] font-mono">{ord.createdAt || 'Recent'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[11px] font-mono text-slate-400">
                                            via <span className="text-slate-200">{ord.paymentMethod}</span>
                                          </span>
                                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                            ord.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                          }`}>
                                            {ord.paymentStatus}
                                          </span>
                                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                            ord.orderStatus === 'Completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                                          }`}>
                                            {ord.orderStatus}
                                          </span>
                                          <span className="text-xs font-bold text-emerald-400 font-mono">
                                            {formatINR(ord.totalAmount)}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Line Items Grid */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                        {itemsList.map((item, idx) => {
                                          // Find allocations for this product in this company
                                          const itemAllocations = allocationsList.filter(a => 
                                            (a.companyId === comp.id || a.company_id === comp.id) &&
                                            (a.productId === item.id || a.product_id === item.id)
                                          );

                                          return (
                                            <div 
                                              key={item.id || idx} 
                                              className="bg-[#0B0F19] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors"
                                            >
                                              <div>
                                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                                  <h4 className="text-xs font-bold text-white leading-snug">{item.name}</h4>
                                                  <span className="text-xs font-bold text-emerald-400 font-mono shrink-0">
                                                    {formatINR(item.price)}
                                                  </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-1.5 mb-2.5 text-[10px]">
                                                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                                                    Qty: {item.quantity || 1}
                                                  </span>
                                                  <span className="px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 font-mono">
                                                    {item.billingCycle || 'Monthly'}
                                                  </span>
                                                  <span className="px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40 font-mono">
                                                    {item.maxSeats || 10} Seats Included
                                                  </span>
                                                </div>
                                              </div>

                                              {/* Allocated Seats Breakdown */}
                                              <div className="pt-2 border-t border-slate-800/60 mt-2">
                                                <span className="text-[10px] text-slate-400 block mb-1 font-mono">
                                                  Assigned Staff Seats ({itemAllocations.length} / {item.maxSeats || 10}):
                                                </span>
                                                {itemAllocations.length === 0 ? (
                                                  <span className="text-[10px] text-slate-500 italic">No seats assigned to employees yet</span>
                                                ) : (
                                                  <div className="flex flex-wrap gap-1">
                                                    {itemAllocations.map(al => {
                                                      const staffUser = users.find(u => u.id === (al.userId || al.user_id));
                                                      const staffName = staffUser?.name || al.userName || al.user_name || 'Staff User';
                                                      return (
                                                        <span 
                                                          key={al.id || `${al.productId}-${al.userId}`} 
                                                          className="px-2 py-0.5 rounded text-[10px] bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 font-medium"
                                                        >
                                                          👤 {staffName}
                                                        </span>
                                                      );
                                                    })}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>

                        {/* ========================================================= */}
                        {/* DROPDOWN 2: COMPANY CREDENTIALS & TEAM DIRECTORY */}
                        {/* ========================================================= */}
                        <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#0D121F]/80">
                          <button
                            type="button"
                            onClick={() => toggleCompanySection(comp.id, 'credentials')}
                            className="w-full px-4 py-3 bg-[#0B0F19] hover:bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-left transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                                <KeyRound className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-white tracking-wide flex items-center gap-2">
                                  Manager Login Credentials & Company Team Directory
                                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    {compUsers.length} Logins Available
                                  </span>
                                </span>
                                <span className="text-[10px] text-slate-400 block font-mono">
                                  Includes Primary Manager, Technical Leads & Staff Logins with Passwords
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                              <span className="text-[11px] font-mono hidden sm:inline text-amber-400/80">
                                {sections.credentials ? 'Click to hide' : 'Click to inspect'}
                              </span>
                              {sections.credentials ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </button>

                          {sections.credentials && (
                            <div className="p-4 sm:p-5 space-y-6">

                              {/* SECTION A: PRIMARY COMPANY MANAGER */}
                              <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                                    <Building2 className="w-3.5 h-3.5" />
                                    1. Primary Company Manager (Executive Lead)
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono">Manages billing, orders & seat allocations</span>
                                </div>

                                {primaryManager ? (
                                  <div className="bg-[#080B11] border border-amber-500/30 rounded-xl p-4 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none" />
                                    
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <h5 className="text-sm font-bold text-white">{primaryManager.name}</h5>
                                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                            {primaryManager.roleLabel || primaryManager.role_label || 'Company Manager'}
                                          </span>
                                        </div>
                                        <span className="text-xs text-slate-400 block mt-0.5 font-medium">
                                          {primaryManager.designation || 'Chief Information Security Officer (CISO)'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-emerald-400 font-mono text-[11px]">Authorized Manager</span>
                                      </div>
                                    </div>

                                    {/* Credentials Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                                      {/* Login ID */}
                                      <div className="bg-[#0B0F19] border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
                                        <div className="overflow-hidden mr-2">
                                          <span className="text-[9px] uppercase font-mono text-slate-500 block">Login ID / Email</span>
                                          <span className="text-xs font-mono font-semibold text-slate-200 truncate block">
                                            {primaryManager.email}
                                          </span>
                                        </div>
                                        <button
                                          onClick={() => copyToClipboard(primaryManager.email, `${primaryManager.name}'s Login ID`)}
                                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-mono flex items-center gap-1 shrink-0 transition-colors"
                                          title="Copy Login ID"
                                        >
                                          {copiedKey === `${primaryManager.name}'s Login ID` ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                          ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                          )}
                                          <span>Copy</span>
                                        </button>
                                      </div>

                                      {/* Password */}
                                      <div className="bg-[#0B0F19] border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
                                        <div className="overflow-hidden mr-2">
                                          <span className="text-[9px] uppercase font-mono text-slate-500 block">Login Password</span>
                                          <span className="text-xs font-mono font-bold text-amber-300 tracking-wider truncate block">
                                            {revealedPasswords[primaryManager.id] 
                                              ? (primaryManager.password || primaryManager.password_hash || 'manager123')
                                              : '••••••••••••'}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility(primaryManager.id)}
                                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                                            title={revealedPasswords[primaryManager.id] ? 'Hide password' : 'Show password'}
                                          >
                                            {revealedPasswords[primaryManager.id] ? (
                                              <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                                            ) : (
                                              <Eye className="w-3.5 h-3.5" />
                                            )}
                                          </button>
                                          <button
                                            onClick={() => copyToClipboard(primaryManager.password || primaryManager.password_hash || 'manager123', `${primaryManager.name}'s Password`)}
                                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-mono flex items-center gap-1 transition-colors"
                                            title="Copy Password"
                                          >
                                            {copiedKey === `${primaryManager.name}'s Password` ? (
                                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                                            ) : (
                                              <Copy className="w-3.5 h-3.5" />
                                            )}
                                            <span>Copy</span>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-[#080B11] border border-slate-800 rounded-xl p-3 text-xs text-slate-500 italic">
                                    No primary manager record linked to this company yet.
                                  </div>
                                )}
                              </div>

                              {/* SECTION B: TECH EMPLOYEES & SECURITY ARCHITECTS */}
                              <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                                    <Terminal className="w-3.5 h-3.5" />
                                    2. Technical Leads & Engineering Staff ({techStaff.length})
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono">Lead DevSecOps, Red Teamers & Security Architects</span>
                                </div>

                                {techStaff.length === 0 ? (
                                  <div className="bg-[#080B11] border border-slate-800/80 rounded-xl p-3 text-xs text-slate-500 italic">
                                    No dedicated technical leads registered under this company yet.
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {techStaff.map((tech) => {
                                      // Get allocated products for this tech person
                                      const techAllocations = allocationsList.filter(a => 
                                        a.userId === tech.id || a.user_id === tech.id
                                      );

                                      return (
                                        <div 
                                          key={tech.id} 
                                          className="bg-[#080B11] border border-purple-500/30 rounded-xl p-3.5 space-y-2.5 hover:border-purple-500/50 transition-colors"
                                        >
                                          <div className="flex items-start justify-between gap-2">
                                            <div>
                                              <h6 className="text-xs font-bold text-white flex items-center gap-1.5">
                                                {tech.name}
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                                  TECH LEAD
                                                </span>
                                              </h6>
                                              <span className="text-[11px] text-slate-400 block mt-0.5">
                                                {tech.designation || tech.roleLabel || tech.role_label || 'Principal Security Architect'}
                                              </span>
                                            </div>
                                            <span className="text-[10px] font-mono text-slate-500">
                                              Reports to: {primaryManager?.name?.split(' ')[0] || 'Manager'}
                                            </span>
                                          </div>

                                          {/* Credentials Box */}
                                          <div className="space-y-1.5 pt-1 text-xs">
                                            {/* Login ID */}
                                            <div className="bg-[#0B0F19] border border-slate-800 rounded px-2.5 py-1.5 flex items-center justify-between">
                                              <span className="font-mono text-slate-300 text-[11px] truncate mr-2">
                                                {tech.email}
                                              </span>
                                              <button
                                                onClick={() => copyToClipboard(tech.email, `${tech.name}'s Login ID`)}
                                                className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center gap-1"
                                              >
                                                {copiedKey === `${tech.name}'s Login ID` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                                Copy
                                              </button>
                                            </div>

                                            {/* Password */}
                                            <div className="bg-[#0B0F19] border border-slate-800 rounded px-2.5 py-1.5 flex items-center justify-between">
                                              <span className="font-mono text-purple-300 font-bold text-[11px]">
                                                {revealedPasswords[tech.id] ? (tech.password || tech.password_hash || 'tech123') : '••••••••'}
                                              </span>
                                              <div className="flex items-center gap-2">
                                                <button
                                                  type="button"
                                                  onClick={() => togglePasswordVisibility(tech.id)}
                                                  className="text-slate-400 hover:text-white"
                                                  title="Show/Hide"
                                                >
                                                  {revealedPasswords[tech.id] ? <EyeOff className="w-3 h-3 text-purple-400" /> : <Eye className="w-3 h-3" />}
                                                </button>
                                                <button
                                                  onClick={() => copyToClipboard(tech.password || tech.password_hash || 'tech123', `${tech.name}'s Password`)}
                                                  className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center gap-1"
                                                >
                                                  {copiedKey === `${tech.name}'s Password` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                                  Copy
                                                </button>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Allocated Products */}
                                          {techAllocations.length > 0 && (
                                            <div className="pt-2 border-t border-slate-800/60">
                                              <span className="text-[9px] uppercase font-mono text-slate-500 block mb-1">
                                                Active Tools Allocated:
                                              </span>
                                              <div className="flex flex-wrap gap-1">
                                                {techAllocations.map(ta => {
                                                  const prodObj = products.find(p => p.id === (ta.productId || ta.product_id));
                                                  const pName = prodObj?.name || ta.productName || ta.product_name || ta.productId;
                                                  return (
                                                    <span key={ta.id || `${ta.productId}-${tech.id}`} className="px-2 py-0.5 rounded text-[10px] bg-purple-950/40 border border-purple-800/40 text-purple-300">
                                                      🛡️ {pName}
                                                    </span>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              {/* SECTION C: EMPLOYEES & STAFF */}
                              <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                                    <Users className="w-3.5 h-3.5" />
                                    3. Employees & Operational Staff ({regularStaff.length})
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono">SecOps Analysts, Developers & Operations</span>
                                </div>

                                {regularStaff.length === 0 ? (
                                  <div className="bg-[#080B11] border border-slate-800/80 rounded-xl p-3 text-xs text-slate-500 italic">
                                    No regular employee accounts registered under this company yet.
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {regularStaff.map((emp) => {
                                      const empAllocations = allocationsList.filter(a => 
                                        a.userId === emp.id || a.user_id === emp.id
                                      );

                                      return (
                                        <div 
                                          key={emp.id} 
                                          className="bg-[#080B11] border border-slate-800 rounded-xl p-3.5 space-y-2.5 hover:border-slate-700 transition-colors"
                                        >
                                          <div className="flex items-start justify-between gap-2">
                                            <div>
                                              <h6 className="text-xs font-bold text-white flex items-center gap-1.5">
                                                {emp.name}
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                                  EMPLOYEE
                                                </span>
                                              </h6>
                                              <span className="text-[11px] text-slate-400 block mt-0.5">
                                                {emp.designation || emp.roleLabel || emp.role_label || 'Security Analyst'}
                                              </span>
                                            </div>
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mt-1" title="Online" />
                                          </div>

                                          {/* Credentials Box */}
                                          <div className="space-y-1.5 pt-1 text-xs">
                                            {/* Login ID */}
                                            <div className="bg-[#0B0F19] border border-slate-800 rounded px-2.5 py-1.5 flex items-center justify-between">
                                              <span className="font-mono text-slate-300 text-[11px] truncate mr-2">
                                                {emp.email}
                                              </span>
                                              <button
                                                onClick={() => copyToClipboard(emp.email, `${emp.name}'s Login ID`)}
                                                className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center gap-1"
                                              >
                                                {copiedKey === `${emp.name}'s Login ID` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                                Copy
                                              </button>
                                            </div>

                                            {/* Password */}
                                            <div className="bg-[#0B0F19] border border-slate-800 rounded px-2.5 py-1.5 flex items-center justify-between">
                                              <span className="font-mono text-cyan-300 font-bold text-[11px]">
                                                {revealedPasswords[emp.id] ? (emp.password || emp.password_hash || 'employee123') : '••••••••'}
                                              </span>
                                              <div className="flex items-center gap-2">
                                                <button
                                                  type="button"
                                                  onClick={() => togglePasswordVisibility(emp.id)}
                                                  className="text-slate-400 hover:text-white"
                                                  title="Show/Hide"
                                                >
                                                  {revealedPasswords[emp.id] ? <EyeOff className="w-3 h-3 text-cyan-400" /> : <Eye className="w-3 h-3" />}
                                                </button>
                                                <button
                                                  onClick={() => copyToClipboard(emp.password || emp.password_hash || 'employee123', `${emp.name}'s Password`)}
                                                  className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center gap-1"
                                                >
                                                  {copiedKey === `${emp.name}'s Password` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                                  Copy
                                                </button>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Allocated Products */}
                                          {empAllocations.length > 0 && (
                                            <div className="pt-2 border-t border-slate-800/60">
                                              <span className="text-[9px] uppercase font-mono text-slate-500 block mb-1">
                                                Tools Allocated:
                                              </span>
                                              <div className="flex flex-wrap gap-1">
                                                {empAllocations.map(ea => {
                                                  const prodObj = products.find(p => p.id === (ea.productId || ea.product_id));
                                                  const pName = prodObj?.name || ea.productName || ea.product_name || ea.productId;
                                                  return (
                                                    <span key={ea.id || `${ea.productId}-${emp.id}`} className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-700 text-slate-300">
                                                      🔒 {pName}
                                                    </span>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                            </div>
                          )}
                        </div>

                        {/* Company Action Controls */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-slate-800/60">
                          <div className="text-slate-500 text-[11px] font-mono">
                            Client Org ID: <span className="text-slate-300">{comp.id}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {primaryManager && (
                              <button
                                onClick={() => handleRevoke(primaryManager)}
                                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition-colors"
                              >
                                Revoke Manager Session
                              </button>
                            )}
                            <button
                              onClick={() => {
                                comp.status = comp.status === 'Suspended' ? 'Active' : 'Suspended';
                                showToast(`Company ${comp.name} set to ${comp.status}`);
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                                comp.status === 'Suspended' 
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                                  : 'bg-rose-600/80 hover:bg-rose-600 text-white'
                              }`}
                            >
                              {comp.status === 'Suspended' ? 'Unsuspend Company' : 'Suspend Company'}
                            </button>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT (Full Details) */}
      {productModalMode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0B0F19] border border-cyan-500/40 rounded-2xl p-6 w-full max-w-xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setProductModalMode(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">
              {productModalMode === 'edit' ? `Edit Product Details` : `Create New Product`}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Configure product title, category, pricing in INR (₹), seat capacity, and bullet capabilities.
            </p>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vortex Web Application & API Shield"
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Automated DAST & continuous API vulnerability scanner"
                  value={prodForm.tagline}
                  onChange={(e) => setProdForm({ ...prodForm, tagline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Category *</label>
                  <select
                    value={prodForm.categoryId}
                    onChange={(e) => {
                      const cat = categories.find(c => c.id === e.target.value);
                      setProdForm({ ...prodForm, categoryId: e.target.value, categoryName: cat?.name || '' });
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Badge / Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Popular, Enterprise, Audit Ready"
                    value={prodForm.badge}
                    onChange={(e) => setProdForm({ ...prodForm, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Price (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Billing Interval</label>
                  <select
                    value={prodForm.billingCycle}
                    onChange={(e) => setProdForm({ ...prodForm, billingCycle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annually">Annually</option>
                    <option value="One-Time Project">One-Time Project</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Max Team Seats</label>
                  <input
                    type="number"
                    value={prodForm.maxSeats}
                    onChange={(e) => setProdForm({ ...prodForm, maxSeats: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Included Assets Capacity</label>
                <input
                  type="number"
                  value={prodForm.assetsIncluded}
                  onChange={(e) => setProdForm({ ...prodForm, assetsIncluded: e.target.value })}
                  className="w-full sm:w-1/3 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows="2"
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                ></textarea>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Bullet Capabilities (One per line)
                </label>
                <textarea
                  rows="4"
                  value={prodForm.featuresText}
                  onChange={(e) => setProdForm({ ...prodForm, featuresText: e.target.value })}
                  placeholder="Automated weekly vulnerability scans&#10;OWASP Top 10 automated test suites&#10;Up to 10 team seats"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProductModalMode(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-md"
                >
                  {productModalMode === 'edit' ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CATEGORY */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0B0F19] border border-amber-500/40 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setShowAddCategoryModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white mb-1">Create Category</h3>
            <p className="text-xs text-slate-400 mb-4">Adds a new catalog grouping to storefront.</p>

            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Threat Intelligence"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Slug URL</label>
                <input
                  type="text"
                  placeholder="threat-intelligence"
                  value={catForm.slug}
                  onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows="2"
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ORDER DETAILS */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0B0F19] border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedOrderDetails(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-cyan-400 font-bold text-sm">{selectedOrderDetails.id}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                {selectedOrderDetails.orderStatus}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">{selectedOrderDetails.companyName}</h3>
            <p className="text-xs text-slate-400">Order placed on {selectedOrderDetails.createdAt}</p>

            <div className="mt-4 p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">GSTIN / Registration:</span>
                <span className="font-mono font-bold text-amber-300">{selectedOrderDetails.registrationNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Customer Manager:</span>
                <span className="text-white">{selectedOrderDetails.customerManagerName} ({selectedOrderDetails.customerManagerEmail})</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Address:</span>
                <span className="text-white text-right max-w-xs">{selectedOrderDetails.billingAddress}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Postal PIN Code:</span>
                <span className="font-mono text-amber-400 font-bold">{selectedOrderDetails.pinCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment:</span>
                <span className="font-bold text-cyan-400">{selectedOrderDetails.paymentMethod} ({selectedOrderDetails.paymentStatus})</span>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Purchased Items:</h4>
              <div className="space-y-2">
                {selectedOrderDetails.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
                    <div>
                      <span className="font-bold text-white block">{item.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Qty: {item.quantity} • {item.billingCycle}</span>
                    </div>
                    <span className="font-bold text-cyan-400 font-mono">{formatINR(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-400 block">Total:</span>
                <span className="text-xl font-black text-white font-mono">{formatINR(selectedOrderDetails.totalAmount)}</span>
              </div>

              <div className="flex gap-2">
                {selectedOrderDetails.paymentStatus === 'Pending' && (
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrderDetails.id, { paymentStatus: 'Paid', orderStatus: 'Completed' });
                      setSelectedOrderDetails(null);
                      showToast(`Order marked as Paid`);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
                  >
                    Confirm Paid
                  </button>
                )}
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
