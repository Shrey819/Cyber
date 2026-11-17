import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Mail, 
  User, 
  MapPin, 
  FileText, 
  ShieldCheck, 
  CreditCard, 
  Banknote, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  ShoppingBag,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  Key,
  ExternalLink,
  HelpCircle,
  Check,
  Copy,
  Info,
  Loader2,
  AlertTriangle,
  X
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../data/mockStoreData';
import { 
  loadRazorpayScript, 
  getRazorpayConfig, 
  createRazorpayOrder 
} from '../utils/razorpay';

export default function CheckoutPage({ onOrderSuccess, onBackToStore }) {
  const { cart, removeFromCart, updateQuantity, placeOrder } = useStore();
  const { setCurrentUser } = useAuth();

  const [formData, setFormData] = useState({
    companyName: '',
    registrationNumber: '',
    officialEmail: '',
    adminName: '',
    password: '',
    confirmPassword: '',
    billingAddress: '',
    pinCode: '',
    country: 'India',
    paymentMethod: 'Online' // 'Online' | 'Cash'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [gatewayConfig, setGatewayConfig] = useState({ 
    isConfigured: true, 
    keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TX8TUb3ZHcKj3H' 
  });
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // GSTIN Auto-Verification States
  const [gstinInput, setGstinInput] = useState('');
  const [isVerifyingGstin, setIsVerifyingGstin] = useState(false);
  const [gstinError, setGstinError] = useState('');
  const [verifiedGstData, setVerifiedGstData] = useState(null);
  const [showGstModal, setShowGstModal] = useState(false);
  const [copiedGstDetails, setCopiedGstDetails] = useState(false);
  const [gstAppliedStatus, setGstAppliedStatus] = useState(null);

  const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Check Razorpay Gateway configuration on mount & ensure SDK script is loaded
  useEffect(() => {
    getRazorpayConfig().then((cfg) => {
      if (cfg && cfg.keyId) setGatewayConfig(cfg);
    });
    loadRazorpayScript();
  }, []);

  const handlePinChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData({ ...formData, pinCode: val });
  };

  const copyEnvSnippet = () => {
    const snippet = `RAZORPAY_KEY_ID=your_key_id_here\nRAZORPAY_KEY_SECRET=your_key_secret_here`;
    navigator.clipboard?.writeText(snippet);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // 1. Verify GSTIN against Backend API
  const handleVerifyGstin = async () => {
    setGstinError('');
    const raw = (gstinInput || formData.registrationNumber || '').trim().toUpperCase();

    if (!raw) {
      setGstinError('Please enter a 15-character GSTIN to verify.');
      return;
    }

    // 15-character Indian GSTIN Regex
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstinRegex.test(raw)) {
      setGstinError('Invalid GSTIN format. Expected 15 characters (e.g. 27AAACT2727Q1ZW).');
      return;
    }

    setIsVerifyingGstin(true);
    try {
      // Try relative Vite proxy first, fallback to explicit port 5000
      let res;
      try {
        res = await fetch(`/api/gstin/verify/${encodeURIComponent(raw)}`);
      } catch (proxyErr) {
        res = await fetch(`http://localhost:5000/api/gstin/verify/${encodeURIComponent(raw)}`);
      }

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        if (res.status === 404 || text.includes('Cannot GET')) {
          setGstinError('GSTIN verification endpoint not loaded in backend. Please restart backend server (npm run server).');
        } else {
          setGstinError(`Server returned unexpected response (${res.status}). Please check backend server.`);
        }
        return;
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        setGstinError(data.error || 'GSTIN verification failed. Please verify the registration number.');
        return;
      }

      setVerifiedGstData(data.data);
      setShowGstModal(true);
    } catch (err) {
      setGstinError('Failed to connect to verification server. Please ensure the backend server is running on port 5000.');
    } finally {
      setIsVerifyingGstin(false);
    }
  };

  // 2. Copy Fetched GST Details to Clipboard
  const copyGstDetails = () => {
    if (!verifiedGstData) return;
    const text = [
      `GSTIN: ${verifiedGstData.gstin}`,
      `Legal Name: ${verifiedGstData.legalName}`,
      `Trade Name: ${verifiedGstData.tradeName || verifiedGstData.legalName}`,
      `Registered Address: ${verifiedGstData.address || 'N/A'}`,
      `State: ${verifiedGstData.state || 'N/A'}`,
      `PIN Code: ${verifiedGstData.pincode || 'N/A'}`,
      `GST Status: ${verifiedGstData.status} (${verifiedGstData.isActive ? 'Active' : 'Inactive'})`
    ].join('\n');

    navigator.clipboard?.writeText(text);
    setCopiedGstDetails(true);
    setTimeout(() => setCopiedGstDetails(false), 2200);
  };

  // 3. Apply Fetched Details into Checkout Billing Fields
  const applyGstDetailsToCheckout = () => {
    if (!verifiedGstData) return;

    setFormData(prev => ({
      ...prev,
      companyName: verifiedGstData.tradeName || verifiedGstData.legalName || prev.companyName,
      registrationNumber: verifiedGstData.gstin || prev.registrationNumber,
      billingAddress: verifiedGstData.address || prev.billingAddress,
      pinCode: verifiedGstData.pincode ? String(verifiedGstData.pincode).replace(/\D/g, '').slice(0, 6) : prev.pinCode,
      country: 'India'
    }));

    setGstAppliedStatus({
      verified: true,
      gstin: verifiedGstData.gstin,
      legalName: verifiedGstData.legalName,
      tradeName: verifiedGstData.tradeName,
      status: verifiedGstData.status,
      isActive: verifiedGstData.isActive
    });

    setGstinInput(verifiedGstData.gstin);
    setShowGstModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (cart.length === 0) {
      setErrorMsg('Your cart is empty. Please select a cybersecurity solution before checkout.');
      return;
    }

    if (!formData.companyName || !formData.registrationNumber || !formData.officialEmail || !formData.billingAddress) {
      setErrorMsg('Please fill in all mandatory corporate registration & billing fields.');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your confirmation password.');
      return;
    }

    if (!formData.pinCode || formData.pinCode.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit Indian PIN code (e.g. 400051, 560103, 110001).');
      return;
    }

    setIsSubmitting(true);

    // =========================================================
    // OPTION 1: ONLINE PAYMENT THROUGH RAZORPAY GATEWAY
    // =========================================================
    if (formData.paymentMethod === 'Online') {
      try {
        // Ensure Razorpay SDK script is loaded
        const scriptReady = await loadRazorpayScript();
        if (!scriptReady || !window.Razorpay) {
          throw new Error('Unable to initialize Razorpay checkout SDK. Please verify your internet connection.');
        }

        // Check if backend has active Razorpay keys configured
        const config = await getRazorpayConfig();
        if (!config.isConfigured && !config.keyId) {
          setShowSetupModal(true);
          throw new Error(
            'Razorpay Test Keys are not configured in your .env file yet. Please paste your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env, or select "Cash / PO Invoice / RTGS" to test order placement.'
          );
        }

        // 1. Create Order on Backend via Razorpay Orders API
        const orderData = await createRazorpayOrder(totalAmount, {
          companyName: formData.companyName,
          registrationNumber: formData.registrationNumber,
          officialEmail: formData.officialEmail,
          pinCode: formData.pinCode
        });

        const { order: razorpayOrder, keyId } = orderData;
        const activeKey = keyId || config.keyId || gatewayConfig.keyId || 'rzp_test_TX8TUb3ZHcKj3H';

        // 2. Open standard Razorpay Checkout Modal (Strict Test Mode)
        const options = {
          key: activeKey,
          amount: razorpayOrder.amount, // in paise
          currency: razorpayOrder.currency || 'INR',
          name: 'Vortex Cyber Defense Ltd (Test Mode)',
          description: `[TEST MODE] Enterprise Protection (${cart.length} Module${cart.length > 1 ? 's' : ''})`,
          image: 'https://cdn-icons-png.flaticon.com/512/2092/2092663.png',
          ...(razorpayOrder.id ? { order_id: razorpayOrder.id } : {}),
          handler: async function (response) {
            // response carries: razorpay_payment_id, razorpay_order_id, razorpay_signature
            try {
              setIsSubmitting(true);
              const result = await placeOrder({
                ...formData,
                razorpayOrderId: response.razorpay_order_id || razorpayOrder.id || 'test_ord_' + Date.now(),
                razorpayPaymentId: response.razorpay_payment_id || 'pay_test_' + Date.now(),
                razorpaySignature: response.razorpay_signature || 'sig_verified_test',
                paymentStatus: 'Paid',
                orderStatus: 'Completed'
              });

              if (setCurrentUser) {
                setCurrentUser(result.managerUser);
              }
              setIsSubmitting(false);
              if (onOrderSuccess) {
                onOrderSuccess(result.order);
              }
            } catch (err) {
              setIsSubmitting(false);
              setErrorMsg(err.message || 'Payment received, but organization provisioning failed.');
            }
          },
          prefill: {
            name: formData.adminName,
            email: formData.officialEmail,
            contact: ''
          },
          notes: {
            companyName: formData.companyName,
            registrationNumber: formData.registrationNumber,
            pinCode: formData.pinCode,
            address: formData.billingAddress
          },
          theme: {
            color: '#06b6d4',
            backdrop_color: 'rgba(8, 11, 17, 0.94)'
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (res) {
          setIsSubmitting(false);
          setErrorMsg(`Payment declined: ${res.error?.description || 'Transaction unsuccessful'}`);
        });
        rzp.open();
      } catch (err) {
        setIsSubmitting(false);
        setErrorMsg(err.message || 'Failed to initiate Razorpay payment checkout.');
      }
      return;
    }

    // =========================================================
    // OPTION 2: CASH / PURCHASE ORDER / RTGS INVOICE
    // =========================================================
    try {
      const result = await placeOrder(formData);
      if (setCurrentUser) {
        setCurrentUser(result.managerUser);
      }
      setIsSubmitting(false);
      if (onOrderSuccess) {
        onOrderSuccess(result.order);
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to process order.');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Your Cart is Empty</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Explore our enterprise cybersecurity defense modules and services in Indian Rupees (₹).
        </p>
        <button
          onClick={onBackToStore}
          className="mt-6 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20"
        >
          Browse Cybersecurity Services
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold uppercase">
            B2B Enterprise License Checkout (India)
          </span>
          <button
            type="button"
            onClick={() => setShowSetupModal(true)}
            className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg transition-all"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Where to add Razorpay API Keys?</span>
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
          Organization Details & Manager Credentials
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Provide your enterprise registration and set your Customer Manager login password. Payments are securely processed via Razorpay standard checkout.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg('')}
            className="text-rose-400 hover:text-rose-200 text-xs font-mono font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: B2B Information */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Company Profile */}
          <div className="p-5 sm:p-6 bg-[#0B0F19] border border-slate-800 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                1. Organization Identity & Legal Registration
              </h3>
              {gstAppliedStatus?.verified && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 ${
                  gstAppliedStatus.isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>GSTIN Verified ({gstAppliedStatus.status})</span>
                </span>
              )}
            </div>

            {/* GSTIN Verification Feature Box */}
            <div className="p-4 bg-gradient-to-b from-cyan-950/30 to-slate-900/60 border border-cyan-500/30 rounded-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">GSTIN Auto-Verification</span>
                    <span className="text-[11px] text-slate-400">Validate official GST portal records to auto-populate legal name & billing address</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Enter 15-Digit GSTIN (e.g. 27AAACT2727Q1ZW)"
                    value={gstinInput || formData.registrationNumber}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
                      setGstinInput(val);
                      setFormData({ ...formData, registrationNumber: val });
                      if (gstinError) setGstinError('');
                    }}
                    maxLength={15}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-750 focus:border-cyan-500 rounded-xl text-xs text-white font-mono uppercase tracking-wider"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500">
                    {(gstinInput || formData.registrationNumber).length}/15
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyGstin}
                  disabled={isVerifyingGstin}
                  className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isVerifyingGstin ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verify GSTIN</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sample loader & hint */}
              <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-400 pt-0.5">
                <span>Format: 2 state + 10 PAN + 1 entity + Z + 1 checksum</span>
                <button
                  type="button"
                  onClick={() => {
                    const sample = '27AAACT2727Q1ZW';
                    setGstinInput(sample);
                    setFormData(prev => ({ ...prev, registrationNumber: sample }));
                    if (gstinError) setGstinError('');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 underline font-mono cursor-pointer"
                >
                  Load Sample (Tata Motors: 27AAACT2727Q1ZW)
                </button>
              </div>

              {gstinError && (
                <div className="p-2.5 bg-rose-950/70 border border-rose-500/40 rounded-lg text-rose-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{gstinError}</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Official Company / Organization Name <span className="text-rose-400">*</span>
                </label>
                {gstAppliedStatus?.legalName && (
                  <span className="text-[10px] text-emerald-400 font-mono">
                    ✓ Verified via GSTIN
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                placeholder="e.g. Apex CyberTech India Pvt Ltd"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  GSTIN / CIN / Registration Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 27AABCA1234F1Z5 or CIN"
                  value={formData.registrationNumber}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setFormData({ ...formData, registrationNumber: val });
                    setGstinInput(val);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Country of Operation
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="India">India (₹ INR)</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Singapore">Singapore</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Customer Manager Admin Contact & Password */}
          <div className="p-5 sm:p-6 bg-[#0B0F19] border border-slate-800 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <User className="w-4 h-4 text-cyan-400" />
              2. Customer Manager Credentials & Password
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Manager Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Sharma"
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Official Corporate Email (Login ID) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="rajesh.sharma@apextech.in"
                  value={formData.officialEmail}
                  onChange={(e) => setFormData({ ...formData, officialEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Set Account Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Create Login Password <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Confirm Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              You will use this password to log into your Customer Manager portal.
            </p>
          </div>

          {/* Section 3: Billing Address & 6-Digit PIN Code */}
          <div className="p-5 sm:p-6 bg-[#0B0F19] border border-slate-800 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <MapPin className="w-4 h-4 text-cyan-400" />
              3. Corporate Billing Address & 6-Digit PIN Code
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Official Street Address <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows="2"
                required
                placeholder="Plot / Tower, Tech Park, City, State"
                value={formData.billingAddress}
                onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              ></textarea>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Postal PIN Code (Exact 6 Digits) <span className="text-rose-400">*</span>
              </label>
              <div className="relative w-full sm:w-1/2">
                <input
                  type="text"
                  required
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="e.g. 400051"
                  value={formData.pinCode}
                  onChange={handlePinChange}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono tracking-widest"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500">
                  {formData.pinCode.length}/6 digits
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Payment Method Selection */}
          <div className="p-5 sm:p-6 bg-[#0B0F19] border border-slate-800 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cyan-400" />
                4. Payment Method
              </h3>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold flex items-center gap-1.5 shadow-sm shadow-cyan-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                Razorpay Test Mode Only ({gatewayConfig.keyId ? gatewayConfig.keyId.slice(0, 12) + '...' : 'rzp_test_...'})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                onClick={() => setFormData({ ...formData, paymentMethod: 'Online' })}
                className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  formData.paymentMethod === 'Online'
                    ? 'border-cyan-500 bg-cyan-950/20 text-white shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                    : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Online"
                  checked={formData.paymentMethod === 'Online'}
                  onChange={() => {}}
                  className="text-cyan-500"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs block text-white">Razorpay Secure</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 font-bold uppercase">
                      Instant
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    UPI (GPay/PhonePe), NetBanking, Cards
                  </span>
                </div>
              </label>

              <label
                onClick={() => setFormData({ ...formData, paymentMethod: 'Cash' })}
                className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  formData.paymentMethod === 'Cash'
                    ? 'border-amber-500 bg-amber-950/20 text-white shadow-md shadow-amber-500/10 ring-1 ring-amber-500/50'
                    : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Cash"
                  checked={formData.paymentMethod === 'Cash'}
                  onChange={() => {}}
                  className="text-amber-500"
                />
                <div>
                  <span className="font-bold text-xs block text-white">Cash / PO Invoice / RTGS</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Bank Wire / Manual Owner approval
                  </span>
                </div>
              </label>
            </div>

            {/* Razorpay Info Box */}
            {formData.paymentMethod === 'Online' && (
              <div className="p-3.5 bg-[#0D121F] border border-cyan-500/30 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    Razorpay Sandbox (Test Mode Only)
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                    Demo Rates (₹1k – ₹5k)
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Running in <strong>Strict Test Mode</strong>. Services are set to demo rates (₹1,000 to ₹5,000) for testing. Simulate test payments using UPI Virtual ID <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono font-bold">success@razorpay</code> or standard test card <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono font-bold">4111 1111 1111 1111</code> (OTP: <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded font-mono">123456</code>).
                </p>
                <div className="p-2 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Test API Key: <code className="text-cyan-400">{gatewayConfig.keyId || 'rzp_test_TX8TUb3ZHcKj3H'}</code></span>
                  <button
                    type="button"
                    onClick={() => setShowSetupModal(true)}
                    className="text-cyan-400 hover:underline text-[10px]"
                  >
                    View Details
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Summary: Cart Order Review in INR */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 sm:p-6 bg-[#0B0F19] border border-cyan-500/20 rounded-2xl shadow-xl sticky top-24">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShoppingBag className="w-4 h-4 text-cyan-400" />
              Order Summary ({cart.length} item{cart.length > 1 ? 's' : ''})
            </h3>

            <div className="divide-y divide-slate-800/80 my-4 max-h-72 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="py-3 flex justify-between gap-3 text-xs">
                  <div>
                    <h5 className="font-bold text-white">{item.product.name}</h5>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {formatINR(item.product.price)} / {item.product.billingCycle} • Up to {item.product.maxSeats} seats
                    </span>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-slate-700 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="px-2 py-0.5 bg-slate-800 text-slate-300 hover:text-white"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5 bg-slate-900 text-slate-200 font-mono text-xs">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="px-2 py-0.5 bg-slate-800 text-slate-300 hover:text-white"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-[10px] text-rose-400 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <span className="font-bold text-cyan-400 text-sm whitespace-nowrap font-mono">
                    {formatINR(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono">{formatINR(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Enterprise Onboarding & SLA</span>
                <span className="text-emerald-400 font-mono">FREE (₹0)</span>
              </div>
              <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-slate-800">
                <span>Total Due</span>
                <span className="text-cyan-400 font-mono">{formatINR(totalAmount)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm rounded-xl shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Connecting to Gateway...</span>
              ) : formData.paymentMethod === 'Online' ? (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay with Razorpay ({formatINR(totalAmount)})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Complete B2B Registration & Order ({formatINR(totalAmount)})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
              <Lock className="w-3 h-3 text-cyan-400" />
              <span>Razorpay Standard Checkout • 256-bit SSL encrypted</span>
            </div>
          </div>
        </div>
      </form>

      {/* RAZORPAY API KEY INSTRUCTION MODAL */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F19] border border-cyan-500/40 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Razorpay API Key Setup</h3>
                  <span className="text-[10px] text-slate-400">Where and how to add your test credentials</span>
                </div>
              </div>
              <button
                onClick={() => setShowSetupModal(false)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                To enable live or test online payments through Razorpay, add your Razorpay API keys to the <code className="text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono font-bold">.env</code> file in your project root folder (<code className="text-slate-400">d:\cybersecurity\.env</code>):
              </p>

              <div className="relative p-3.5 bg-black/80 border border-slate-800 rounded-xl font-mono text-[11px] text-cyan-300 space-y-1">
                <button
                  type="button"
                  onClick={copyEnvSnippet}
                  className="absolute right-2.5 top-2.5 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1 text-[10px]"
                >
                  {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                </button>
                <div># Razorpay Payment Gateway Keys</div>
                <div>RAZORPAY_KEY_ID=<span className="text-amber-300">rzp_test_YOUR_KEY_ID_HERE</span></div>
                <div>RAZORPAY_KEY_SECRET=<span className="text-amber-300">YOUR_KEY_SECRET_HERE</span></div>
                <div>VITE_RAZORPAY_KEY_ID=<span className="text-amber-300">rzp_test_YOUR_KEY_ID_HERE</span></div>
              </div>

              <div className="space-y-2 pt-1 text-[11px]">
                <div className="font-semibold text-white">How to get Test Keys:</div>
                <ol className="list-decimal pl-4 space-y-1 text-slate-400">
                  <li>Log into <a href="https://dashboard.razorpay.com/" target="_blank" rel="noreferrer" className="text-cyan-400 underline inline-flex items-center gap-0.5">Razorpay Dashboard <ExternalLink className="w-2.5 h-2.5" /></a>.</li>
                  <li>Ensure <strong>Test Mode</strong> is toggled on (top bar).</li>
                  <li>Go to <strong>Settings</strong> → <strong>API Keys</strong> → <strong>Generate Key</strong>.</li>
                  <li>Copy <strong>Key ID</strong> & <strong>Key Secret</strong> and paste them in your <code className="text-cyan-400">.env</code> file.</li>
                  <li>Restart the backend server (<code className="text-cyan-400">npm run dev</code> or <code className="text-cyan-400">node server/server.js</code>).</li>
                </ol>
              </div>

              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1 text-[11px]">
                <span className="font-bold text-white block">Test Payment Simulators:</span>
                <p className="text-slate-400">
                  • <strong>UPI:</strong> Use Virtual Payment Address <code className="text-cyan-400 font-mono">success@razorpay</code><br />
                  • <strong>Test Card:</strong> Card Number <code className="text-cyan-400 font-mono">4111 1111 1111 1111</code>, any future date, CVV 123, OTP 123456.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl"
              >
                Got It, Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GSTIN VERIFICATION RESULT POPUP MODAL */}
      {showGstModal && verifiedGstData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#0E131F] border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-500/10 p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Top decorative gradient border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-500"></div>

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">GSTIN Verification Result</h3>
                  <p className="text-[11px] text-slate-400">Verified live against official Goods & Services Tax registry</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGstModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Registration Status Indicator / Inactive Warning */}
            {verifiedGstData.isActive ? (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold">Registration Status: {verifiedGstData.status.toUpperCase()}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                  Verified Active
                </span>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-950/60 border border-amber-500/50 rounded-xl flex items-start gap-3 text-xs text-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-amber-100">Warning: Inactive GST Registration ({verifiedGstData.status})</span>
                  <p className="text-[11px] text-amber-300/80 mt-0.5 leading-relaxed">
                    This GSTIN is not currently marked as Active in official records. Please verify your business standing before proceeding.
                  </p>
                </div>
              </div>
            )}

            {/* Business Information Cards */}
            <div className="space-y-2.5 text-xs">
              {/* GSTIN & Taxpayer Meta */}
              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Verified GSTIN</span>
                  <span className="font-mono font-bold text-sm text-cyan-300 tracking-wider">{verifiedGstData.gstin}</span>
                </div>
                {verifiedGstData.pan && (
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">Entity PAN</span>
                    <span className="font-mono text-slate-200 font-semibold">{verifiedGstData.pan}</span>
                  </div>
                )}
              </div>

              {/* Legal Name & Trade Name */}
              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1.5">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Legal Business Name</span>
                  <span className="font-bold text-white text-xs block">{verifiedGstData.legalName}</span>
                </div>
                {verifiedGstData.tradeName && verifiedGstData.tradeName !== verifiedGstData.legalName && (
                  <div className="pt-1.5 border-t border-slate-800/80">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">Trade Name</span>
                    <span className="text-slate-300 text-xs block">{verifiedGstData.tradeName}</span>
                  </div>
                )}
              </div>

              {/* Registered Address */}
              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Registered Business Address</span>
                  {verifiedGstData.state && (
                    <span className="text-[10px] font-mono font-semibold text-cyan-400">{verifiedGstData.state}</span>
                  )}
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">{verifiedGstData.address || 'Address registered on GST portal'}</p>
                <div className="flex items-center gap-4 pt-1 font-mono text-[11px] text-slate-400 border-t border-slate-800/80">
                  {verifiedGstData.pincode && (
                    <span>PIN Code: <strong className="text-white">{verifiedGstData.pincode}</strong></span>
                  )}
                  {verifiedGstData.stateCode && (
                    <span>State Code: <strong className="text-white">{verifiedGstData.stateCode}</strong></span>
                  )}
                </div>
              </div>
            </div>

            {/* Copy Notification Toast */}
            {copiedGstDetails && (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center justify-center gap-2 animate-in fade-in duration-150">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Company name and registered address copied to clipboard!</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 border-t border-slate-800 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={copyGstDetails}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copiedGstDetails ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Details</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={applyGstDetailsToCheckout}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply to Checkout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
