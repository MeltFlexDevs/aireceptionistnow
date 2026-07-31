// Spanish home page copy. Status is "draft" in ../manifest.ts until a native
// speaker approves it - see content/i18n/es/manifest.ts.
//
// Register: neutral international Spanish, usted throughout the marketing voice
// (never vosotros). The testimonial quotes keep the loose, lowercase, spoken
// tone of the English originals on purpose; they are customer speech, not brand
// copy, and polishing them into formal prose would make them read as fabricated.
// Names are never translated. Numbers use the locale format: 9.500+, 4,8.

import type { HomeCopy } from "../../_home-copy";

export const esHome: HomeCopy = {
  // "Recepcionista virtual" is the established Spanish category term and carries
  // far more volume than "recepcionista con IA"; the H1 now leads with it and
  // keeps "con IA" as the qualifier.
  metaTitle: "Recepcionista virtual con IA: contesta llamadas 24/7",
  metaDescription:
    "Recepcionista virtual con IA que responde las llamadas de tu negocio 24/7, agenda citas y capta cada oportunidad. Sin código, en marcha en minutos.",
  hero: {
    h1: "Recepcionista virtual con IA que contesta todas las llamadas 24/7",
    phonePlaceholder: "Introduzca su número de teléfono",
    ctaCall: "Hable ahora con nuestra IA",
    ctaCalling: "Llamando...",
    invalidPhone: "Introduzca un número de teléfono válido.",
    callPlaced: "Le estamos llamando, ¡conteste su teléfono!",
    callFailed: "No se pudo realizar la llamada.",
    callFailedRetry: "No se pudo realizar la llamada. Inténtelo de nuevo.",
    consent: {
      before: "Al realizar esta llamada, acepta que",
      contactLink: "nos pongamos en contacto con usted",
      between: "y confirma haber leído nuestra",
      privacyLink: "política de privacidad",
      after: ".",
    },
    avatarAlts: [
      "Maria, usuaria de AI Receptionist Now",
      "Mustafa, usuario de AI Receptionist Now",
      "Saheed, usuario de AI Receptionist Now",
      "Delphine, usuaria de AI Receptionist Now",
    ],
    usersCount: "Más de 9.500 usuarios en todo el mundo",
    usersTagline: "Todas sus llamadas contestadas, las 24 horas.",
    ratingHeadline: "Valoración excelente",
    ratingCount: "Más de 1.200 reseñas",
    ratingScore: "4,8 sobre 5",
  },

  testimonials: {
    heading: "Los negocios con el teléfono siempre ocupado ya confían en nosotros",
    sub: "Miles de llamadas atendidas cada día, sin perder ni una.",
    items: [
      { quote: "En recepción perdíamos llamadas constantemente durante la consulta. Ahora se contesta cada llamada las 24 horas y las citas prácticamente se agendan solas. El equipo por fin puede centrarse en los pacientes.", name: "Dr. Amanda Reyes", role: "Medicina familiar" },
      { quote: "en la obra no podía contestar y cada semana perdía clientes. esto atiende todas las llamadas, filtra al posible cliente y me manda un resumen por mensaje. este mes cerré 3 trabajos que se me habrían escapado.", name: "Mike Donovan", role: "Fontanería y desatascos" },
      { quote: "Lo configuré en unos 20 minutos a la hora del almuerzo. Ahora lleva todas las llamadas de reservas mientras mi equipo atiende a las clientas. la verdad, ojalá lo hubiera hecho hace un año.", name: "Jasmine Torres", role: "Centro de belleza" },
      { quote: "Soy una agencia de una sola persona, no siempre puedo contestar. Califica a cada persona que llama, toma sus datos y agenda las visitas directamente en mi calendario. como tener un recepcionista a tiempo completo por nada.", name: "Brian Callahan", role: "Agente inmobiliario" },
      { quote: "Teníamos a dos personas solo para contestar el teléfono. Ahora la IA se ocupa del exceso de llamadas y de las de fuera de horario. Hemos reducido casi a la mitad el gasto de recepción.", name: "Priya Sharma", role: "Clínica dental" },
      { quote: "la voz es increíblemente natural. la mitad de mis clientes ni se imagina que está hablando con una IA. Agenda la cita, la confirma y listo.", name: "Carlos Mendez", role: "Taller mecánico" },
      { quote: "las llamadas perdidas de noche nos estaban hundiendo. ahora se contesta cada llamada fuera de horario y por la mañana recibo un resumen por mensaje. para un despacho pequeño cambia todo.", name: "Rachel Goodwin", role: "Despacho de abogados" },
      { quote: "La configuración fue mucho más fácil de lo que esperaba. Describí mi negocio, elegí un par de opciones y ese mismo día ya estaba atendiendo llamadas. No hace falta ningún conocimiento técnico.", name: "Tom Bradley", role: "Climatización y calefacción" },
      { quote: "Mete cada reserva directamente en mi calendario y nunca duplica citas. Los viernes por la noche el teléfono era un caos, y eso se acabó.", name: "Nina Petrova", role: "Peluquería" },
      { quote: "la verdad es que al principio era escéptico, pero maneja las preguntas raras mejor que mi antiguo servicio telefónico. y cuesta una fracción.", name: "Derek Olsen", role: "Contratista de techos" },
      { quote: "nos llaman clientes en varios idiomas y cambia de uno a otro sin ningún problema. lo registra todo y me manda el contacto al correo al instante.", name: "Sofia Ramirez", role: "Agencia de seguros" },
      { quote: "a la hora de la cena el teléfono no para. ahora la IA toma las reservas y los pedidos para llevar mientras nosotros cocinamos. nos ha salvado un montón de mesas.", name: "Marco Bianchi", role: "Restaurante" },
      { quote: "Agenda consultas, responde preguntas de precios y me manda un resumen de cada llamada. es como haber contratado a una recepcionista sin tenerla en nómina.", name: "Hannah Cole", role: "Clínica estética" },
      { quote: "Llevo el taller solo y no puedo dejar el trabajo a medias para atender el teléfono. contesta, califica y me escribe lo que es urgente. este mes he cerrado más trabajos que nunca.", name: "Wes Carter", role: "Electricista" },
      { quote: "veníamos de un call center que se equivocaba una y otra vez con las reservas. esto nunca falla con la cita y encima suena simpático.", name: "Linda Park", role: "Clínica quiropráctica" },
      { quote: "solo la cobertura fuera de horario ya se pagó sola. la gente llama a las 9 de la noche y aun así consigue cita. se acabó el juego del buzón de voz.", name: "Greg Sullivan", role: "Control de plagas" },
      { quote: "primero lo probé en el plan gratuito y ya reservó 4 citas la primera semana. pasé al plan de pago ese mismo día. decisión fácil.", name: "Aisha Khan", role: "Estudio de uñas" },
      { quote: "se integra directamente con nuestro calendario y el CRM, así no se pierde nada. la configuración me llevó una tarde y desde entonces funciona sin fallos.", name: "Daniel Wright", role: "Equipo inmobiliario" },
    ],
  },

  howItWorks: {
    heading: "Listo para funcionar en menos de 10 minutos.",
    sub: "Cualquiera puede poner en marcha AI Receptionist Now, sin saber programar.",
    steps: [
      {
        title: "Cree sus asistentes telefónicos con IA",
        desc: "Elija la voz, el idioma y el mensaje de bienvenida.",
        imageAlt: "Creación de su recepcionista con IA en el iPhone",
      },
      {
        title: "Defina el comportamiento durante y después de la llamada",
        desc: "Configure cómo se gestiona cada tipo de llamada y elija cómo desea recibir las transcripciones.",
        imageAlt: "Definición del comportamiento durante la llamada en el iPhone",
      },
      {
        title: "Deje que la IA atienda sus llamadas",
        desc: "La IA se conecta a un número de AI Receptionist Now o a su propia centralita telefónica.",
        imageAlt: "La IA atendiendo una llamada en el iPhone",
      },
    ],
  },

  useCases: {
    heading: "Casos de uso",
    sub: "Nuestro asistente telefónico con IA se adapta con flexibilidad a sus necesidades y se integra con su calendario y su CRM. Llamadas automatizadas que tienen sentido.",
    cta: "Empezar ahora",
    items: [
      { title: "Recepción y desvío de llamadas", desc: "Atiende las llamadas entrantes y las transfiere a la persona de contacto adecuada." },
      { title: "Transcripción de llamadas", desc: "Recoge las consultas, las transcribe y le envía un resumen por correo electrónico." },
      { title: "Atención al cliente", desc: "Resuelve las consultas de sus clientes las 24 horas con un comportamiento definido con precisión." },
      { title: "Reserva de citas", desc: "Agenda citas durante la conversación y las confirma al instante." },
      { title: "Gestión de pedidos", desc: "Gestión automática y rápida de solicitudes 24/7: sin esperas y sin pedidos perdidos." },
      { title: "Más de 50 opciones adicionales", desc: "Cada negocio es distinto. Configure la IA para que encaje exactamente con su forma de trabajar." },
    ],
  },

  capabilities: {
    heading: "Lo que hace de verdad",
    sub: "No es un menú telefónico con mejor voz. Esto es lo que hace en una llamada real, y qué pasa cuando no puede.",
    items: [
      { title: "Pasa la llamada a quien toca", desc: "Hasta cinco destinos - recepción, facturación, el técnico de guardia - cada uno con su horario. Elige el que encaja con lo que necesita quien llama, y sabe quién está realmente disponible en ese momento." },
      { title: "Escala antes de que pierdas la llamada", desc: "Ofrece una persona en cuanto alguien se enfada, ha tenido que repetirse o dice que es urgente. No espera a que se lo pidan. Puedes añadir tus propios casos: una tubería rota, alguien que amenaza con darse de baja." },
      { title: "Te llama cuando importa", desc: "Un recado urgente te llega por SMS al momento y, si quieres, la recepcionista te llama y te dice quién ha llamado, su número y el problema. Fija un plazo de devolución de llamada y lo promete en voz alta." },
      { title: "Consulta tus propios sistemas", desc: "Apúntala a tu API y podrá consultar un pedido, mirar el stock o dar tus precios reales durante la llamada, en vez de adivinar o dejarte un recado que tendrás que responder después." },
      { title: "No se inventa nada", desc: "Indica los temas que nunca debe responder y lo dirá con claridad en vez de adivinar. Dale las respuestas que deben ser exactas y usará las tuyas. Tras cada llamada compara lo que dijo con lo que le contaste y marca lo que no pudo respaldar. Y si alguien pregunta directamente si habla con una IA, se lo dice." },
      { title: "Reconoce a los de siempre", desc: "A quien ya ha llamado antes le saluda por su nombre y no le vuelve a pedir lo que ya contó. Un interruptor lo desactiva si prefieres que no lo haga." },
    ],
  },

  faq: {
    heading: "Preguntas frecuentes",
    items: [
      {
        q: "¿Qué es un recepcionista con IA?",
        a: "Un recepcionista con IA es un asistente telefónico virtual que contesta automáticamente las llamadas de su negocio las 24 horas del día. Saluda con una voz natural, responde preguntas, califica oportunidades de venta, agenda citas y le envía un resumen de cada llamada, para que no pierda ningún cliente, ni siquiera fuera de horario o en los momentos de más trabajo.",
      },
      {
        q: "¿Cómo funciona un contestador automático con IA?",
        a: "AI Receptionist Now se conecta a un número de teléfono propio o a la línea que ya utiliza su negocio. Cuando alguien llama, la IA descuelga al instante, mantiene una conversación natural y sigue las instrucciones que usted haya configurado: responde preguntas frecuentes, recoge los datos de quien llama, transfiere la llamada o agenda citas directamente en su calendario. Después de cada llamada recibe la transcripción y un resumen por correo electrónico o mensaje.",
      },
      {
        q: "¿El recepcionista con IA contesta llamadas 24/7?",
        a: "Sí. AI Receptionist Now contesta todas las llamadas a cualquier hora: de noche, los fines de semana, los festivos y cuando todas las líneas están ocupadas, sin tiempos de espera y sin buzón de voz. Los negocios que se pasan a esta solución suelen dejar de perder oportunidades por llamadas no atendidas o fuera de horario ya en la primera semana.",
      },
      {
        q: "¿Cuánto se tarda en configurar AI Receptionist Now?",
        a: "La configuración lleva menos de 10 minutos. Describa su negocio, elija una voz y un idioma, defina cómo deben gestionarse las llamadas y la IA estará lista para atender ese mismo día. No hacen falta conocimientos técnicos ni de programación.",
      },
      {
        q: "¿Notará quien llama que está hablando con una IA?",
        a: "La IA suena natural y conversacional, y muchas personas no notan la diferencia. Usted mantiene el control: puede hacer que la IA se presente como asistente virtual o que la experiencia sea totalmente fluida, según lo que encaje mejor con su marca.",
      },
      {
        q: "¿Puede agendar citas e integrarse con mi calendario y mi CRM?",
        a: "Sí. Agenda durante la llamada en Google Calendar, Microsoft Calendar o Cal.com, comprueba antes que el hueco esté libre cuando el calendario lo permite, y envía un SMS de confirmación a quien llama. Más allá de los calendarios, puedes apuntarla a tu propia API para que consulte un pedido o el stock en plena llamada, y cada resumen y transcripción se puede enviar a tu CRM por webhook.",
      },
      {
        q: "¿Qué idiomas admite el recepcionista con IA?",
        a: "La IA atiende llamadas en más de 25 idiomas y puede cambiar de idioma en mitad de la conversación según quien llame, algo ideal para negocios con clientes multilingües que quieren que todo el mundo se sienta comprendido.",
      },
      {
        q: "¿Qué pasa si la IA no puede resolver una llamada?",
        a: "La IA toma decisiones a partir del contexto que usted le facilita, lo que le permite resolver por sí sola la gran mayoría de las llamadas. Si una petición se sale de su ámbito, puede recoger los datos, programar una devolución de llamada o transferir la llamada en tiempo real a usted o a alguien de su equipo.",
      },
      {
        q: "¿Cuánto cuesta un recepcionista con IA?",
        a: "Puede empezar gratis y pasar a un plan superior solo cuando necesite más llamadas o más funciones. Un recepcionista con IA cuesta una fracción de lo que supone contratar personal de recepción o un servicio de contestador, y aun así atiende todas las llamadas 24/7. La mayoría de los negocios recuperan la inversión con los trabajos adicionales que consiguen agendar y las llamadas que antes perdían.",
      },
      {
        q: "¿Están seguros mis datos?",
        a: "Sí. Todos los datos de las llamadas se cifran en tránsito y en reposo. Cumplimos los requisitos del GDPR y de la HIPAA, y sus datos nunca se venden, ni se comparten con terceros, ni se utilizan para entrenar modelos de IA externos.",
      },
    ],
  },

  footerCta: {
    heading: "Gestión de llamadas escalable con AI Receptionist Now.",
    body: "Pruebe AI Receptionist Now y compruebe cómo nuestro asistente telefónico con IA automatiza sus llamadas y descarga de trabajo a su equipo. Es sencillo, eficiente y funciona a todas horas.",
    cta: "Cree ahora su propia IA",
  },
};
