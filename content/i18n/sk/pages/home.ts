// Slovak home page copy. Status is "draft" in ../manifest.ts until a native
// speaker approves it - see content/i18n/sk/manifest.ts.
//
// Register: vykanie throughout the marketing voice. Slovakia is the home market
// of MeltFlex s.r.o., so the tone is direct and confident rather than hedged.
// The testimonial quotes keep the loose, lowercase, spoken tone of the English
// originals on purpose; they are customer speech, not brand copy, and polishing
// them into formal prose would make them read as fabricated. Names are never
// translated, roles are. Numbers use the Slovak decimal comma and a space as
// the thousands separator.

import type { HomeCopy } from "../../_home-copy";

export const skHome: HomeCopy = {
  // "Virtuálna asistentka" is what a Slovak business actually types; "AI
  // recepcia" is a coined phrase with no search behind it. The FAQ below already
  // bridges the two terms, so the body stays coherent with the new H1.
  metaTitle: "Virtuálna asistentka s AI: zdvihne každý hovor 24/7",
  metaDescription:
    "Virtuálna asistentka s AI prijíma vaše firemné hovory 24/7, rezervuje stretnutia a zachytí každý kontakt. Bez kódu, spustené za pár minút.",
  hero: {
    h1: "Virtuálna asistentka s AI, ktorá zdvihne každý hovor 24/7",
    phonePlaceholder: "Zadajte telefónne číslo",
    ctaCall: "Vyskúšajte našu AI hneď teraz",
    ctaCalling: "Volám...",
    invalidPhone: "Zadajte platné telefónne číslo.",
    callPlaced: "Práve vám voláme, zdvihnite telefón!",
    callFailed: "Hovor sa nepodarilo uskutočniť.",
    callFailedRetry: "Hovor sa nepodarilo uskutočniť. Skúste to znova.",
    consent: {
      before: "Uskutočnením hovoru súhlasíte s tým, že vás môžeme",
      contactLink: "kontaktovať",
      between: "a potvrdzujete, že ste si prečítali naše",
      privacyLink: "zásady ochrany osobných údajov",
      after: ".",
    },
    avatarAlts: [
      "Maria, používateľka AI Receptionist Now",
      "Mustafa, používateľ AI Receptionist Now",
      "Saheed, používateľ AI Receptionist Now",
      "Delphine, používateľka AI Receptionist Now",
    ],
    usersCount: "9 500+ používateľov po celom svete",
    usersTagline: "Každý hovor zdvihnutý, nonstop.",
    ratingHeadline: "Špičkové hodnotenie",
    ratingCount: "1 200+ recenzií",
    ratingScore: "4,8 z 5",
  },

  testimonials: {
    heading: "Dôverujú nám firmy, ktoré nestíhajú",
    sub: "Tisíce hovorov vybavených každý deň, ani jeden zmeškaný.",
    items: [
      { quote: "Naša recepcia počas ordinačných hodín neustále nestíhala dvíhať telefóny. Teraz je každý jeden hovor zdvihnutý 24/7 a termíny sa objednávajú samy. Personál sa konečne môže venovať pacientom.", name: "Dr. Amanda Reyes", role: "Všeobecná lekárka" },
      { quote: "na stavbe som nemal ako zdvihnúť, takže som každý týždeň prichádzal o klientov. toto zdvihne každý hovor, prejde si s človekom čo potrebuje a pošle mi zhrnutie esemeskou. tento mesiac som zavrel 3 zákazky ktoré by mi inak ušli.", name: "Mike Donovan", role: "Vodoinštalatér" },
      { quote: "Nastavil som to za nejakých 20 minút cez obedňajšiu pauzu. Teraz to vybavuje všetky hovory s objednávkami, kým tím robí s klientmi. úprimne, mal som to spraviť už pred rokom.", name: "Jasmine Torres", role: "Wellness štúdio" },
      { quote: "Robím sám za celú kanceláriu, nemôžem vždy zdvihnúť. Každého volajúceho preverí, zoberie kontakt a naplánuje obhliadku rovno do kalendára. ako recepčná na plný úväzok, len skoro zadarmo.", name: "Brian Callahan", role: "Realitný maklér" },
      { quote: "Platili sme dvoch ľudí len na dvíhanie telefónov. Teraz AI berie špičky a hovory po zatváračke. Náklady na recepciu nám klesli skoro na polovicu.", name: "Priya Sharma", role: "Zubná klinika" },
      { quote: "ten hlas je šialene prirodzený. polovica zákazníkov vôbec netuší že sa bavia s AI. Objedná termín, potvrdí ho a hotovo.", name: "Carlos Mendez", role: "Autoservis" },
      { quote: "zmeškané večerné hovory nás ničili. teraz sa každý hovor po zatváračke zdvihne a ráno mi príde esemeska so zhrnutím. pre malú kanceláriu je to úplne iná liga.", name: "Rachel Goodwin", role: "Advokátska kancelária" },
      { quote: "Nastavenie bolo oveľa jednoduchšie, než som čakal. Opísal som firmu, vybral pár možností a ešte v ten deň to dvíhalo hovory. Žiadne technické znalosti netreba.", name: "Tom Bradley", role: "Klimatizácie a kúrenie" },
      { quote: "Každú rezerváciu hodí rovno do môjho kalendára a nikdy neobjedná dvoch ľudí na ten istý čas. Piatkové večery pri telefóne bývali chaos, dnes už nie.", name: "Nina Petrova", role: "Kadernícky salón" },
      { quote: "úprimne som bol najprv skeptický ale so zvláštnymi otázkami si poradí lepšie ako moja stará odkazová služba. a stojí to zlomok ceny.", name: "Derek Olsen", role: "Pokrývač" },
      { quote: "volá nám dosť ľudí po španielsky a to prepne jazyk bez problémov. všetko zaznamená a kontakt mi hneď pošle mailom.", name: "Sofia Ramirez", role: "Poisťovacia agentúra" },
      { quote: "cez večernú špičku zvoní telefón nonstop. teraz AI berie rezervácie aj objednávky so sebou, kým my varíme. zachránilo nám to kopu stolov.", name: "Marco Bianchi", role: "Reštaurácia" },
      { quote: "Objednáva konzultácie, odpovedá na otázky o cenách a z každého hovoru mi pošle zhrnutie. je to ako mať recepčnú bez mzdových nákladov.", name: "Hannah Cole", role: "Estetická klinika" },
      { quote: "dielňu vediem sám a nemôžem nechať prácu len tak stáť kvôli telefónu. toto zdvihne, zistí čo treba a napíše mi čo je súrne. tento mesiac som spravil viac roboty ako kedykoľvek predtým.", name: "Wes Carter", role: "Elektrikár" },
      { quote: "prešiel som z call centra ktoré nám stále kazilo objednávky. toto zatiaľ nepoplietlo ani jeden termín a ešte to znie aj milo.", name: "Linda Park", role: "Chiropraktická klinika" },
      { quote: "samotné pokrytie po zatváračke sa zaplatilo. ľudia volajú o deviatej večer a aj tak sa objednajú. koniec naháňačky cez odkazovač.", name: "Greg Sullivan", role: "Deratizácia a dezinsekcia" },
      { quote: "najprv som to skúsila na bezplatnom pláne a hneď prvý týždeň to objednalo 4 termíny. v ten istý deň som prešla na platený. ľahké rozhodnutie.", name: "Aisha Khan", role: "Nechtové štúdio" },
      { quote: "napojí sa rovno na náš kalendár aj CRM, takže sa nič nestratí. nastavenie zabralo jeden večer a odvtedy to beží bezchybne.", name: "Daniel Wright", role: "Realitný tím" },
    ],
  },

  howItWorks: {
    heading: "Spustíte to za menej ako 10 minút.",
    sub: "AI recepciu si spustí naozaj každý - programovanie nie je potrebné.",
    steps: [
      {
        title: "Vytvorte telefonických asistentov s AI",
        desc: "Vyberte hlas, jazyk a uvítaciu správu.",
        imageAlt: "Vytvorenie AI recepcie na iPhone",
      },
      {
        title: "Nastavte priebeh hovoru a následné spracovanie",
        desc: "Definujte rôzne scenáre hovorov a zvoľte si, ako chcete dostávať prepisy.",
        imageAlt: "Nastavenie priebehu hovoru na iPhone",
      },
      {
        title: "Nechajte hovory na AI",
        desc: "AI prepojíme s telefónnym číslom od AI Receptionist Now alebo s vašou vlastnou telefónnou ústredňou.",
        imageAlt: "AI preberá telefonický hovor na iPhone",
      },
    ],
  },

  useCases: {
    heading: "Príklady využitia",
    sub: "Náš telefonický asistent s AI sa pružne prispôsobí vašim potrebám a prepojí sa s kalendárom aj CRM. Automatizované hovory, ktoré dávajú zmysel.",
    cta: "Začnite hneď",
    items: [
      { title: "Recepcia a prepájanie hovorov", desc: "Prijme prichádzajúce hovory a prepojí ich na správnu kontaktnú osobu." },
      { title: "Prepis hovorov", desc: "Zaznamená dopyty, prepíše ich a pošle vám zhrnutie e-mailom." },
      { title: "Zákaznícka podpora", desc: "Vybaví otázky zákazníkov nonstop, presne podľa vami nastavených pravidiel." },
      { title: "Objednávanie termínov", desc: "Naplánuje termín priamo počas hovoru a okamžite ho potvrdí." },
      { title: "Spracovanie objednávok", desc: "Rýchle automatické vybavenie požiadaviek 24/7 - žiadne čakanie, žiadne stratené objednávky." },
      { title: "50+ ďalších možností", desc: "Každá firma je iná. Nastavte AI presne podľa svojich procesov." },
    ],
  },

  faq: {
    heading: "Často kladené otázky",
    items: [
      {
        q: "Čo je AI recepcia?",
        a: "AI recepcia, inak nazývaná aj virtuálna recepcia, je telefonický asistent s AI, ktorý automaticky a nonstop preberá firemné hovory. Prirodzeným hlasom privíta volajúceho, odpovie na otázky, zistí, čo zákazník potrebuje, objedná termín a pošle vám zhrnutie každého hovoru - takže vám neujde ani jeden zákazník, ani po pracovnej dobe, ani počas špičky.",
      },
      {
        q: "Ako funguje telefonický asistent s AI?",
        a: "AI Receptionist Now sa napojí na vyhradené telefónne číslo alebo na vašu existujúcu firemnú linku. Keď niekto zavolá, AI okamžite zdvihne, vedie prirodzený rozhovor a riadi sa pokynmi, ktoré ste jej nastavili - odpovedá na časté otázky, zaznamená údaje volajúceho, prepojí hovor alebo naplánuje termín rovno do vášho kalendára. Po každom hovore dostanete prepis a zhrnutie e-mailom alebo SMS správou.",
      },
      {
        q: "Dokáže AI recepcia zdvíhať hovory 24/7?",
        a: "Áno. AI Receptionist Now zdvíha hovory nepretržite - v noci, cez víkendy, počas sviatkov aj vtedy, keď sú všetky linky obsadené - bez čakania a bez odkazovača. Firmy, ktoré prejdú na AI, spravidla už v prvom týždni prestanú prichádzať o zákazníkov pre zmeškané hovory a hovory mimo pracovného času.",
      },
      {
        q: "Ako rýchlo AI Receptionist Now nastavím?",
        a: "Nastavenie zaberie menej ako 10 minút. Opíšete svoju firmu, vyberiete hlas a jazyk, určíte, ako sa majú hovory vybavovať, a AI je pripravená prijímať hovory ešte v ten istý deň. Programovanie ani technické znalosti nie sú potrebné.",
      },
      {
        q: "Spoznajú volajúci, že hovoria s AI?",
        a: "AI znie prirodzene a konverzačne, mnohí volajúci rozdiel nepostrehnú. Kontrolu máte vy: AI sa môže predstaviť ako virtuálny asistent, alebo môže rozhovor prebiehať úplne plynulo - podľa toho, čo sedí vašej značke.",
      },
      {
        q: "Dokáže objednávať termíny a prepojiť sa s mojím kalendárom a CRM?",
        a: "Áno. AI Receptionist Now objednáva termíny priamo počas hovoru a natívne sa prepojí s Google Calendar, Outlook, HubSpot, Salesforce a Calendly, plus s tisíckami aplikácií cez Zapier. Vlastné integrácie sú možné cez naše otvorené API, takže údaje o volajúcich putujú rovno do nástrojov, ktoré už používate.",
      },
      {
        q: "Aké jazyky AI recepcia podporuje?",
        a: "AI zvláda hovory vo viac ako 25 jazykoch a dokáže prepnúť jazyk aj uprostred rozhovoru podľa volajúceho - ideálne pre firmy s viacjazyčnou klientelou, ktoré chcú, aby sa každý volajúci cítil pochopený.",
      },
      {
        q: "Čo sa stane, keď AI hovor nezvládne?",
        a: "AI sa rozhoduje na základe kontextu, ktorý jej poskytnete, a drvivú väčšinu hovorov vyrieši sama. Ak požiadavka presahuje jej rámec, zaznamená podrobnosti, naplánuje spätné volanie alebo hovor v reálnom čase prepojí na vás či na člena vášho tímu.",
      },
      {
        q: "Koľko stojí AI recepcia?",
        a: "Začať môžete zadarmo a na vyšší plán prejdete, až keď potrebujete viac hovorov alebo funkcií. AI recepcia stojí zlomok toho, čo zamestnanec na recepcii alebo telefonická služba, a pritom zdvihne každý hovor 24/7 - väčšine firiem sa investícia vráti z hovorov, ktoré by inak prepásli.",
      },
      {
        q: "Sú moje údaje v bezpečí?",
        a: "Áno. Všetky údaje z hovorov sú šifrované pri prenose aj pri uložení. Spĺňame požiadavky GDPR a HIPAA a vaše údaje nikdy nepredávame, nezdieľame s tretími stranami ani ich nepoužívame na trénovanie externých AI modelov.",
      },
    ],
  },

  footerCta: {
    heading: "Škálovateľné vybavovanie hovorov s AI Receptionist Now.",
    body: "Vyskúšajte AI Receptionist Now a presvedčte sa, ako náš telefonický asistent s AI automatizuje hovory a odbremení váš tím. Jednoducho, efektívne a nonstop.",
    cta: "Vytvorte si vlastnú AI hneď teraz",
  },
};
