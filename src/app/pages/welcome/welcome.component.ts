import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [
    ButtonModule
  ],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {

  private router = inject(Router);


  public handleNavigation(to: string): void {
    this.router.navigateByUrl(to);
  }
}
