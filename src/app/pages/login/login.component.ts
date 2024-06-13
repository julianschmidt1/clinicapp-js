import { Component, inject } from '@angular/core';
import { ArrowBackComponent } from '../../components/arrow-back/arrow-back.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ToastService } from '../../services/toast.service';
import { authErrorMessage } from '../../helpers/authError.helper';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ArrowBackComponent,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CommonModule,
    TooltipModule,
    DialogModule,
    FormsModule,
    ArrowBackComponent,
    ToastModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  private toastService = inject(ToastService);

  private auth = inject(Auth);
  private router = inject(Router);
  public loginLoading = false;

  public user = {
    email: '',
    password: ''
  };


  public handleSubmit(): void {
    const { email, password } = this.user;

    if (!email || !password) {
      this.toastService.errorMessage('Uno de los campos esta vacio.');
      return;
    }

    console.log(this.user);

    this.loginLoading = true;
    signInWithEmailAndPassword(this.auth, email, password)
      .then(loggedUser => {
        const { user } = loggedUser;
        const { displayName, email, photoURL } = user;

        localStorage.setItem('user', JSON.stringify({ username: displayName, email, photoURL }));
        this.router.navigateByUrl('home');
      })
      .catch(e => {
        const error = authErrorMessage(e.code);
        this.toastService.errorMessage(error);
        console.log(error);
      })
      .finally(() => {
        this.loginLoading = false;
      })
  }
}
