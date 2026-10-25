import { sanitizarHtml } from '../../utils/html/sanitizarHtml.js';
import { getPrimeiroNome } from '../../utils/nomes/getPrimeiroNome.js';

type DadosReserva = {
  dataReserva: Date;
  refeicao: 'Almoco' | 'Jantar' | 'AlmocoEJantar';
  usuario: { nome: string };
};

const ROTULO_REFEICAO: Record<DadosReserva['refeicao'], string> = {
  Almoco: 'almoço',
  Jantar: 'jantar',
  AlmocoEJantar: 'almoço e jantar',
};

const formatarData = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export type Email = { assunto: string; texto: string; html: string };

function montarHtml(
  titulo: string,
  saudacao: string,
  paragrafo: string,
): string {
  return `<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #222;">
  <h2 style="margin: 0 0 16px;">${titulo}</h2>
  <p style="margin: 0 0 8px;">${sanitizarHtml(saudacao)}</p>
  <p style="margin: 0 0 24px; line-height: 1.5;">${paragrafo}</p>
  <p style="margin: 0; font-size: 12px; color: #888;">Vai no RU</p>
</div>`;
}

function descrever({ dataReserva, refeicao }: DadosReserva): string {
  return `${ROTULO_REFEICAO[refeicao]} de ${formatarData.format(dataReserva)}`;
}

export function montarEmailReservaAgendada(reserva: DadosReserva): Email {
  const descricao = descrever(reserva);
  const saudacao = `Olá, ${getPrimeiroNome(reserva.usuario.nome)}!`;
  const corpo = `Sua reserva de ${descricao} foi agendada com sucesso.`;
  return {
    assunto: 'Vai no RU: reserva agendada',
    texto: `${saudacao}\n\n${corpo}`,
    html: montarHtml('Reserva agendada', saudacao, corpo),
  };
}

export function montarEmailReservaNaoAgendada(reserva: DadosReserva): Email {
  const descricao = descrever(reserva);
  const saudacao = `Olá, ${getPrimeiroNome(reserva.usuario.nome)}!`;
  const corpo = `Não conseguimos agendar sua reserva de ${descricao}. Fizemos 3 tentativas sem sucesso. Se precisar, faça o agendamento direto no formulário do RU.`;
  return {
    assunto: 'Vai no RU: reserva não agendada',
    texto: `${saudacao}\n\n${corpo}`,
    html: montarHtml('Reserva não agendada', saudacao, corpo),
  };
}
