import { lazy, Suspense } from "react";
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
import PropiedadesBarrio from "./pages/PropiedadesBarrio";
import PropertyDetail from "./pages/PropertyDetail";
import Servicios from "./pages/Servicios";
import Captacion from "./pages/Captacion";
import Contacto from "./pages/Contacto";
import PreguntasFrecuentes from "./pages/PreguntasFrecuentes";
import NotFound from "./pages/NotFound";

// Cargadas bajo demanda: el panel de administración arrastra recharts (para
// las gráficas de AdminReportes), una librería pesada que no tiene por qué
// descargar quien solo visita el catálogo público. Sin este code-splitting,
// TODAS las rutas —incluidas /venta, /alquiler, /propiedades— tenían que
// bajar un único bundle de ~985 KB antes de poder mostrar nada.
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Admin = lazy(() => import("./pages/Admin"));
const PropertyFicha = lazy(() => import("./pages/PropertyFicha"));
const Sitemap = lazy(() => import("./pages/Sitemap"));
const EmergenciaLanding = lazy(() => import("./pages/emergencia/EmergenciaLanding"));
const EmergenciaPublicar = lazy(() => import("./pages/emergencia/EmergenciaPublicar"));
const EmergenciaBuscar = lazy(() => import("./pages/emergencia/EmergenciaBuscar"));
const EmergenciaMiPublicacion = lazy(() => import("./pages/emergencia/EmergenciaMiPublicacion"));
const PoliticaPrivacidad = lazy(() => import("./pages/PoliticaPrivacidad"));

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
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/propiedades" element={<Propiedades />} />
                <Route path="/propiedades/:id" element={<PropertyDetail />} />
                <Route path="/ficha/:id" element={<PropertyFicha />} />
                <Route path="/venta" element={<Propiedades />} />
                <Route path="/venta/:barrio" element={<PropiedadesBarrio />} />
                <Route path="/alquiler" element={<Propiedades />} />
                <Route path="/alquiler/:barrio" element={<PropiedadesBarrio />} />
                <Route path="/servicios" element={<Servicios />} />
                <Route path="/captacion" element={<Captacion />} />
                <Route path="/contacto" element={<Contacto />} />
                <Route path="/preguntas-frecuentes" element={<PreguntasFrecuentes />} />
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
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
