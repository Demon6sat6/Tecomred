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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-sky-500/20">
            <Wifi className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-3">Algo salió mal</h1>
          <p className="text-gray-400 mb-8 text-sm leading-relaxed">
            Ocurrió un error inesperado. Por favor recarga la página.<br />
            Si el problema persiste, contáctanos.
          </p>
          {this.state.message && (
            <p className="text-xs text-gray-600 font-mono mb-6 px-4 py-2 bg-white/5 rounded-lg">
              {this.state.message}
            </p>
          )}
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white font-semibold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-sky-500/20"
          >
            <RefreshCw className="w-4 h-4" /> Recargar página
          </button>
        </div>
      </div>
    );
  }
}
