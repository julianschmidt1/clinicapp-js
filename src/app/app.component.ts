import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { getState, slideTransition } from './animations/layout.animation';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [slideTransition]
})
export class AppComponent {
  title = 'clinicapp-js';

  public getState(outlet): any {
    return getState(outlet);
  }
}
