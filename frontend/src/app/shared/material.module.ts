import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

const MODULES = [
  MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatPaginatorModule,
  MatProgressSpinnerModule, MatSelectModule, MatSnackBarModule, MatSortModule, MatTableModule, MatTooltipModule
];

/** One place that lists every Angular Material module the app uses. */
@NgModule({ imports: MODULES, exports: MODULES })
export class MaterialModule {}
