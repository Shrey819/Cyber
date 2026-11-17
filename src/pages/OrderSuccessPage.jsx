import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Download, 
  Printer, 
  ArrowRight, 
  ShoppingBag, 
  LayoutDashboard, 
  Copy, 
  Check, 
  ShieldCheck, 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  FileText, 
  Clock, 
  Calendar, 
  CreditCard, 
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { formatINR } from '../data/mockStoreData';
import { useTheme } from '../context/ThemeContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function OrderSuccessPage({ orderId, setCurrentPage }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [order, setOrder] = useState(null);
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Fetch verified order details directly from server MongoDB
  useEffect(() => {
    if (!orderId) {
      setError('No Order ID was provided.');
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const fetchOrderData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error(`Order "${orderId}" was not found in our database.`);
          }
          throw new Error(`Server returned HTTP ${res.status}`);
        }

        const data = await res.json();
        if (isMounted) {
          if (data.success && data.order) {
            setOrder(data.order);
            setCompany(data.company);
          } else {
            throw new Error(data.error || 'Failed to retrieve order confirmation details.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load order details.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchOrderData();
    return () => { isMounted = false; };
  }, [orderId]);

  // Copy Order ID to clipboard
  const handleCopyOrderId = () => {
    if (!order?.id) return;
    navigator.clipboard?.writeText(order.id);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  // Download Invoice PDF (Tries server-side generated PDF stream first, falls back to client-side jsPDF)
  const handleDownloadPdf = async () => {
    if (!order) return;
    setIsDownloadingPdf(true);

    try {
      // 1. Try server endpoint
      const serverUrl = `/api/orders/${encodeURIComponent(order.id)}/invoice-pdf`;
      const res = await fetch(serverUrl);
      if (res.ok && res.headers.get('content-type')?.includes('application/pdf')) {
        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `Invoice-${order.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        setIsDownloadingPdf(false);
        return;
      }
    } catch (e) {
      console.warn('Backend PDF fetch failed, falling back to client jsPDF generation:', e);
    }

    // 2. Client-side PDF generation fallback with jsPDF
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Header Banner
      doc.setFillColor(11, 15, 25);
      doc.rect(14, 14, 182, 24, 'F');

      doc.setTextColor(0, 229, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('VORTEX CYBER DEFENSE', 20, 24);

      doc.setTextColor(148, 163, 184);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('AUTONOMOUS THREAT DEFENSE & ENTERPRISE SECURITY PLATFORM', 20, 31);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('TAX INVOICE', 190, 24, { align: 'right' });

      doc.setTextColor(0, 229, 255);
      doc.setFontSize(8);
      doc.text(order.invoiceNumber || `INV-${order.id}`, 190, 31, { align: 'right' });

      // Issuer & Client Details
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('ISSUED BY:', 15, 45);
      doc.text('BILLED TO (CUSTOMER):', 110, 45);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(company?.name || 'Vortex Cyber Technologies Pvt Ltd', 15, 50);
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(company?.legalAddress || 'Vortex Defense Cyber Tower, Hinjewadi Phase 1, Pune', 15, 54, { maxWidth: 85 });
      doc.text(`GSTIN: ${company?.gstin || '27AAACV9876Q1Z2'} | PAN: ${company?.pan || 'AAACV9876Q'}`, 15, 62);
      doc.text(`Email: ${company?.billingEmail || 'billing@vortexcyber.in'}`, 15, 66);

      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(order.companyName || 'Corporate Client', 110, 50);
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(`Attn: ${order.customerManagerName} (${order.customerManagerEmail})`, 110, 54);
      doc.text(`Billing: ${order.billingAddress}, PIN: ${order.pinCode}`, 110, 58, { maxWidth: 80 });
      doc.text(`Customer GSTIN: ${order.registrationNumber || 'N/A (Unregistered)'}`, 110, 66);

      // Metadata Bar
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, 72, 182, 10, 'FD');

      doc.setTextColor(71, 85, 105);
      doc.setFontSize(7.5);
      doc.text(`Order ID: ${order.id}   |   Date: ${order.invoiceDate}   |   Payment: ${order.paymentMethod}   |   Status: ${order.paymentStatus}`, 18, 78.5);

      // Line Items Table
      const tableRows = (order.items || []).map((it, idx) => [
        idx + 1,
        it.name,
        it.sku || `SKU-${idx + 1}`,
        it.quantity || 1,
        `INR ${(Number(it.unitPrice) || 0).toLocaleString('en-IN')}`,
        `INR ${(Number(it.subtotal) || 0).toLocaleString('en-IN')}`
      ]);

      autoTable(doc, {
        startY: 86,
        head: [['#', 'Product Description', 'SKU', 'Qty', 'Unit Price', 'Line Total']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 80 },
          2: { cellWidth: 25 },
          3: { cellWidth: 15, halign: 'center' },
          4: { cellWidth: 26, halign: 'right' },
          5: { cellWidth: 26, halign: 'right' }
        },
        margin: { left: 14, right: 14 }
      });

      const finalY = doc.lastAutoTable.finalY + 6;

      // Summary Box
      doc.setFillColor(248, 250, 252);
      doc.rect(120, finalY, 76, 36, 'FD');

      doc.setTextColor(71, 85, 105);
      doc.setFontSize(7.5);
      doc.text('Subtotal (Excl. Tax):', 124, finalY + 7);
      doc.text(`INR ${(Number(order.subtotal) || 0).toLocaleString('en-IN')}`, 192, finalY + 7, { align: 'right' });

      doc.text('GST (18% Applicable):', 124, finalY + 14);
      doc.text(`INR ${(Number(order.gstAmount) || 0).toLocaleString('en-IN')}`, 192, finalY + 14, { align: 'right' });

      doc.text('Deployment / Delivery:', 124, finalY + 21);
      doc.text('FREE (₹0)', 192, finalY + 21, { align: 'right' });

      doc.setFillColor(15, 23, 42);
      doc.rect(120, finalY + 26, 76, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('GRAND TOTAL:', 124, finalY + 32.5);
      doc.setTextColor(0, 229, 255);
      doc.text(`INR ${(Number(order.totalAmount) || 0).toLocaleString('en-IN')}`, 192, finalY + 32.5, { align: 'right' });

      // Save PDF
      doc.save(`Invoice-${order.id}.pdf`);
    } catch (clientErr) {
      console.error('Client PDF generation error:', clientErr);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Print Invoice
  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="py-24 px-4 max-w-4xl mx-auto flex flex-col items-center justify-center text-center space-y-4">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
        <h2 className="text-xl font-bold text-white tracking-tight">Verifying & Generating Official Tax Invoice...</h2>
        <p className="text-xs text-slate-400 font-mono">Retrieving encrypted order records from MongoDB database node</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-20 px-4 max-w-2xl mx-auto">
        <div className="bg-[#0B0F19] border border-rose-500/30 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-950/40 border border-rose-800/60 flex items-center justify-center mx-auto text-rose-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Order Verification Failed</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            {error || 'Unable to retrieve verified order records.'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => setCurrentPage && setCurrentPage('services')}
              className="py-2.5 px-5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Return to Security Store
            </button>
            <button
              onClick={() => setCurrentPage && setCurrentPage('dashboard')}
              className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* 1. TOP SUCCESS BANNER */}
      <div className="bg-white dark:bg-[#0B0F19] dark:bg-gradient-to-br dark:from-slate-900/90 dark:via-[#0B0F19] dark:to-cyan-950/50 border border-slate-200 dark:border-cyan-500/40 rounded-3xl p-6 sm:p-10 shadow-xl dark:shadow-[0_0_50px_rgba(0,240,255,0.15)] space-y-6 relative overflow-hidden print:hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Checkmark and Main Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full bg-emerald-50 dark:bg-[#080B11] rounded-[14px] flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ORDER CONFIRMED & PROVISIONED</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Thank You for Your Order!
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Your enterprise cybersecurity defenses have been successfully placed and recorded.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons on Top Banner */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="flex-1 sm:flex-initial py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Download Invoice PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm dark:shadow-none"
              title="Print invoice on standard paper"
            >
              <Printer className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* 4 Metadata Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Order ID */}
          <div className="bg-slate-50 dark:bg-[#0e1422] p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none space-y-1">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Order Reference
            </span>
            <div className="flex items-center justify-between gap-1">
              <span className="font-mono text-xs sm:text-sm font-bold text-cyan-700 dark:text-cyan-300 truncate">
                {order.id}
              </span>
              <button
                onClick={handleCopyOrderId}
                className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Copy Order ID"
              >
                {copiedOrderId ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Card 2: Date */}
          <div className="bg-slate-50 dark:bg-[#0e1422] p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none space-y-1">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <Calendar className="w-3 h-3 text-cyan-600 dark:text-cyan-400" /> Order Placed
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 block">
              {order.invoiceDate}
            </span>
          </div>

          {/* Card 3: Payment Status */}
          <div className="bg-slate-50 dark:bg-[#0e1422] p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none space-y-1">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-cyan-600 dark:text-cyan-400" /> Payment ({order.paymentMethod})
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${order.paymentStatus === 'Paid' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span className={`text-xs sm:text-sm font-bold font-mono ${order.paymentStatus === 'Paid' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Card 4: Order Status */}
          <div className="bg-slate-50 dark:bg-[#0e1422] p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none space-y-1">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-600 dark:text-cyan-400" /> Fulfillment Status
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
              <span className="text-xs sm:text-sm font-bold font-mono text-cyan-700 dark:text-cyan-300">
                {order.orderStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Notice Info Box */}
        <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-slate-900/60 border border-blue-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Your enterprise license seats and security scan pipelines have been allocated to <strong className="text-slate-900 dark:text-white font-semibold">{order.customerManagerEmail}</strong>. You can invite your dev & SecOps team members directly from your unified portal dashboard.
          </p>
        </div>
      </div>

      {/* 2. THE COMPLETE INVOICE / BILL TEMPLATE (Clean White / Light Paper Card) */}
      <div 
        id="order-invoice-printable"
        className="bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-10 border border-slate-200 space-y-8 font-sans print:shadow-none print:border-none print:p-0 print:rounded-none"
      >
        {/* Invoice Header Stripe */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-cyan-400 font-black text-sm">
                V
              </div>
              <span className="text-xl font-black text-slate-950 tracking-tight">
                VORTEX CYBER DEFENSE
              </span>
            </div>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
              Autonomous Threat Defense & Managed Detection Solutions
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="inline-block px-3 py-1 rounded bg-slate-100 text-slate-800 font-bold text-xs font-mono uppercase tracking-wider mb-1">
              TAX INVOICE / BILL OF SUPPLY
            </span>
            <div className="text-sm font-bold font-mono text-slate-900">
              Invoice No: <span className="text-blue-700">{order.invoiceNumber || `INV-${order.id}`}</span>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Date: {order.invoiceDate}
            </div>
          </div>
        </div>

        {/* Company Info & Customer Info Two Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs leading-relaxed">
          {/* Supplier Info */}
          <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              ISSUED BY (SUPPLIER)
            </span>
            <h4 className="font-bold text-sm text-slate-900">
              {company?.name || 'Vortex Cyber Technologies Pvt Ltd'}
            </h4>
            <p className="text-slate-600">
              {company?.legalAddress || 'Vortex Defense Cyber Tower, Hinjewadi Phase 1, Pune, MH 411057, India'}
            </p>
            <div className="pt-1.5 space-y-0.5 font-mono text-[11px] text-slate-700">
              <div><strong className="text-slate-900">GSTIN:</strong> {company?.gstin || '27AAACV9876Q1Z2'}</div>
              <div><strong className="text-slate-900">PAN:</strong> {company?.pan || 'AAACV9876Q'} | <strong className="text-slate-900">CIN:</strong> {company?.cin || 'U72900PN2023PTC198421'}</div>
              <div><strong className="text-slate-900">Support:</strong> {company?.supportEmail || 'security@vortexcyber.in'}</div>
              <div><strong className="text-slate-900">Helpline:</strong> {company?.contactPhone || '+91 (020) 6742-8900'}</div>
            </div>
          </div>

          {/* Customer Billed To Info */}
          <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              BILLED TO (CUSTOMER)
            </span>
            <h4 className="font-bold text-sm text-slate-900">
              {order.companyName || 'Corporate Client'}
            </h4>
            <p className="text-slate-700">
              <strong>Authorized Lead:</strong> {order.customerManagerName} ({order.customerManagerEmail})
            </p>
            <p className="text-slate-600">
              <strong>Billing Address:</strong> {order.billingAddress}, PIN: {order.pinCode}, {order.country}
            </p>
            <p className="text-slate-600">
              <strong>Provisioning Node:</strong> {order.shippingAddress || 'Instant Enterprise Cloud SaaS Deployment'}
            </p>
            <div className="pt-1.5 space-y-0.5 font-mono text-[11px] text-slate-700">
              <div>
                <strong className="text-slate-900">Customer GSTIN / Tax ID:</strong>{' '}
                <span className={order.registrationNumber ? 'font-semibold text-blue-700' : 'text-slate-500'}>
                  {order.registrationNumber || 'Unregistered Consumer / Entity'}
                </span>
              </div>
              <div><strong className="text-slate-900">Payment Gateway ID:</strong> {order.razorpayPaymentId || 'Direct / Bank Reference'}</div>
            </div>
          </div>
        </div>

        {/* Product Items Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            Purchased Security Subscriptions & Assets
          </h4>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-mono uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-3.5 w-10 text-center">#</th>
                  <th className="py-3 px-4">Product Description</th>
                  <th className="py-3 px-3 text-center">SKU / Inclusions</th>
                  <th className="py-3 px-3 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {(order.items || []).map((item, idx) => (
                  <tr key={item.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                    <td className="py-3 px-3.5 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">{item.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.brand || 'Vortex Cyber Defense'} • {item.billingCycle || 'Monthly'} Subscription
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-600 text-[11px]">
                      <div>{item.sku || `SKU-${idx + 1}`}</div>
                      <div className="text-[10px] text-slate-400">{item.allocatedSeats || 10} Seats</div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-semibold text-slate-900">
                      {item.quantity || 1}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      {formatINR(item.unitPrice || item.price)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatINR(item.subtotal || ((item.unitPrice || item.price || 0) * (item.quantity || 1)))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Price Breakdown Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
          {/* Terms and Payment Signature */}
          <div className="space-y-3 max-w-sm text-xs text-slate-500">
            <h5 className="font-bold text-slate-800 text-[11px] font-mono uppercase tracking-wider">
              Terms & Compliance Notice:
            </h5>
            <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
              <li>Digital SaaS delivery fulfilled immediately upon payment settlement.</li>
              <li>Includes 24/7 incident response SLA and CERT-In advisory compliance.</li>
              <li>This is an authenticated computer-generated invoice; no manual physical signature required under IT Act 2000.</li>
            </ul>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-xs">
                ✓
              </div>
              <div className="text-[10.5px]">
                <div className="font-bold text-slate-800">Digitally Verified Document</div>
                <div className="text-slate-400 font-mono">Vortex Cryptographic Node Authenticated</div>
              </div>
            </div>
          </div>

          {/* Totals Table */}
          <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Subtotal (Pre-Tax):</span>
              <span className="font-mono">{formatINR(order.subtotal)}</span>
            </div>

            {order.cgst > 0 && order.sgst > 0 ? (
              <>
                <div className="flex justify-between text-slate-600">
                  <span>CGST (9%):</span>
                  <span className="font-mono">{formatINR(order.cgst)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>SGST (9%):</span>
                  <span className="font-mono">{formatINR(order.sgst)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-slate-600">
                <span>IGST (18% Applicable):</span>
                <span className="font-mono">{formatINR(order.gstAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Cloud SaaS Deployment:</span>
              <span className="font-mono text-emerald-600 font-semibold">FREE (₹0)</span>
            </div>

            <div className="pt-2.5 border-t-2 border-slate-200 flex justify-between items-baseline font-bold text-sm text-slate-950">
              <span>Grand Total:</span>
              <span className="font-mono text-base text-blue-700">{formatINR(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Invoice Footer */}
        <div className="pt-4 border-t border-slate-100 text-center text-[10.5px] font-mono text-slate-400">
          Vortex Cyber Technologies Pvt Ltd • CIN: {company?.cin || 'U72900PN2023PTC198421'} • Hinjewadi Phase 1, Pune, MH 411057 • https://vortexcyber.in
        </div>
      </div>

      {/* 3. ADDITIONAL ACTIONS FOOTER */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="py-3 px-6 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isDownloadingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Download Invoice PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-sm dark:shadow-none"
          >
            <Printer className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Print Invoice</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage && setCurrentPage('services')}
            className="py-3 px-5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-sm dark:shadow-none"
          >
            <ShoppingBag className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Continue Shopping</span>
          </button>

          <button
            onClick={() => setCurrentPage && setCurrentPage('dashboard')}
            className="py-3 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            <span>View My Orders & Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
