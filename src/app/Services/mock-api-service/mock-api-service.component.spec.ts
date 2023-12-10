import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockApiServiceComponent } from './mock-api-service.component';

describe('MockApiServiceComponent', () => {
  let component: MockApiServiceComponent;
  let fixture: ComponentFixture<MockApiServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MockApiServiceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MockApiServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
