import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallePedidoAdmin } from './detalle-pedido-admin';

describe('DetallePedidoAdmin', () => {
  let component: DetallePedidoAdmin;
  let fixture: ComponentFixture<DetallePedidoAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallePedidoAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallePedidoAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
