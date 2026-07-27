// Italian home page copy. Status is "draft" in ../manifest.ts until a native
// speaker approves it - see content/i18n/it/manifest.ts.
//
// Register: Lei throughout the marketing voice, "IA" used consistently for the
// technology. The testimonial quotes keep the loose, lowercase, spoken tone of
// the English originals on purpose; they are customer speech, not brand copy,
// and polishing them into formal prose would make them read as fabricated.
// Names are never translated; roles are.

import type { HomeCopy } from "../../_home-copy";

export const itHome: HomeCopy = {
  // "Centralino virtuale" is the term Italian businesses search for this;
  // "receptionist con IA" is an English loan that carries almost no volume.
  metaTitle: "Centralino virtuale con IA: risponde a ogni chiamata 24/7",
  metaDescription:
    "Centralino virtuale con IA che risponde alle chiamate della tua attività 24/7, fissa appuntamenti e raccoglie ogni contatto. Attivo in pochi minuti.",
  hero: {
    h1: "Centralino virtuale con IA che risponde a ogni chiamata 24/7",
    phonePlaceholder: "Inserisca il numero di telefono",
    ctaCall: "Parli subito con la nostra IA",
    ctaCalling: "Chiamata in corso...",
    invalidPhone: "Inserisca un numero di telefono valido.",
    callPlaced: "La stiamo chiamando, risponda al telefono!",
    callFailed: "Non è stato possibile effettuare la chiamata.",
    callFailedRetry: "Non è stato possibile effettuare la chiamata. Riprovi.",
    consent: {
      before: "Effettuando questa chiamata, acconsente a",
      contactLink: "essere contattato da noi",
      between: "e conferma di aver letto la nostra",
      privacyLink: "informativa sulla privacy",
      after: ".",
    },
    avatarAlts: [
      "Maria, utente di AI Receptionist Now",
      "Mustafa, utente di AI Receptionist Now",
      "Saheed, utente di AI Receptionist Now",
      "Delphine, utente di AI Receptionist Now",
    ],
    usersCount: "9.500+ utenti nel mondo",
    usersTagline: "Ogni chiamata ricevuta, 24 ore su 24.",
    ratingHeadline: "Valutazione eccellente",
    ratingCount: "1.200+ recensioni",
    ratingScore: "4,8 su 5",
  },

  testimonials: {
    heading: "Scelto dalle aziende che non si fermano mai",
    sub: "Migliaia di chiamate gestite ogni giorno, nemmeno una persa.",
    items: [
      { quote: "La nostra reception perdeva chiamate in continuazione durante gli orari di visita. Ora ogni singola chiamata riceve risposta 24 ore su 24 e gli appuntamenti si prenotano praticamente da soli. Il personale può finalmente concentrarsi sui pazienti.", name: "Dr. Amanda Reyes", role: "Medicina generale" },
      { quote: "in cantiere non riuscivo a rispondere e ogni settimana perdevo clienti. questo coso risponde a tutte le chiamate, qualifica il contatto e mi manda un riassunto via SMS. questo mese ho chiuso 3 lavori che mi sarei perso.", name: "Mike Donovan", role: "Idraulica e spurghi" },
      { quote: "L'ho configurato in tipo 20 minuti durante la pausa pranzo. Adesso gestisce tutte le chiamate per gli appuntamenti mentre il mio team sta dietro alle clienti. onestamente avrei dovuto farlo un anno fa.", name: "Jasmine Torres", role: "Centro benessere" },
      { quote: "Sono un agente immobiliare che lavora da solo, non posso sempre rispondere. Qualifica ogni chiamante, prende i dati e fissa le visite direttamente nel mio calendario. tipo avere una receptionist a tempo pieno senza pagarla.", name: "Brian Callahan", role: "Agente immobiliare" },
      { quote: "Pagavamo due persone solo per rispondere al telefono. Ora l'IA prende le chiamate in eccesso e quelle fuori orario. Abbiamo quasi dimezzato i costi della reception.", name: "Priya Sharma", role: "Studio dentistico" },
      { quote: "la voce è incredibilmente naturale. Metà dei miei clienti non ha idea di stare parlando con un'IA. Prenota l'appuntamento, conferma, fatto.", name: "Carlos Mendez", role: "Officina meccanica" },
      { quote: "le chiamate perse di notte ci stavano ammazzando. adesso ogni chiamata fuori orario riceve risposta e la mattina mi arriva un riepilogo via SMS. per uno studio piccolo cambia tutto.", name: "Rachel Goodwin", role: "Studio legale" },
      { quote: "La configurazione è stata molto più facile del previsto. Ho descritto la mia attività, scelto due opzioni e lo stesso giorno rispondeva già alle chiamate. Zero competenze tecniche.", name: "Tom Bradley", role: "Impianti di climatizzazione" },
      { quote: "Mette ogni prenotazione direttamente nel mio calendario e non sovrappone mai niente. Il venerdì sera rispondere al telefono era il caos, adesso non più.", name: "Nina Petrova", role: "Salone di parrucchiere" },
      { quote: "ero abbastanza scettico all'inizio ma gestisce le domande strane meglio del vecchio servizio di segreteria. e costa una frazione.", name: "Derek Olsen", role: "Impresa di coperture" },
      { quote: "Ci chiamano tanti clienti che parlano spagnolo e cambia lingua senza problemi. raccoglie tutto e mi manda il contatto per email all'istante.", name: "Sofia Ramirez", role: "Agenzia assicurativa" },
      { quote: "durante il servizio della sera il telefono squilla senza sosta. adesso l'IA prende le prenotazioni e gli ordini da asporto mentre noi cuciniamo. ci ha salvato un sacco di coperti.", name: "Marco Bianchi", role: "Ristorante" },
      { quote: "Fissa le consulenze, risponde alle domande sui prezzi e mi manda un riassunto di ogni chiamata. è come aver assunto una receptionist senza lo stipendio.", name: "Hannah Cole", role: "Centro di medicina estetica" },
      { quote: "Gestisco la ditta da solo e non posso fermarmi a metà lavoro per rispondere. risponde, qualifica e mi scrive cosa è urgente. questo mese ho chiuso più lavori che mai.", name: "Wes Carter", role: "Elettricista" },
      { quote: "siamo passati da un call center che sbagliava di continuo le prenotazioni. questo non sbaglia mai un appuntamento e ha pure un tono gentile.", name: "Linda Park", role: "Studio chiropratico" },
      { quote: "solo la copertura fuori orario si è ripagata da sola. la gente chiama alle 21 e riesce comunque a prenotare. basta rincorrersi in segreteria.", name: "Greg Sullivan", role: "Disinfestazioni" },
      { quote: "l'ho provato prima col piano gratuito e la prima settimana aveva già prenotato 4 appuntamenti. passato al piano superiore lo stesso giorno. scelta facile.", name: "Aisha Khan", role: "Studio di manicure" },
      { quote: "si integra direttamente col nostro calendario e col CRM quindi non si perde niente. configurato in una sera e da allora funziona alla perfezione.", name: "Daniel Wright", role: "Team immobiliare" },
    ],
  },

  howItWorks: {
    heading: "Operativo in meno di 10 minuti.",
    sub: "Chiunque può attivare AI Receptionist Now - senza competenze di programmazione.",
    steps: [
      {
        title: "Crei i suoi assistenti telefonici IA",
        desc: "Scelga voce, lingua e messaggio di benvenuto.",
        imageAlt: "Creazione del receptionist con IA su iPhone",
      },
      {
        title: "Definisca il comportamento in chiamata e la post-elaborazione",
        desc: "Imposti modalità di gestione diverse per le chiamate e scelga come ricevere le trascrizioni.",
        imageAlt: "Definizione del comportamento in chiamata su iPhone",
      },
      {
        title: "Lasci che l'IA risponda alle sue chiamate",
        desc: "L'IA sarà collegata a un numero di AI Receptionist Now oppure al suo centralino telefonico.",
        imageAlt: "L'IA risponde a una chiamata su iPhone",
      },
    ],
  },

  useCases: {
    heading: "Casi d'uso",
    sub: "Il nostro assistente telefonico IA si adatta con flessibilità alle sue esigenze e si integra con calendario e CRM. Chiamate automatizzate che hanno davvero senso.",
    cta: "Inizi ora",
    items: [
      { title: "Accoglienza e smistamento", desc: "Risponde alle chiamate in entrata e le inoltra alla persona di riferimento giusta." },
      { title: "Trascrizione delle chiamate", desc: "Raccoglie le richieste, le trascrive e invia un riepilogo alla sua email." },
      { title: "Assistenza clienti", desc: "Gestisce le richieste dei clienti 24 ore su 24 con un comportamento definito nel dettaglio." },
      { title: "Prenotazione appuntamenti", desc: "Fissa gli appuntamenti durante la conversazione, con conferma immediata." },
      { title: "Gestione degli ordini", desc: "Elaborazione automatica e rapida 24 ore su 24 - nessuna attesa, nessun ordine perso." },
      { title: "Oltre 50 altre opzioni", desc: "Ogni azienda è diversa. Configuri l'IA per adattarla esattamente al suo flusso di lavoro." },
    ],
  },

  faq: {
    heading: "Domande frequenti",
    items: [
      {
        q: "Che cos'è un receptionist con IA?",
        a: "Un receptionist con IA è un assistente telefonico virtuale che risponde automaticamente alle chiamate della sua azienda, 24 ore su 24. Accoglie chi chiama con una voce naturale, risponde alle domande, qualifica i contatti, fissa gli appuntamenti e le invia un riepilogo di ogni chiamata - così non perde mai un cliente, nemmeno fuori orario o nei momenti di punta.",
      },
      {
        q: "Come funziona un servizio di risposta telefonica con IA?",
        a: "AI Receptionist Now si collega a un numero dedicato oppure alla linea aziendale che utilizza già. Quando qualcuno chiama, l'IA risponde all'istante, sostiene una conversazione naturale e segue le istruzioni che ha impostato: risponde alle domande frequenti, raccoglie i dati di chi chiama, inoltra la chiamata o fissa appuntamenti direttamente nel suo calendario. Dopo ogni chiamata riceve trascrizione e riepilogo per email o SMS.",
      },
      {
        q: "Il receptionist con IA risponde alle chiamate 24 ore su 24?",
        a: "Sì. AI Receptionist Now risponde a ogni chiamata a qualsiasi ora - di notte, nei fine settimana, nei giorni festivi e quando le linee sono tutte occupate - senza attese e senza segreteria. Di solito, già dalla prima settimana, le aziende che passano ad AI Receptionist Now smettono di perdere contatti a causa delle chiamate perse e fuori orario.",
      },
      {
        q: "Quanto tempo serve per attivare AI Receptionist Now?",
        a: "La configurazione richiede meno di 10 minuti. Descriva la sua attività, scelga una voce e una lingua, imposti come gestire le chiamate e l'IA è pronta a rispondere lo stesso giorno. Non servono competenze tecniche o di programmazione.",
      },
      {
        q: "Chi chiama si accorge di parlare con un'IA?",
        a: "L'IA ha un tono naturale e colloquiale e molte persone non notano la differenza. Il controllo resta a lei: può far presentare l'IA come assistente virtuale oppure lasciare l'esperienza del tutto fluida - come preferisce per il suo marchio.",
      },
      {
        q: "Può fissare appuntamenti e integrarsi con il mio calendario e il mio CRM?",
        a: "Sì. AI Receptionist Now fissa gli appuntamenti durante la chiamata e si integra in modo nativo con Google Calendar, Outlook, HubSpot, Salesforce e Calendly, oltre a migliaia di applicazioni tramite Zapier. Le integrazioni personalizzate sono disponibili tramite la nostra API aperta, così i dati di chi chiama arrivano direttamente negli strumenti che usa già.",
      },
      {
        q: "Quali lingue supporta il receptionist con IA?",
        a: "L'IA gestisce le chiamate in oltre 25 lingue e può cambiare lingua durante la conversazione in base a chi chiama - ideale per le aziende con clientela multilingue che vogliono far sentire capito ogni interlocutore.",
      },
      {
        q: "Che cosa succede se l'IA non riesce a gestire una chiamata?",
        a: "L'IA decide in base al contesto che le fornisce e risolve da sola la grande maggioranza delle chiamate. Se una richiesta esce dal suo ambito, può raccogliere i dettagli, programmare una richiamata oppure trasferire la chiamata a lei o a un collaboratore in tempo reale.",
      },
      {
        q: "Quanto costa un receptionist con IA?",
        a: "Può iniziare gratuitamente e passare a un piano superiore solo quando le servono più chiamate o più funzioni. Un receptionist con IA costa una frazione di un addetto alla reception o di un servizio di segreteria e risponde comunque a ogni chiamata 24 ore su 24 - la maggior parte delle aziende recupera la spesa con i lavori in più prenotati e le chiamate perse recuperate.",
      },
      {
        q: "I miei dati sono al sicuro?",
        a: "Sì. Tutti i dati delle chiamate sono cifrati in transito e a riposo. Rispettiamo i requisiti del GDPR e di HIPAA e i suoi dati non vengono mai venduti, condivisi con terze parti o usati per addestrare modelli di IA esterni.",
      },
    ],
  },

  footerCta: {
    heading: "Gestione delle chiamate scalabile con AI Receptionist Now.",
    body: "Provi AI Receptionist Now e scopra come il nostro assistente telefonico IA automatizza le sue chiamate e alleggerisce il lavoro del suo team. È semplice, efficiente e sempre attivo.",
    cta: "Crei ora la sua IA",
  },
};
