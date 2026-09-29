import { Component, type ReactNode } from 'react';
import { Wifi, RefreshCw } from 'lucide-react';

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(err: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', err, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/20">
            <Wifi className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-3">Algo salió mal</h1>
          <p className="text-slate-600 mb-6 text-sm leading-relaxed">
            Ocurrió un error inesperado. Por favor recarga la página.<br />
            Si el problema persiste, ponte en contacto con nosotros.
          </p>
          {this.state.message && (
            <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 font-mono mb-6 px-4 py-2.5 rounded-xl text-left overflow-x-auto">
              {this.state.message}
            </p>
          )}
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:from-violet-700 hover:to-indigo-700 active:scale-95 transition-all shadow-md shadow-violet-500/20"
          >
            <RefreshCw className="w-4 h-4" /> Recargar página
          </button>
        </div>
      </div>
    );
  }
}
