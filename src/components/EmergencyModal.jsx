import React, { useState } from 'react';
import { 
  X, 
  PhoneCall, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Lock,
  ArrowRight
} from 'lucide-react';

export default function EmergencyModal({ isOpen, onClose }) {
  const [incidentType, setIncidentType] = useState('ransomware');
  const [companyName, setCompanyName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-[#0F1420] border border-rose-600/40 rounded-2xl shadow-[0_0_60px_rgba(225,29,72,0.25)] scrollbar-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pulsing Red Emergency Header Banner */}
        <div className="bg-rose-950/80 border-b border-rose-800/60 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-300 font-mono text-xs font-bold tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span>PRIORITY 1 EMERGENCY BREACH DISPATCH</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-rose-400 hover:text-white hover:bg-rose-900/40 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {submitted ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-rose-400" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-white">Emergency Dispatch Activated</h4>
                <p className="text-xs text-rose-200 mt-1.5 max-w-sm mx-auto">
                  Incident ticket <span className="font-mono text-white font-bold">#IR-2026-9921</span> has been routed to our active on-call DFIR commander. Expect secure voice contact within <span className="text-white font-bold">12 minutes</span>.
                </p>
              </div>

              <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 text-left font-mono text-xs space-y-2 text-slate-300">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <Clock className="w-4 h-4" />
                  <span>SLA Guarantee: Active Containment Underway</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Direct Commander Hotline: <span className="text-rose-400 font-bold">+1 (800) 867-8397 Ext. 1</span>
                </p>
              </div>

              <button
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs tracking-wide transition-all cursor-pointer shadow-lg shadow-rose-600/30"
              >
                Close Dispatch Confirmation
              </button>
            </div>
          ) : (
            <div>
              {/* Emergency Call Box */}
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-rose-950/60 to-slate-900 border border-rose-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-bold">
                    DIRECT CRISIS BRIDGE (24/7/365)
                  </p>
                  <p className="text-xl font-black text-white tracking-wide mt-0.5">
                    +1 (800) 867-8397
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Average pickup time: &lt; 45 seconds</p>
                </div>

                <a 
                  href="tel:18008678397"
                  className="px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 whitespace-nowrap"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call Hotline Now</span>
                </a>
              </div>

              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Or Request Immediate Callback & Containment</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Observed Attack Vector</label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="ransomware">Ransomware & Active Encryption in Progress</option>
                    <option value="exfiltration">Unauthorized Data Exfiltration / Extortion</option>
                    <option value="compromise">Domain Controller / Root Privilege Compromise</option>
                    <option value="ddos">Volumetric DDoS / Critical Service Outage</option>
                    <option value="other">Suspected Advanced Persistent Threat (APT)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Company / Organization</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Acme Corp"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Direct Emergency Phone</label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Brief Description of Symptoms</label>
                  <textarea
                    rows={3}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="E.g., Ransom notes appearing on ESXi hypervisors; backups affected..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
                  ></textarea>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>All communications covered by immediate unilateral non-disclosure agreement (NDA).</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30"
                >
                  {submitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Dispatching On-Call Responder...</span>
                    </>
                  ) : (
                    <>
                      <span>Trigger Priority 1 Incident Response</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
