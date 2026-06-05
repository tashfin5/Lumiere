"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Menu, X, Moon, Sun } from 'lucide-react';
import { useAdminAuthStore } from '../../store/useAdminAuthStore';
import { useAdminUIStore } from '@/store/useAdminUIStore';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { userInfo, logout } = useAdminAuthStore();
  const { pageTitle } = useAdminUIStore();
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsHydrated(useAdminAuthStore.persist.hasHydrated());
    const unsub = useAdminAuthStore.persist.onFinishHydration(() => setIsHydrated(true));
    
    // Check initial theme
    if (typeof document !== 'undefined') {
      setIsDark(document.documentElement.classList.contains('dark'));
    }
    
    return () => {
      if (unsub) unsub();
    };
  }, []);

  useEffect(() => {
    if (isHydrated && (!userInfo || userInfo.role !== 'admin')) {
      router.push('/admin/login');
    }
  }, [isHydrated, userInfo, router]);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  // Prevent hydration mismatch by not rendering anything until mounted
  if (!mounted) return null;
  
  // If we are on the login page itself, just render the children without the sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Prevent flash of unauthenticated content while redirecting
  if (!isHydrated || !userInfo || userInfo.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { name: 'Products', icon: <Package size={20} />, path: '/admin/products' },
    { name: 'Categories', icon: <Package size={20} />, path: '/admin/categories' },
    { name: 'Brands', icon: <Package size={20} />, path: '/admin/brands' },
    { name: 'Offers', icon: <Package size={20} />, path: '/admin/offers' },
    { name: 'Orders', icon: <ShoppingCart size={20} />, path: '/admin/orders' },
    { name: 'Customers', icon: <Users size={20} />, path: '/admin/customers' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 text-white flex flex-col transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`} style={{ backgroundColor: isDark ? '#050505' : '#111827' }}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1f2937]">
          <Link href="/" className="text-2xl font-serif font-medium text-[#ffffff] tracking-widest flex-1 text-center">
            LUMIÈRE<span className="text-[#9ca3af] text-xs ml-2 font-light tracking-[0.2em] font-sans">ADMIN</span>
          </Link>
          <button className="md:hidden text-[#9ca3af] hover:text-[#ffffff]" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.name} 
                href={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                  isActive ? 'bg-primary text-[#ffffff]' : 'text-[#9ca3af] hover:bg-[#1f2937] hover:text-[#ffffff]'
                }`}
              >
                {item.icon}
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-[#1f2937]">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-left text-[#9ca3af] hover:bg-[#1f2937] hover:text-[#ffffff] rounded-md transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Admin Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-600 hover:text-gray-900" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="text-lg md:text-xl font-serif font-normal tracking-wide text-gray-800 capitalize truncate">
              {(() => {
                if (pageTitle) return pageTitle;
                if (pathname === '/admin') return 'Dashboard Overview';
                const parts = pathname.split('/').filter(Boolean);
                if (parts.length >= 3) {
                  const entity = parts[1].replace(/s$/, ''); // products -> product
                  const action = parts[2];
                  if (action === 'new' || action === 'add') return `Create ${entity}`;
                  return `Edit ${entity}`;
                }
                return parts[parts.length - 1];
              })()}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={toggleTheme} className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center group">
              {isDark ? <Sun size={20} className="group-hover:scale-110 transition-transform" /> : <Moon size={20} className="group-hover:scale-110 transition-transform" />}
            </button>
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md">
              A
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}