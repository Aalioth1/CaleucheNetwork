import { TestBed } from '@angular/core/testing';

import { SqliteServices } from './sqlite-services';

describe('SqliteServices', () => {
  let service: SqliteServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SqliteServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
