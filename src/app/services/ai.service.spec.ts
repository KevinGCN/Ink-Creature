import { TestBed } from '@angular/core/testing';

<<<<<<<< HEAD:src/app/services/ai.service.spec.ts
import { AiService } from './ai.service';

describe('AiService', () => {
  let service: AiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiService);
========
import { AuthService } from './auth';

describe('Auth', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
>>>>>>>> 774f5dc6e6faaefbbef24326dcb9842cc57fdcfe:src/app/services/auth.spec.ts
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
