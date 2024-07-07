import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { AppointmentStatus } from '../models/appointment.model';

@Directive({
  selector: '[rowStatus]',
  standalone: true
})
export class RowStatusDirective {

  @Input('rowStatus') status: string; 

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngOnChanges() {
    const color = this.getStatusColor(this.status);
    this.renderer.setStyle(this.el.nativeElement, 'background-color', color);
  }

  private getStatusColor(status: string): string {
    switch (status) {
      case AppointmentStatus.Done:
        return '#e3fae4';
      case AppointmentStatus.Cancelled:
        return '#fcdcdc';
      case AppointmentStatus.Confirmed:
        return '#e1f7fc';
      default:
        return '';
    }
  }

}
