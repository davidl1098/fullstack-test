import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class SnackService {
  constructor(private snack: MatSnackBar) {}
  ok(msg: string)    { this.snack.open(msg, 'OK',     { duration: 3000 }); }
  error(msg: string) { this.snack.open(msg, 'Cerrar', { duration: 5000 }); }
}
