// Nederlandse copy voor de homepage. Status blijft "draft" in ../manifest.ts
// tot een moedertaalspreker de gerenderde pagina heeft goedgekeurd - zie
// content/i18n/nl/manifest.ts.
//
// Register: consequent u in de marketingtekst. De klantcitaten behouden
// bewust de losse, spreektalige toon van de Engelse originelen, inclusief
// kleine letters aan het begin; het is klantentaal, geen merktekst, en
// gladstrijken tot formele prosa laat ze verzonnen klinken. Namen worden
// nooit vertaald.

import type { HomeCopy } from "../../_home-copy";

export const nlHome: HomeCopy = {
  // "Telefoonservice" is the high-volume Dutch term and "receptioniste" the
  // descriptive one, so the title carries both. The description switches "je" to
  // "uw" to match this file's stated register.
  metaTitle: "AI-receptioniste en telefoonservice: 24/7 bereikbaar",
  metaDescription:
    "AI-receptioniste die uw zakelijke oproepen 24/7 beantwoordt, afspraken inplant en elke lead vastlegt. Zonder code, in enkele minuten live.",
  hero: {
    h1: "AI-receptioniste die 24/7 elke oproep aanneemt",
    phonePlaceholder: "Telefoonnummer invoeren",
    ctaCall: "Spreek nu met onze AI",
    ctaCalling: "Bellen...",
    invalidPhone: "Voer een geldig telefoonnummer in.",
    callPlaced: "We bellen u nu, neem uw telefoon op!",
    callFailed: "De oproep kon niet tot stand komen.",
    callFailedRetry: "De oproep kon niet tot stand komen. Probeer het opnieuw.",
    consent: {
      before: "Door dit gesprek te starten, gaat u ermee akkoord",
      contactLink: "door ons benaderd te worden",
      between: "en bevestigt u onze",
      privacyLink: "privacyverklaring",
      after: "te hebben gelezen.",
    },
    avatarAlts: [
      "Maria, gebruiker van AI Receptionist Now",
      "Mustafa, gebruiker van AI Receptionist Now",
      "Saheed, gebruiker van AI Receptionist Now",
      "Delphine, gebruiker van AI Receptionist Now",
    ],
    usersCount: "9.500+ gebruikers wereldwijd",
    usersTagline: "Elke oproep aangenomen, 24 uur per dag.",
    ratingHeadline: "Uitstekend beoordeeld",
    ratingCount: "1.200+ beoordelingen",
    ratingScore: "4,8 van de 5",
  },

  testimonials: {
    heading: "Geliefd bij bedrijven waar de telefoon roodgloeiend staat",
    sub: "Elke dag duizenden gesprekken aangenomen, geen enkele gemist.",
    items: [
      { quote: "Onze balie miste tijdens het spreekuur voortdurend telefoontjes. Nu wordt elke oproep 24/7 aangenomen en worden afspraken vanzelf ingepland. Het team kan zich eindelijk op de patiënten richten.", name: "Dr. Amanda Reyes", role: "Huisartsenpraktijk" },
      { quote: "op de bouwplaats kon ik nooit opnemen, dus ik raakte elke week klanten kwijt. dit ding neemt elk gesprek aan, kwalificeert de lead en appt me een samenvatting. deze maand 3 klussen binnengehaald die ik anders was misgelopen.", name: "Mike Donovan", role: "Loodgieter en rioolservice" },
      { quote: "In mijn lunchpauze ingesteld, kostte een minuut of 20. Nu handelt het alle afspraakgesprekken af terwijl mijn team met klanten bezig is. had dit eerlijk gezegd een jaar geleden al moeten doen.", name: "Jasmine Torres", role: "Wellnesscentrum" },
      { quote: "Ik ben een eenmanszaak, dus opnemen lukt niet altijd. Het kwalificeert elke beller, noteert de gegevens en zet bezichtigingen direct in mijn agenda. net een fulltime receptioniste, maar dan voor bijna niks.", name: "Brian Callahan", role: "Makelaar" },
      { quote: "We betaalden twee mensen alleen om de telefoon aan te nemen. Nu vangt de AI de piek en de avondgesprekken op. Onze baliekosten zijn bijna gehalveerd.", name: "Priya Sharma", role: "Tandartspraktijk" },
      { quote: "de stem is schrikbarend natuurlijk. De helft van mijn klanten heeft geen idee dat ze met een AI praten. Afspraak geboekt, bevestigd, klaar.", name: "Carlos Mendez", role: "Autogarage" },
      { quote: "gemiste telefoontjes 's avonds braken ons op. nu wordt elk gesprek buiten kantooruren aangenomen en krijg ik 's ochtends een samenvatting per sms. voor een klein kantoor scheelt dat enorm.", name: "Rachel Goodwin", role: "Advocatenkantoor" },
      { quote: "Het instellen was veel makkelijker dan ik dacht. Mijn bedrijf beschreven, een paar opties gekozen en dezelfde dag nam het al gesprekken aan. Je hebt er echt geen technische kennis voor nodig.", name: "Tom Bradley", role: "Verwarming en klimaattechniek" },
      { quote: "Het zet elke boeking meteen in mijn agenda en boekt nooit dubbel. Vrijdagavond was vroeger een chaos aan de telefoon, dat is nu voorbij.", name: "Nina Petrova", role: "Kapsalon" },
      { quote: "eerlijk gezegd was ik eerst sceptisch, maar het gaat beter om met rare vragen dan mijn oude antwoordservice. en het kost een fractie.", name: "Derek Olsen", role: "Dakdekkersbedrijf" },
      { quote: "We krijgen veel Spaanstalige bellers en het schakelt zonder problemen over. legt alles vast en mailt me de lead meteen door.", name: "Sofia Ramirez", role: "Verzekeringskantoor" },
      { quote: "tijdens de avondrush gaat de telefoon non-stop. nu neemt de AI reserveringen en afhaalbestellingen aan terwijl wij koken. heeft ons zoveel tafels gescheeld.", name: "Marco Bianchi", role: "Restaurant" },
      { quote: "Het plant intakegesprekken in, beantwoordt vragen over prijzen en stuurt me van elk gesprek een samenvatting. voelt alsof ik een receptioniste heb aangenomen, maar dan zonder loonkosten.", name: "Hannah Cole", role: "Huidkliniek" },
      { quote: "Ik run de zaak alleen en kan niet midden in een klus de telefoon pakken. het neemt op, kwalificeert en appt me wat dringend is. deze maand meer werk binnengehaald dan ooit.", name: "Wes Carter", role: "Elektricien" },
      { quote: "overgestapt van een callcenter dat afspraken steeds verkeerd inboekte. dit zet nooit iets fout in de agenda en klinkt nog vriendelijk ook.", name: "Linda Park", role: "Chiropractiepraktijk" },
      { quote: "alleen de bereikbaarheid buiten kantooruren verdiende zichzelf al terug. mensen bellen om negen uur 's avonds en krijgen alsnog een afspraak. geen voicemailgedoe meer.", name: "Greg Sullivan", role: "Ongediertebestrijding" },
      { quote: "eerst uitgeprobeerd op het gratis pakket en het boekte de eerste week al 4 afspraken. dezelfde dag geüpgraded. makkelijke keuze.", name: "Aisha Khan", role: "Nagelstudio" },
      { quote: "hangt rechtstreeks aan onze agenda en ons CRM, dus er gaat niets verloren. in een avond ingesteld en het draait sindsdien vlekkeloos.", name: "Daniel Wright", role: "Makelaarsteam" },
    ],
  },

  howItWorks: {
    heading: "Binnen 10 minuten klaar voor gebruik.",
    sub: "Iedereen kan AI Receptionist Now instellen - programmeerkennis is niet nodig.",
    steps: [
      {
        title: "AI-telefoonassistenten aanmaken",
        desc: "Kies een stem, een taal en een welkomstboodschap.",
        imageAlt: "Uw AI-receptioniste aanmaken op de iPhone",
      },
      {
        title: "Gedrag tijdens het gesprek en nabewerking instellen",
        desc: "Bepaal hoe verschillende gesprekken worden afgehandeld en hoe u de gespreksverslagen wilt ontvangen.",
        imageAlt: "Gedrag tijdens het gesprek instellen op de iPhone",
      },
      {
        title: "Laat de AI uw telefoongesprekken aannemen",
        desc: "De AI wordt gekoppeld aan een telefoonnummer van AI Receptionist Now of aan uw eigen telefooncentrale.",
        imageAlt: "De AI neemt een telefoongesprek aan op de iPhone",
      },
    ],
  },

  useCases: {
    heading: "Toepassingen",
    sub: "Onze AI-telefoonassistent past zich flexibel aan uw werkwijze aan en koppelt met uw agenda en CRM. Geautomatiseerde gesprekken die echt iets opleveren.",
    cta: "Nu beginnen",
    items: [
      { title: "Receptie en doorverbinden", desc: "Neemt binnenkomende oproepen aan en verbindt door met de juiste contactpersoon." },
      { title: "Gespreksverslagen", desc: "Verzamelt aanvragen, zet ze om in tekst en stuurt u een samenvatting per e-mail." },
      { title: "Klantenservice", desc: "Handelt klantvragen dag en nacht af volgens precies vastgelegde instructies." },
      { title: "Afspraken inplannen", desc: "Plant afspraken tijdens het gesprek in, met directe bevestiging." },
      { title: "Orderverwerking", desc: "Snelle geautomatiseerde afhandeling, 24/7 - geen wachttijd, geen gemiste bestellingen." },
      { title: "50+ andere opties", desc: "Elk bedrijf is anders. Stel de AI precies af op uw eigen werkwijze." },
    ],
  },

  capabilities: {
    heading: "Wat het echt doet",
    sub: "Geen keuzemenu met een mooiere stem. Dit doet het in een echt gesprek - en dit gebeurt er als het niet lukt.",
    items: [
      { title: "Verbindt door naar de juiste persoon", desc: "Tot vijf bestemmingen - receptie, facturatie, de bereikbaarheidsdienst - elk met eigen tijden. Het kiest degene die past bij wat de beller nodig heeft en weet wie er op dat moment echt bereikbaar is." },
      { title: "Schakelt op voordat je de beller kwijt bent", desc: "Het biedt een mens aan zodra iemand geïrriteerd raakt, zich heeft moeten herhalen of over een noodgeval begint. Zonder dat erom gevraagd hoeft te worden. Voeg je eigen situaties toe: een gesprongen leiding, iemand die dreigt op te zeggen." },
      { title: "Belt je wanneer het ertoe doet", desc: "Een dringend bericht krijg je meteen per sms en, als je dat wilt, belt de receptionist je en noemt wie er belde, het nummer en het probleem. Stel een terugbeltermijn in en die belooft hij hardop." },
      { title: "Kijkt in je eigen systemen", desc: "Wijs het naar je API en het kan midden in het gesprek een order opzoeken, voorraad checken of je echte prijzen noemen, in plaats van te gokken of een bericht achter te laten dat jij later moet afhandelen." },
      { title: "Verzint niets", desc: "Noem de onderwerpen die het nooit mag beantwoorden en het zegt dat gewoon in plaats van te gokken. Geef het formuleringen die exact moeten kloppen en het gebruikt die van jou. Na elk gesprek vergelijkt het wat het zei met wat jij hebt aangeleverd en markeert alles wat het niet kon onderbouwen. En vraagt een beller ronduit of het een AI is, dan zegt het dat." },
      { title: "Herkent je vaste klanten", desc: "Wie eerder belde wordt bij naam begroet en hoeft niet opnieuw te vertellen wat al bekend is. Eén schakelaar zet het uit als je dat liever hebt." },
    ],
  },

  faq: {
    heading: "Veelgestelde vragen",
    items: [
      {
        q: "Wat is een AI-receptioniste?",
        a: "Een AI-receptioniste is een virtuele telefoonassistent die uw zakelijke gesprekken automatisch aanneemt, 24 uur per dag. Ze begroet bellers met een natuurlijke stem, beantwoordt vragen, kwalificeert leads, plant afspraken in en stuurt u van elk gesprek een samenvatting - zo mist u nooit meer een klant, ook niet buiten kantooruren of tijdens drukke periodes.",
      },
      {
        q: "Hoe werkt een telefonische antwoordservice met AI?",
        a: "AI Receptionist Now wordt gekoppeld aan een eigen telefoonnummer of aan uw bestaande zakelijke lijn. Zodra iemand belt, neemt de AI direct op, voert een natuurlijk gesprek en volgt daarbij uw instructies: veelgestelde vragen beantwoorden, gegevens van de beller vastleggen, doorverbinden of afspraken rechtstreeks in uw agenda zetten. Na elk gesprek ontvangt u een verslag en een samenvatting per e-mail of sms.",
      },
      {
        q: "Neemt de AI-receptioniste 24/7 gesprekken aan?",
        a: "Ja. AI Receptionist Now neemt elk gesprek aan, dag en nacht: 's avonds, in het weekend, op feestdagen en wanneer alle lijnen bezet zijn, zonder wachtrij en zonder voicemail. Bedrijven die overstappen, verliezen doorgaans al in de eerste week geen leads meer door gemiste oproepen en oproepen buiten kantooruren.",
      },
      {
        q: "Hoe snel kan ik AI Receptionist Now instellen?",
        a: "Het instellen kost minder dan 10 minuten. Beschrijf uw bedrijf, kies een stem en een taal, bepaal hoe gesprekken moeten worden afgehandeld en de AI neemt dezelfde dag nog gesprekken aan. Programmeerkennis of technische kennis is niet nodig.",
      },
      {
        q: "Merken bellers dat ze met een AI praten?",
        a: "De AI klinkt natuurlijk en menselijk, en veel bellers horen het verschil niet. U houdt de regie: u kunt de AI zichzelf laten voorstellen als virtuele assistent of het gesprek naadloos laten verlopen - net wat bij uw merk past.",
      },
      {
        q: "Kan de AI afspraken inplannen en koppelen met mijn agenda en CRM?",
        a: "Ja. Het plant tijdens het gesprek in Google Agenda, Microsoft Agenda of Cal.com, controleert eerst of het tijdslot vrij is waar de agenda dat ondersteunt, en stuurt de beller een bevestiging per sms. Naast agenda's kun je het naar je eigen API wijzen, zodat het midden in het gesprek een order opzoekt of voorraad checkt, en elke samenvatting en transcriptie kan via een webhook naar je CRM.",
      },
      {
        q: "Welke talen ondersteunt de AI-receptioniste?",
        a: "De AI voert gesprekken in meer dan 25 talen en kan midden in een gesprek van taal wisselen op basis van de beller - ideaal voor bedrijven met een meertalige klantenkring die willen dat iedere beller zich begrepen voelt.",
      },
      {
        q: "Wat gebeurt er als de AI een gesprek niet aankan?",
        a: "De AI neemt beslissingen op basis van de informatie die u aanlevert en lost daarmee veruit de meeste gesprekken zelf op. Valt een verzoek daarbuiten, dan kan de AI de gegevens vastleggen, een terugbelafspraak inplannen of het gesprek in realtime doorverbinden naar u of een collega.",
      },
      {
        q: "Wat kost een AI-receptioniste?",
        a: "U kunt gratis beginnen en stapt pas over op een groter pakket wanneer u meer gesprekken of functies nodig hebt. Een AI-receptioniste kost een fractie van een medewerker aan de balie of een antwoordservice, en neemt tegelijk elk gesprek 24/7 aan - de meeste bedrijven verdienen de kosten alleen al terug met de extra geboekte klussen en de gesprekken die anders verloren waren gegaan.",
      },
      {
        q: "Zijn mijn gegevens veilig?",
        a: "Ja. Alle gespreksgegevens worden versleuteld tijdens het transport en bij opslag. Wij voldoen aan de eisen van de GDPR (AVG) en HIPAA, en uw gegevens worden nooit verkocht, met derden gedeeld of gebruikt om externe AI-modellen te trainen.",
      },
    ],
  },

  footerCta: {
    heading: "Schaalbaar gespreksbeheer met AI Receptionist Now.",
    body: "Probeer AI Receptionist Now en ontdek hoe onze AI-telefoonassistent uw gesprekken automatiseert en uw team ontlast. Eenvoudig, efficiënt en dag en nacht bereikbaar.",
    cta: "Maak nu uw eigen AI aan",
  },
};
