import React from 'react';
import { 
  X, 
  Shield, 
  Check, 
  ShoppingBag, 
  CheckCircle2, 
  Users, 
  Server, 
  ArrowRight,
  ExternalLink,
  Lock,
  Layers,
  Award
} from 'lucide-react';
import { formatINR } from '../data/mockStoreData';
import { useStore } from '../context/StoreContext';

export default function ProductDetailModal({ product, isOpen, onClose, onNavigateCheckout }) {
  const { addToCart, cart } = useStore();

  if (!isOpen || !product) return null;

  const inCart = cart.some(item => item.product.id === product.id);

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleBuyNow = () => {
    if (!inCart) {
      addToCart(product);
    }
    onClose();
    if (onNavigateCheckout) {
      onNavigateCheckout();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-[#0B0F19] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.15)] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glowing Header Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-500"></div>

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-start justify-between gap-4 border-b border-slate-800/80">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 uppercase">
                {product.categoryName || 'Security Solution'}
              </span>
              {product.brand && (
                <span className="text-[11px] font-mono text-slate-400">
                  {product.brand}
                </span>
              )}
              {product.badge && (
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {product.badge}
                </span>
              )}
              {product.sku && (
                <span className="text-[10px] font-mono text-slate-500">
                  SKU: {product.sku}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {product.name}
            </h2>
            {product.tagline && (
              <p className="text-xs sm:text-sm text-cyan-400/90 font-medium">
                {product.tagline}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              Operational Architecture & Defense Scope
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800/70">
              {product.description}
            </p>
          </div>

          {/* Pricing & Capacity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#0e1422] p-4 rounded-xl border border-cyan-900/40">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Commercial Subscription
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {formatINR(product.price)}
                </span>
                <span className="text-xs text-slate-400">
                  / {product.billingCycle || 'Monthly'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                <Check className="w-3 h-3" /> Includes GST compliant e-invoice & 24/7 SLA
              </p>
            </div>

            <div className="bg-[#0e1422] p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Resource Allocation Limits
              </span>
              <div className="space-y-1.5 mt-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Users className="w-3.5 h-3.5 text-cyan-400" /> Authorized Team Seats:
                  </span>
                  <span className="font-semibold text-white">{product.maxSeats || 10} Users</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Server className="w-3.5 h-3.5 text-cyan-400" /> Monitored Assets:
                  </span>
                  <span className="font-semibold text-white">{product.assetsIncluded || 15} Endpoints / APIs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Features Checklist */}
          {product.features && product.features.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-cyan-400" />
                Enterprise Inclusions & Tooling Features
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.features.map((feat, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs text-slate-200"
                  >
                    <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-950/80 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 hidden sm:block">
            Immediate cloud tenant provisioning upon checkout
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleAddToCart}
              className={`flex-1 sm:flex-initial py-2.5 px-5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                inCart
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {inCart ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>In Cart (+ Add Another)</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-cyan-400" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 sm:flex-initial py-2.5 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <span>Instant Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
