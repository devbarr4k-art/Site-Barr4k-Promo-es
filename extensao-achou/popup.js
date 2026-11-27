// Lê os cookies do Mercado Livre deste navegador e envia pro painel da ACHOU.
// Nada de senha: usa a sessão já aberta, como o próprio botão "Compartilhar" do site faz.
const ENDPOINT = "https://www.achou.io/api/automacao/sessao";
const campo = document.getElementById("token");
const botao = document.getElementById("conectar");
const msg = document.getElementById("msg");

chrome.storage.local.get("token", (r) => {
  if (r.token) campo.value = r.token;
});

function mostrar(texto, tipo) {
  msg.textContent = texto;
  msg.className = "msg " + tipo;
}

async function cookiesDoMl() {
  const dominios = ["mercadolivre.com.br", ".mercadolivre.com.br", "www.mercadolivre.com.br"];
  const vistos = new Map();
  for (const domain of dominios) {
    const lista = await chrome.cookies.getAll({ domain });
    for (const c of lista) vistos.set(c.name, c.value);
  }
  return [...vistos.entries()].map(([n, v]) => `${n}=${v}`).join("; ");
}

botao.addEventListener("click", async () => {
  const token = campo.value.trim();
  if (!token) return mostrar("Cole o token do painel.", "erro");
  botao.disabled = true;
  mostrar("Conectando…", "ok");
  try {
    const cookies = await cookiesDoMl();
    if (!cookies) throw new Error("Entre no Mercado Livre nesta janela do Chrome primeiro.");
    const r = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, cookies }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) throw new Error(j.erro || "Não deu pra conectar.");
    chrome.storage.local.set({ token });
    mostrar("Conta conectada! Já pode fechar. O painel vai gerar os links sozinho.", "ok");
  } catch (e) {
    mostrar(e.message, "erro");
  } finally {
    botao.disabled = false;
  }
});
