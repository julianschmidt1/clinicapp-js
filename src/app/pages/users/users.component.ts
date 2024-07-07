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
import { PatientHistoryDetailComponent } from '../../components/patient-history-detail/patient-history-detail.component';
import { ExportService } from '../../services/export.service';
import { TooltipModule } from 'primeng/tooltip';
import { AppointmentModel } from '../../models/appointment.model';
import { ValueOrNull } from '../../pipes/value.pipe';
import { ScaleElementDirective } from '../../directives/scale-element.directive';

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
    PatientHistoryDetailComponent,
    TooltipModule,
    ValueOrNull,
    ScaleElementDirective
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {

  private _firestore = inject(Firestore);
  private _toastService = inject(ToastService);
  private _exportService = inject(ExportService);

  public updateUserLoading = false;
  public usersData$: Observable<any>;
  public allUsers = [];
  public getUsersLoading = false;
  public registerModal = false;

  public patientHistoryModal = false;
  public selectedUserId: string = null;

  public allAppointments: AppointmentModel[] = []

  ngOnInit(): void {
    const usersCollection = collection(this._firestore, 'users');
    const appointmentsCollection = collection(this._firestore, 'appointments');
    this.getUsersLoading = true;

    collectionData(appointmentsCollection).subscribe({
      next: (data) => {
        this.allAppointments = data as AppointmentModel[];
      }
    })

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
    this.selectedUserId = user.id;
    this.patientHistoryModal = true;
  }

  public handleHideModal(): void {
    this.patientHistoryModal = false;
    this.selectedUserId = null
  }

  public handleDownloadTable(): void {

    const arrayToExport = this.allUsers.map(user => {
      return {
        email: user.email,
        fullName: user.firstName + ' ' + user.lastName,
        dni: user.dni,
        specialty: user?.specialty ? user.specialty.join(', ') : 'N/A',
        healthcare: user?.healthcare ? user.healthcare : 'N/A',
        admin: user?.admin ? 'SI' : 'NO',
      };
    })

    const headers = {
      email: 'Correo',
      fullName: 'Nombre completo',
      dni: 'DNI',
      specialty: 'Especialidad/es',
      healthcare: 'Obra social',
      admin: 'Administrador'
    };

    this._exportService.exportToExcel(arrayToExport, 'listado-usuarios.xlsx', headers);
  }

  public handleExportAppointments(user): void {
    const selectedUserAppointments = this.allAppointments.filter(a => a.specialistId === user.id);

    const relatedPatientAppointments = selectedUserAppointments.map(appointment => {
      const patient = this.allUsers.find(u => u.id === appointment.patientId);
      const specialist = this.allUsers.find(u => u.id === appointment.specialistId);

      const { id, specialistId, patientId, hasHistory, ...rest } = appointment;

      return {
        ...rest,
        patient: patient.firstName + ' ' + patient.lastName,
        specialist: specialist.firstName + ' ' + specialist.lastName,
      }
    })

    const headers = {
      day: 'Dia',
      time: 'Hora',
      patient: 'Paciente',
      specialist: 'Especialista',
      specialty: 'Especialidad',
      reason: 'Observaciones',
      status: 'Estado',
    }

    this._exportService.exportToExcel(relatedPatientAppointments, `turnos-${user.firstName}-${user.lastName}.xlsx`, headers);

  }

  public handleSetUserStatus(user: any): void {
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
      });
  }
}
