import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { PatientHistory } from '../models/patient-history.model';
import { AppointmentModel } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

  downloadPdf(fullHistory: PatientHistory[], relatedAppointments: AppointmentModel[], patient) {

    const doc = new jsPDF();
    const logo = new Image();

    logo.src = '../../assets/logo-medium.png';
    doc.addImage(logo, 'PNG', 90, 10, 30, 30);

    doc.setFontSize(26);
    doc.text('Historia clinica', 75, 50);

    doc.setFontSize(16);
    const now = new Date();
    const dateString = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    doc.text(`Emitido el dia ${dateString} por Clinicapp™`, 10, 70);

    doc.setFontSize(20).setFont(undefined, 'bold');
    doc.text('Datos personales', 10, 90);
    doc.setFontSize(14).setFont(undefined, 'normal');
    doc.text('Nombre completo: ' + patient.firstName + ' ' + patient.lastName, 20, 110);
    doc.text('DNI: ' + patient.dni, 20, 120);
    doc.text('Obra social: ' + patient.healthcare, 20, 130);

    let y = 145;
    
    doc.setFontSize(20).setFont(undefined, 'bold');
    doc.text('Atencion', 10, y);
    fullHistory.forEach((history, index) => {
      const appointment = relatedAppointments.find(a => a.id === history.appointmentId);

      y += 10

      doc.setFontSize(15).setFont(undefined, 'bold');
      doc.text(`Fecha: ${appointment.day} - ${appointment.time}`, 20, y + 10);

      doc.setFontSize(14).setFont(undefined, 'normal');
      doc.text(`Especialidad: ${appointment.specialty}`, 20, y + 20);
      doc.text(`Observaciones: ${appointment.reason}`, 20, y + 30);
      doc.setFontSize(14);

      doc.text(`Detalles: `, 20, y + 40);
      doc.text(`Altura: ${history.height}`, 25, y + 50);
      doc.text(`Peso: ${history.weight}`, 25, y + 60);
      doc.text(`Presión: ${history.pressure}`, 25, y + 70);
      doc.text(`Temperatura: ${history.temperature}`, 25, y + 80);

      if (history.customProperties?.length) {
        doc.text(`Información adicional`, 25, y + 90);
        doc.setFontSize(13)

        history.customProperties.forEach((prop, index) => {
          doc.text(`${prop.displayName}: ${prop.value}`, 30, y + 100 + (10 * index))
        })

      }
      y += 20;

      if (index < fullHistory.length - 1) {
        doc.addPage();
        y = 10;
      }
      // doc.setLineDash([10, 10], 0);
    })

    doc.save('historia-clinica.pdf');
  }
}
