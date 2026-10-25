import { describe, expect, it } from 'vitest';
import { sanitizarHtml } from '../../../utils/html/sanitizarHtml.js';

describe('sanitizarHtml', () => {
  it('converte caracteres especiais em entidades HTML', () => {
    expect(sanitizarHtml('<a href="x">&</a>')).toBe(
      '&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;',
    );
  });

  it('mantém texto comum inalterado', () => {
    expect(sanitizarHtml('Maria da Silva')).toBe('Maria da Silva');
  });
});
