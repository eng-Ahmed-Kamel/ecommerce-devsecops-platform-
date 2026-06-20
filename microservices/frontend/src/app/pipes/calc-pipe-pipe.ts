import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'calc',
  standalone: true
})
export class CalcPipe implements PipeTransform {

  transform(
    value: number,
    rate: number = 1,
    currency: string = 'EGP',
    locale: string = 'en-EG'
  ): string {

    const calculatedValue = value * rate;

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(calculatedValue);
  }

}