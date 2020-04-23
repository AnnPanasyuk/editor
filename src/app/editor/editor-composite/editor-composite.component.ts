import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {ISpecialResult, ISpecialText, SpecialTextEnum} from '../special-text.interface';
import { Link } from '../special-cases/link';
import { Tag } from '../special-cases/tag';
import { Hashtag } from '../special-cases/hashtag';
import { EditorComponent } from '../editor.component';

@Component({
  selector: 'app-editor-composite',
  templateUrl: './editor-composite.component.html',
  styleUrls: ['./editor-composite.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorCompositeComponent implements OnInit {
  public get elementValue(): string {
    return this.elementEditor.elementValue;
  }

  public get element(): ElementRef {
    return this.elementEditor.element;
  }

  @Input()
  public editorFormControl: FormControl;
  @Input()
  public editorMaxLength: number = null;
  @Input()
  public height: number = null;
  @Input()
  public minHeight: number = null;
  @Input()
  public maxHeight: number = null;
  @Input()
  public isCleanState = false;
  @Input()
  public placeholder: string = null;

  @Output()
  public editorKeyup: EventEmitter<KeyboardEvent> = new EventEmitter<KeyboardEvent>();
  @Output()
  public editorKeydown: EventEmitter<KeyboardEvent> = new EventEmitter<KeyboardEvent>();
  @Output()
  public editorFocus: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>();
  @Output()
  public editorBlur: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>();
  @Output()
  public specialTextType: EventEmitter<SpecialTextEnum> = new EventEmitter<SpecialTextEnum>();

  @ViewChild('editorElement', { static: true })
  public elementEditor: EditorComponent;

  public result: ISpecialResult = null;
  public form: FormGroup = null;

  private components: ISpecialText[] = [];
  private link = new Link();

  constructor() {}

  public ngOnInit(): void {
    this.components = [this.link, new Tag(), new Hashtag()];
    this.form = new FormGroup({
      editor: new FormControl(
        this.editorFormControl && this.editorFormControl.value ? this.editorFormControl.value : '',
      ),
    });
  }

  public findSpecialTag(childNodes: NodeList): void {
    this.components.forEach((item: ISpecialText) => {
      const obj = item.find(childNodes);
      if (obj && obj.type) {
        this.result = obj;
        this.specialTextType.emit(this.result.type);
      }
    });
  }

  public onEditorKeyup(e): void {
    if (this.form && this.form.value) {
      this.editorFormControl.setValue(this.form.value.editor);
    }
    this.editorKeyup.emit(e);
    this.components.forEach((item: ISpecialText) => {
      item.isBroken();
    });
  }

  public specialTagWrapped(): void {
    this.link.addAttr();
  }
}
