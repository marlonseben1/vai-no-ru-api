import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Refeicao } from '../../generated/prisma/enums.js';
import {
  formatarHorarioLimite,
  prazoEncerrado,
} from '../../modules/reservas/reserva.helpers.js';

describe('formatarHorarioLimite', () => {
  it.each([
    [Refeicao.Almoco, '09:30'],
    [Refeicao.AlmocoEJantar, '09:30'],
    [Refeicao.Jantar, '15:30'],
  ])('%s -> %s', (refeicao, esperado) => {
    expect(formatarHorarioLimite(refeicao)).toBe(esperado);
  });
});

describe('prazoEncerrado', () => {
  const hoje = '2026-10-07';

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // 12:29Z = 09:29 em São Paulo
  function agoraEm(iso: string) {
    const data = new Date(iso);
    vi.setSystemTime(data);
    return data;
  }

  it('almoço de hoje ainda está no prazo às 09:29', () => {
    const agora = agoraEm('2026-10-07T12:29:00Z');
    expect(prazoEncerrado(Refeicao.Almoco, hoje, agora)).toBe(false);
  });

  it('almoço de hoje encerra às 09:30', () => {
    const agora = agoraEm('2026-10-07T12:30:00Z');
    expect(prazoEncerrado(Refeicao.Almoco, hoje, agora)).toBe(true);
  });

  it('almoço e jantar seguem o limite da manhã', () => {
    const agora = agoraEm('2026-10-07T12:30:00Z');
    expect(prazoEncerrado(Refeicao.AlmocoEJantar, hoje, agora)).toBe(true);
  });

  it('jantar ainda está no prazo às 09:30', () => {
    const agora = agoraEm('2026-10-07T12:30:00Z');
    expect(prazoEncerrado(Refeicao.Jantar, hoje, agora)).toBe(false);
  });

  it('jantar encerra às 15:30', () => {
    const agora = agoraEm('2026-10-07T18:30:00Z');
    expect(prazoEncerrado(Refeicao.Jantar, hoje, agora)).toBe(true);
  });

  it('datas que não são hoje nunca encerram', () => {
    const agora = agoraEm('2026-10-07T20:00:00Z');
    expect(prazoEncerrado(Refeicao.Almoco, '2026-10-08', agora)).toBe(false);
    expect(prazoEncerrado(Refeicao.Almoco, '2026-10-06', agora)).toBe(false);
  });
});
