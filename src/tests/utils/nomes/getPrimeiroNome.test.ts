import { describe, expect, it } from 'vitest';
import { getPrimeiroNome } from '../../../utils/nomes/getPrimeiroNome.js';

describe('getPrimeiroNome', () => {
  it('retorna o primeiro nome de um nome completo', () => {
    expect(getPrimeiroNome('Maria da Silva')).toBe('Maria');
  });

  it('ignora espaços extras', () => {
    expect(getPrimeiroNome('  João   Souza ')).toBe('João');
  });

  it('retorna string vazia para nome vazio', () => {
    expect(getPrimeiroNome('')).toBe('');
  });
});
