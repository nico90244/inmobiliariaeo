import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  return (
    <>
      <Header />
      <main className="flex min-h-screen items-center justify-center bg-background pt-24">
        <div className="text-center px-6">
          <p className="font-heading text-xs font-semibold tracking-widest text-primary uppercase mb-4">Error 404</p>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground mb-6">Página no encontrada</h1>
          <p className="font-body text-lg text-muted-foreground mb-10 max-w-md mx-auto">
            La página que buscas no existe o fue movida. Regresa al inicio para continuar explorando propiedades.
          </p>
          <Link
            to="/"
            className="inline-block px-12 py-3 bg-primary text-primary-foreground font-heading text-sm font-semibold tracking-widest uppercase hover:bg-primary/90 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default NotFound;
