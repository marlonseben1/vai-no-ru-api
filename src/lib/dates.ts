const FUSO_RU = 'America/Sao_Paulo';
const MS_POR_DIA = 24 * 60 * 60 * 1000;

const formatarData = new Intl.DateTimeFormat('en-CA', {
  timeZone: FUSO_RU,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function getDataDeHojeISO(): string {
  return formatarData.format(new Date());
}

export function dataDeHoje(): Date {
  return new Date(getDataDeHojeISO());
}

export function adicionarDias(data: Date, dias: number): Date {
  return new Date(data.getTime() + dias * MS_POR_DIA);
}
