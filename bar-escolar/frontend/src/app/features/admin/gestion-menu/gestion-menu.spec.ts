import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionMenu } from './gestion-menu';

describe('GestionMenu', () => {
  let component: GestionMenu;
  let fixture: ComponentFixture<GestionMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
