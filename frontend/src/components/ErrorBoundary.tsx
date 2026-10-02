import { Component, type ReactNode } from 'react';
import { ArrowRight, House, RefreshCw, TriangleAlert } from 'lucide-react';

interface Props { children: ReactNode }
interface State { hasError: boolean; isLoadError: boolean }

const isModuleLoadError = (error: Error) =>
  /dynamically imported module|importing a module script failed|chunkloaderror|loading chunk|failed to fetch module/i.test(error.message);

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, isLoadError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, isLoadError: isModuleLoadError(error) };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f8fc] px-4 py-10 text-[#11264b]">
        <div className="pointer-events-none absolute -left-28 top-0 h-80 w-80 rounded-full bg-[#0052cc]/[0.07] blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#48bb07]/[0.08] blur-3xl" />
        <section className="relative w-full max-w-[520px] overflow-hidden rounded-[28px] border border-[#dce5f1] bg-white shadow-[0_22px_70px_-35px_rgba(17,38,75,0.35)]" aria-labelledby="error-title">
          <div className="h-1.5 bg-gradient-to-r from-[#0052cc] via-[#0052cc] to-[#48bb07]" />
          <div className="px-6 pb-8 pt-7 sm:px-10 sm:pb-10 sm:pt-9">
            <a href="/" className="inline-flex items-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0052cc]" aria-label="Ir al inicio de SiscomRed">
              <img src="/logo.png" alt="SiscomRed" className="h-12 w-auto max-w-[160px] object-contain object-left" />
            </a>
            <div className="mt-9 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#cfe2ff] bg-[#edf5ff] text-[#0052cc]">
              <TriangleAlert size={27} strokeWidth={1.8} aria-hidden="true" />
            </div>
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-[#308700]">Necesitamos volver a intentarlo</p>
            <h1 id="error-title" className="mt-2 text-[clamp(1.65rem,5vw,2.15rem)] font-extrabold leading-tight tracking-tight">No pudimos mostrar esta página</h1>
            <p className="mt-4 max-w-[420px] text-[15px] leading-7 text-[#50627c]">
              {this.state.isLoadError ? 'La página no terminó de cargar. Esto suele resolverse al actualizarla.' : 'Ocurrió un problema inesperado. Intenta cargar la página otra vez.'}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => window.location.reload()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0052cc] px-5 font-semibold text-white transition-colors hover:bg-[#003f9e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0052cc]">
                <RefreshCw size={17} aria-hidden="true" /> Reintentar
              </button>
              <a href="/" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#dce5f1] bg-white px-5 font-semibold text-[#11264b] transition-colors hover:bg-[#f5f8fc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0052cc]">
                <House size={17} aria-hidden="true" /> Ir al inicio <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
            <p className="mt-8 border-t border-[#e8eef6] pt-5 text-sm leading-6 text-[#667790]">Si vuelve a ocurrir, escríbenos e indícanos qué página intentabas abrir.</p>
          </div>
        </section>
      </main>
    );
  }
}
