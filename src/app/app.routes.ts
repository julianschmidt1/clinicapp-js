import { Routes } from '@angular/router';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './guards/auth.guard';
import { LayoutComponent } from './pages/layout/layout.component';
import { UsersComponent } from './pages/users/users.component';
import { userGuard } from './guards/admin.guard';
import { ProfileComponent } from './pages/profile/profile.component';
import { CreateAppointmentComponent } from './pages/create-appointment/create-appointment.component';
import { PatientAppointmentsComponent } from './pages/patient-appointments/patient-appointments.component';
import { SpecialistAppointmentsComponent } from './pages/specialist-appointments/specialist-appointments.component';
import { AllAppointmentsComponent } from './pages/all-appointments/all-appointments.component';
import { MyPatientsComponent } from './pages/my-patients/my-patients.component';

const authRoutes = [
    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'home', component: HomeComponent, data: { state: 'home' } },
            { path: 'users', component: UsersComponent, canActivate: [userGuard(['admin'])], data: { state: 'users' } },
            { path: 'profile', component: ProfileComponent, data: { state: 'profile' } },
            { path: 'create-appointment', component: CreateAppointmentComponent, canActivate: [userGuard(['admin', 'patient'])], data: { state: 'create-appointment' } },
            { path: 'patient-appointments', component: PatientAppointmentsComponent, canActivate: [userGuard(['patient'])], data: { state: 'patient-appointments' } },
            { path: 'specialist-appointments', component: SpecialistAppointmentsComponent, canActivate: [userGuard(['specialist'])], data: { state: 'specialist-appointments' } },
            { path: 'my-patients', component: MyPatientsComponent, canActivate: [userGuard(['specialist'])], data: { state: 'my-patients' } },
            { path: 'all-appointments', component: AllAppointmentsComponent, canActivate: [userGuard(['admin'])], data: { state: 'all-appointments' } },
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
