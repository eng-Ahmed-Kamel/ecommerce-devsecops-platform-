import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface IPromo {
  _id: string;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  isActive: boolean;
  maxUses: number;
  usedCount: number;
  expiresAt?: string;
}

export interface IPromoApplyResponse {
  success: boolean;
  data: {
    discountType: 'percent' | 'fixed';
    discountValue: number;
  };
}

@Injectable({ providedIn: 'root' })
export class PromoService {
  private readonly base = 'http://localhost:3000/api/promo';

  constructor(private http: HttpClient) {}

  // POST /api/promo/apply — user only (requires auth)
  applyPromo(code: string): Observable<IPromoApplyResponse> {
    return this.http.post<IPromoApplyResponse>(`${this.base}/apply`, { code });
  }

  // POST /api/promo — admin: create promo
  createPromo(payload: Partial<IPromo>): Observable<{ success: boolean; data: { promo: IPromo } }> {
    return this.http.post<any>(`${this.base}`, payload);
  }

  // GET /api/promo — admin: get all promos
  getAllPromos(): Observable<{ success: boolean; count: number; data: { promos: IPromo[] } }> {
    return this.http.get<any>(`${this.base}`);
  }

  // GET /api/promo/:id — admin: get promo by id
  getPromoById(id: string): Observable<{ success: boolean; data: { promo: IPromo } }> {
    return this.http.get<any>(`${this.base}/${id}`);
  }

  // PATCH /api/promo/:id — admin: update promo
  updatePromo(
    id: string,
    payload: Partial<IPromo>,
  ): Observable<{ success: boolean; data: { promo: IPromo } }> {
    return this.http.patch<any>(`${this.base}/${id}`, payload);
  }

  // DELETE /api/promo/:id — admin: delete promo
  deletePromo(id: string): Observable<{ success: boolean; data: { message: string } }> {
    return this.http.delete<any>(`${this.base}/${id}`);
  }
}
