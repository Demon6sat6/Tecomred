import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, MessageCircle } from 'lucide-react';

export interface LegalSection {
  id: string;
  title: string;
  content: ReactNode;
}

interface LegalPageProps {
  eyebrow: string;
  title: string;
  introduction: string;
  sections: LegalSection[];
  related: { to: string; label: string };
}

export default function LegalPage({ eyebrow, title, introduction, sections, related }: LegalPageProps) {
  return (
    <div className="bg-[#f6f9fd] text-[#11264b]">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-12 lg:px-8">
        <Link to="/" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#0052cc] transition hover:text-[#003b94] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0052cc]">
          <ArrowLeft size={17} aria-hidden="true" /> Volver a la tienda
        </Link>

        <header className="relative overflow-hidden rounded-[1.75rem] bg-[#082a5c] px-6 py-10 text-white shadow-xl shadow-blue-950/10 sm:px-10 sm:py-12 lg:px-14">
          <div className="absolute -right-12 -top-32 h-80 w-80 rounded-full border-[55px] border-white/5" aria-hidden="true" />
          <div className="absolute -bottom-24 right-28 h-52 w-52 rounded-full bg-[#48bb07]/15 blur-3xl" aria-hidden="true" />
          <div className="relative max-w-3xl">
            <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.18em] text-[#a9e67a]">{eyebrow}</p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">{introduction}</p>
          </div>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
          <nav aria-label={`Contenido de ${title}`} className="self-start rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24">
            <p className="px-3 pb-3 text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">En esta página</p>
            <ol className="space-y-1">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="flex gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-[#0052cc] focus-visible:outline-2 focus-visible:outline-[#0052cc]">
                    <span className="font-bold text-[#48a909]">{String(index + 1).padStart(2, '0')}</span>
                    <span>{section.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="min-w-0 space-y-4 sm:space-y-5">
            {sections.map((section, index) => (
              <section id={section.id} key={section.id} className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf6e3] text-sm font-extrabold text-[#348f00]" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <div className="min-w-0 flex-1">
                    <h2 className="pt-1 text-xl font-bold tracking-tight text-[#11264b]">{section.title}</h2>
                    <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600 sm:text-[15px] [&_a]:font-semibold [&_a]:text-[#0052cc] [&_a]:underline-offset-2 hover:[&_a]:underline [&_strong]:font-semibold [&_strong]:text-[#11264b] [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
                      {section.content}
                    </div>
                  </div>
                </div>
              </section>
            ))}

            <div className="rounded-2xl border border-blue-100 bg-[#edf5ff] p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-[#0052cc]"><MessageCircle size={18} aria-hidden="true" /><span className="text-xs font-extrabold uppercase tracking-[0.12em]">¿Tienes alguna consulta?</span></div>
                  <p className="text-sm leading-6 text-slate-600">Escríbenos para revisar tu caso o pedir más información.</p>
                </div>
                <Link to="/contacto" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0052cc] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#003f9f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0052cc]">Ir a contacto <ArrowUpRight size={17} aria-hidden="true" /></Link>
              </div>
            </div>

            <Link to={related.to} className="inline-flex items-center gap-2 px-1 py-2 text-sm font-semibold text-[#0052cc] hover:underline">{related.label} <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
