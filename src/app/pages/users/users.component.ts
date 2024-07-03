import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, updateDoc } from '@angular/fire/firestore';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Observable } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { NewUserComponent } from './new-user/new-user.component';
import { PatientHistoryService } from '../../services/patient-history.service';
import { PatientHistoryDetailComponent } from '../../components/patient-history-detail/patient-history-detail.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    CommonModule,
    ToastModule,
    DialogModule,
    NewUserComponent,
    PatientHistoryDetailComponent
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {

  private _firestore = inject(Firestore);
  private _toastService = inject(ToastService);
  private _patientHistoryService = inject(PatientHistoryService);

  public updateUserLoading = false;
  public usersData$: Observable<any>;
  public allUsers = [];
  public getUsersLoading = false;
  public registerModal = false;

  public patientHistoryModal = false;
  public selectedUserId: string = null;

  ngOnInit(): void {
    const usersCollection = collection(this._firestore, 'users');
    this.getUsersLoading = true;

    collectionData(usersCollection).subscribe({
      next: (data) => {
        this.allUsers = data;
        console.log(data);

        this.getUsersLoading = false;
      },
      error: (error) => {
        this._toastService.errorMessage('Ocurrio un error al obtener los usuarios');
        this.getUsersLoading = false;
      }
    })
  }

  public handlePatientHistoryModal(user): void {
    console.log(user);
    this.selectedUserId = user.id;
    this.patientHistoryModal = true;
  }

  public handleHideModal(): void {
    this.patientHistoryModal = false;
    this.selectedUserId = null
  }

  handleSetUserStatus(user: any): void {
    const userDocRef = doc(this._firestore, `users/${user.id}`);

    this.updateUserLoading = true;
    updateDoc(userDocRef, {
      disabled: !user.disabled
    }).then((d) => {
      this._toastService.successMessage('Usuario actualizado con exito');
      this.updateUserLoading = false;
    })
      .catch(() => {
        this._toastService.errorMessage('Error al actualizar usuario')
        this.updateUserLoading = false;

      })
  }
}
