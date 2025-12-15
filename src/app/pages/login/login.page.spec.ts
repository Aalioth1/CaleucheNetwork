import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPage } from './login.page';
import { provideLottieOptions } from 'ngx-lottie';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideLottieOptions({ player: () => import('lottie-web') })
      ]
    });

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
