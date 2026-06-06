"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react';
import { useAdminAuthStore } from '../../store/useAdminAuthStore';

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  recentOrders: Array<{
    _id: string;
    totalPrice: number;
    isPaid: boolean;
    createdAt: string;
    user?: { name: string };
    shippingAddress?: { name: string };
  }>;
}

interface ViewStats {
  totalViews: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [viewStats, setViewStats] = useState<ViewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useAdminAuthStore();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [{ data: orderData }, { data: viewData }] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders/stats`, {
            headers: { Authorization: `Bearer ${userInfo?.token}` }
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stats`, {
            headers: { Authorization: `Bearer ${userInfo?.token}` }
          })
        ]);
        setStats(orderData);
        setViewStats(viewData);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userInfo) {
      fetchStats();
    }
  }, [userInfo]);

  const statCards = [
    { title: "Total Revenue", value: `৳${stats?.totalRevenue.toFixed(2) || '0.00'}`, icon: <DollarSign className="w-6 h-6 text-green-500" /> },
    { title: "Total Orders", value: stats?.totalOrders || '0', icon: <ShoppingBag className="w-6 h-6 text-blue-500" /> },
    { title: "Total Customers", value: stats?.totalCustomers || '0', icon: <Users className="w-6 h-6 text-purple-500" /> },
    { title: "Total Views", value: viewStats?.totalViews || '0', icon: <TrendingUp className="w-6 h-6 text-orange-500" /> },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">{stat.title}</p>
              <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{loading ? '...' : stat.value}</h3>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-serif font-medium tracking-wide text-gray-800 uppercase">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px] whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-gray-100">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="p-6 text-center text-gray-500">Loading...</td></tr>
              ) : stats?.recentOrders?.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-gray-500">No recent orders found.</td></tr>
              ) : (
                stats?.recentOrders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="p-4 font-mono text-sm text-gray-600">{order._id.substring(0, 8)}...</td>
                    <td className="p-4 text-sm font-semibold">{order.shippingAddress?.name || order.user?.name || 'Guest'}</td>
                    <td className="p-4 text-sm font-bold text-gray-900">৳{order.totalPrice.toFixed(2)}</td>
                    <td className="p-4">
                      {order.isPaid ? (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">Paid</span>
                      ) : (
                        <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold uppercase">Pending</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}