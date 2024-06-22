import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Firestore, arrayUnion, doc, getDoc, onSnapshot, updateDoc } from '@angular/fire/firestore';
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
    DateToDayNumberPipe
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  private firestore = inject(Firestore);
  private storageService = inject(StorageService);
  private toastService = inject(ToastService);

  public loadingUser = true;
  public loadingImages = true;
  public updateUserLoading = false;

  public userImages = [];
  public userData;

  public visible = false;
  public selectedDay: string;
  public selectedTime: Date[];

  public readonly todayDate = new Date().toISOString().split('T')[0];

  public specialistSchedule = [];

  public readonly days = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado'
  ]

  public renderSchedule = [];


  ngOnInit(): void {

    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      const parsedUserData = JSON.parse(storedUser);
      const userRef = doc(this.firestore, `users/${parsedUserData.uid}`);

      onSnapshot(userRef, async (userDocument) => {

        if (userDocument.exists()) {
          const retrievedUserData = userDocument.data() as any;
          this.userData = retrievedUserData;
          this.loadingUser = false;

          if (retrievedUserData.schedule) {
            this.specialistSchedule = groupAndSortSchedule(retrievedUserData.schedule);
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

      })

      // getDoc(userRef).then(async (userDocument) => {
      //   if (userDocument.exists()) {
      //     // console.log(userDocument.data());
      //     const retrievedUserData = userDocument.data() as any;
      //     this.userData = retrievedUserData;


      //     console.log('sche: ', retrievedUserData.schedule);
      //     this.specialistSchedule = this.groupSchedule(retrievedUserData.schedule);

      //     this.loadingUser = false;

      //     const imagePromises = this.storageService.getUserFiles(retrievedUserData.attachedImage);
      //     const imagePath = await Promise.all(imagePromises);

      //     this.loadingImages = false;

      //     const images = imagePath.map((i, index) => {
      //       const displayImageObject = { path: i, foreground: !Boolean(index) };

      //       return displayImageObject;
      //     })
      //     this.userImages = images;

      //   }

      // })
    }
  }

  handleCloseAndSetDefault() {
    this.visible = false;
    this.selectedDay = undefined;
    this.selectedTime = undefined;
  }

  handleConfirm() {
    if (!this.selectedDay || !this.selectedTime) {
      this.toastService.errorMessage('Ingrese un dia y hora.', 'Error');
      return;
    }

    if (!this.validateTime(this.selectedTime.toString(), this.selectedDay)) {
      this.toastService.errorMessage('Horario de atencion invalido. Lun a Vie 8 a 19. Sáb 8 a 14.', 'Error');
      return;
    }

    this.updateUserLoading = true;

    const userDocRef = doc(this.firestore, `users/${this.userData.id}`);
    updateDoc(userDocRef, {
      schedule: arrayUnion({ day: this.selectedDay, time: this.selectedTime })
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

  validateTime(time: string, day: string): boolean {
    const [hoursStr] = time.split(':');
    const hours = +hoursStr
    const startHour = 8;
    let endHour = 19;

    const dayName = new Date(day).getDay();
    const isSaturday = this.days[dayName] === 'Sábado';

    if (isSaturday) {
      endHour = 14;
    }

    return !(hours < startHour || hours > endHour) && !(hours === endHour)
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
  day: string
}