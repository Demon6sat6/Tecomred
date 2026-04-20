export interface Review {
  id: number;
  productId: number;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified: boolean;
}

export const reviews: Review[] = [
  // Switches
  { id: 1,  productId: 1, author: 'Carlos M.',   avatar: 'CM', rating: 5, date: '12 Mar 2026', title: 'Excelente switch para empresa',       body: 'Lo instalamos en nuestra oficina de 50 personas. El rendimiento es impecable, sin caídas en 3 meses. La configuración PoE+ nos ahorró comprar inyectores adicionales.', verified: true },
  { id: 2,  productId: 1, author: 'Ana R.',       avatar: 'AR', rating: 5, date: '28 Feb 2026', title: 'Calidad Cisco garantizada',            body: 'Llevo años trabajando con Cisco y este modelo no decepciona. El stacking funciona perfecto y el IOS es estable. Muy recomendado para redes medianas.', verified: true },
  { id: 3,  productId: 1, author: 'Luis P.',      avatar: 'LP', rating: 4, date: '15 Ene 2026', title: 'Buen producto, envío rápido',          body: 'Llegó en 2 días en perfectas condiciones. La configuración inicial es sencilla si tienes experiencia con Cisco. Le quito una estrella porque el manual está solo en inglés.', verified: false },
  // Routers
  { id: 4,  productId: 2, author: 'Roberto S.',   avatar: 'RS', rating: 5, date: '5 Abr 2026',  title: 'MikroTik de alto rendimiento',        body: 'Increíble relación precio/rendimiento. Maneja sin problemas 200 usuarios simultáneos con QoS configurado. RouterOS es muy potente una vez que aprendes a usarlo.', verified: true },
  { id: 5,  productId: 2, author: 'María G.',     avatar: 'MG', rating: 4, date: '20 Mar 2026', title: 'Muy bueno para ISPs pequeños',        body: 'Lo uso como router principal de mi pequeño ISP. Estable, rápido y con muchas funciones. El puerto SFP+ es un plus enorme para conectar fibra directamente.', verified: true },
  // Cables
  { id: 6,  productId: 3, author: 'Pedro L.',     avatar: 'PL', rating: 5, date: '8 Abr 2026',  title: 'Cable de excelente calidad',          body: 'Hice una instalación de 200 metros y el rendimiento es perfecto. Alcanza fácilmente los 1Gbps sin problemas. El conductor 23AWG marca la diferencia.', verified: true },
  { id: 7,  productId: 3, author: 'Sofia T.',     avatar: 'ST', rating: 5, date: '1 Mar 2026',  title: 'Ideal para instalaciones',            body: 'Compré 3 bobinas para un proyecto de red estructurada. La calidad es consistente en toda la bobina, sin defectos. Muy recomendado.', verified: false },
  // Procesadores
  { id: 8,  productId: 4, author: 'Diego F.',     avatar: 'DF', rating: 5, date: '10 Abr 2026', title: 'Bestia para workstation',             body: 'Lo instalé en mi workstation de edición de video. Renderiza proyectos 4K en la mitad del tiempo que mi anterior i9-12900K. Vale cada centavo.', verified: true },
  { id: 9,  productId: 4, author: 'Valeria C.',   avatar: 'VC', rating: 5, date: '22 Mar 2026', title: 'Perfecto para servidor de desarrollo', body: 'Montamos un servidor de CI/CD con este procesador. Los 24 hilos permiten compilar múltiples proyectos en paralelo sin degradación. Excelente compra.', verified: true },
  { id: 10, productId: 4, author: 'Andrés M.',    avatar: 'AM', rating: 4, date: '5 Feb 2026',  title: 'Gran rendimiento, consume bastante',  body: 'El rendimiento es top, pero el consumo de 125W es real. Necesitas un buen sistema de refrigeración. Con un cooler de 240mm AIO va perfecto.', verified: true },
  // RAM
  { id: 11, productId: 5, author: 'Camila R.',    avatar: 'CR', rating: 5, date: '14 Abr 2026', title: 'DDR5 que vale la pena',               body: 'La diferencia con DDR4 es notable en aplicaciones que usan mucha memoria. Los 5600MHz con XMP activado funcionan a la primera. Sin problemas de compatibilidad.', verified: true },
  { id: 12, productId: 5, author: 'Javier N.',    avatar: 'JN', rating: 4, date: '30 Mar 2026', title: 'Buena memoria, precio justo',         body: 'Funciona perfectamente con mi plataforma Intel 13ª gen. El XMP 3.0 se activa sin problemas desde la BIOS. Temperaturas estables bajo carga.', verified: false },
  // SSD
  { id: 13, productId: 6, author: 'Elena V.',     avatar: 'EV', rating: 5, date: '16 Abr 2026', title: 'El mejor SSD que he tenido',          body: 'Windows arranca en 8 segundos. Las velocidades de lectura/escritura son exactamente las especificadas. Llevo 6 meses sin un solo problema.', verified: true },
  { id: 14, productId: 6, author: 'Marco A.',     avatar: 'MA', rating: 5, date: '2 Abr 2026',  title: 'Velocidad impresionante',             body: 'Transferencia de archivos grandes a 3.4GB/s real. Perfecto para edición de video y bases de datos. La garantía de Samsung da mucha tranquilidad.', verified: true },
  { id: 15, productId: 6, author: 'Isabel F.',    avatar: 'IF', rating: 5, date: '18 Mar 2026', title: 'Recomendado 100%',                    body: 'Actualicé mi laptop con este SSD y parece otra máquina. La diferencia con el HDD anterior es abismal. Instalación sencilla y reconocido al instante.', verified: false },
  // Tarjeta de red
  { id: 16, productId: 7, author: 'Tomás B.',     avatar: 'TB', rating: 5, date: '9 Abr 2026',  title: 'Perfecta para servidor NAS',          body: 'La instalé en mi servidor NAS para transferencias 10GbE. Velocidades reales de 9.8Gbps en transferencias locales. Compatible con TrueNAS sin drivers adicionales.', verified: true },
  // Access Point
  { id: 17, productId: 8, author: 'Patricia L.',  avatar: 'PL', rating: 5, date: '11 Abr 2026', title: 'WiFi 6 que marca la diferencia',      body: 'Cubre perfectamente 3 pisos de oficina. Con 80 dispositivos conectados simultáneamente no hay degradación. La integración con UniFi Controller es impecable.', verified: true },
  { id: 18, productId: 8, author: 'Fernando G.',  avatar: 'FG', rating: 5, date: '25 Mar 2026', title: 'El mejor AP que he probado',          body: 'Reemplazamos 3 APs viejos con este y la cobertura mejoró enormemente. La latencia bajó de 15ms a 3ms en promedio. Muy recomendado para entornos empresariales.', verified: true },
  // Switch TP-Link
  { id: 19, productId: 9, author: 'Natalia S.',   avatar: 'NS', rating: 5, date: '7 Abr 2026',  title: 'Perfecto para oficina pequeña',       body: 'Lo uso para separar VLANs en mi oficina de 8 personas. La gestión web es intuitiva y el QoS funciona bien para priorizar VoIP. Excelente precio.', verified: true },
  // Herramientas
  { id: 20, productId: 10, author: 'Ricardo M.',  avatar: 'RM', rating: 4, date: '3 Abr 2026',  title: 'Kit completo y de buena calidad',     body: 'La ponchadora hace conexiones perfectas a la primera. El tester detecta correctamente cables cruzados y directos. Le falta un pelacables de fibra pero para cobre es completo.', verified: true },
  // Router Ubiquiti
  { id: 21, productId: 11, author: 'Gabriela T.', avatar: 'GT', rating: 5, date: '6 Abr 2026',  title: 'Pequeño pero muy potente',            body: 'Lo uso como router principal en casa con fibra de 500Mbps. Maneja el tráfico sin problemas y el PoE pasivo me permite alimentar una cámara IP. EdgeOS es muy completo.', verified: true },
  // SSD Kingston
  { id: 22, productId: 12, author: 'Héctor V.',   avatar: 'HV', rating: 5, date: '4 Abr 2026',  title: 'Ideal para actualizar laptops viejas', body: 'Actualicé una laptop de 2015 con este SSD y quedó como nueva. El sistema operativo arranca en 15 segundos. Instalación plug & play, sin complicaciones.', verified: true },
  { id: 23, productId: 12, author: 'Lucía P.',    avatar: 'LP', rating: 4, date: '19 Mar 2026', title: 'Buena relación calidad-precio',       body: 'Para el precio que tiene, el rendimiento es muy bueno. No es el más rápido del mercado pero para uso diario es más que suficiente. Lo recomiendo para presupuestos ajustados.', verified: false },
];
