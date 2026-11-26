import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = { title: "Termos de Uso · ACHOU" };

const CONTATO = "contato@achou.io";

export default function Termos() {
  return (
    <main className="legal">
      <Link href="/" className="legal__home" aria-label="Voltar para a página inicial">
        <Logo size={24} />
      </Link>
      <h1>Termos de Uso</h1>
      <p className="legal__data">Atualizado em 26 de novembro de 2026 · Plataforma achou.io e Comunidades Oficiais</p>

      <p className="legal__intro">
        Bem-vindo à <b>ACHOU</b> (<b>achou.io</b>). Ao acessar nosso site, cadastrar-se ou participar das nossas
        comunidades no Telegram e WhatsApp, você concorda com as regras abaixo. Escrevemos tudo de forma clara para que
        não haja dúvidas sobre como funcionamos.
      </p>

      <h2>1. O que é a ACHOU</h2>
      <p>
        A <b>ACHOU</b> é uma plataforma de curadoria de ofertas, cupons de desconto e oportunidades de compra online. Nosso
        trabalho é monitorar, filtrar e divulgar promoções relevantes encontradas em lojas virtuais terceiras.
      </p>
      <ul>
        <li>
          <b>Não somos uma loja:</b> a ACHOU não vende produtos diretamente, não possui estoque próprio e não intermedia
          pagamentos.
        </li>
      </ul>

      <h2>2. Preços, estoque e cupons</h2>
      <p>O varejo online é dinâmico e os valores mudam a qualquer momento sem aviso prévio.</p>
      <ul>
        <li>
          <b>Validade das ofertas:</b> os preços, condições de parcelamento, frete e cupons divulgados refletem o exato
          momento em que a oferta foi postada pela nossa equipe.
        </li>
        <li>
          <b>Alterações e erros de preço:</b> caso um produto esgote, tenha seu valor alterado pela loja ou seja cancelado
          pelo varejista por erro sistêmico (bug ou erro crasso), a ACHOU não se responsabiliza pela manutenção do preço nem
          garante a disponibilidade do item.
        </li>
        <li>
          <b>Conferência final:</b> antes de concluir o pagamento, você deve sempre conferir o valor final, o frete e o
          vendedor diretamente no carrinho da loja parceira.
        </li>
      </ul>

      <h2>3. Compras, entregas e garantias</h2>
      <p>
        Ao clicar em um link divulgado pela ACHOU, você é redirecionado para o ambiente oficial da loja parceira (como
        Amazon, Mercado Livre, Shopee, AliExpress, Kabum, entre outras).
      </p>
      <ul>
        <li>
          Toda a relação de consumo (incluindo pagamento, emissão de nota fiscal, prazo de entrega, trocas, devoluções e
          garantia) ocorre exclusivamente entre você e a loja onde a compra foi realizada.
        </li>
        <li>Qualquer problema com o pedido deve ser tratado diretamente com o suporte da respectiva loja ou marketplace.</li>
      </ul>

      <h2>4. Links de afiliados e monetização</h2>
      <p>
        Para manter o site e os grupos gratuitos para a comunidade, a ACHOU participa de programas de afiliados. Quando
        você clica em nossos links e realiza uma compra, podemos receber uma pequena comissão da loja parceira,{" "}
        <b>sem nenhum custo adicional para você</b> (o preço do produto não aumenta por isso).
      </p>

      <h2>5. Regras de convivência nas comunidades (Telegram e WhatsApp)</h2>
      <p>Para manter a qualidade dos grupos e evitar spam, ao participar das nossas comunidades você concorda em:</p>
      <ul>
        <li>Não enviar links de divulgação própria, correntes, spam, golpes ou conteúdo ofensivo;</li>
        <li>Não utilizar robôs (bots) ou automações para extrair dados ou floodar os canais;</li>
        <li>Respeitar os administradores e demais membros.</li>
      </ul>
      <p>
        O descumprimento dessas regras pode resultar na remoção imediata e permanente dos grupos, sem aviso prévio.
      </p>

      <h2>6. Propriedade intelectual</h2>
      <p>
        A marca <b>ACHOU</b>, o logotipo, o layout do site <b>achou.io</b>, os textos de curadoria e os materiais visuais
        produzidos pela equipe são de propriedade exclusiva da ACHOU, sendo proibida a reprodução ou uso comercial sem
        autorização prévia.
      </p>

      <h2>7. Modificações dos termos</h2>
      <p>
        Podemos atualizar estes Termos de Uso periodicamente para refletir melhorias na plataforma ou adequações legais. A
        data no topo desta página sempre indicará a última revisão.
      </p>

      <h2>8. Contato e foro</h2>
      <p>
        Se tiver dúvidas, sugestões ou quiser reportar algum problema com links ou comunidades, fale com a gente pelo
        e-mail <a href={`mailto:${CONTATO}`}>{CONTATO}</a>. Fica eleito o foro da comarca de <b>São Paulo, Estado de São
        Paulo</b>, para dirimir quaisquer questões relacionadas a estes Termos.
      </p>
    </main>
  );
}
