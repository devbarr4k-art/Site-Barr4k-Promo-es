/** achou.io/o/MLB123: link curto que redireciona pro link de afiliado completo. */
export function linkCurto(linkAfiliado: string) {
  const id = new URL(linkAfiliado).pathname.match(/MLBU?\d+/i)?.[0];
  return id ? `https://achou.io/o/${id.toUpperCase()}` : linkAfiliado;
}
