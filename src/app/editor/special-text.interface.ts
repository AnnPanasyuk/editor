export enum SpecialTextEnum {
  LINK = 'LINK',
  TAG = 'TAG',
  HASH_TAG = 'HASH_TAG',
}

export interface ICurrentSpecialEls {
  node: Node;
  specialStr: string;
}

export interface ISpecialResult {
  specialEls: ICurrentSpecialEls[];
  type: SpecialTextEnum;
  styles: string[];
  tag: string;
}

export interface ISpecialText {
  pattern: RegExp;
  find(arr: NodeList): ISpecialResult;
  isBroken(): void;
}

export const URL_PATTERN = /(?:(?:(?:ftp|http)[s]*:\/\/|www\.)[^\.]+\.[^ \n]+)/gim;
export const EDITOR_GLOBAL_CLASS = 'editor-element';
export const EDITOR_BROKEN_TAG = 'broken';
export const KEY_SPACE = 'Space';
export const KEY_ENTER = 'Enter';
