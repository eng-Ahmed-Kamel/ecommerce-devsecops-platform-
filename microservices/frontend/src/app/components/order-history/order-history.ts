import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { IBackendOrder, OrderService } from '../../services/order-service';

export interface IMappedOrderItem {
  _id: string;
  name: string;
  imgUrl: string;
  price: number;
  cartQuantity: number;
}

export interface IMappedOrder {
  id: string;
  date: string;
  status: string;
  total: number;
  paymentMethod: string;
  address: string;
  customerName: string;
  subtotal: number;
  shipping: number;
  discount: number;
  promoCode?: string;
  items: IMappedOrderItem[];
}

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './order-history.html',
  styleUrl: './order-history.css',
})
export class OrderHistory implements OnInit, OnDestroy {
  orders: IMappedOrder[] = [];
  expandedOrderId: string | null = null;
  isLoading = true;
  statusSteps = ['pending', 'processing', 'shipped', 'delivered'];

  private routerSub!: Subscription;
  private retryTimer: any;

  constructor(
    private auth: AuthService,
    private orderService: OrderService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadOrders();

    this.routerSub = this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd && e.urlAfterRedirects.includes('order-history')),
      )
      .subscribe(() => this.loadOrders());
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    if (this.retryTimer) clearTimeout(this.retryTimer);
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getMyOrders().subscribe({
      next: (res) => {
        this.orders = res.orders.map((o) => this.mapBackendOrder(o));
        this.isLoading = false;
      },
      error: (err) => {
        if (err.status === 401) {
          // Auth not ready yet — retry once after 500ms
          this.retryTimer = setTimeout(() => this.loadOrders(), 200);
        } else if (err.status === 404) {
          this.orders = [];
          this.isLoading = false;
        } else {
          this.orders = [];
          this.isLoading = false;
        }
      },
    });
  }

  private mapBackendOrder(o: IBackendOrder): IMappedOrder {
    return {
      id: o._id,
      date: new Date(o.createdAt).toLocaleDateString('en-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      status: o.status,
      total: o.totalAmount,
      paymentMethod: o.paymentMethod === 'card' ? 'credit' : 'cod',
      address: `${o.shippingAddress.street}, ${o.shippingAddress.city}, ${o.shippingAddress.governorate}`,
      customerName: o.guestInfo?.name ?? '',
      subtotal: o.totalAmount,
      shipping: 0,
      discount: 0,
      items: o.products.map((p) => ({
        _id: p.product?._id ?? '',
        name: p.product?.name ?? 'Product',
        imgUrl: p.product?.imageCover ?? p.product?.image ?? '',
        price: p.price,
        cartQuantity: p.quantity,
      })),
    };
  }

  toggle(id: string): void {
    this.expandedOrderId = this.expandedOrderId === id ? null : id;
  }

  getStatusStep(status: string): number {
    return this.statusSteps.indexOf(status);
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      pending: '#b8965a',
      processing: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#22c55e',
      cancelled: '#ef4444',
    };
    return map[status] || '#7a6e68';
  }

  getPaymentIcon(method: string): string {
    if (method === 'credit' || method === 'card') return 'bi-credit-card-2-front';
    if (method === 'paypal') return 'bi-paypal';
    if (method === 'wallet') return 'bi-wallet2';
    return 'bi-cash-coin';
  }
}
