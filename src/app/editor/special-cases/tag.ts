import {ISpecialResult, ISpecialText, URL_PATTERN} from '../special-text.interface';

export class Tag implements ISpecialText {
  public pattern = URL_PATTERN;

  public find(arr: NodeList): ISpecialResult {
    return ([] as unknown) as ISpecialResult;
  }

  public isBroken(): void {
    //
  }
}
