import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Privacidad() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <Link to="/" className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver al inicio
      </Link>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">Política de Privacidad</h1>
      <p className="text-slate-500 text-sm mb-10">Última actualización: mayo 2026 — Cumple con la Ley N° 29733 (Perú)</p>

      <div className="space-y-8 text-slate-700 text-sm leading-relaxed">

        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-slate-900 font-bold text-lg mb-4">1. Responsable del tratamiento</h2>
          <p>El responsable del banco de datos personales es <strong className="text-slate-900">SiscomRed</strong>, con domicilio en Lima, Perú. Para consultas de privacidad puede contactarnos a través de nuestro <Link to="/contacto" className="text-violet-600 hover:text-violet-700 font-medium">formulario de contacto</Link>.</p>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-slate-900 font-bold text-lg mb-4">2. Datos que recopilamos</h2>
          <ul className="list-disc list-inside space-y-2">
            <li><strong className="text-slate-900">Datos de cuenta y pedido:</strong> nombre, correo electrónico, teléfono, dirección de envío.</li>
            <li><strong className="text-slate-900">Datos de contacto:</strong> nombre, correo, asunto y mensaje cuando usa el formulario de contacto.</li>
            <li><strong className="text-slate-900">Newsletter:</strong> dirección de correo electrónico si se suscribe voluntariamente.</li>
            <li><strong className="text-slate-900">Datos técnicos:</strong> dirección IP, tipo de navegador y páginas visitadas (para analytics internos).</li>
          </ul>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-slate-900 font-bold text-lg mb-4">3. Finalidad del tratamiento</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Procesar y gestionar sus pedidos de compra.</li>
            <li>Comunicarnos con usted sobre el estado de su pedido.</li>
            <li>Responder consultas enviadas a través del formulario de contacto.</li>
            <li>Enviar comunicaciones comerciales si usted se suscribió al newsletter.</li>
            <li>Mejorar nuestros servicios mediante el análisis de uso del sitio.</li>
          </ul>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-slate-900 font-bold text-lg mb-4">4. Base legal</h2>
          <p>El tratamiento de sus datos personales se realiza bajo las siguientes bases legales:</p>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li>Consentimiento explícito del titular al registrarse o suscribirse.</li>
            <li>Ejecución de un contrato de compraventa.</li>
            <li>Interés legítimo para la mejora del servicio.</li>
          </ul>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-slate-900 font-bold text-lg mb-4">5. Compartición de datos</h2>
          <p>No vendemos ni alquilamos sus datos personales a terceros. Podemos compartir información únicamente con:</p>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li>Empresas de courier para el despacho de pedidos.</li>
            <li>Procesadores de pago para completar transacciones.</li>
            <li>Autoridades competentes si así lo requiere la ley peruana.</li>
          </ul>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-slate-900 font-bold text-lg mb-4">6. Almacenamiento y seguridad</h2>
          <p>Sus datos son almacenados en servidores seguros con acceso restringido. Implementamos medidas técnicas y organizativas para proteger su información contra acceso no autorizado, pérdida o alteración.</p>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-slate-900 font-bold text-lg mb-4">7. Cookies</h2>
          <p>Utilizamos almacenamiento local del navegador (<em>localStorage</em>) para mantener su carrito de compras y preferencias. No utilizamos cookies de rastreo de terceros sin su consentimiento.</p>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-slate-900 font-bold text-lg mb-4">8. Sus derechos (ARCO)</h2>
          <p>De acuerdo con la Ley N° 29733, usted tiene derecho a:</p>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li><strong className="text-slate-900">Acceso:</strong> conocer qué datos tenemos sobre usted.</li>
            <li><strong className="text-slate-900">Rectificación:</strong> corregir datos inexactos.</li>
            <li><strong className="text-slate-900">Cancelación:</strong> solicitar la eliminación de sus datos.</li>
            <li><strong className="text-slate-900">Oposición:</strong> oponerse a ciertos tratamientos.</li>
          </ul>
          <p className="mt-3">Para ejercer estos derechos, contáctenos a través del <Link to="/contacto" className="text-violet-600 hover:text-violet-700 font-medium">formulario de contacto</Link>.</p>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-slate-900 font-bold text-lg mb-4">9. Modificaciones</h2>
          <p>Nos reservamos el derecho de actualizar esta política. Cualquier cambio significativo será notificado en el sitio web. El uso continuado del servicio implica la aceptación de la política vigente.</p>
        </section>
      </div>
    </div>
  );
}
