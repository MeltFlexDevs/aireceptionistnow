// Portuguese (pt-PT) pricing page copy. Status is "draft" in ../manifest.ts until
// a native speaker approves it - see content/i18n/pt/manifest.ts.
//
// Register: European Portuguese, same formal "voce" marketing voice and post-AO90
// spelling as ../pages/home.ts ("rececionista", "faturado", "contactos").
// Plan names ("Solo", "Team"), prices, currency symbols and the {total} token are
// product data and stay verbatim; only the words around them are translated.
// Thousands use a space separator (1 000 / 3 000), per pt-PT convention.

import type { PricingCopy } from "../../_pricing-copy";

export const ptPricing: PricingCopy = {
  metaTitle: "Rececionista virtual com IA: preços e planos sem fidelização",
  metaDescription:
    "Planos Solo e Team da rececionista virtual com IA, com pagamento mensal ou anual com 15% de desconto. Garantia de devolução em 30 dias.",
  guarantee: "Garantia de devolução do dinheiro em 30 dias",
  // H1 leads with the category term; a garantia de "simples e transparentes"
  // passou para o `sub`.
  h1: "Preços da rececionista virtual com IA",
  sub: "Simples e transparentes: escolha um plano e a sua rececionista virtual com IA começa a atender chamadas em minutos. Cancele quando quiser.",
  monthly: "Mensal",
  annually: "Anual",
  perMonth: "/ mês",
  billedMonthly: "faturado mensalmente",
  billedYearlyTemplate: "{total} faturados anualmente",
  includedLabel: "Incluído",
  featuresLabel: "Funcionalidades",
  cta: "Começar agora",
  ctaBusy: "A iniciar…",
  checkoutError: "Não foi possível iniciar o pagamento.",
  vatNote:
    "Preços em EUR, sem IVA. Minutos adicionais faturados a €0,09/min.",
  plans: {
    solo: {
      name: "Solo",
      tagline: "Ideal para 1-20 chamadas por dia",
      included: [
        "1000 minutos - €0,09 por minuto adicional",
        "1 000 contactos",
        "Sem chamadas em simultâneo",
        "1 número de telefone - €7/mês por número adicional",
        "Assistentes",
        "1 utilizador",
      ],
      features: ["Mais de 20 vozes", "Mais de 25 idiomas", "Agendamento"],
    },
    team: {
      name: "Team",
      tagline: "Ideal para 20-100 chamadas por dia",
      included: [
        "3000 minutos - €0,09 por minuto adicional",
        "3 000 contactos",
        "3 chamadas em simultâneo",
        "3 números de telefone - €7/mês por número adicional",
        "Assistentes",
        "Utilizadores",
      ],
      features: [
        "Tudo o que o Solo inclui",
        "Ligação ao seu próprio SIP",
        "Chamadas de saída e campanhas",
      ],
    },
  },
};
