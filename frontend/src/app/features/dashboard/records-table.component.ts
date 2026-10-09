import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RecordItem } from '../../core/models/models';

const TIER_ORDER = { public: 1, general: 2, admin: 3 };

/** Sortable, filterable, paginated records table (Angular Material). */
@Component({ selector: 'gh-records-table', templateUrl: './records-table.component.html' })
export class RecordsTableComponent implements OnChanges {
  @Input() items: RecordItem[] = [];
  @Input() filter = '';

  readonly columns = ['id', 'title', 'category', 'owner', 'status', 'access', 'updatedAt'];
  readonly dataSource = new MatTableDataSource<RecordItem>([]);

  // Setters wire sort/paginator as soon as the view creates them.
  @ViewChild(MatSort) set sort(s: MatSort) { this.dataSource.sort = s; }
  @ViewChild(MatPaginator) set paginator(p: MatPaginator) { this.dataSource.paginator = p; }

  constructor() {
    this.dataSource.sortingDataAccessor = (r, col) =>
      col === 'access' ? TIER_ORDER[r.access] : (r as unknown as Record<string, string | number>)[col];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.items) { this.dataSource.data = this.items; }
    this.dataSource.filter = (this.filter || '').trim().toLowerCase();
  }

  statusClass(status: string): string { return status === 'In review' ? 'review' : status.toLowerCase(); }
}
