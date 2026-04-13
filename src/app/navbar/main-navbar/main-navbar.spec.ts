import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainNavbar } from './main-navbar';
import { RouterLink, ActivatedRoute } from '@angular/router';

describe('MainNavbar', () => {
  let component: MainNavbar;
  let fixture: ComponentFixture<MainNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainNavbar, RouterLink],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: new Map() } }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MainNavbar);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});