import { Directive, ElementRef, HostListener, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appHighlightCard]',
  standalone: true
})
export class HighlightCard implements OnChanges{

  constructor(private element: ElementRef) {
    this.element.nativeElement.style.transition = 'all 0.3s ease';
    this.element.nativeElement.style.backgroundColor = '#e8e0d8'
  }
  ngOnChanges(){
  //lw ana 3mla input by8ayr f shakl haga a7otha hena
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    this.element.nativeElement.style.transform = 'scale(1.05)';
    this.element.nativeElement.style.backgroundColor = '#05000015'

  }
  @HostListener('mouseleave')
  onMouseLeave() {
    this.element.nativeElement.style.transform = 'scale(1)';
    this.element.nativeElement.style.backgroundColor = '#e8e0d8'
  }
}