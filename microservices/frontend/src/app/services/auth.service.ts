import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
export const BaseUrl: string = 'http://localhost:3000';


export interface IUser {
  id: number;
  _id?: string; // MongoDB id from API
  name: string;
  email: string;
  phone?: string;
  Address?: string;
  paymentDetails?: { cardHolder?: string; cardNumber?: string; expiry?: string };
  role: 'user' | 'admin';
  verified: boolean;
  status: 'active' | 'restricted';
}

export interface IOrder {
  subtotal: number;
  shipping: number;
  discount: number;
  promoCode?: string;
  customerName?: string;
  email?: string;
  id: string;
  date: string;
  items: any[];
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered';
  paymentMethod: string;
  address: string;
  userId: string; // changed to string to support MongoDB _id
}

export interface IPromoCode {
  id: number;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  active: boolean;
  usageCount: number;
}

export interface IBanner {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  public _currentUser = signal<IUser | null>(null);
  private _pendingEmail = signal<string>('');
  private _pendingOtp = signal<string>('');

  // keyed by string so both numeric id and MongoDB _id work
  private _userOrders = signal<{ [userId: string]: IOrder[] }>({});
  private _userWishlists = signal<{ [userId: string]: string[] }>({});

  private _promoCodes = signal<IPromoCode[]>([
    {
      id: 1,
      code: 'ROSELLE10',
      discountType: 'percent',
      discountValue: 10,
      active: true,
      usageCount: 0,
    },
    {
      id: 2,
      code: 'SAVE200',
      discountType: 'fixed',
      discountValue: 200,
      active: true,
      usageCount: 0,
    },
    {
      id: 3,
      code: 'VIP20',
      discountType: 'percent',
      discountValue: 20,
      active: false,
      usageCount: 5,
    },
  ]);

  private _banners = signal<IBanner[]>([
    {
      id: 1,
      imageUrl: 'assets/images/slider11.jpg',
      title: 'New Arrivals',
      subtitle: 'Discover the latest luxury pieces',
      active: true,
    },
    {
      id: 2,
      imageUrl: 'assets/images/slider22.jpg',
      title: 'Exclusive Collection',
      subtitle: 'Timeless elegance awaits',
      active: true,
    },
    {
      id: 3,
      imageUrl: 'assets/images/slider33.jpg',
      title: 'Winter Edit',
      subtitle: 'Wrap yourself in luxury',
      active: true,
    },
  ]);

  private _featuredProductIds = signal<string[]>([]);

  private users: IUser[] = [
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@roselle.com',
      role: 'admin',
      verified: true,
      status: 'active',
    },
    {
      id: 2,
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'user',
      verified: true,
      status: 'active',
      phone: '01000000000',
      Address: 'Cairo, Egypt',
    },
    {
      id: 3,
      name: 'Marina',
      email: 'marina@example.com',
      role: 'user',
      verified: true,
      status: 'active',
    },
  ];

  currentUser = this._currentUser.asReadonly();
  promoCodes = this._promoCodes.asReadonly();
  banners = this._banners.asReadonly();
  featuredProductIds = this._featuredProductIds.asReadonly();
  

  constructor(
    private router: Router,
    private http: HttpClient,
  ) {}

  // ── Helpers ────────────────────────────────────────
  // Returns a consistent string key for the current user
  // Works whether the user came from API (_id) or local array (id)
  private get userKey(): string {
    const u = this._currentUser();
    if (!u) return '';
    return u._id ?? String(u.id);
  }

  // ── Auth ───────────────────────────────────────────
  setPendingEmail(email: string): void {
    this._pendingEmail.set(email);
    sessionStorage.setItem('pendingEmail', email);
  }

  pendingEmail(): string {
    return this._pendingEmail();
  }

  setCurrentUser(user: any): void {
    this._currentUser.set(user);
  }

  register(data: { email: string; phone: string; name: string; password: string }) {
    return this.http.post(`${BaseUrl}/api/user/signup`, data);
  }

  signup_google(idToken: any) {
  return this.http.post(
    `${BaseUrl}/api/user/signup_bygoogle`, 
    { idToken },
    { withCredentials: true } 
  );
}

  verifyOtp(otp: string) {
    const email = this._pendingEmail();
    if (!email) throw new Error('No pending email found');
    return this.http.post(`${BaseUrl}/api/user/verify_account`, { otp, email });
  }

  resendotp() {
    const e = this._pendingEmail();
    if (!e) throw new Error('No pending email found');
    return this.http.post(`http://localhost:3000/api/user/resend_otp`, { email: e });
  }


    logout() {
  return this.http.get(`http://localhost:3000/api/user/logout`, { withCredentials: true });
}
  

  login(email: string, password: string) {
    return this.http.post(`${BaseUrl}/api/user/login`, { email, password });
  }

   forget_pass(otp:string,new_password:string,email:string){
    return this.http.post(`http://localhost:3000/api/user/forget_password`, { email,otp,new_password });
   }
  sendPasswordReset(email: string): boolean {
    const user = this.users.find((u) => u.email === email);
    if (!user) return false;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this._pendingOtp.set(otp);
    this._pendingEmail.set(email);
    console.log(`Password reset OTP for ${email}: ${otp}`);
    return true;
  }

  getMe() {
    return this.http.get<any>(`${BaseUrl}/api/user/myprofile`);
  }

  initAuth() {
    this.getMe().subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this._currentUser.set(res.user);
        }
      },
      error: () => {
        this._currentUser.set(null);
      },
    });
  }

  isLoggedIn(): boolean {
    return this._currentUser() !== null;
  }
  isAdmin(): boolean {
    return this._currentUser()?.role === 'admin';
  }

  // ── Profile ────────────────────────────────────────
  // Works for both API users and local users
 
 

  toggleWishlist(productId: string): void {
    const key = this.userKey;
    if (!key) return;
    this._userWishlists.update((map) => {
      const current = map[key] ?? [];
      return {
        ...map,
        [key]: current.includes(productId)
          ? current.filter((id) => id !== productId)
          : [...current, productId],
      };
    });
  }

isInWishlist(productId: string): boolean {
  const key = this.userKey;
  if (!key) return false;
  return (this._userWishlists()[key] ?? []).includes(productId);
}

get wishlist(): string[] {
  const key = this.userKey;
  if (!key) return [];
  return this._userWishlists()[key] ?? [];
}

get wishlistCount(): number {
  return this.wishlist.length;
}

orders(): Observable<IOrder[]> {
  return this.http.get<IOrder[]>(`${BaseUrl}/api/order/`);
}

updateProfile(data: {
  name?: string;
  phone?: string;
  Address?: string;  
  paymentDetails?: IUser['paymentDetails'];
}): Observable<any> {
  return this.http.patch(`${BaseUrl}/api/user/update_user`, data);
}

delete(): Observable<any> {
  return this.http.delete(`${BaseUrl}/api/user/delete_user`);
}


  get allOrders(): IOrder[] {
    return Object.values(this._userOrders()).flat();
  }

  placeOrder(order: Omit<IOrder, 'id' | 'date' | 'status' | 'userId'>): IOrder {
    const key = this.userKey || 'guest';
    const newOrder: IOrder = {
      ...order,
      id: 'ORD-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      date: new Date().toLocaleDateString('en-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      status: 'confirmed',
      userId: key,
    };
    this._userOrders.update((map) => {
      const current = map[key] ?? [];
      return { ...map, [key]: [newOrder, ...current] };
    });
    return newOrder;
  }

  // ── Users (admin) ──────────────────────────────────
  getAllUsers(): IUser[] {
    return [...this.users];
  }

  toggleUserStatus(userId: number): void {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return;
    user.status = user.status === 'active' ? 'restricted' : 'active';
  }

  // ── Promo codes ────────────────────────────────────
  addPromoCode(promo: Omit<IPromoCode, 'id' | 'usageCount'>): void {
    this._promoCodes.update((list) => [...list, { ...promo, id: Date.now(), usageCount: 0 }]);
  }

  updatePromoCode(id: number, data: Partial<IPromoCode>): void {
    this._promoCodes.update((list) => list.map((p) => (p.id === id ? { ...p, ...data } : p)));
  }

  deletePromoCode(id: number): void {
    this._promoCodes.update((list) => list.filter((p) => p.id !== id));
  }

  validatePromoCode(code: string): IPromoCode | null {
    return (
      this._promoCodes().find((p) => p.code.toUpperCase() === code.toUpperCase() && p.active) ??
      null
    );
  }

  usePromoCode(code: string): void {
    this._promoCodes.update((list) =>
      list.map((p) =>
        p.code.toUpperCase() === code.toUpperCase() ? { ...p, usageCount: p.usageCount + 1 } : p,
      ),
    );
  }

  // ── Banners ────────────────────────────────────────
  addBanner(b: Omit<IBanner, 'id'>): void {
    this._banners.update((list) => [...list, { ...b, id: Date.now() }]);
  }

  updateBanner(id: number, data: Partial<IBanner>): void {
    this._banners.update((list) => list.map((b) => (b.id === id ? { ...b, ...data } : b)));
  }

  deleteBanner(id: number): void {
    this._banners.update((list) => list.filter((b) => b.id !== id));
  }

  get activeBanners(): IBanner[] {
    return this._banners().filter((b) => b.active);
  }

  // ── Featured products ──────────────────────────────
  setFeaturedProducts(ids: string[]): void {
    this._featuredProductIds.set(ids);
  }

  toggleFeaturedProduct(id: string): void {
    this._featuredProductIds.update((list) =>
      list.includes(id) ? list.filter((x) => x !== id) : [...list, id],
    );
  }
}
