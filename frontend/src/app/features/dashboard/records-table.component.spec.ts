import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RecordItem } from '../../core/models/models';
import { SharedModule } from '../../shared/shared.module';
import { RecordsTableComponent } from './records-table.component';

const items: RecordItem[] = Array.from({ length: 7 }, (_, i) => ({
  id: 1000 + i, title: i === 2 ? 'Vendor finance review' : `Record ${i}`, category: i === 2 ? 'Finance' : 'Ops',
  owner: 'john', status: 'Open' as const, access: i % 2 ? 'general' as const : 'public' as const, updatedAt: `2026-09-0${i + 1}T00:00:00Z`
}));

describe('RecordsTableComponent', () => {
  let fixture: ComponentFixture<RecordsTableComponent>;
  let component: RecordsTableComponent;
  const rows = () => fixture.nativeElement.querySelectorAll('tr.mat-row[mat-row], tr[mat-row]').length;

  async function render(filter = ''): Promise<void> {
    component.items = items;
    component.filter = filter;
    component.ngOnChanges({ items: new SimpleChange([], items, true) });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecordsTableComponent],
      imports: [SharedModule, NoopAnimationsModule]
    }).compileComponents();
    fixture = TestBed.createComponent(RecordsTableComponent);
    component = fixture.componentInstance;
  });

  it('paginates: only the first 5 of 7 records are on page one', async () => {
    await render();
    expect(rows()).toBe(5);
  });

  it('filters across columns', async () => {
    await render('finance');
    expect(rows()).toBe(1);
  });

  it('shows the empty message when nothing matches', async () => {
    await render('zzzz');
    expect(fixture.nativeElement.textContent).toContain('No records match that filter.');
  });

  it('sorts by access tier using tier order', () => {
    const acc = component.dataSource.sortingDataAccessor;
    expect(acc({ ...items[0], access: 'public' }, 'access')).toBe(1);
    expect(acc({ ...items[0], access: 'general' }, 'access')).toBe(2);
    expect(acc({ ...items[0], access: 'admin' }, 'access')).toBe(3);
  });
});
