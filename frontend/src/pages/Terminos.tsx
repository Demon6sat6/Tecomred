import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Terminos() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <Link to="/" className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver al inicio
      </Link>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Términos y Condiciones</h1>
      <p className="text-gray-500 text-sm mb-10">Última actualización: mayo 2026</p>

      <div className="prose prose-invert max-w-none space-y-8 text-gray-300 text-sm leading-relaxed">

        <section className="glass rounded-2xl p-6 sm:p-8">
          <h2 className="text-white font-bold text-lg mb-4">1. Aceptación de los términos</h2>
          <p>Al acceder y utilizar el sitio web de TecomRed (<strong>tecomred.pe</strong>), usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no deberá utilizar nuestros servicios.</p>
        </section>

        <section className="glass rounded-2xl p-6 sm:p-8">
          <h2 className="text-white font-bold text-lg mb-4">2. Descripción del servicio</h2>
          <p>TecomRed es una tienda en línea especializada en la venta de equipos de redes, componentes de cómputo y tecnología profesional, con operaciones en el Perú. Nos reservamos el derecho de modificar o discontinuar el servicio en cualquier momento.</p>
        </section>

        <section className="glass rounded-2xl p-6 sm:p-8">
          <h2 className="text-white font-bold text-lg mb-4">3. Precios y pagos</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Todos los precios están expresados en Soles Peruanos (PEN) e incluyen IGV.</li>
            <li>Los precios pueden cambiar sin previo aviso hasta el momento de confirmar el pedido.</li>
            <li>Aceptamos pagos con tarjeta de crédito/débito, transferencia bancaria y efectivo contra entrega.</li>
            <li>El pago debe completarse antes del despacho del pedido.</li>
          </ul>
        </section>

        <section className="glass rounded-2xl p-6 sm:p-8">
          <h2 className="text-white font-bold text-lg mb-4">4. Envíos y entregas</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Realizamos envíos a todo el Perú mediante empresas de courier de confianza.</li>
            <li>El tiempo de entrega estimado es de 2 a 5 días hábiles para Lima y 3 a 7 días para provincias.</li>
            <li>Los pedidos superiores a S/ 300 tienen envío gratis a Lima Metropolitana.</li>
            <li>No somos responsables por retrasos ocasionados por la empresa de courier.</li>
          </ul>
        </section>

        <section className="glass rounded-2xl p-6 sm:p-8">
          <h2 className="text-white font-bold text-lg mb-4">5. Devoluciones y garantías</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Todos los productos cuentan con garantía del fabricante.</li>
            <li>Aceptamos devoluciones dentro de los 7 días calendario de recibido el producto, siempre que esté en su embalaje original y sin uso.</li>
            <li>Productos dañados por mal uso no aplican para devolución.</li>
            <li>Para iniciar una devolución, contáctanos a través del formulario de contacto.</li>
          </ul>
        </section>

        <section className="glass rounded-2xl p-6 sm:p-8">
          <h2 className="text-white font-bold text-lg mb-4">6. Limitación de responsabilidad</h2>
          <p>TecomRed no será responsable por daños indirectos, incidentales o consecuentes que resulten del uso o la imposibilidad de usar nuestros productos o servicios. Nuestra responsabilidad máxima se limita al valor del producto adquirido.</p>
        </section>

        <section className="glass rounded-2xl p-6 sm:p-8">
          <h2 className="text-white font-bold text-lg mb-4">7. Propiedad intelectual</h2>
          <p>Todo el contenido del sitio web, incluyendo textos, imágenes, logotipos y diseños, son propiedad de TecomRed y están protegidos por las leyes de propiedad intelectual del Perú. No está permitida su reproducción sin autorización expresa.</p>
        </section>

        <section className="glass rounded-2xl p-6 sm:p-8">
          <h2 className="text-white font-bold text-lg mb-4">8. Ley aplicable</h2>
          <p>Estos términos se rigen por las leyes de la República del Perú. Cualquier disputa será sometida a la jurisdicción de los tribunales de Lima, Perú.</p>
        </section>

        <section className="glass rounded-2xl p-6 sm:p-8">
          <h2 className="text-white font-bold text-lg mb-4">9. Contacto</h2>
          <p>Para consultas sobre estos términos, comuníquese con nosotros a través de nuestro <Link to="/contacto" className="text-sky-400 hover:text-sky-300 transition-colors">formulario de contacto</Link>.</p>
        </section>
      </div>
    </div>
  );
}
