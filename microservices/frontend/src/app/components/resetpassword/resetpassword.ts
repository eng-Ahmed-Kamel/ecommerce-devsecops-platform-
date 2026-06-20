import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-resetpassword',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
<div class="auth-page">
  <div class="auth-card">

    <a class="auth-brand" routerLink="/Master">Roselle</a>
    <p class="auth-tagline">Luxury curated for you</p>

    <div class="email-icon">
      <i class="bi bi-shield-lock-fill"></i>
    </div>

    <h1 class="auth-title">Reset Password</h1>
    <p class="auth-sub">
      Enter the code sent to<br>
      <strong>{{ email }}</strong>
    </p>

    <div class="auth-error" *ngIf="errorMessage">
      <i class="bi bi-exclamation-circle"></i> {{ errorMessage }}
    </div>

    <div class="auth-success" *ngIf="successMessage">
      <i class="bi bi-check-circle"></i> {{ successMessage }}
    </div>

    <!-- OTP inputs -->
    <div class="otp-inputs" (paste)="onPaste($event)">
      <input
        *ngFor="let d of digits; let i = index"
        [id]="'otp-' + i"
        type="text"
        inputmode="numeric"
        maxlength="1"
        class="otp-box"
        [value]="digits[i]"
        (input)="onInput($event, i)"
        (keydown)="onKeydown($event, i)"
        [class.filled]="digits[i]"
      />
    </div>

    <!-- New password field -->
    <div class="field-group">
      <label>New Password</label>
      <div class="input-wrap">
        <i class="bi bi-lock"></i>
        <input
          [type]="showPassword ? 'text' : 'password'"
          [(ngModel)]="newPassword"
          placeholder="Min. 6 characters"
          autocomplete="new-password"
        />
        <button class="toggle-pass" (click)="showPassword = !showPassword" type="button">
          <i [class]="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
        </button>
      </div>

      <!-- Strength bar -->
      <div class="strength-bar" *ngIf="newPassword.length > 0">
        <div
          class="strength-fill"
          [class.weak]="newPassword.length < 6"
          [class.medium]="newPassword.length >= 6 && newPassword.length < 10"
          [class.strong]="newPassword.length >= 10"
          [style.width]="newPassword.length >= 10 ? '100%' : newPassword.length >= 6 ? '60%' : '30%'"
        ></div>
        <span class="strength-label">
          {{ newPassword.length < 6 ? 'Weak' : newPassword.length < 10 ? 'Medium' : 'Strong' }}
        </span>
      </div>
    </div>

    <button
      class="btn-submit"
      (click)="onSubmit()"
      [disabled]="isLoading || otpValue.length < 6 || newPassword.length < 6"
    >
      <span *ngIf="!isLoading">Reset Password</span>
      <span *ngIf="isLoading" class="spinner"></span>
    </button>

    <p class="auth-switch">
      <a routerLink="/login"><i class="bi bi-arrow-left me-1"></i>Back to Sign In</a>
    </p>

  </div>
</div>
  `,
  styles: [`
    /* ── Page & Card ─────────────────────────────────────────── */
    .auth-page {
      min-height: 100vh;
      background: #f7f0e9;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 16px;
    }
    .auth-card {
      background: #fff;
      border-radius: 16px;
      padding: 48px 40px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 8px 48px rgba(44,36,32,0.10);
      text-align: center;
    }

    /* ── Brand ───────────────────────────────────────────────── */
    .auth-brand {
      font-family: 'Pinyon Script', 'Dancing Script', cursive;
      font-size: 42px;
      color: #2c2420;
      text-decoration: none;
      display: block;
      line-height: 1;
    }
    .auth-tagline {
      font-size: 13px;
      color: #7a6e68;
      margin: 4px 0 20px;
      letter-spacing: 0.04em;
    }

    /* ── Icon ────────────────────────────────────────────────── */
    .email-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #c9a96e18, #c9a96e33);
      border: 1.5px solid #c9a96e44;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
      font-size: 1.75rem;
      color: #c9a96e;
      animation: iconPop .5s cubic-bezier(.34,1.56,.64,1) both;
    }
    @keyframes iconPop {
      from { transform: scale(0.5); opacity: 0; }
      to   { transform: scale(1);   opacity: 1; }
    }

    /* ── Title & sub ─────────────────────────────────────────── */
    .auth-title {
      font-size: 24px;
      font-weight: 700;
      color: #2c2420;
      margin: 0 0 8px;
      font-family: 'Cormorant Garamond', Georgia, serif;
    }
    .auth-sub {
      font-size: 14px;
      color: #7a6e68;
      margin: 0 0 24px;
      line-height: 1.6;
    }
    .auth-sub strong { color: #c9a96e; font-weight: 600; }

    /* ── Error / Success banners ─────────────────────────────── */
    .auth-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 13px;
      text-align: left;
      margin-bottom: 16px;
    }
    .auth-success {
      display: flex;
      align-items: center;
      gap: .5rem;
      background: #c9a96e14;
      border: 1px solid #c9a96e44;
      color: #c9a96e;
      border-radius: 10px;
      padding: .75rem 1rem;
      font-size: .875rem;
      margin-bottom: 1.25rem;
    }

    /* ── OTP boxes (exact from otp-verify) ───────────────────── */
    .otp-inputs {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-bottom: 24px;
    }
    .otp-box {
      width: 48px;
      height: 56px;
      text-align: center;
      font-size: 22px;
      font-weight: 700;
      color: #2c2420;
      border: 1.5px solid #e2d9d2;
      border-radius: 10px;
      background: #faf7f4;
      outline: none;
      transition: border-color .2s, box-shadow .2s;
      caret-color: #b8965a;
    }
    .otp-box:focus {
      border-color: #b8965a;
      box-shadow: 0 0 0 3px #b8965a22;
    }
    .otp-box.filled {
      border-color: #b8965a;
      background: #b8965a0d;
    }

    /* ── Password field ──────────────────────────────────────── */
    .field-group {
      margin-bottom: 16px;
      text-align: left;
    }
    .field-group label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #2c2420;
      margin-bottom: 6px;
    }
    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-wrap > i {
      position: absolute;
      left: 14px;
      color: #7a6e68;
      font-size: 15px;
      pointer-events: none;
    }
    .input-wrap input {
      width: 100%;
      padding: 12px 44px 12px 40px;
      border: 1.5px solid #e2d9d2;
      border-radius: 10px;
      font-size: 15px;
      color: #2c2420;
      background: #faf7f4;
      outline: none;
      transition: border-color .2s;
    }
    .input-wrap input:focus { border-color: #b8965a; }
    .toggle-pass {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      color: #7a6e68;
      cursor: pointer;
      padding: 4px;
      font-size: 15px;
    }

    /* ── Strength bar ────────────────────────────────────────── */
    .strength-bar {
      display: flex;
      align-items: center;
      gap: .625rem;
      margin-top: .5rem;
    }
    .strength-fill {
      height: 4px;
      border-radius: 99px;
      transition: width .35s ease, background .35s ease;
    }
    .strength-fill.weak   { background: #e05c5c; }
    .strength-fill.medium { background: #f0a500; }
    .strength-fill.strong { background: #4caf7d; }
    .strength-label {
      font-size: .72rem;
      font-weight: 600;
      color: #888;
      white-space: nowrap;
    }

    /* ── Submit button ───────────────────────────────────────── */
    .btn-submit {
      width: 100%;
      background: #2c2420;
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 14px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 50px;
      transition: background .2s;
      margin-bottom: 20px;
    }
    .btn-submit:hover:not(:disabled) { background: #3d3330; }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

    /* ── Spinner ─────────────────────────────────────────────── */
    .spinner {
      width: 20px; height: 20px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin .7s linear infinite;
      display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Bottom link ─────────────────────────────────────────── */
    .auth-switch { margin-top: 8px; font-size: 14px; }
    .auth-switch a { color: #b8965a; text-decoration: none; font-weight: 500; }
  `]
})
export class Resetpassword implements OnInit {
  digits       = ['', '', '', '', '', ''];
  newPassword  = '';
  showPassword = false;
  isLoading    = false;
  errorMessage = '';
  successMessage = '';
  email        = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.email = this.auth.pendingEmail();
    if (!this.email) {
      console.warn('[ResetPassword] no pendingEmail → redirecting to /forgot-password');
      this.router.navigateByUrl('/forgot-password');
      return;
    }
    console.log('[ResetPassword] ready | email:', this.email);
  }

  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const val   = input.value.replace(/\D/g, '').slice(-1);
    this.digits[index] = val;
    if (val && index < 5) {
      (document.getElementById(`otp-${index + 1}`) as HTMLInputElement)?.focus();
    }
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.digits[index] && index > 0) {
      (document.getElementById(`otp-${index - 1}`) as HTMLInputElement)?.focus();
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const nums = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    console.log('[ResetPassword] pasted otp:', nums);
    nums.split('').forEach((c, i) => { if (i < 6) this.digits[i] = c; });
  }

  get otpValue(): string { return this.digits.join(''); }

  onSubmit(): void {
    console.log('[ResetPassword] onSubmit →', { email: this.email, otp: this.otpValue });

    if (this.otpValue.length < 6 || this.newPassword.length < 6) return;

    this.isLoading    = true;
    this.errorMessage = '';

    this.auth.forget_pass(this.otpValue, this.newPassword, this.email).subscribe({
      next: (res: any) => {
        console.log('[ResetPassword] response:', res);
        this.isLoading = false;

        if (res.status === 'success') {
          console.log('[ResetPassword] ✅ password reset → navigating to /login');
          this.successMessage = 'Password reset successfully! Redirecting…';
          setTimeout(() => this.router.navigateByUrl('/login'), 2000);
        } else {
          console.warn('[ResetPassword] ⚠️ non-success:', res);
          this.errorMessage = res.message || 'Reset failed. Please try again.';
          this.digits = ['', '', '', '', '', ''];
        }
      },
      error: (err) => {
        console.error('[ResetPassword] ❌ error:', err);
        this.isLoading    = false;
        this.errorMessage = err.error?.message || 'Something went wrong';
        this.digits = ['', '', '', '', '', ''];
      },
    });
  }
}