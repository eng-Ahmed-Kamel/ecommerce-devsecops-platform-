import { Observable, of, tap } from 'rxjs';

import { Injectable, signal } from '@angular/core';

import { IProduct } from '../models/iproduct';
import { ProductService } from './product.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  // ── State ──────────────────────────────────────────
  private _products = signal<IProduct[]>([]);
  private _ids = signal<Set<string>>(new Set());

  /** Reactive list of full product objects in the wishlist */
  wishlistProducts = this._products.asReadonly();

  /** Quick O(1) check */
  isInWishlist(id: string): boolean {
    return this._ids().has(id);
  }

  get count(): number {
    return this._products().length;
  }

  constructor(private productApi: ProductService) {}

  // ── Load from backend ──────────────────────────────
  /** Call once on login / app init. Returns observable so caller can subscribe. */
  loadWishlist(): Observable<any> {
    return this.productApi.getFavourites().pipe(
      tap((res) => {
        // Backend returns: { status, data: { products: [...] } }
        // AFTER
        const raw: any[] = res?.data?.products ?? res?.data ?? res?.products ?? [];
        const mapped = raw.map((p: any) => this._map(p));
        this._products.set(mapped);
        this._ids.set(new Set(mapped.map((p) => p._id)));
      }),
    );
  }

  // ── Toggle (add / remove) ──────────────────────────
  /**
   * Optimistically updates local state, then syncs with backend.
   * Pass the full IProduct so we can add it locally without a reload.
   */
  toggleWishlist(product: IProduct): Observable<any> {
    const id = product._id;
    const wasIn = this._ids().has(id);

    // Optimistic update
    if (wasIn) {
      this._products.update((list) => list.filter((p) => p._id !== id));
      this._ids.update((set) => {
        const s = new Set(set);
        s.delete(id);
        return s;
      });
    } else {
      this._products.update((list) => [...list, product]);
      this._ids.update((set) => new Set([...set, id]));
    }

    // Sync with backend — on error, roll back
    return this.productApi.toggleFavorite(id).pipe(
      tap({
        error: () => {
          // Roll back on failure
          if (wasIn) {
            this._products.update((list) => [...list, product]);
            this._ids.update((set) => new Set([...set, id]));
          } else {
            this._products.update((list) => list.filter((p) => p._id !== id));
            this._ids.update((set) => {
              const s = new Set(set);
              s.delete(id);
              return s;
            });
          }
        },
      }),
    );
  }

  /** Clear state on logout */
  clear(): void {
    this._products.set([]);
    this._ids.set(new Set());
  }

  // ── Mapper ─────────────────────────────────────────
  private _map(p: any): IProduct {
    return {
      ...p,
      imgUrl: p.imgUrl ?? p.image ?? '',
      quantity: p.quantity ?? p.stock ?? 0,
      stock: p.stock ?? p.quantity ?? 0,
    };
  }
}
