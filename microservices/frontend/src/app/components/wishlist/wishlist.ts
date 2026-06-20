import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IProduct } from '../../models/iproduct';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart-service';
import { WishlistService } from '../../services/wishlist.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
})
export class Wishlist implements OnInit {
  addingToCartId: string | null = null;

  constructor(
    private auth: AuthService,
    private cart: CartService,
    public wishlistService: WishlistService,
  ) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.wishlistService.loadWishlist().subscribe();
    }
  }

  get wishlistProducts(): IProduct[] {
    return this.wishlistService.wishlistProducts();
  }

  remove(product: IProduct): void {
    const result = this.wishlistService.toggleWishlist(product);
    if (result && typeof result.subscribe === 'function') {
      result.subscribe();
    }
  }

  addToCart(product: IProduct): void {
    this.addingToCartId = product._id;
    this.cart.addToCart(product);
    setTimeout(() => (this.addingToCartId = null), 800);
  }

  isInCart(id: string): boolean {
    return this.cart.isInCart(id);
  }

  getStock(p: IProduct): number {
    return p.stock ?? p.quantity ?? 0;
  }

  get isEmpty(): boolean {
    return this.wishlistProducts.length === 0;
  }
}
