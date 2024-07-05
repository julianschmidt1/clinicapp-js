import { AppointmentModel } from "../models/appointment.model";

export const getFilteredAppointments = (
    filterCriteria: string,
    allAppointments: AppointmentModel[],
    users: any[],
    property: string,
): AppointmentModel[] => {

    const sanitizedCriteria = filterCriteria.toLowerCase().trim();

    if (!sanitizedCriteria.length) {
        return allAppointments;
    }
    const availableUsers = users.filter(s => allAppointments.some((a: AppointmentModel) => a[property] === s.id))
        .map(u => (
            {
                ...u,
                filterFullname: u.firstName + ' ' + u.lastName
            }
        ));

    const filteredValues = allAppointments.filter((register: AppointmentModel) => {
        const availableTableUsers = availableUsers.filter(s => s.filterFullname.toLowerCase().includes(sanitizedCriteria));

        return register.specialty.toLowerCase().includes(sanitizedCriteria) || availableTableUsers.some(user => user.id === register[property]);
    })

    return filteredValues;
}

export const getFilteredAppointmentsByAllFields = (
    filterCriteria: string,
    allAppointments: AppointmentModel[],
    users: any[],
    property: string,
): AppointmentModel[] => {

    const sanitizedCriteria = filterCriteria.toLowerCase().trim();

    if (!sanitizedCriteria.length) {
        return allAppointments;
    }
    const availableUsers = users.map(u => (
        {
            ...u,
            filterFullname: u.firstName + ' ' + u.lastName
        }
    ));

    const filteredValues = allAppointments.filter((register: any) => {
        const availableTableUsers = availableUsers.filter(s => s.filterFullname.toLowerCase().includes(sanitizedCriteria));

        return register?.specialty.toLowerCase().includes(sanitizedCriteria) ||
            register.day.toLowerCase().includes(sanitizedCriteria) ||
            register.status.toLowerCase().includes(sanitizedCriteria) ||
            register.time.toLowerCase().includes(sanitizedCriteria) ||
            register?.reason.toLowerCase().includes(sanitizedCriteria) ||
            register?.relatedParentHistory?.height.toString().includes(sanitizedCriteria) ||
            register?.relatedParentHistory?.weight.toString().includes(sanitizedCriteria) ||
            register?.relatedParentHistory?.pressure.toString().includes(sanitizedCriteria) ||
            register?.relatedParentHistory?.temperature.toString().includes(sanitizedCriteria) ||
            register?.relatedParentHistory?.customProperties?.some((v) => v.value.includes(sanitizedCriteria)) ||
            register?.relatedParentHistory?.customProperties?.some((v) => v.key.includes(sanitizedCriteria))
            || availableTableUsers.some(user => user.id === register.patientId)
            || availableTableUsers.some(user => user.id === register.specialistId);
    });

    return filteredValues;
}
