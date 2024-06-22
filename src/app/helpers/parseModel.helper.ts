import { ScheduleModel } from "../pages/profile/profile.component";

export const groupAndSortSchedule = (array: ScheduleModel[] = []) => {
    let result = {};

    array.forEach(({ day, time }) => {

      if (result[day]) {
        result[day] = [
          ...result[day],
          { day, time }
        ].sort((a, b) => new Date(`2000-01-01T${a.time}`).getTime() - new Date(`2000-01-01T${b.time}`).getTime());

      } else {
        result[day] = [{ day, time }];
      }
    })

    const sortedDays = Object.entries(result).sort((a, b) => {
      const [dayA] = a;
      const [dayB] = b;

      return new Date(dayA).getDate() - new Date(dayB).getDate() 
    })

    return sortedDays;
  }