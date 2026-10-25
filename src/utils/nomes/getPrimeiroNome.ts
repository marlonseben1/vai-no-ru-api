export function getPrimeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? '';
}
