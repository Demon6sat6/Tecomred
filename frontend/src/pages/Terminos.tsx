import { Link } from 'react-router-dom';
import LegalPage, { type LegalSection } from '../components/LegalPage';

const sections: LegalSection[] = [
  {
    id: 'alcance',
    title: 'Alcance de estas condiciones',
    content: <p>Estas condiciones explican cómo se usa la tienda en línea de SiscomRed y cómo se gestionan las solicitudes de pedido. Puedes navegar y consultar el catálogo sin crear una cuenta ni asumir una obligación de compra.</p>,
  },
  {
    id: 'catalogo',
    title: 'Catálogo, disponibilidad y precios',
    content: <><p>Mostramos productos, características y precios para ayudarte a preparar tu solicitud. La disponibilidad, el precio final, los descuentos aplicables y cualquier costo de entrega se confirman contigo antes de cerrar la compra.</p><p>Si algún dato del catálogo cambia o contiene un error, te informaremos durante esa coordinación para que decidas si deseas continuar.</p></>,
  },
  {
    id: 'pedidos',
    title: 'Cómo funciona un pedido',
    content: <><p>Al finalizar el formulario, registramos una solicitud con los productos y datos de contacto que proporcionaste. El sitio prepara un mensaje de WhatsApp con el detalle para coordinar la compra con la tienda.</p><p>Revisa el mensaje antes de enviarlo. Registrar una solicitud no confirma por sí solo la disponibilidad, la fecha de entrega ni un cobro.</p></>,
  },
  {
    id: 'pago-entrega',
    title: 'Pago y entrega',
    content: <p>El medio de pago, el importe definitivo, la forma de envío o recojo y la fecha estimada de entrega se acuerdan directamente durante la atención del pedido. El flujo actual del sitio no solicita datos de tarjeta ni procesa pagos en línea.</p>,
  },
  {
    id: 'cambios',
    title: 'Cambios, cancelaciones y devoluciones',
    content: <p>Si necesitas modificar o cancelar una solicitud, o consultar una devolución, <Link to="/contacto">contáctanos</Link> e indica el número del pedido si lo tienes. Revisaremos el estado de la operación y las condiciones aplicables. Tus derechos como consumidor se mantienen conforme a la normativa vigente.</p>,
  },
  {
    id: 'garantias',
    title: 'Garantías y atención posterior',
    content: <p>La cobertura y el procedimiento de garantía dependen del producto y de la información que se confirme al momento de la compra. Si aparece una falla o tienes una consulta posterior, comunícate con la tienda con los datos de tu pedido y el comprobante disponible.</p>,
  },
  {
    id: 'cuenta',
    title: 'Cuenta y uso del sitio',
    content: <p>Si creas una cuenta, utiliza datos correctos y cuida tus credenciales. No uses el sitio para suplantar a otras personas, interferir con su funcionamiento o enviar contenido ilícito mediante los formularios.</p>,
  },
  {
    id: 'contacto',
    title: 'Consultas y reclamos',
    content: <p>Para preguntas sobre una compra, estas condiciones o una incidencia, utiliza el <Link to="/contacto">formulario de contacto</Link>. Cuéntanos qué ocurrió y, si corresponde, incluye el número de pedido para poder ubicar tu solicitud.</p>,
  },
];

export default function Terminos() {
  return <LegalPage eyebrow="Siscomred · Información de compra" title="Términos y condiciones" introduction="Una explicación clara de cómo funciona el catálogo, cómo se registra tu solicitud y qué se coordina antes de completar una compra." sections={sections} related={{ to: '/privacidad', label: 'Leer la política de privacidad' }} />;
}
