import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment.development';

import { PagedResult } from '../models/pagination';
import {
  TransactionListItem,
  TransactionType,
  TransactionUpsertDto,
} from '../models/transaction';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private base = environment.api.transactions;
  constructor(private http: HttpClient) {}

  search(
    filters: {
      productId?: number;
      type?: TransactionType;
      from?: string;
      to?: string;
    },
    page?: { page?: number; pageSize?: number; sort?: string }
  ): Observable<PagedResult<TransactionListItem>> {
    let params = new HttpParams();

    if (page?.page != null)
      params = params.set('page', String((page.page || 0) + 1));
    if (page?.pageSize != null)
      params = params.set('pageSize', String(page.pageSize));
    if (page?.sort) params = params.set('sort', page.sort);

    Object.entries(filters || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '')
        params = params.set(k, String(v));
    });

    return this.http.get<PagedResult<TransactionListItem>>(this.base, {
      params,
    });
  }

  getById(id: number) {
    return this.http.get<TransactionListItem>(`${this.base}/${id}`);
  }

  create(dto: TransactionUpsertDto) {
    return this.http.post<TransactionListItem>(this.base, dto);
  }

  update(id: number, dto: TransactionUpsertDto) {
    return this.http.put<TransactionListItem>(`${this.base}/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
