// import { Component, OnInit } from '@angular/core';
// import { Products } from '../products/products';
// import { ICategory } from '../../models/icategory';
// import { NgClass, CommonModule } from '@angular/common';
// import { StaticProducts, IGender } from '../../services/static-products';
// import { RouterLink, RouterLinkActive } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { AuthService } from '../../services/auth.service';
// import { CartService } from '../../services/cart-service';
// import { IProduct } from '../../models/iproduct';

// @Component({
//   selector: 'app-master-products',
//   standalone: true,
//   imports: [CommonModule, Products, NgClass, RouterLink, RouterLinkActive, FormsModule],
//   templateUrl: './master-products.html',
//   styleUrl: './master-products.css',
// })
// export class MasterProducts implements OnInit {
//   // ── Gender tier ────────────────────────────────────
//   genderList: IGender[] = [];
//   selectedGender: string = 'all'; // 'all' | 'women' | 'men'

//   // ── Category tier ──────────────────────────────────
//   selectedCatId: number = 0;
//   catList: ICategory[] = [];

//   // ── Search / Price ─────────────────────────────────
//   searchTerm = '';
//   minPrice: number | null = null;
//   maxPrice: number | null = null;

//   filteredProducts: IProduct[] = [];
//   allProducts: IProduct[] = [];

//   constructor(
//     private _prdService: StaticProducts,
//     private auth: AuthService,
//     private cartService: CartService,
//   ) {}

//   ngOnInit(): void {
//     this.genderList = this._prdService.getAllGenders();
//     this.catList = this._prdService.getAllCategories();
//     this.allProducts = this._prdService.getAllProducts();
//     this.applyFilters();
//   }

//   // ── Live cart getters ──────────────────────────────
//   get cartCount(): number {
//     return this.cartService.getCartCount();
//   }
//   get grandTotal(): number {
//     return this.cartService.getGrandTotal();
//   }

//   receiveTotal(_total: number) {
//     /* no-op */
//   }

//   // ── Gender selection ───────────────────────────────
//   selectGender(id: string): void {
//     this.selectedGender = id;
//     this.selectedCatId = 0; // reset subcategory when gender changes
//     this.applyFilters();
//   }

//   // ── Category selection ─────────────────────────────
//   selectCategory(id: number): void {
//     this.selectedCatId = id;
//     this.applyFilters();
//   }

//   // ── Master filter pipeline ─────────────────────────
//   applyFilters(): void {
//     // 1. Gender filter
//     let list =
//       this.selectedGender === 'all'
//         ? this.allProducts
//         : this.allProducts.filter((p) => p.gender === this.selectedGender);

//     // 2. Category filter
//     if (this.selectedCatId !== 0) {
//       list = list.filter((p) => p.categoryId === this.selectedCatId);
//     }

//     // 3. Search filter
//     if (this.searchTerm.trim()) {
//       const q = this.searchTerm.toLowerCase();
//       list = list.filter((p) => p.name.toLowerCase().includes(q));
//     }

//     // 4. Price filters
//     if (this.minPrice !== null) list = list.filter((p) => p.price >= this.minPrice!);
//     if (this.maxPrice !== null) list = list.filter((p) => p.price <= this.maxPrice!);

//     this.filteredProducts = list;
//   }

//   clearFilters(): void {
//     this.searchTerm = '';
//     this.minPrice = null;
//     this.maxPrice = null;
//     this.applyFilters();
//   }

//   get featuredProducts(): IProduct[] {
//     const ids = this.auth.featuredProductIds();
//     return this.allProducts.filter((p) => ids.includes(p.id));
//   }

//   get activeBanners() {
//     return this.auth.activeBanners;
//   }
// }
// import { Component, OnInit } from '@angular/core';
// import { Products } from '../products/products';
// import { ICategory } from '../../models/icategory';
// import { NgClass, CommonModule } from '@angular/common';
// import { StaticProducts, IGender } from '../../services/static-products';
// import { RouterLink, RouterLinkActive } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { AuthService } from '../../services/auth.service';
// import { CartService } from '../../services/cart-service';
// import { IProduct } from '../../models/iproduct';

// @Component({
//   selector: 'app-master-products',
//   standalone: true,
//   imports: [CommonModule, Products, NgClass, RouterLink, RouterLinkActive, FormsModule],
//   templateUrl: './master-products.html',
//   styleUrl: './master-products.css',
// })
// export class MasterProducts implements OnInit {
//   // ── Gender tier ────────────────────────────────────
//   genderList: IGender[] = [];
//   selectedGender: string = 'all'; // 'all' | 'women' | 'men'

//   // ── Category tier ──────────────────────────────────
//   selectedCatId: number = 0;
//   catList: ICategory[] = [];

//   // ── Search / Price ─────────────────────────────────
//   searchTerm = '';
//   minPrice: number | null = null;
//   maxPrice: number | null = null;

//   filteredProducts: IProduct[] = [];
//   allProducts: IProduct[] = [];

//   constructor(
//     private _prdService: StaticProducts,
//     private auth: AuthService,
//     private cartService: CartService,
//   ) {}

//   ngOnInit(): void {
//     this.genderList = this._prdService.getAllGenders();
//     this.catList = this._prdService.getAllCategories();
//     this.allProducts = this._prdService.getAllProducts();
//     this.applyFilters();
//   }

//   // ── Live cart getters ──────────────────────────────
//   get cartCount(): number {
//     return this.cartService.getCartCount();
//   }
//   get grandTotal(): number {
//     return this.cartService.getGrandTotal();
//   }

//   receiveTotal(_total: number) {
//     /* no-op */
//   }

//   // ── Gender selection ───────────────────────────────
//   selectGender(id: string): void {
//     this.selectedGender = id;
//     this.selectedCatId = 0; // reset subcategory when gender changes
//     this.applyFilters();
//   }

//   // ── Category selection ─────────────────────────────
//   selectCategory(id: number): void {
//     this.selectedCatId = id;
//     this.applyFilters();
//   }

//   // ── Master filter pipeline ─────────────────────────
//   applyFilters(): void {
//     // 1. Gender filter
//     let list =
//       this.selectedGender === 'all'
//         ? this.allProducts
//         : this.allProducts.filter((p) => p.gender === this.selectedGender);

//     // 2. Category filter
//     if (this.selectedCatId !== 0) {
//       list = list.filter((p) => p.categoryId === this.selectedCatId);
//     }

//     // 3. Search filter
//     if (this.searchTerm.trim()) {
//       const q = this.searchTerm.toLowerCase();
//       list = list.filter((p) => p.name.toLowerCase().includes(q));
//     }

//     // 4. Price filters
//     if (this.minPrice !== null) list = list.filter((p) => p.price >= this.minPrice!);
//     if (this.maxPrice !== null) list = list.filter((p) => p.price <= this.maxPrice!);

//     this.filteredProducts = list;
//   }

//   clearFilters(): void {
//     this.searchTerm = '';
//     this.minPrice = null;
//     this.maxPrice = null;
//     this.applyFilters();
//   }

//   get featuredProducts(): IProduct[] {
//     const ids = this.auth.featuredProductIds();
//     return this.allProducts.filter((p) => ids.includes(p.id));
//   }

//   get activeBanners() {
//     return this.auth.activeBanners;
//   }
// }
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Products } from '../products/products';
import { NgClass, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart-service';
import { StaticProducts } from '../../services/static-products';
import { IProduct } from '../../models/iproduct';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

export interface IGender {
  id: string;
  name: string;
}
export interface IApiCategory {
  _id: string;
  category_name: string;
}

@Component({
  selector: 'app-master-products',
  standalone: true,
  imports: [CommonModule, Products, NgClass, RouterLink, FormsModule],
  templateUrl: './master-products.html',
  styleUrl: './master-products.css',
})
export class MasterProducts implements OnInit, OnDestroy {
  genderList: IGender[] = [
    { id: 'all', name: 'All' },
    { id: 'women', name: 'Women' },
    { id: 'men', name: 'Men' },
  ];
  selectedGender = 'all';

  catList: { id: number; name: string; mongoId: string }[] = [];
  selectedCatId = 0;

  searchTerm = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  // permanent full list — never overwritten after initial load
  private _fullList: IProduct[] = [];

  // current base list for selected category (subset of _fullList)
  private _categoryList: IProduct[] = [];

  filteredProducts: IProduct[] = [];

  private readonly apiUrl = 'http://localhost:3000/api';
  private _sub!: Subscription;

  constructor(
    private prdService: StaticProducts,
    private auth: AuthService,
    private cartService: CartService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    // Load categories for the tab bar
    this.http.get<any>(`${this.apiUrl}/categories?limit=50`).subscribe((res) => {
      const cats: IApiCategory[] = res.data?.categories ?? [];
      this.catList = [
        { id: 0, name: 'All Pieces', mongoId: '' },
        ...cats.map((c, i) => ({ id: i + 1, name: c.category_name, mongoId: c._id })),
      ];
    });

    // Subscribe to the products$ stream from StaticProducts service (which fetches from the API)
    this._sub = this.prdService.products$.subscribe((products) => {
      this._fullList = products;
      // Re-apply category filter if one is active, otherwise use full list
      if (this.selectedCatId === 0) {
        this._categoryList = this._fullList;
      } else {
        this._applySelectedCategory();
      }
      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    this._sub?.unsubscribe();
  }

  get cartCount(): number {
    return this.cartService.getCartCount();
  }
  get grandTotal(): number {
    return this.cartService.getGrandTotal();
  }
  receiveTotal(_: number) {}

  selectGender(id: string): void {
    this.selectedGender = id;
    this.applyFilters();
  }

  selectCategory(id: number): void {
    this.selectedCatId = id;

    if (id === 0) {
      this._categoryList = this._fullList;
      this.applyFilters();
      return;
    }

    this._applySelectedCategory();
    this.applyFilters();
  }

  /** Filters _fullList by the selected category's mongoId */
  private _applySelectedCategory(): void {
    const cat = this.catList.find((c) => c.id === this.selectedCatId);
    if (!cat?.mongoId) {
      this._categoryList = this._fullList;
      return;
    }
    // Products from the backend have categoryId as a MongoDB ObjectId string
    this._categoryList = this._fullList.filter((p) => {
      // p.categoryId may be a plain ObjectId string or a populated object
      const catId =
        typeof p.categoryId === 'object'
          ? (p.categoryId as any)?._id?.toString()
          : p.categoryId?.toString();
      return catId === cat.mongoId;
    });
  }

  applyFilters(): void {
    let list = [...this._categoryList];

    if (this.selectedGender !== 'all') {
      list = list.filter((p) => p.gender === this.selectedGender);
    }

    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (this.minPrice !== null) list = list.filter((p) => p.price >= this.minPrice!);
    if (this.maxPrice !== null) list = list.filter((p) => p.price <= this.maxPrice!);

    this.filteredProducts = list;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.selectedGender = 'all';
    this.selectedCatId = 0;
    this._categoryList = this._fullList;
    this.applyFilters();
  }

  get featuredProducts(): IProduct[] {
    const ids = this.auth.featuredProductIds();
    return this._fullList.filter((p) => ids.includes(p._id));
  }

  get activeBanners() {
    return this.auth.activeBanners;
  }
}
