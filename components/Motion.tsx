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
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lenis: Lenis | null = null;
    const raf = (t: number) => lenis?.raf(t * 1000);

    if (!reduce) {
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
        desktop: "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
        mobile: "(max-width: 899px) and (prefers-reduced-motion: no-preference)",
      },
      (ctx) => {
        const { desktop } = ctx.conditions as { desktop: boolean };

        // ── Hero: uma entrada só, o ACHOU gigante sobe por baixo do celular
        const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
        intro
          .from(".hero__word span", { yPercent: 60, opacity: 0, duration: 1.4 }, 0)
          .from(".hero__line > span", { yPercent: 110, duration: 1.1, stagger: 0.1 }, 0.15)
          .from(".hero__live, .hero__sub, .hero__proof", { opacity: 0, y: 16, duration: 0.8, stagger: 0.06 }, 0.5)
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
        gsap.to(".hero__word span", {
          xPercent: -6,
          ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
        });

        // ── A enxurrada: tudo voa na direção da câmera, sobra a frase
        const itens = gsap.utils.toArray<HTMLElement>(".storm__item");
        if (itens.length) {
          gsap.set(itens, { xPercent: -50, yPercent: -50 });
          const st = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: ".storm",
              start: "top top",
              end: desktop ? "+=2600" : "+=1900",
              scrub: 0.8,
              pin: ".storm__stage",
            },
          });
          itens.forEach((el) => {
            const ordem = Number(el.dataset.z);
            const ini = ordem * 0.22;
            st.fromTo(el, { z: -3200, rotate: gsap.utils.random(-14, 14) }, { z: 900, rotate: 0, duration: 2.4 }, ini);
            st.fromTo(el, { opacity: 0 }, { keyframes: { opacity: [0, 1, 1, 1, 0] }, duration: 2.4 }, ini);
          });
          st.fromTo(".storm__title span", { opacity: 0, yPercent: 40, scale: 0.92 }, { opacity: 1, yPercent: 0, scale: 1, duration: 0.8, stagger: 0.5 }, 2.6)
            .to({}, { duration: 1.2 });
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
              end: desktop ? "+=2400" : "+=1700",
              scrub: 0.6,
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

        // ── Números grandes: entram e contam (38 sobe, spam desce de 214 pra 5, VIP desce pra R$ 0)
        gsap.utils.toArray<HTMLElement>(".stat__num").forEach((el) => {
          gsap.from(el, {
            yPercent: 30,
            opacity: 0,
            duration: 1,
            ease: "power4.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          });
        });
        gsap.utils.toArray<HTMLElement>(".count").forEach((el) => {
          const de = Number(el.dataset.from);
          const ate = Number(el.dataset.to);
          const dec = Number(el.dataset.dec ?? 0);
          const fmtN = (v: number) =>
            v === ate
              ? ate.toLocaleString("pt-BR")
              : v.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
          const st = { v: de };
          el.textContent = fmtN(de);
          gsap.to(st, {
            v: ate,
            duration: 2.2,
            ease: "power3.out",
            onUpdate: () => {
              el.textContent = fmtN(dec ? st.v : Math.round(st.v));
            },
            scrollTrigger: { trigger: el, start: "top 85%" },
          });
        });
      },
    );

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      mm.revert();
      gsap.ticker.remove(raf);
      lenis?.destroy();
    };
  }, []);

  return null;
}
