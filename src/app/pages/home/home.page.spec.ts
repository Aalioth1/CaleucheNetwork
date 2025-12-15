import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    // Evitar dependencias de localStorage al crear el componente
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(localStorage, 'setItem').and.stub();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('vote logic', () => {
    let unit: HomePage;
    beforeEach(() => {
      unit = TestBed.runInInjectionContext(() => new HomePage());
      unit.items = [{ id: 1, image: '', title: 't1', content: 'c1', date: new Date().toISOString(), votes: 0, userVotes: {}, comments: [] }];
      (unit as any).sortPosts();
    });

    it('debe permitir un solo voto por usuario y cancelar si repite', () => {
      unit.vote(1, +1);
      expect(unit.items[0].votes).toBe(1);
      expect(unit.getUserVote(1)).toBe(1);

      unit.vote(1, +1);
      expect(unit.items[0].votes).toBe(0);
      expect(unit.getUserVote(1)).toBe(0);
    });

    it('debe cambiar voto de +1 a -1 actualizando el conteo', () => {
      unit.vote(1, +1);
      expect(unit.items[0].votes).toBe(1);
      expect(unit.getUserVote(1)).toBe(1);

      unit.vote(1, -1);
      expect(unit.items[0].votes).toBe(-1);
      expect(unit.getUserVote(1)).toBe(-1);
    });
  });
});
