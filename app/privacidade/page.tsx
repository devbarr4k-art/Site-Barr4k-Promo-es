import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = { title: "Política de Privacidade · ACHOU" };

const CONTATO = "contato@achou.io";

export default function Privacidade() {
  return (
    <main className="legal">
      <Link href="/" className="legal__home" aria-label="Voltar para a página inicial">
        <Logo size={24} />
      </Link>
      <h1>Política de Privacidade</h1>
      <p className="legal__data">Atualizada em 26 de novembro de 2026 · Plataforma achou.io e Comunidades Oficiais</p>

      <p className="legal__intro">
        Na <b>ACHOU</b>, levamos a sério tanto as melhores ofertas quanto a segurança dos seus dados. Explicamos abaixo,
        de forma direta e sem letras miúdas, quais informações coletamos, como as utilizamos e quais são os seus direitos
        garantidos pela Lei Geral de Proteção de Dados (LGPD).
      </p>

      <h2>1. O que a gente coleta</h2>
      <ul>
        <li>
          <b>Dados de cadastro:</b> quando você solicita acesso ao nosso grupo no Telegram ou à comunidade no WhatsApp,
          coletamos seu <b>nome</b>, <b>e-mail</b> e <b>telefone</b>, além da data de registro e da plataforma escolhida.
        </li>
        <li>
          <b>Dados de navegação:</b> ao acessar o site <b>achou.io</b>, podemos coletar dados técnicos anônimos (como tipo
          de dispositivo, navegador e páginas acessadas) por meio de ferramentas de monitoramento para melhorar o
          desempenho e a experiência da plataforma.
        </li>
      </ul>

      <h2>2. Para que usamos esses dados</h2>
      <p>Utilizamos suas informações exclusivamente para:</p>
      <ul>
        <li>Liberar e gerenciar seu acesso às comunidades no WhatsApp e no Telegram;</li>
        <li>Enviar alertas de promoções, cupons de desconto, oportunidades e comunicados importantes da ACHOU;</li>
        <li>Analisar o desempenho do site e compreender quais categorias de produtos mais interessam à comunidade.</li>
      </ul>
      <p>
        <b>Base legal:</b> tratamos seus dados com base no seu <b>consentimento</b> (LGPD, Art. 7º, I), fornecido
        voluntariamente ao preencher o formulário e marcar a caixa de aceite.
      </p>

      <h2>3. Links de afiliados e lojas parceiras</h2>
      <p>
        A ACHOU atua como curadora de ofertas e participa de programas de afiliados de grandes varejistas (como Amazon,
        Mercado Livre, AliExpress, Shopee, entre outros).
      </p>
      <ul>
        <li>
          Ao clicar em uma oferta, você é redirecionado para o ambiente oficial da loja parceira, podendo haver uso de
          cookies de rastreamento para identificar a origem da indicação (sem qualquer custo extra para você).
        </li>
        <li>
          <b>Nós não processamos pagamentos nem coletamos dados financeiros.</b> Toda compra, entrega, troca e garantia
          ocorre diretamente no site da loja parceira, que possui sua própria Política de Privacidade.
        </li>
      </ul>

      <h2>4. Com quem compartilhamos e onde guardamos</h2>
      <p>Não vendemos, alugamos ou comercializamos seus dados pessoais em hipótese alguma.</p>
      <ul>
        <li>
          Seus dados ficam armazenados em servidores em nuvem seguros, com controle de acesso restrito apenas à equipe
          autorizada da ACHOU.
        </li>
        <li>
          Compartilhamos informações estritamente com provedores de infraestrutura essenciais para o funcionamento do
          serviço (como hospedagem do banco de dados e ferramentas de disparo de e-mails ou mensagens), todos em
          conformidade com a LGPD.
        </li>
      </ul>

      <h2>5. Por quanto tempo guardamos</h2>
      <p>
        Mantemos seus dados apenas enquanto você fizer parte da nossa base ou desejar receber nossas ofertas. Caso você
        saia dos grupos ou solicite o descadastramento, seus dados serão removidos de forma definitiva, exceto se houver
        obrigação legal ou regulatória de retenção.
      </p>

      <h2>6. Seus direitos (LGPD)</h2>
      <p>Você tem controle total sobre suas informações pessoais. A qualquer momento, você pode solicitar:</p>
      <ul>
        <li>A confirmação da existência de tratamento e o acesso aos dados que temos sobre você;</li>
        <li>A correção de dados incompletos, inexatos ou desatualizados;</li>
        <li>A exclusão definitiva do seu cadastro e a revogação do seu consentimento.</li>
      </ul>
      <p>
        Para exercer qualquer um desses direitos ou esclarecer dúvidas sobre esta política, envie um e-mail para{" "}
        <a href={`mailto:${CONTATO}`}>{CONTATO}</a>.
      </p>
    </main>
  );
}
