import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

declare const google: any; // Google Identity Services

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  name            = '';
  email           = '';
  phone           = '';
  password        = '';
  confirmPassword = '';
  showPassword    = false;
  isLoading       = false;
  errorMessage    = '';

  constructor(private auth: AuthService, private router: Router) {}

  // ── Regular signup ─────────────────────────────────────────
  onSubmit(): void {
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    this.isLoading    = true;
    this.errorMessage = '';

    this.auth.register({
      name: this.name, email: this.email,
      password: this.password, phone: this.phone,
    }).subscribe({
      next: (res: any) => {
        console.log('[Signup] register response:', res);
        this.isLoading = false;
        if (res.status === 'success') {
          this.auth.setPendingEmail(this.email);
          console.log('[Signup] ✅ registered → /verify-otp');
          this.router.navigateByUrl('/verify-otp');
        } else {
          this.errorMessage = res.message || 'Registration failed';
        }
      },
      error: (err) => {
        console.error('[Signup] ❌ error:', err);
        this.isLoading    = false;
        this.errorMessage = err.error?.message || 'Something went wrong';
      },
    });
  }

  // ── Google signup ──────────────────────────────────────────
  private loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (typeof google !== 'undefined') {
      resolve();
      return;
    }

    // Check if script tag already exists (avoid duplicates)
    if (document.getElementById('google-gsi-script')) {
      // Script tag exists but not yet loaded — wait for it
      const existing = document.getElementById('google-gsi-script') as HTMLScriptElement;
      existing.onload = () => resolve();
      existing.onerror = () => reject(new Error('Google script failed to load'));
      return;
    }

    // Inject the script dynamically
    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google script failed to load'));
    document.head.appendChild(script);
  });
}

signInWithGoogle(): void {
  console.log('[Signup] Google sign-up initiated');
  this.errorMessage = '';

  this.loadGoogleScript()
    .then(() => {
      google.accounts.id.initialize({
        client_id: '865370854342-5ud0m2a1id89m4u7ml9cu5uteuf1k5u1.apps.googleusercontent.com',
        callback: (googleRes: any) => {
          console.log('[Signup] Google credential received');
          this.isLoading = true;

          this.auth.signup_google(googleRes.credential).subscribe({
            next: (res: any) => {
              console.log('[Signup] signup_google response:', res);
              this.isLoading = false;
              if (res.status === 'success') {
                this.auth.setCurrentUser(res.user);
                console.log('[Signup] ✅ Google signup success → /');
                this.router.navigateByUrl('/');
              } else {
                this.errorMessage = res.message || 'Google sign-up failed';
              }
            },
            error: (err: any) => {
              console.error('[Signup] ❌ signup_google error:', err);
              this.isLoading = false;
              this.errorMessage = err.error?.message || 'Google sign-up failed';
            },
          });
        },
      });

      google.accounts.id.prompt();
    })
    .catch((err) => {
      console.error('[Signup] ❌ Failed to load Google script:', err);
      this.errorMessage = 'Failed to load Google sign-in. Please try again.';
    });
}
}