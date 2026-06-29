/**
 * BAMBÉ MARKETPLACE - PRODUCT MANAGEMENT COMPONENT
 * Version: 1.0.0
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useVendorProducts } from '../hooks/useVendor';
import { Product } from '../types/vendor.types';
import VendorService from '../services/VendorService';
import '../styles/ProductManagement.css';

interface ProductManagementProps { vendorId: string; }

const ProductManagement: React.FC<ProductManagementProps> = ({ vendorId }) => {
  const { t } = useTranslation();
  const {
    products, total, isLoading, filters, setFilters,
    createProduct, updateProduct, deleteProduct, updateStock, refreshProducts,
  } = useVendorProducts(vendorId);

  const [showAddModal, setShowAddModal]       = useState(false);
  const [showEditModal, setShowEditModal]     = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery]         = useState('');
  const [categoryFilter, setCategoryFilter]   = useState('');
  const [statusFilter, setStatusFilter]       = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters({ ...filters, search: query, page: 1 });
  };

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category);
    setFilters({ ...filters, category: category || undefined, page: 1 });
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setFilters({ ...filters, status: status || undefined, page: 1 });
  };

  const toggleProductSelection = (productId: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  const selectAllProducts = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedProducts.size === 0) { alert(t('vendor.selectProductsFirst')); return; }
    const confirmMessage =
      action === 'delete'
        ? t('vendor.confirmDeleteProducts', { count: selectedProducts.size })
        : t('vendor.confirmBulkAction', { action, count: selectedProducts.size });
    if (!window.confirm(confirmMessage)) return;
    try {
      if (action === 'delete') {
        for (const productId of Array.from(selectedProducts)) {
          await deleteProduct(productId);
        }
      } else {
        await VendorService.bulkUpdateProducts(Array.from(selectedProducts), { isActive: action === 'activate' });
        await refreshProducts();
      }
      setSelectedProducts(new Set());
      alert(t('vendor.bulkActionSuccess'));
    } catch (error) {
      alert(t('vendor.bulkActionFailed'));
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm(t('vendor.confirmDeleteProduct'))) return;
    const success = await deleteProduct(productId);
    if (success) { alert(t('vendor.productDeleted')); } else { alert(t('vendor.deleteFailed')); }
  };

  const handleQuickStockUpdate = async (productId: string, currentStock: number) => {
    const newStock = prompt(t('vendor.enterNewStock'), currentStock.toString());
    if (newStock === null) return;
    const quantity = parseInt(newStock, 10);
    if (isNaN(quantity) || quantity < 0) { alert(t('vendor.invalidStock')); return; }
    const success = await updateStock(productId, quantity);
    if (success) { alert(t('vendor.stockUpdated')); } else { alert(t('vendor.stockUpdateFailed')); }
  };

  const handleExportProducts = async () => {
    try {
      await VendorService.exportProducts(vendorId);
      alert(t('vendor.exportSuccess'));
    } catch (error) {
      alert(t('vendor.exportFailed'));
    }
  };

  const formatCurrency = (amount: number) => `${amount.toLocaleString()} XAF`;

  return (
    <div className="product-management">
      <div className="pm-header">
        <div className="pm-header-left">
          <h1>{t('vendor.productManagement')}</h1>
          <span className="product-count">{total} {t('vendor.products')}</span>
        </div>
        <div className="pm-header-right">
          <button className="add-product-button" onClick={() => setShowAddModal(true)}>
            ➕ {t('vendor.addProduct')}
          </button>
        </div>
      </div>

      <div className="pm-filters">
        <div className="search-box">
          <input type="text" placeholder={t('vendor.searchProducts')} value={searchQuery} onChange={(e) => handleSearch(e.target.value)} className="search-input" />
        </div>
        <select value={categoryFilter} onChange={(e) => handleCategoryFilter(e.target.value)} className="filter-select">
          <option value="">{t('vendor.allCategories')}</option>
          <option value="food">{t('categories.food')}</option>
          <option value="electronics">{t('categories.electronics')}</option>
          <option value="fashion">{t('categories.fashion')}</option>
          <option value="beauty">{t('categories.beauty')}</option>
          <option value="home">{t('categories.home')}</option>
          <option value="services">{t('categories.services')}</option>
        </select>
        <select value={statusFilter} onChange={(e) => handleStatusFilter(e.target.value)} className="filter-select">
          <option value="">{t('vendor.allStatus')}</option>
          <option value="active">{t('vendor.active')}</option>
          <option value="inactive">{t('vendor.inactive')}</option>
        </select>
        <button className="export-button" onClick={handleExportProducts}>📥 {t('vendor.export')}</button>
      </div>

      {selectedProducts.size > 0 && (
        <div className="bulk-actions-bar">
          <span className="selected-count">{selectedProducts.size} {t('vendor.selected')}</span>
          <div className="bulk-action-buttons">
            <button className="bulk-button activate" onClick={() => handleBulkAction('activate')}>✓ {t('vendor.activate')}</button>
            <button className="bulk-button deactivate" onClick={() => handleBulkAction('deactivate')}>✕ {t('vendor.deactivate')}</button>
            <button className="bulk-button delete" onClick={() => handleBulkAction('delete')}>🗑ï¸ {t('vendor.delete')}</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="loading-state"><div className="spinner-large"></div><p>{t('common.loading')}</p></div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>{t('vendor.noProducts')}</h3>
          <p>{t('vendor.noProductsDescription')}</p>
          <button className="add-product-button" onClick={() => setShowAddModal(true)}>➕ {t('vendor.addFirstProduct')}</button>
        </div>
      ) : (
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th><input type="checkbox" checked={selectedProducts.size === products.length} onChange={selectAllProducts} /></th>
                <th>{t('vendor.product')}</th>
                <th>{t('vendor.category')}</th>
                <th>{t('vendor.price')}</th>
                <th>{t('vendor.stock')}</th>
                <th>{t('vendor.sales')}</th>
                <th>{t('vendor.status')}</th>
                <th>{t('vendor.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td><input type="checkbox" checked={selectedProducts.has(product.id)} onChange={() => toggleProductSelection(product.id)} /></td>
                  <td>
                    <div className="product-cell">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="product-thumbnail" />
                      ) : (
                        <div className="product-thumbnail-placeholder">📦</div>
                      )}
                      <div className="product-info">
                        <div className="product-name">{product.name}</div>
                        <div className="product-sku">SKU: {product.sku || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="category-badge">{product.category}</span></td>
                  <td>
                    <div className="price-cell">
                      <div className="current-price">{formatCurrency(product.price)}</div>
                      {product.compareAtPrice && <div className="compare-price">{formatCurrency(product.compareAtPrice)}</div>}
                    </div>
                  </td>
                  <td>
                    <div
                      className={`stock-cell ${product.stockQuantity === 0 ? 'out-of-stock' : product.stockQuantity <= product.lowStockThreshold ? 'low-stock' : ''}`}
                      onClick={() => handleQuickStockUpdate(product.id, product.stockQuantity)}
                      style={{ cursor: 'pointer' }}
                      title={t('vendor.clickToUpdate')}
                    >
                      {product.stockQuantity}
                      {product.stockQuantity <= product.lowStockThreshold && <span className="stock-warning">⚠ï¸</span>}
                    </div>
                  </td>
                  <td>
                    <div className="sales-cell">
                      {product.sales || 0}
                      <div className="views-subtext">{product.views || 0} views</div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                      {product.isActive ? t('vendor.active') : t('vendor.inactive')}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit" onClick={() => handleEditProduct(product)} title={t('vendor.edit')}>✏️</button>
                      <button className="action-btn delete" onClick={() => handleDeleteProduct(product.id)} title={t('vendor.delete')}>🗑ï¸</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <ProductModal
          vendorId={vendorId}
          onClose={() => setShowAddModal(false)}
          onSave={async (product) => {
            const newProduct = await createProduct(product);
            if (newProduct) {
              alert(t('vendor.productAdded'));
              setShowAddModal(false);
            } else {
              alert(t('vendor.productAddFailed'));
            }
          }}
        />
      )}

      {showEditModal && selectedProduct && (
        <ProductModal
          vendorId={vendorId}
          product={selectedProduct}
          onClose={() => { setShowEditModal(false); setSelectedProduct(null); }}
          onSave={async (updates) => {
            const success = await updateProduct(selectedProduct.id, updates);
            if (success) {
              alert(t('vendor.productUpdated'));
              setShowEditModal(false);
              setSelectedProduct(null);
            } else {
              alert(t('vendor.productUpdateFailed'));
            }
          }}
        />
      )}
    </div>
  );
};

interface ProductModalProps {
  vendorId: string;
  product?: Product;
  onClose: () => void;
  onSave: (product: Partial<Product>) => Promise<void>;
}

const ProductModal: React.FC<ProductModalProps> = ({ vendorId, product, onClose, onSave }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<Product>>(
    product || { name: '', description: '', category: '', price: 0, stockQuantity: 0, lowStockThreshold: 10, isActive: true, tags: [] }
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container product-modal">
        <div className="modal-header">
          <h2>{product ? t('vendor.editProduct') : t('vendor.addProduct')}</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>{t('vendor.productName')} *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder={t('vendor.enterProductName')} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>{t('vendor.category')} *</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                <option value="">{t('vendor.selectCategory')}</option>
                <option value="food">{t('categories.food')}</option>
                <option value="electronics">{t('categories.electronics')}</option>
                <option value="fashion">{t('categories.fashion')}</option>
                <option value="beauty">{t('categories.beauty')}</option>
                <option value="home">{t('categories.home')}</option>
                <option value="services">{t('categories.services')}</option>
              </select>
            </div>
            <div className="form-group">
              <label>{t('vendor.sku')}</label>
              <input type="text" value={formData.sku || ''} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} placeholder="ABC-001" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>{t('vendor.price')} (XAF) *</label>
              <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} required min="0" step="100" />
            </div>
            <div className="form-group">
              <label>{t('vendor.compareAtPrice')} (XAF)</label>
              <input type="number" value={formData.compareAtPrice || ''} onChange={(e) => setFormData({ ...formData, compareAtPrice: parseFloat(e.target.value) })} min="0" step="100" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>{t('vendor.stockQuantity')} *</label>
              <input type="number" value={formData.stockQuantity} onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value, 10) })} required min="0" />
            </div>
            <div className="form-group">
              <label>{t('vendor.lowStockThreshold')}</label>
              <input type="number" value={formData.lowStockThreshold} onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value, 10) })} min="0" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group full-width">
              <label>{t('vendor.description')}</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} placeholder={t('vendor.enterDescription')} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                <span>{t('vendor.activeProduct')}</span>
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} />
                <span>{t('vendor.featuredProduct')}</span>
              </label>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose} disabled={isSaving}>{t('common.cancel')}</button>
            <button type="submit" className="save-button" disabled={isSaving}>{isSaving ? t('common.saving') : t('common.save')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductManagement;



