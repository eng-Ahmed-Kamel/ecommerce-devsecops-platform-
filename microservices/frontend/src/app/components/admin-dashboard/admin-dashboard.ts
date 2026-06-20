import { Subscription } from 'rxjs';

import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { IProduct } from '../../models/iproduct';
import { AuthService, IBanner } from '../../services/auth.service';
import {
	IProductPayload,
	ProductService,
} from '../../services/product.service';
import { StaticProducts } from '../../services/static-products';

export interface IApiCategory {
  _id: string;
  category_name: string;
}

export interface IDbUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isblocked: boolean;
  isVerified: boolean;
  deletedAt: string | null;
  createdAt: string;
}

export interface IDbOrderProduct {
  product: { _id: string; name: string; price: number; image: string };
  quantity: number;
  price: number;
}

export interface IDbOrder {
  _id: string;
  user_id: string | null;
  products: IDbOrderProduct[];
  totalAmount: number;
  discount: number;
  promoCode: string | null;
  status: string;
  paymentMethod: string;
  shippingAddress: { governorate: string; city: string; street: string };
  guestInfo?: { name: string; email: string; phone: string };
  createdAt: string;
  // local UI state — not from API
  savingStatus?: boolean;
}

export interface IApiPromo {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses?: number;
  expiresAt?: string;
  isActive: boolean;
  usedCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CurrencyPipe],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit, OnDestroy {
  private sub!: Subscription;
  private readonly apiUrl = 'http://localhost:3000/api';

  // Toast notifications
  toasts: { id: number; message: string; type: 'success' | 'error' | 'info' }[] = [];
  private toastCounter = 0;

  showToast(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    const id = ++this.toastCounter;
    this.toasts.push({ id, message, type });
    setTimeout(() => {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    }, 3500);
  }

  dismissToast(id: number): void {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }

  // Products
  products: IProduct[] = [];
  activeTab = 'products';
  searchTerm = '';
  showModal = false;
  saving = false;
  editingProduct: IProduct | null = null;
  apiCategories: IApiCategory[] = [];
  form: {
    name?: string;
    price?: number;
    stock?: number;
    imgUrl?: string;
    categoryId?: string;
    description?: string;
    gender?: 'men' | 'women' | 'unisex';
  } = {};

  // Users
  dbUsers: IDbUser[] = [];
  usersLoading = false;

  // Orders
  dbOrders: IDbOrder[] = [];
  ordersLoading = false;
  orderStatuses = ORDER_STATUSES;
  orderStatusFilter = 'all';
  orderSearch = '';

  // Promo codes
  showPromoModal = false;
  editingPromo: IApiPromo | null = null;
  promoForm: Partial<IApiPromo> = {};
  apiPromos: IApiPromo[] = [];
  promosLoading = false;
  pendingDeletePromoId: string | null = null;

  // Banners
  showBannerModal = false;
  editingBanner: IBanner | null = null;
  bannerForm: Partial<IBanner> = {};

  constructor(
    private productStore: StaticProducts,
    private productApi: ProductService,
    private auth: AuthService,
    private router: Router,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    if (!this.auth.isAdmin()) {
      this.router.navigate(['/login']);
      return;
    }
    this.sub = this.productStore.products$.subscribe((prds) => {
      this.products = prds;
    });
    this.http.get<any>(`${this.apiUrl}/categories?limit=50`).subscribe((res) => {
      this.apiCategories = res.data?.categories ?? [];
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // ── Tab switch ─────────────────────────────────────
  onTabChange(tab: string): void {
    this.activeTab = tab;
    if (tab === 'users' && this.dbUsers.length === 0) this.loadUsers();
    if (tab === 'orders' && this.dbOrders.length === 0) this.loadOrders();
    if (tab === 'promos' && this.apiPromos.length === 0) this.loadPromos();
  }

  // ── Users ──────────────────────────────────────────
  loadUsers(): void {
    this.usersLoading = true;
    this.http.get<any>(`${this.apiUrl}/user/all`).subscribe({
      next: (res) => {
        this.dbUsers = res.users ?? [];
        this.usersLoading = false;
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.usersLoading = false;
      },
    });
  }

  toggleBlock(user: IDbUser): void {
    this.http.patch<any>(`${this.apiUrl}/user/block/${user._id}`, {}).subscribe({
      next: (res) => {
        user.isblocked = res.user.isblocked;
      },
      error: (err) => console.error('Block/unblock failed', err),
    });
  }

  // ── Orders ─────────────────────────────────────────
  loadOrders(): void {
    this.ordersLoading = true;
    this.http.get<any>(`${this.apiUrl}/order/all`).subscribe({
      next: (res) => {
        this.dbOrders = res.orders ?? [];
        this.ordersLoading = false;
      },
      error: (err) => {
        console.error('Failed to load orders', err);
        this.ordersLoading = false;
      },
    });
  }

  get filteredOrders(): IDbOrder[] {
    return this.dbOrders.filter((o) => {
      const matchStatus = this.orderStatusFilter === 'all' || o.status === this.orderStatusFilter;
      const term = this.orderSearch.toLowerCase();
      const matchSearch =
        !term ||
        o._id.toLowerCase().includes(term) ||
        (o.guestInfo?.name ?? '').toLowerCase().includes(term) ||
        o.shippingAddress.governorate.toLowerCase().includes(term);
      return matchStatus && matchSearch;
    });
  }

  getCustomerName(order: IDbOrder): string {
    if (order.guestInfo?.name) return order.guestInfo.name + ' (Guest)';
    return order.user_id ? 'Registered User' : 'Unknown';
  }

  changeOrderStatus(order: IDbOrder, newStatus: string): void {
    order.savingStatus = true;
    this.http
      .patch<any>(`${this.apiUrl}/order/status/${order._id}`, { status: newStatus })
      .subscribe({
        next: (res) => {
          order.status = res.order.status;
          order.savingStatus = false;
        },
        error: (err) => {
          console.error('Status update failed', err);
          order.savingStatus = false;
        },
      });
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#22c55e',
      cancelled: '#ef4444',
    };
    return map[status] ?? '#7a6e68';
  }

  getOrderItemCount(order: IDbOrder): number {
    return order.products.reduce((s, p) => s + p.quantity, 0);
  }

  // ── Products ───────────────────────────────────────
  get filteredProducts(): IProduct[] {
    return this.products.filter((p) =>
      p.name.toLowerCase().includes(this.searchTerm.toLowerCase()),
    );
  }

  openAdd(): void {
    this.editingProduct = null;
    this.form = { categoryId: this.apiCategories[0]?._id ?? '', stock: 1, gender: 'unisex' };
    this.showModal = true;
  }

  openEdit(product: IProduct): void {
    this.editingProduct = product;
    const catId =
      typeof product.categoryId === 'object'
        ? (product.categoryId as any)?._id?.toString()
        : product.categoryId;
    this.form = {
      name: product.name,
      price: product.price,
      stock: product.stock ?? product.quantity,
      imgUrl: product.imgUrl || product.image,
      categoryId: catId,
      description: product.description,
      gender: product.gender as any,
    };
    this.showModal = true;
  }

  save(): void {
    if (!this.form.name || !this.form.price || !this.form.categoryId) return;
    this.saving = true;
    const payload: IProductPayload = {
      name: this.form.name,
      description: this.form.description || '',
      price: Number(this.form.price),
      categoryId: this.form.categoryId,
      stock: Number(this.form.stock ?? 1),
      image: this.form.imgUrl || '',
      gender: this.form.gender ?? 'unisex',
    };
    if (this.editingProduct) {
      this.productApi.updateProduct(this.editingProduct._id, payload).subscribe({
        next: () => {
          this.productStore.reloadProducts();
          this.showModal = false;
          this.saving = false;
        },
        error: (err) => {
          alert('Update failed: ' + (err.error?.message || err.message));
          this.saving = false;
        },
      });
    } else {
      this.productApi.createProduct(payload).subscribe({
        next: () => {
          this.productStore.reloadProducts();
          this.showModal = false;
          this.saving = false;
        },
        error: (err) => {
          alert('Create failed: ' + (err.error?.message || err.message));
          this.saving = false;
        },
      });
    }
  }

  delete(id: string): void {
    if (!confirm('Delete this product permanently from the database?')) return;
    this.productApi.deleteProduct(id).subscribe({
      next: () => this.productStore.reloadProducts(),
      error: (err) => console.error('Delete failed', err),
    });
  }

  getCategoryName(categoryId: any): string {
    const id =
      typeof categoryId === 'object' ? categoryId?._id?.toString() : categoryId?.toString();
    return this.apiCategories.find((c) => c._id === id)?.category_name ?? id ?? 'Unknown';
  }

  // ── Featured ───────────────────────────────────────
  isFeatured(id: string): boolean {
    return this.auth.featuredProductIds().includes(id);
  }

  toggleFeatured(id: string): void {
    this.auth.toggleFeaturedProduct(id);
  }

  // ── Promo Codes ────────────────────────────────────
  loadPromos(): void {
    this.promosLoading = true;
    this.http.get<any>(`${this.apiUrl}/promo`).subscribe({
      next: (res) => {
        this.apiPromos = res.data?.promos ?? res.data ?? res.promos ?? [];
        this.promosLoading = false;
      },
      error: (err) => {
        console.error('Failed to load promos', err);
        this.showToast('Failed to load promo codes', 'error');
        this.promosLoading = false;
      },
    });
  }

  openAddPromo(): void {
    this.editingPromo = null;
    this.promoForm = { discountType: 'percentage', isActive: true };
    this.showPromoModal = true;
  }

  openEditPromo(p: IApiPromo): void {
    this.editingPromo = p;
    this.promoForm = { ...p };
    this.showPromoModal = true;
  }

  savePromo(): void {
    if (!this.promoForm.code || !this.promoForm.discountValue) return;

    const payload: any = {
      code: this.promoForm.code!.toUpperCase(),
      discountType: this.promoForm.discountType ?? 'percentage',
      discountValue: this.promoForm.discountValue!,
      isActive: this.promoForm.isActive ?? true,
    };
    if (this.promoForm.maxUses != null) payload.maxUses = this.promoForm.maxUses;
    if (this.promoForm.expiresAt) payload.expiresAt = this.promoForm.expiresAt;

    if (this.editingPromo) {
      this.http.put<any>(`${this.apiUrl}/promo/${this.editingPromo._id}`, payload).subscribe({
        next: () => {
          this.loadPromos();
          this.showPromoModal = false;
          this.showToast('Promo code updated successfully');
        },
        error: (err) => {
          console.error('Update promo failed', err);
          this.showToast(err.error?.message || 'Failed to update promo code', 'error');
        },
      });
    } else {
      this.http.post<any>(`${this.apiUrl}/promo`, payload).subscribe({
        next: () => {
          this.loadPromos();
          this.showPromoModal = false;
          this.showToast('Promo code added successfully');
        },
        error: (err) => {
          this.loadPromos();
          this.showPromoModal = false;
          const msg = err.error?.message || 'Promo code already exists';
          this.showToast(msg, 'error');
        },
      });
    }
  }

  deletePromo(id: string): void {
    this.pendingDeletePromoId = id;
  }

  confirmDeletePromo(): void {
    if (!this.pendingDeletePromoId) return;
    const id = this.pendingDeletePromoId;
    this.pendingDeletePromoId = null;
    this.http.delete<any>(`${this.apiUrl}/promo/${id}`).subscribe({
      next: () => {
        this.loadPromos();
        this.showToast('Promo code deleted');
      },
      error: (err) => {
        console.error('Delete promo failed', err);
        this.showToast(err.error?.message || 'Failed to delete promo code', 'error');
      },
    });
  }

  cancelDeletePromo(): void {
    this.pendingDeletePromoId = null;
  }

  togglePromo(promo: IApiPromo): void {
    const payload = {
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      isActive: !promo.isActive,
      ...(promo.maxUses != null && { maxUses: promo.maxUses }),
      ...(promo.expiresAt && { expiresAt: promo.expiresAt }),
    };
    this.http.put<any>(`${this.apiUrl}/promo/${promo._id}`, payload).subscribe({
      next: () => {
        this.loadPromos();
        this.showToast(`Promo code ${!promo.isActive ? 'activated' : 'deactivated'}`);
      },
      error: (err) => {
        console.error('Toggle promo failed', err);
        this.showToast('Failed to update promo status', 'error');
      },
    });
  }

  // ── Banners ────────────────────────────────────────
  get banners() {
    return this.auth.banners();
  }

  openAddBanner(): void {
    this.editingBanner = null;
    this.bannerForm = { active: true };
    this.showBannerModal = true;
  }

  openEditBanner(b: IBanner): void {
    this.editingBanner = b;
    this.bannerForm = { ...b };
    this.showBannerModal = true;
  }

  saveBanner(): void {
    if (!this.bannerForm.imageUrl || !this.bannerForm.title) return;
    if (this.editingBanner) {
      this.auth.updateBanner(this.editingBanner.id, this.bannerForm);
    } else {
      this.auth.addBanner({
        imageUrl: this.bannerForm.imageUrl!,
        title: this.bannerForm.title!,
        subtitle: this.bannerForm.subtitle || '',
        active: this.bannerForm.active ?? true,
      });
    }
    this.showBannerModal = false;
  }

  deleteBanner(id: number): void {
    if (confirm('Delete banner?')) this.auth.deleteBanner(id);
  }

  toggleBanner(id: number, active: boolean): void {
    this.auth.updateBanner(id, { active });
  }

  // ── Stats ──────────────────────────────────────────
  get stats() {
    return {
      totalProducts: this.products.length,
      totalOrders: this.dbOrders.length,
      totalRevenue: this.dbOrders.reduce((s, o) => s + o.totalAmount, 0),
      lowStock: this.products.filter((p) => (p.stock ?? p.quantity) <= 2).length,
      totalUsers: this.dbUsers.filter((u) => u.role === 'user').length,
      restrictedUsers: this.dbUsers.filter((u) => u.isblocked).length,
    };
  }

  logout(): void {
    this.auth.logout();
  }
}
