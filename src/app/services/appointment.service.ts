import { Injectable, inject } from '@angular/core';
import { DocumentReference, Firestore, addDoc, collection, doc, setDoc } from '@angular/fire/firestore';
import { AppointmentModel } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private _firestore = inject(Firestore);

  constructor() { }

  async addAppointment(data: AppointmentModel): Promise<any> {
    const appointmentId = `${data.specialistId}${data.patientId}${data.day}${data.time}`
    // const appointmentsCollection = collection(this._firestore, `appointments${appointmentId}`);
    // return await setDoc(appointmentsCollection, data);
    // setDoc(doc(this.firestore, 'users', userId), { ...userData, id: userId });

    return await setDoc(doc(this._firestore, 'appointments', appointmentId), { ...data, id: appointmentId });
  }

  async updateAppointment(appointment: AppointmentModel): Promise<any> {

    return await setDoc(doc(this._firestore, 'appointments', appointment.id), appointment);
  }
}
