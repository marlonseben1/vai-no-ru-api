import { describe, expect, it } from 'vitest';
import {
  emailPermitido,
  extrairMatriculaDoEmail,
} from '../../modules/auth/auth.helpers.js';

describe('emailPermitido', () => {
  it('permite qualquer e-mail quando a lista está vazia', () => {
    expect(emailPermitido('qualquer@gmail.com', [])).toBe(true);
  });

  it('permite e-mail que está na lista', () => {
    expect(emailPermitido('a@x.com', ['a@x.com', 'b@x.com'])).toBe(true);
  });

  it('ignora maiúsculas e minúsculas', () => {
    expect(emailPermitido('A@X.com', ['a@x.com'])).toBe(true);
  });

  it('bloqueia e-mail fora da lista', () => {
    expect(emailPermitido('c@x.com', ['a@x.com', 'b@x.com'])).toBe(false);
  });
});

describe('extrairMatriculaDoEmail', () => {
  it('extrai a matrícula de um e-mail institucional', () => {
    expect(extrairMatriculaDoEmail('123456@upf.br')).toBe('123456');
  });

  it('ignora maiúsculas e minúsculas no domínio', () => {
    expect(extrairMatriculaDoEmail('123456@UPF.BR')).toBe('123456');
  });

  it.each([
    ['e-mail com nome', 'joao.silva@upf.br'],
    ['outro domínio', '123456@gmail.com'],
    ['domínio com sufixo extra', '123456@upf.br.evil.com'],
    ['matrícula com letras', '12a456@upf.br'],
    ['espaço antes da matrícula', ' 123@upf.br'],
    ['string vazia', ''],
  ])('retorna null para %s', (_descricao, email) => {
    expect(extrairMatriculaDoEmail(email)).toBeNull();
  });
});
