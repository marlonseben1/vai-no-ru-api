const FUSO_RU = 'America/Sao_Paulo';
const MS_POR_DIA = 24 * 60 * 60 * 1000;

const formatarData = new Intl.DateTimeFormat('en-CA', {
  timeZone: FUSO_RU,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const formatarHorario = new Intl.DateTimeFormat('en-GB', {
  timeZone: FUSO_RU,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function getMinutosDoDia(agora = new Date()): number {
  const partes = formatarHorario.formatToParts(agora);
  const valor = (tipo: string) =>
    Number(partes.find((parte) => parte.type === tipo)?.value);
  return valor('hour') * 60 + valor('minute');
}

export function getDataDeHojeISO(): string {
  return formatarData.format(new Date());
}

export function dataDeHoje(): Date {
  return new Date(getDataDeHojeISO());
}

export function adicionarDias(data: Date, dias: number): Date {
  return new Date(data.getTime() + dias * MS_POR_DIA);
}
