import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { SqliteServices } from '../services/sqlite-services';

describe('authGuard', () => {
  let routerStub: { navigate: jasmine.Spy };
  let sqliteStub: { getCurrentUser: jasmine.Spy };

  beforeEach(() => {
    routerStub = { navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)) };
    sqliteStub = { getCurrentUser: jasmine.createSpy('getCurrentUser') } as any;

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerStub },
        { provide: SqliteServices, useValue: sqliteStub },
      ],
    });
  });

  it('redirige a /login cuando no hay usuario', async () => {
    sqliteStub.getCurrentUser.and.resolveTo(null);

    const result = await TestBed.runInInjectionContext(() => authGuard({} as any, { url: '/home' } as any));
    expect(result).toBeFalse();
    // setTimeout en guard, así que usamos tick/flushMicrotasks no disponible aquí; verificamos que se llamó navigate
    // Forzamos cola de macrotasks
    await new Promise((r) => setTimeout(r, 0));
    expect(routerStub.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('permite navegación cuando hay usuario', async () => {
    sqliteStub.getCurrentUser.and.resolveTo({ username: 'u' });

    const result = await TestBed.runInInjectionContext(() => authGuard({} as any, { url: '/home' } as any));
    expect(result).toBeTrue();
    expect(routerStub.navigate).not.toHaveBeenCalled();
  });
});
