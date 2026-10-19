/**
 * Extrai do e-mail de aluno o número da matrícula.
 * Ex: 123456@upf.br -> 123456
 */
export function extrairMatriculaDoEmail(email: string): string | null {
  return email.match(/^(\d+)@upf\.br$/i)?.[1] ?? null;
}

export function emailPermitido(email: string, permitidos: string[]): boolean {
  return permitidos.length === 0 || permitidos.includes(email.toLowerCase());
}
