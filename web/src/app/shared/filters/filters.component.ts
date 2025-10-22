import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
})
export class FiltersComponent {
  @Output() change = new EventEmitter<any>();
  @Input() fixedProductId?: number;

  private fb = new FormBuilder();
  form = this.fb.group({
    productId: this.fb.control<number | null>(null),
    type:      this.fb.control<number | ''>(''),  
    dateFrom:  this.fb.control<Date | null>(null),
    dateTo:    this.fb.control<Date | null>(null),
  });

  ngOnInit(): void {
    if (this.fixedProductId != null) {
      this.form.patchValue({ productId: this.fixedProductId });
      this.form.get('productId')?.disable();
    }
  }

  apply() {
    const v = this.form.getRawValue();
    const toIso = (d: any) => (d ? new Date(d).toISOString() : '');
    this.change.emit({
      productId: v.productId ?? undefined,
      type: v.type === '' ? undefined : v.type,
      from: toIso(v.dateFrom),
      to: toIso(v.dateTo),
    });
  }

  clear() {
    const pid = this.fixedProductId;
    this.form.reset({
      productId: pid ?? null,
      type: '',
      dateFrom: null,
      dateTo: null,
    });
    if (pid != null) this.form.get('productId')?.disable();
    this.change.emit({ productId: pid });
  }
}
