import type { Perfil, Refeicao } from '../../generated/prisma/enums.js';

export type AmbienteFormulario = 'PRODUCTION' | 'STAGING';

interface EntriesFormulario {
  NOME: string;
  MATRICULA: string;
  REFEICAO: string;
  PERFIL: string;
  DATA: string; // _year, _moth, _day
  PAGE_HISTORY: string;
  EMAIL?: string;
}

export const GOOGLE_ENTRIES: Record<AmbienteFormulario, EntriesFormulario> = {
  PRODUCTION: {
    NOME: 'entry.1773563523',
    MATRICULA: 'entry.1642444040',
    REFEICAO: 'entry.24359638',
    PERFIL: 'entry.919059448',
    DATA: 'entry.438994047',
    PAGE_HISTORY: '0,1', // O form tem 2 páginas
  },
  STAGING: {
    EMAIL: 'entry.1492417277',
    DATA: 'entry.1801437263',
    REFEICAO: 'entry.1988784789',
    NOME: 'entry.1076655601',
    PERFIL: 'entry.336191021',
    MATRICULA: 'entry.1251347209',
    PAGE_HISTORY: '0,1',
  },
};

export const REFEICAO_LABEL: Record<Refeicao, string> = {
  Almoco: 'Almoço',
  Jantar: 'Jantar',
  AlmocoEJantar: 'Almoço e jantar',
};

export const PERFIL_LABEL: Record<Perfil, string> = {
  AlunoGraduacaoUPF: 'Aluno graduação UPF',
  AlunoPosGraduacaoUPF: 'Aluno pós-graduação UPF',
  AlunoCreatiUPF: 'Aluno Creati UPF',
  AlunoIntegradoUPF: 'Aluno Integrado UPF',
  ProfessorOuComunidadeExterna: 'Professor ou Comunidade externa',
  FuncionarioUPF: 'Funcionário UPF',
  ResidenteMultiprofissional: 'Residente multiprofissional',
  EstudanteRedeMunicipalEstadual: 'Estudante rede municipal/estadual',
};
