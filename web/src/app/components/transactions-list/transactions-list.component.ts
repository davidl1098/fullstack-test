import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TransactionsService } from '../../services/transactions.service';
import { PagedResult } from '../../models/pagination';
import { TransactionListItem, TransactionType } from '../../models/transaction';
import { FiltersComponent } from '../../shared/filters/filters.component';

import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Subject, merge } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-transactions-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FiltersComponent,
    MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatButtonModule, MatIconModule
  ],
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.scss']
})
export class TransactionsListComponent {
  private api = inject(TransactionsService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  deleting = new Set<number>();

  rows: TransactionListItem[] = [];
  total = 0;
  cols = ['id','date','type','productId','quantity','unitPrice','total','actions'];

  filters: { productId?: number; type?: TransactionType; from?: string; to?: string } = {};
  private refresh$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit(): void {
    merge(this.sort.sortChange, this.paginator.page, this.refresh$)
      .pipe(
        startWith({}),
        switchMap(() => {
          const page = {
            page: this.paginator?.pageIndex ?? 0,
            pageSize: this.paginator?.pageSize ?? 10,
            sort: this.sort?.active ? `${this.sort.active},${this.sort.direction || 'asc'}` : undefined
          };
          return this.api.search(this.filters, page);
        })
      )
      .subscribe((res: PagedResult<TransactionListItem>) => {
        this.rows = res.items;
        this.total = res.total;
      });
  }

  onFilters(f: any){
    
    this.filters = {
      productId: f.productId,
      type: f.type,
      from: f.from ?? f.dateFrom,
      to:   f.to   ?? f.dateTo
    };
    this.paginator.firstPage();
    this.refresh$.next();
  }

  goNew(){ this.router.navigate(['/transactions/new']); }

  delete(id: number) {
    if (!confirm('¿Eliminar esta transacción?')) return;

    this.deleting.add(id);
    this.api.delete(id).subscribe({
      next: () => {
        this.snack.open('Transacción eliminada', undefined, { duration: 2000 });
        this.deleting.delete(id);
        this.refresh$.next();         
      },
      error: (err) => {
        const msg = err?.error || err?.message || 'No se pudo eliminar';
        this.snack.open(msg, undefined, { duration: 3000 });
        this.deleting.delete(id);
      }
    });
  }
}
