import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
	HttpClient,
	HttpErrorResponse,
	HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly BASE = 'http://localhost:3000/api/payment';

  constructor(private http: HttpClient) {}

  /** Reads JWT from localStorage and returns auth headers */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  /**
   * POST /create-customer
   * Body: { name: string, email: string }
   */
  createCustomer(
    name: string,
    email: string,
  ): Observable<{ customerId?: string; id?: string; [key: string]: any }> {
    return this.http
      .post<any>(`${this.BASE}/create-customer`, { name, email }, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  /**
   * POST /add-card
   * Body: { card_token: string }
   */
  addCard(cardToken: string): Observable<any> {
    return this.http
      .post<any>(`${this.BASE}/add-card`, { card_token: cardToken }, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  /**
   * POST /create-charge
   * Body: { amount: number, currency: string, description: string }
   */
  createCharge(amount: number, currency: string, description: string): Observable<any> {
    return this.http
      .post<any>(
        `${this.BASE}/create-charge`,
        { amount, currency, description },
        { headers: this.getHeaders() },
      )
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const msg = error.error?.message || error.error?.error || `Payment failed (${error.status})`;
    return throwError(() => new Error(msg));
  }
}
