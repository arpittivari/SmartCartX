import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Scan,
  Zap,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Play,
  Linkedin,
  Youtube
} from 'lucide-react';
import apiClient from '../api/apiClient';

// Feature Data
const features = [
  {
    title: "Tri-Sensor Fusion",
    description: "Combines weight sensors, computer vision, and RFID for 99.9% accuracy in product detection.",
    icon: Scan,
    color: "text-blue-400"
  },
  {
    title: "AdSense AI",
    description: "Real-time contextual advertising engine that drives 3x engagement based on cart contents.",
    icon: Zap,
    color: "text-amber-400"
  },
  {
    title: "Frictionless Checkout",
    description: "Walk out technology. Payments are processed automatically as customers leave the store.",
    icon: CreditCard,
    color: "text-emerald-400"
  }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeCarts: "5000+",
    mallsDeployed: "12",
    accuracy: "99.9%",
    uptime: "99.99%"
  });

  useEffect(() => {
    // Fetch live stats
    const fetchStats = async () => {
        try {
            const { data } = await apiClient.get('/public/landing-stats');
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch live stats", error);
        }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* --- Hero Section --- */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Gradient Blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-blue-600/20 blur-[120px] rounded-full -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-slate-800/50 border border-slate-700 text-blue-400 text-sm font-medium mb-6 backdrop-blur-sm">
              Introducing SmartCart X1
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
              The Future of Retail <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Is Autonomous.
              </span>
            </h1>
            <p className="mt-4 text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
              Transform your stores with the world's most advanced smart cart platform.
              Increase basket size, reduce shrinkage, and delight customers with a zero-friction shopping experience.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-lg transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 group"
              >
                Get a Demo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                className="w-full sm:w-auto px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-white border border-slate-700 hover:border-slate-600 rounded-lg font-bold text-lg transition-all backdrop-blur-sm flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                Watch Video
              </button>
            </div>
          </motion.div>

          {/* 3D / Interactive Placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-16 relative mx-auto max-w-5xl"
          >
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 aspect-video flex items-center justify-center group">
               {/* Grid Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] pointer-events-none"></div>

              <div className="text-center z-10">
                 <div className="w-24 h-24 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50 animate-pulse">
                      <Play className="w-8 h-8 text-white fill-current ml-1" />
                    </div>
                 </div>
                 <p className="text-slate-400 font-medium">Interactive Demo Loading...</p>
              </div>
            </div>
            {/* Glow effect behind the container */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl blur opacity-20 -z-10"></div>
          </motion.div>
        </div>
      </section>

      {/* --- Feature Section --- */}
      <section className="py-24 bg-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">A Fully Integrated Ecosystem</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              From the edge to the cloud, SmartCart Central provides everything you need to modernize your retail operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-950 p-8 rounded-2xl border border-slate-800 hover:border-slate-700 hover:bg-slate-900/50 transition-colors group"
              >
                <div className={`w-14 h-14 rounded-xl bg-slate-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-slate-800 ${feature.color}`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Stats / Social Proof --- */}
      <section className="py-20 border-y border-slate-800/50 bg-slate-950/50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { label: "Active Carts", value: stats.activeCarts },
                { label: "Malls Deployed", value: stats.mallsDeployed },
                { label: "Accuracy", value: stats.accuracy },
                { label: "Uptime", value: stats.uptime },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">{stat.label}</div>
                </div>
              ))}
            </div>
         </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-slate-950 pt-20 pb-10 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <span className="text-2xl font-bold text-white mb-4 block">SmartCart</span>
              <p className="text-slate-400 text-sm leading-relaxed">
                Empowering the future of autonomous retail technology. Building the bridge between digital convenience and physical retail.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Platform</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">SmartCarts</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Analytics</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Provisioning</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Security</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Partners</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Stay Updated</h4>
              <div className="flex gap-2">
                 <a
                   href="https://www.linkedin.com/in/arpit-tiwari-08b177271"
                   target="_blank"
                   rel="noreferrer"
                   className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all"
                 >
                   <Linkedin className="w-5 h-5" />
                 </a>
                 <a
                   href="https://youtube.com/@arpittiwari_15"
                   target="_blank"
                   rel="noreferrer"
                   className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-red-600 hover:text-white transition-all"
                 >
                   <Youtube className="w-5 h-5" />
                 </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-900 pt-8 text-center text-slate-600 text-sm">
            <p>&copy; {new Date().getFullYear()} SmartCart Central. A project by Arpit Tiwari. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
