/** achou.io/o/MLB123: link curto que redireciona pro link de afiliado completo.
 *  Usa o código mais exato que o link tiver: a variação (item_id / MLB-123) antes da página do produto. */
export function codigoProduto(link: string) {
  const item = link.match(/item_id(?:%3A|:)(MLB\d+)/i)?.[1];
  if (item) return item.toUpperCase();
  const anuncio = link.match(/\/MLB-(\d+)/i)?.[1];
  if (anuncio) return `MLB${anuncio}`;
  try {
    return new URL(link).pathname.match(/\/(?:p|up)\/(MLBU?\d+)/i)?.[1]?.toUpperCase() ?? null;
  } catch {
    return null;
  }
}

export function linkCurto(linkAfiliado: string) {
  const id = codigoProduto(linkAfiliado);
  return id ? `https://achou.io/o/${id}` : linkAfiliado;
}
