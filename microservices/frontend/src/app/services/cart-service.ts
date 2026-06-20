import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { IProduct } from '../models/iproduct';

export interface ICartItem extends IProduct {
  cartQuantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartItems: ICartItem[] = [];
  private readonly base = 'http://localhost:3000/api/cart';

  constructor(private http: HttpClient) {}

  // ── Add ────────────────────────────────────────────
  addToCart(product: IProduct): void {
    const existing = this.cartItems.find((i) => i._id === product._id);
    if (existing) {
      existing.cartQuantity++;
    } else {
      this.cartItems.push({ ...product, cartQuantity: 1 });
    }

    // Sync to backend
    this.http
      .post(`${this.base}/add`, {
        productId: product._id,
        quantity: 1,
      })
      .subscribe({ error: (e) => console.error('Cart sync error:', e) });
  }

  // ── Remove entirely ────────────────────────────────
  removeFromCart(productId: string): void {
    this.cartItems = this.cartItems.filter((i) => i._id !== productId);

    // Sync to backend
    this.http
      .delete(`${this.base}/remove/${productId}`)
      .subscribe({ error: (e) => console.error('Cart remove error:', e) });
  }

  // ── Increment ──────────────────────────────────────
  increment(productId: string): void {
    const item = this.cartItems.find((i) => i._id === productId);
    if (!item) return;
    item.cartQuantity++;

    // Sync to backend
    this.http
      .patch(`${this.base}/quantity_adjustment/${productId}`, {
        quantity: item.cartQuantity,
      })
      .subscribe({ error: (e) => console.error('Cart increment error:', e) });
  }

  // ── Decrement ──────────────────────────────────────
  decrement(productId: string): void {
    const item = this.cartItems.find((i) => i._id === productId);
    if (!item) return;

    item.cartQuantity--;

    if (item.cartQuantity <= 0) {
      this.cartItems = this.cartItems.filter((i) => i._id !== productId);
      // Remove from backend
      this.http
        .delete(`${this.base}/remove/${productId}`)
        .subscribe({ error: (e) => console.error('Cart decrement error:', e) });
    } else {
      // Update quantity on backend
      this.http
        .patch(`${this.base}/quantity_adjustment/${productId}`, {
          quantity: item.cartQuantity,
        })
        .subscribe({ error: (e) => console.error('Cart decrement error:', e) });
    }
  }

  // ── Clear (called after order placed — backend clears on order creation) ──
  clearCart(): void {
    this.cartItems = [];
  }

  // ── Load cart from backend (call on app init / cart page) ─────────────────
  loadFromBackend(): void {
    this.http.get<any>(`${this.base}`).subscribe({
      next: (res) => {
        const products = res.cart?.products ?? [];
        this.cartItems = products.map((item: any) => ({
          ...item.product,
          _id: item.product._id,
          imgUrl: item.product.imageCover ?? item.product.image ?? '',
          quantity: item.product.stock ?? item.product.quantity ?? 0,
          cartQuantity: item.quantity,
        }));
      },
      error: (e) => console.error('Cart load error:', e),
    });
  }

  // ── Getters ────────────────────────────────────────
  getCartItems(): ICartItem[] {
    return this.cartItems;
  }
  getCartCount(): number {
    return this.cartItems.reduce((s, i) => s + i.cartQuantity, 0);
  }
  getGrandTotal(): number {
    return this.cartItems.reduce((s, i) => s + i.price * i.cartQuantity, 0);
  }
  isInCart(id: string): boolean {
    return this.cartItems.some((i) => i._id === id);
  }
  getCartQuantity(id: string): number {
    return this.cartItems.find((i) => i._id === id)?.cartQuantity ?? 0;
  }
}
