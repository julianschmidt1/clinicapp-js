import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { map } from 'rxjs';
import { AppointmentsTableComponent } from '../../components/appointments-table/appointments-table.component';
import { AppointmentModel, AppointmentStatus } from '../../models/appointment.model';
import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { ToastModule } from 'primeng/toast';
import { ToastService } from '../../services/toast.service';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RatingModule } from 'primeng/rating';
import { ArrowBackComponent } from '../../components/arrow-back/arrow-back.component';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [
    AppointmentsTableComponent,
    ToastModule,
    DialogModule,
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    RatingModule,
    ArrowBackComponent
  ],
  templateUrl: './patient-appointments.component.html',
  styleUrl: './patient-appointments.component.scss'
})
export class PatientAppointmentsComponent implements OnInit {

  private _firestore = inject(Firestore);
  private _authService = inject(AuthService);
  private _appointmentService = inject(AppointmentService);
  private _toastService = inject(ToastService);

  public allAppointments: AppointmentModel[] = [];
  public currentUser;

  // Comment dialog
  public loadingModal = false;
  public dialogVisible = false;
  public actionData;
  public reason: string = '';

  public commentsDialogVisible = false;

  // Rating
  public ratingDialogVisible = false;
  public starsRating = 1;
  public ratingComment = '';

  // Survey
  public surveyDialogVisible = false;
  public surveyAnswers = {
    attention: 1,
    detail: 1,
    availability: 1,
    punctual: 1,
  }

  ngOnInit(): void {

    const appointmentsCollection = collection(this._firestore, 'appointments');

    const currentUserData = this._authService.getCurrentUserData();

    this._authService.getUserById(currentUserData.uid)
      .then((data) => {
        this.currentUser = data.data();
      })
      .finally(() => {

        collectionData(appointmentsCollection)
          .pipe(
            map((appointment: AppointmentModel[]) => {
              return appointment.filter((a) => a.patientId === this.currentUser.id);
            })
          )
          .subscribe({
            next: (appointments) => {
              this.allAppointments = appointments;
            }
          });

      })

  }

  handleActionClick(data) {
    this.actionData = data;

    if (data.action === 'survey') {
      this.surveyDialogVisible = true;
      return;
    }

    if (data.action === 'rating') {
      this.ratingDialogVisible = true;
      return;
    }

    if (data.action === 'comments') {
      this.commentsDialogVisible = true;
      return;
    }

    if (data.action === AppointmentStatus.Cancelled) {
      this.dialogVisible = true;
      return;
    }
  }

  handleConfirmSurvey(): void {
    this.loadingModal = true;

    const updatedAppointment = {
      ...this.actionData.appointment,
      survey: this.surveyAnswers
    };

    this._appointmentService.updateAppointment(updatedAppointment)
    .then(() => {
      this._toastService.successMessage('Encuesta enviada con exito.');
      this.surveyDialogVisible = false;
      this.loadingModal = false;
      this.actionData = undefined;
    })
    .catch(() => {
      this._toastService.errorMessage('Error al enviar encuesta.');
      this.loadingModal = false;
    });

  }

  public handleConfirmRating(): void {
    this.loadingModal = true;

    const updatedAppointment = {
      ...this.actionData.appointment,
      rating: {
        rating: this.starsRating,
        comment: this.ratingComment
      }
    };

    this._appointmentService.updateAppointment(updatedAppointment)
      .then(() => {
        this._toastService.successMessage('Calificacion enviada con exito');
        this.ratingDialogVisible = false;
        this.loadingModal = false;
        this.actionData = undefined;
      })
      .catch(() => {
        this._toastService.errorMessage('Error al calificar el turno');
        this.loadingModal = false;
      });

    console.log(this.starsRating, this.ratingComment);

  }

  public handleConfirmDialog(): void {
    this.loadingModal = true
    const updatedAppointment = {
      ...this.actionData.appointment,
      status: this.actionData.action,
      reason: this.reason,
    }

    this._appointmentService.updateAppointment(updatedAppointment)
      .then(() => {
        this._toastService.successMessage('Turno actualizado con exito');
        this.dialogVisible = false;
        this.loadingModal = false;
        this.actionData = undefined;
      })
      .catch(() => {
        this._toastService.errorMessage('Error al actualizar el turno');
        this.loadingModal = false;
      });
  }

}
