import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalVideoPreviewComponent } from './local-video-preview.component';

describe('LocalVideoPreviewComponent', () => {
  let component: LocalVideoPreviewComponent;
  let fixture: ComponentFixture<LocalVideoPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocalVideoPreviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalVideoPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
