import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

describe('LorePage HTTP requests', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('realiza requests GET a Wikipedia para temas por defecto', () => {
    const topics = ['Caleuche', 'Pincoya'];
    
    topics.forEach((topic) => {
      const encoded = encodeURIComponent(topic.replace(/\s+/g, '_'));
      const url = `https://es.wikipedia.org/api/rest_v1/page/summary/${encoded}`;
      
      httpClient.get(url).subscribe();
      
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.flush({ title: topic, content_urls: { desktop: { page: `https://es.wikipedia.org/wiki/${encoded}` } } });
    });
  });
});
