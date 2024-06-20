import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { StorageService } from '../../services/firebase-storage.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';

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
    InputTextModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  private firestore = inject(Firestore)
  private storageService = inject(StorageService)

  public loadingUser = true;
  public loadingImages = true;

  public userImages = [];
  public userData;

  public visible = false;
  public selectedDay: string;
  public selectedTime: Date[];

  public specialistSchedule = [
    { day: 'lunes', time: '14.30' },
    { day: 'lunes', time: '15.30' },
    { day: 'lunes', time: '16.30' },
    { day: 'martes', time: '12.00' },
    { day: 'martes', time: '12.30' },
    { day: 'miercoles', time: '12.30' },
    { day: 'miercoles', time: '12.30' },
  ]

  public readonly days = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado'
  ]

  public renderSchedule = [];

  public groupSchedule(array) {

    let result = {};

    array.forEach(({ day, time }) => {

      if (result[day]) {
        result[day] = [...result[day], { day, time }];
      } else {
        result[day] = [{ day, time }]
      }
    })

    return Object.entries(result);
    // return array.map()
  }

  ngOnInit(): void {

    this.renderSchedule = this.groupSchedule(this.specialistSchedule);
    console.log(this.renderSchedule);


    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      const parsedUserData = JSON.parse(storedUser);
      const userRef = doc(this.firestore, `users/${parsedUserData.uid}`);

      getDoc(userRef).then(async (userDocument) => {
        if (userDocument.exists()) {
          console.log(userDocument.data());
          const retrievedUserData = userDocument.data() as any;
          this.userData = retrievedUserData;
          this.loadingUser = false;

          const imagePromises = this.storageService.getUserFiles(retrievedUserData.attachedImage);
          const imagePath = await Promise.all(imagePromises);

          this.loadingImages = false;

          const images = imagePath.map((i, index) => {
            const displayImageObject = { path: i, foreground: !Boolean(index) };

            return displayImageObject;
          })
          this.userImages = images;

        }

      })
    }
  }

  handleConfirm() {
    console.log(this.selectedDay);
    console.log(this.selectedTime);

    console.log(this.validateTime(this.selectedTime?.toString(), this.selectedDay));


  }

  validateTime(time: string, day: string): boolean {
    const [hoursStr, minutesStr] = time.split(':');
    const hours = +hoursStr
    const minutes = +minutesStr;
    const isSaturday = day === 'Sábado';
    const startHour = 8;
    let endHour = 19;

    console.log('HORAS:', hours);
    console.log('MINUTOS:', minutes);

    if (isSaturday) {
      endHour = 14;
    }

    if (
      (hours < startHour || hours > endHour)
      || (isSaturday && (hours < startHour || hours > endHour))
      || (hours === endHour && minutes !== 0)
    ) {
      return false;
    }

    return true;
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
