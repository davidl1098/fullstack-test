import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment.development';
import { Product } from '../models/product';
import { PagedResult } from '../models/pagination';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private base = environment.api.products;
  constructor(private http: HttpClient) {}

  search(
    filter: { search?: string; category?: string },
    page: { page?: number; size?: number; sort?: string }
  ): Observable<PagedResult<Product>> {
    let params = new HttpParams();
    if (filter?.search) params = params.set('search', filter.search);
    if (filter?.category) params = params.set('category', filter.category);
    if (page?.page != null)
      params = params.set('page', String((page.page || 0) + 1));
    if (page?.size) params = params.set('pageSize', String(page.size));
    if (page?.sort) params = params.set('sort', page.sort);
    return this.http.get<PagedResult<Product>>(this.base, { params });
  }

  getById(id: number) {
    return this.http.get<Product>(`${this.base}/${id}`);
  }
  create(dto: Partial<Product>) {
    return this.http.post<Product>(this.base, dto);
  }
  update(id: number, dto: Partial<Product>) {
    return this.http.put<Product>(`${this.base}/${id}`, dto);
  }
  delete(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }
  getAll() {
    return this.http.get<Product[]>(`${this.base}/all`);
  }
  uploadImage(id: number, file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ imageUrl: string }>(
      `${this.base}/${id}/image`,
      form
    );
  }
}
