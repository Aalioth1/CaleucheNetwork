import { TestBed } from '@angular/core/testing';
import { SignupPage } from './signup.page';
import { SqliteServices } from '../../services/sqlite-services';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';

describe('SignupPage', () => {
  let sqliteStub: { register: jasmine.Spy };
  let routerStub: { navigate: jasmine.Spy };
  let toastStub: { create: jasmine.Spy };

  beforeEach(() => {
    sqliteStub = { register: jasmine.createSpy('register') } as any;
    routerStub = { navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)) } as any;
    toastStub = {
      create: jasmine.createSpy('create').and.callFake(async () => ({ present: async () => {} }))
    } as any;

    TestBed.configureTestingModule({
      imports: [SignupPage],
      providers: [
        { provide: SqliteServices, useValue: sqliteStub },
        { provide: Router, useValue: routerStub },
        { provide: ToastController, useValue: toastStub },
      ],
    });
  });

  it('registra usuario válido y navega a /login', async () => {
    const fixture = TestBed.createComponent(SignupPage);
    const component = fixture.componentInstance;

    // Form válido
    component.form.setValue({
      username: 'usuario123',
      email: 'user@example.com',
      password: 'Aa12345678!!',
      gender: 'm',
      age: 20,
      imageFile: null,
    });

    sqliteStub.register.and.resolveTo(true);

    await component.register();

    expect(sqliteStub.register).toHaveBeenCalled();
    expect(routerStub.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
  });
});
