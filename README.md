# Inmobiliaria Eliana Osorio — Sitio Web Oficial

Sitio web oficial de **Inmobiliaria Eliana Osorio**, 
agencia de propiedad raíz con más de 10 años de 
experiencia en Cali, Valle del Cauca, Colombia.

Venta, alquiler y asesoría jurídica de inmuebles 
dentro y fuera de Colombia.

---

## Stack tecnológico

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase (base de datos + autenticación + storage)
- Lucide React (iconos)
- React Router

---

## Funcionalidades actuales

- Catálogo de propiedades en venta y alquiler
- Filtros por tipo, zona, barrio y precio
- Página de detalle con galería de fotos
- Modal de lightbox para fotos
- Panel de administración privado con login
- Subida de fotos a Supabase Storage
- Formulario de captación de inmuebles
- Módulo de citas con calendario
- Botón flotante WhatsApp y chatbot placeholder
- Footer responsivo con redes sociales
- Integración con WhatsApp directo

---

## En desarrollo

- Chatbot "Eli" con IA usando N8N
- Portal de pagos para arrendatarios
- CRM completo integrado
- Confirmaciones automáticas por WhatsApp

---

## Cómo contribuir

1. Haz fork de este repositorio
2. Crea tu rama: 
```bash
   git checkout -b feature/nombre-de-tu-mejora
```
3. Copia el archivo de ejemplo de variables:
```bash
   cp .env.example .env
```
4. Llena tus propias credenciales de Supabase en `.env`
5. Instala dependencias:
```bash
   npm install
```
6. Corre el proyecto:
```bash
   npm run dev
```
7. Haz commit de tus cambios y abre un Pull Request

---

## Variables de entorno necesarias

Crea un archivo `.env` en la raíz con estas variables:
```
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key_publica
```

Puedes obtener estas credenciales creando un 
proyecto gratuito en supabase.com

---

## Estructura de la base de datos

El proyecto usa dos tablas principales en Supabase:

**propiedades** — Catálogo de inmuebles con fotos,
características, precio y estado.

**captaciones** — Formularios de propietarios 
interesados en consignar su inmueble.

**citas_disponibles** — Slots de disponibilidad 
para visitas a inmuebles.

**citas_reservas** — Reservas de visitas 
realizadas por clientes.

Los scripts SQL para crear las tablas están en 
la carpeta `/supabase`.

---

## Áreas donde necesitamos ayuda

- Mejoras de UI/UX en móvil
- Optimización de rendimiento y carga de imágenes
- Accesibilidad (a11y)
- Tests automatizados
- Documentación de componentes
- Integración con portales como Metrocuadrado 
  y Finca Raíz

---

## Contacto

- Instagram: [@inmobiliaria_eo](https://instagram.com/inmobiliaria_eo)
- WhatsApp: +57 316 222 5604
- Web: [www.inmobiliariaeo.com](https://www.inmobiliariaeo.com)
- Cali, Valle del Cauca, Colombia

---

*Desarrollado con amor en Cali, Colombia*
```

Guarda el README con commit message: `docs: actualizar README con instrucciones de contribución`

---

## PASO 4 — Crear archivo .env.example

En GitHub haz clic en **"Add file" → "Create new file"**, nómbralo `.env.example` y pega esto:
```
# Copia este archivo como .env y llena tus valores
# Obtén estas credenciales en supabase.com

VITE_SUPABASE_URL=tu_url_de_supabase_aqui
VITE_SUPABASE_ANON_KEY=tu_anon_key_publica_aqui
