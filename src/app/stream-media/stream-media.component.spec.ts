import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamMediaComponent } from './stream-media.component';

describe('StreamMediaComponent', () => {
  let component: StreamMediaComponent;
  let fixture: ComponentFixture<StreamMediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StreamMediaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StreamMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
