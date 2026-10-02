import { useEffect, useState } from "react";
import {
  MapPinned,
  Navigation,
  Play,
  Square,
  RefreshCw,
  Copy,
  CheckCircle2,
} from "lucide-react";

interface PositionState {
  latitude: number;
  longitude: number;
  accuracy: number;
  updatedAt: string;
}

export default function AdminTracking() {
  const [tracking, setTracking] = useState(false);
  const [position, setPosition] = useState<PositionState | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(
    () => () => {
      if (watchId !== null) navigator.geolocation?.clearWatch(watchId);
    },
    [watchId],
  );

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Este dispositivo no permite obtener ubicación.");
      return;
    }
    setError("");
    setTracking(true);
    const updatePosition = ({ coords }: GeolocationPosition) =>
      setPosition({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        updatedAt: new Date().toLocaleString("es-PE"),
      });
    const id = navigator.geolocation.watchPosition(
      updatePosition,
      () => {
        setError(
          "No se pudo obtener la ubicación. Revisa los permisos del navegador.",
        );
        setTracking(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    setWatchId(null);
    setTracking(false);
  };
  const mapUrl = position
    ? `https://www.google.com/maps?q=${position.latitude},${position.longitude}`
    : "";
  const copyLocation = async () => {
    if (!mapUrl) return;
    await navigator.clipboard?.writeText(mapUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <MapPinned className="w-6 h-6 text-blue-600" /> Compartir ubicación
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Obtén y comparte la ubicación actual de este dispositivo.
        </p>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 sm:p-6">
          <h3 className="text-slate-900 font-bold mb-2">
            Ubicación actual
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed mb-5">
            El técnico debe abrir este apartado desde su celular y aceptar el
            permiso de ubicación. La posición se actualiza al solicitarla
            nuevamente.
          </p>
          <div className="flex flex-wrap gap-3">
            {!tracking ? (
              <button
                onClick={startTracking}
                className="min-h-[44px] px-4 py-2.5 rounded-xl gradient-brand text-white font-bold flex items-center gap-2"
              >
                <Play className="w-4 h-4" /> Iniciar ubicación
              </button>
            ) : (
              <button
                onClick={stopTracking}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold flex items-center gap-2"
              >
                <Square className="w-4 h-4" /> Detener
              </button>
            )}
            <button
              onClick={startTracking}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Actualizar
            </button>
          </div>
          {error && <p role="alert" className="mt-4 text-sm text-rose-600">{error}</p>}
          {position && (
            <div className="mt-5 space-y-2 text-sm">
              <p className="text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Ubicación disponible
              </p>
              <p className="text-slate-700">
                Latitud: {position.latitude.toFixed(6)} · Longitud:{" "}
                {position.longitude.toFixed(6)}
              </p>
              <p className="text-slate-500">
                Precisión aproximada: {Math.round(position.accuracy)} m ·{" "}
                {position.updatedAt}
              </p>
            </div>
          )}
        </section>
        <section className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 sm:p-6">
          <h3 className="text-slate-900 font-bold mb-2">Compartir ubicación</h3>
          <p className="text-slate-600 text-sm mb-5">
            Envía este enlace por WhatsApp al cliente o al equipo de trabajo.
          </p>
          {position ? (
            <>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl overflow-hidden border border-blue-100 bg-blue-50 p-5 text-center"
              >
                <Navigation className="w-10 h-10 mx-auto text-blue-600 mb-2" />
                <span className="text-slate-900 font-semibold">
                  Abrir en Google Maps
                </span>
              </a>
              <button
                onClick={copyLocation}
                className="mt-3 w-full min-h-[44px] rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />{" "}
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copiar enlace
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-500 text-sm">
              Inicia el seguimiento para generar un enlace.
            </div>
          )}
        </section>
      </div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
        El enlace comparte la última posición obtenida. Para actualizarla, el técnico debe generar y enviar un enlace nuevo desde su dispositivo.
      </div>
    </div>
  );
}
