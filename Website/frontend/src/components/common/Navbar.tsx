import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, ChevronDown,
  ShoppingCart, BarChart2, Zap, Shield,
  Cpu, Database, Layers, Code,
  BookOpen, Users, HelpCircle, FileText
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type MenuItem = {
  title: string;
  description?: string;
  icon?: React.ElementType;
  href: string;
};

type NavItem = {
  label: string;
  items: MenuItem[];
};

// --- Data ---
const NAV_ITEMS: NavItem[] = [
  {
    label: "Product",
    items: [
      { title: "SmartCart Hardware", description: "AI-powered shopping carts with built-in weighing scales.", icon: ShoppingCart, href: "/store" },
      { title: "Analytics Dashboard", description: "Real-time fleet tracking and revenue insights.", icon: BarChart2, href: "/analytics" },
      { title: "Fleet Management", description: "Provision, update, and monitor your cart fleet remotely.", icon: Zap, href: "/fleet" },
      { title: "Security", description: "End-to-end encryption and MAC-based authentication.", icon: Shield, href: "/security" },
    ]
  },
  {
    label: "Solutions",
    items: [
      { title: "For Retailers", description: "Reduce checkout times and increase basket size.", icon: ShoppingCart, href: "/solutions/retailers" },
      { title: "For Malls", description: "Centralized management for multi-tenant environments.", icon: Layers, href: "/solutions/malls" },
      { title: "Enterprise", description: "Custom integrations and dedicated support.", icon: Database, href: "/solutions/enterprise" },
    ]
  },
  {
    label: "Technology",
    items: [
      { title: "Computer Vision", description: "Product recognition with 99.9% accuracy.", icon: Cpu, href: "/tech/vision" },
      { title: "Sensor Fusion", description: "combining weight sensors and cameras.", icon: Layers, href: "/tech/sensors" },
      { title: "API Reference", description: "Integrate with your existing ERP systems.", icon: Code, href: "/docs/api" },
    ]
  },
  {
    label: "Resources",
    items: [
      { title: "Documentation", description: "Guides, tutorials, and API docs.", icon: BookOpen, href: "/docs" },
      { title: "Case Studies", description: "See how others are using SmartCart.", icon: FileText, href: "/resources/case-studies" },
      { title: "Community", description: "Join our developer community.", icon: Users, href: "/community" },
      { title: "Support", description: "Get help when you need it.", icon: HelpCircle, href: "/support" },
    ]
  }
];

// --- Components ---

const Navbar = () => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200"
      onMouseLeave={() => setActiveTab(null)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer">
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              SmartCart<span className="text-blue-600">Central</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center h-full">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative h-full flex items-center"
                onMouseEnter={() => setActiveTab(item.label)}
              >
                <button
                  className={cn(
                    "text-sm font-medium transition-colors duration-200 flex items-center gap-1 outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1",
                    activeTab === item.label ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
                  )}
                  aria-expanded={activeTab === item.label}
                  onClick={() => setActiveTab(activeTab === item.label ? null : item.label)}
                >
                  {item.label}
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      activeTab === item.label ? "rotate-180" : ""
                    )}
                  />
                </button>

                {/* Desktop Dropdown */}
                <AnimatePresence>
                  {activeTab === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[480px] bg-white rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 overflow-hidden"
                    >
                      <div className="p-4 grid gap-4 grid-cols-2">
                        {item.items.map((subItem) => (
                          <a
                            key={subItem.title}
                            href={subItem.href}
                            className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors group focus:outline-none focus:bg-gray-50"
                          >
                            <div className="flex-shrink-0 p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                              {subItem.icon && <subItem.icon className="w-5 h-5" />}
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                {subItem.title}
                              </p>
                              {subItem.description && (
                                <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                  {subItem.description}
                                </p>
                              )}
                            </div>
                          </a>
                        ))}
                      </div>
                      <div className="bg-gray-50 p-4 border-t border-gray-100">
                        <a href="#" className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                          View all {item.label} <span aria-hidden="true" className="ml-1">&rarr;</span>
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <a href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Log in
            </a>
            <a
              href="/register"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Start Free Trial
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200 overflow-hidden"
          >
            <div className="pt-2 pb-3 space-y-1 px-4">
              {NAV_ITEMS.map((item) => (
                <div key={item.label} className="py-1">
                  <button
                    onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                    className="flex items-center justify-between w-full py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-2 rounded-md"
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 transition-transform duration-200",
                        mobileExpanded === item.label ? "rotate-180" : ""
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {mobileExpanded === item.label && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-4 space-y-2 overflow-hidden"
                      >
                        {item.items.map((subItem) => (
                          <a
                            key={subItem.title}
                            href={subItem.href}
                            className="flex items-center py-2 text-sm text-gray-600 hover:text-blue-600 px-2 rounded-md hover:bg-gray-50"
                          >
                            {subItem.icon && <subItem.icon className="w-4 h-4 mr-2" />}
                            {subItem.title}
                          </a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
            <div className="pt-4 pb-6 border-t border-gray-200 px-4">
              <div className="flex flex-col space-y-3">
                <a href="/login" className="block text-center w-full px-4 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  Log in
                </a>
                <a href="/register" className="block text-center w-full px-4 py-2 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">
                  Start Free Trial
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
