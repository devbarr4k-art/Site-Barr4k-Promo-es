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
      lenis = new Lenis({ lerp: 0.11 });
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
          lenis?.scrollTo(el as HTMLElement, { offset: -20 });
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

        // ── Hero: entrada única + o celular "deita" conforme rola
        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
        intro
          .from(".hero__line > span", { yPercent: 110, duration: 1.1, stagger: 0.12 })
          .from(".hero__sub, .hero__ctas, .hero__proof", { opacity: 0, y: 18, duration: 0.8, stagger: 0.08 }, "-=0.6")
          .from(".hero__phone", { opacity: 0, y: 80, rotateX: 18, duration: 1.4 }, 0.15);

        gsap.to(".hero__phone .phone", {
          rotateY: 0,
          rotateX: 0,
          rotateZ: 0,
          y: desktop ? 60 : 20,
          ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to(".hero__glow", {
          scale: 1.35,
          opacity: 0.35,
          ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
        });

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
              end: desktop ? "+=2200" : "+=1600",
              scrub: 0.6,
              pin: ".drop__stage",
            },
          });
          tl.fromTo(".drop__product", { rotate: -5, scale: 0.9, y: 40 }, { rotate: 2, scale: 1, y: -10, duration: 3 }, 0)
            .to(state, {
              v: to,
              duration: 1.6,
              onUpdate: () => {
                if (priceEl) priceEl.textContent = fmt(Math.round(state.v));
              },
            }, 0.4)
            .fromTo(".drop__was", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.4)
            .fromTo(".drop__strike", { scaleX: 0 }, { scaleX: 1, duration: 0.4 }, 1.9)
            .fromTo(".drop__price", { color: "#F5F5F0" }, { color: "#C6FF00", duration: 0.3 }, 1.9)
            .fromTo(".drop__badge", { scale: 0, rotate: -40 }, { scale: 1, rotate: -8, duration: 0.35, ease: "back.out(2.5)" }, 2.0)
            .fromTo(".drop__glow", { opacity: 0.15 }, { opacity: 1, duration: 1 }, 1.6);

          gsap.utils.toArray<HTMLElement>(".drop__step").forEach((step, i) => {
            tl.fromTo(step, { opacity: 0.18 }, { opacity: 1, duration: 0.25 }, 0.3 + i * 0.95);
            tl.fromTo(step.querySelector(".drop__dot"), { scale: 0.4 }, { scale: 1, duration: 0.2 }, 0.3 + i * 0.95);
          });
          tl.to({}, { duration: 0.4 });
        }

        // ── Comparação: a conversa dos outros grupos não para
        gsap.utils.toArray<HTMLElement>(".chat--spam .chat__scroll").forEach((el, i) => {
          gsap.to(el, {
            yPercent: -50,
            ease: "none",
            duration: 14 + i * 3,
            repeat: -1,
          });
        });
        gsap.from(".chat--achou", {
          y: 60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: ".compare__grid", start: "top 70%" },
        });

        // ── Benefícios: cada card acende ao passar pelo meio da tela
        gsap.utils.toArray<HTMLElement>(".bento__card").forEach((card) => {
          ScrollTrigger.create({
            trigger: card,
            start: "top 62%",
            end: "bottom 38%",
            toggleClass: "is-lit",
          });
        });

        // ── Benefícios: a grade apaga e só as boas ficam acesas; a régua se enche
        gsap.from(".dots i", {
          opacity: 0,
          scale: 0.3,
          duration: 0.5,
          stagger: { each: 0.006, from: "random" },
          scrollTrigger: { trigger: ".dots", start: "top 80%" },
        });
        gsap.from(".ticks__line i", {
          scaleY: 0,
          transformOrigin: "bottom",
          duration: 0.4,
          stagger: 0.012,
          ease: "power2.out",
          scrollTrigger: { trigger: ".ticks", start: "top 80%" },
        });
        gsap.from(".ticket:not(.ticket--back)", {
          y: 40,
          rotate: 8,
          opacity: 0,
          duration: 0.9,
          ease: "back.out(1.6)",
          scrollTrigger: { trigger: ".tickets", start: "top 80%" },
        });

        // ── CTA final: o raio acende
        gsap.fromTo(".final__bolt", { scale: 0.6, opacity: 0.2 }, {
          scale: 1,
          opacity: 1,
          ease: "power2.out",
          scrollTrigger: { trigger: ".final", start: "top 80%", end: "center center", scrub: true },
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
