// Categorias de interesse (usadas no cadastro e no painel).
export const CATEGORIAS = [
  ["eletronicos", "Eletrônicos"],
  ["informatica", "Informática e games"],
  ["casa", "Casa e decoração"],
  ["moda", "Moda e beleza"],
  ["mercado", "Mercado e supermercado"],
  ["celulares", "Celulares e acessórios"],
  ["gerais", "Ofertas gerais"],
] as const;
export type Categoria = (typeof CATEGORIAS)[number][0];
export const nomeCategoria = (c: string) => CATEGORIAS.find(([k]) => k === c)?.[1] ?? c;
