/// <reference types="jasmine" />
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UnitTests } from './unit-tests';
import { UnitTest } from '../models/unit-tests.model';

describe('UnitTests service', () => {
  let service: UnitTests;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UnitTests],
    });

    service = TestBed.inject(UnitTests);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should list all tests', () => {
    const mock: UnitTest[] = [
      { id: 1, title: 'A', description: 'd1', createdAt: new Date().toISOString() },
      { id: 2, title: 'B', createdAt: new Date().toISOString() },
    ];

    service.getAll().subscribe((res) => {
      expect(res.length).toBe(2);
      expect(res[0].title).toBe('A');
    });

    const req = httpMock.expectOne('/api/tests');
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('should get by id', () => {
    const mock: UnitTest = { id: 7, title: 'Seven', createdAt: new Date().toISOString() };

    service.get(7).subscribe((res) => {
      expect(res.id).toBe(7);
    });

    const req = httpMock.expectOne('/api/tests/7');
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('should create', () => {
    const payload: Omit<UnitTest, 'id'> = { title: 'New', description: 'desc', createdAt: new Date().toISOString() };
    const created: UnitTest = { id: 3, ...payload } as UnitTest;

    service.create(payload).subscribe((res) => {
      expect(res.id).toBe(3);
      expect(res.title).toBe('New');
    });

    const req = httpMock.expectOne('/api/tests');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.title).toBe('New');
    req.flush(created);
  });

  it('should update', () => {
    const patch: Partial<UnitTest> = { description: 'updated' };
    const updated: UnitTest = { id: 3, title: 'New', description: 'updated', createdAt: new Date().toISOString() };

    service.update(3, patch).subscribe((res) => {
      expect(res.description).toBe('updated');
    });

    const req = httpMock.expectOne('/api/tests/3');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.description).toBe('updated');
    req.flush(updated);
  });

  it('should delete', () => {
    service.delete(9).subscribe((res) => {
      expect(res).toBeNull();
    });

    const req = httpMock.expectOne('/api/tests/9');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
