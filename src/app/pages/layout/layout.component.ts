import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TopBarComponent } from '../../components/top-bar/top-bar.component';
import { routerTransition } from '../../animations/layout.animation';
import { getState } from '../../animations/layout.animation';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterModule,
    TopBarComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  animations: [routerTransition]
})
export class LayoutComponent {
  public getState(outlet): any {
    return getState(outlet);
  }
}

