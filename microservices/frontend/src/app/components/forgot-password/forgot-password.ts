import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
<div class="auth-page">
  <div class="auth-card">
    <a class="auth-brand" routerLink="/Master">Roselle</a>
    <div class="icon"><i class="bi bi-key-fill"></i></div>
    <h1 class="auth-title">Reset Password</h1>
    <p class="auth-sub">Enter your email and we'll send you a reset code.</p>

    <div class="auth-success" *ngIf="sent">
      <i class="bi bi-check-circle-fill"></i>
      Reset code sent! Check your inbox.
      <br><a routerLink="/verify-otp" class="go-link">Enter the code →</a>
    </div>
    <div class="auth-error" *ngIf="errorMessage">
      <i class="bi bi-exclamation-circle"></i> {{ errorMessage }}
    </div>

    <div *ngIf="!sent">
      <div class="field-group">
        <label>Email Address</label>
        <div class="input-wrap">
          <i class="bi bi-envelope"></i>
          <input type="email" [(ngModel)]="email" placeholder="your@email.com" />
        </div>
      </div>
      <button class="btn-submit" (click)="onSubmit()" [disabled]="isLoading">
        <span *ngIf="!isLoading">Send Reset Code</span>
        <span *ngIf="isLoading" class="spinner"></span>
      </button>
    </div>

    <p class="auth-switch">
      <a routerLink="/login"><i class="bi bi-arrow-left me-1"></i>Back to Sign In</a>
    </p>
  </div>
</div>`,
  styles: [`
:root { --bg:#f7f0e9; --ink:#2c2420; --muted:#7a6e68; --warm:#b8965a; }
.auth-page { min-height:100vh; background:var(--bg); display:flex; align-items:center; justify-content:center; padding:40px 16px; }
.auth-card { background:#fff; border-radius:16px; padding:48px 40px; width:100%; max-width:420px; box-shadow:0 8px 48px rgba(44,36,32,0.10); text-align:center; }
.auth-brand { font-family:'Pinyon Script','Dancing Script',cursive; font-size:42px; color:#2c2420; text-decoration:none; display:block; line-height:1; }
.icon { font-size:44px; color:#b8965a; margin:20px 0 10px; }
.auth-title { font-size:24px; font-weight:700; color:#2c2420; margin:0 0 8px; font-family:'Cormorant Garamond',Georgia,serif; }
.auth-sub { font-size:14px; color:#7a6e68; margin:0 0 24px; }
.auth-error { background:#fef2f2; border:1px solid #fecaca; color:#dc2626; border-radius:8px; padding:10px 14px; font-size:13px; text-align:left; margin-bottom:16px; }
.auth-success { background:#f0fdf4; border:1px solid #bbf7d0; color:#166534; border-radius:8px; padding:14px; font-size:14px; margin-bottom:16px; line-height:1.8; }
.go-link { color:#b8965a; font-weight:600; text-decoration:none; }
.field-group { margin-bottom:16px; text-align:left; }
.field-group label { display:block; font-size:13px; font-weight:600; color:#2c2420; margin-bottom:6px; }
.input-wrap { position:relative; display:flex; align-items:center; }
.input-wrap > i { position:absolute; left:14px; color:#7a6e68; font-size:15px; pointer-events:none; }
.input-wrap input { width:100%; padding:12px 14px 12px 40px; border:1.5px solid #e2d9d2; border-radius:10px; font-size:15px; color:#2c2420; background:#faf7f4; outline:none; }
.input-wrap input:focus { border-color:#b8965a; }
.btn-submit { width:100%; background:#2c2420; color:#fff; border:none; border-radius:10px; padding:14px; font-size:15px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; min-height:50px; transition:background 0.2s; }
.btn-submit:hover:not(:disabled) { background:#3d3330; }
.btn-submit:disabled { opacity:0.6; cursor:not-allowed; }
.spinner { width:20px;height:20px;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block; }
@keyframes spin { to { transform:rotate(360deg); } }
.auth-switch { margin-top:24px; font-size:14px; }
.auth-switch a { color:#b8965a; text-decoration:none; font-weight:500; }
  `]
})
export class ForgotPassword {
  email        = '';
  isLoading    = false;
  errorMessage = '';
  sent         = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    console.log('[ForgotPassword] onSubmit →', { email: this.email });

    if (!this.email) {
      this.errorMessage = 'Please enter your email.';
      return;
    }

    this.isLoading    = true;
    this.errorMessage = '';

    this.auth.setPendingEmail(this.email);

   
    this.auth.resendotp().subscribe({
      next: (res: any) => {
        console.log('[ForgotPassword] resendotp response:', res);
        this.isLoading = false;

        if (res.status === 'success') {
          this.router.navigateByUrl('/Resetpassword')
        } else {
          console.warn('[ForgotPassword] ⚠️ non-success:', res);
          this.errorMessage = res.message || 'Could not send reset code';
        }
      },
      error: (err) => {
        console.error('[ForgotPassword] ❌ error:', err);
        this.isLoading    = false;
        this.errorMessage = err.error?.message || 'No account found with this email.';
      },
    });
  }
}