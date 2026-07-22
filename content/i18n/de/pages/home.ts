// German home page copy. Status is "draft" in ../manifest.ts until a native
// speaker approves it - see content/i18n/de/manifest.ts.
//
// Register: Sie throughout the marketing voice. The testimonial quotes keep the
// loose, lowercase, spoken tone of the English originals on purpose; they are
// customer speech, not brand copy, and polishing them into formal prose would
// make them read as fabricated. Names are never translated.

import type { HomeCopy } from "../../_home-copy";

export const deHome: HomeCopy = {
  metaDescription:
    "AI Receptionist Now nimmt Ihre Geschäftsanrufe rund um die Uhr an, bucht Termine und erfasst jeden Interessenten. Ohne Code, in Minuten startklar.",
  hero: {
    h1: "KI-Telefonassistent, der jeden Anruf annimmt - rund um die Uhr",
    phonePlaceholder: "Telefonnummer eingeben",
    ctaCall: "Jetzt mit unserer KI sprechen",
    ctaCalling: "Anruf läuft...",
    invalidPhone: "Bitte geben Sie eine gültige Telefonnummer ein.",
    callPlaced: "Wir rufen Sie jetzt an, bitte gehen Sie ans Telefon!",
    callFailed: "Anruf konnte nicht hergestellt werden.",
    callFailedRetry: "Anruf konnte nicht hergestellt werden. Bitte erneut versuchen.",
    consent: {
      before: "Mit diesem Anruf stimmen Sie zu,",
      contactLink: "von uns kontaktiert zu werden",
      between: "und bestätigen, unsere",
      privacyLink: "Datenschutzerklärung",
      after: "gelesen zu haben.",
    },
    avatarAlts: [
      "Maria, Nutzerin von AI Receptionist Now",
      "Mustafa, Nutzer von AI Receptionist Now",
      "Saheed, Nutzer von AI Receptionist Now",
      "Delphine, Nutzerin von AI Receptionist Now",
    ],
    usersCount: "9.500+ Nutzer weltweit",
    usersTagline: "Jeder Anruf angenommen, rund um die Uhr.",
    ratingHeadline: "Top bewertet",
    ratingCount: "1.200+ Bewertungen",
    ratingScore: "4,8 von 5",
  },

  testimonials: {
    heading: "Beliebt bei Unternehmen mit vollen Telefonen",
    sub: "Täglich tausende Anrufe angenommen - kein einziger verpasst.",
    items: [
      { quote: "Unser Empfang hat während der Sprechzeiten ständig Anrufe verpasst. Jetzt wird rund um die Uhr jeder Anruf angenommen und Termine buchen sich praktisch von selbst. Das Team kann sich endlich auf die Patienten konzentrieren.", name: "Dr. Amanda Reyes", role: "Allgemeinmedizin" },
      { quote: "auf der Baustelle konnte ich nie rangehen, jede Woche sind mir Kunden weggelaufen. das Ding nimmt jeden Anruf an, qualifiziert den Lead und schickt mir eine Zusammenfassung per SMS. diesen Monat 3 Aufträge geholt, die sonst weg gewesen wären.", name: "Mike Donovan", role: "Sanitär und Rohrreinigung" },
      { quote: "In der Mittagspause eingerichtet, hat vielleicht 20 Minuten gedauert. Jetzt übernimmt es alle Terminanrufe, während mein Team an den Kundinnen arbeitet. hätte ich ehrlich gesagt schon vor einem Jahr machen sollen.", name: "Jasmine Torres", role: "Day Spa" },
      { quote: "Ich bin eine Ein-Personen-Agentur und kann nicht immer rangehen. Es qualifiziert jeden Anrufer, nimmt die Daten auf und trägt Besichtigungen direkt in meinen Kalender ein. wie eine Vollzeitkraft am Empfang, nur ohne die Kosten.", name: "Brian Callahan", role: "Immobilienmakler" },
      { quote: "Wir haben zwei Leute nur fürs Telefon bezahlt. Jetzt übernimmt die KI die Spitzen und die Anrufe nach Feierabend. Damit sind unsere Empfangskosten fast halbiert.", name: "Priya Sharma", role: "Zahnarztpraxis" },
      { quote: "die Stimme ist erschreckend natürlich. Die Hälfte meiner Kunden merkt gar nicht, dass da eine KI dran ist. Termin gebucht, bestätigt, fertig.", name: "Carlos Mendez", role: "Kfz-Werkstatt" },
      { quote: "nachts verpasste Anrufe haben uns wirklich wehgetan. jetzt wird jeder Anruf außerhalb der Zeiten angenommen und ich bekomme morgens eine Zusammenfassung per SMS. für eine kleine Kanzlei ein Riesenunterschied.", name: "Rachel Goodwin", role: "Anwaltskanzlei" },
      { quote: "Die Einrichtung war deutlich einfacher als gedacht. Betrieb beschrieben, ein paar Optionen gewählt, und noch am selben Tag hat es Anrufe angenommen. Ganz ohne technisches Wissen.", name: "Tom Bradley", role: "Heizung und Klima" },
      { quote: "Es trägt jede Buchung direkt in meinen Kalender ein und bucht nie doppelt. Freitagabends war das Telefon früher das reinste Chaos, damit ist Schluss.", name: "Nina Petrova", role: "Friseursalon" },
      { quote: "war anfangs echt skeptisch, aber es kommt mit komischen Fragen besser klar als mein alter Telefonservice. und kostet einen Bruchteil.", name: "Derek Olsen", role: "Dachdeckerbetrieb" },
      { quote: "Bei uns rufen viele spanischsprachige Kunden an und es wechselt die Sprache völlig problemlos. erfasst alles und schickt mir den Lead sofort per Mail.", name: "Sofia Ramirez", role: "Versicherungsagentur" },
      { quote: "während des Abendgeschäfts klingelt das Telefon ununterbrochen. jetzt nimmt die KI Reservierungen und Bestellungen zum Mitnehmen auf, während wir kochen. hat uns richtig viele Tische gerettet.", name: "Marco Bianchi", role: "Restaurant" },
      { quote: "Es bucht Beratungstermine, beantwortet Preisfragen und schickt mir zu jedem Anruf eine Zusammenfassung. fühlt sich an, als hätte ich jemanden am Empfang eingestellt, nur ohne Lohnkosten.", name: "Hannah Cole", role: "Med Spa" },
      { quote: "Ich führe den Betrieb allein und kann mitten in der Arbeit nicht ans Telefon. es nimmt ab, qualifiziert und schreibt mir, was dringend ist. diesen Monat mehr Aufträge als je zuvor.", name: "Wes Carter", role: "Elektriker" },
      { quote: "vorher ein Callcenter, das ständig Termine falsch eingetragen hat. das hier vertut sich nie und klingt dabei auch noch freundlich.", name: "Linda Park", role: "Chiropraxis" },
      { quote: "allein die Erreichbarkeit nach Feierabend hat sich sofort bezahlt gemacht. Leute rufen um 21 Uhr an und bekommen trotzdem einen Termin. kein Rückruf-Pingpong mehr.", name: "Greg Sullivan", role: "Schädlingsbekämpfung" },
      { quote: "erst im kostenlosen Tarif getestet und es hat in der ersten Woche direkt 4 Termine gebucht. noch am selben Tag upgegradet. leichte Entscheidung.", name: "Aisha Khan", role: "Nagelstudio" },
      { quote: "hängt direkt an unserem Kalender und CRM, dadurch geht nichts verloren. Einrichtung an einem Abend und läuft seitdem einwandfrei.", name: "Daniel Wright", role: "Immobilienteam" },
    ],
  },

  howItWorks: {
    heading: "In unter 10 Minuten einsatzbereit.",
    sub: "Jeder kann AI Receptionist Now einrichten - ganz ohne Programmierkenntnisse.",
    steps: [
      {
        title: "KI-Telefonassistenten erstellen",
        desc: "Stimme, Sprache und Begrüßung auswählen.",
        imageAlt: "KI-Telefonassistent auf dem iPhone erstellen",
      },
      {
        title: "Verhalten im Gespräch und Nachbereitung festlegen",
        desc: "Legen Sie fest, wie Anrufe behandelt werden und wie Sie die Protokolle erhalten möchten.",
        imageAlt: "Verhalten im Gespräch auf dem iPhone festlegen",
      },
      {
        title: "Die KI Ihre Anrufe übernehmen lassen",
        desc: "Die KI wird mit einer Rufnummer von AI Receptionist Now oder Ihrer bestehenden Telefonanlage verbunden.",
        imageAlt: "Die KI nimmt einen Anruf auf dem iPhone entgegen",
      },
    ],
  },

  useCases: {
    heading: "Anwendungsfälle",
    sub: "Unser KI-Telefonassistent passt sich flexibel Ihren Abläufen an und verbindet sich mit Kalender und CRM. Automatisierte Anrufe, die wirklich Sinn ergeben.",
    cta: "Jetzt starten",
    items: [
      { title: "Empfang und Weiterleitung", desc: "Nimmt eingehende Anrufe an und leitet sie an die richtige Ansprechperson weiter." },
      { title: "Gesprächsprotokolle", desc: "Erfasst Anfragen, transkribiert sie und schickt Ihnen eine Zusammenfassung per E-Mail." },
      { title: "Kundenservice", desc: "Beantwortet Kundenanfragen rund um die Uhr nach genau definierten Vorgaben." },
      { title: "Terminbuchung", desc: "Vereinbart Termine direkt im Gespräch, inklusive sofortiger Bestätigung." },
      { title: "Auftragsannahme", desc: "Schnelle automatisierte Bearbeitung rund um die Uhr - keine Wartezeit, keine verpassten Aufträge." },
      { title: "50+ weitere Optionen", desc: "Jedes Unternehmen ist anders. Konfigurieren Sie die KI genau auf Ihren Ablauf." },
    ],
  },

  faq: {
    heading: "Häufig gestellte Fragen",
    items: [
      {
        q: "Was ist ein KI-Telefonassistent?",
        a: "Ein KI-Telefonassistent ist ein virtueller Assistent, der Ihre geschäftlichen Anrufe automatisch und rund um die Uhr annimmt. Er begrüßt Anrufer mit natürlicher Stimme, beantwortet Fragen, qualifiziert Leads, bucht Termine und schickt Ihnen zu jedem Gespräch eine Zusammenfassung - damit Ihnen kein Kunde entgeht, auch nicht nach Feierabend oder in Stoßzeiten.",
      },
      {
        q: "Wie funktioniert ein KI-Telefonservice?",
        a: "AI Receptionist Now wird mit einer eigenen Rufnummer oder Ihrer bestehenden Geschäftsnummer verbunden. Ruft jemand an, nimmt die KI sofort ab, führt ein natürliches Gespräch und hält sich dabei an Ihre Vorgaben - beantwortet häufige Fragen, erfasst Kontaktdaten, leitet weiter oder trägt Termine direkt in Ihren Kalender ein. Nach jedem Anruf erhalten Sie Protokoll und Zusammenfassung per E-Mail oder SMS.",
      },
      {
        q: "Nimmt der KI-Telefonassistent Anrufe rund um die Uhr an?",
        a: "Ja. AI Receptionist Now nimmt jeden Anruf entgegen - nachts, am Wochenende, an Feiertagen und wenn alle Leitungen belegt sind, ohne Warteschleife und ohne Mailbox. Betriebe, die wechseln, verlieren meist schon in der ersten Woche keine Leads mehr durch verpasste Anrufe.",
      },
      {
        q: "Wie schnell ist AI Receptionist Now eingerichtet?",
        a: "Die Einrichtung dauert unter 10 Minuten. Beschreiben Sie Ihr Unternehmen, wählen Sie Stimme und Sprache, legen Sie fest, wie Anrufe behandelt werden - und die KI nimmt noch am selben Tag Anrufe an. Programmier- oder Technikkenntnisse sind nicht nötig.",
      },
      {
        q: "Merken Anrufer, dass sie mit einer KI sprechen?",
        a: "Die KI klingt natürlich und gesprächig, viele Anrufer merken keinen Unterschied. Sie behalten die Kontrolle: Die KI kann sich als virtuelle Assistenz vorstellen oder das Gespräch nahtlos führen - ganz wie es zu Ihrer Marke passt.",
      },
      {
        q: "Kann sie Termine buchen und sich mit Kalender und CRM verbinden?",
        a: "Ja. AI Receptionist Now bucht Termine direkt im Gespräch und lässt sich nativ mit Google Calendar, Outlook, HubSpot, Salesforce und Calendly verbinden, über Zapier außerdem mit tausenden weiteren Anwendungen. Eigene Anbindungen sind über unsere offene API möglich, sodass Anruferdaten direkt in Ihre bestehenden Tools fließen.",
      },
      {
        q: "Welche Sprachen unterstützt der KI-Telefonassistent?",
        a: "Die KI führt Gespräche in über 25 Sprachen und kann mitten im Gespräch die Sprache wechseln - ideal für Unternehmen mit mehrsprachiger Kundschaft, bei denen sich jeder Anrufer verstanden fühlen soll.",
      },
      {
        q: "Was passiert, wenn die KI einen Anruf nicht bewältigt?",
        a: "Die KI entscheidet auf Basis der Informationen, die Sie hinterlegen, und löst damit die große Mehrheit der Anrufe selbst. Fällt eine Anfrage aus dem Rahmen, kann sie die Details aufnehmen, einen Rückruf einplanen oder das Gespräch in Echtzeit an Sie oder eine Kollegin weiterleiten.",
      },
      {
        q: "Was kostet ein KI-Telefonassistent?",
        a: "Sie starten kostenlos und wechseln erst dann in einen größeren Tarif, wenn Sie mehr Anrufe oder Funktionen brauchen. Ein KI-Telefonassistent kostet einen Bruchteil einer Kraft am Empfang oder eines Telefonservice und nimmt dabei jeden Anruf rund um die Uhr an - die meisten Betriebe holen die Kosten allein über zusätzlich gebuchte Aufträge wieder herein.",
      },
      {
        q: "Sind meine Daten sicher?",
        a: "Ja. Alle Anrufdaten werden bei der Übertragung und im Speicher verschlüsselt. Wir erfüllen die Anforderungen von DSGVO und HIPAA, und Ihre Daten werden weder verkauft noch an Dritte weitergegeben oder zum Training externer KI-Modelle verwendet.",
      },
    ],
  },

  footerCta: {
    heading: "Skalierbare Anrufverwaltung mit AI Receptionist Now.",
    body: "Testen Sie AI Receptionist Now und sehen Sie, wie unser KI-Telefonassistent Ihre Anrufe automatisiert und Ihr Team entlastet. Einfach, effizient und rund um die Uhr.",
    cta: "Jetzt eigene KI erstellen",
  },
};
