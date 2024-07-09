import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SidebarModule } from 'primeng/sidebar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'top-bar',
  standalone: true,
  imports: [
    SidebarModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss'
})
export class TopBarComponent implements OnInit {

  public sidebarVisible = false;
  private router = inject(Router);
  private authService = inject(AuthService);
  public currentUser;

  public routes = [
    { to: 'home', displayName: 'Inicio' },
    { to: 'profile', displayName: 'Perfil' },
  ];

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUserData();

    this.authService.usersCollection().subscribe({
      next: (data) => {
        const foundUser = data.find((user) => user['id'] === currentUser.uid);
        this.currentUser = foundUser;

        if (foundUser.admin && !this.routes.some(r => r.to === 'users')) {
          this.routes.push({ to: 'users', displayName: 'Gestión de Usuarios' });
          this.routes.push({ to: 'stats', displayName: 'Estadísticas' });
        }
      }
    })


  }


  handleLogout(): void {
    this.router.navigate([''], { replaceUrl: true });
    localStorage.removeItem('user');
  }

}
