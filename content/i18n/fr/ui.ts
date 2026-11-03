// French site chrome. Status is "draft" in ./manifest.ts until a native speaker
// approves it - see content/i18n/fr/manifest.ts.
//
// Register: vouvoiement, same brand voice as ./pages/home.ts and
// ./pages/pricing.ts. The pricing page calls the concept "tarification" /
// "Tarifs", so the nav says TARIFS. "Secteurs" is the standard French label for
// the industries concept and is far shorter than "Secteurs d'activite".
//
// Nav labels are uppercase because the header styles them that way. French
// typographic convention (Academie francaise, Imprimerie nationale) keeps
// diacritics on capitals, so accents would be preserved here - but none of the
// five chosen nav labels contain an accented letter, so the question does not
// arise. "Dashboard" is kept as the loanword: it is the normal term in French
// SaaS products and "Tableau de bord" (15 chars) would break the header.
// "AI Receptionist Now" is never translated.
//
// Footer stays sentence case. The privacy link is "Confidentialite" (with the
// accent), matching home.ts which already says "politique de confidentialite".
// Full Unicode diacritics, straight ASCII apostrophes only.

import type { UiCopy } from "../_ui-copy";

export const frUi: UiCopy = {
  nav: {
    industries: "SECTEURS",
    pricing: "TARIFS",
    signIn: "CONNEXION",
    startNow: "COMMENCER",
    dashboard: "DASHBOARD",
    logout: "DÉCONNEXION",
  },
  notFound: {
    metaTitle: "Page introuvable",
    title: "Il n'y a pas d'abonné à la page demandée.",
    body: "Mauvais poste, sans doute. Notre standardiste répond à tout. Celle-ci est pour nous.",
    home: "Retour à l'accueil",
    didYouMean: "Vouliez-vous dire",
    or: "ou",
    pricing: "Tarifs",
  },
  footer: {
    resources: "Ressources",
    industries: "Secteurs",
    compare: "Comparatifs",
    aiInformation: "Informations IA",
    dataProtection: "Confidentialité",
    terms: "Conditions",
    support: "Assistance",
    blog: "Blog",
    answers: "Réponses",
    receptionist247: "Standardiste IA 24/7",
    askAi: "Interrogez une IA sur AI Receptionist Now",
    askAiProvider: "Interrogez {name} sur AI Receptionist Now",
    voicePartner: "Partenaire vocal",
    gdprMark: "RGPD",
    gdprCompliant: "Conforme au RGPD",
    language: "Langue",
  },
  auth: {
    close: "Fermer",
    welcome: "Bienvenue",
    defaultDescription: "Connectez-vous pour gérer votre standardiste IA",
    signupDescription: "Créez votre compte pour configurer votre standardiste IA",
    continueGoogle: "Continuer avec Google",
    continueApple: "Continuer avec Apple",
    redirecting: "Redirection…",
    or: "ou",
    emailLabel: "E-mail",
    required: "Ce champ est obligatoire.",
    emailInvalid: "Saisissez une adresse e-mail valide.",
    continueEmail: "Continuer avec l'e-mail",
    sendingCode: "Envoi du code…",
    privacy: "Vos données sont sûres, protégées et entièrement privées.",
    codeTitle: "Saisissez votre code",
    codeSent: "Nous avons envoyé un code à 6 chiffres à {email}.",
    codePattern: "Saisissez le code à 6 chiffres.",
    verify: "Vérifier et continuer",
    verifying: "Vérification…",
    differentEmail: "Utiliser une autre adresse e-mail",
    errors: {
      invalidCode: "Le code est incorrect ou a expiré. Vérifiez-le ou demandez-en un nouveau.",
      rateLimited: "Trop de tentatives. Patientez quelques minutes puis réessayez.",
      invalidEmail: "Saisissez une adresse e-mail valide.",
      notConfigured: "La connexion n'est pas encore configurée.",
      generic: "Un problème est survenu. Veuillez réessayer.",
    },
  },
};
