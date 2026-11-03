// Portuguese (pt-PT) site chrome. Status is "draft" in ./manifest.ts until a
// native speaker approves it - see content/i18n/pt/manifest.ts.
//
// Register: European Portuguese, same formal marketing voice and post-AO90
// spelling as ./pages/home.ts and ./pages/pricing.ts ("Preços", "Começar
// agora", "idioma", "privacidade").
//
// Uppercase nav: Portuguese keeps its diacritics in uppercase text, so PREÇOS
// and COMEÇAR AGORA carry the cedilla - dropping it would read as a typo, not
// as a style choice.
//
// "Dashboard" stays untranslated: it is the normal loanword in Portuguese SaaS
// UI and it is also the label the product itself uses. "AI Receptionist Now"
// is a product name and is never translated.

import type { UiCopy } from "../_ui-copy";

export const ptUi: UiCopy = {
  nav: {
    industries: "SETORES",
    pricing: "PREÇOS",
    signIn: "ENTRAR",
    startNow: "COMEÇAR AGORA",
    dashboard: "DASHBOARD",
    logout: "SAIR",
  },
  notFound: {
    metaTitle: "Página não encontrada",
    title: "A página que marcou não está disponível.",
    body: "Extensão errada, provavelmente. A nossa rececionista atende tudo. Esta fica por nossa conta.",
    home: "Voltar à receção",
    didYouMean: "Quis dizer",
    or: "ou",
    pricing: "Preços",
  },
  footer: {
    resources: "Recursos",
    industries: "Setores",
    compare: "Comparar",
    aiInformation: "Informação sobre IA",
    dataProtection: "Privacidade",
    terms: "Termos",
    support: "Suporte",
    blog: "Blog",
    answers: "Respostas",
    receptionist247: "Rececionista IA 24/7",
    askAi: "Pergunte a uma IA sobre o AI Receptionist Now",
    askAiProvider: "Pergunte a {name} sobre o AI Receptionist Now",
    voicePartner: "Parceiro de voz",
    gdprMark: "RGPD",
    gdprCompliant: "Em conformidade com o RGPD",
    language: "Idioma",
  },
  auth: {
    close: "Fechar",
    welcome: "Bem-vindo",
    defaultDescription: "Inicie sessão para gerir a sua rececionista com IA",
    signupDescription: "Crie a sua conta para configurar a sua rececionista com IA",
    continueGoogle: "Continuar com o Google",
    continueApple: "Continuar com a Apple",
    redirecting: "A redirecionar…",
    or: "ou",
    emailLabel: "E-mail",
    required: "Este campo é obrigatório.",
    emailInvalid: "Introduza um endereço de e-mail válido.",
    continueEmail: "Continuar com o e-mail",
    sendingCode: "A enviar código…",
    privacy: "Os seus dados estão seguros, protegidos e totalmente privados.",
    codeTitle: "Introduza o seu código",
    codeSent: "Enviámos um código de 6 dígitos para {email}.",
    codePattern: "Introduza o código de 6 dígitos.",
    verify: "Verificar e continuar",
    verifying: "A verificar…",
    differentEmail: "Usar outro e-mail",
    errors: {
      invalidCode: "O código está incorreto ou expirou. Verifique-o ou peça um novo.",
      rateLimited: "Demasiadas tentativas. Aguarde alguns minutos e tente novamente.",
      invalidEmail: "Introduza um endereço de e-mail válido.",
      notConfigured: "O início de sessão ainda não está configurado.",
      generic: "Algo correu mal. Tente novamente.",
    },
  },
};
