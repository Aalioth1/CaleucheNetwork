import { TestBed } from '@angular/core/testing';
import { ProfilePage } from './profile.page';
import { SqliteServices } from '../../services/sqlite-services';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';

describe('ProfilePage', () => {
  let sqliteStub: { getCurrentUser: jasmine.Spy; updateCurrentUser: jasmine.Spy };
  let routerStub: { navigate: jasmine.Spy };
  let toastStub: { create: jasmine.Spy };

  beforeEach(() => {
    sqliteStub = {
      getCurrentUser: jasmine.createSpy('getCurrentUser').and.resolveTo({
        username: 'u', email: 'e', password: 'p', gender: 'm', age: 25, image: null
      }),
      updateCurrentUser: jasmine.createSpy('updateCurrentUser').and.resolveTo(true),
    } as any;
    routerStub = { navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)) } as any;
    toastStub = {
      create: jasmine.createSpy('create').and.callFake(async () => ({ present: async () => {} }))
    } as any;

    TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        { provide: SqliteServices, useValue: sqliteStub },
        { provide: Router, useValue: routerStub },
        { provide: ToastController, useValue: toastStub },
      ],
    });
  });

  it('actualiza datos al salir de modo edición', async () => {
    const fixture = TestBed.createComponent(ProfilePage);
    const component = fixture.componentInstance;

    await component.ionViewWillEnter();

    // Entrar a modo edición y cambiar valores
    component.isEditing = true;
    component.username = 'nuevo';
    component.email = 'nuevo@example.com';
    component.password = 'pass';
    component.gender = 'f';
    component.age = 30;

    await component.toggleEdit(); // esto debe guardar y salir de edición

    expect(sqliteStub.updateCurrentUser).toHaveBeenCalled();
    expect(component.isEditing).toBeFalse();
  });
});
