import { Pipe, PipeTransform, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Pipe({
    name: 'userIdToFullname',
    standalone: true,
})
export class UserIdToFullname implements PipeTransform {

    private authService: AuthService = inject(AuthService)

    async transform(id: string): Promise<string> {
        try {
            const user = await this.authService.getUserById(id);
            const userData: any = user.data();

            return `${userData.firstName} ${userData.lastName}`;
        } catch (error) {
            console.log(error);
            return '';
        }
    }

}