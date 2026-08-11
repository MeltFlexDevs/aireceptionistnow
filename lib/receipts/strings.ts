/**
 * The receipt page's own copy, in the caller's language.
 *
 * Deliberately separate from `lib/i18n/dictionaries`, which is the dashboard's
 * vocabulary in the OWNER's language. These two are never the same reader: a
 * Slovak dentist runs a Slovak dashboard and takes calls from Germans, and the
 * receipt has to speak German while the dashboard speaks Slovak.
 *
 * Kept to a dozen strings on purpose. The page's substance - the recap - is
 * already written in the caller's language by the summarizer; this is only the
 * furniture around it, and furniture that needs a translation pipeline is
 * furniture that will sit untranslated.
 */

export interface ReceiptStrings {
  heading: string;
  intro: string;
  appointment: string;
  listen: string;
  looksRight: string;
  somethingWrong: string;
  correctionPrompt: string;
  correctionPlaceholder: string;
  send: string;
  thanksConfirmed: string;
  thanksCorrected: string;
  expired: string;
  pending: string;
  privacy: string;
}

const en: ReceiptStrings = {
  heading: "Your call with",
  intro: "Here is what we understood. If any of it is wrong, tell us - it takes one tap.",
  appointment: "Your appointment",
  listen: "Listen to the call",
  looksRight: "That's right",
  somethingWrong: "Something's wrong",
  correctionPrompt: "What did we get wrong?",
  correctionPlaceholder: "You booked me for Thursday, I asked for Friday.",
  send: "Send",
  thanksConfirmed: "Thanks for confirming.",
  thanksCorrected: "Thank you - this has gone straight to the team, and they will be in touch.",
  expired: "This link has expired.",
  pending: "We are still writing this up. Check back in a minute.",
  privacy: "This page is only visible to whoever has this link. It expires automatically.",
};

/**
 * Only the languages the marketing site and dashboard already speak. A caller
 * whose language is not here reads the English chrome around a recap that is
 * still in their own language, which is a far better failure than a page half
 * in machine-translated Polish.
 */
const STRINGS: Record<string, ReceiptStrings> = {
  en,
  de: {
    heading: "Ihr Anruf bei",
    intro: "Das haben wir verstanden. Falls etwas nicht stimmt, sagen Sie uns Bescheid - ein Tipp genügt.",
    appointment: "Ihr Termin",
    listen: "Anruf anhören",
    looksRight: "Das stimmt",
    somethingWrong: "Etwas stimmt nicht",
    correctionPrompt: "Was haben wir falsch verstanden?",
    correctionPlaceholder: "Sie haben Donnerstag eingetragen, ich wollte Freitag.",
    send: "Senden",
    thanksConfirmed: "Danke für die Bestätigung.",
    thanksCorrected: "Vielen Dank - das geht direkt an das Team, es meldet sich bei Ihnen.",
    expired: "Dieser Link ist abgelaufen.",
    pending: "Wir fassen das gerade zusammen. Schauen Sie in einer Minute noch einmal.",
    privacy: "Diese Seite sieht nur, wer diesen Link hat. Sie läuft automatisch ab.",
  },
  es: {
    heading: "Su llamada con",
    intro: "Esto es lo que entendimos. Si algo no es correcto, díganoslo - basta con un toque.",
    appointment: "Su cita",
    listen: "Escuchar la llamada",
    looksRight: "Es correcto",
    somethingWrong: "Hay algo mal",
    correctionPrompt: "¿Qué entendimos mal?",
    correctionPlaceholder: "Me reservaron el jueves, yo pedí el viernes.",
    send: "Enviar",
    thanksConfirmed: "Gracias por confirmar.",
    thanksCorrected: "Gracias - esto llega directamente al equipo y se pondrán en contacto.",
    expired: "Este enlace ha caducado.",
    pending: "Todavía lo estamos redactando. Vuelva a mirar en un minuto.",
    privacy: "Esta página solo la ve quien tenga este enlace. Caduca automáticamente.",
  },
  fr: {
    heading: "Votre appel avec",
    intro: "Voici ce que nous avons compris. Si quelque chose est faux, dites-le nous - un seul geste suffit.",
    appointment: "Votre rendez-vous",
    listen: "Écouter l'appel",
    looksRight: "C'est exact",
    somethingWrong: "Il y a une erreur",
    correctionPrompt: "Qu'avons-nous mal compris ?",
    correctionPlaceholder: "Vous avez noté jeudi, j'avais demandé vendredi.",
    send: "Envoyer",
    thanksConfirmed: "Merci de votre confirmation.",
    thanksCorrected: "Merci - le message part directement à l'équipe, qui vous recontactera.",
    expired: "Ce lien a expiré.",
    pending: "Nous sommes en train de le rédiger. Revenez dans une minute.",
    privacy: "Cette page n'est visible que par la personne qui a ce lien. Elle expire automatiquement.",
  },
  it: {
    heading: "La sua chiamata con",
    intro: "Ecco cosa abbiamo capito. Se qualcosa non va, ce lo dica - basta un tocco.",
    appointment: "Il suo appuntamento",
    listen: "Ascolta la chiamata",
    looksRight: "È corretto",
    somethingWrong: "C'è un errore",
    correctionPrompt: "Che cosa abbiamo capito male?",
    correctionPlaceholder: "Mi avete prenotato giovedì, avevo chiesto venerdì.",
    send: "Invia",
    thanksConfirmed: "Grazie per la conferma.",
    thanksCorrected: "Grazie - la segnalazione va direttamente al team, che la ricontatterà.",
    expired: "Questo link è scaduto.",
    pending: "Lo stiamo ancora scrivendo. Riprovi tra un minuto.",
    privacy: "Questa pagina è visibile solo a chi ha questo link. Scade automaticamente.",
  },
  nl: {
    heading: "Uw gesprek met",
    intro: "Dit hebben wij begrepen. Klopt er iets niet, laat het ons weten - één tik is genoeg.",
    appointment: "Uw afspraak",
    listen: "Gesprek beluisteren",
    looksRight: "Dat klopt",
    somethingWrong: "Er klopt iets niet",
    correctionPrompt: "Wat hebben wij verkeerd begrepen?",
    correctionPlaceholder: "U heeft donderdag genoteerd, ik vroeg om vrijdag.",
    send: "Versturen",
    thanksConfirmed: "Bedankt voor de bevestiging.",
    thanksCorrected: "Dank u - dit gaat rechtstreeks naar het team en zij nemen contact op.",
    expired: "Deze link is verlopen.",
    pending: "We zijn dit nog aan het uitwerken. Kijk over een minuut nog eens.",
    privacy: "Deze pagina is alleen zichtbaar voor wie deze link heeft. Hij verloopt automatisch.",
  },
  pt: {
    heading: "A sua chamada com",
    intro: "Foi isto que percebemos. Se algo estiver errado, diga-nos - basta um toque.",
    appointment: "A sua marcação",
    listen: "Ouvir a chamada",
    looksRight: "Está correto",
    somethingWrong: "Há algo errado",
    correctionPrompt: "O que percebemos mal?",
    correctionPlaceholder: "Marcaram-me para quinta, eu pedi sexta.",
    send: "Enviar",
    thanksConfirmed: "Obrigado pela confirmação.",
    thanksCorrected: "Obrigado - segue diretamente para a equipa, que entrará em contacto.",
    expired: "Esta ligação expirou.",
    pending: "Ainda estamos a escrever isto. Volte daqui a um minuto.",
    privacy: "Esta página só é visível a quem tiver esta ligação. Expira automaticamente.",
  },
  sk: {
    heading: "Váš hovor s",
    intro: "Toto sme pochopili. Ak niečo nesedí, dajte nám vedieť - stačí jedno kliknutie.",
    appointment: "Váš termín",
    listen: "Vypočuť hovor",
    looksRight: "Súhlasí",
    somethingWrong: "Niečo nesedí",
    correctionPrompt: "Čo sme pochopili zle?",
    correctionPlaceholder: "Objednali ste ma na štvrtok, žiadal som piatok.",
    send: "Odoslať",
    thanksConfirmed: "Ďakujeme za potvrdenie.",
    thanksCorrected: "Ďakujeme - ide to priamo tímu a ozve sa vám.",
    expired: "Platnosť tohto odkazu vypršala.",
    pending: "Ešte to spisujeme. Skúste to o minútu.",
    privacy: "Túto stránku vidí len ten, kto má tento odkaz. Automaticky expiruje.",
  },
  cs: {
    heading: "Váš hovor s",
    intro: "Toto jsme pochopili. Pokud něco nesedí, dejte nám vědět - stačí jedno kliknutí.",
    appointment: "Váš termín",
    listen: "Přehrát hovor",
    looksRight: "Souhlasí",
    somethingWrong: "Něco nesedí",
    correctionPrompt: "Co jsme pochopili špatně?",
    correctionPlaceholder: "Objednali jste mě na čtvrtek, žádal jsem pátek.",
    send: "Odeslat",
    thanksConfirmed: "Děkujeme za potvrzení.",
    thanksCorrected: "Děkujeme - jde to přímo týmu a ozve se vám.",
    expired: "Platnost tohoto odkazu vypršela.",
    pending: "Ještě to sepisujeme. Zkuste to za minutu.",
    privacy: "Tuto stránku vidí jen ten, kdo má tento odkaz. Automaticky vyprší.",
  },
  pl: {
    heading: "Twoja rozmowa z",
    intro: "Oto co zrozumieliśmy. Jeśli coś się nie zgadza, daj nam znać - wystarczy jedno kliknięcie.",
    appointment: "Twoja wizyta",
    listen: "Odsłuchaj rozmowę",
    looksRight: "Zgadza się",
    somethingWrong: "Coś się nie zgadza",
    correctionPrompt: "Co źle zrozumieliśmy?",
    correctionPlaceholder: "Zapisaliście mnie na czwartek, prosiłem o piątek.",
    send: "Wyślij",
    thanksConfirmed: "Dziękujemy za potwierdzenie.",
    thanksCorrected: "Dziękujemy - trafia to prosto do zespołu, który się odezwie.",
    expired: "Ten link wygasł.",
    pending: "Wciąż to spisujemy. Sprawdź za minutę.",
    privacy: "Tę stronę widzi tylko osoba z tym linkiem. Wygasa automatycznie.",
  },
};

export function receiptStrings(language: string | null | undefined): ReceiptStrings {
  const code = (language ?? "").slice(0, 2).toLowerCase();
  return STRINGS[code] ?? en;
}

/** The `lang` attribute for the rendered page, so screen readers pronounce it. */
export function receiptLang(language: string | null | undefined): string {
  const code = (language ?? "").slice(0, 2).toLowerCase();
  return STRINGS[code] ? code : "en";
}
