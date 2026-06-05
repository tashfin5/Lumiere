"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Menu, X } from 'lucide-react';
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

  useEffect(() => {
    setMounted(true);
    if (!userInfo || userInfo.role !== 'admin') {
      router.push('/admin/login');
    }
  }, [userInfo, router]);

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
  if (!userInfo || userInfo.role !== 'admin') {
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
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          <Link href="/" className="text-2xl font-serif font-medium text-white tracking-widest flex-1 text-center">
            LUMIÈRE<span className="text-gray-400 text-xs ml-2 font-light tracking-[0.2em] font-sans">ADMIN</span>
          </Link>
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
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
                  isActive ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-left text-gray-400 hover:bg-gray-800 hover:text-white rounded-md transition-colors"
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
             <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
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