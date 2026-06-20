import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface ICreateOrderPayload {
  street: string;
  city: string;
  governorate: string;
  paymentMethod: 'cash' | 'card';
  coupon?: string;
}

export interface IBackendOrder {
  _id: string;
  user_id: string;
  products: {
    product: { _id: string; name: string; imageCover?: string; image?: string };
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  subtotalAmount?: number; // present if promo was applied
  discount?: number; // present if promo was applied
  promoCode?: string; // present if promo was applied
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cash' | 'card';
  shippingAddress: { governorate: string; city: string; street: string };
  guestInfo?: { name?: string; email?: string; phone?: string };
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly base = 'http://localhost:3000/api/order';

  constructor(private http: HttpClient) {}

  createOrder(payload: ICreateOrderPayload): Observable<{ message: string; order: IBackendOrder }> {
    console.log(payload)
    return this.http.post<{ message: string; order: IBackendOrder }>(this.base, payload);
  }

  getMyOrders(): Observable<{ success: boolean; count: number; orders: IBackendOrder[] }> {
    return this.http.get<{ success: boolean; count: number; orders: IBackendOrder[] }>(this.base);
  }
}
