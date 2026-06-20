import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { IOrder } from '../../services/auth.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './order-confirmation.html',
  styleUrl: './order-confirmation.css',
})
export class OrderConfirmation implements OnInit {
  order: IOrder | null = null;

  statuses = [
    { key: 'confirmed',  label: 'Order Confirmed', icon: 'bi-check-circle-fill', desc: 'Your order has been received' },
    { key: 'processing', label: 'Processing',      icon: 'bi-gear-fill',         desc: 'Preparing your items' },
    { key: 'shipped',    label: 'Shipped',          icon: 'bi-truck',             desc: 'On its way to you' },
    { key: 'delivered',  label: 'Delivered',        icon: 'bi-house-check-fill',  desc: 'Enjoy your purchase!' },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    this.order = nav?.extras?.state?.['order'] || null;
    if (!this.order) this.router.navigate(['/Master']);
  }

  getStatusIndex(): number {
    return this.statuses.findIndex(s => s.key === this.order?.status);
  }

  getPaymentIcon(): string {
    const m = this.order?.paymentMethod || '';
    if (m === 'credit') return 'bi-credit-card-2-front';
    if (m === 'paypal') return 'bi-paypal';
    if (m === 'wallet') return 'bi-wallet2';
    return 'bi-cash-coin';
  }
}
