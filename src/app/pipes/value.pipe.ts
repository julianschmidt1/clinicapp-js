import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'valueOrNull',
  standalone: true,
})
export class ValueOrNull implements PipeTransform {
  transform(value: any): any {
    return value ? value : 'N/A';
  }
}
