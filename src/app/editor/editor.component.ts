import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {EDITOR_BROKEN_TAG, EDITOR_GLOBAL_CLASS, ICurrentSpecialEls, ISpecialResult, KEY_ENTER, KEY_SPACE} from './special-text.interface';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      // tslint:disable-next-line:no-forward-ref
      useExisting: forwardRef(() => EditorComponent),
      multi: true,
    },
  ],
})
export class EditorComponent implements AfterViewInit, OnChanges, ControlValueAccessor {
  public get elementValue(): string {
    return EditorComponent.replaceSpace(this.elementEditor.nativeElement.innerText);
  }

  public get element(): ElementRef {
    return this.elementEditor;
  }

  @Input()
  public result: ISpecialResult = null;
  @Input()
  public placeholder: string = null;
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
  @Output()
  public editorKeyup: EventEmitter<KeyboardEvent> = new EventEmitter<KeyboardEvent>();
  @Output()
  public editorKeydown: EventEmitter<KeyboardEvent> = new EventEmitter<KeyboardEvent>();
  @Output()
  public editorFocus: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>();
  @Output()
  public editorBlur: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>();
  @Output()
  public findSpecialTag: EventEmitter<NodeList> = new EventEmitter<NodeList>();
  @Output()
  public specialTagWrapped: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild('editorElement', { static: true })
  public elementEditor: ElementRef;

  private keyboardCode: string = null;
  private data = null;
  private childNodes = null;
  private value = null;

  private static setCaret(node: Node, offset: number): void {
    const range = document.createRange();
    const sel = window.getSelection();
    range.setStart(node, offset);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  private static setLinkEndCaret(childNodes, node): void {
    const lastChild = childNodes[childNodes.length - 1];
    const lastLinkNode = lastChild.previousElementSibling;

    if (
      lastLinkNode &&
      (EditorComponent.getLastNodeLocalName(childNodes, lastLinkNode, 'a') ||
        EditorComponent.getLastNodeLocalName(childNodes, lastChild.firstElementChild, 'a'))
    ) {
      EditorComponent.setCaret(node, node.length);
    }
  }

  private static getLastNodeLocalName(nodeList, separateNode: Element, localName: string): boolean {
    return (
      nodeList &&
      nodeList[nodeList.length - 1] &&
      separateNode &&
      separateNode.localName === localName
    );
  }

  private static specialElsStylize(tag, activeClass, brokenClass): void {
    document.querySelectorAll(`.${EDITOR_GLOBAL_CLASS} ${tag}`).forEach((el) => {
      if (el && !el.hasAttribute(EDITOR_BROKEN_TAG)) {
        el.classList.remove(brokenClass);
        el.classList.add(activeClass);
      } else {
        el.classList.remove(activeClass);
        el.classList.add(brokenClass);
      }
    });
  }

  private static replaceSpace(data): string {
    return data.replace(/\n/gi, '<br>');
  }

  constructor() {}

  public ngAfterViewInit(): void {
    // set custom placeholder defined in parent component
    if (this.elementEditor && this.elementEditor.nativeElement) {
      const atrrs = Array.from(this.elementEditor.nativeElement.attributes);
      const placeholdersArray = atrrs.filter((i: Element) => i.localName === 'placeholder');
      const placeholder = placeholdersArray[0] as Element;
      placeholder.nodeValue = this.placeholder;
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.isCleanState) {
      this.clear();
    }
    if (this.result) {
      this.wrapStringByTag(this.result);
    }
  }

  public keyupEvent(e: KeyboardEvent): void {
    this.editorKeyup.emit(e);
    this.data = this.elementEditor.nativeElement.textContent;

    // delete all extra tags when user clear editable block
    this.deleteExtraTags();
    this.keyboardCode = e.code;
    this.manageSpecialKeys(this.keyboardCode);
    // stylize special tags
    this.manageStylizingTags();
    this.changeEvent();
  }

  public keydownEvent(e: KeyboardEvent): void {
    this.editorKeydown.emit(e);
    if (
      this.elementEditor &&
      this.elementEditor.nativeElement &&
      this.elementEditor.nativeElement.innerHTML &&
      this.elementEditor.nativeElement.innerHTML.length >= this.editorMaxLength
    ) {
      e.preventDefault();
    }
  }

  public pasteEvent(e: ClipboardEvent): void {
    // get user's pasted data
    let data = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');

    // filter out everything except simple text and allowable HTML elements
    const regex = /<(?!(\/\s*)?(span|p)[>,\s])([^>])*>/g;

    data = data.replace(regex, '');
    data = EditorComponent.replaceSpace(data);

    // insert the filtered content
    document.execCommand('insertHTML', false, data);

    // prevent the standard paste behavior
    e.preventDefault();

    this.manageSpecialText();
  }

  public focusEvent(e: FocusEvent): void {
    this.editorFocus.emit(e);
    if (this.value && this.data) {
      this.elementEditor.nativeElement.innerHTML = EditorComponent.replaceSpace(this.data);
      this.manageSpecialText();
      const node = this.childNodes[this.childNodes.length - 1];
      if (node) {
        EditorComponent.setCaret(node, node.length);
      }
    }
  }

  public blurEvent(e: FocusEvent): void {
    this.editorBlur.emit(e);
  }

  public changeEvent(): void {
    this.propagateChange(this.data);
  }

  public writeValue(obj: any): void {
    if (obj) {
      this.value = obj;
      this.data = this.value;
    }
  }

  public registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }
  public registerOnTouched(): void {}

  private propagateChange = (_: any) => {};

  private manageSpecialKeys(code: string): void {
    if (code === KEY_SPACE || code === KEY_ENTER) {
      this.manageSpecialText();
    }
  }

  private wrapStringByTag(result: ISpecialResult): void {
    if (result.specialEls && result.specialEls.length) {
      const array: ICurrentSpecialEls[] = [...result.specialEls];
      // tslint:disable-next-line:forin
      array.forEach((item) => {
        const { node, specialStr } = item;
        const content = node ? node.textContent : null;
        if (document.createRange && content) {
          // if there is a match, and the browser supports Range, create an object
          const rng = document.createRange();
          // debugger;

          // set the upper bound on the match index
          rng.setStart(node, content.indexOf(specialStr));

          // and the lower index + text length
          rng.setEnd(node, content.indexOf(specialStr) + specialStr.length);

          const highlightDiv = document.createElement(result ? result.tag : 'p');

          // wrap our range in tag
          rng.surroundContents(highlightDiv);
          this.specialTagWrapped.emit();

          // set caret to end
          EditorComponent.setLinkEndCaret(this.childNodes, highlightDiv.lastChild);
          this.manageStylizingTags();
        }
      });
    }
  }

  private deleteExtraTags(): void {
    if (
      this.elementEditor &&
      this.elementEditor.nativeElement &&
      this.elementEditor.nativeElement.textContent.length === 0
    ) {
      this.clear();
    }
  }

  private clear(): void {
    this.elementEditor.nativeElement.innerHTML = null;
    this.data = null;
  }

  private manageStylizingTags(): void {
    if (this.result && this.result.styles && this.result.styles.length && this.result.tag) {
      const [activeClass, brokenClass] = this.result.styles;
      EditorComponent.specialElsStylize(this.result.tag, activeClass, brokenClass);
    }
  }

  private manageSpecialText(): void {
    this.childNodes = this.elementEditor.nativeElement.childNodes;
    this.findSpecialTag.emit(this.childNodes);
    this.manageStylizingTags();
  }
}
