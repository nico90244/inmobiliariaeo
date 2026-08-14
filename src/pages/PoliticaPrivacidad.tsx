import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";

const PoliticaPrivacidad = () => {
  return (
    <>
      <SEO
        title="Política de Tratamiento de Datos Personales | Inmobiliaria Eliana Osorio"
        description="Política de tratamiento de datos personales de Inmobiliaria Eliana Osorio, conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013 de Colombia."
        path="/politica-privacidad"
      />
      <Header />
      <main className="pt-20">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
            <div className="w-8 h-0.5 bg-primary mb-6" aria-hidden="true" />
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Política de Tratamiento de Datos Personales
            </h1>
            <p className="font-body text-sm text-muted-foreground mb-10">
              Última actualización: agosto de 2026 · Conforme a la Ley 1581 de 2012, el Decreto 1377 de 2013 y demás normas que las reglamenten o modifiquen.
            </p>

            <div className="font-body text-foreground/90 space-y-8 leading-relaxed [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5">
              <div>
                <h2>1. Responsable del tratamiento</h2>
                <p>
                  <strong>Inmobiliaria Eliana Osorio</strong>, con domicilio en Cali, Valle del Cauca, Colombia,
                  es la responsable del tratamiento de los datos personales que usted nos suministra a través de
                  este sitio web y de nuestros canales de contacto.
                </p>
                <p className="mt-2">
                  Contacto: <a href="mailto:info@inmobiliariaeo.com" className="text-primary hover:underline">info@inmobiliariaeo.com</a>{" "}
                  · WhatsApp <a href="https://wa.me/573162225604" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">316 222 5604</a>{" "}
                  · Teléfono <a href="tel:+573186531598" className="text-primary hover:underline">318 653 1598</a>
                </p>
              </div>

              <div>
                <h2>2. Datos que recolectamos</h2>
                <p>Según el formulario o gestión que usted realice, podemos recolectar:</p>
                <ul>
                  <li>Datos de contacto: nombre, celular, correo electrónico.</li>
                  <li>Datos del inmueble que desea consignar, comprar o arrendar (barrio, tipo, valor, características).</li>
                  <li>
                    Para contratos de arrendamiento y pólizas: documento de identidad, información laboral/financiera
                    y datos de la cuenta bancaria del propietario, necesarios para gestionar el contrato y los pagos.
                  </li>
                  <li>
                    Para la iniciativa de emergencia habitacional: datos de contacto de personas que buscan o
                    publican vivienda temporal.
                  </li>
                  <li>Datos de navegación mediante herramientas de analítica y píxeles de publicidad (ver sección 6).</li>
                </ul>
              </div>

              <div>
                <h2>3. Finalidad del tratamiento</h2>
                <ul>
                  <li>Gestionar solicitudes de compra, venta, arriendo o consignación de inmuebles.</li>
                  <li>Agendar y confirmar citas y visitas a propiedades.</li>
                  <li>Elaborar y administrar contratos de arrendamiento, pólizas y pagos asociados.</li>
                  <li>Contactarlo por WhatsApp, teléfono o correo para dar respuesta a su solicitud.</li>
                  <li>Conectar oferta y demanda de vivienda temporal en el marco de la iniciativa de emergencia.</li>
                  <li>Enviar información comercial propia, cuando usted lo autorice.</li>
                  <li>Medir el desempeño de nuestras campañas publicitarias, de forma agregada y anónima cuando sea posible.</li>
                </ul>
              </div>

              <div>
                <h2>4. Sus derechos como titular (Habeas Data)</h2>
                <p>De acuerdo con la ley colombiana, usted tiene derecho a:</p>
                <ul>
                  <li>Conocer, actualizar y rectificar sus datos personales.</li>
                  <li>Solicitar prueba de la autorización otorgada para el tratamiento de sus datos.</li>
                  <li>Ser informado sobre el uso que se le ha dado a sus datos.</li>
                  <li>Presentar quejas ante la Superintendencia de Industria y Comercio por infracciones a la ley.</li>
                  <li>Revocar la autorización y/o solicitar la supresión de sus datos, cuando no exista un deber legal o contractual que impida su eliminación.</li>
                  <li>Acceder de forma gratuita a sus datos personales que hayan sido objeto de tratamiento.</li>
                </ul>
              </div>

              <div>
                <h2>5. Cómo ejercer sus derechos</h2>
                <p>
                  Puede enviar sus solicitudes, consultas o reclamos a{" "}
                  <a href="mailto:info@inmobiliariaeo.com" className="text-primary hover:underline">info@inmobiliariaeo.com</a>{" "}
                  o por WhatsApp al 316 222 5604, indicando su nombre completo, el dato sobre el que solicita
                  actualización, rectificación o supresión, y una descripción de los hechos.
                </p>
                <p className="mt-2">
                  Las consultas se atenderán en un término máximo de diez (10) días hábiles y los reclamos en un
                  término máximo de quince (15) días hábiles, contados a partir de la fecha de recibo, prorrogable
                  por ocho (8) días hábiles adicionales cuando sea necesario, informándole al titular los motivos de la demora.
                </p>
              </div>

              <div>
                <h2>6. Cookies y herramientas de analítica</h2>
                <p>
                  Este sitio utiliza herramientas de terceros para medir tráfico y el desempeño de campañas
                  publicitarias: Meta Pixel (Facebook/Instagram), TikTok Pixel y Ahrefs Analytics. Estas
                  herramientas pueden registrar información de navegación mediante cookies o identificadores
                  técnicos. Usted puede gestionar o bloquear estas cookies desde la configuración de su navegador.
                </p>
              </div>

              <div>
                <h2>7. Seguridad de la información</h2>
                <p>
                  Adoptamos medidas técnicas, humanas y administrativas razonables para proteger sus datos
                  personales contra acceso no autorizado, pérdida, alteración o uso indebido, incluyendo control
                  de acceso restringido a nuestro sistema de administración y cifrado de las comunicaciones.
                </p>
              </div>

              <div>
                <h2>8. Vigencia</h2>
                <p>
                  Esta política rige a partir de su fecha de publicación. Los datos personales se conservarán
                  durante el tiempo necesario para cumplir las finalidades descritas y las obligaciones legales
                  aplicables (comerciales, contables y contractuales).
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
};

export default PoliticaPrivacidad;
