// French home page copy. Status is "draft" in ../manifest.ts until a native
// speaker approves it - see content/i18n/fr/manifest.ts.
//
// Register: vouvoiement throughout the marketing voice. The testimonial quotes
// deliberately keep the loose, lowercase, spoken tone of the English originals;
// they are customer speech, not brand copy, and polishing them into formal
// prose would make them read as fabricated. Names are never translated, roles
// are. Numbers follow French conventions: decimal comma, space as thousands
// separator. Full Unicode diacritics, straight ASCII apostrophes only.

import type { HomeCopy } from "../../_home-copy";

export const frHome: HomeCopy = {
  // "Standardiste virtuel" is the searched French term; "permanence
  // téléphonique" carries more volume still but promises a human service, so it
  // is left to the body copy rather than the title.
  metaTitle: "Standardiste virtuel IA : tous vos appels répondus 24h/24",
  metaDescription:
    "Standardiste virtuel IA qui répond aux appels de votre entreprise 24h/24, prend les rendez-vous et capture chaque prospect. Sans code, prêt en minutes.",
  hero: {
    h1: "Standardiste virtuel IA qui répond à tous vos appels, 24h/24",
    phonePlaceholder: "Saisissez votre numéro de téléphone",
    ctaCall: "Parlez à notre IA dès maintenant",
    ctaCalling: "Appel en cours...",
    invalidPhone: "Saisissez un numéro de téléphone valide.",
    callPlaced: "Nous vous appelons, décrochez votre téléphone !",
    callFailed: "Impossible de passer l'appel.",
    callFailedRetry: "Impossible de passer l'appel. Réessayez.",
    consent: {
      before: "En lançant cet appel, vous acceptez d'être",
      contactLink: "contacté par nos équipes",
      between: "et confirmez avoir pris connaissance de notre",
      privacyLink: "politique de confidentialité",
      after: ".",
    },
    avatarAlts: [
      "Maria, utilisatrice d'AI Receptionist Now",
      "Mustafa, utilisateur d'AI Receptionist Now",
      "Saheed, utilisateur d'AI Receptionist Now",
      "Delphine, utilisatrice d'AI Receptionist Now",
    ],
    usersCount: "9 500+ utilisateurs dans le monde",
    usersTagline: "Chaque appel pris, 24h/24 et 7j/7.",
    ratingHeadline: "Excellente note",
    ratingCount: "1 200+ avis",
    ratingScore: "4,8 sur 5",
  },

  testimonials: {
    heading: "Plébiscité par les entreprises débordées",
    sub: "Des milliers d'appels pris chaque jour, aucun manqué.",
    items: [
      { quote: "Notre accueil ratait des appels en permanence pendant les consultations. Aujourd'hui chaque appel est pris 24h/24 et les rendez-vous se prennent tout seuls. L'équipe peut enfin se concentrer sur les patients.", name: "Dr. Amanda Reyes", role: "Médecine générale" },
      { quote: "je pouvais pas décrocher sur un chantier, du coup je perdais des clients toutes les semaines. ce truc répond à tous les appels, qualifie le prospect et m'envoie un résumé par SMS. 3 chantiers signés ce mois-ci que j'aurais ratés.", name: "Mike Donovan", role: "Plomberie et débouchage" },
      { quote: "Installé en 20 minutes pendant ma pause déj. Maintenant il gère tous les appels de réservation pendant que mon équipe s'occupe des clientes. franchement j'aurais dû faire ça il y a un an.", name: "Jasmine Torres", role: "Institut de beauté" },
      { quote: "Je suis seul dans mon agence, je peux pas toujours répondre. Il qualifie chaque appelant, récupère ses coordonnées et cale les visites direct dans mon agenda. comme une standardiste à plein temps, pour rien.", name: "Brian Callahan", role: "Agent immobilier" },
      { quote: "On payait deux personnes juste pour répondre au téléphone. Maintenant l'IA absorbe le surplus et les appels hors horaires. On a réduit nos coûts d'accueil de presque la moitié.", name: "Priya Sharma", role: "Cabinet dentaire" },
      { quote: "la voix est bluffante de naturel. La moitié de mes clients se doutent même pas qu'ils parlent à une IA. Il prend le rendez-vous, le confirme, terminé.", name: "Carlos Mendez", role: "Garage automobile" },
      { quote: "les appels ratés nous tuaient le soir. maintenant tous les appels hors horaires sont pris et je reçois un récap par SMS le matin. ça change tout pour un petit cabinet.", name: "Rachel Goodwin", role: "Cabinet d'avocats" },
      { quote: "La configuration a été bien plus simple que prévu. J'ai décrit mon activité, choisi quelques options et il prenait les appels le jour même. Aucune compétence technique.", name: "Tom Bradley", role: "Chauffage et climatisation" },
      { quote: "Il ajoute chaque réservation directement dans mon agenda et ne double jamais un créneau. Les vendredis soir c'était le chaos au téléphone, plus maintenant.", name: "Nina Petrova", role: "Salon de coiffure" },
      { quote: "sceptique au début honnêtement mais il gère les questions bizarres mieux que mon ancienne permanence téléphonique. et c'est une fraction du prix.", name: "Derek Olsen", role: "Entreprise de couverture" },
      { quote: "On a beaucoup d'appelants hispanophones et il change de langue sans problème. il note tout et m'envoie le contact par mail dans la seconde.", name: "Sofia Ramirez", role: "Agence d'assurance" },
      { quote: "le téléphone sonne sans arrêt pendant le coup de feu. maintenant l'IA prend les réservations et les commandes à emporter pendant qu'on cuisine. ça nous a sauvé un paquet de couverts.", name: "Marco Bianchi", role: "Restaurant" },
      { quote: "Il cale les consultations, répond aux questions de tarif et m'envoie un résumé de chaque appel. j'ai l'impression d'avoir embauché une standardiste sans la fiche de paie.", name: "Hannah Cole", role: "Centre de médecine esthétique" },
      { quote: "Je tiens l'atelier tout seul et je peux pas m'arrêter en plein boulot pour répondre. il répond, qualifie et m'envoie par SMS ce qui est urgent. plus de chantiers signés que jamais ce mois-ci.", name: "Wes Carter", role: "Électricien" },
      { quote: "on a quitté un centre d'appels qui se plantait tout le temps sur les rendez-vous. là il ne se trompe jamais et en plus il a l'air sympa.", name: "Linda Park", role: "Cabinet de chiropraxie" },
      { quote: "rien que la couverture hors horaires a remboursé l'abonnement. les gens appellent à 21h et obtiennent quand même un rendez-vous. fini les messages sur répondeur.", name: "Greg Sullivan", role: "Entreprise de dératisation" },
      { quote: "testé d'abord sur la formule gratuite et il avait déjà pris 4 rendez-vous la première semaine. passé à l'offre supérieure le jour même. décision facile.", name: "Aisha Khan", role: "Onglerie" },
      { quote: "il s'intègre direct à notre agenda et à notre CRM, du coup rien ne se perd. une soirée pour tout configurer et ça tourne nickel depuis.", name: "Daniel Wright", role: "Équipe immobilière" },
    ],
  },

  howItWorks: {
    heading: "Opérationnel en moins de 10 minutes.",
    sub: "N'importe qui peut mettre AI Receptionist Now en service - aucune compétence en développement requise.",
    steps: [
      {
        title: "Créez vos assistants téléphoniques IA",
        desc: "Choisissez la voix, la langue et le message d'accueil.",
        imageAlt: "Création de votre standardiste IA sur iPhone",
      },
      {
        title: "Définissez le comportement en appel et le traitement après appel",
        desc: "Paramétrez la gestion des différents appels et choisissez comment recevoir les transcriptions.",
        imageAlt: "Définition du comportement pendant l'appel sur iPhone",
      },
      {
        title: "Laissez l'IA prendre vos appels",
        desc: "L'IA est reliée à un numéro AI Receptionist Now ou à votre propre système téléphonique.",
        imageAlt: "L'IA prenant un appel téléphonique sur iPhone",
      },
    ],
  },

  useCases: {
    heading: "Cas d'usage",
    sub: "Notre assistant téléphonique IA s'adapte avec souplesse à vos besoins et se connecte à votre agenda et à votre CRM. Des appels automatisés qui ont du sens.",
    cta: "Commencer maintenant",
    items: [
      { title: "Accueil et transfert", desc: "Prend les appels entrants et les transfère à l'interlocuteur concerné." },
      { title: "Transcription des appels", desc: "Recueille les demandes, les transcrit et vous envoie un résumé par e-mail." },
      { title: "Service client", desc: "Traite les demandes clients en continu, avec un comportement précisément défini." },
      { title: "Prise de rendez-vous", desc: "Fixe les rendez-vous pendant la conversation, avec confirmation immédiate." },
      { title: "Traitement des commandes", desc: "Traitement automatisé et rapide 24h/24 - sans attente, sans commande perdue." },
      { title: "Plus de 50 autres options", desc: "Chaque entreprise est unique. Configurez l'IA pour coller exactement à vos processus." },
    ],
  },

  faq: {
    heading: "Questions fréquentes",
    items: [
      {
        q: "Qu'est-ce qu'une standardiste IA ?",
        a: "Une standardiste IA est un assistant téléphonique virtuel qui répond automatiquement aux appels de votre entreprise, 24h/24 et 7j/7. Elle accueille les appelants avec une voix naturelle, répond aux questions, qualifie les prospects, prend les rendez-vous et vous envoie un résumé de chaque appel - vous ne perdez plus aucun client, même en dehors des horaires ou en période de forte affluence.",
      },
      {
        q: "Comment fonctionne une permanence téléphonique IA ?",
        a: "AI Receptionist Now se connecte à un numéro dédié ou à votre ligne professionnelle existante. Dès qu'une personne appelle, l'IA décroche immédiatement, tient une conversation naturelle et suit les consignes que vous avez définies : réponses aux questions fréquentes, collecte des coordonnées, transfert de l'appel ou prise de rendez-vous directement dans votre agenda. Vous recevez une transcription et un résumé par e-mail ou par SMS après chaque appel.",
      },
      {
        q: "La réceptionniste IA peut-elle répondre 24h/24 et 7j/7 ?",
        a: "Oui. AI Receptionist Now répond à chaque appel en continu - la nuit, le week-end, les jours fériés et en cas de pic d'appels - sans attente et sans messagerie vocale. Les entreprises qui adoptent la solution cessent généralement de perdre des prospects à cause des appels manqués ou hors horaires dès la première semaine.",
      },
      {
        q: "En combien de temps puis-je configurer AI Receptionist Now ?",
        a: "La configuration prend moins de 10 minutes. Décrivez votre activité, choisissez une voix et une langue, définissez la manière de traiter les appels, et l'IA prend ses premiers appels le jour même. Aucune compétence technique ni ligne de code n'est nécessaire.",
      },
      {
        q: "Les appelants sauront-ils qu'ils parlent à une IA ?",
        a: "La voix est naturelle et conversationnelle, et beaucoup d'appelants n'y voient que du feu. Vous gardez la main : vous pouvez faire en sorte que l'IA se présente comme un assistant virtuel ou laisser l'expérience totalement fluide - selon ce qui correspond à votre marque.",
      },
      {
        q: "Peut-elle prendre des rendez-vous et se connecter à mon agenda et à mon CRM ?",
        a: "Oui. AI Receptionist Now prend les rendez-vous pendant l'appel et s'intègre nativement à Google Calendar, Outlook, HubSpot, Salesforce et Calendly, ainsi qu'à des milliers d'applications via Zapier. Des intégrations sur mesure sont possibles grâce à notre API ouverte : les données des appelants arrivent directement dans les outils que vous utilisez déjà.",
      },
      {
        q: "Quelles langues la standardiste IA prend-elle en charge ?",
        a: "L'IA gère les appels dans plus de 25 langues et peut changer de langue en pleine conversation selon l'appelant - idéal pour les entreprises dont la clientèle est multilingue et qui veulent que chaque appelant se sente compris.",
      },
      {
        q: "Que se passe-t-il si l'IA ne sait pas traiter un appel ?",
        a: "L'IA décide à partir du contexte que vous lui fournissez, ce qui lui permet de résoudre seule la grande majorité des appels. Si une demande sort de son périmètre, elle peut noter les détails, programmer un rappel ou vous transférer l'appel en temps réel, à vous ou à un membre de votre équipe.",
      },
      {
        q: "Combien coûte une standardiste IA ?",
        a: "Vous pouvez commencer gratuitement et ne passer à une offre supérieure que lorsque vous avez besoin de plus d'appels ou de fonctionnalités. Une standardiste IA coûte une fraction du prix d'un poste d'accueil ou d'une permanence téléphonique classique, tout en répondant à chaque appel 24h/24 - la plupart des entreprises rentabilisent la dépense grâce aux rendez-vous supplémentaires et aux appels qui ne sont plus perdus.",
      },
      {
        q: "Mes données sont-elles sécurisées ?",
        a: "Oui. Toutes les données d'appel sont chiffrées en transit et au repos. Nous respectons les exigences du GDPR et de la norme HIPAA, et vos données ne sont jamais vendues, partagées avec des tiers ni utilisées pour entraîner des modèles d'IA externes.",
      },
    ],
  },

  footerCta: {
    heading: "Une gestion des appels évolutive avec AI Receptionist Now.",
    body: "Essayez AI Receptionist Now et voyez comment notre assistant téléphonique IA automatise vos appels pour soulager votre équipe. C'est simple, efficace et disponible en continu.",
    cta: "Créez votre IA maintenant",
  },
};
