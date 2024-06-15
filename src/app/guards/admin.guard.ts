import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const storedUser = localStorage.getItem('user');

    authService.usersCollection().subscribe({
        next: (d) => {
            const parsedUser = JSON.parse(storedUser);
            const currentUser = d.find(u => u['id'] === parsedUser.uid)

            if (!currentUser.admin) {
                router.navigateByUrl('auth/home');
                return false;
            }

            return true;
        }
    })

    return true;
};