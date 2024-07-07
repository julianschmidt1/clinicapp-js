import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[hoverScaleElement]',
  standalone: true
})
export class ScaleElementDirective {

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.setScale(1.01);
    this.renderer.setStyle(this.el.nativeElement, 'transition', '0.3s ease')
    this.renderer.setStyle(this.el.nativeElement, 'background', 'rgb(220, 226, 233)')
  }
  
  @HostListener('mouseleave') onMouseLeave() {
    this.setScale(1.0);
    this.renderer.setStyle(this.el.nativeElement, 'transition', '0.3s ease')
    this.renderer.setStyle(this.el.nativeElement, 'background', 'white');
  }

  private setScale(scale: number) {
    this.renderer.setStyle(this.el.nativeElement, 'transform', `scale(${scale})`);
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'transform 0.3s ease');
  }

}
