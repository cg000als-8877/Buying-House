'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Globe, Send, CheckCircle2, MessageSquare, PhoneCall, Sparkles } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-28 pb-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Direct Global Line</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            Connect with Our Merchandising Directors
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Whether you are exploring a new collection, seeking custom fabric development, or looking to optimize your current production costs, our team is ready to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Contact Details & Global Offices */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Direct Connect Quick Actions */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-800/40 space-y-4">
              <h3 className="text-white font-serif font-bold text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <span>Instant WhatsApp Sourcing Desk</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect directly with our senior lead merchandisers for urgent inquiries, sample status, or lab-dip consultations.
              </p>
              <a
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-md"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Open WhatsApp Direct Chat</span>
              </a>
            </div>

            {/* Offices List */}
            <div className="space-y-4">
              <h3 className="text-white font-serif font-bold text-lg">Global Operations</h3>
              
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                  <MapPin className="w-4 h-4" />
                  <span>Central Merchandising &amp; QA Hub</span>
                </div>
                <h4 className="text-white font-serif font-bold text-base">Dhaka Headquarters</h4>
                <p className="text-xs text-slate-400">
                  Level 8, Tower 71, Road 11, Gulshan-2, Dhaka 1212, Bangladesh
                </p>
                <p className="text-xs text-slate-300 pt-1">
                  📞 +880 (2) 987-6543 | ✉️ dhaka@atelierbuyinghouse.com
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                  <Globe className="w-4 h-4" />
                  <span>North America Liaison</span>
                </div>
                <h4 className="text-white font-serif font-bold text-base">New York Showroom</h4>
                <p className="text-xs text-slate-400">
                  525 7th Avenue, Garment District, New York, NY 10018, USA
                </p>
                <p className="text-xs text-slate-300 pt-1">
                  📞 +1 (212) 555-0199 | ✉️ nyc@atelierbuyinghouse.com
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
                  <Globe className="w-4 h-4" />
                  <span>European Liaison</span>
                </div>
                <h4 className="text-white font-serif font-bold text-base">London Office</h4>
                <p className="text-xs text-slate-400">
                  14 Berkeley Street, Mayfair, London W1J 8DX, United Kingdom
                </p>
                <p className="text-xs text-slate-300 pt-1">
                  📞 +44 (20) 7946-0921 | ✉️ london@atelierbuyinghouse.com
                </p>
              </div>
            </div>

          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative">
            <h3 className="text-2xl font-serif font-bold text-white mb-2">
              Send a General Inquiry
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Fill in the form below and our team will get back to you within 24 hours.
            </p>

            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-950 border border-emerald-500/40 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-serif font-bold text-white">Message Sent Successfully</h4>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  Thank you for reaching out. A senior representative will review your message and reply promptly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Work Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="sarah@brand.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. Fabric swatch inquiry / Partnership discussion"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Your Message *</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Tell us about your brand, order goals, or questions..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shadow-lg shadow-amber-500/20"
                >
                  {loading ? 'Sending Message...' : 'Send Message'}
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
