import { Link } from 'react-router-dom';
import LegalPage, { type LegalSection } from '../components/LegalPage';

const sections: LegalSection[] = [
  {
    id: 'responsable',
    title: 'Quién atiende tus datos',
    content: <p>SiscomRed gestiona la información que compartes al usar esta tienda. Para consultas sobre privacidad o solicitudes relacionadas con tus datos, escríbenos mediante el <Link to="/contacto">formulario de contacto</Link>.</p>,
  },
  {
    id: 'datos',
    title: 'Qué información recibimos',
    content: <ul><li><strong>Cuenta:</strong> nombre, correo y, si lo proporcionas, teléfono. La contraseña se guarda como un hash, no en texto visible.</li><li><strong>Solicitudes de pedido:</strong> productos, nombre, correo, teléfono y dirección indicada para la entrega.</li><li><strong>Consultas y suscripción:</strong> los datos enviados en el formulario de contacto y el correo que registras para recibir novedades.</li><li><strong>Uso del sitio:</strong> páginas visitadas, identificador de sesión, tipo de dispositivo y referencia de procedencia. Los formularios de contacto y suscripción también registran la dirección IP.</li></ul>,
  },
  {
    id: 'uso',
    title: 'Para qué usamos esos datos',
    content: <ul><li>Crear y mantener tu cuenta cuando decides registrarte.</li><li>Registrar solicitudes, coordinar disponibilidad, precio y entrega, y atender consultas posteriores.</li><li>Responder los mensajes enviados por el formulario de contacto.</li><li>Gestionar la suscripción a novedades que solicitas mediante el formulario correspondiente.</li><li>Conocer el uso de la tienda y detectar problemas de funcionamiento.</li></ul>,
  },
  {
    id: 'terceros',
    title: 'Cuándo intervienen otros servicios',
    content: <><p>Al solicitar un pedido, el sitio prepara un mensaje con tus datos y el detalle de compra. Si decides enviarlo por WhatsApp, esa información se compartirá a través de ese servicio.</p><p>La tienda utiliza servicios técnicos para alojar y operar el sitio. También puede cargar Google Analytics cuando se configura su identificador en el panel. Cada servicio externo trata la información bajo sus propias condiciones.</p></>,
  },
  {
    id: 'navegador',
    title: 'Datos guardados en tu navegador',
    content: <p>El sitio utiliza almacenamiento del navegador para conservar el carrito, las preferencias, datos de sesión y métricas locales de navegación. Puedes borrar esos datos desde la configuración de tu navegador; al hacerlo, algunas funciones pueden dejar de recordar tu estado anterior.</p>,
  },
  {
    id: 'seguridad',
    title: 'Seguridad y conservación',
    content: <p>Las contraseñas de cuenta se almacenan mediante hash. Conservamos información necesaria para operar las cuentas, atender solicitudes y gestionar pedidos. Si deseas consultar qué información mantenemos o solicitar su eliminación cuando corresponda, utiliza el canal de contacto indicado abajo.</p>,
  },
  {
    id: 'derechos',
    title: 'Tus consultas y derechos',
    content: <p>Puedes solicitar acceso, corrección, cancelación u oposición respecto de tus datos personales, según la <a href="https://www.gob.pe/institucion/anpd/normas-legales/6554453-n-016-2024-jus" target="_blank" rel="noopener noreferrer">normativa peruana de protección de datos</a>. Para iniciar una solicitud, <Link to="/contacto">contáctanos</Link> e indícanos el correo asociado a tu cuenta o pedido para poder ubicar el registro.</p>,
  },
];

export default function Privacidad() {
  return <LegalPage eyebrow="Siscomred · Tu información" title="Política de privacidad" introduction="Te contamos qué información utiliza la tienda, para qué sirve y cómo puedes consultarla o pedir una corrección." sections={sections} related={{ to: '/terminos', label: 'Leer los términos y condiciones' }} />;
}
