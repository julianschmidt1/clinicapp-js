import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ArrowBackComponent } from '../../components/arrow-back/arrow-back.component';
import { authErrorMessage } from '../../helpers/authError.helper';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/firebase-storage.service';
import { ToastService } from '../../services/toast.service';
import { ChipModule } from 'primeng/chip';
import { first } from 'rxjs';

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
    ChipModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  private toastService = inject(ToastService);

  private auth = inject(Auth);
  private authService = inject(AuthService);
  private storageService = inject(StorageService);
  private router = inject(Router);

  private firestore = inject(Firestore);

  public loginLoading = false;

  public userData = [
    // Admin
    { id: 'qG97Ic97MJfLukrILG5z2Ua2xs63', password: 'Admin123' },
    // Specialists
    { id: 'FZ0pQSBAoIQCaKzwzxS7Z7rrk0k2', password: 'Admin123' },
    { id: 'oEgSqVapLLTBqd67ISssrSogcbg2', password: 'Admin123' },
    // Patient
    { id: 'W7TM5FeP0PV5vDj9XvhmDPDpARN2', password: 'Admin123' },
    { id: 'ckHNHa3h1ZatBdHCYw3cWf5ubn53', password: 'Admin123' },
    { id: 'vCJwaJgrInMBr83dlUfPUP2DcbR2', password: 'Admin123' },
  ]

  public defaultUsers = [];
  public defaultUsersLoading = true;

  ngOnInit(): void {

    const usersCollection = collection(this.firestore, 'users');
    collectionData(usersCollection)
      .subscribe({
        next: async (rawData) => {
          
          const defaultUsers = rawData.filter((user) => this.userData.some(u => u.id === user['id']));
          const parsedUsers = await Promise.all(defaultUsers.map(async (u) => {
            const imagePromises = this.storageService.getUserFiles(u['attachedImage']);
            const imagePath = await Promise.all(imagePromises);
            const { password } = this.userData.find(u => u.id === u.id)

            return {
              ...u,
              imagePath,
              password
            };
          }));

          this.defaultUsersLoading = false;
          this.defaultUsers = parsedUsers;

        },
        error: (error) => {
          console.log(error);
          this.defaultUsersLoading = false;

        }
      })

  }

  public user = {
    email: '',
    password: ''
  };

  handleSelectUser(user) {
    console.log(user);

    this.user.email = user.email;
    this.user.password = user.password;

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

        this.authService.usersCollection()
        .pipe(first())
        .subscribe({
          next: (allUsers) => {

            const foundUser = allUsers.find(user => user['id'] === uid);

            if (!emailVerified) {
              this.toastService.errorMessage('Debe verificar su email antes de iniciar sesión.');
              return;
            }

            if (foundUser?.disabled) {
              this.toastService.errorMessage('Un administrador debe verificar su cuenta.');
              return;
            }


            if (emailVerified && !foundUser.disabled) {
              localStorage.setItem('user', JSON.stringify({ uid, email }));
              this.router.navigateByUrl('auth/home');
            }

          }
        })
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