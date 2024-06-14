import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SidebarModule } from 'primeng/sidebar';

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
export class TopBarComponent {
  public sidebarVisible = false;

  private router = inject(Router);

  public routes = [
    { to: 'home', displayName: 'Inicio' },
    { to: 'users', displayName: 'Gestión de Usuarios' }
  ];

  handleLogout(): void {
    this.router.navigate([''], { replaceUrl: true });
    localStorage.removeItem('user');
  }

}
