/**
 * ---------------------------------------------------------------------------
 * PRODUCT MANAGEMENT COMPONENT
 * ---------------------------------------------------------------------------
 * 
 * Manage vendor products - view, edit, delete, toggle availability
 * 
 * � 2025 Bambeh. All rights reserved.
 * ---------------------------------------------------------------------------
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  Filter,
  MoreVertical,
  Image as ImageIcon
} from 'lucide-react';
import { useLang, t } from "@/hooks/useAppLang";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  isActive: boolean;
  views: number;
  createdAt: string;
}

interface ProductManagementProps { vendorId: string;  }

const ProductManagement: React.FC<ProductManagementProps> = ({ vendorId }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = () => {
      try {
        const stored = localStorage.getItem(`Bambeh_vendor_products_${vendorId}`);
        if (stored) {
          setProducts(JSON.parse(stored));
        }
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [vendorId]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(products.map(p => p.category))];

  const toggleProductStatus = (productId: string) => {
    const updated = products.map(p => 
      p.id === productId ? { ...p, isActive: !p.isActive } : p
    );
    setProducts(updated);
    localStorage.setItem(`Bambeh_vendor_products_${vendorId}`, JSON.stringify(updated));
  };

  const deleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const updated = products.filter(p => p.id !== productId);
      setProducts(updated);
      localStorage.setItem(`Bambeh_vendor_products_${vendorId}`, JSON.stringify(updated));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"/>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
          <p className="text-gray-500">{products.length} products in your store</p>
        </div>
        <button
          onClick={() => navigate('/marketplace/sell')}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Products Yet</h3>
          <p className="text-gray-500 mb-6">Start selling by adding your first product!</p>
          <button
            onClick={() => navigate('/marketplace/sell')}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg font-semibold"
          >
            Add Your First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-xl shadow-lg overflow-hidden ${
                !product.isActive ? 'opacity-60' : ''
              }`}
            >
              {/* Product Image */}
              <div className="aspect-video bg-gray-100 relative">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                {/* Status Badge */}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${
                  product.isActive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </div>

                {/* Stock Warning */}
                {product.stock < 5 && product.stock > 0 && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                    Low Stock: {product.stock}
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                    Out of Stock
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1 truncate">{product.name}</h3>
                <p className="text-teal-600 font-bold text-lg mb-2">
                  {product.price.toLocaleString()} XAF
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {product.views} views
                  </span>
                  <span>Stock: {product.stock}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleProductStatus(product.id)}
                    className={`flex-1 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-1 ${
                      product.isActive
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {product.isActive ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Show
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => navigate(`/marketplace/edit/${product.id}`)}
                    className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

}

export default ProductManagement;





