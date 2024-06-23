import { Component, OnInit, inject } from '@angular/core';
import { AppointmentsTableComponent } from '../../components/appointments-table/appointments-table.component';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [
    AppointmentsTableComponent
  ],
  templateUrl: './my-appointments.component.html',
  styleUrl: './my-appointments.component.scss'
})
export class MyAppointmentsComponent implements OnInit {
  
  private _firestore = inject(Firestore);

  public allAppointments = [];
  
  ngOnInit(): void {

    const appointmentsCollection = collection(this._firestore, 'appointments');

    collectionData(appointmentsCollection)
    .subscribe({
      next: (appointments) => {
        console.log(appointments);
        this.allAppointments = appointments;
      }
    });

  }

}
