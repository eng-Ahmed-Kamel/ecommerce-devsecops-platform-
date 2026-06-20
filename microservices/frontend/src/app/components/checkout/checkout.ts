import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { CartService, ICartItem } from '../../services/cart-service';
import { OrderService } from '../../services/order-service';
import { PaymentService } from '../../services/payment-service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CurrencyPipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  cartItems: ICartItem[] = [];
  step = 1;

  isGuest = false;
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  address = '';
  city = '';
  governorate = '';

  paymentMethod = 'credit';
  cardNumber = '';
  cardName = '';
  cardExpiry = '';
  cardCvv = '';

  // Promo
  promoCode = '';
  promoApplied = false;
  promoDiscount = 0;
  promoFinalAmount = 0;
  promoError = '';
  promoLoading = false;

  // Order processing
  isProcessing = false;
  paymentError = '';

  private readonly cartBase = 'http://localhost:3000/api/cart';

  constructor(
    private cartService: CartService,
    private auth: AuthService,
    private router: Router,
    private paymentService: PaymentService,
    private orderService: OrderService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }
    this.cartItems = this.cartService.getCartItems();
    const user = this.auth.currentUser();
    if (user) {
      this.email = user.email;
      this.firstName = user.name.split(' ')[0];
      this.lastName = user.name.split(' ').slice(1).join(' ');
      if (user.Address) this.address = user.Address;
    }
    if (this.cartItems.length === 0) this.router.navigate(['/cart']);
  }

  get subtotal(): number {
    return this.cartService.getGrandTotal();
  }
  get shipping(): number {
    return this.subtotal >= 1000 ? 0 : 80;
  }
  get discount(): number {
    return this.promoApplied ? this.promoDiscount : 0;
  }
  get total(): number {
    return this.subtotal + this.shipping - this.discount;
  }

  // ── Promo via cart endpoint ────────────────────────
  // Uses POST /api/cart/apply-promo which:
  // 1. Validates the code
  // 2. Calculates discount correctly (percentage vs fixed)
  // 3. Saves promo to the cart in MongoDB
  applyPromo(): void {
    if (!this.promoCode.trim()) return;
    this.promoLoading = true;
    this.promoError = '';

    this.http
      .post<any>(`${this.cartBase}/apply-promo`, {
        code: this.promoCode.trim().toUpperCase(),
      })
      .subscribe({
        next: (res) => {
          this.promoLoading = false;
          if (res.success) {
            // Backend returns the exact calculated discount
            this.promoDiscount = res.data.discount;
            this.promoFinalAmount = res.data.finalAmount;
            this.promoApplied = true;
            this.promoError = '';
          }
        },
        error: (err) => {
          this.promoLoading = false;
          this.promoApplied = false;
          this.promoDiscount = 0;
          this.promoError = err.error?.message ?? 'Invalid or inactive promo code.';
        },
      });
  }

  removePromo(): void {
    this.promoCode = '';
    this.promoApplied = false;
    this.promoDiscount = 0;
    this.promoError = '';
  }

  // ── Navigation ─────────────────────────────────────
  nextStep(): void {
    if (this.step < 3) this.step++;
  }
  prevStep(): void {
    if (this.step > 1) this.step--;
  }

  // ── Place Order ────────────────────────────────────
  placeOrder(): void {
    this.paymentError = '';
    if (this.paymentMethod === 'credit') {
      this.runCardPayment();
    } else {
      this.saveOrderToBackend('cash');
    }
  }

  private runCardPayment(): void {
    this.isProcessing = true;
    this.paymentService
      .createCustomer(`${this.firstName} ${this.lastName}`.trim(), this.email)
      .subscribe({
        next: () =>
          this.paymentService.addCard('tok_visa').subscribe({
            next: () =>
              this.paymentService
                .createCharge(this.total, 'usd', `Order – ${this.email}`)
                .subscribe({
                  next: () => this.saveOrderToBackend('card'),
                  error: (err: Error) => this.onPaymentError(err.message),
                }),
            error: (err: Error) => this.onPaymentError(err.message),
          }),
        error: (err: Error) => this.onPaymentError(err.message),
      });
  }

  private onPaymentError(msg: string): void {
    this.isProcessing = false;
    this.paymentError = msg;
  }

  private saveOrderToBackend(method: 'cash' | 'card'): void {
    this.isProcessing = true;

    this.orderService
      .createOrder({
        street: this.address,
        city: this.city,
        governorate: this.governorate,
        paymentMethod: method,
        ...(this.promoApplied && this.promoCode ? { coupon: this.promoCode.toUpperCase() } : {}),
      })
      .subscribe({
        next: (res) => {
          this.isProcessing = false;
          const localOrder = this.auth.placeOrder({
            items: this.cartItems,
            subtotal: this.subtotal,
            shipping: this.shipping,
            discount: this.discount,
            promoCode: this.promoApplied ? this.promoCode : undefined,
            total: this.total,
            paymentMethod: method,
            address: `${this.address}, ${this.city}, ${this.governorate}`,
            customerName: `${this.firstName} ${this.lastName}`,
            email: this.email,
          });
          this.cartService.clearCart();
          this.router.navigate(['/order-confirmation'], {
            state: { order: localOrder, backendOrderId: res.order._id },
          });
        },
        error: (err: Error) => {
          this.isProcessing = false;
          this.paymentError = 'Order could not be saved: ' + err.message;
        },
      });
  }
}
