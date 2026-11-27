"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const fmt = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export function Motion() {
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    let lenis: Lenis | null = null;
    const raf = (t: number) => lenis?.raf(t * 1000);

    // A pedido do cliente, anima sempre, mesmo com "menos movimento" ligado no sistema.
    {
      lenis = new Lenis({ lerp: 0.1 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
        a.addEventListener("click", (e) => {
          const id = a.getAttribute("href");
          if (!id || id === "#") return;
          const el = document.querySelector(id);
          if (!el) return;
          e.preventDefault();
          lenis?.scrollTo(el as HTMLElement, { offset: -68 });
        }),
      );
    }

    const mm = gsap.matchMedia();

    mm.add(
      {
        desktop: "(min-width: 900px)",
        mobile: "(max-width: 899px)",
      },
      (ctx) => {
        const { desktop } = ctx.conditions as { desktop: boolean };

        // ── Hero: uma entrada só, o ACHOU gigante sobe por baixo do celular
        const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
        intro
          .from(".hero__line > span", { yPercent: 110, duration: 1.1, stagger: 0.1 }, 0.15)
          .from(".hero__sub, .hero__proof", { opacity: 0, y: 16, duration: 0.8, stagger: 0.06 }, 0.5)
          .from(".hero .ctas .btn", { opacity: 0, y: 16, duration: 0.8, stagger: 0.08 }, 0.6)
          .from(".hero__phone", { opacity: 0, y: 120, rotateX: 18, duration: 1.5 }, 0.2);

        gsap.to(".hero__phone .phone", {
          rotateY: 0,
          rotateX: 0,
          rotateZ: 0,
          y: desktop ? 80 : 30,
          ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
        });
        // ── Depoimentos: esteira contínua (GSAP roda liso no iPhone; não pausa com toque nem mouse)
        gsap.utils.toArray<HTMLElement>(".deps__track").forEach((t) => {
          t.style.animation = "none";
          gsap.fromTo(t, { xPercent: 0 }, { xPercent: -50, ease: "none", repeat: -1, duration: desktop ? 90 : 50, force3D: true });
        });

        // ── A enxurrada: já entra viva abaixo do letreiro, o spam passa pela câmera e sobram os achados limpos
        const itens = gsap.utils.toArray<HTMLElement>(".storm__item");
        if (itens.length) {
          gsap.fromTo(
            ".storm__space",
            { scale: 0.84, y: 40 },
            {
              scale: 1,
              y: 0,
              ease: "none",
              scrollTrigger: { trigger: ".storm", start: "top 95%", end: "top top", scrub: 0.35 },
            },
          );

          gsap.set(itens, { xPercent: -50, yPercent: -50 });
          const st = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: ".storm",
              start: "top top",
              end: desktop ? "+=1150" : "+=850",
              scrub: 0.35,
              pin: ".storm__stage",
            },
          });

          itens.forEach((el, i) => {
            const z0 = Number(el.dataset.z0 ?? -2400);
            const ini = Number(el.dataset.ini ?? 0);
            const op0 = Number(el.dataset.op0 ?? 0);
            const fica = el.dataset.stay === "1";
            const ang = (i % 2 === 0 ? -1 : 1) * (4 + ((i * 3) % 10));

            if (fica) {
              st.fromTo(el, { z: z0, rotate: ang }, { z: -260, rotate: ang * 0.35, duration: 1.25, ease: "power2.out" }, ini);
              st.fromTo(el, { opacity: 0 }, { opacity: desktop ? 0.88 : 0.72, duration: 0.75, ease: "power1.out" }, ini);
            } else {
              const dur = ini === 0 ? 1.05 + Math.abs(z0) / 1300 : 1.75;
              st.fromTo(el, { z: z0, rotate: ang }, { z: 820, rotate: 0, duration: dur }, ini);
              st.fromTo(
                el,
                { opacity: op0 },
                { keyframes: { opacity: [op0, 1, 1, 0] }, duration: dur },
                ini,
              );
            }
          });

          st.fromTo(
            ".storm__title span",
            { opacity: 0, yPercent: 38, scale: 0.92 },
            { opacity: 1, yPercent: 0, scale: 1, duration: 0.55, stagger: 0.24, ease: "power2.out" },
            1.65,
          ).to({}, { duration: 0.55 });
        }

        // ── Queda de preço: seção fixa, preço cai com a rolagem
        const drop = document.querySelector<HTMLElement>(".drop");
        if (drop) {
          const priceEl = drop.querySelector<HTMLElement>(".drop__price");
          const from = Number(drop.dataset.from);
          const to = Number(drop.dataset.to);
          const state = { v: from };
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: ".drop",
              start: "top top",
              end: desktop ? "+=1550" : "+=1100",
              scrub: 0.4,
              pin: ".drop__stage",
            },
          });
          tl.fromTo(".drop__product", { rotate: -8, scale: 0.85, y: 40 }, { rotate: 3, scale: 1, y: -10, duration: 4 }, 0)
            .to(state, {
              v: to,
              duration: 1.8,
              onUpdate: () => {
                if (priceEl) priceEl.textContent = fmt(Math.round(state.v));
              },
            }, 0.6)
            .fromTo(".drop__price", { color: "#EDEDE6" }, { color: "#C6FF00", duration: 0.3 }, 2.3)
            .fromTo(".drop__strike", { scaleX: 0 }, { scaleX: 1, duration: 0.4 }, 2.3)
            .fromTo(".drop__badge", { scale: 0, rotate: -40 }, { scale: 1, rotate: -8, duration: 0.4, ease: "back.out(2.5)" }, 2.4)
            .fromTo(".drop__glow", { opacity: 0.15 }, { opacity: 1, duration: 1 }, 2);

          gsap.utils.toArray<HTMLElement>(".drop__step").forEach((step, i) => {
            tl.fromTo(step, { opacity: 0.25, "--p": 0 }, { opacity: 1, "--p": 1, duration: 0.5 }, 0.3 + i * 0.9);
          });
          tl.to({}, { duration: 0.4 });
        }

        // ── Comparação: a conversa dos outros grupos não para
        gsap.utils.toArray<HTMLElement>(".chat--spam .chat__scroll").forEach((el, i) => {
          gsap.to(el, { yPercent: -50, ease: "none", duration: 14 + i * 3, repeat: -1 });
        });
        gsap.from(".chat--achou .chat__deal", {
          y: 60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: ".compare__grid", start: "top 70%" },
        });

        // ── Títulos gigantes entram de baixo
        gsap.utils.toArray<HTMLElement>(".mega, .final__title span").forEach((el) => {
          gsap.from(el, {
            yPercent: 40,
            opacity: 0,
            duration: 1.1,
            ease: "power4.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          });
        });

        // ── Linhas do índice
        gsap.from(".idx__list li", {
          y: 30,
          opacity: 0,
          duration: 0.8,
          stagger: 0.07,
          ease: "power3.out",
          scrollTrigger: { trigger: ".idx", start: "top 80%" },
        });

        // ── Números grandes: entram e contam toda vez que aparecem na tela
        // (38 sobe, spam desce de 214 pra 5, VIP desce de R$ 19,90 pra R$ 0)
        gsap.utils.toArray<HTMLElement>(".stat__num").forEach((el) => {
          const counts = gsap.utils.toArray<HTMLElement>(".count", el).map((c) => {
            const de = Number(c.dataset.from);
            const ate = Number(c.dataset.to);
            const dec = Number(c.dataset.dec ?? 0);
            const fmtN = (v: number) =>
              v === ate
                ? ate.toLocaleString("pt-BR")
                : v.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
            const st = { v: de };
            const tw = gsap.to(st, {
              v: ate,
              duration: 2.2,
              ease: "power3.out",
              paused: true,
              onUpdate: () => {
                c.textContent = fmtN(dec ? st.v : Math.round(st.v));
              },
            });
            return { tw, reset: () => { tw.pause(0); st.v = de; c.textContent = fmtN(de); } };
          });
          const entrada = gsap.fromTo(el, { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, ease: "power4.out", paused: true });
          const tocar = () => {
            entrada.restart();
            counts.forEach((c) => c.tw.restart());
          };
          const zerar = () => {
            entrada.pause(0);
            counts.forEach((c) => c.reset());
          };
          zerar();
          ScrollTrigger.create({
            trigger: el,
            start: "top 88%",
            end: "bottom 12%",
            onEnter: tocar,
            onEnterBack: tocar,
            onLeave: zerar,
            onLeaveBack: zerar,
          });
        });
      },
    );

    // F5 volta pra onde a pessoa estava: o navegador restauraria a rolagem antes das seções
    // fixas (enxurrada, preço caindo) existirem, caindo no lugar errado. Guardamos e restauramos depois.
    const CHAVE = "achou_scroll";
    const salvar = () => sessionStorage.setItem(CHAVE, String(window.scrollY));
    let tentativas = 0;
    let timer = 0;
    const restaurar = () => {
      const y = Number(sessionStorage.getItem(CHAVE));
      ScrollTrigger.refresh();
      if (!(y > 0)) return;
      lenis?.resize();
      window.scrollTo(0, y);
      lenis?.scrollTo(y, { immediate: true, force: true });
      ScrollTrigger.update();
      // fontes e imagens ainda podem mudar a altura: tenta de novo até chegar lá
      if (Math.abs(window.scrollY - y) > 4 && ++tentativas < 15) timer = window.setTimeout(restaurar, 120);
    };
    const onLoad = () => {
      window.clearTimeout(timer);
      tentativas = 0;
      timer = window.setTimeout(restaurar, 60);
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad);
    window.addEventListener("pagehide", salvar);

    return () => {
      window.removeEventListener("load", onLoad);
      window.removeEventListener("pagehide", salvar);
      window.clearTimeout(timer);
      mm.revert();
      gsap.ticker.remove(raf);
      lenis?.destroy();
    };
  }, []);

  return null;
}
