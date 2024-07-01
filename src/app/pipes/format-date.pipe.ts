import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'formatDate',
  standalone: true,
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string): string {
    return moment(value, 'YYYY/MM/DD').format('DD/MM');
  }
}
