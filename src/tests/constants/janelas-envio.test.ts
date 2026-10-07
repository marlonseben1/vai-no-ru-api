import { describe, expect, it } from 'vitest';
import {
  HORARIO_LIMITE,
  janelaDaRefeicao,
  REFEICOES_POR_JANELA,
} from '../../constants/janelas-envio.js';
import { Refeicao } from '../../generated/prisma/enums.js';

describe('janelaDaRefeicao', () => {
  it('envia o almoço pela manhã', () => {
    expect(janelaDaRefeicao(Refeicao.Almoco)).toBe('MANHA');
  });

  it('envia almoço e jantar pela manhã', () => {
    expect(janelaDaRefeicao(Refeicao.AlmocoEJantar)).toBe('MANHA');
  });

  it('envia o jantar à tarde', () => {
    expect(janelaDaRefeicao(Refeicao.Jantar)).toBe('TARDE');
  });

  it('é consistente com REFEICOES_POR_JANELA', () => {
    for (const refeicao of Object.values(Refeicao)) {
      expect(REFEICOES_POR_JANELA[janelaDaRefeicao(refeicao)]).toContain(
        refeicao,
      );
    }
  });
});

describe('HORARIO_LIMITE', () => {
  it('define os horários de corte de cada janela', () => {
    expect(HORARIO_LIMITE.MANHA).toEqual({ hora: 9, minuto: 30 });
    expect(HORARIO_LIMITE.TARDE).toEqual({ hora: 15, minuto: 30 });
  });
});
