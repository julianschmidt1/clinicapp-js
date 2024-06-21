import { Routes } from '@angular/router';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './guards/auth.guard';
import { LayoutComponent } from './pages/layout/layout.component';
import { UsersComponent } from './pages/users/users.component';
import { adminGuard } from './guards/admin.guard';
import { ProfileComponent } from './pages/profile/profile.component';
import { CreateAppointmentComponent } from './pages/create-appointment/create-appointment.component';

const authRoutes = [
    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'users', component: UsersComponent, canActivate: [adminGuard] },
            { path: 'profile', component: ProfileComponent },
            { path: 'create-appointment', component: CreateAppointmentComponent },

        ]
    },
];

export const routes: Routes = [
    { path: '', component: WelcomeComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'auth', children: authRoutes },
    { path: '**', redirectTo: '' },
];
