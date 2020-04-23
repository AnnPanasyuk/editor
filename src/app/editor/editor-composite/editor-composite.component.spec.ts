import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorCompositeComponent } from './editor-composite.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('EditorCompositeComponent', () => {
  let component: EditorCompositeComponent;
  let fixture: ComponentFixture<EditorCompositeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditorCompositeComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(EditorCompositeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
