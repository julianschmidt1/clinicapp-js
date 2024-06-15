import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, updateDoc } from '@angular/fire/firestore';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Observable } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    CommonModule,
    ToastModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {

  private firestore = inject(Firestore);
  private toastService = inject(ToastService);
  public usersData$: Observable<any>;

  public updateUserLoading = false;

  ngOnInit(): void {
    const usersCollection = collection(this.firestore, 'users');

    console.log(collectionData(usersCollection));
    this.usersData$ = collectionData(usersCollection);

  }

  handleSetUserStatus(user: any): void {

    const userDocRef = doc(this.firestore, `users/${user.id}`);

    this.updateUserLoading = true;
    updateDoc(userDocRef, {
      disabled: !user.disabled
    }).then((d) => {

      this.toastService.successMessage('Usuario actualizado con exito');
      this.updateUserLoading = false;

    })
      .catch(() => {
        this.toastService.errorMessage('Error al actualizar usuario')
        this.updateUserLoading = false;

      })

  }



}
