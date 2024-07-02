export interface PatientHistory {
    id: string,
    patientId: string,
    creationDate: Date,
    height: number,
    weight: number,
    temperature: number,
    pressure: number,
    appointmentIds: string[],
}