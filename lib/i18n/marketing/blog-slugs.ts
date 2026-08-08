import type { MarketingLocale } from "./locales";

// Localized blog URL slugs.
//
// A translated article on an English URL wins nothing: the slug is a ranking
// surface, and a German reader searches "telefonservice zahnarztpraxis", not
// "dental answering service". So every locale gets its own keyword-first slug
// rather than a transliteration of the English one.
//
// STRUCTURAL RULE, same as manifest.ts: flat data only, no content imports.
// The router, sitemap, hreflang builder and locale switcher all resolve URLs
// through here, so a slug can never mean one path in one place and another
// somewhere else.
//
// Rules for adding a slug:
//  - ASCII only, lowercase, hyphenated. No diacritics: "sanitaer" not
//    "sanitär", "precos" not "preços". Percent-encoded UTF-8 in a URL is ugly
//    in a SERP and breaks copy-paste.
//  - Lead with the head term the market actually searches for, not a literal
//    translation of the English words.
//  - Unique within a locale. The reverse lookup below asserts this at module
//    load, so a collision fails the build rather than shadowing a post.
//  - Never edit a published slug. A changed slug is a new URL that drops the
//    old one's history; if it must change, ship a redirect with it.
//
// NOT TRANSLATED: ai-receptionist-orange-county. It is a US local-SEO page
// targeting a California county. A Slovak or Dutch version would target a
// place its readers cannot hire us from, which is doorway content, not
// localization. It stays English-only and simply has no hreflang cluster.
export const BLOG_SLUGS = {
  "24-7-ai-receptionist": {
    de: "24-7-ki-telefonassistent",
    es: "recepcionista-ia-24-7",
    fr: "standardiste-ia-24-7",
    sk: "ai-recepcna-24-7",
    it: "receptionist-ai-24-7",
    pt: "rececionista-ia-24-7",
    nl: "ai-receptionist-24-7",
  },
  "24-hour-answering-service": {
    de: "24-stunden-telefonservice",
    es: "servicio-de-atencion-telefonica-24-horas",
    fr: "permanence-telephonique-24h",
    sk: "nonstop-telefonicka-sluzba",
    it: "servizio-risposta-telefonica-24-ore",
    pt: "atendimento-telefonico-24-horas",
    nl: "24-uurs-telefoonservice",
  },
  "after-hours-answering-service": {
    de: "telefonservice-nach-feierabend",
    es: "servicio-de-atencion-telefonica-fuera-de-horario",
    fr: "permanence-telephonique-hors-horaires",
    sk: "telefonicka-sluzba-mimo-pracovnej-doby",
    it: "servizio-risposta-fuori-orario",
    pt: "atendimento-telefonico-fora-de-horario",
    nl: "telefoonservice-buiten-kantooruren",
  },
  "ai-receptionist-appointment-booking": {
    de: "ki-telefonassistent-terminbuchung",
    es: "recepcionista-ia-reserva-de-citas",
    fr: "standardiste-ia-prise-de-rendez-vous",
    sk: "ai-recepcna-objednavanie-terminov",
    it: "receptionist-ai-prenotazione-appuntamenti",
    pt: "rececionista-ia-marcacao-de-consultas",
    nl: "ai-receptionist-afspraken-inplannen",
  },
  "ai-receptionist-for-home-services": {
    de: "ki-telefonassistent-handwerksbetriebe",
    es: "recepcionista-ia-para-servicios-del-hogar",
    fr: "standardiste-ia-pour-artisans",
    sk: "ai-recepcna-pre-remeselnikov",
    it: "receptionist-ai-per-artigiani",
    pt: "rececionista-ia-para-servicos-domesticos",
    nl: "ai-receptionist-voor-klusbedrijven",
  },
  "ai-receptionist-for-it-companies": {
    de: "ki-telefonassistent-it-unternehmen",
    es: "recepcionista-ia-para-empresas-de-ti",
    fr: "standardiste-ia-pour-entreprises-informatiques",
    sk: "ai-recepcna-pre-it-firmy",
    it: "receptionist-ai-per-aziende-it",
    pt: "rececionista-ia-para-empresas-de-ti",
    nl: "ai-receptionist-voor-it-bedrijven",
  },
  "ai-receptionist-pricing": {
    de: "ki-telefonassistent-preise",
    es: "precios-recepcionista-ia",
    fr: "tarifs-standardiste-ia",
    sk: "ai-recepcna-cennik",
    it: "prezzi-receptionist-ai",
    pt: "precos-rececionista-ia",
    nl: "ai-receptionist-prijzen",
  },
  "ai-receptionist-prompts": {
    de: "ki-telefonassistent-prompts",
    es: "prompts-para-recepcionista-ia",
    fr: "prompts-standardiste-ia",
    sk: "prompty-pre-ai-recepcnu",
    it: "prompt-per-receptionist-ai",
    pt: "prompts-para-rececionista-ia",
    nl: "ai-receptionist-prompts",
  },
  "ai-receptionist-vs-virtual-receptionist-vs-answering-service": {
    de: "ki-telefonassistent-vs-telefonservice-vergleich",
    es: "recepcionista-ia-vs-recepcionista-virtual-vs-servicio-de-atencion",
    fr: "standardiste-ia-vs-telesecretariat-vs-permanence-telephonique",
    sk: "ai-recepcna-vs-virtualna-recepcna-vs-odkazova-sluzba",
    it: "receptionist-ai-vs-receptionist-virtuale-vs-segreteria",
    pt: "rececionista-ia-vs-rececionista-virtual-vs-atendimento",
    nl: "ai-receptionist-vs-virtuele-receptionist-vs-telefoonservice",
  },
  "answering-service-cost": {
    de: "telefonservice-kosten",
    es: "coste-servicio-de-atencion-telefonica",
    fr: "prix-permanence-telephonique",
    sk: "cena-telefonickej-sluzby",
    it: "costo-servizio-risposta-telefonica",
    pt: "custo-atendimento-telefonico",
    nl: "telefoonservice-kosten",
  },
  "answering-service-for-small-business": {
    de: "telefonservice-kleinunternehmen",
    es: "servicio-de-atencion-telefonica-para-pymes",
    fr: "permanence-telephonique-pour-tpe",
    sk: "telefonicka-sluzba-pre-male-firmy",
    it: "servizio-risposta-telefonica-per-piccole-imprese",
    pt: "atendimento-telefonico-para-pequenas-empresas",
    nl: "telefoonservice-voor-kleine-bedrijven",
  },
  "answering-service-for-therapists": {
    de: "telefonservice-fuer-psychotherapeuten",
    es: "atencion-telefonica-para-psicologos",
    fr: "permanence-telephonique-psychologue",
    sk: "telefonicka-sluzba-pre-psychologov",
    it: "servizio-risposta-per-psicologi",
    pt: "atendimento-telefonico-para-psicologos",
    nl: "telefoonservice-voor-psychologen",
  },
  "apartment-answering-service": {
    de: "telefonservice-mietwohnungen",
    es: "servicio-de-atencion-telefonica-para-comunidades",
    fr: "permanence-telephonique-gestion-locative",
    sk: "telefonicka-sluzba-pre-bytove-domy",
    it: "servizio-risposta-per-condomini",
    pt: "atendimento-telefonico-para-condominios",
    nl: "telefoonservice-voor-huurwoningen",
  },
  "auto-repair-answering-service": {
    de: "telefonservice-autowerkstatt",
    es: "atencion-telefonica-para-talleres-mecanicos",
    fr: "permanence-telephonique-garage-automobile",
    sk: "telefonicka-sluzba-pre-autoservisy",
    it: "servizio-risposta-per-officine-meccaniche",
    pt: "atendimento-telefonico-para-oficinas-auto",
    nl: "telefoonservice-voor-autogarages",
  },
  "best-ai-receptionist": {
    de: "bester-ki-telefonassistent",
    es: "mejor-recepcionista-ia",
    fr: "meilleure-standardiste-ia",
    sk: "najlepsia-ai-recepcna",
    it: "miglior-receptionist-ai",
    pt: "melhor-rececionista-ia",
    nl: "beste-ai-receptionist",
  },
  "bilingual-ai-receptionist": {
    de: "mehrsprachiger-ki-telefonassistent",
    es: "recepcionista-ia-bilingue",
    fr: "standardiste-ia-bilingue",
    sk: "dvojjazycna-ai-recepcna",
    it: "receptionist-ai-bilingue",
    pt: "rececionista-ia-bilingue",
    nl: "tweetalige-ai-receptionist",
  },
  "can-an-ai-receptionist-replace-a-human-receptionist": {
    de: "kann-ki-telefonassistent-empfangsmitarbeiter-ersetzen",
    es: "puede-una-recepcionista-ia-sustituir-a-una-persona",
    fr: "une-standardiste-ia-peut-elle-remplacer-un-humain",
    sk: "moze-ai-recepcna-nahradit-cloveka",
    it: "un-receptionist-ai-puo-sostituire-una-persona",
    pt: "pode-uma-rececionista-ia-substituir-uma-pessoa",
    nl: "kan-een-ai-receptionist-een-mens-vervangen",
  },
  "cleaning-company-answering-service": {
    de: "telefonservice-reinigungsfirma",
    es: "atencion-telefonica-para-empresas-de-limpieza",
    fr: "permanence-telephonique-entreprise-de-nettoyage",
    sk: "telefonicka-sluzba-pre-upratovacie-firmy",
    it: "servizio-risposta-per-imprese-di-pulizie",
    pt: "atendimento-telefonico-para-empresas-de-limpeza",
    nl: "telefoonservice-voor-schoonmaakbedrijven",
  },
  "contractor-answering-service": {
    de: "telefonservice-bauunternehmen",
    es: "servicio-de-atencion-telefonica-para-contratistas",
    fr: "permanence-telephonique-batiment",
    sk: "telefonicka-sluzba-pre-stavebne-firmy",
    it: "servizio-risposta-per-imprese-edili",
    pt: "atendimento-telefonico-para-empreiteiros",
    nl: "telefoonservice-voor-aannemers",
  },
  "cost-of-a-missed-call": {
    de: "kosten-verpasster-anrufe",
    es: "coste-de-una-llamada-perdida",
    fr: "cout-d-un-appel-manque",
    sk: "cena-zmeskaneho-hovoru",
    it: "costo-di-una-chiamata-persa",
    pt: "custo-de-uma-chamada-perdida",
    nl: "kosten-van-een-gemiste-oproep",
  },
  "dental-answering-service": {
    de: "telefonservice-zahnarztpraxis",
    es: "servicio-de-atencion-telefonica-para-dentistas",
    fr: "permanence-telephonique-cabinet-dentaire",
    sk: "telefonicka-sluzba-pre-zubarov",
    it: "servizio-risposta-per-studi-dentistici",
    pt: "atendimento-telefonico-para-dentistas",
    nl: "telefoonservice-voor-tandartsen",
  },
  "do-ai-voices-sound-human-on-the-phone": {
    de: "klingen-ki-stimmen-am-telefon-menschlich",
    es: "suenan-humanas-las-voces-de-ia-al-telefono",
    fr: "les-voix-ia-semblent-elles-humaines-au-telephone",
    sk: "znie-ai-hlas-po-telefone-ako-clovek",
    it: "le-voci-ai-sembrano-umane-al-telefono",
    pt: "as-vozes-de-ia-parecem-humanas-ao-telefone",
    nl: "klinken-ai-stemmen-menselijk-aan-de-telefoon",
  },
  "electrician-answering-service": {
    de: "telefonservice-elektriker",
    es: "servicio-de-atencion-telefonica-para-electricistas",
    fr: "permanence-telephonique-electricien",
    sk: "telefonicka-sluzba-pre-elektrikarov",
    it: "servizio-risposta-per-elettricisti",
    pt: "atendimento-telefonico-para-eletricistas",
    nl: "telefoonservice-voor-elektriciens",
  },
  "funeral-home-answering-service": {
    de: "telefonservice-bestattungsunternehmen",
    es: "atencion-telefonica-para-funerarias",
    fr: "permanence-telephonique-pompes-funebres",
    sk: "telefonicka-sluzba-pre-pohrebne-sluzby",
    it: "servizio-risposta-per-onoranze-funebri",
    pt: "atendimento-telefonico-para-funerarias",
    nl: "telefoonservice-voor-uitvaartondernemingen",
  },
  "home-care-answering-service": {
    de: "telefonservice-ambulante-pflege",
    es: "atencion-telefonica-para-ayuda-a-domicilio",
    fr: "permanence-telephonique-aide-a-domicile",
    sk: "telefonicka-sluzba-pre-opatrovatelske-sluzby",
    it: "servizio-risposta-per-assistenza-domiciliare",
    pt: "atendimento-telefonico-para-apoio-domiciliario",
    nl: "telefoonservice-voor-thuiszorg",
  },
  "how-to-choose-an-ai-receptionist": {
    de: "ki-telefonassistent-richtig-auswaehlen",
    es: "como-elegir-una-recepcionista-ia",
    fr: "comment-choisir-une-standardiste-ia",
    sk: "ako-vybrat-ai-recepcnu",
    it: "come-scegliere-un-receptionist-ai",
    pt: "como-escolher-uma-rececionista-ia",
    nl: "hoe-kies-je-een-ai-receptionist",
  },
  "how-to-forward-calls-to-an-answering-service": {
    de: "anrufe-an-telefonservice-weiterleiten",
    es: "como-desviar-llamadas-a-un-servicio-de-atencion",
    fr: "comment-transferer-ses-appels-vers-une-permanence",
    sk: "ako-presmerovat-hovory-na-telefonicku-sluzbu",
    it: "come-deviare-le-chiamate-a-un-servizio-di-risposta",
    pt: "como-encaminhar-chamadas-para-atendimento",
    nl: "gesprekken-doorschakelen-naar-telefoonservice",
  },
  "how-to-replace-front-desk-receptionist-with-ai": {
    de: "empfang-durch-ki-ersetzen",
    es: "sustituir-la-recepcion-por-ia",
    fr: "remplacer-l-accueil-telephonique-par-l-ia",
    sk: "ako-nahradit-recepciu-umelou-inteligenciou",
    it: "sostituire-la-reception-con-l-ai",
    pt: "substituir-a-rececao-por-ia",
    nl: "receptie-vervangen-door-ai",
  },
  "how-to-set-up-emergency-call-escalation": {
    de: "notfall-anrufe-eskalation-einrichten",
    es: "configurar-la-escalada-de-llamadas-urgentes",
    fr: "configurer-l-escalade-des-appels-urgents",
    sk: "ako-nastavit-eskalaciu-urgentnych-hovorov",
    it: "configurare-l-escalation-delle-chiamate-urgenti",
    pt: "configurar-o-encaminhamento-de-chamadas-urgentes",
    nl: "escalatie-van-spoedoproepen-instellen",
  },
  "hvac-answering-service": {
    de: "telefonservice-heizung-klima",
    es: "servicio-de-atencion-telefonica-para-climatizacion",
    fr: "permanence-telephonique-chauffage-climatisation",
    sk: "telefonicka-sluzba-kurenie-klimatizacia",
    it: "servizio-risposta-per-impianti-termoidraulici",
    pt: "atendimento-telefonico-para-avac",
    nl: "telefoonservice-voor-installatiebedrijven",
  },
  "law-firm-answering-service": {
    de: "telefonservice-anwaltskanzlei",
    es: "servicio-de-atencion-telefonica-para-abogados",
    fr: "permanence-telephonique-cabinet-avocat",
    sk: "telefonicka-sluzba-pre-advokatske-kancelarie",
    it: "servizio-risposta-per-studi-legali",
    pt: "atendimento-telefonico-para-advogados",
    nl: "telefoonservice-voor-advocatenkantoren",
  },
  "locksmith-answering-service": {
    de: "telefonservice-schluesseldienst",
    es: "atencion-telefonica-para-cerrajeros",
    fr: "permanence-telephonique-serrurier",
    sk: "telefonicka-sluzba-pre-zamocnikov",
    it: "servizio-risposta-per-fabbri",
    pt: "atendimento-telefonico-para-serralheiros",
    nl: "telefoonservice-voor-slotenmakers",
  },
  "medical-answering-service": {
    de: "telefonservice-arztpraxis",
    es: "servicio-de-atencion-telefonica-para-clinicas",
    fr: "permanence-telephonique-medicale",
    sk: "telefonicka-sluzba-pre-ambulancie",
    it: "servizio-risposta-per-studi-medici",
    pt: "atendimento-telefonico-para-clinicas",
    nl: "telefoonservice-voor-huisartsen",
  },
  "missed-call-text-back": {
    de: "sms-bei-verpasstem-anruf",
    es: "sms-automatico-por-llamada-perdida",
    fr: "sms-automatique-apres-appel-manque",
    sk: "sms-po-zmeskanom-hovore",
    it: "sms-automatico-dopo-chiamata-persa",
    pt: "sms-automatico-apos-chamada-perdida",
    nl: "sms-na-gemiste-oproep",
  },
  "pest-control-answering-service": {
    de: "telefonservice-schaedlingsbekaempfung",
    es: "atencion-telefonica-para-control-de-plagas",
    fr: "permanence-telephonique-deratisation",
    sk: "telefonicka-sluzba-pre-deratizaciu",
    it: "servizio-risposta-per-disinfestazioni",
    pt: "atendimento-telefonico-para-controlo-de-pragas",
    nl: "telefoonservice-voor-ongediertebestrijding",
  },
  "plumbing-answering-service": {
    de: "telefonservice-klempner",
    es: "servicio-de-atencion-telefonica-para-fontaneros",
    fr: "permanence-telephonique-plombier",
    sk: "telefonicka-sluzba-pre-instalaterov",
    it: "servizio-risposta-per-idraulici",
    pt: "atendimento-telefonico-para-canalizadores",
    nl: "telefoonservice-voor-loodgieters",
  },
  "property-management-answering-service": {
    de: "telefonservice-hausverwaltung",
    es: "servicio-de-atencion-telefonica-para-administradores-de-fincas",
    fr: "permanence-telephonique-gestion-immobiliere",
    sk: "telefonicka-sluzba-pre-spravcov-nehnutelnosti",
    it: "servizio-risposta-per-amministratori-di-condominio",
    pt: "atendimento-telefonico-para-gestao-de-condominios",
    nl: "telefoonservice-voor-vastgoedbeheer",
  },
  "real-estate-answering-service": {
    de: "telefonservice-immobilienmakler",
    es: "servicio-de-atencion-telefonica-para-inmobiliarias",
    fr: "permanence-telephonique-agence-immobiliere",
    sk: "telefonicka-sluzba-pre-realitne-kancelarie",
    it: "servizio-risposta-per-agenzie-immobiliari",
    pt: "atendimento-telefonico-para-imobiliarias",
    nl: "telefoonservice-voor-makelaars",
  },
  "restaurant-answering-service": {
    de: "telefonservice-restaurant",
    es: "atencion-telefonica-para-restaurantes",
    fr: "permanence-telephonique-restaurant",
    sk: "telefonicka-sluzba-pre-restauracie",
    it: "servizio-risposta-per-ristoranti",
    pt: "atendimento-telefonico-para-restaurantes",
    nl: "telefoonservice-voor-restaurants",
  },
  "roofing-answering-service": {
    de: "telefonservice-dachdecker",
    es: "atencion-telefonica-para-tejadores",
    fr: "permanence-telephonique-couvreur",
    sk: "telefonicka-sluzba-pre-strechari",
    it: "servizio-risposta-per-imprese-di-coperture",
    pt: "atendimento-telefonico-para-telhados",
    nl: "telefoonservice-voor-dakdekkers",
  },
  "salon-answering-service": {
    de: "telefonservice-friseursalon",
    es: "atencion-telefonica-para-peluquerias",
    fr: "permanence-telephonique-salon-de-coiffure",
    sk: "telefonicka-sluzba-pre-kadernictva",
    it: "servizio-risposta-per-parrucchieri",
    pt: "atendimento-telefonico-para-cabeleireiros",
    nl: "telefoonservice-voor-kapsalons",
  },
  "self-storage-answering-service": {
    de: "telefonservice-selfstorage",
    es: "atencion-telefonica-para-trasteros",
    fr: "permanence-telephonique-garde-meubles",
    sk: "telefonicka-sluzba-pre-skladovacie-boxy",
    it: "servizio-risposta-per-self-storage",
    pt: "atendimento-telefonico-para-self-storage",
    nl: "telefoonservice-voor-selfstorage",
  },
  "telephone-answering-service": {
    de: "telefonservice",
    es: "servicio-de-atencion-telefonica",
    fr: "permanence-telephonique",
    sk: "telefonicka-odkazova-sluzba",
    it: "servizio-di-risposta-telefonica",
    pt: "servico-de-atendimento-telefonico",
    nl: "telefonische-antwoordservice",
  },
  "towing-answering-service": {
    de: "telefonservice-abschleppdienst",
    es: "servicio-de-atencion-telefonica-para-gruas",
    fr: "permanence-telephonique-depannage-remorquage",
    sk: "telefonicka-sluzba-pre-odtahovu-sluzbu",
    it: "servizio-risposta-per-carro-attrezzi",
    pt: "atendimento-telefonico-para-reboques",
    nl: "telefoonservice-voor-bergingsbedrijven",
  },
  "veterinary-answering-service": {
    de: "telefonservice-tierarztpraxis",
    es: "servicio-de-atencion-telefonica-para-veterinarios",
    fr: "permanence-telephonique-veterinaire",
    sk: "telefonicka-sluzba-pre-veterinarov",
    it: "servizio-risposta-per-veterinari",
    pt: "atendimento-telefonico-para-veterinarios",
    nl: "telefoonservice-voor-dierenartsen",
  },
  "virtual-receptionist-pricing": {
    de: "virtuelles-sekretariat-preise",
    es: "precios-recepcionista-virtual",
    fr: "tarifs-telesecretariat",
    sk: "cennik-virtualnej-recepcnej",
    it: "prezzi-receptionist-virtuale",
    pt: "precos-rececionista-virtual",
    nl: "virtuele-receptionist-prijzen",
  },
  "water-damage-restoration-answering-service": {
    de: "telefonservice-wasserschaden-sanierung",
    es: "atencion-telefonica-para-danos-por-agua",
    fr: "permanence-telephonique-degats-des-eaux",
    sk: "telefonicka-sluzba-pre-sanaciu-po-vode",
    it: "servizio-risposta-per-danni-da-acqua",
    pt: "atendimento-telefonico-para-danos-por-agua",
    nl: "telefoonservice-voor-waterschadeherstel",
  },
} as const satisfies Record<string, Record<MarketingLocale, string>>;

/** English slug of a post that has localized slugs. */
export type TranslatableBlogSlug = keyof typeof BLOG_SLUGS;

export const TRANSLATABLE_BLOG_SLUGS = Object.keys(
  BLOG_SLUGS,
) as TranslatableBlogSlug[];

export function isTranslatableBlogSlug(
  slug: string,
): slug is TranslatableBlogSlug {
  return slug in BLOG_SLUGS;
}

/**
 * Localized slug for an English one, or undefined when the post is English-only
 * (see the orange-county note above). Callers must treat undefined as "this
 * post has no localized URL", never as "fall back to the English slug under a
 * localized prefix" - that would mint a URL nothing serves.
 */
export function localizedBlogSlug(
  locale: MarketingLocale,
  enSlug: string,
): string | undefined {
  return isTranslatableBlogSlug(enSlug) ? BLOG_SLUGS[enSlug][locale] : undefined;
}

// Reverse index, built once. Also the collision check: two posts sharing a slug
// in one locale would silently make the second unreachable, so it throws at
// module load and the build fails instead.
const REVERSE = new Map<string, Map<string, TranslatableBlogSlug>>();
for (const enSlug of TRANSLATABLE_BLOG_SLUGS) {
  for (const [locale, slug] of Object.entries(BLOG_SLUGS[enSlug])) {
    let byLocale = REVERSE.get(locale);
    if (!byLocale) REVERSE.set(locale, (byLocale = new Map()));
    const clash = byLocale.get(slug);
    if (clash) {
      throw new Error(
        `Duplicate ${locale} blog slug "${slug}": ${clash} and ${enSlug}`,
      );
    }
    byLocale.set(slug, enSlug);
  }
}

/** Localized slug back to the English one that identifies the post. */
export function blogSlugFromLocalized(
  locale: MarketingLocale,
  localizedSlug: string,
): TranslatableBlogSlug | undefined {
  return REVERSE.get(locale)?.get(localizedSlug);
}
