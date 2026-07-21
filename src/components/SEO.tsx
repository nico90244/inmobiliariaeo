import { Helmet } from "react-helmet-async";

const SITE_URL = "https://inmobiliariaeo.com";
const DEFAULT_IMAGE = `${SITE_URL}/hero-bg.jpg`;

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article" | "product";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const SEO = ({ title, description, path = "/", image = DEFAULT_IMAGE, type = "website", jsonLd }: SEOProps) => {
  const url = `${SITE_URL}${path}`;
  return (
    <Helmet>
      {/* Básicos */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <link rel="canonical" href={url} />

      {/* Geo — Cali, Valle del Cauca, Colombia */}
      <meta name="geo.region" content="CO-VAC" />
      <meta name="geo.placename" content="Cali, Valle del Cauca, Colombia" />
      <meta name="geo.position" content="3.4516;-76.5320" />
      <meta name="ICBM" content="3.4516, -76.5320" />

      {/* hreflang — una sola versión en español para todos los mercados */}
      <link rel="alternate" hrefLang="es" href={url} />
      <link rel="alternate" hrefLang="x-default" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Inmobiliaria Eliana Osorio" />
      <meta property="og:locale" content="es_CO" />
      <meta property="og:locale:alternate" content="es_ES" />
      <meta property="og:locale:alternate" content="es_CL" />
      <meta property="og:locale:alternate" content="es_US" />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Inmobiliaria Eliana Osorio — Propiedades en Cali, Colombia" />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default SEO;
