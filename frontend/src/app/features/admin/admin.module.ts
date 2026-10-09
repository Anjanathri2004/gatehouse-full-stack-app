import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AdminComponent } from './admin.component';
import { UserDetailComponent } from './user-detail.component';
import { UserDetailResolver } from './user-detail.resolver';
import { UsersTableComponent } from './users-table.component';

@NgModule({
  declarations: [AdminComponent, UsersTableComponent, UserDetailComponent],
  imports: [
    SharedModule,
    RouterModule.forChild([
      { path: '', component: AdminComponent },
      { path: 'users/:userId', component: UserDetailComponent, resolve: { user: UserDetailResolver } }
    ])
  ]
})
export class AdminModule {}
