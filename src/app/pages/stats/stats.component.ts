import { Component, inject, OnInit } from '@angular/core';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { AppointmentModel, AppointmentStatus } from '../../models/appointment.model';
import { map } from 'rxjs';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ChartData, ChartOptions } from 'chart.js';
import { PanelModule } from 'primeng/panel';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToastService } from '../../services/toast.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [
    ChartModule,
    TableModule,
    CommonModule,
    PanelModule,
    InputTextModule,
    FormsModule,
    ButtonModule,
    ToastModule
  ],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss'
})
export class StatsComponent implements OnInit {

  private _firestore = inject(Firestore);
  private _toastService = inject(ToastService);

  public logData = [];
  public allAppointments: AppointmentModel[] = [];
  public allUsers = [];

  public appointmentsBySpecialtyChart: ChartData;
  public basicOptions: ChartOptions;
  public appointmentsByDayChart: ChartData;

  public appointmentsBySpecialistChart: ChartData;
  public finalizedAppointmentsBySpecialistChart: ChartData;

  public appointmentDateFrom: Date;
  public appointmentDateTo: Date;
  public finalizedDateFrom: Date;
  public finalizedDateTo: Date;

  ngOnInit(): void {
    const appointmentsCollection = collection(this._firestore, 'appointments');
    const specialtiesCollection = collection(this._firestore, 'specialties');
    const usersCollection = collection(this._firestore, 'users');
    const userLogsCollection = collection(this._firestore, 'userLogs');

    collectionData(appointmentsCollection)
      .subscribe({
        next: (appointments: AppointmentModel[]) => {
          this.allAppointments = appointments;
          collectionData(specialtiesCollection).subscribe({
            next: (specialties: any) => {

              let appointmentsByDay = [];
              appointments.forEach(a => {

                const existingIndex = appointmentsByDay.findIndex(([key, _]) => key === a.day);

                if (existingIndex !== -1) {
                  const [key, value] = appointmentsByDay[existingIndex];
                  appointmentsByDay[existingIndex] = [key, value + 1];
                } else {
                  appointmentsByDay.push([a.day, 1]);
                }
              })

              const allAppointmentsByDay = appointmentsByDay.map(([key, value]) => ({
                name: key,
                quantity: value,
              }))

              this.appointmentsByDayChart = {
                labels: allAppointmentsByDay.map(s => s.name),
                datasets: [
                  {
                    label: 'Turnos',
                    data: allAppointmentsByDay.map(s => s.quantity),
                    backgroundColor: ['rgba(255, 159, 64, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(153, 102, 255, 0.2)'],
                    borderColor: ['rgb(255, 159, 64)', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)'],
                    borderWidth: 1
                  }
                ]
              };

              console.log(this.appointmentsByDayChart);


              const appointmentsBySpecialty = specialties.map(s => ({
                name: s.displayName,
                quantity: appointments.filter(a => a.specialty === s.displayName).length
              }))

              this.appointmentsBySpecialtyChart = {
                labels: specialties.map(s => s.displayName),
                datasets: [
                  {
                    data: appointmentsBySpecialty.map(d => d.quantity),
                    backgroundColor: ['rgba(255, 159, 64, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(153, 102, 255, 0.2)'],
                    borderColor: ['rgb(255, 159, 64)', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)'],
                    borderWidth: 1
                  }
                ]
              };

            }
          });
        }
      });


    collectionData(userLogsCollection).subscribe({
      next: (userLogs: any) => {
        console.log({ userLogs })
        this.logData = userLogs
      }
    });

    collectionData(usersCollection)
      .pipe(map(
        users => users.filter((user: any) => user?.specialty)
      ))
      .subscribe({
        next: (users: any) => {
          console.log({ users })
          this.allUsers = users;
        }
      });
  }

  public handleSearchByAppointment(): void {
    if (!this.appointmentDateFrom || !this.appointmentDateTo) {
      this._toastService.errorMessage('Debe seleccionar fecha desde y fecha hasta');
      return;
    }

    let appointmentsBySpecialist = [];
    let finalizedAppointmentsBySpecialist = [];

    const appointmentsInDateRange = this.allAppointments.filter(a => {
      const date = new Date(a.day);
      return date.getTime() >= new Date(this.appointmentDateFrom).getTime() && date.getTime() <= new Date(this.appointmentDateTo).getTime();
    })

    const finalizedAppointmentsInDateRange = this.allAppointments.filter(a => {
      const date = new Date(a.day);
      return date.getTime() >= new Date(this.appointmentDateFrom).getTime() &&
        date.getTime() <= new Date(this.appointmentDateTo).getTime() &&
        a.status === AppointmentStatus.Done;
    })

    console.log('TEST: ', finalizedAppointmentsInDateRange);


    appointmentsInDateRange.forEach(a => {
      const currentSpecialist = this.allUsers.find(u => u.id === a.specialistId);
      const { firstName, lastName } = currentSpecialist;
      const fullName = firstName + ' ' + lastName;

      const existingIndex = appointmentsBySpecialist.findIndex(([key, _]) => key === fullName);

      if (existingIndex !== -1) {
        const [key, value] = appointmentsBySpecialist[existingIndex];
        appointmentsBySpecialist[existingIndex] = [key, value + 1];
      } else {
        appointmentsBySpecialist.push([fullName, 1]);
      }
    })

    finalizedAppointmentsInDateRange.forEach(a => {
      const currentSpecialist = this.allUsers.find(u => u.id === a.specialistId);
      const { firstName, lastName } = currentSpecialist;
      const fullName = firstName + ' ' + lastName;

      const existingIndex = finalizedAppointmentsBySpecialist.findIndex(([key, _]) => key === fullName);

      if (existingIndex !== -1) {
        const [key, value] = finalizedAppointmentsBySpecialist[existingIndex];
        finalizedAppointmentsBySpecialist[existingIndex] = [key, value + 1];
      } else {
        finalizedAppointmentsBySpecialist.push([fullName, 1]);
      }
    })

    const allAppointmentsBySpecialist = appointmentsBySpecialist.map(([key, value]) => ({
      name: key,
      quantity: value,
    }))
    const allFinalizedAppointmentsBySpecialist = finalizedAppointmentsBySpecialist.map(([key, value]) => ({
      name: key,
      quantity: value,
    }))

    this.appointmentsBySpecialistChart = {
      labels: allAppointmentsBySpecialist.map(s => s.name),
      datasets: [
        {
          label: 'Turnos solicitados',
          data: allAppointmentsBySpecialist.map(s => s.quantity),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        },
        {
          label: 'Turnos finalizados',
          data: allFinalizedAppointmentsBySpecialist.map(s => s.quantity),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1
        },
      ]
    };
  }

  public handleExportStats(): void {

    let data = document.getElementById('page-content');
    data.setAttribute('style', 'padding: 50px');
    html2canvas(data).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = imgProps.height * pdfWidth / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('estadisticas-clinicapp.pdf');

    }).finally(() => {
      data.setAttribute('style', 'padding: 0px');
    });
  }

  handleExportLogs(): void {
    let data = document.getElementById('logs-content');
    let logsContainer = document.getElementById('logs-container');
    logsContainer.setAttribute('style', 'max-height: none;');
    html2canvas(data).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = imgProps.height * pdfWidth / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('inicios-de-sesion-clinicapp.pdf');
    }).finally(() => {
      logsContainer.setAttribute('style', 'max-height: 300px; overflow-y: auto;');
    });
  }

  public handleSearchByFinalizedAppointment(): void {
    if (!this.finalizedDateFrom || !this.finalizedDateTo) {
      this._toastService.errorMessage('Debe seleccionar fecha desde y fecha hasta');
      return;
    }

    let appointmentsBySpecialist = [];

    const appointmentsInDateRange = this.allAppointments.filter(a => {
      const date = new Date(a.day);
      return date.getTime() >= new Date(this.finalizedDateFrom).getTime() &&
        date.getTime() <= new Date(this.finalizedDateTo).getTime() &&
        a.status === AppointmentStatus.Done;
    })

    appointmentsInDateRange.forEach(a => {
      const currentSpecialist = this.allUsers.find(u => u.id === a.specialistId);
      const { firstName, lastName } = currentSpecialist;
      const fullName = firstName + ' ' + lastName;

      const existingIndex = appointmentsBySpecialist.findIndex(([key, _]) => key === fullName);

      if (existingIndex !== -1) {
        const [key, value] = appointmentsBySpecialist[existingIndex];
        appointmentsBySpecialist[existingIndex] = [key, value + 1];
      } else {
        appointmentsBySpecialist.push([fullName, 1]);
      }
    })

    const allAppointmentsBySpecialist = appointmentsBySpecialist.map(([key, value]) => ({
      name: key,
      quantity: value,
    }))

    this.finalizedAppointmentsBySpecialistChart = {
      labels: allAppointmentsBySpecialist.map(s => s.name),
      datasets: [
        {
          label: 'Turnos',
          data: allAppointmentsBySpecialist.map(s => s.quantity),
          backgroundColor: ['rgba(255, 159, 64, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(153, 102, 255, 0.2)'],
          borderColor: ['rgb(255, 159, 64)', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)'],
          borderWidth: 1
        }
      ]
    };
  }

}
