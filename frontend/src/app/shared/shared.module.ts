import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AccessBadgeComponent } from './access-badge.component';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { DelayControlComponent } from './delay-control.component';
import { MaterialModule } from './material.module';
import { TimingPipe } from './timing.pipe';

const PIECES = [AccessBadgeComponent, DelayControlComponent, ConfirmDialogComponent, TimingPipe];

@NgModule({
  declarations: PIECES,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  exports: [CommonModule, ReactiveFormsModule, MaterialModule, ...PIECES]
})
export class SharedModule {}
