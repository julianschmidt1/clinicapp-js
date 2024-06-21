import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateToDayNumber',
  standalone: true,
})
export class DateToDayNumberPipe implements PipeTransform {

  transform(value: string): string {
    const dateObj = new Date(value);
    
    if (isNaN(dateObj.getTime())) {
      return value;
    }
    const day = DAYS_OF_WEEK[dateObj.getUTCDay()];
    const dayNumber = dateObj.getUTCDate();
    const month = dateObj.getUTCMonth();
    return `${day}, ${dayNumber} de ${MONTHS_OF_YEAR[month]}`;
  }

}

const DAYS_OF_WEEK = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo'
];

const MONTHS_OF_YEAR =[
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
];