"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAdminAuthStore } from '../../../store/useAdminAuthStore';
import { Trash2, Edit, Plus, X } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  views?: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [image, setImage] = useState('');
  const [uploading, setUploading] = useState(false);

  const { userInfo } = useAdminAuthStore();

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddForm = () => {
    setIsEditing(false);
    setEditingId('');
    setName('');
    setSlug('');
    setImage('');
    setIsFormOpen(true);
  };

  const openEditForm = (category: Category) => {
    setIsEditing(true);
    setEditingId(category._id);
    setName(category.name);
    setSlug(category.slug);
    setImage(category.image || '');
    setIsFormOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo?.token}`,
        },
      };
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload`, formData, config);
      setImage(data.url);
    } catch (error) {
      console.error('Image upload failed', error);
      toast.error('Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
      
      if (isEditing) {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories/${editingId}`, { name, slug, image }, config);
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`, { name, slug, image }, config);
      }
      
      setIsFormOpen(false);
      fetchCategories();
      toast.success('Category saved successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    }
  };

  const deleteHandler = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories/${id}`, {
          headers: { Authorization: `Bearer ${userInfo?.token}` }
        });
        fetchCategories();
      } catch (error) {
        console.error('Failed to delete', error);
      }
    }
  };

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEditing && name) {
      setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  }, [name, isEditing]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-medium tracking-wide text-gray-900 uppercase">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Manage product categories for the shop.</p>
        </div>
        <button 
          onClick={openAddForm}
          className="bg-primary text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-secondary transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm relative">
          <button onClick={() => setIsFormOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 mb-4">{isEditing ? 'Edit Category' : 'Add New Category'}</h2>
          
          <form onSubmit={submitHandler} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Name *</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded-md px-4 py-2 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Slug *</label>
              <input type="text" required value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full border border-gray-300 rounded-md px-4 py-2 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Category Image (Optional)</label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  {image && (
                    <div className="relative w-16 h-16 border border-gray-200 rounded-md overflow-hidden">
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setImage('')} className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-md p-0.5 hover:bg-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <label className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </label>
                </div>
                <p className="text-xs text-gray-500">Recommended resolution: 800x800px (1:1)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md font-bold text-sm hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={uploading} className="px-4 py-2 bg-primary text-white rounded-md font-bold text-sm hover:bg-secondary transition-colors disabled:opacity-50">
                {isEditing ? 'Update Category' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px] whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
              <th className="p-4">Category Name</th>
              <th className="p-4">Slug</th>
              <th className="p-4">Views</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={3} className="p-8 text-center text-gray-500">Loading categories...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={3} className="p-8 text-center text-gray-500">No categories found.</td></tr>
            ) : (
              categories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50 text-sm">
                  <td className="p-4 font-semibold text-gray-800 flex items-center gap-3">
                    {category.image ? (
                      <img src={category.image} alt={category.name} className="w-8 h-8 rounded object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-gray-100 border border-gray-200" />
                    )}
                    {category.name}
                  </td>
                  <td className="p-4 text-gray-600 font-mono">{category.slug}</td>
                  <td className="p-4 font-medium text-gray-800">{category.views || 0}</td>
                  <td className="p-4 text-right min-w-[120px]">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditForm(category)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit Category"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => deleteHandler(category._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete Category"><Trash2 className="w-4 h-4" /></button>
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
