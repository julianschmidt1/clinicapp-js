export interface PatientHistory {
    id: string,
    patientId: string,
    height: number,
    weight: number,
    temperature: number,
    pressure: number,
    customProperties: KeyValuePair[],
    appointmentIds?: string[],
    appointmentId: string,
    creationDate?: Date,
    modificationDate?: Date,
}

export interface KeyValuePair {
    key: string,
    value: string,
    displayName: string,
}