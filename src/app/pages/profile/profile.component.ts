import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Firestore, arrayUnion, collection, collectionData, doc, getDoc, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { StorageService } from '../../services/firebase-storage.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { ToastService } from '../../services/toast.service';
import { ToastModule } from 'primeng/toast';
import { DateToDayNumberPipe } from '../../pipes/date-to-day-number.pipe';
import { groupAndSortSchedule } from '../../helpers/parseModel.helper';
import { ArrowBackComponent } from '../../components/arrow-back/arrow-back.component';
import moment from 'moment';
import { PatientHistoryService } from '../../services/patient-history.service';
import { PatientHistoryDetailComponent } from '../../components/patient-history-detail/patient-history-detail.component';
import { PdfService } from '../../services/pdf.service';
import { PatientHistory } from '../../models/patient-history.model';
import { AppointmentModel } from '../../models/appointment.model';
import { map } from 'rxjs';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    DropdownModule,
    FormsModule,
    CalendarModule,
    InputTextModule,
    ToastModule,
    DateToDayNumberPipe,
    ArrowBackComponent,
    PatientHistoryDetailComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  private firestore = inject(Firestore);
  private storageService = inject(StorageService);
  private toastService = inject(ToastService);

  private pdfService = inject(PdfService);
  private exportService = inject(ExportService);

  private _patientHistoryService = inject(PatientHistoryService);
  private _firestore = inject(Firestore);

  public loadingUser = true;
  public loadingImages = true;
  public updateUserLoading = false;

  public userImages = [];
  public userData;

  public visible = false;
  public selectedDay: string;
  public selectedTime: Date[];

  public startTime: string;
  public endTime: string;

  public patientHistoryToExport: PatientHistory[] = [];
  public relatedAppointments: AppointmentModel[] = [];

  public allSpecialties = [];
  public selectedSpecialty = null;

  public loadingModal = false;
  public visibleExport = false;

  public readonly todayDate = new Date().toISOString().split('T')[0];
  public readonly days = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado'
  ]

  ngOnInit(): void {

    const storedUser = localStorage.getItem('user');
    const appointmentsCollection = collection(this._firestore, 'appointments');
    const specialtiesCollection = collection(this._firestore, 'specialties');

    collectionData(specialtiesCollection).subscribe({
      next: (data) => {
        this.allSpecialties = data;
      }
    })

    if (storedUser) {
      const parsedUserData = JSON.parse(storedUser);
      const userRef = doc(this.firestore, `users/${parsedUserData.uid}`);

      onSnapshot(userRef, async (userDocument) => {

        if (userDocument.exists()) {
          const retrievedUserData = userDocument.data() as any;
          this.userData = retrievedUserData;
          this.loadingUser = false;

          if (retrievedUserData?.schedule) {
            retrievedUserData.schedule.sort((a, b) => {
              return new Date(a.day).getDate() - new Date(b.day).getDate();
            })

          }

          // Images
          const imagePromises = this.storageService.getUserFiles(retrievedUserData.attachedImage);
          const imagePath = await Promise.all(imagePromises);
          const images = imagePath.map((i, index) => {
            const displayImageObject = { path: i, foreground: !Boolean(index) };

            return displayImageObject;
          });

          this.userImages = images;
          this.loadingImages = false;
        }
      });

      this._patientHistoryService.getHistoryById(parsedUserData.uid)
        .then((d => {
          const historyData = d.data() as any;
          this.patientHistoryToExport = historyData?.history;

          collectionData(appointmentsCollection)
            .pipe(map((appointments: AppointmentModel[]) => {
              return appointments.filter(a => this.patientHistoryToExport?.some(hd => hd.appointmentId === a.id))
            }))
            .subscribe({
              next: (appointments) => {
                this.relatedAppointments = appointments;
              },
              error: (e) => {
                console.log('Error: ', e);
              }
            })

        }));
    }

  }

  public handleConfirmExport(): void {
    const selectedSpecialtyAppointments = this.relatedAppointments.filter(a => a.specialty === this.selectedSpecialty);

    if(!selectedSpecialtyAppointments.length) {
      this.toastService.errorMessage('No hay atenciones para la especialidad seleccionada.');
      return;
    }
    const appointmentsToExport = selectedSpecialtyAppointments.map(a => {
      const { specialistId, id, hasHistory, patientId, ...rest } = a

      return rest;
    })

    const headers = {
      day: 'Dia',
      time: 'Hora',
      status: 'Estado',
      specialty: 'Especialidad',
      reason: 'Observaciones',
    };

    this.exportService.exportToExcel(appointmentsToExport, 'turnos.xlsx', headers);
  }

  handleDownloadPatientHistory(): void {
    this.pdfService.downloadPdf(this.patientHistoryToExport, this.relatedAppointments, this.userData);
  }

  handleCloseAndSetDefault() {
    this.visible = false;
    this.selectedDay = undefined;
    this.selectedTime = undefined;
  }

  handleConfirm() {
    if (!this.selectedDay || !this.startTime || !this.endTime) {
      this.toastService.errorMessage('Ingrese un dia y rango horario.', 'Error');
      return;
    }

    if (!this.validateTime(
      this.startTime.toString(),
      this.endTime.toString(),
      this.selectedDay
    )) {
      this.toastService.errorMessage('Horario de atencion invalido. Lun a Vie 8 a 19. Sáb 8 a 14.', 'Error');
      return;
    }

    let timeOverlap = false;
    if (this.userData?.schedule?.some(s => s.day === this.selectedDay)) {
      const appointments = this.userData?.schedule.filter(s => s.day === this.selectedDay);

      const currentStartDate = moment(this.startTime, 'HH:mm');
      const currentEndDate = moment(this.endTime, 'HH:mm');

      appointments.forEach(element => {
        const elementStartDate = moment(element.time.start, 'HH:mm');
        const elementEndDate = moment(element.time.end, 'HH:mm');

        if (currentStartDate.isSameOrAfter(currentEndDate) || elementStartDate.isSameOrAfter(elementEndDate)) {
          // no overlap
        } else if (currentStartDate.isSameOrAfter(elementEndDate) || elementStartDate.isSameOrAfter(currentEndDate)) {
          // no overlap
        } else {
          // overlay
          timeOverlap = true;
        }
      });
    }

    if (timeOverlap) {
      this.toastService.errorMessage('El rango horario seleccionado para este dia genera conflicto');
      return;
    }

    this.updateUserLoading = true;

    const userDocRef = doc(this.firestore, `users/${this.userData.id}`);
    updateDoc(userDocRef, {
      schedule: arrayUnion({
        day: this.selectedDay,
        time: {
          start: this.startTime,
          end: this.endTime,
        },
      })
    }).then((d) => {

      this.toastService.successMessage('Horario creado exitosamente.');
      this.updateUserLoading = false;

      this.handleCloseAndSetDefault();
    })
      .catch(() => {
        this.toastService.errorMessage('Error al actualizar horario.');
        this.updateUserLoading = false;
      })

  }

  validateTime(startTime: string, endTime: string, day: string): boolean {
    const [hoursStr1, minutesStr1] = startTime.split(':');
    const [hoursStr2, minutesStr2] = endTime.split(':');
    const startHour = +hoursStr1;
    const endHour = +hoursStr2;

    const dateObj = new Date(day);
    const dayOfWeek = dateObj.getDay();

    let validStartHour = 8;
    let validEndHour = 19;

    const dayName = new Date(day).getDay();
    const isSaturday = this.days[dayName] === 'Sábado';
    if (isSaturday) {
      validEndHour = 14;
    }

    const isValidStartTime = startHour >= validStartHour && startHour <= validEndHour;
    const isValidEndTime = endHour >= validStartHour && endHour <= validEndHour;
    const isValidRange = startHour < endHour || (startHour === endHour && minutesStr1 < minutesStr2);

    return isValidStartTime && isValidEndTime && isValidRange;
  }


  handleClickImage(image: { foreground: boolean, path: string }) {
    if (this.userImages.length > 1) {
      this.userImages = [
        { ...this.userImages[1], foreground: true },
        { ...this.userImages[0], foreground: false },
      ]
    }

  }

}

export interface ScheduleModel {
  time: string,
  day: string,
  busy: boolean,
}