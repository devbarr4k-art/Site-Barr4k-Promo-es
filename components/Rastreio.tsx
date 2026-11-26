"use client";

import { useEffect } from "react";
import { rastrear } from "@/lib/rastrear";

// Conta a visita (uma por aba aberta) com a origem: utm_source ou o site de onde veio.
export function Rastreio() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("achou_visita")) return;
      sessionStorage.setItem("achou_visita", "1");
    } catch {}
    const q = new URLSearchParams(location.search);
    rastrear("visita", { u: q.get("utm_source") ?? q.get("ref"), r: document.referrer });
  }, []);
  return null;
}
