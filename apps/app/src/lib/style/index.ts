import { type CSSResult, unsafeCSS } from 'lit';

type StyleParam = CSSResult | string;

const _styles: CSSResult[] = [];

export function addStyle(...styles: StyleParam[]) {
  for (const style of styles) {
    const cssResult = typeof style === 'string' ? unsafeCSS(style) : style;
    _styles.push(cssResult);
    if (cssResult.styleSheet) {
      document.adoptedStyleSheets.push(cssResult.styleSheet);
    }
  }
}

export function getStyles(): CSSResult[] {
  return _styles;
}
