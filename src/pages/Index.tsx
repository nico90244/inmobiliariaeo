import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PropertiesSection from "@/components/PropertiesSection";
import ServicesSection from "@/components/ServicesSection";
import WhyUsSection from "@/components/WhyUsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";

const Index = () => {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Inmobiliaria Eliana Osorio",
    url: "https://inmobiliariaeo.lovable.app",
    logo: "https://inmobiliariaeo.lovable.app/logo.png",
    telephone: "+57 318 653 1598",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Cali",
      addressRegion: "Valle del Cauca",
      addressCountry: "CO",
    },
    sameAs: [
      "https://instagram.com/inmobiliaria_eo",
      "https://facebook.com/inmobiliariaeo",
    ],
  };

  return (
    <>
      <SEO
        title="Inmobiliaria Eliana Osorio | Propiedades en Cali y Valle"
        description="Venta, alquiler y asesoría jurídica de propiedad raíz en Cali y el Valle del Cauca. Tu hogar con respaldo jurídico."
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
