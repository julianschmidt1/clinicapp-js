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