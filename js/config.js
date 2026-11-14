/* ============================================================
   COPYWRITER FOR YOU — central configuration
   Edit business details, services, examples, FAQ and the
   booking integration here. No other file needs to change.
   ============================================================ */
window.CFY_CONFIG = {

  business: {
    name: "Copywriter For You",
    street: "Wollegrasweg 23",
    city: "1313 EM Almere",
    country: "Nederland",
    phoneDisplay: "+31 6 14645205",
    phoneHref: "tel:+31614645205",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Wollegrasweg+23%2C+1313+EM+Almere",
    hours: "24 uur geopend",
    plusCode: "96J2+Q9 Almere"
  },

  integrations: {
    /* Booking & contact submission endpoints.
       "/api/..."  -> use the included server.py (default, works out of the box)
       "https://formspree.io/f/YOUR_ID" -> use Formspree (static hosting)
       ""          -> online submission disabled; the form honestly shows
                      a phone fallback instead of pretending to submit. */
    bookingEndpoint: "",
    contactEndpoint: "",
    maxDaysAhead: 120
  },

  /* Preferred day parts — these are preferences, NOT confirmed slots. */
  timeWindows: [
    { id: "ochtend", label: "Ochtend",  hint: "09:00 – 12:00" },
    { id: "middag",  label: "Middag",   hint: "12:00 – 17:00" },
    { id: "avond",   label: "Avond",    hint: "17:00 – 21:00" },
    { id: "overleg", label: "In overleg", hint: "samen een moment kiezen" }
  ],

  services: [
    { id: "website", title: "Websiteteksten", tag: "Conversie",
      desc: "Homepages, dienstenpagina’s en landingspagina’s die in één oogopslag duidelijk maken wat je doet — en voor wie.",
      img: "https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&crop=entropy&w=640&h=440&q=70" },
    { id: "seo", title: "SEO-copywriting", tag: "Vindbaarheid",
      desc: "Teksten die prettig lezen voor mensen en logisch in elkaar zitten voor zoekmachines. Zonder trefwoorden te proppen.",
      img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&crop=entropy&w=640&h=440&q=70" },
    { id: "blog", title: "Blogs en artikelen", tag: "Autoriteit",
      desc: "Onderbouwde artikelen die je kennis laten zien en de lezer iets opleveren om te onthouden.",
      img: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&crop=entropy&w=640&h=440&q=70" },
    { id: "product", title: "Productbeschrijvingen", tag: "E-commerce",
      desc: "Van specificatie naar verhaal: beschrijvingen die laten zien waarom jouw product de moeite waard is.",
      img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&crop=entropy&w=640&h=440&q=70" },
    { id: "zakelijk", title: "Zakelijke teksten", tag: "B2B",
      desc: "Offertes, brochures, presentaties en correspondentie met een professionele, herkenbare toon.",
      img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&crop=entropy&w=640&h=440&q=70" },
    { id: "email", title: "E-mailmarketing en nieuwsbrieven", tag: "Activatie",
      desc: "E-mails met een duidelijke aanleiding, een heldere boodschap en een logische vervolgstap.",
      img: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&crop=entropy&w=640&h=440&q=70" },
    { id: "rewrite", title: "Herschrijven en verbeteren", tag: "Redactie",
      desc: "Bestaande teksten aanscherpen: korter waar het kan, scherper waar het moet — met behoud van je eigen stem.",
      img: "https://images.unsplash.com/photo-1505682634904-d7c8d95cdc50?auto=format&fit=crop&crop=entropy&w=640&h=440&q=70" }
  ],

  process: [
    { nr: "01", title: "Kennismaking", desc: "We bespreken je bedrijf, je doelen en wat de tekst moet gaan doen. Geen formulieren-marathon, gewoon een goed gesprek." },
    { nr: "02", title: "Strategie", desc: "We bepalen de boodschap, de toon en de doelgroep. Pas als de richting helder is, gaat de pen op papier." },
    { nr: "03", title: "Creatie", desc: "De teksten worden geschreven: doordacht, verzorgd en helemaal gericht op jouw lezer." },
    { nr: "04", title: "Feedback", desc: "Je leest mee en geeft feedback. We bespreken de opmerkingen en schaven bij waar nodig." },
    { nr: "05", title: "Oplevering", desc: "Je ontvangt de definitieve, afgesproken teksten — klaar voor publicatie." }
  ],

  faq: [
    { q: "Welke diensten biedt Copywriter For You aan?",
      a: "Van websiteteksten en SEO-copy tot blogs, productbeschrijvingen, zakelijke teksten en e-mailcampagnes. Ook bestaande teksten kunnen worden herschreven of aangescherpt.",
      link: { href: "#diensten", label: "Bekijk alle diensten" } },
    { q: "Hoe verloopt een samenwerking?",
      a: "In vijf stappen: kennismaking, strategie, creatie, feedback en oplevering. Je weet vooraf wat je kunt verwachten en wanneer je iets ontvangt.",
      link: { href: "#werkwijze", label: "Lees de werkwijze" } },
    { q: "Kan ik een vrijblijvend gesprek aanvragen?",
      a: "Ja. Via ‘Reserveer een gesprek’ kies je een voorkeursdatum en een dagdeel. Je aanvraag wordt pas een afspraak zodra datum en tijd samen zijn bevestigd." },
    { q: "Hoe vraag ik een offerte aan?",
      a: "Beschrijf je project in het aanvraagformulier of bel +31 6 14645205. Op basis van je wensen ontvang je een voorstel dat past bij de opdracht." },
    { q: "Wat kost een tekst?",
      a: "Dat verschilt per opdracht: een productbeschrijving is iets anders dan een complete website. Vraag een offerte aan en je krijgt vooraf een duidelijk voorstel — zonder verrassingen achteraf." },
    { q: "Hoe kan ik contact opnemen?",
      a: "Bel +31 6 14645205 of gebruik het contactformulier onderaan deze pagina. Het bedrijf staat vermeld als 24 uur geopend; een bezoek is het prettigst na een afspraak.",
      link: { href: "#contact", label: "Naar contactgegevens" } }
  ],

  /* Illustrative writing samples. Fictional brands — never real client work. */
  samples: [
    { id: "homepage", label: "Website-homepage", kind: "Homepage-copy",
      brand: "Fictief architectenbureau ‘Bureau Linde’",
      title: "Ruimte die klopt. Tot in de details.",
      body: [
        "Een goed gebouw begint niet met tekenen, maar met kijken. Naar hoe je leeft, werkt en beweegt. Bureau Linde ontwerpt woningen en werkruimtes waarin elk detail een reden heeft — van de lichtinval in de ochtend tot de plek waar je je jas ophangt.",
        "Geen ontwerpen om indruk te maken, maar om in te leven. Bekijk de projecten en ontdek wat er mogelijk is op jouw kavel."
      ],
      note: "Doel: helder positioneren en doorverwijzen naar projecten." },
    { id: "product", label: "Productbeschrijving", kind: "E-commerce",
      brand: "Fictieve koffiebranderij ‘Brandpunt’",
      title: "Ochtendploeg — de eerste slok moet kloppen.",
      body: [
        "Ochtendploeg is een medium gebrande blend van Braziliaanse en Ethiopische bonen: zacht als chocolade, met een fris randje citrus dat wakker maakt zonder te schreeuwen. Gebrand in kleine batches, elke week vers.",
        "Voor filter, cafetière of gewoon een sterke bak op kantoor. 250 gram, hele bonen. Jouw ochtend, beter geformuleerd."
      ],
      note: "Doel: smaak tastbaar maken en de drempel naar bestellen verlagen." },
    { id: "intro", label: "Zakelijke introductie", kind: "B2B-profiel",
      brand: "Fictief IT-bedrijf ‘Vastpunt’",
      title: "IT die draait. Zonder dat je erover nadenkt.",
      body: [
        "Vastpunt houdt de IT van middelgrote organisaties draaiende — zonder dat iemand erover na hoeft te denken. Werkplekken, netwerken en back-ups worden beheerd, en als er tóch iets misgaat, is er een vast aanspreekpunt dat jouw systemen kent.",
        "Geen ticketnummers die verdwijnen in een wachtrij. Zo blijft IT waar het hoort: op de achtergrond, zodat jouw team voorop kan."
      ],
      note: "Doel: een technische dienst vertalen naar geruststelling en vertrouwen." },
    { id: "blog", label: "Blogartikel", kind: "Verhalende opening",
      brand: "Fictieve bakkerij ‘Brood & Zonen’",
      title: "De geur van vier uur ’s ochtends",
      body: [
        "Wie om vier uur langs de bakkerij fietst, ruikt het al: desem dat sinds gisteren staat te rijzen. Hier wordt brood gebakken zoals het altijd gebakken is — met meel van de molen om de hoek, zeezout en tijd. Vooral tijd, want een goed desem laat zich niet haasten.",
        "In deze blog nemen we je mee door een nacht in de bakkerij: van de eerste kneep tot het eerste brood uit de oven."
      ],
      note: "Doel: vakmanschap voelbaar maken en de lezer het verhaal in trekken." },
    { id: "email", label: "Marketing-e-mail", kind: "Campagne",
      brand: "Fictieve webshop ‘Wolwaar’",
      title: "Onderwerp: Je favoriete trui is terug.",
      body: [
        "De dagen worden korter, de koffie sterker. Hoog tijd voor wol die haar werk doet. De merino-klassiekers zijn weer op voorraad — in drie nieuwe tinten die passen bij elke herfstwandeling.",
        "Geen kriebels, geen gedoe, gewoon een trui die jaren meegaat. Bekijk de collectie en vind jouw tint."
      ],
      note: "Doel: seizoensgevoel koppelen aan een duidelijke, zachte call-to-action." }
  ]
};