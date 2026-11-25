import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = { title: "Política de Privacidade · ACHOU" };

// TODO: confirmar com o Barr4k o nome/CNPJ do responsável e o e-mail de contato antes de publicar.
const CONTATO = "contato@achou.io";

export default function Privacidade() {
  return (
    <main className="legal">
      <Link href="/" className="legal__home" aria-label="Voltar para a página inicial">
        <Logo size={24} />
      </Link>
      <h1>Política de Privacidade</h1>
      <p className="legal__data">Atualizada em 25 de novembro de 2026</p>

      <h2>O que a gente coleta</h2>
      <p>
        Quando você pede para entrar no grupo do Telegram ou na comunidade do WhatsApp da ACHOU, pedimos seu
        <b> e-mail</b> e seu <b>telefone</b>. Também registramos a data do cadastro e qual grupo você escolheu.
      </p>

      <h2>Para que usamos</h2>
      <p>
        Para liberar seu acesso aos grupos e para enviar ofertas, cupons e avisos da ACHOU por e-mail, WhatsApp ou
        Telegram. Usamos esses dados com base no seu consentimento (LGPD, art. 7º, I), que você dá ao marcar a caixa no
        cadastro.
      </p>

      <h2>Com quem compartilhamos</h2>
      <p>
        Não vendemos nem repassamos seus dados. Eles ficam guardados em um serviço de armazenamento privado, acessível só
        pela equipe da ACHOU. As compras são feitas direto nas lojas parceiras, que têm políticas próprias.
      </p>

      <h2>Por quanto tempo</h2>
      <p>Enquanto você quiser receber nossas ofertas. Se pedir a exclusão, apagamos seus dados.</p>

      <h2>Seus direitos</h2>
      <p>
        Você pode pedir a qualquer momento para ver, corrigir ou apagar seus dados, ou retirar o consentimento. É só
        mandar um e-mail para <a href={`mailto:${CONTATO}`}>{CONTATO}</a>.
      </p>
    </main>
  );
}
