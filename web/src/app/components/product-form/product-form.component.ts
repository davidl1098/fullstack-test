import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductsService } from '../../services/products.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SnackService } from '../../services/snack.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
})
export class ProductFormComponent {
  private fb = inject(FormBuilder);
  private api = inject(ProductsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snack = inject(SnackService);

  selectedFile?: File;
  previewUrl?: string | null;

  id = Number(this.route.snapshot.paramMap.get('id') ?? 0) || null;

  form = this.fb.group({
    name: ['', Validators.required],
    category: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    description: [''],
    imageUrl: [''],
    rowVersion: ['']
  });

  constructor() {
    if (this.id) {
      if (this.id) {
        this.api.getById(this.id).subscribe((p) => {
          this.form.patchValue({
            name: p.name,
            category: p.category,
            price: p.price,
            stock: p.stock,
            description: p.description ?? '',
            imageUrl: p.imageUrl ?? '',
            rowVersion: p.rowVersion ?? '', 
          });
        });
      }
    }
  }

  onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const f = input.files?.[0];
    if (!f) return;
    this.selectedFile = f;

    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = reader.result as string);
    reader.readAsDataURL(f);
  }

  save() {
    const dto = this.form.value as any;
    const obs = this.id ? this.api.update(this.id!, dto) : this.api.create(dto);

    obs.subscribe({
      next: (p: { id: number }) => {
        if (this.selectedFile) {
          this.api.uploadImage(p.id, this.selectedFile).subscribe({
            next: () => {
              this.snack.ok('Guardado');
              this.router.navigate(['/products']);
            },
            error: () => {
              this.snack.ok?.('Producto guardado, pero falló la imagen.');
              this.router.navigate(['/products']);
            },
          });
        } else {
          this.snack.ok('Guardado');
          this.router.navigate(['/products']);
        }
      },
      error: () => this.snack.error?.('Error guardando'),
    });
  }
  cancel() {
    this.router.navigate(['/products']);
  }
}
