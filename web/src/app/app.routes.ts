import { Routes } from '@angular/router';

import { ProductsListComponent }     from './components/products-list/products-list.component';
import { ProductFormComponent }      from './components/product-form/product-form.component';
import { TransactionsListComponent } from './components/transactions-list/transactions-list.component';
import { TransactionFormComponent }  from './components/transaction-form/transaction-form.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'products' },

  { path: 'products', component: ProductsListComponent },
  { path: 'products/new', component: ProductFormComponent },
  { path: 'products/:id/edit', component: ProductFormComponent },

  { path: 'transactions', component: TransactionsListComponent },
  { path: 'transactions/new', component: TransactionFormComponent },
  { path: 'transactions/:id/edit', component: TransactionFormComponent },

  { path: '**', redirectTo: 'products' }
];
