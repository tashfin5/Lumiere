"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAdminAuthStore } from '../../../store/useAdminAuthStore';
import { Trash2, Edit, Plus, X, Star } from 'lucide-react';

interface Brand {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  isFeatured?: boolean;
  views?: number;
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { userInfo } = useAdminAuthStore();

  const fetchBrands = async () => {
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/brands`);
      setBrands(data);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openAddForm = () => {
    setIsEditing(false);
    setEditingId('');
    setName('');
    setSlug('');
    setImage('');
    setDescription('');
    setIsFeatured(false);
    setIsFormOpen(true);
  };

  const openEditForm = (brand: Brand) => {
    setIsEditing(true);
    setEditingId(brand._id);
    setName(brand.name);
    setSlug(brand.slug);
    setImage(brand.image || '');
    setDescription(brand.description || '');
    setIsFeatured(brand.isFeatured || false);
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
      
      const payload = { name, slug, image, description, isFeatured };

      if (isEditing) {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/brands/${editingId}`, payload, config);
        toast.success('Brand updated');
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/brands`, payload, config);
        toast.success('Brand created');
      }
      
      setIsFormOpen(false);
      fetchBrands();
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const deleteHandler = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/brands/${id}`, config);
        toast.success('Brand deleted');
        fetchBrands();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Error deleting brand');
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-serif font-medium text-gray-900">Brands Management</h1>
          <p className="text-gray-500 text-sm mt-1">Add, edit, and organize product brands.</p>
        </div>
        <button 
          onClick={openAddForm}
          className="bg-primary text-white px-4 py-2 rounded-md flex items-center hover:bg-gray-900 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Brand
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Featured</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Views</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {brands.map((brand) => (
                <tr key={brand._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 relative bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                        {brand.image ? (
                          <img src={brand.image} alt={brand.name} className="object-contain h-full w-full" />
                        ) : (
                          <span className="text-gray-400 font-bold">{brand.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{brand.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {brand.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {brand.isFeatured ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Star className="w-3 h-3 mr-1" /> Featured
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Standard
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {brand.views || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => openEditForm(brand)}
                      className="text-primary hover:text-gray-900 mr-4 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteHandler(brand._id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {brands.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    No brands found. Click "Add Brand" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-serif font-medium text-gray-900">
                {isEditing ? 'Edit Brand' : 'Add New Brand'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={submitHandler} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!isEditing) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input 
                  type="text" 
                  value={slug} 
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL or Upload</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={image} 
                    onChange={(e) => setImage(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="/images/brands/cosrx.png"
                  />
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium text-sm flex items-center transition-colors">
                    {uploading ? '...' : 'Upload'}
                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">Recommended resolution: 800x800px (1:1)</p>
                {image && (
                  <div className="mt-3">
                    <img src={image} alt="Preview" className="h-16 object-contain border border-gray-100 rounded-md p-1" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="isFeatured"
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
                  Featured Brand (show on home page, top of lists)
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 text-sm font-medium text-white bg-primary hover:bg-gray-900 rounded-md transition-colors shadow-sm"
                >
                  {isEditing ? 'Update Brand' : 'Create Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
