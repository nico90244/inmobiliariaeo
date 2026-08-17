import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import TikTokPixelTracker from "@/components/TikTokPixelTracker";
import Index from "./pages/Index";
import Propiedades from "./pages/Propiedades";
import PropertyDetail from "./pages/PropertyDetail";
import Servicios from "./pages/Servicios";
import Captacion from "./pages/Captacion";
import Contacto from "./pages/Contacto";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import PropertyFicha from "./pages/PropertyFicha";
import PropertyMicrosite from "./pages/PropertyMicrosite";
import NotFound from "./pages/NotFound";
import Sitemap from "./pages/Sitemap";
import EmergenciaLanding from "./pages/emergencia/EmergenciaLanding";
import EmergenciaPublicar from "./pages/emergencia/EmergenciaPublicar";
import EmergenciaBuscar from "./pages/emergencia/EmergenciaBuscar";
import EmergenciaMiPublicacion from "./pages/emergencia/EmergenciaMiPublicacion";
import PoliticaPrivacidad from "./pages/PoliticaPrivacidad";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <TikTokPixelTracker />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/propiedades" element={<Propiedades />} />
              <Route path="/propiedades/:id" element={<PropertyDetail />} />
              <Route path="/ficha/:id" element={<PropertyFicha />} />
              <Route path="/compartir/:id" element={<PropertyMicrosite />} />
              <Route path="/venta" element={<Propiedades />} />
              <Route path="/alquiler" element={<Propiedades />} />
              <Route path="/servicios" element={<Servicios />} />
              <Route path="/captacion" element={<Captacion />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/emergencia-terremoto" element={<EmergenciaLanding />} />
              <Route path="/emergencia-terremoto/publicar" element={<EmergenciaPublicar />} />
              <Route path="/emergencia-terremoto/buscar" element={<EmergenciaBuscar />} />
              <Route path="/emergencia-terremoto/mi-publicacion/:token" element={<EmergenciaMiPublicacion />} />
              <Route path="/mapa-del-sitio" element={<Sitemap />} />
              <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
