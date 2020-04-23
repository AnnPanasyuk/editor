import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  public form: FormGroup;
  public maxSymbolsSize = 8000;
  public isCleanEditor = false;

  constructor() { }

  public ngOnInit(): void {
    this.form = new FormGroup({
      body: new FormControl(''),
    });
  }

  public onPostTextareaKeyup(e): void {
    //
  }

  public onInputFocus(): void {
    //
  }

  public checkSpecialTextType(e): void {
    //
  }
}
