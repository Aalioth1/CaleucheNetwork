import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UnitTest } from '../models/unit-tests.model';

@Injectable({
  providedIn: 'root',
})
export class UnitTests {
  private readonly baseUrl = '/api/tests';

  constructor(private http: HttpClient) {}

  /** Listar todos */
  getAll(): Observable<UnitTest[]> {
    return this.http.get<UnitTest[]>(`${this.baseUrl}`);
  }

  /** Obtener por id */
  get(id: number): Observable<UnitTest> {
    return this.http.get<UnitTest>(`${this.baseUrl}/${id}`);
  }

  /** Crear */
  create(payload: Omit<UnitTest, 'id'>): Observable<UnitTest> {
    return this.http.post<UnitTest>(`${this.baseUrl}`, payload);
  }

  /** Actualizar */
  update(id: number, payload: Partial<UnitTest>): Observable<UnitTest> {
    return this.http.put<UnitTest>(`${this.baseUrl}/${id}`, payload);
  }

  /** Eliminar */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
