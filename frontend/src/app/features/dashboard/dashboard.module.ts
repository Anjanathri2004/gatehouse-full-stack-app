import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { DashboardComponent } from './dashboard.component';
import { RecordsTableComponent } from './records-table.component';

@NgModule({
  declarations: [DashboardComponent, RecordsTableComponent],
  imports: [SharedModule, RouterModule.forChild([{ path: '', component: DashboardComponent }])]
})
export class DashboardModule {}
