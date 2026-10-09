import { Component, EventEmitter, Input, Output } from '@angular/core';

/** Slider that sets the `delay` query parameter sent to the API. */
@Component({
  selector: 'gh-delay-control',
  template: `
    <label class="delay">
      <span>{{ label }}</span>
      <input type="range" min="0" max="5000" step="250" [value]="value"
             (input)="valueChange.emit(+$any($event.target).value)">
      <b>{{ value | timing }}</b>
    </label>`
})
export class DelayControlComponent {
  @Input() label = 'Server delay';
  @Input() value = 0;
  @Output() valueChange = new EventEmitter<number>();
}
