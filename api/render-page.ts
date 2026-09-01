import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

/**
 * Renderizado dinámico para bots de las páginas "de catálogo/marketing"
 * (/propiedades, /venta, /alquiler, /servicios, /contacto, /captacion).
 *
 * El sitio es una SPA sin SSR: index.html es literalmente <div id="root">
 * vacío para TODAS las rutas — los meta tags y el contenido los inyecta
 * React después de que el JS carga. Confirmado con Google Search Console:
 * estas seis páginas aparecían como "Descubierta: actualmente no indexada"
 * (Google encontró la URL pero no le encontró contenido que indexar en el
 * primer pase de rastreo, que no ejecuta JavaScript). Esta función sirve
 * exactamente el mismo título, descripción y contenido visible que ve un
 * usuario real (no es cloaking), ya renderizado en HTML plano, para los
 * bots que vercel.json enruta aquí. Los usuarios reales siguen recibiendo
 * la SPA normal.
 */

const SITE_URL = "https://inmobiliariaeo.com";
const DEFAULT_IMAGE = `${SITE_URL}/hero-bg.jpg`;

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function formatPrice(price: number | null): string {
  if (!price) return "Consultar precio";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
}

interface PropiedadRow {
  id: string;
  nombre_inmueble: string;
  tipo_inmueble: string;
  tipo_negocio: string;
  precio: number | null;
  barrio: string | null;
  ciudad: string | null;
  foto_portada: string | null;
}

interface PageConfig {
  slug: string;
  path: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  extraHtml?: string;
  extraJsonLd?: unknown[];
  listingFilter?: "Venta" | "Alquiler"; // omitido = todas
}

const SERVICIOS = [
  { title: "Venta de inmuebles", description: "Gestionamos la venta de tu propiedad con estrategia de mercado, fotografía profesional y presencia en los principales portales inmobiliarios como Metrocuadrado y Finca Raíz." },
  { title: "Alquiler y administración", description: "Encontramos el arrendatario ideal y administramos tu propiedad: cobro de cánones, mantenimiento y gestión integral del contrato de arrendamiento." },
  { title: "Asesoría jurídica", description: "Revisión de títulos, estudio de tradición y libertad, elaboración de contratos y acompañamiento legal en cada transacción inmobiliaria." },
  { title: "Acompañamiento notarial", description: "Te acompañamos en todo el proceso notarial y de registro, garantizando seguridad jurídica de principio a fin en compraventa y arrendamiento." },
];

const BENEFICIOS_CAPTACION = [
  "Promoción en portales inmobiliarios y difusión en redes sociales",
  "Asesoría jurídica incluida",
  "Elegimos el inquilino por ti",
  "Gestión de contratos",
  "Cobro y administración del canon",
  "Canon garantizado con seguro de arrendamiento",
  "Acompañamiento notarial",
  "Sin costos ocultos",
];

interface FaqEntry {
  question: string;
  answer?: string;
  intro?: string;
  bullets?: string[];
  outro?: string;
}

const FAQS: FaqEntry[] = [
  {
    question: "¿Cobran algo por mostrarme un apartamento o hacer el estudio de arrendatario?",
    answer:
      "No, no cobramos nada por mostrarte el inmueble. Lo único que tiene costo es el estudio de arrendamiento, que se hace a través de una afianzadora — trabajamos con Fianzacrédito, Sura, Bolívar y El Libertador — y corresponde a un porcentaje del canon, entre el 5,95% y el 10%, según la entidad con la que se radique tu solicitud.",
  },
  {
    question: "¿Qué garantía tengo de que el precio de arriendo no fue inflado tras la emergencia?",
    answer:
      "El valor del canon suele ser impuesto por el propietario del inmueble; sin embargo, hacemos un estudio de mercado para analizar precios de referencia y sugerir un valor según las condiciones del inmueble y los detalles que le agregan valor. Y hay algo que la ley ya protege: según la Ley 820 de 2003, el aumento del canon de un contrato vigente solo puede hacerse una vez al año y como máximo según el IPC — nunca por encima, sin importar la coyuntura. Si tienes dudas sobre un precio específico, con gusto te mostramos cómo llegamos a ese valor.",
  },
  {
    question: "¿Qué requisitos necesito para arrendar un apartamento con Inmobiliaria EO?",
    answer:
      "En general pedimos cédula, soporte de ingresos y, casi siempre, un codeudor — aunque hay casos donde no se requiere. El arrendatario y/o el codeudor deben certificar ingresos equivalentes al doble del canon. Cuando el canon supera cierto valor, se exige que el codeudor tenga finca raíz; este umbral varía según la afianzadora con la que se radique la solicitud.",
  },
  {
    question: "¿Cómo protegen mi inmueble si decido arrendarlo con ustedes?",
    intro: "Nos encargamos de todo el proceso para que tú no tengas que preocuparte por nada:",
    bullets: [
      "Tomamos fotos y video profesional del inmueble",
      "Hacemos un estudio de mercado para fijar el precio correcto",
      "Revisamos las condiciones del inmueble",
      "Gestionamos las citas y visitas",
      "Elaboramos el contrato de arrendamiento y el inventario",
      "Realizamos el estudio de arrendamiento a través de más de 3 aliados",
      "Aseguramos el arrendamiento, garantizando el pago oportuno del canon aunque el arrendatario incurra en mora",
      "Te acompañamos jurídicamente, tanto en procesos de alquiler como de venta",
    ],
    outro:
      "También ofrecemos coberturas adicionales: fianza de servicios públicos (cubre consumos no pagados al momento de la entrega), fianza integral (protege frente a deterioros o faltantes en el inventario), y acompañamiento legal para procesos de restitución si hay incumplimiento grave del contrato.",
  },
  {
    question: "¿Puedo comprar una propiedad en Cali si vivo en el exterior y no tengo crédito colombiano?",
    answer:
      "Sí, es completamente posible. Varios bancos colombianos (Bancolombia, BBVA, Banco de Bogotá, Davivienda) tienen líneas de crédito hipotecario diseñadas específicamente para colombianos en el exterior, con financiación de hasta el 70-90% del valor según el banco, y sin exigir historial crediticio en Colombia — validan tu comportamiento financiero en el país donde vives. Todo el proceso puede hacerse virtualmente, sin viajar, y con un poder notarial autorizas a alguien de confianza a firmar los documentos físicos que se requieran acá. Las condiciones exactas (tasa, porcentaje, plazos) siempre las confirma directamente el banco según el perfil de cada persona.",
  },
];

const FAQ_HTML = `<dl>\n${FAQS.map((f) => {
  const body = f.answer
    ? `<p>${escapeHtml(f.answer)}</p>`
    : `<p>${escapeHtml(f.intro!)}</p>\n        <ul>\n${f.bullets!.map((b) => `          <li>${escapeHtml(b)}</li>`).join("\n")}\n        </ul>\n        <p>${escapeHtml(f.outro!)}</p>`;
  return `        <dt><h2>${escapeHtml(f.question)}</h2></dt>\n        <dd>${body}</dd>`;
}).join("\n")}\n      </dl>\n      <p><a href="https://wa.me/573186531598?text=${encodeURIComponent("Hola, tengo una pregunta que no vi en el FAQ de la página web")}">¿Tienes otra pregunta? Escríbenos por WhatsApp</a></p>`;

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Cobran algo por mostrarme un apartamento o hacer el estudio de arrendatario?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No, no cobramos nada por mostrarte el inmueble. Lo único que tiene costo es el estudio de arrendamiento, que se hace a través de una afianzadora (trabajamos con Fianzacrédito, Sura, Bolívar y El Libertador) y corresponde a un porcentaje del canon, entre el 5,95% y el 10%, según la entidad con la que se radique la solicitud.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué garantía tengo de que el precio de arriendo no fue inflado tras la emergencia?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "El valor del canon suele ser impuesto por el propietario del inmueble; sin embargo, hacemos un estudio de mercado para analizar precios de referencia y sugerir un valor según las condiciones del inmueble. Además, según la Ley 820 de 2003, el aumento del canon de un contrato vigente solo puede hacerse una vez al año y como máximo según el IPC, nunca por encima.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué requisitos necesito para arrendar un apartamento con Inmobiliaria EO?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "En general se piden cédula, soporte de ingresos y, casi siempre, un codeudor que certifique ingresos equivalentes al doble del canon. Cuando el canon supera cierto valor, se exige que el codeudor cuente con finca raíz, según la política de cada afianzadora.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo protegen mi inmueble si decido arrendarlo con Inmobiliaria EO?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tomamos fotos y video profesional, hacemos estudio de mercado, revisamos las condiciones del inmueble, gestionamos citas y visitas, elaboramos el contrato de arrendamiento y el inventario, realizamos el estudio de arrendamiento a través de más de 3 aliados, y aseguramos el arrendamiento garantizando el pago oportuno del canon aunque el arrendatario incurra en mora. También ofrecemos acompañamiento jurídico en procesos de alquiler y venta, fianza de servicios públicos, fianza integral y acompañamiento legal en procesos de restitución.",
      },
    },
    {
      "@type": "Question",
      name: "¿Puedo comprar una propiedad en Cali si vivo en el exterior y no tengo crédito colombiano?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí, es completamente posible. Varios bancos colombianos (Bancolombia, BBVA, Banco de Bogotá, Davivienda) tienen líneas de crédito hipotecario diseñadas para colombianos en el exterior, con financiación de hasta el 70-90% del valor según el banco, y sin exigir historial crediticio en Colombia. Todo el proceso puede hacerse virtualmente, y con un poder notarial autorizas a alguien de confianza a firmar los documentos físicos que se requieran.",
      },
    },
  ],
};

const PAGES: Record<string, PageConfig> = {
  propiedades: {
    slug: "propiedades",
    path: "/propiedades",
    title: "Propiedades en Cali, Colombia | Casas, Apartamentos y Locales | Inmobiliaria EO",
    description: "Catálogo completo de propiedades en venta y arriendo en Cali y el Valle del Cauca. Casas, apartamentos, locales y más. Filtra por barrio, tipo y precio.",
    h1: "Todas las Propiedades",
    intro: "Encuentra tu inmueble ideal en Cali y el Valle del Cauca.",
  },
  venta: {
    slug: "venta",
    path: "/venta",
    title: "Casas y Apartamentos en Venta en Cali, Colombia | Inmobiliaria Eliana Osorio",
    description: "Encuentra casas, apartamentos, apartaestudios y locales en venta en Cali y el Valle del Cauca. Asesoría jurídica incluida. Ideal para comprar desde Colombia o desde el exterior.",
    h1: "Propiedades en Venta",
    intro: "Encuentra tu inmueble ideal en Cali y el Valle del Cauca.",
    listingFilter: "Venta",
  },
  alquiler: {
    slug: "alquiler",
    path: "/alquiler",
    title: "Apartamentos y Casas en Arriendo en Cali, Colombia | Inmobiliaria Eliana Osorio",
    description: "Alquila casa, apartamento o local en Cali con contratos seguros y administración de arriendos. Filtra por barrio, tipo y precio.",
    h1: "Propiedades en Alquiler",
    intro: "Encuentra tu inmueble ideal en Cali y el Valle del Cauca.",
    listingFilter: "Alquiler",
  },
  servicios: {
    slug: "servicios",
    path: "/servicios",
    title: "Servicios Inmobiliarios en Cali, Colombia | Venta, Arriendo y Asesoría Jurídica | Eliana Osorio",
    description: "Venta de inmuebles, arriendo, asesoría jurídica y acompañamiento notarial en Cali y el Valle del Cauca. Más de 10 años de experiencia. Atendemos propietarios en Colombia y colombianos en el exterior.",
    h1: "Nuestros Servicios",
    intro: "Un acompañamiento completo para cada etapa de tu inversión inmobiliaria en Cali y el Valle del Cauca.",
    extraHtml: `<ul>\n${SERVICIOS.map((s) => `        <li><h2>${escapeHtml(s.title)}</h2><p>${escapeHtml(s.description)}</p></li>`).join("\n")}\n      </ul>`,
  },
  contacto: {
    slug: "contacto",
    path: "/contacto",
    title: "Contacto | Inmobiliaria Eliana Osorio | Cali, Colombia",
    description: "Contáctanos por WhatsApp, teléfono o correo. Asesoría inmobiliaria y jurídica en Cali y el Valle del Cauca. Atendemos colombianos desde España, Suiza, Estados Unidos, Canadá y Chile.",
    h1: "Contáctanos",
    intro: "Cuéntanos qué buscas y te asesoramos sin compromiso. Atendemos colombianos en Colombia y en el exterior — España, Suiza, Estados Unidos, Canadá y Chile.",
    extraHtml: `<ul>
        <li>WhatsApp: <a href="https://wa.me/573162225604">316 222 5604</a></li>
        <li>Teléfono: <a href="tel:+573186531598">318 653 1598</a></li>
        <li>Correo: <a href="mailto:info@inmobiliariaeo.com">info@inmobiliariaeo.com</a></li>
        <li>Cali, Valle del Cauca, Colombia</li>
      </ul>`,
  },
  captacion: {
    slug: "captacion",
    path: "/captacion",
    title: "Vende o Arrienda tu Propiedad en Cali | Administramos tu Inmueble | Inmobiliaria EO",
    description: "¿Quieres vender tu casa en Cali o necesitas quien administre el arriendo de tu apartamento? Publicamos tu inmueble en Metrocuadrado y Finca Raíz, gestionamos contratos y te damos asesoría jurídica gratuita. También para propietarios desde el exterior.",
    h1: "¿Quieres vender o arrendar tu propiedad en Cali? Nosotros la administramos por ti",
    intro: "Consigna tu inmueble con nosotros: nos encargamos de la venta o de la administración completa del arriendo, con asesoría jurídica y gestión sin costos ocultos.",
    extraHtml: `<ul>\n${BENEFICIOS_CAPTACION.map((b) => `        <li>${escapeHtml(b)}</li>`).join("\n")}\n      </ul>\n      <p>Escríbenos por WhatsApp para consignar tu inmueble: <a href="https://wa.me/573162225604">316 222 5604</a></p>`,
    extraJsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "¿Cómo vendo mi casa en Cali con Inmobiliaria Eliana Osorio?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Consigna tu inmueble con el formulario de esta página o por WhatsApp. Publicamos la propiedad en Metrocuadrado y Finca Raíz, gestionamos las visitas, la negociación y toda la documentación jurídica hasta la firma de escritura, sin costos ocultos.",
            },
          },
          {
            "@type": "Question",
            name: "¿Administran mi propiedad si la quiero arrendar?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Sí. Nos encargamos de la administración completa del arriendo: selección del arrendatario, contrato, cobro del canon mensual y transferencia a tu cuenta, incluso si vives fuera de Cali o de Colombia.",
            },
          },
          {
            "@type": "Question",
            name: "¿Cuánto cobran por consignar o administrar mi inmueble?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "La asesoría jurídica está incluida sin costo adicional. Cuéntanos los datos de tu propiedad en el formulario y te explicamos la comisión aplicable según si es venta o administración de arriendo.",
            },
          },
        ],
      },
    ],
  },
  "preguntas-frecuentes": {
    slug: "preguntas-frecuentes",
    path: "/preguntas-frecuentes",
    title: "Preguntas Frecuentes | Inmobiliaria Eliana Osorio | Cali, Colombia",
    description: "Resolvemos tus dudas sobre arriendo, compra, requisitos, protección de tu inmueble y crédito hipotecario desde el exterior. Todo lo que necesitas saber antes de contactarnos.",
    h1: "Preguntas Frecuentes",
    intro: "Resolvemos las dudas más comunes sobre arrendar, comprar o consignar tu propiedad con nosotros.",
    extraHtml: FAQ_HTML,
    extraJsonLd: [FAQ_JSON_LD],
  },
};

async function fetchListado(filter?: "Venta" | "Alquiler"): Promise<PropiedadRow[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    let query = supabase
      .from("propiedades")
      .select("id, nombre_inmueble, tipo_inmueble, tipo_negocio, precio, barrio, ciudad, foto_portada")
      .eq("estado", "Disponible")
      .order("fecha_creacion", { ascending: false })
      .limit(60);
    if (filter) query = query.in("tipo_negocio", [filter, "Ambos"]);
    const { data, error } = await query;
    if (error || !data) return [];
    return data as PropiedadRow[];
  } catch {
    return [];
  }
}

function notFoundPage(res: VercelResponse) {
  res.status(404).setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Página no encontrada | Inmobiliaria Eliana Osorio</title><meta name="robots" content="noindex"></head><body><h1>Página no encontrada</h1><p><a href="${SITE_URL}/">Volver al inicio</a></p></body></html>`);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = typeof req.query.page === "string" ? req.query.page : "";
  const page = PAGES[slug];
  if (!page) {
    notFoundPage(res);
    return;
  }

  const url = `${SITE_URL}${page.path}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: page.h1, item: url },
    ],
  };

  let listingHtml = "";
  const showsListing = page.slug === "propiedades" || page.slug === "venta" || page.slug === "alquiler";
  if (showsListing) {
    const propiedades = await fetchListado(page.listingFilter);
    if (propiedades.length > 0) {
      listingHtml = `<ul>\n${propiedades
        .map((p) => {
          const ubicacion = [p.barrio, p.ciudad || "Cali"].filter(Boolean).join(", ");
          return `        <li><a href="${SITE_URL}/propiedades/${p.id}">${escapeHtml(p.nombre_inmueble)}</a> — ${escapeHtml(p.tipo_inmueble)} en ${escapeHtml(p.tipo_negocio)}, ${escapeHtml(ubicacion)}. ${escapeHtml(formatPrice(p.precio))}</li>`;
        })
        .join("\n")}\n      </ul>`;
    }
  }

  const jsonLdBlocks = [breadcrumbJsonLd, ...(page.extraJsonLd || [])]
    .map((jl) => `  <script type="application/ld+json">${safeJsonLd(jl)}</script>`)
    .join("\n");

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="${escapeHtml(page.description)}">
  <link rel="canonical" href="${url}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">

  <meta name="geo.region" content="CO-VAC">
  <meta name="geo.placename" content="Cali, Valle del Cauca, Colombia">
  <meta name="geo.position" content="3.4516;-76.5320">

  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(page.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="Inmobiliaria Eliana Osorio">
  <meta property="og:locale" content="es_CO">
  <meta property="og:image" content="${DEFAULT_IMAGE}">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(page.title)}">
  <meta name="twitter:description" content="${escapeHtml(page.description)}">
  <meta name="twitter:image" content="${DEFAULT_IMAGE}">

${jsonLdBlocks}
</head>
<body>
  <header>
    <a href="${SITE_URL}/">Inmobiliaria Eliana Osorio</a>
  </header>
  <main>
    <nav aria-label="Breadcrumb">
      <a href="${SITE_URL}/">Inicio</a> &gt; <span>${escapeHtml(page.h1)}</span>
    </nav>
    <article>
      <h1>${escapeHtml(page.h1)}</h1>
      <p>${escapeHtml(page.intro)}</p>
      ${page.extraHtml || ""}
      ${listingHtml}
      <p><a href="https://wa.me/573162225604">Escríbenos por WhatsApp</a></p>
    </article>
  </main>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=86400");
  res.status(200).send(html);
}
