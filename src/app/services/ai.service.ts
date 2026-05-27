import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AiService {

  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  generateTattoo(prompt: string) {

    return this.http.post<any>(
      `${this.apiUrl}/generate-tattoo`,
      { prompt }
    );

  }

}