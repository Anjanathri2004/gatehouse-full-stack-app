import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'timing' })
export class TimingPipe implements PipeTransform {
  transform(ms?: number): string {
    if (ms === undefined) { return ''; }
    return ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${ms} ms`;
  }
}
