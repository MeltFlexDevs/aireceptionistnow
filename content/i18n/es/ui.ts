// Spanish site chrome. Status is "draft" in ./manifest.ts until a native
// speaker approves it - see content/i18n/es/manifest.ts.
//
// Register: neutral international Spanish, matching ./pages/home.ts and
// ./pages/pricing.ts. "Empezar ahora" is the brand CTA on both pages and is
// reused verbatim (uppercased) for nav.startNow. "Precios" is the pricing page
// h1 wording. "Sectores" is the idiomatic Spanish for business verticals;
// "Industrias" is a false friend that reads as heavy industry.
//
// Nav labels are uppercase because the header styles them that way, matching
// ../en/ui.ts. Per RAE, uppercase Spanish keeps its diacritics - none of the
// chosen nav labels carry one, but the footer keeps "Información" accented.
//
// "AI Receptionist Now" is never translated. "Dashboard" is rendered as
// "PANEL": the loanword is understood, but "panel" is the standard Spanish
// product term and is 4 characters shorter, which matters in a fixed-height
// header sitting next to the CTA button.

import type { UiCopy } from "../_ui-copy";

export const esUi: UiCopy = {
  nav: {
    industries: "SECTORES",
    pricing: "PRECIOS",
    signIn: "ENTRAR",
    startNow: "EMPEZAR AHORA",
    dashboard: "PANEL",
    logout: "CERRAR SESIÓN",
  },
  notFound: {
    metaTitle: "Página no encontrada",
    title: "La página marcada no está disponible.",
    body: "Extensión equivocada, seguramente. Nuestra recepcionista contesta todo. Esta corre por nuestra cuenta.",
    home: "Volver a recepción",
    didYouMean: "¿Quiso decir",
    or: "o",
    pricing: "Precios",
  },
  footer: {
    resources: "Recursos",
    industries: "Sectores",
    compare: "Comparativas",
    aiInformation: "Información sobre IA",
    dataProtection: "Privacidad",
    terms: "Términos",
    support: "Soporte",
    blog: "Blog",
    answers: "Respuestas",
    receptionist247: "Recepcionista IA 24/7",
    askAi: "Pregunte a una IA sobre AI Receptionist Now",
    askAiProvider: "Pregunte a {name} sobre AI Receptionist Now",
    voicePartner: "Socio de voz",
    gdprMark: "RGPD",
    gdprCompliant: "Cumple el RGPD",
    language: "Idioma",
  },
  auth: {
    close: "Cerrar",
    welcome: "Bienvenido",
    defaultDescription: "Inicie sesión para gestionar su recepcionista con IA",
    signupDescription: "Cree su cuenta para configurar su recepcionista con IA",
    continueGoogle: "Continuar con Google",
    continueApple: "Continuar con Apple",
    redirecting: "Redirigiendo…",
    or: "o",
    emailLabel: "Correo electrónico",
    required: "Este campo es obligatorio.",
    emailInvalid: "Introduzca una dirección de correo válida.",
    continueEmail: "Continuar con el correo",
    sendingCode: "Enviando código…",
    privacy: "Sus datos están seguros, protegidos y son totalmente privados.",
    codeTitle: "Introduzca su código",
    codeSent: "Hemos enviado un código de 6 dígitos a {email}.",
    codePattern: "Introduzca el código de 6 dígitos.",
    verify: "Verificar y continuar",
    verifying: "Verificando…",
    differentEmail: "Usar otro correo",
    errors: {
      invalidCode: "El código es incorrecto o ha caducado. Revíselo o solicite uno nuevo.",
      rateLimited: "Demasiados intentos. Espere unos minutos e inténtelo de nuevo.",
      invalidEmail: "Introduzca una dirección de correo válida.",
      notConfigured: "El inicio de sesión aún no está configurado.",
      generic: "Algo salió mal. Inténtelo de nuevo.",
    },
  },
};
