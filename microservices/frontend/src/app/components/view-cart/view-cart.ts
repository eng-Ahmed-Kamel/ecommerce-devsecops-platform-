// import { Component, OnInit } from '@angular/core';
// import { CommonModule, CurrencyPipe } from '@angular/common';
// import { RouterLink, Router } from '@angular/router';
// import { CartService, ICartItem } from '../../services/cart-service';
// import { AuthService } from '../../services/auth.service';

// @Component({
//   selector: 'app-view-cart',
//   standalone: true,
//   imports: [CommonModule, CurrencyPipe, RouterLink],
//   templateUrl: './view-cart.html',
//   styleUrl: './view-cart.css',
// })
// export class ViewCart implements OnInit {
//   cartItems: ICartItem[] = [];

//   constructor(
//     private _cartService: CartService,
//     private _auth: AuthService,
//     private _router: Router
//   ) {}

//   ngOnInit(): void {
//     this.cartItems = this._cartService.getCartItems();
//   }

//   get isLoggedIn(): boolean { return this._auth.isLoggedIn(); }

//   proceedToCheckout(): void {
//     if (!this._auth.isLoggedIn()) {
//       this._router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
//     } else {
//       this._router.navigate(['/checkout']);
//     }
//   }

//   increment(id: number): void {
//     this._cartService.increment(id);
//     this.cartItems = this._cartService.getCartItems();
//   }

//   decrement(id: number): void {
//     this._cartService.decrement(id);
//     this.cartItems = this._cartService.getCartItems();
//   }

//   remove(id: number): void {
//     this._cartService.removeFromCart(id);
//     this.cartItems = this._cartService.getCartItems();
//   }

//   clearCart(): void {
//     this._cartService.clearCart();
//     this.cartItems = this._cartService.getCartItems();
//   }

//   get grandTotal(): number { return this._cartService.getGrandTotal(); }
//   get cartCount(): number  { return this._cartService.getCartCount(); }
// }
import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CartService, ICartItem } from '../../services/cart-service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-view-cart',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './view-cart.html',
  styleUrl: './view-cart.css',
})
export class ViewCart implements OnInit {
  cartItems: ICartItem[] = [];

  constructor(
    private _cartService: CartService,
    private _auth: AuthService,
    private _router: Router,
  ) {}

  ngOnInit(): void {
    this.cartItems = this._cartService.getCartItems();
  }

  get isLoggedIn(): boolean {
    return this._auth.isLoggedIn();
  }

  proceedToCheckout(): void {
    if (!this._auth.isLoggedIn()) {
      this._router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
    } else {
      this._router.navigate(['/checkout']);
    }
  }

  increment(id: string): void {
    this._cartService.increment(id);
    this.cartItems = this._cartService.getCartItems();
  }

  decrement(id: string): void {
    this._cartService.decrement(id);
    this.cartItems = this._cartService.getCartItems();
  }

  remove(id: string): void {
    this._cartService.removeFromCart(id);
    this.cartItems = this._cartService.getCartItems();
  }

  clearCart(): void {
    this._cartService.clearCart();
    this.cartItems = this._cartService.getCartItems();
  }

  get grandTotal(): number {
    return this._cartService.getGrandTotal();
  }
  get cartCount(): number {
    return this._cartService.getCartCount();
  }
}
