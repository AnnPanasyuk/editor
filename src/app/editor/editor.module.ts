import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorComponent } from './editor.component';
import { EditorCompositeComponent } from './editor-composite/editor-composite.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [EditorComponent, EditorCompositeComponent],
  declarations: [EditorComponent, EditorCompositeComponent],
})
export class EditorModule {}
