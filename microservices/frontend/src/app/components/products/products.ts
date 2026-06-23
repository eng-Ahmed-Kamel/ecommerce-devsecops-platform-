import { Subscription } from 'rxjs';

import { CommonModule, NgClass } from '@angular/common';
import {
	Component,
	EventEmitter,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { HighlightCard } from '../../directives/highlight-card';
import { IProduct } from '../../models/iproduct';
import { CalcPipe } from '../../pipes/calc-pipe-pipe';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart-service';
import { StaticProducts } from '../../services/static-products';
import { WishlistService } from '../../services/wishlist.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, NgClass, CalcPipe, HighlightCard, RouterLink, RouterLinkActive],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit, OnChanges, OnDestroy {
  @Input() recievedID: number = 0;
  @Input() overrideProducts: IProduct[] | null = null;
  @Output() total = new EventEmitter<number>();

  totalPrice: number = 0;
  filteratedList: IProduct[] = [];
  addedToCartId: string | null = null;

  private sub!: Subscription;

  constructor(
    private prdService: StaticProducts,
    private router: Router,
    private cartService: CartService,
    private authService: AuthService,
    private wishlistService: WishlistService,
  ) {}

  ngOnInit(): void {
    this.sub = this.prdService.products$.subscribe(() => {
      this.FilterationList();
    });
  }

  ngOnChanges(): void {
    this.FilterationList();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  FilterationList(): void {
    if (this.overrideProducts !== null) {
      this.filteratedList = this.overrideProducts;
      return;
    }
    this.filteratedList =
      this.recievedID === 0
        ? this.prdService.getAllProducts()
        : this.prdService.getProductByCatId(this.recievedID);
  }

  addToCart(p: IProduct): void {
    const live = this.prdService.getProductById(p._id);
    if (!live || live.quantity <= 0) return;

    this.cartService.addToCart(live);
    this.totalPrice += live.price;
    this.total.emit(this.totalPrice);

    this.addedToCartId = p._id;
    setTimeout(() => (this.addedToCartId = null), 800);
  }

  toggleWishlist(p: IProduct, event: MouseEvent): void {
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.wishlistService.toggleWishlist(p).subscribe();
  }

  isInWishlist(id: string): boolean {
    return this.wishlistService.isInWishlist(id);
  }

  isInCart(id: string): boolean {
    return this.cartService.isInCart(id);
  }

  liveStock(id: string): number {
    return this.prdService.getProductById(id)?.quantity ?? 0;
  }

  navigateToDetails(id: string): void {
    this.router.navigate(['/Details', id]);
  }
}
