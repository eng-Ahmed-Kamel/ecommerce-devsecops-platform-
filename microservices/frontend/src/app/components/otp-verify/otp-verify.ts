import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-otp-verify',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './otp-verify.html',
  styleUrl: './otp-verify.css',
})
export class OtpVerify implements OnInit, OnDestroy {
  digits          = ['', '', '', '', '', ''];
  isLoading       = false;
  errorMessage    = '';
  resendCountdown = 30;
  canResend       = false;
  private timer: any;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Guard: no email → back to signup
    if (!this.auth.pendingEmail()) {
      console.warn('[OtpVerify] ⚠️ no pendingEmail found → redirecting to /signup');
      this.router.navigateByUrl('/signup');
      return;
    }
    console.log('[OtpVerify] init | pendingEmail:', this.auth.pendingEmail());
    this.startTimer();
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  get email(): string { return this.auth.pendingEmail(); }

  startTimer(): void {
    this.resendCountdown = 30;
    this.canResend       = false;
    this.timer = setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0) {
        clearInterval(this.timer);
        this.canResend = true;
        console.log('[OtpVerify] resend unlocked');
      }
    }, 1000);
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
    console.log('[OtpVerify] pasted OTP:', nums);
    nums.split('').forEach((c, i) => { if (i < 6) this.digits[i] = c; });
  }

  get otpValue(): string { return this.digits.join(''); }

  // ── Verify ─────────────────────────────────────────────────
  verify(): void {
    if (this.otpValue.length < 6) {
      this.errorMessage = 'Please enter all 6 digits.';
      return;
    }

    console.log('[OtpVerify] verify() → otp:', this.otpValue, '| email:', this.email);
    this.isLoading    = true;
    this.errorMessage = '';

    this.auth.verifyOtp(this.otpValue).subscribe({
      next: (res: any) => {
        console.log('[OtpVerify] verifyOtp response:', res);
        this.isLoading = false;

        if (res.status === 'success') {
          console.log('[OtpVerify] ✅ verified → /login');
          this.router.navigate(['/login']);
        } else {
          console.warn('[OtpVerify] ⚠️ verify failed:', res);
          this.errorMessage = res.message || 'Invalid code. Please try again.';
          this.digits       = ['', '', '', '', '', ''];
        }
      },
      error: (err) => {
        console.error('[OtpVerify] ❌ verify error — status:', err.status);
        console.error('[OtpVerify] ❌ verify error — body:', err.error);
        this.isLoading    = false;
        this.errorMessage = err.error?.message || 'Something went wrong';
        this.digits       = ['', '', '', '', '', ''];
      },
    });
  }

  // ── Resend ─────────────────────────────────────────────────
  resend(): void {
    if (!this.canResend) return;

    // 🔍 Log exactly what will be sent so we can catch the 400
    console.log('[OtpVerify] resend() called');
    console.log('[OtpVerify] pendingEmail at resend time:', this.auth.pendingEmail());

    if (!this.auth.pendingEmail()) {
      this.errorMessage = 'Session expired. Please go back and enter your email again.';
      return;
    }

    this.isLoading    = true;
    this.errorMessage = '';

    this.auth.resendotp().subscribe({
      next: (res: any) => {
        console.log('[OtpVerify] resend response:', res);
        this.isLoading = false;

        if (res.status === 'success') {
          console.log('[OtpVerify] ✅ OTP resent → restarting timer');
          this.startTimer();
        } else {
          console.warn('[OtpVerify]  resend non-success:', res);
          this.errorMessage = res.message || 'Something went wrong';
        }
      },
      error: (err) => {
        console.error('[OtpVerify]  resend 400 — status  :', err.status);
        console.error('[OtpVerify]  resend 400 — message :', err.error?.message);
        console.error('[OtpVerify]  resend 400 — full body:', err.error);
        this.isLoading    = false;
        this.errorMessage = err.error?.message || 'Failed to resend code';
      },
    });
  }
}