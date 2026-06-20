import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './components/footer/footer';

import { Home } from './components/home/home';
import { MasterProducts } from './components/master-products/master-products';
import { Products } from './components/products/products';
import { Header} from './components/header/header';

@Component({
  selector: 'app-root',
  imports: [Home, Footer ,Header , MasterProducts,Products,RouterOutlet],
   standalone: true,          
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('angular-course');
}
