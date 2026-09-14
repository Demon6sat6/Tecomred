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
        <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
          <MapPinned className="w-6 h-6 text-sky-400" /> Seguimiento de trabajos
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Comparte la ubicación del técnico mientras realiza un servicio.
        </p>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <section className="glass rounded-2xl p-5 sm:p-6">
          <h3 className="text-white font-bold mb-2">
            Ubicación en tiempo real
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-5">
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
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-red-500/15 border-red-500/30 text-red-300 font-bold flex items-center gap-2"
              >
                <Square className="w-4 h-4" /> Detener
              </button>
            )}
            <button
              onClick={startTracking}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white/5 border-white/10 text-gray-300 font-semibold flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Actualizar
            </button>
          </div>
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          {position && (
            <div className="mt-5 space-y-2 text-sm">
              <p className="text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Ubicación disponible
              </p>
              <p className="text-gray-300">
                Latitud: {position.latitude.toFixed(6)} · Longitud:{" "}
                {position.longitude.toFixed(6)}
              </p>
              <p className="text-gray-500">
                Precisión aproximada: {Math.round(position.accuracy)} m ·{" "}
                {position.updatedAt}
              </p>
            </div>
          )}
        </section>
        <section className="glass rounded-2xl p-5 sm:p-6">
          <h3 className="text-white font-bold mb-2">Compartir ubicación</h3>
          <p className="text-gray-400 text-sm mb-5">
            Envía este enlace por WhatsApp al cliente o al equipo de trabajo.
          </p>
          {position ? (
            <>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl overflow-hidden border-white/10 bg-sky-500/10 p-5 text-center"
              >
                <Navigation className="w-10 h-10 mx-auto text-sky-400 mb-2" />
                <span className="text-white font-semibold">
                  Abrir en Google Maps
                </span>
              </a>
              <button
                onClick={copyLocation}
                className="mt-3 w-full min-h-[44px] rounded-xl bg-white/5 border-white/10 text-gray-300 font-semibold flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />{" "}
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
            <div className="rounded-xl border-dashed border-white/10 p-8 text-center text-gray-500 text-sm">
              Inicia el seguimiento para generar un enlace.
            </div>
          )}
        </section>
      </div>
      <div className="glass rounded-2xl p-5 text-sm text-amber-200/80">
        Nota: el seguimiento continuo entre dispositivos requiere una base de
        datos o servicio en tiempo real y debe contar con consentimiento del
        técnico y del cliente. Esta primera versión obtiene y comparte la última
        ubicación desde el navegador.
      </div>
    </div>
  );
}
