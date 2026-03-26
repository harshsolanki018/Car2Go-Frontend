import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'secureUrl',
  standalone: true,
})
export class SecureUrlPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      if (trimmed.startsWith('http://')) {
        return `https://${trimmed.slice(7)}`;
      }
    }
    return trimmed;
  }
}
