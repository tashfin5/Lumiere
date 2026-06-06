"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { useAdminAuthStore } from '../../../store/useAdminAuthStore';

interface Product {
  _id: string;
  name: string;
  brand: string;
  category: { _id: string; name: string } | string;
  price: number;
  stock: number;
  images: string[];
  views: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useAdminAuthStore();

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products`);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteHandler = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${id}`, {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
        });
        setProducts(products.filter((p) => p._id !== id));
        toast.success('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-medium tracking-wide text-gray-900 uppercase">Products</h1>
          <p className="text-sm text-gray-500 mt-1 font-light tracking-wide">Manage your K-Beauty inventory and catalog.</p>
        </div>
        <Link 
          href="/admin/products/add" 
          className="bg-primary text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-secondary transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add New Product
        </Link>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary text-sm"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 w-full sm:w-auto justify-center">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px] whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="p-4">Product Info</th>
                <th className="p-4">Brand</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Views</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Loading products...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No products found.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors group text-sm">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[8px] text-gray-400">Img</span>
                        )}
                      </div>
                      <span className="font-semibold text-gray-800 line-clamp-2 max-w-xs">{product.name}</span>
                    </td>
                    <td className="p-4 text-gray-600">{product.brand}</td>
                    <td className="p-4 font-bold text-gray-900">৳{product.price}</td>
                    <td className="p-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-medium text-gray-800">{product.stock} in stock</span>
                        {product.stock > 10 && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">Active</span>}
                        {product.stock > 0 && product.stock <= 10 && <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold uppercase">Low Stock</span>}
                        {product.stock === 0 && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold uppercase">Out of Stock</span>}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-800">{product.views || 0}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/products/edit/${product._id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Edit className="w-4 h-4" /></Link>
                        <button onClick={() => deleteHandler(product._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
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