"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { cachedGet } from '@/utils/apiCache';
import toast from 'react-hot-toast';
import { 
  Star, Heart, ShoppingBag, Minus, Plus, 
  Truck, ArrowLeft, ShieldCheck, RefreshCcw, 
  CheckCircle2, Info, MessageCircle, HelpCircle, Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });
  const [activeTab, setActiveTab] = useState('description');
  const [isAdded, setIsAdded] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewImage, setReviewImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const router = useRouter();
  const addToCart = useCartStore((state) => state.addToCart);
  
  // Auth & Wishlist
  const { userInfo, toggleWishlist } = useAuthStore();
  const isWishlisted = userInfo?.wishlist?.includes(product?._id);

  const handleAddToCart = () => {
    addToCart({
      _id: product._id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      discountPrice: product.discountPrice,
      image: product.images?.[0] || '',
      quantity: quantity
    }, quantity);
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const uploadFileHandler = async (e: any) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setUploadingImage(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo?.token}`,
        },
      };
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload`, formData, config);
      setReviewImage(data.image);
      setUploadingImage(false);
    } catch (error) {
      console.error(error);
      setUploadingImage(false);
    }
  };

  const fetchProduct = async () => {
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${id}`);
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const submitReviewHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      };
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${id}/reviews`, {
        rating,
        comment,
        image: reviewImage
      }, config);
      toast.success('Review submitted successfully');
      setRating(5);
      setComment('');
      setReviewImage('');
      setShowReviewForm(false);
      fetchProduct();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const deleteReviewHandler = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${product._id}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${userInfo?.token}` }
      });
      fetchProduct();
      toast.success('Review deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ ...zoomStyle, display: 'none' });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current product
        const { data } = await cachedGet(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${id}`);
        setProduct(data);

        // Fetch all products and filter for "similar" (excluding current)
        const similarRes = await cachedGet(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products?category=${data.category}`);
        const filteredSimilar = similarRes.data
          .filter((p: any) => p._id !== id)
          .slice(0, 5);
        setSimilarProducts(filteredSimilar);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-primary/20 rounded-full mb-4"></div>
        <p className="text-gray-400 font-bold tracking-widest text-xs uppercase">Loading Glama...</p>
      </div>
    </div>
  );
  
  if (!product) return <div className="min-h-screen flex items-center justify-center font-bold">Product not found.</div>;

  return (
    <main className="min-h-screen bg-gray-50/30 pb-24">
      <div className="container mx-auto px-4 max-w-7xl pt-6">
        
        {/* Navigation & Brand */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center text-sm font-bold text-gray-500 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
             <span className="text-[10px] font-bold bg-secondary text-white px-2 py-0.5 rounded shadow-sm">AUTHENTIC</span>
             <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded uppercase shadow-sm">{product.brand}</span>
             {product.tags && product.tags.map((tag: string, idx: number) => (
                <span key={idx} className="text-[10px] font-bold bg-pink-50 text-primary px-2 py-0.5 rounded uppercase border border-pink-200 shadow-sm">
                  {tag}
                </span>
             ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-12">
          <div className="flex flex-col lg:flex-row">
            
            {/* Gallery Section */}
            <div className="w-full lg:w-1/2 p-6 lg:p-10 bg-white border-r border-gray-50">
              <div 
                className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 mb-6 group cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                {product.discountPrice > 0 && (
                   <div className="absolute top-5 left-5 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10">
                     SAVE {Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                   </div>
                )}
                <img 
                  src={product.images[selectedImage]} 
                  alt={product.name} 
                  className={`w-full h-full object-cover transition-transform duration-300 ${zoomStyle.display === 'block' ? 'opacity-0' : 'opacity-100'}`} 
                />
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `url(${product.images[selectedImage]})`,
                    backgroundPosition: zoomStyle.backgroundPosition,
                    backgroundSize: '200%',
                    backgroundRepeat: 'no-repeat',
                    display: zoomStyle.display,
                  }}
                />
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img: string, index: number) => (
                  <button 
                    key={index} 
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all p-1 ${
                      selectedImage === index ? 'border-primary bg-pink-50' : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                  </button>
                ))}
              </div>
            </div>

            {/* Content Section */}
            <div className="w-full lg:w-1/2 p-6 lg:p-12 flex flex-col">
              <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-serif font-medium text-gray-900 leading-tight mb-2 uppercase tracking-widest">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3 mt-4">
                   <div className="flex text-yellow-400">
                     {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating || 0) ? 'fill-current' : 'text-gray-300'}`} />)}
                   </div>
                   <span className="text-sm font-bold text-gray-400">{product.rating > 0 ? product.rating.toFixed(1) : '0'} | {product.numReviews} Reviews</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex flex-col">
                   <span className="text-3xl font-semibold text-gray-900 tracking-tight">৳{product.discountPrice > 0 ? product.discountPrice : product.price}</span>
                   {product.discountPrice > 0 && <span className="text-sm text-gray-400 line-through font-medium tracking-tight mt-1">MRP: ৳{product.price}</span>}
                </div>
                <div className="h-10 w-[1px] bg-gray-200 mx-2"></div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Availability</span>
                   <span className={`text-sm font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                     {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                   </span>
                </div>
              </div>



              {/* Purchase Actions */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center bg-gray-100 rounded-full h-14 px-2 shrink-0">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:text-primary transition-colors"><Minus className="w-4 h-4" /></button>
                    <input type="text" readOnly value={quantity} className="w-12 text-center font-bold bg-transparent outline-none" />
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-10 h-10 flex items-center justify-center hover:text-primary transition-colors"><Plus className="w-4 h-4" /></button>
                  </div>
                  <div className="flex items-center gap-4 flex-1 min-w-[200px]">
                    <button 
                      onClick={handleAddToCart}
                      disabled={product.stock === 0}
                      className="flex-1 bg-primary text-white h-14 rounded-full font-bold tracking-wider text-sm px-4 whitespace-nowrap hover:bg-secondary transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      {product.stock === 0 ? 'OUT OF STOCK' : isAdded ? 'ADDED TO BAG! ✓' : 'ADD TO BAG'}
                    </button>
                    <button 
                      onClick={() => {
                        if (!userInfo) {
                          router.push('/login');
                          return;
                        }
                        toggleWishlist(product._id);
                      }}
                      className="w-14 h-14 shrink-0 border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all bg-white shadow-sm"
                    >
                      <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-primary text-primary' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Policy Section */}
              <div className="grid grid-cols-2 gap-2 mt-10">
                <div className="flex flex-col items-center p-3 text-center rounded-xl hover:bg-gray-50 transition-colors">
                   <ShieldCheck className="w-5 h-5 text-gray-800 mb-2" />
                   <span className="text-[9px] font-bold text-gray-500 uppercase">100% Authentic</span>
                </div>
                <div className="flex flex-col items-center p-3 text-center rounded-xl hover:bg-gray-50 transition-colors">
                   <Truck className="w-5 h-5 text-gray-800 mb-2" />
                   <span className="text-[9px] font-bold text-gray-500 uppercase">Fast Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shajgoj Style Tabs */}
        <div className="mt-12 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-20">
          <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
            {[
              { id: 'description', label: 'Description', icon: <Info className="w-4 h-4" /> },
              { id: 'reviews', label: 'Reviews', icon: <MessageCircle className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-8 py-5 text-sm font-serif font-medium uppercase tracking-widest transition-all border-b-2 ${
                  activeTab === tab.id ? 'border-primary text-primary bg-pink-50/30' : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8 lg:p-12">
            {activeTab === 'description' && (
              <div className="max-w-4xl animate-in fade-in duration-500">
                <p className="text-gray-600 leading-[1.8] text-base mb-6">
                  {product.description}
                </p>
              </div>
            )}
            


            {activeTab === 'reviews' && (
              <div className="animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row gap-10">
                   <div className="w-full md:w-1/3 p-8 bg-gray-50 rounded-2xl border border-gray-100 text-center h-fit">
                      <span className="text-5xl font-serif font-medium text-secondary">{product.rating > 0 ? product.rating.toFixed(1) : '0'}</span>
                      <div className="flex justify-center text-yellow-400 my-4">
                         {[...Array(5)].map((_, i) => (
                           <Star key={i} className={`w-5 h-5 ${i < Math.round(product.rating || 0) ? 'fill-current' : 'text-gray-300'}`} />
                         ))}
                      </div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Based on {product.numReviews} reviews</p>
                      
                      {!showReviewForm && (
                        <button 
                          onClick={() => {
                            if (!userInfo) {
                              router.push('/login');
                              return;
                            }
                            setShowReviewForm(true);
                          }}
                          className="w-full mt-6 bg-secondary text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all"
                        >
                          Write a Review
                        </button>
                      )}
                   </div>
                   <div className="w-full md:w-2/3 space-y-6">
                      {showReviewForm && (
                        <form onSubmit={submitReviewHandler} className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-4">
                          <div className="flex justify-between items-center mb-2">
                             <h3 className="font-bold uppercase tracking-wider text-sm">Write your review</h3>
                             <button type="button" onClick={() => setShowReviewForm(false)} className="text-gray-400 hover:text-red-500 text-sm">Cancel</button>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Rating</label>
                            <select 
                              value={rating} 
                              onChange={(e) => setRating(Number(e.target.value))}
                              className="w-full p-3 border border-gray-200 rounded-lg outline-none font-bold text-sm"
                            >
                              <option value="5">5 - Excellent</option>
                              <option value="4">4 - Very Good</option>
                              <option value="3">3 - Good</option>
                              <option value="2">2 - Fair</option>
                              <option value="1">1 - Poor</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Comment</label>
                            <textarea 
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              required
                              rows={3}
                              className="w-full p-3 border border-gray-200 rounded-lg outline-none text-sm"
                              placeholder="What did you like or dislike?"
                            ></textarea>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Add Image (Optional)</label>
                            <input 
                              type="file" 
                              onChange={uploadFileHandler}
                              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-pink-50 file:text-primary hover:file:bg-pink-100 overflow-hidden text-ellipsis whitespace-nowrap"
                            />
                            {uploadingImage && <span className="text-xs text-primary ml-2">Uploading...</span>}
                            {reviewImage && <div className="mt-2 w-16 h-16 rounded-md overflow-hidden border border-gray-200"><img src={reviewImage} alt="Uploaded preview" className="w-full h-full object-cover" /></div>}
                          </div>

                          <button 
                            type="submit" 
                            disabled={uploadingImage}
                            className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 mt-2"
                          >
                            Submit Review
                          </button>
                        </form>
                      )}

                      {product.reviews && product.reviews.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 text-sm font-medium border border-gray-100 rounded-2xl">
                          No reviews yet. Be the first to review this product!
                        </div>
                      ) : (
                        product.reviews && product.reviews.map((review: any) => (
                          <div key={review._id} className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm">
                             <div className="flex justify-between items-start mb-3">
                                <div>
                                  <span className="font-bold text-sm uppercase tracking-wider">{review.name}</span>
                                  <div className="flex text-yellow-400 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                                    ))}
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                   <span className="text-[10px] font-bold text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                   {userInfo && (userInfo._id === review.user || userInfo.role === 'admin') && (
                                     <button 
                                       onClick={() => deleteReviewHandler(review._id)}
                                       className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                                       title="Delete Review"
                                     >
                                       <Trash2 className="w-4 h-4" />
                                     </button>
                                   )}
                                 </div>
                             </div>
                             <p className="text-gray-600 text-sm leading-relaxed">"{review.comment}"</p>
                             {review.image && (
                               <div className="mt-4 w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm cursor-pointer group hover:opacity-90">
                                 <img src={review.image} alt="Review" className="w-full h-full object-cover transition-transform group-hover:scale-110" onClick={() => window.open(review.image, '_blank')} />
                               </div>
                             )}
                          </div>
                        ))
                      )}
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar Products Section */}
        <section>
          <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
             <h2 className="text-2xl font-serif font-medium uppercase tracking-widest text-gray-900">Similar Products</h2>
             <span className="text-[10px] font-bold text-primary border border-primary px-3 py-1 rounded-full uppercase">K-Beauty Selection</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {similarProducts.map((p: any) => (
              <ProductCard 
                key={p._id}
                id={p._id}
                brand={p.brand}
                name={p.name}
                price={p.price}
                discountPrice={p.discountPrice}
                imageUrl={p.images ? p.images[0] : null}
              />
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}