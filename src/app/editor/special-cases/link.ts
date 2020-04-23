import {
  EDITOR_BROKEN_TAG,
  EDITOR_GLOBAL_CLASS,
  ICurrentSpecialEls,
  ISpecialResult,
  ISpecialText,
  SpecialTextEnum,
  URL_PATTERN
} from '../special-text.interface';

export class Link implements ISpecialText {
  public pattern = URL_PATTERN;
  private readonly ACTIVE_CLASS = 'editor-link';
  private readonly BROKEN_CLASS = 'editor-broken-link';

  public find(childNodes: NodeList): ISpecialResult {
    let node = null;
    let text = null;
    const specialResults: ICurrentSpecialEls[] = [];
    let specialResult = null;
    let specialStr: string = null;

    childNodes.forEach((item) => {
      if (
        item &&
        (item.nodeName === '#text' || item.nodeName === 'DIV') &&
        item.textContent.match(this.pattern)
      ) {
        node = item.firstChild ? item.firstChild : item;
        text = node.textContent;
        specialResult = text.match(this.pattern);
        // check if there is a match with the transmitted text
        if (specialResult && specialResult[0]) {
          specialStr = specialResult[0];
        }
        specialResults.push({ node, specialStr });
      }
    });

    return {
      specialEls: [...specialResults],
      type: SpecialTextEnum.LINK,
      styles: [this.ACTIVE_CLASS, this.BROKEN_CLASS],
      tag: 'a',
    };
  }

  public isBroken(): void {
    document.querySelectorAll(`.${EDITOR_GLOBAL_CLASS} a`).forEach((el) => {
      if (el) {
        const matchResult = el.textContent.match(this.pattern);
        if (!(matchResult && matchResult.length)) {
          el.setAttribute(EDITOR_BROKEN_TAG, EDITOR_BROKEN_TAG);
        } else if (el.hasAttribute(EDITOR_BROKEN_TAG)) {
          el.removeAttribute(EDITOR_BROKEN_TAG);
        }
      }
    });
  }

  public addAttr(): void {
    document.querySelectorAll(`.${EDITOR_GLOBAL_CLASS} a`).forEach((el) => {
      const href = 'href';
      if (!el.hasAttribute(href)) {
        el.setAttribute(href, el.textContent.trim());
      }
    });
  }
}
