import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Menu,
  X,
  ShoppingCart,
  Cpu,
  LayoutDashboard,
  Cable,
  ShieldCheck,
  MonitorPlay,
  Zap,
  ScanEye,
  Activity,
  BrainCircuit
} from 'lucide-react';

// Types for navigation items
interface SubItem {
  name: string;
  icon: React.ElementType;
  href: string;
  description: string;
}

interface NavItem {
  label: string;
  items: SubItem[];
}

const navData: Record<string, NavItem> = {
  product: {
    label: 'Product',
    items: [
      { name: 'The Smart Cart X1', icon: ShoppingCart, href: '/product/x1', description: 'Next-gen autonomous shopping cart.' },
      { name: 'ShopperOS', icon: Cpu, href: '/product/shopper-os', description: 'The operating system for retail.' },
      { name: 'Retailer Dashboard', icon: LayoutDashboard, href: '/app/dashboard', description: 'Real-time fleet management.' },
      { name: 'Accessories', icon: Cable, href: '/store', description: 'Charging docks and add-ons.' },
    ]
  },
  solutions: {
    label: 'Solutions',
    items: [
      { name: 'Loss Prevention', icon: ShieldCheck, href: '/solutions/security', description: 'AI-driven theft detection.' },
      { name: 'Retail Media Network', icon: MonitorPlay, href: '/solutions/media', description: 'Targeted ad delivery.' },
      { name: 'Queue Busting', icon: Zap, href: '/solutions/speed', description: 'Eliminate checkout lines.' },
    ]
  },
  technology: {
    label: 'Technology',
    items: [
      { name: 'Computer Vision 2.0', icon: ScanEye, href: '/tech/vision', description: 'Advanced object recognition.' },
      { name: 'Sensor Fusion', icon: Activity, href: '/tech/sensors', description: 'Weight & vision integration.' },
      { name: 'Edge AI', icon: BrainCircuit, href: '/tech/ai', description: 'On-device processing.' },
    ]
  }
};

const Navbar = () => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleMouseEnter = (tab: string) => {
    setHoveredTab(tab);
  };

  const handleMouseLeave = () => {
    setHoveredTab(null);
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
             <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              SmartCart
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8" onMouseLeave={handleMouseLeave}>
            {(Object.keys(navData) as Array<keyof typeof navData>).map((key) => (
              <div
                key={key}
                className="relative group"
                onMouseEnter={() => handleMouseEnter(key)}
              >
                <button className="flex items-center space-x-1 py-4 text-sm font-medium text-slate-300 hover:text-white transition-colors focus:outline-none">
                  <span>{navData[key].label}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${hoveredTab === key ? 'rotate-180' : ''}`} />
                </button>
              </div>
            ))}
            <Link to="/pricing" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Pricing</Link>
            <Link to="/company" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Company</Link>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button onClick={() => navigate('/login')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Log in
            </button>
            <button onClick={() => navigate('/register')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-lg shadow-blue-600/20">
              Get Started
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mega Menu Dropdown */}
      <AnimatePresence>
        {hoveredTab && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 w-full bg-slate-900 border-b border-slate-800 shadow-2xl z-40"
            onMouseEnter={() => setHoveredTab(hoveredTab)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {navData[hoveredTab].items.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-start space-x-4 group p-3 rounded-xl hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex-shrink-0 p-2 bg-slate-800 rounded-lg group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors text-slate-400">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900 border-b border-slate-800"
          >
            <div className="px-4 pt-2 pb-8 space-y-2">
              {(Object.keys(navData) as Array<keyof typeof navData>).map((key) => (
                <div key={key} className="py-2">
                  <div className="font-medium text-slate-200 px-3 py-2">{navData[key].label}</div>
                  <div className="pl-6 space-y-2">
                    {navData[key].items.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-sm text-slate-400 hover:text-blue-400 py-1"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-slate-800">
                 <button onClick={() => {navigate('/login'); setMobileMenuOpen(false);}} className="block w-full text-left px-3 py-2 text-slate-300 hover:text-white">
                  Log in
                </button>
                <button onClick={() => {navigate('/register'); setMobileMenuOpen(false);}} className="mt-2 block w-full bg-blue-600 text-white px-3 py-2 rounded-md text-center font-medium">
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
