import { describe, expect, it } from 'vitest';
import { resolverAmbienteFormulario } from '../../modules/formulario/formulario.constants.js';

describe('resolverAmbienteFormulario', () => {
  it('deriva do NODE_ENV quando não há override', () => {
    expect(resolverAmbienteFormulario('production')).toBe('PRODUCTION');
    expect(resolverAmbienteFormulario('development')).toBe('STAGING');
    expect(resolverAmbienteFormulario('test')).toBe('STAGING');
  });

  it('usa o override mesmo com NODE_ENV=production (caso do staging)', () => {
    expect(resolverAmbienteFormulario('production', 'STAGING')).toBe('STAGING');
  });

  it('permite forçar PRODUCTION fora de produção', () => {
    expect(resolverAmbienteFormulario('development', 'PRODUCTION')).toBe(
      'PRODUCTION',
    );
  });
});
