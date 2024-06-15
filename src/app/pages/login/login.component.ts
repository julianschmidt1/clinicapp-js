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

  public setCredentials(isAdmin: boolean): void {
    if(isAdmin) {
      this.user.email = 'juli99nic@gmail.com';
      this.user.password = 'Admin123';
    } else {
      this.user.email = 'pacienteuno@mail.com';
      this.user.password = 'Paciente123';
    }
  }


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
        const { email, uid, emailVerified } = loggedUser.user;

        if (!emailVerified) {
          this.toastService.errorMessage('Debe verificar su email antes de iniciar sesión.');
          this.loginLoading = false;
          return;
        }

        // if(!adminVerified) {
        //   this.toastService.errorMessage('Un administrador debe verificar su cuenta.');
        //   return;
        // }

        localStorage.setItem('user', JSON.stringify({ uid, email }));
        this.router.navigateByUrl('auth/home');
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

// Un form para cada especialidad

// Cargar imagenes en firebase storage, almacenar la REF

// Bug en registro cuando apretas enviar queda cargando

// especialista =/= admin



// * Botones de Acceso rápido
// - Deben ser botones cuadrados con bordes redondeados
// - Deben tener la imagen de perfil del usuario
// - Deben estar a la derecha del login, uno abajo del otro, 6 usuarios (3 pacientes, 2 especialistas, 1 admin)

// * Registro de usuarios
// - Al ingresar a la página solo se deben ver 2 imágenes que represente a un paciente o especialista, según esa elección mostrará un formulario correspondiente.
// - Estas imágenes deben estar en botones cuadrados con bordes redondeados