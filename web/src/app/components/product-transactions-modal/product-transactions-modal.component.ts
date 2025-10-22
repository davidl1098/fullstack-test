import { Component, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { FiltersComponent } from '../../shared/filters/filters.component';
import { TransactionsService } from '../../services/transactions.service';
import { TransactionListItem } from '../../models/transaction';
import { PagedResult } from '../../models/pagination';

import { Subject, merge } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-product-transactions-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatButtonModule, MatIconModule,
    FiltersComponent
  ],
  templateUrl: './product-transactions-modal.component.html',
  styleUrls: ['./product-transactions-modal.component.scss']
})
export class ProductTransactionsDialogComponent {
  rows: TransactionListItem[] = [];
  total = 0;
  cols = ['date','type','quantity','unitPrice','total'];

  filters: { productId?: number; type?: number; from?: string; to?: string } = {};

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private refresh$ = new Subject<void>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { productId: number; productName?: string },
    private tx: TransactionsService,
    public ref: MatDialogRef<ProductTransactionsDialogComponent>
  ) {
    this.filters = { productId: data.productId };
  }

  ngAfterViewInit() {
    merge(this.sort?.sortChange ?? this.refresh$, this.paginator?.page ?? this.refresh$, this.refresh$)
      .pipe(
        startWith({}),
        switchMap(() => {
          const page = {
            page: this.paginator?.pageIndex ?? 0,
            pageSize: this.paginator?.pageSize ?? 10,
            sort: this.sort?.active ? `${this.sort.active},${this.sort.direction || 'asc'}` : undefined
          };
          return this.tx.search(this.filters, page);
        })
      )
      .subscribe((res: PagedResult<TransactionListItem>) => {
        this.rows = res.items;
        this.total = res.total;
      });
  }

  onFilters(f: any) {
    this.filters = { productId: this.data.productId, type: f.type, from: f.from, to: f.to };
    this.paginator.firstPage();
    this.refresh$.next();
  }
}
