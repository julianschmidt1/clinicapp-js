import { Routes } from '@angular/router';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth.guard';
import { LayoutComponent } from './pages/layout/layout.component';
import { userGuard } from './guards/admin.guard';

const authRoutes = [
    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'home',
                data: { state: 'home' },
                loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
            },
            {
                path: 'users',
                canActivate: [userGuard(['admin'])],
                data: { state: 'users' },
                loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent)
            },
            {
                path: 'profile',
                data: { state: 'profile' },
                loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
            },
            {
                path: 'create-appointment',
                canActivate: [userGuard(['admin', 'patient'])],
                data: { state: 'create-appointment' },
                loadComponent: () => import('./pages/create-appointment/create-appointment.component').then(m => m.CreateAppointmentComponent)
            },
            {
                path: 'patient-appointments',
                canActivate: [userGuard(['patient'])],
                data: { state: 'patient-appointments' },
                loadComponent: () => import('./pages/patient-appointments/patient-appointments.component').then(m => m.PatientAppointmentsComponent)
            },
            {
                path: 'specialist-appointments',
                canActivate: [userGuard(['specialist'])],
                data: { state: 'specialist-appointments' },
                loadComponent: () => import('./pages/specialist-appointments/specialist-appointments.component').then(m => m.SpecialistAppointmentsComponent)
            },
            {
                path: 'my-patients',
                canActivate: [userGuard(['specialist'])],
                data: { state: 'my-patients' },
                loadComponent: () => import('./pages/my-patients/my-patients.component').then(m => m.MyPatientsComponent)
            },
            {
                path: 'all-appointments',
                canActivate: [userGuard(['admin'])],
                data: { state: 'all-appointments' },
                loadComponent: () => import('./pages/all-appointments/all-appointments.component').then(m => m.AllAppointmentsComponent)
            },
        ]
    },
];

export const routes: Routes = [
    { path: '', component: WelcomeComponent, data: { state: '' } },
    { path: 'register', component: RegisterComponent, data: { state: 'register' } },
    { path: 'login', component: LoginComponent, data: { state: 'login' } },
    { path: 'auth', children: authRoutes },
    { path: '**', redirectTo: '' },
];
