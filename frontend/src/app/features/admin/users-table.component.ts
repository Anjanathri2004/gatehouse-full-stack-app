import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { User } from '../../core/models/models';

/** Presentational table: it only renders users and emits what the admin clicked. */
@Component({ selector: 'gh-users-table', templateUrl: './users-table.component.html' })
export class UsersTableComponent implements OnChanges {
  @Input() users: User[] = [];
  @Input() busyUser: string | null = null;
  @Input() currentUserId = '';
  @Output() edit = new EventEmitter<User>();
  @Output() toggle = new EventEmitter<User>();
  @Output() remove = new EventEmitter<User>();

  readonly columns = ['userId', 'name', 'email', 'department', 'role', 'active', 'actions'];
  readonly dataSource = new MatTableDataSource<User>([]);

  @ViewChild(MatSort) set sort(s: MatSort) { this.dataSource.sort = s; }
  @ViewChild(MatPaginator) set paginator(p: MatPaginator) { this.dataSource.paginator = p; }

  ngOnChanges(): void { this.dataSource.data = this.users; }
}
