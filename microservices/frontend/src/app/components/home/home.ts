import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {
  currentIndex = 0;

  slides = [
    { image: 'assets/images/slider11.jpg'},
    { image: 'assets/images/slider22.jpg'},
    { image: 'assets/images/slider33.jpg'}
  ];

  plusSlides(step: number) {
    this.currentIndex += step;

    if (this.currentIndex >= this.slides.length) {
      this.currentIndex = 0;
    }

    if (this.currentIndex < 0) {
      this.currentIndex = this.slides.length - 1;
    }
  }

  currentSlide(index: number) {
    this.currentIndex = index;
  }
}