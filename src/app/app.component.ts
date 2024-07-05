import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { fromBelowTransition, getState } from './animations/layout.animation';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [fromBelowTransition]
})
export class AppComponent {
  title = 'clinicapp-js';

  public getState(outlet): any {
    return getState(outlet);
  }
}
