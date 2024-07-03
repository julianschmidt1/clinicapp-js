import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { NewUserComponent } from '../users/new-user/new-user.component';
import { PatientHistoryDetailComponent } from '../../components/patient-history-detail/patient-history-detail.component';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { map } from 'rxjs';
import { AppointmentModel, AppointmentStatus } from '../../models/appointment.model';
import { ArrowBackComponent } from '../../components/arrow-back/arrow-back.component';

@Component({
  selector: 'app-my-patients',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    CommonModule,
    ToastModule,
    DialogModule,
    PatientHistoryDetailComponent,
    ArrowBackComponent
  ],
  templateUrl: './my-patients.component.html',
  styleUrl: './my-patients.component.scss'
})
export class MyPatientsComponent {

  private _firestore = inject(Firestore);
  private _toastService = inject(ToastService);
  private _authService = inject(AuthService);
  public allUsers = [];
  public getUsersLoading = false;

  public patientHistoryModal = false;
  public selectedUserId: string = null;

  ngOnInit(): void {
    const appointmentsCollection = collection(this._firestore, 'appointments');
    this.getUsersLoading = true;

    const currentUser = this._authService.getCurrentUserData();
    if (!currentUser) return;

    collectionData(appointmentsCollection)
      .pipe(map((appointments: AppointmentModel[]) => {
        return appointments.filter(a => a.specialistId === currentUser.uid && a.status === AppointmentStatus.Done)
      }))
      .subscribe({
        next: (data) => {
          let userIds: string[] = [];
          data.forEach(a => {
            if (!userIds.includes(a.patientId)) {
              userIds.push(a.patientId);
            }
          })


          console.log('MY APPOINTMENTS: ', data)
          console.log(userIds);

          this.getSpecialistUsers(userIds);
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

  public getSpecialistUsers(userIds: string[]): void {
    const usersCollection = collection(this._firestore, 'users');

    collectionData(usersCollection)
      .pipe(map((users: any) => {
        return users.filter((user) => userIds.includes(user.id))
      }))
      .subscribe({
        next: (data) => {
          this.allUsers = data;
          this.getUsersLoading = false;

          console.log('USERS: ', data);
        },
        error: (error) => {
          this._toastService.errorMessage('Ocurrio un error al obtener los usuarios');
          this.getUsersLoading = false;
        }
      });
  }
}
