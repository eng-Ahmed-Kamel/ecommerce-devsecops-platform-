import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { AboutUs } from './components/about-us/about-us';
import { NotFound } from './components/not-found/not-found';
import { Contact } from './components/contact/contact';
import { Details } from './components/details/details';
import { Products } from './components/products/products';
import { MasterProducts } from './components/master-products/master-products';
import { ViewCart } from './components/view-cart/view-cart';
import { Login } from './components/login/login';
import { Signup } from './components/signup/signup';
import { OtpVerify } from './components/otp-verify/otp-verify';
import { ForgotPassword } from './components/forgot-password/forgot-password';
import { Checkout } from './components/checkout/checkout';
import { OrderConfirmation } from './components/order-confirmation/order-confirmation';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { Wishlist } from './components/wishlist/wishlist';
import { OrderHistory } from './components/order-history/order-history';
import { Profile } from './components/profile/profile';
import { Resetpassword } from './components/resetpassword/resetpassword';

export const routes: Routes = [
  { path: '', component: MasterProducts },
  { path: 'About', component: AboutUs },
  { path: 'Contact', component: Contact },
  { path: 'Details/:id', component: Details },
  { path: 'Products', component: Products },
  { path: 'Master', component: MasterProducts },
  { path: 'cart', component: ViewCart },

  // Auth
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'verify-otp', component: OtpVerify },
  { path: 'forgot-password', component: ForgotPassword },
  {path:'Resetpassword',component:Resetpassword},

  // Shopping
  { path: 'checkout', component: Checkout },
  { path: 'order-confirmation', component: OrderConfirmation },

  // User
  { path: 'wishlist', component: Wishlist },
  { path: 'order-history', component: OrderHistory },
  { path: 'profile', component: Profile },

  // Admin
  { path: 'admin', component: AdminDashboard },

  { path: '**', component: NotFound },
];
