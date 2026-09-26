import { type OrigemConta, Perfil } from '../generated/prisma/enums.js';

export const PERFIS_POR_ORIGEM: Record<OrigemConta, Perfil[]> = {
  UPF: [
    Perfil.AlunoGraduacaoUPF,
    Perfil.AlunoPosGraduacaoUPF,
    Perfil.AlunoCreatiUPF,
    Perfil.AlunoIntegradoUPF,
    Perfil.FuncionarioUPF,
  ],
  CONVIDADO: [
    Perfil.ResidenteMultiprofissional,
    Perfil.EstudanteRedeMunicipalEstadual,
    Perfil.ProfessorOuComunidadeExterna,
  ],
};
