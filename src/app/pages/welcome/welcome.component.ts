import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';

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
  public auth = inject(AuthService);

  register() {
    this.auth.register('mail@mail.com', 'Asdqwe123!!')
  }

  public handleNavigation(to: string): void {
    this.router.navigateByUrl(to);
    // this.register();
  }
}
