import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  criarReservasSchema,
  listarReservasQuerySchema,
} from '../../modules/reservas/reserva.schemas.js';

describe('criarReservasSchema', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // quarta-feira, 07/10/2026
    vi.setSystemTime(new Date('2026-10-07T15:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const reserva = (data: string) => ({ dias: [{ data, refeicao: 'Almoco' }] });

  it('aceita dia útil futuro', () => {
    expect(criarReservasSchema.safeParse(reserva('2026-10-08')).success).toBe(
      true,
    );
  });

  it('aceita o dia de hoje', () => {
    expect(criarReservasSchema.safeParse(reserva('2026-10-07')).success).toBe(
      true,
    );
  });

  it('rejeita lista vazia', () => {
    expect(criarReservasSchema.safeParse({ dias: [] }).success).toBe(false);
  });

  it('rejeita data passada', () => {
    const resultado = criarReservasSchema.safeParse(reserva('2026-10-06'));
    expect(resultado.error?.issues[0]?.message).toBe(
      'Não é possível reservar datas passadas',
    );
  });

  it.each(['2026-10-10', '2026-10-11'])(
    'rejeita fim de semana (%s)',
    (data) => {
      const resultado = criarReservasSchema.safeParse(reserva(data));
      expect(resultado.error?.issues[0]?.message).toBe(
        'Reservas só podem ser feitas de segunda a sexta',
      );
    },
  );

  it('rejeita formato de data inválido', () => {
    expect(criarReservasSchema.safeParse(reserva('08/10/2026')).success).toBe(
      false,
    );
  });

  it('rejeita refeição inválida', () => {
    const resultado = criarReservasSchema.safeParse({
      dias: [{ data: '2026-10-08', refeicao: 'Lanche' }],
    });
    expect(resultado.success).toBe(false);
  });
});
