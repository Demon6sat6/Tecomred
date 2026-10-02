import { Link } from 'react-router-dom';
import { ArrowRight, House, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="relative flex min-h-[75vh] items-center justify-center overflow-hidden bg-[#f5f8fc] px-4 py-12 text-[#11264b]">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#0052cc]/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[#48bb07]/[0.08] blur-3xl" />
      <section className="relative w-full max-w-[620px] overflow-hidden rounded-[28px] border border-[#dce5f1] bg-white shadow-[0_22px_70px_-35px_rgba(17,38,75,0.35)]" aria-labelledby="not-found-title">
        <div className="h-1.5 bg-gradient-to-r from-[#0052cc] via-[#0052cc] to-[#48bb07]" />
        <div className="px-6 pb-9 pt-8 sm:px-11 sm:pb-11 sm:pt-10">
          <div className="flex items-center justify-between gap-4">
            <img src="/logo.png" alt="SiscomRed" className="h-11 w-auto max-w-[150px] object-contain object-left" />
            <span className="rounded-full border border-[#cfe2ff] bg-[#edf5ff] px-3 py-1 text-xs font-bold tracking-wider text-[#0052cc]">ERROR 404</span>
          </div>
          <div className="mt-9 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#cfe2ff] bg-[#edf5ff] text-[#0052cc]">
            <SearchX size={27} strokeWidth={1.8} aria-hidden="true" />
          </div>
          <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-[#308700]">Parece que tomamos otro camino</p>
          <h1 id="not-found-title" className="mt-2 text-[clamp(1.8rem,5vw,2.4rem)] font-extrabold leading-tight tracking-tight">Esta página no existe</h1>
          <p className="mt-4 max-w-[460px] text-[15px] leading-7 text-[#50627c]">Revisa la dirección o continúa explorando SiscomRed. Podemos ayudarte a encontrar lo que buscas.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0052cc] px-5 font-semibold text-white transition-colors hover:bg-[#003f9e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0052cc]">
              <House size={17} aria-hidden="true" /> Ir al inicio
            </Link>
            <Link to="/productos" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#dce5f1] bg-white px-5 font-semibold text-[#11264b] transition-colors hover:bg-[#f5f8fc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0052cc]">
              Ver productos <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
