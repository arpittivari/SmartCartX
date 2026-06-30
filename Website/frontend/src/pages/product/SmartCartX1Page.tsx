import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Cpu, Wifi, Battery, Maximize } from 'lucide-react';

const SmartCartX1Page = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-extrabold text-white mb-4"
          >
            Smart Cart X1 Series
          </motion.h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            The world's most advanced autonomous shopping fleet. Choose the model that fits your retail environment.
          </p>
        </div>

        {/* Models Comparison */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
            {/* X1 Basic */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-blue-500/50 transition-all">
                <div className="text-blue-400 mb-4"><ShoppingCart size={40} /></div>
                <h3 className="text-2xl font-bold text-white mb-2">Cart X1</h3>
                <p className="text-sm text-slate-500 mb-6 uppercase tracking-widest font-semibold">The Entry Level</p>
                <p className="text-slate-400 mb-6">Perfect for small supermarkets and convenience stores. Frictionless "Scan & Go" technology.</p>
                <ul className="space-y-3 text-sm text-slate-300">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Raspberry Pi Zero 2W</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> 5-inch Touchscreen</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Basic Load Cells</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Wi-Fi Sync (Daily)</li>
                </ul>
            </div>

            {/* X1 Pro */}
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-blue-500 rounded-2xl p-8 shadow-2xl shadow-blue-900/20 relative transform scale-105 z-10">
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">BEST SELLER</div>
                <div className="text-emerald-400 mb-4"><Cpu size={40} /></div>
                <h3 className="text-2xl font-bold text-white mb-2">Cart X1 Pro</h3>
                <p className="text-sm text-blue-300 mb-6 uppercase tracking-widest font-semibold">The Vision Standard</p>
                <p className="text-slate-300 mb-6">Computer Vision eliminates barcodes. Recognizes produce instantly. Real-time ads drive revenue.</p>
                <ul className="space-y-3 text-sm text-slate-200">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div> Raspberry Pi 5 + ESP32</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div> 7-inch HD Screen</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div> High-Precision Load Cells</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div> YOLOv8 Nano Vision AI</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div> Real-time MQTT Ads</li>
                </ul>
            </div>

            {/* X1 Ultra */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-purple-500/50 transition-all">
                <div className="text-purple-400 mb-4"><Maximize size={40} /></div>
                <h3 className="text-2xl font-bold text-white mb-2">Cart X1 Ultra</h3>
                <p className="text-sm text-slate-500 mb-6 uppercase tracking-widest font-semibold">Personal Concierge</p>
                <p className="text-slate-400 mb-6">Voice assistant, indoor navigation, and advanced theft prevention for hypermarkets.</p>
                <ul className="space-y-3 text-sm text-slate-300">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div> Pi 5 + Google Coral TPU</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div> 10-inch Immersive Display</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div> 360° Cameras & Halo Lights</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div> DeepSeek Voice Assistant</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div> Auto-Wheel Locks</li>
                </ul>
            </div>
        </div>

        {/* Feature Deep Dive */}
        <div className="bg-slate-900/50 rounded-3xl p-12 border border-slate-800">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Unified Workflow</h2>
            <div className="grid md:grid-cols-4 gap-8 text-center">
                {[
                    { title: "Boot & Sync", desc: "Downloads latest prices & ads securely via Cloud.", icon: Wifi },
                    { title: "Vision Loop", desc: "Camera identifies items; Sensors validate weight.", icon: ShoppingCart },
                    { title: "AI Triggers", desc: "DeepSeek generates contextual cross-sell ads.", icon: Cpu },
                    { title: "Green Light", desc: "Security sees instant payment verification.", icon: Battery },
                ].map((step, i) => (
                    <div key={i} className="p-4">
                        <div className="w-16 h-16 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4 text-blue-400">
                            <step.icon size={32} />
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">{step.title}</h4>
                        <p className="text-sm text-slate-400">{step.desc}</p>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default SmartCartX1Page;