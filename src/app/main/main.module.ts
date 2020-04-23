import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main.component';
import { MainRoutingModule } from './main-routing.module';
import {EditorModule} from '../editor/editor.module';

@NgModule({
  imports: [CommonModule, MainRoutingModule, EditorModule],
  exports: [],
  declarations: [MainComponent],
})
export class MainModule {}
