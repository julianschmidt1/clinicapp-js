import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const userGuard: (userTypes: string[]) => CanActivateFn = (userTypes: string[]) => {
    return () => {
        const router = inject(Router);
        const authService = inject(AuthService);

        return authService.usersCollection().pipe(
            map((users) => {
                const parsedUser = authService.getCurrentUserData();
                const currentUser = users.find(u => u['id'] === parsedUser.uid);

                const isValidPatient = currentUser?.healthcare && userTypes.includes('patient');
                const isValidAdmin = currentUser?.admin && userTypes.includes('admin');
                const isValidSpecialist = currentUser?.specialty && userTypes.includes('specialist');

                if (isValidPatient || isValidAdmin || isValidSpecialist) {
                    return true;
                }

                router.navigateByUrl('auth/home');
                return false;

            })
        );
    };
};