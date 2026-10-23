import { describe, expect, it } from 'vitest';
import { GOOGLE_ENTRIES } from '../../modules/formulario/formulario.constants.js';

describe('GOOGLE_ENTRIES', () => {
  it('envia o e-mail ao formulário oficial pelo campo nativo emailAddress', () => {
    expect(GOOGLE_ENTRIES.PRODUCTION.EMAIL).toBe('emailAddress');
  });
});
