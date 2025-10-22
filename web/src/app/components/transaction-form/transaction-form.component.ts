import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

import { TransactionsService } from '../../services/transactions.service';
import { ProductsService } from '../../services/products.service';
import {
  TransactionType,
  TransactionUpsertDto,
  TransactionListItem,
} from '../../models/transaction';
import { of, map } from 'rxjs';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
  ],
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.scss'],
})
export class TransactionFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snack = inject(MatSnackBar);
  private tx = inject(TransactionsService);
  private products = inject(ProductsService);

  productsList: Array<{ id:number; name:string; stock:number }> = [];


  id = Number(this.route.snapshot.paramMap.get('id')) || 0;

  TransactionType = TransactionType;

  form = this.fb.group(
    {
      type: [TransactionType.Purchase as number | null, Validators.required],
      productId: [
        null as number | null,
        [Validators.required, Validators.min(1)],
      ],
      quantity: [1 as number | null, [Validators.required, Validators.min(1)]],
      unitPrice: [
        0 as number | null,
        [Validators.required, Validators.min(0.01)],
      ],
      detail: ['' as string | null],
      date: [null as string | null],
    },
    { asyncValidators: this.stockValidator.bind(this) }
  );

  stockValidator(ctrl: AbstractControl) {
    const v = ctrl.value as {
      productId?: number;
      quantity?: number;
      type?: number;
    };
    const pid = v?.productId,
      qty = v?.quantity,
      type = v?.type;

    const qtyCtrl = ctrl.get('quantity');

    const clearExceeds = () => {
      if (!qtyCtrl) return;
      if (qtyCtrl.hasError('exceedsStock')) {
        const e = { ...(qtyCtrl.errors || {}) };
        delete e['exceedsStock'];
        qtyCtrl.setErrors(Object.keys(e).length ? e : null);
      }
    };

    if (!pid || !qty || type !== TransactionType.Sale) {
      clearExceeds();
      return of(null);
    }

    return this.products.getById(pid).pipe(
      map((p) => {
        const available = p?.stock ?? 0;
        if (qty > available) {
          const e = {
            ...(qtyCtrl?.errors || {}),
            exceedsStock: { available, requested: qty },
          };
          qtyCtrl?.setErrors(e);

          return { exceedsStock: true };
        } else {
          clearExceeds();
          return null;
        }
      })
    );
  }

  constructor() {
    if (this.id) {
      this.tx.getById(this.id).subscribe((t: TransactionListItem) => {
        this.form.patchValue({
          type: t.type,
          productId: t.productId,
          quantity: t.quantity,
          unitPrice: t.unitPrice,
          detail: t.detail ?? '',
          date: t.date,
        });
      });
    }

    this.products.getAll().subscribe((list) => (this.productsList = list));
  }

  save() {
    const v = this.form.value;
    const dto: TransactionUpsertDto = {
      type: Number(v.type!) as TransactionType,
      productId: Number(v.productId!),
      quantity: Number(v.quantity!),
      unitPrice: Number(v.unitPrice!),
      detail: v.detail?.trim() || undefined,
      date: v.date || undefined,
    };

    const obs = this.id ? this.tx.update(this.id, dto) : this.tx.create(dto);
    obs.subscribe({
      next: () => {
        this.snack.open('Guardado');
        this.router.navigate(['/transactions']);
      },
    });
  }

  cancel() {
    this.router.navigate(['/transactions']);
  }
}
