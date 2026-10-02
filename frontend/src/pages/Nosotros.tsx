import { ArrowRight, BadgeCheck, Headset, Network, ShieldCheck, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { usePageTitle } from '../hooks/usePageTitle';

const equipoBase = [
  { name: 'Carlos Mendoza', role: 'Gerente General', image: 'https://i.pravatar.cc/150?img=11' },
  { name: 'Lucía Torres', role: 'Jefa de Ventas', image: 'https://i.pravatar.cc/150?img=47' },
  { name: 'Miguel Ríos', role: 'Soporte Técnico', image: 'https://i.pravatar.cc/150?img=15' },
  { name: 'Ana Paredes', role: 'Atención al Cliente', image: 'https://i.pravatar.cc/150?img=45' },
];

export default function Nosotros() {
  usePageTitle('Nosotros', 'Conoce al equipo y la misión de SiscomRed, especialistas en sistemas, redes y telecomunicaciones.');
  const { settings } = useAdmin();
  const equipo = settings.aboutTeam !== undefined ? settings.aboutTeam : equipoBase;

  return (
    <main className="overflow-hidden bg-white text-[#11264b]">
      <section className="relative border-b border-[#e4ebf4] bg-[linear-gradient(135deg,#f6faff_0%,#fff_55%,#f4faef_100%)] px-4 py-14 sm:py-20 lg:py-24">
        <div className="pointer-events-none absolute -right-36 -top-44 h-[520px] w-[520px] rounded-full border border-[#0052cc]/[0.07]" />
        <div className="pointer-events-none absolute -right-16 -top-28 h-[410px] w-[410px] rounded-full border border-[#0052cc]/[0.08]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,.93fr)] lg:gap-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#cfe2ff] bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#0052cc] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#48bb07]" /> Conoce SiscomRed
            </span>
            <h1 className="mt-6 max-w-[650px] text-[clamp(2.35rem,5vw,4.5rem)] font-black leading-[1.07] tracking-[-.045em]">
              Tecnología que conecta <span className="text-[#0052cc]">tus proyectos.</span>
            </h1>
            <p className="mt-6 max-w-[590px] text-base leading-8 text-[#52647e] sm:text-lg">
              Somos especialistas en sistemas, redes y equipos de cómputo. Te ayudamos a elegir la solución adecuada con asesoría cercana y productos para cada proyecto.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/productos" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0052cc] px-6 font-semibold text-white shadow-[0_12px_24px_-14px_#0052cc] transition-colors hover:bg-[#003f9e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0052cc]">
                Explorar catálogo <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link to="/contacto" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#ccd9e9] bg-white px-6 font-semibold text-[#11264b] transition-colors hover:bg-[#f4f8fc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0052cc]">
                Hablar con nosotros
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-[#dce6f2] pt-6 text-sm font-semibold text-[#435773]">
              <span className="inline-flex items-center gap-2"><BadgeCheck size={18} className="text-[#38a50c]" aria-hidden="true" /> Equipos para cada necesidad</span>
              <span className="inline-flex items-center gap-2"><Headset size={18} className="text-[#0052cc]" aria-hidden="true" /> Asesoría personalizada</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[520px] lg:max-w-none" aria-label="Equipos de redes y tecnología">
            <div className="absolute -right-5 -top-5 h-28 w-28 rounded-[30px] bg-[#48bb07]/10 blur-2xl" />
            <div className="grid grid-cols-[1fr_.8fr] items-end gap-3 sm:gap-5">
              <div className="relative overflow-hidden rounded-[28px] border border-[#d8e5f3] bg-white p-4 shadow-[0_28px_60px_-30px_rgba(17,38,75,.32)] sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#0052cc]">Conectividad</span><Network size={19} className="text-[#48bb07]" aria-hidden="true" /></div>
                <img src="/productos_tienda_tecnologia_20/13_router_wifi.png" alt="Router inalámbrico" className="aspect-square w-full rounded-2xl object-cover" />
                <p className="mt-5 text-sm font-bold sm:text-base">Redes para avanzar</p>
                <p className="mt-1 text-xs text-[#64758e] sm:text-sm">Soluciones para hogares y empresas</p>
              </div>
              <div className="space-y-3 sm:space-y-5">
                <div className="rounded-[24px] bg-[#0052cc] p-4 text-white shadow-[0_22px_45px_-25px_#0052cc] sm:p-6">
                  <ShieldCheck size={28} strokeWidth={1.7} aria-hidden="true" />
                  <p className="mt-5 text-lg font-bold leading-tight sm:text-xl">Tecnología con respaldo</p>
                  <p className="mt-2 text-xs leading-5 text-white/75 sm:text-sm">Te acompañamos desde la elección.</p>
                </div>
                <div className="overflow-hidden rounded-[24px] border border-[#d8e5f3] bg-white p-3 shadow-[0_20px_40px_-28px_rgba(17,38,75,.3)] sm:p-4">
                  <img src="/productos_tienda_tecnologia_20/14_switch_red.png" alt="Switch de red" className="aspect-[1.1] w-full rounded-xl object-cover" />
                  <p className="mt-3 text-xs font-bold sm:text-sm">Equipos para conectar más</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:py-20" aria-labelledby="about-purpose">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#318d08]">Lo que nos mueve</p>
            <h2 id="about-purpose" className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Una mejor experiencia en tecnología</h2>
            <p className="mt-4 leading-7 text-[#52647e]">Combinamos un catálogo especializado con orientación clara para que cada compra responda a una necesidad real.</p>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-2">
            <article className="rounded-[24px] border border-[#dce6f2] bg-[#f8fbff] p-6 sm:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e5f0ff] text-[#0052cc]"><Target size={23} aria-hidden="true" /></div>
              <h3 className="mt-6 text-xl font-bold">Nuestra misión</h3>
              <p className="mt-3 leading-7 text-[#52647e]">{settings.aboutMission || 'Brindar soluciones tecnológicas de red confiables y accesibles para empresas y hogares del Perú.'}</p>
            </article>
            <article className="rounded-[24px] border border-[#dce6f2] bg-[#f8fbff] p-6 sm:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eaf7e5] text-[#318d08]"><Network size={23} aria-hidden="true" /></div>
              <h3 className="mt-6 text-xl font-bold">Nuestra visión</h3>
              <p className="mt-3 leading-7 text-[#52647e]">{settings.aboutVision || 'Ser la tienda líder en equipos de redes y tecnología en la región, reconocida por calidad y servicio.'}</p>
            </article>
          </div>
        </div>
      </section>

      {equipo.length > 0 && <section className="border-t border-[#e4ebf4] bg-[#f6f9fd] px-4 py-16 sm:py-20" aria-labelledby="about-team">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#318d08]">Personas detrás de SiscomRed</p><h2 id="about-team" className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Nuestro equipo</h2></div>
            <p className="max-w-sm text-sm leading-6 text-[#52647e]">Personas listas para orientarte en tus compras y proyectos de tecnología.</p>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {equipo.map(({ name, role, image }, index) => <article key={`${name}-${index}`} className="flex items-center gap-4 rounded-2xl border border-[#dce6f2] bg-white p-4 shadow-[0_12px_32px_-26px_rgba(17,38,75,.4)] lg:block lg:p-5">
              {image ? <img src={image} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-xl object-cover lg:h-20 lg:w-20" /> : <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#e5f0ff] text-2xl font-bold text-[#0052cc]" aria-hidden="true">{name.charAt(0)}</span>}
              <div className="min-w-0 lg:mt-5"><h3 className="truncate font-bold">{name}</h3><p className="mt-1 text-sm text-[#52647e]">{role}</p></div>
            </article>)}
          </div>
        </div>
      </section>}

      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-[28px] bg-[#11264b] p-7 text-white sm:p-10 lg:flex-row lg:items-center">
          <div><p className="text-xs font-bold uppercase tracking-[0.17em] text-[#8de05d]">Estamos para ayudarte</p><h2 className="mt-3 max-w-xl text-2xl font-extrabold leading-tight sm:text-3xl">Encuentra la tecnología que tu proyecto necesita.</h2></div>
          <Link to="/contacto" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 font-semibold text-[#11264b] transition-colors hover:bg-[#eaf2fd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Solicitar asesoría <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
      </section>
    </main>
  );
}
