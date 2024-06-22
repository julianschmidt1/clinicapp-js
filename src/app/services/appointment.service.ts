import { Injectable, inject } from '@angular/core';
import { DocumentReference, Firestore, addDoc, collection } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private _firestore = inject(Firestore);

  constructor() { }

  async addAppointment(data): Promise<DocumentReference> {
    const appointmentsCollection = collection(this._firestore, 'appointments');

    return await addDoc(appointmentsCollection, data);
  }
}
