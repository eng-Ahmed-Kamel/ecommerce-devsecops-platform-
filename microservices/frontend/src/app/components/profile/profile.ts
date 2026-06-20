import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http'; // <-- Added to make the API call
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService, IUser } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  activeTab: 'personal' | 'address' | 'payment' = 'personal';
  user: IUser | null = null;
  successMsg = '';
  errorMsg = '';
  isLoading = false;
  showDeleteConfirm = false;

  // Personal
  name = '';
  phone = '';

  // Address
  address = '';

  // Payment
  cardHolder = '';
  cardNumber = '';
  expiry = '';

  orderCount = 0;
  wishlistCount = 0; // Changed back to a normal property

  constructor(
    private auth: AuthService,
    private router: Router,
    private http: HttpClient, // <-- Injected HttpClient
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadUser();
    this.loadCounts();
  }

  loadUser(): void {
    this.user = this.auth.currentUser();
    if (!this.user) return;
    this.name = this.user.name;
    this.phone = this.user.phone ?? '';
    this.address = this.user.Address ?? '';
    this.cardHolder = this.user.paymentDetails?.cardHolder ?? '';
    this.cardNumber = this.user.paymentDetails?.cardNumber ?? '';
    this.expiry = this.user.paymentDetails?.expiry ?? '';
  }

  loadCounts(): void {
    // 1. Load Orders Counter
    this.auth.orders().subscribe({
      next: (res: any) => {
        if (!this.user) {
          this.orderCount = 0;
          return;
        }

        const allOrders = res.orders || [];
        const myUserId = this.user.id || (this.user as any)._id;
        const myOrders = allOrders.filter((order: any) => order.user_id === myUserId);
        this.orderCount = myOrders.length;
      },
      error: () => {
        this.orderCount = 0;
      },
    });

    // 2. Load Wishlist (Favorites) Counter directly from your API
    this.http.get('http://localhost:3000/api/products/getFavourites').subscribe({
      next: (res: any) => {
        // Grab the count straight from the "results" property in your JSON,
        // or fallback to the length of the "data" array just in case
        this.wishlistCount = res.results || res.data?.length || 0;
      },
      error: () => {
        this.wishlistCount = 0;
      },
    });
  }

  savePersonal(): void {
    this.isLoading = true;
    this.auth.updateProfile({ name: this.name, phone: this.phone }).subscribe({
      next: () => {
        this.loadUser();
        this.showSuccess('Personal info saved!');
        this.isLoading = false;
      },
      error: () => {
        this.errorMsg = 'Failed to save. Please try again.';
        this.isLoading = false;
        setTimeout(() => (this.errorMsg = ''), 3000);
      },
    });
  }

  saveAddress(): void {
    this.isLoading = true;
    this.auth.updateProfile({ Address: this.address }).subscribe({
      next: (res) => {
        this.loadUser();
        this.showSuccess('Address saved!');
        this.isLoading = false;
      },
      error: () => {
        this.errorMsg = 'Failed to save. Please try again.';
        this.isLoading = false;
        setTimeout(() => (this.errorMsg = ''), 3000);
      },
    });
  }

  savePayment(): void {
    this.isLoading = true;
    this.auth
      .updateProfile({
        paymentDetails: {
          cardHolder: this.cardHolder,
          cardNumber: this.cardNumber,
          expiry: this.expiry,
        },
      })
      .subscribe({
        next: () => {
          this.showSuccess('Payment details saved!');
          this.isLoading = false;
        },
        error: () => {
          this.errorMsg = 'Failed to save. Please try again.';
          this.isLoading = false;
          setTimeout(() => (this.errorMsg = ''), 3000);
        },
      });
  }

  confirmDelete(): void {
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
  }

  deleteAccount(): void {
    this.auth.delete().subscribe({
      next: () => {
        this.auth.logout();
        this.router.navigate(['/']);
      },
      error: () => {
        this.errorMsg = 'Failed to delete account. Please try again.';
        this.showDeleteConfirm = false;
        setTimeout(() => (this.errorMsg = ''), 3000);
      },
    });
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg;
    setTimeout(() => (this.successMsg = ''), 3000);
  }

  get maskedCard(): string {
    const n = this.cardNumber.replace(/\s/g, '');
    if (n.length < 4) return this.cardNumber;
    return '**** **** **** ' + n.slice(-4);
  }
}
