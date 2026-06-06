"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Check, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAdminAuthStore } from '../../../store/useAdminAuthStore';
import toast from 'react-hot-toast';

export default function AdminOffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useAdminAuthStore();

  const fetchOffers = async () => {
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/offers/admin`, {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });
      setOffers(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const deleteHandler = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/offers/${id}`, {
          headers: { Authorization: `Bearer ${userInfo?.token}` },
        });
        toast.success('Offer deleted');
        fetchOffers();
      } catch (error) {
        toast.error('Error deleting offer');
      }
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-medium tracking-wide text-gray-900 uppercase">Offers & Banners</h1>
          <p className="text-sm text-gray-500 mt-1">Manage promotional banners for the home page</p>
        </div>
        <Link 
          href="/admin/offers/new" 
          className="bg-primary text-white px-5 py-2.5 rounded-md font-bold uppercase tracking-widest text-sm hover:bg-secondary transition-colors shadow-md flex items-center gap-2"
        >
          <Plus size={18} /> Add New Offer
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="p-4 w-32">Banner Image</th>
                <th className="p-4">Title</th>
                <th className="p-4">Status</th>
                <th className="p-4">Views</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              ) : offers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-gray-500 font-medium">
                    No offers found. Create your first banner!
                  </td>
                </tr>
              ) : (
                offers.map((offer: any) => (
                  <tr key={offer._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="w-24 h-12 bg-gray-100 rounded overflow-hidden border border-gray-200">
                        <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-gray-800">{offer.title}</td>
                    <td className="p-4">
                      {offer.isActive ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                          <Check size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">
                          <X size={12} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-gray-800">{offer.views || 0}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Link 
                          href={`/admin/offers/${offer._id}`} 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit size={18} />
                        </Link>
                        <button 
                          onClick={() => deleteHandler(offer._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
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
