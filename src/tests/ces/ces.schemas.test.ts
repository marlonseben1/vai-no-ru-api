import { describe, expect, it } from 'vitest';
import { registrarCesSchema } from '../../modules/ces/ces.schemas.js';

const base = { contexto: 'primeira_reserva' };

describe('registrarCesSchema', () => {
  it.each([1, 3, 5])('aceita a nota %i', (nota) => {
    expect(registrarCesSchema.safeParse({ ...base, nota }).success).toBe(true);
  });

  it.each([0, 6, 3.5, '4'])('rejeita a nota %s', (nota) => {
    expect(registrarCesSchema.safeParse({ ...base, nota }).success).toBe(false);
  });

  it('aceita nota nula (pesquisa fechada sem avaliar)', () => {
    expect(registrarCesSchema.safeParse({ ...base, nota: null }).success).toBe(
      true,
    );
  });

  it('exige a nota, ainda que nula', () => {
    expect(registrarCesSchema.safeParse(base).success).toBe(false);
  });

  it('rejeita contexto desconhecido', () => {
    expect(
      registrarCesSchema.safeParse({
        contexto: 'contexto_desconhecido',
        nota: 5,
      }).success,
    ).toBe(false);
  });

  it('normaliza comentário vazio ou só com espaços para nulo', () => {
    const resultado = registrarCesSchema.parse({
      ...base,
      nota: 4,
      comentario: '   ',
    });
    expect(resultado.comentario).toBeNull();
  });

  it('remove espaços nas pontas do comentário', () => {
    const resultado = registrarCesSchema.parse({
      ...base,
      nota: 2,
      comentario: '  difícil de achar o botão  ',
    });
    expect(resultado.comentario).toBe('difícil de achar o botão');
  });

  it('rejeita comentário acima de 1000 caracteres', () => {
    expect(
      registrarCesSchema.safeParse({
        ...base,
        nota: 2,
        comentario: 'a'.repeat(1001),
      }).success,
    ).toBe(false);
  });
});
