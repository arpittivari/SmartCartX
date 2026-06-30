import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, MonitorPlay, Zap } from 'lucide-react';

const SolutionsPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-extrabold text-white mb-4"
          >
            Retail Solutions
          </motion.h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Solve your biggest challenges: Shrinkage, Revenue Growth, and Checkout Friction.
          </p>
        </div>

        <div className="space-y-24">

            {/* Loss Prevention */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1">
                    <div className="w-16 h-16 bg-red-900/30 rounded-2xl flex items-center justify-center text-red-500 mb-6"><ShieldAlert size={32} /></div>
                    <h2 className="text-3xl font-bold text-white mb-4">Advanced Loss Prevention</h2>
                    <p className="text-slate-400 mb-6 text-lg">
                        Stop theft before it happens. Our "Tri-Sensor Fusion" compares visual data with weight changes instantly.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <span className="bg-red-500/20 text-red-400 p-1 rounded">01</span>
                            <span><strong>Mismatched Item Detection:</strong> Scanning a cheap item but dropping an expensive one triggers an alert.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-red-500/20 text-red-400 p-1 rounded">02</span>
                            <span><strong>Geofencing Locks:</strong> Wheels auto-lock if a cart leaves the designated parking zone without payment.</span>
                        </li>
                    </ul>
                </div>
                <div className="order-1 md:order-2 bg-slate-900 h-80 rounded-2xl border border-slate-800 flex items-center justify-center">
                    <p className="text-slate-600">Security Dashboard Visualization</p>
                </div>
            </div>

            {/* Retail Media */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="bg-slate-900 h-80 rounded-2xl border border-slate-800 flex items-center justify-center">
                    <p className="text-slate-600">Ad Campaign UI</p>
                </div>
                <div>
                    <div className="w-16 h-16 bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-500 mb-6"><MonitorPlay size={32} /></div>
                    <h2 className="text-3xl font-bold text-white mb-4">Retail Media Network</h2>
                    <p className="text-slate-400 mb-6 text-lg">
                        Turn every cart into a revenue stream. Brands bid for ad slots on the cart screen based on real-time shopping context.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <span className="bg-amber-500/20 text-amber-400 p-1 rounded">01</span>
                            <span><strong>Contextual Triggers:</strong> "Scanning Coffee triggers Cookie Ad." DeepSeek AI generates copy on the fly.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-amber-500/20 text-amber-400 p-1 rounded">02</span>
                            <span><strong>Performance Analytics:</strong> Track impressions and conversions per cart, per aisle.</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Queue Busting */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1">
                    <div className="w-16 h-16 bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-500 mb-6"><Zap size={32} /></div>
                    <h2 className="text-3xl font-bold text-white mb-4">Queue Busting</h2>
                    <p className="text-slate-400 mb-6 text-lg">
                        Eliminate checkout lines completely. Customers pay directly on the cart via UPI or Card.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <span className="bg-emerald-500/20 text-emerald-400 p-1 rounded">01</span>
                            <span><strong>Instant Checkout:</strong> Payment confirmed via Server Soundbox. Security gets a "Green Light" signal.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-emerald-500/20 text-emerald-400 p-1 rounded">02</span>
                            <span><strong>Shopper Login:</strong> QR login loads past purchases for faster re-ordering.</span>
                        </li>
                    </ul>
                </div>
                <div className="order-1 md:order-2 bg-slate-900 h-80 rounded-2xl border border-slate-800 flex items-center justify-center">
                    <p className="text-slate-600">Checkout Flow UI</p>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default SolutionsPage;