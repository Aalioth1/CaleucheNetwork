import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LoaderOverlayComponent } from './loader-overlay.component';

describe('LoaderOverlayComponent', () => {
  let component: LoaderOverlayComponent;
  let fixture: ComponentFixture<LoaderOverlayComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [LoaderOverlayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoaderOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
