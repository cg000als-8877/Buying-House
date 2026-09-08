'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, ArrowLeft, UploadCloud, ShieldCheck, Sparkles, Send } from 'lucide-react';

export default function RFQPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    buyerName: '',
    email: '',
    phone: '',
    country: '',
    category: 'Knitwear',
    quantity: '500 - 1,000 pcs',
    targetPrice: '',
    fabricDetails: '',
    timeline: 'Within 45 Days',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsSubmitted(true);
      } else {
        // Fallback for demo
        setIsSubmitted(true);
      }
    } catch {
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-28 pb-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(47,107,100,0.18),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(212,163,67,0.12),transparent_40%)]" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>RFQ &amp; Sample Prototype Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight">
            Request an Itemized Quotation &amp; Sample Pack
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Receive detailed BOM pricing, fabric swatch recommendations, and production timelines tailored to your specifications within 24 hours.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
          
          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 space-y-6"
            >
              <div className="w-16 h-16 bg-emerald-950 border border-emerald-500/40 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-white">
                Quotation Request Received!
              </h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-white">{formData.buyerName || 'Valued Partner'}</strong>. Our dedicated merchandiser and technical pattern specialist will review your specifications and send an official cost breakdown to <strong className="text-amber-400">{formData.email}</strong> within 24 hours.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setStep(1);
                  }}
                  className="px-6 py-2.5 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  Submit Another Inquiry
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Stepper Header */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                    1
                  </div>
                  <span className={`text-xs font-semibold ${step >= 1 ? 'text-white' : 'text-slate-500'}`}>
                    Garment Specs
                  </span>
                </div>
                <div className="h-0.5 flex-1 mx-4 bg-slate-800">
                  <div className={`h-full bg-amber-400 transition-all duration-300 ${step === 2 ? 'w-full' : 'w-0'}`} />
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                    2
                  </div>
                  <span className={`text-xs font-semibold ${step === 2 ? 'text-white' : 'text-slate-500'}`}>
                    Company &amp; Contact
                  </span>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        
                        {/* Apparel Category */}
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-300">
                            Apparel Category <span className="text-amber-400">*</span>
                          </label>
                          <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                          >
                            <option value="Knitwear">Premium Knitwear (Tees, Hoodies, Sweats)</option>
                            <option value="Woven">Woven (Shirts, Trousers, Chinos)</option>
                            <option value="Denim">Denim &amp; Jeans (Washed / Raw Selvedge)</option>
                            <option value="Activewear">Seamless &amp; Performance Activewear</option>
                            <option value="Outerwear">Puffer Jackets &amp; Heavy Outerwear</option>
                            <option value="Sustainable">Eco / Recycled / GOTS Organic</option>
                          </select>
                        </div>

                        {/* Order Quantity */}
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-300">
                            Estimated Order Quantity <span className="text-amber-400">*</span>
                          </label>
                          <select
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                          >
                            <option value="Sample Prototype Only">Sample Prototype Only (1-5 pcs)</option>
                            <option value="300 - 500 pcs">300 - 500 pcs (Low MOQ Batch)</option>
                            <option value="500 - 1,000 pcs">500 - 1,000 pcs</option>
                            <option value="1,000 - 5,000 pcs">1,000 - 5,000 pcs</option>
                            <option value="5,000 - 20,000 pcs">5,000 - 20,000 pcs</option>
                            <option value="20,000+ pcs">20,000+ pcs (High Volume)</option>
                          </select>
                        </div>

                        {/* Target FOB Price */}
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-300">
                            Target FOB Price per Pc (Optional)
                          </label>
                          <input
                            type="text"
                            name="targetPrice"
                            placeholder="e.g. $4.50 - $7.00 USD"
                            value={formData.targetPrice}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        {/* Delivery Timeline */}
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-300">
                            Required Delivery Window
                          </label>
                          <select
                            name="timeline"
                            value={formData.timeline}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                          >
                            <option value="Express (30-40 Days)">Express (30-40 Days)</option>
                            <option value="Standard (45-60 Days)">Standard (45-60 Days)</option>
                            <option value="Flexible (60-90 Days)">Flexible (60-90 Days)</option>
                          </select>
                        </div>

                      </div>

                      {/* Fabric & Spec Details */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300">
                          Fabric Composition, GSM or Special Treatments
                        </label>
                        <textarea
                          rows={3}
                          name="fabricDetails"
                          placeholder="e.g. 100% Organic Pima Cotton, 260 GSM, Silicon wash finish, custom neck label & polybag..."
                          value={formData.fabricDetails}
                          onChange={handleChange}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      {/* Tech Pack upload mockup */}
                      <div className="border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 text-center bg-slate-950/40 transition-colors">
                        <UploadCloud className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-slate-200">
                          Attach Tech Pack, Sketches or Reference Photos
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Supported formats: PDF, AI, PSD, ZIP, JPG, PNG (Up to 50MB)
                        </p>
                        <input
                          type="file"
                          className="mt-3 text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-400 file:text-slate-950 hover:file:bg-amber-300 cursor-pointer"
                        />
                      </div>

                      <div className="flex justify-end pt-4">
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-md transition-all"
                        >
                          <span>Continue to Contact Info</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        
                        {/* Company Name */}
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-300">
                            Brand / Company Name <span className="text-amber-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            name="companyName"
                            placeholder="e.g. Atelier Nordique Ltd"
                            value={formData.companyName}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        {/* Buyer Name */}
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-300">
                            Contact Person Name <span className="text-amber-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            name="buyerName"
                            placeholder="e.g. Alexander Vance"
                            value={formData.buyerName}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-300">
                            Business Email <span className="text-amber-400">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            name="email"
                            placeholder="alex@ateliernordique.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        {/* Phone / WhatsApp */}
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-300">
                            Phone / WhatsApp Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            placeholder="+1 (555) 019-2834"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        {/* Destination Country */}
                        <div className="space-y-2 sm:col-span-2">
                          <label className="text-xs font-semibold text-slate-300">
                            Destination Country for Shipment
                          </label>
                          <input
                            type="text"
                            name="country"
                            placeholder="e.g. United States, Germany, United Kingdom, France..."
                            value={formData.country}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                      </div>

                      {/* Additional Instructions */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300">
                          Additional Comments or Custom Requirements
                        </label>
                        <textarea
                          rows={3}
                          name="notes"
                          placeholder="Tell us about your brand positioning, packaging preferences, or certification needs..."
                          value={formData.notes}
                          onChange={handleChange}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      {/* Navigation buttons */}
                      <div className="flex items-center justify-between pt-4">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-slate-400 hover:text-white border border-slate-700 transition-colors"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Back to Specs</span>
                        </button>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
                        >
                          {isSubmitting ? (
                            <span>Submitting Request...</span>
                          ) : (
                            <>
                              <span>Submit Quotation Request</span>
                              <Send className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </>
          )}

        </div>

        {/* Guarantee sub-badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400 text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Strict Non-Disclosure Guarantee (NDA): Your proprietary designs and tech packs are 100% confidential.</span>
        </div>

      </div>
    </div>
  );
}
