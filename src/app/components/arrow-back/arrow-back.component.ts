import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'arrow-back',
  standalone: true,
  imports: [],
  templateUrl: './arrow-back.component.html',
  styleUrl: './arrow-back.component.scss'
})
export class ArrowBackComponent {
  private location = inject(Location);

  public handleClick(): void {
    this.location.back();
  }
}
