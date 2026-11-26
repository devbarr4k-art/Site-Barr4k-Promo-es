import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { qualities: [75, 95] },
  // fontes da arte dos posts (lidas do disco nas funções da automação)
  outputFileTracingIncludes: { "/api/automacao/**": ["./lib/automacao/fontes/*"], "/admin/**": ["./lib/automacao/fontes/*"] },
};

export default nextConfig;
