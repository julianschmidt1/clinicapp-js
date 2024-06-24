
export interface AppointmentModel {
    id?: string,
    day: string;
    time: string;
    patientId: string;
    specialistId: string;
    status: AppointmentStatus;
    specialty: string,
    reason?: string,
}

export enum AppointmentStatus {
    Done = 'Realizado',
    Rejected = 'Rechazado',
    Cancelled = 'Cancelado',
    Confirmed = 'Aceptado',
    Pending = 'Pendiente'
}
