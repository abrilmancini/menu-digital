import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickNav } from './quick-nav';

describe('QuickNav', () => {
  let component: QuickNav;
  let fixture: ComponentFixture<QuickNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickNav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
