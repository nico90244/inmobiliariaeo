import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PropertiesSection from "@/components/PropertiesSection";
import ServicesSection from "@/components/ServicesSection";
import WhyUsSection from "@/components/WhyUsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const Index = () => {
  useScrollReveal();

  const orgJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      "@id": "https://inmobiliariaeo.com/#organization",
      name: "Inmobiliaria Eliana Osorio",
      alternateName: "Inmobiliaria EO",
      url: "https://inmobiliariaeo.com",
      logo: "https://inmobiliariaeo.com/logo.png",
      image: "https://inmobiliariaeo.com/hero-bg.jpg",
      description: "Inmobiliaria en Cali, Colombia especializada en venta, arriendo y asesoría jurídica de propiedad raíz. Atendemos colombianos en Colombia y en el exterior.",
      telephone: "+57 318 653 1598",
      email: "info@inmobiliariaeo.com",
      foundingDate: "2014",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Cali",
        addressRegion: "Valle del Cauca",
        addressCountry: "CO",
        addressCountryName: "Colombia",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: "3.4516",
        longitude: "-76.5320",
      },
      areaServed: [
        { "@type": "City", name: "Cali", containedInPlace: { "@type": "State", name: "Valle del Cauca" } },
        { "@type": "Country", name: "Colombia" },
        { "@type": "Country", name: "España" },
        { "@type": "Country", name: "Suiza" },
        { "@type": "Country", name: "Estados Unidos" },
        { "@type": "Country", name: "Canadá" },
        { "@type": "Country", name: "Chile" },
      ],
      serviceArea: {
        "@type": "GeoCircle",
        geoMidpoint: { "@type": "GeoCoordinates", latitude: "3.4516", longitude: "-76.5320" },
        geoRadius: "150000",
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Servicios Inmobiliarios",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Venta de inmuebles en Cali" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Arriendo y administración de propiedades" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Asesoría jurídica inmobiliaria" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Acompañamiento notarial" } },
        ],
      },
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "08:00", closes: "18:00" },
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday"], opens: "09:00", closes: "14:00" },
      ],
      priceRange: "$$",
      sameAs: [
        "https://www.instagram.com/inmobiliaria_eo?igsh=anpmd2ltY3Brdmhj",
        "https://www.facebook.com/share/1RNxRhpUUb/?mibextid=wwXIfr",
        "https://www.tiktok.com/@inmobiliaria_eo?is_from_webapp=1&sender_device=pc",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "¿Puedo comprar un inmueble en Cali desde España, Suiza, Estados Unidos, Canadá o Chile?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sí. En Inmobiliaria Eliana Osorio atendemos colombianos residentes en el exterior que desean comprar o invertir en propiedad raíz en Cali y el Valle del Cauca. Te acompañamos en todo el proceso jurídico y notarial de forma remota.",
          },
        },
        {
          "@type": "Question",
          name: "¿Qué incluye la asesoría jurídica inmobiliaria?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Nuestra asesoría jurídica incluye estudio de títulos, revisión de tradición y libertad, elaboración de promesas de compraventa y contratos de arrendamiento, y acompañamiento ante notarías y curadurías en Cali — sin costos adicionales.",
          },
        },
        {
          "@type": "Question",
          name: "¿Cómo puedo arrendar mi apartamento en Cali si vivo en el exterior?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Gestionamos el arriendo de tu propiedad en Cali aunque estés en otro país: publicamos el inmueble, seleccionamos al arrendatario, cobramos el canon mensual y te transferimos el dinero a tu cuenta. Todo con respaldo jurídico.",
          },
        },
        {
          "@type": "Question",
          name: "¿En qué zonas de Cali trabajan?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Trabajamos en todas las comunas y barrios de Cali, incluyendo Ciudad Jardín, El Peñón, Bochalema, Chipichape, San Fernando, Granada, Alameda, Limonar, Valle del Lili, y municipios del Valle del Cauca.",
          },
        },
        {
          "@type": "Question",
          name: "¿Cuánto tiempo lleva Inmobiliaria Eliana Osorio en el mercado?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Contamos con más de 10 años de experiencia en el mercado inmobiliario de Cali y el Valle del Cauca, acompañando la compra, venta y arriendo de propiedades con asesoría jurídica integral.",
          },
        },
      ],
    },
  ];

  return (
    <>
      <SEO
        title="Inmobiliaria en Cali, Colombia | Venta y Arriendo de Propiedades | Eliana Osorio"
        description="Compra, vende o arrienda inmuebles en Cali y el Valle del Cauca con asesoría jurídica incluida. Casas, apartamentos y locales. Atendemos colombianos en Colombia y en el exterior — España, Suiza, EEUU, Canadá y Chile."
        path="/"
        jsonLd={orgJsonLd}
      />
      <Header />
      <main>
        <HeroSection />
        <PropertiesSection />
        <ServicesSection />
        <WhyUsSection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
};

export default Index;
