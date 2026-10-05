// e-mail de aluno é o número da matrícula: 123456@upf.br
export function extrairMatriculaDoEmail(email: string): string | null {
  return email.match(/^(\d+)@upf\.br$/i)?.[1] ?? null;
}
