import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { UserNavbar } from './user-navbar';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Loggin } from '../../loggin/loggin';

describe('UserNavbar', () => {
  let component: UserNavbar;
  let fixture: ComponentFixture<UserNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserNavbar, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(UserNavbar);
    component = fixture.componentInstance;
    fixture.detectChanges(); // renderiza el template
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
