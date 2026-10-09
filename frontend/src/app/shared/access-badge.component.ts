import { Component, Input } from '@angular/core';

/** Shows an access tier as a row of keys: one = public, two = general, three = admin. */
@Component({
  selector: 'gh-access-badge',
  template: `<span class="tier" [ngClass]="level" [title]="'Visible to: ' + audience">
    <i *ngFor="let k of keys"></i>{{ level }}</span>`
})
export class AccessBadgeComponent {
  @Input() level: 'public' | 'general' | 'admin' = 'public';
  get keys(): number[] { return Array(this.level === 'public' ? 1 : this.level === 'general' ? 2 : 3).fill(0); }
  get audience(): string { return this.level === 'admin' ? 'admins only' : this.level === 'general' ? 'signed-in users' : 'everyone'; }
}
