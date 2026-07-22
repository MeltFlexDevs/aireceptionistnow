// Spanish pricing page copy. Status is "draft" in ../manifest.ts until a native
// speaker approves it - see content/i18n/es/manifest.ts.
//
// Register: neutral international Spanish, usted throughout (never vosotros),
// matching ./home.ts. Recurring terms follow the home page: "recepcionista con
// IA", "asistentes", "agenda citas", "Empezar ahora".
//
// Plan names "Solo" and "Team" are product names and stay in English. Prices,
// currency symbols and figures are copied verbatim from the English source;
// only the words around them are translated. Thousands use the Spanish dot
// separator (1.000 / 3.000). The {total} token in billedYearlyTemplate is
// substituted at runtime and must survive as-is.

import type { PricingCopy } from "../../_pricing-copy";

export const esPricing: PricingCopy = {
  guarantee: "Garantía de devolución de 30 días",
  h1: "Precios simples y transparentes",
  sub: "Elija un plan y su recepcionista con IA estará contestando llamadas en cuestión de minutos. Cancele cuando quiera.",
  monthly: "Mensual",
  annually: "Anual",
  perMonth: "/ mes",
  billedMonthly: "facturado mensualmente",
  billedYearlyTemplate: "{total} facturado anualmente",
  includedLabel: "Incluido",
  featuresLabel: "Funciones",
  cta: "Empezar ahora",
  ctaBusy: "Iniciando...",
  checkoutError: "No se pudo iniciar el pago.",
  vatNote:
    "Precios en EUR, sin IVA. Los minutos adicionales se facturan a €0,09/min.",
  plans: {
    solo: {
      name: "Solo",
      tagline: "Ideal para 1-20 llamadas al día",
      included: [
        "1.000 minutos - €0,09 por minuto adicional",
        "1.000 contactos",
        "Sin llamadas simultáneas",
        "1 número de teléfono - €7/mes por cada número adicional",
        "Asistentes",
        "1 usuario",
      ],
      features: ["Más de 20 voces", "Más de 25 idiomas", "Agenda de citas"],
    },
    team: {
      name: "Team",
      tagline: "Ideal para 20-100 llamadas al día",
      included: [
        "3.000 minutos - €0,09 por minuto adicional",
        "3.000 contactos",
        "3 llamadas simultáneas",
        "3 números de teléfono - €7/mes por cada número adicional",
        "Asistentes",
        "Usuarios",
      ],
      features: [
        "Todo lo del plan Solo",
        "Conecte su propio SIP",
        "Llamadas salientes y campañas",
      ],
    },
  },
};
