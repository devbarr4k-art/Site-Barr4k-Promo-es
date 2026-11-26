// Horário, intervalo e formatação pro Telegram (sem acesso a banco: dá pra testar).

type Janela = { hora_inicio: number; hora_fim: number };
type Intervalo = { intervalo_min: number; intervalo_max: number };

function horaSP(d = new Date()) {
  return Number(d.toLocaleString("en-US", { timeZone: "America/Sao_Paulo", hour: "2-digit", hour12: false })) % 24;
}

export function dentroDoHorario(c: Janela, agora = new Date()) {
  const h = horaSP(agora);
  return c.hora_inicio <= c.hora_fim ? h >= c.hora_inicio && h < c.hora_fim : h >= c.hora_inicio || h < c.hora_fim;
}

export function proximoIntervalo(c: Intervalo) {
  const min = c.intervalo_min;
  const max = Math.max(min, c.intervalo_max);
  return (min + Math.random() * (max - min)) * 60_000;
}

/** Converte ~riscado~ pro formato do Telegram (HTML) e escapa o resto. */
export function paraHtml(texto: string) {
  const esc = texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return esc.replace(/~([^~\n]+)~/g, "<s>$1</s>").replace(/\*([^*\n]+)\*/g, "<b>$1</b>");
}

