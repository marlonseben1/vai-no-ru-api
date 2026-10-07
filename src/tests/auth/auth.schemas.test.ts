import { describe, expect, it } from 'vitest';
import { loginSchema, onboardingSchema } from '../../modules/auth/auth.schemas.js';

describe('onboardingSchema', () => {
  it('aceita nome e perfil válidos', () => {
    const resultado = onboardingSchema.safeParse({
      nome: 'Maria Souza',
      perfil: 'AlunoGraduacaoUPF',
    });
    expect(resultado.success).toBe(true);
  });

  it('rejeita nome com menos de 3 caracteres', () => {
    const resultado = onboardingSchema.safeParse({
      nome: 'Jo',
      perfil: 'AlunoGraduacaoUPF',
    });
    expect(resultado.error?.issues[0]?.message).toBe(
      'O nome deve conter pelo menos 3 caracteres',
    );
  });

  it('rejeita perfil fora do enum', () => {
    const resultado = onboardingSchema.safeParse({
      nome: 'Maria Souza',
      perfil: 'Alienigena',
    });
    expect(resultado.success).toBe(false);
  });
});
