
export interface AppointmentModel {
    id?: string,
    day: string;
    time: string;
    patientId: string;
    specialistId: string;
    status: AppointmentStatus;
    specialty: string,
    reason?: string,
    rating?: RatingModel,
    survey?: SurveyModel
}

export interface RatingModel {
    comment: string,
    rating: number,
}

export interface SurveyModel {
    attention: number,
    availability: number,
    detail: number,
    punctual: number,
}

export enum AppointmentStatus {
    Done = 'Realizado',
    Rejected = 'Rechazado',
    Cancelled = 'Cancelado',
    Confirmed = 'Aceptado',
    Pending = 'Pendiente'
}
