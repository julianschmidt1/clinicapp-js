import { Directive, HostListener, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[focusOnCommand]',
  standalone: true,
})
export class FocusOnCommandDirective {

  @Input('focusOnCommand') key: string;

  constructor(private el: ElementRef) {}

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === this.key?.toLowerCase()) {
      event.preventDefault();
      this.el.nativeElement.focus();
    }
  }
}
