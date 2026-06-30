import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Globe, Database, Lock, Radio } from 'lucide-react';

const ShopperOSPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-extrabold text-white mb-4"
          >
            ShopperOS & Cloud Server
          </motion.h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            The enterprise brain managing thousands of carts, inventory, and AI advertising engines in real-time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
                <h2 className="text-3xl font-bold text-white mb-6">Centralized Command Center</h2>
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-400"><LayoutDashboard /></div>
                        <div>
                            <h3 className="text-xl font-semibold text-white">Multi-Tenancy</h3>
                            <p className="text-slate-400 mt-1">Single platform hosting multiple organizations (Reliance, Lulu) with strict data isolation.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-400"><Database /></div>
                        <div>
                            <h3 className="text-xl font-semibold text-white">Inventory Sync</h3>
                            <p className="text-slate-400 mt-1">Bulk upload CSV/Excel. Auto-syncs pricing to thousands of carts instantly.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-400"><Globe /></div>
                        <div>
                            <h3 className="text-xl font-semibold text-white">God Mode Map</h3>
                            <p className="text-slate-400 mt-1">Real-time view of the mall floor showing live cart locations and battery status.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visual Representation of Dashboard */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-2 shadow-2xl">
                <div className="bg-slate-950 rounded-lg h-80 flex items-center justify-center border border-slate-800/50">
                    <div className="text-center">
                        <LayoutDashboard size={64} className="mx-auto text-slate-700 mb-4" />
                        <p className="text-slate-500 font-mono text-sm">Dashboard UI Preview</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Tech Stack Grid */}
        <div className="mb-20">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Enterprise Technology Stack</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Node.js Microservices", sub: "Backend Core", icon: Database },
                    { label: "MongoDB & Redis", sub: "Data & Caching", icon: Database },
                    { label: "DeepSeek AI", sub: "Contextual Ads", icon: Radio },
                    { label: "Secure MQTT (TLS 1.2)", sub: "Sub-second Messaging", icon: Lock },
                ].map((tech, i) => (
                    <div key={i} className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-center">
                        <tech.icon className="w-8 h-8 mx-auto mb-3 text-slate-400" />
                        <h4 className="text-white font-bold">{tech.label}</h4>
                        <p className="text-slate-500 text-sm">{tech.sub}</p>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default ShopperOSPage;