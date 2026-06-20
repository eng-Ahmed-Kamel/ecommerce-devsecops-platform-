import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IProduct } from '../models/iproduct';

export interface IProductsResponse {
  status: string;
  page: number;
  results: number;
  totalProducts: number;
  data: { products: IProduct[] };
}

export interface IProductPayload {
  name: string;
  description: string;
  price: number;
  categoryId: string; // real MongoDB ObjectId string
  stock: number;
  image?: string;
  gender?: 'men' | 'women' | 'unisex';
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  // Use relative URL so Docker/K8s can route /api to the backend via ingress/proxy
  private baseUrl = '/api/products';

  constructor(private http: HttpClient) {}

  getProducts(filters?: {
    name?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    page?: number;
    limit?: number;
  }): Observable<IProductsResponse> {
    let params = new HttpParams();
    if (filters?.name) params = params.set('name', filters.name);
    if (filters?.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters?.minPrice) params = params.set('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params = params.set('maxPrice', filters.maxPrice.toString());
    if (filters?.inStock) params = params.set('inStock', 'true');
    if (filters?.page) params = params.set('page', filters.page.toString());
    if (filters?.limit) params = params.set('limit', filters.limit.toString());
    return this.http.get<IProductsResponse>(this.baseUrl, { params });
  }

  getProductById(id: string): Observable<{ data: { product: IProduct } }> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  // ── Admin CRUD ─────────────────────────────────────────

  createProduct(payload: IProductPayload): Observable<{ data: { product: IProduct } }> {
    return this.http.post<any>(this.baseUrl, payload);
  }

  updateProduct(
    id: string,
    payload: Partial<IProductPayload>,
  ): Observable<{ data: { updatedProduct: IProduct } }> {
    return this.http.patch<any>(`${this.baseUrl}/${id}`, payload);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }

  // ── Favourites ─────────────────────────────────────────

  toggleFavorite(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/favorites/toggle/${id}`, {});
  }

  getFavourites(): Observable<any> {
    return this.http.get(`${this.baseUrl}/getFavourites`);
  }
}
