import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  email = '';
  password = '';
  showPassword = false;
  isAdmin = false;
  isLoading = false;
  errorMessage = '';
  private returnUrl = '/Master';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/Master';

    // ✅ Initialize Google Sign-In once
    this.loadGoogleScript().then(() => {
      google.accounts.id.initialize({
        client_id: '865370854342-5ud0m2a1id89m4u7ml9cu5uteuf1k5u1.apps.googleusercontent.com',
        callback: (googleRes: any) => this.handleGoogleCallback(googleRes),
      });
    });
  }

  toggleRole(): void {
    this.isAdmin = !this.isAdmin;
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.auth.login(this.email, this.password).subscribe({
      next: (res: any) => {
        this.auth.setCurrentUser(res.user);
        this.isLoading = false;
        if (res.status == 'success') {
          this.router.navigateByUrl('/');
        } else {
          this.errorMessage = res.message || 'Login failed';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Login failed';
      },
    });
  }

  signInWithGoogle(): void {
    console.log('[Login] Google sign-in initiated');
    this.errorMessage = '';
    google.accounts.id.prompt();
  }

  private handleGoogleCallback(googleRes: any): void {
    console.log('[Login] Google credential received');
    this.isLoading = true;

    this.auth.signup_google(googleRes.credential).subscribe({
      next: (res: any) => {
        console.log('[Login] signup_google response:', res);
        this.isLoading = false;
        if (res.status === 'success') {
          this.auth.setCurrentUser(res.user);
          console.log('[Login] ✅ Google login success → /');
          this.router.navigateByUrl('/');
        } else {
          this.errorMessage = res.message || 'Google sign-in failed';
        }
      },
      error: (err: any) => {
        console.error('[Login] ❌ Google login error:', err);
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Google sign-in failed';
      },
    });
  }

  private loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined') {
        resolve();
        return;
      }

      if (document.getElementById('google-gsi-script')) {
        const existing = document.getElementById('google-gsi-script') as HTMLScriptElement;
        existing.onload = () => resolve();
        existing.onerror = () => reject(new Error('Google script failed to load'));
        return;
      }

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
}