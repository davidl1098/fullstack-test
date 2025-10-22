import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ProductsService } from '../../services/products.service';
import { Product } from '../../models/product';
import { PagedResult } from '../../models/pagination';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { debounceTime, switchMap } from 'rxjs/operators';
import { merge, startWith } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductTransactionsDialogComponent } from '../product-transactions-modal/product-transactions-modal.component';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
  ],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss'],
})
export class ProductsListComponent implements OnInit {
  private api = inject(ProductsService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  rows: Product[] = [];
  total = 0;
  cols = ['id', 'name', 'category', 'price', 'stock','image', 'actions'];
  q = new FormControl<string>('', { nonNullable: true });

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    merge(
      this.q.valueChanges.pipe(debounceTime(300), startWith('')),
      this.sort.sortChange,
      this.paginator.page
    )
      .pipe(
        startWith({}),
        switchMap(() => {
          const page = {
            page: this.paginator?.pageIndex ?? 0,
            size: this.paginator?.pageSize ?? 10,
            sort: this.sort?.active
              ? `${this.sort.active},${this.sort.direction || 'asc'}`
              : undefined,
          };
          const query = { name: this.q.value, category: this.q.value };
          return this.api.search(query, page);
        })
      )
      .subscribe((res: PagedResult<Product>) => {
        this.rows = res.items;
        this.total = res.total;
      });
  }

  goNew() {
    this.router.navigate(['/products/new']);
  }
  remove(id: number) {
    if (confirm('¿Eliminar producto?'))
      this.api.delete(id).subscribe(() => location.reload());
  }

  openHistory(row: Product) {                    
    this.dialog.open(ProductTransactionsDialogComponent, {
      data: { productId: row.id, productName: row.name },
      width: '1000px',
      maxWidth: '95vw'
    });
  }
}
