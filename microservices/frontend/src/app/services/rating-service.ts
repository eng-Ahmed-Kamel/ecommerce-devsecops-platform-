import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface IRatingPayload {
  rating: number;
  comment: string;
}

export interface IReview {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userId: { _id: string; name: string };
}

@Injectable({ providedIn: 'root' })
export class RatingService {
  private readonly base = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient) {}

  // POST /api/products/:productId/ratings
  submitRating(productId: string, payload: IRatingPayload): Observable<any> {
    return this.http.post(`${this.base}/${productId}/ratings`, payload);
  }

  // GET /api/products/:productId/ratings
  getProductRatings(productId: string): Observable<{
    status: string;
    data: { product: { _id: string; name: string; ratings: IReview[] } };
  }> {
    return this.http.get<any>(`${this.base}/${productId}/ratings`);
  }

  // PATCH /api/products/ratings/:ratingId
  updateRating(ratingId: string, payload: IRatingPayload): Observable<any> {
    return this.http.patch(`${this.base}/ratings/${ratingId}`, payload);
  }

  // DELETE /api/products/ratings/:ratingId
  deleteRating(ratingId: string): Observable<any> {
    return this.http.delete(`${this.base}/ratings/${ratingId}`);
  }
}
