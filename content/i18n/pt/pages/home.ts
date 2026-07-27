// Portuguese (pt-PT) home page copy. Status is "draft" in ../manifest.ts until a
// native speaker approves it - see content/i18n/pt/manifest.ts.
//
// Register: European Portuguese, formal "voce" throughout the marketing voice,
// post-AO90 spelling ("rececionista", "contactado", "efetuar"). The testimonial
// quotes keep the loose, lowercase, spoken tone of the English originals on
// purpose; they are customer speech, not brand copy, and polishing them into
// formal prose would make them read as fabricated. Names are never translated.

import type { HomeCopy } from "../../_home-copy";

export const ptHome: HomeCopy = {
  // "Rececionista virtual" is the established pt-PT category term; the AO90
  // single-c spelling is kept throughout, matching this file's convention.
  metaTitle: "Rececionista virtual com IA: atende chamadas 24/7",
  metaDescription:
    "Rececionista virtual com IA que atende as chamadas da sua empresa 24/7, marca reuniões e capta cada oportunidade. Sem código, pronto em minutos.",
  hero: {
    h1: "Rececionista virtual com IA que atende todas as chamadas 24/7",
    phonePlaceholder: "Introduza o número de telefone",
    ctaCall: "Fale já com a nossa IA",
    ctaCalling: "A ligar...",
    invalidPhone: "Introduza um número de telefone válido.",
    callPlaced: "Estamos a ligar-lhe, atenda o telefone!",
    callFailed: "Não foi possível efetuar a chamada.",
    callFailedRetry: "Não foi possível efetuar a chamada. Tente novamente.",
    consent: {
      before: "Ao efetuar esta chamada, aceita ser",
      contactLink: "contactado por nós",
      between: "e confirma ter lido a nossa",
      privacyLink: "política de privacidade",
      after: ".",
    },
    avatarAlts: [
      "Maria, utilizadora do AI Receptionist Now",
      "Mustafa, utilizador do AI Receptionist Now",
      "Saheed, utilizador do AI Receptionist Now",
      "Delphine, utilizadora do AI Receptionist Now",
    ],
    usersCount: "9 500+ utilizadores em todo o mundo",
    usersTagline: "Todas as chamadas atendidas, 24 horas por dia.",
    ratingHeadline: "Avaliação de topo",
    ratingCount: "1 200+ avaliações",
    ratingScore: "4,8 em 5",
  },

  testimonials: {
    heading: "A escolha de quem tem o telefone sempre a tocar",
    sub: "Milhares de chamadas atendidas todos os dias, sem perder nenhuma.",
    items: [
      { quote: "A nossa receção perdia chamadas constantemente durante as consultas. Agora todas as chamadas são atendidas 24 horas por dia e as marcações praticamente fazem-se sozinhas. A equipa pode finalmente concentrar-se nos doentes.", name: "Dr. Amanda Reyes", role: "Medicina Geral e Familiar" },
      { quote: "na obra não conseguia atender, portanto perdia clientes todas as semanas. isto atende tudo, qualifica o contacto e manda-me um resumo por SMS. fechei 3 trabalhos este mês que me tinham escapado.", name: "Mike Donovan", role: "Canalização e desentupimentos" },
      { quote: "Configurei em uns 20 minutos na pausa do almoço. Agora trata de todas as chamadas de marcação enquanto a minha equipa trabalha com os clientes. sinceramente devia ter feito isto há um ano.", name: "Jasmine Torres", role: "Spa" },
      { quote: "Sou uma agência de uma pessoa só, nem sempre posso atender. Qualifica todos os interessados, recolhe os dados e marca as visitas diretamente na minha agenda. como ter uma rececionista a tempo inteiro por quase nada.", name: "Brian Callahan", role: "Agente imobiliário" },
      { quote: "Tínhamos duas pessoas só para atender o telefone. Agora a IA fica com o excedente e com as chamadas fora de horas. Cortámos os custos da receção quase para metade.", name: "Priya Sharma", role: "Clínica dentária" },
      { quote: "a voz é assustadoramente natural. Metade dos meus clientes nem faz ideia de que está a falar com uma IA. Marca a hora, confirma, está feito.", name: "Carlos Mendez", role: "Oficina automóvel" },
      { quote: "as chamadas perdidas à noite estavam a dar cabo de nós. agora todas as chamadas fora de horas são atendidas e de manhã recebo um resumo por SMS. para um escritório pequeno mudou tudo.", name: "Rachel Goodwin", role: "Escritório de advogados" },
      { quote: "A configuração foi muito mais fácil do que eu esperava. Descrevi o negócio, escolhi umas opções e no mesmo dia já estava a atender chamadas. Não é preciso perceber nada de tecnologia.", name: "Tom Bradley", role: "Serviços de AVAC" },
      { quote: "Põe todas as marcações diretamente na minha agenda e nunca marca duas ao mesmo tempo. Às sextas à noite atender o telefone era um caos, acabou-se.", name: "Nina Petrova", role: "Cabeleireiro" },
      { quote: "no início estava mesmo desconfiado mas lida com perguntas estranhas melhor do que o serviço de atendimento que eu tinha. e custa uma fração do preço.", name: "Derek Olsen", role: "Empresa de coberturas" },
      { quote: "Recebemos muitas chamadas de clientes que falam espanhol e muda de língua sem problema nenhum. regista tudo e manda-me o contacto por email na hora.", name: "Sofia Ramirez", role: "Agência de seguros" },
      { quote: "na hora do jantar o telefone não para de tocar. agora a IA aceita as reservas e os pedidos de take-away enquanto nós cozinhamos. salvou-nos imensas mesas.", name: "Marco Bianchi", role: "Restaurante" },
      { quote: "Marca consultas, responde a perguntas sobre preços e manda-me um resumo de cada chamada. parece que contratei uma rececionista sem ter de lhe pagar salário.", name: "Hannah Cole", role: "Clínica de estética" },
      { quote: "Trabalho sozinho e não posso parar a meio de um serviço para atender. ele atende, qualifica e manda-me mensagem com o que é urgente. fechei mais trabalho este mês do que nunca.", name: "Wes Carter", role: "Eletricista" },
      { quote: "mudei de um call center que andava sempre a trocar as marcações. isto nunca erra a marcação e ainda por cima soa simpático.", name: "Linda Park", role: "Clínica de quiropraxia" },
      { quote: "só a cobertura fora de horas já se pagou a si própria. as pessoas ligam às 21h e mesmo assim ficam com marcação. acabou o joguinho do atendedor de chamadas.", name: "Greg Sullivan", role: "Controlo de pragas" },
      { quote: "experimentei primeiro no plano gratuito e logo na primeira semana já tinha 4 marcações feitas. fiz upgrade no mesmo dia. decisão fácil.", name: "Aisha Khan", role: "Estúdio de unhas" },
      { quote: "liga-se diretamente à nossa agenda e ao CRM, por isso não se perde nada. a configuração levou uma noite e desde aí trabalha impecável.", name: "Daniel Wright", role: "Equipa imobiliária" },
    ],
  },

  howItWorks: {
    heading: "Pronto a funcionar em menos de 10 minutos.",
    sub: "Qualquer pessoa consegue pôr o AI Receptionist Now a funcionar - sem saber programar.",
    steps: [
      {
        title: "Crie assistentes telefónicos com IA",
        desc: "Escolha a voz, o idioma e a mensagem de boas-vindas.",
        imageAlt: "Criar a sua rececionista com IA no iPhone",
      },
      {
        title: "Defina o comportamento na chamada e o pós-atendimento",
        desc: "Configure diferentes formas de tratar as chamadas e escolha como quer receber as transcrições.",
        imageAlt: "Definir o comportamento na chamada no iPhone",
      },
      {
        title: "Deixe a IA atender as suas chamadas",
        desc: "A IA fica ligada a um número do AI Receptionist Now ou ao seu próprio sistema telefónico.",
        imageAlt: "A IA a atender uma chamada no iPhone",
      },
    ],
  },

  useCases: {
    heading: "Casos de utilização",
    sub: "O nosso assistente telefónico com IA adapta-se com flexibilidade às suas necessidades e integra-se com a sua agenda e o seu CRM. Chamadas automatizadas que fazem sentido.",
    cta: "Começar agora",
    items: [
      { title: "Receção e encaminhamento", desc: "Atende as chamadas recebidas e encaminha-as para a pessoa certa." },
      { title: "Transcrição de chamadas", desc: "Recolhe os pedidos, transcreve-os e envia-lhe um resumo por email." },
      { title: "Apoio ao cliente", desc: "Responde aos pedidos dos clientes 24 horas por dia, com um comportamento rigorosamente definido." },
      { title: "Marcações e agendamentos", desc: "Agenda marcações durante a conversa, com confirmação imediata." },
      { title: "Processamento de encomendas", desc: "Tratamento automático e rápido a qualquer hora - sem esperas e sem encomendas perdidas." },
      { title: "Mais de 50 outras opções", desc: "Cada negócio é diferente. Configure a IA à medida exata do seu processo." },
    ],
  },

  faq: {
    heading: "Perguntas frequentes",
    items: [
      {
        q: "O que é uma rececionista com IA?",
        a: "Uma rececionista com IA é um assistente telefónico virtual que atende automaticamente as chamadas da sua empresa, 24 horas por dia. Recebe quem liga com uma voz natural, responde a perguntas, qualifica potenciais clientes, agenda marcações e envia-lhe um resumo de cada chamada - para que nunca perca um cliente, mesmo fora de horas ou nos períodos de maior movimento.",
      },
      {
        q: "Como funciona um serviço de atendimento telefónico com IA?",
        a: "O AI Receptionist Now liga-se a um número dedicado ou à linha que a sua empresa já utiliza. Quando alguém liga, a IA atende de imediato, mantém uma conversa natural e segue as instruções que definiu - responde a perguntas frequentes, recolhe os dados de quem liga, encaminha a chamada ou agenda marcações diretamente na sua agenda. Depois de cada chamada, recebe a transcrição e o resumo por email ou SMS.",
      },
      {
        q: "A rececionista com IA atende chamadas 24 horas por dia?",
        a: "Sim. O AI Receptionist Now atende todas as chamadas a qualquer hora - de noite, aos fins de semana, nos feriados e quando as linhas estão ocupadas - sem tempos de espera e sem atendedor de chamadas. As empresas que mudam deixam normalmente de perder oportunidades por chamadas não atendidas logo na primeira semana.",
      },
      {
        q: "Em quanto tempo consigo configurar o AI Receptionist Now?",
        a: "A configuração demora menos de 10 minutos. Descreva o seu negócio, escolha uma voz e um idioma, defina como as chamadas devem ser tratadas e a IA fica pronta a atender no próprio dia. Não são precisos conhecimentos técnicos nem de programação.",
      },
      {
        q: "Quem liga percebe que está a falar com uma IA?",
        a: "A IA tem uma voz natural e conversa de forma fluida, e muitas pessoas não notam a diferença. O controlo é seu: pode fazer com que a IA se apresente como assistente virtual ou manter a experiência totalmente contínua - conforme o que fizer mais sentido para a sua marca.",
      },
      {
        q: "Consegue agendar marcações e integrar-se com a minha agenda e o meu CRM?",
        a: "Sim. O AI Receptionist Now agenda marcações durante a chamada e integra-se nativamente com Google Calendar, Outlook, HubSpot, Salesforce e Calendly, além de milhares de aplicações através do Zapier. Estão disponíveis integrações personalizadas através da nossa API aberta, para que os dados de quem liga cheguem diretamente às ferramentas que já utiliza.",
      },
      {
        q: "Que idiomas suporta a rececionista com IA?",
        a: "A IA atende chamadas em mais de 25 idiomas e consegue mudar de língua a meio da conversa consoante quem liga - ideal para empresas com clientes que falam várias línguas e que querem que todos se sintam compreendidos.",
      },
      {
        q: "O que acontece se a IA não conseguir resolver uma chamada?",
        a: "A IA decide com base no contexto que lhe fornece, o que resolve a grande maioria das chamadas sem qualquer ajuda. Se um pedido sair do âmbito definido, pode recolher os detalhes, agendar um contacto posterior ou transferir a chamada para si ou para um membro da equipa em tempo real.",
      },
      {
        q: "Quanto custa uma rececionista com IA?",
        a: "Pode começar gratuitamente e só passar a um plano superior quando precisar de mais chamadas ou funcionalidades. Uma rececionista com IA custa uma fração do que custa contratar pessoal para a receção ou um serviço de atendimento, e atende todas as chamadas 24 horas por dia - a maioria das empresas recupera o investimento apenas com os trabalhos adicionais que passa a fechar.",
      },
      {
        q: "Os meus dados estão seguros?",
        a: "Sim. Todos os dados das chamadas são encriptados em trânsito e em repouso. Cumprimos os requisitos do GDPR e da HIPAA, e os seus dados nunca são vendidos, partilhados com terceiros ou usados para treinar modelos de IA externos.",
      },
    ],
  },

  footerCta: {
    heading: "Gestão de chamadas à escala com o AI Receptionist Now.",
    body: "Experimente o AI Receptionist Now e veja como o nosso assistente telefónico com IA automatiza as suas chamadas e alivia a carga da sua equipa. É simples, eficiente e funciona a qualquer hora.",
    cta: "Crie já a sua própria IA",
  },
};
