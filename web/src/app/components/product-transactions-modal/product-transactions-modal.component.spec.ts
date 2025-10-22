import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTransactionsModalComponent } from './product-transactions-modal.component';

describe('ProductTransactionsModalComponent', () => {
  let component: ProductTransactionsModalComponent;
  let fixture: ComponentFixture<ProductTransactionsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductTransactionsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductTransactionsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
