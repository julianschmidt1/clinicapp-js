import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { map } from 'rxjs';
import { AppointmentsTableComponent } from '../../components/appointments-table/appointments-table.component';
import { AppointmentModel } from '../../models/appointment.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [
    AppointmentsTableComponent
  ],
  templateUrl: './patient-appointments.component.html',
  styleUrl: './patient-appointments.component.scss'
})
export class PatientAppointmentsComponent implements OnInit {

  private _firestore = inject(Firestore);
  private _authService = inject(AuthService);

  public allAppointments: AppointmentModel[] = [];
  public currentUser;

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

}
