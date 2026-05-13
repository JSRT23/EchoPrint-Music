import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { songs } from "../api";
import { normalizeSong } from "../utils";
import SongCard from "../components/SongCard";

function isToday(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}
function isLast7Days(dateStr) {
  const d = new Date(dateStr);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  return d >= cutoff && !isToday(dateStr);
}
function isOlder(dateStr) {
  const d = new Date(dateStr);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  return d < cutoff;
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="w-1.5 h-5 rounded-full gradient-bg flex-shrink-0" />
      <h3 className="font-display font-bold text-base text-white/90">
        {children}
      </h3>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="glass-card rounded-2xl overflow-hidden animate-pulse"
        >
          <div className="aspect-square bg-white/5" />
          <div className="p-4 flex flex-col gap-2">
            <div className="h-3 bg-white/5 rounded w-3/4" />
            <div className="h-2.5 bg-white/5 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function GatedView({ onShowAuth }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center gap-5">
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center shadow-xl">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="w-9 h-9"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-bg border-2 border-surface2 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="w-3.5 h-3.5 text-muted"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
      </div>
      <div className="max-w-xs">
        <h2 className="font-display font-black text-xl text-white mb-2">
          Tu historial te espera
        </h2>
        <p className="text-muted text-sm leading-relaxed">
          Inicia sesión para guardar todas las canciones que identifiques y
          acceder a tu historial personal.
        </p>
      </div>
      <button
        onClick={onShowAuth}
        className="mt-1 px-8 py-3.5 rounded-xl gradient-bg text-white font-display font-bold text-sm glow-cyan hover:opacity-90 transition-all"
      >
        Iniciar sesión
      </button>
    </div>
  );
}

function methodProps(method) {
  return {
    methodLabel:
      method === "text"
        ? "Búsqueda"
        : method === "humming"
          ? "Tarareo"
          : "Audio",
    methodColor:
      method === "text"
        ? "text-cyan/80"
        : method === "humming"
          ? "text-violet/80"
          : "text-green-400/80",
  };
}

export default function HistoryPage({
  onPlay,
  playingId,
  onOpenDetail,
  onShowAuth,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleDelete(historyId) {
    try {
      await songs.deleteHistory(historyId);
      setItems((prev) => prev.filter((s) => s._historyId !== historyId));
    } catch {
      alert("No se pudo eliminar. Intenta de nuevo.");
    }
  }

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    songs
      .history()
      .then((data) => {
        setItems(
          data.slice(0, 50).map((h) => ({
            ...normalizeSong(h.song ?? h),
            _scannedAt:
              h.identified_at ??
              h.created_at ??
              h.scanned_at ??
              new Date().toISOString(),
            _historyId: h.id,
            _method: h.method,
          })),
        );
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <GatedView onShowAuth={onShowAuth} />;

  const todayItems = items.filter((s) => isToday(s._scannedAt));
  const weekItems = items.filter((s) => isLast7Days(s._scannedAt));
  const olderItems = items.filter((s) => isOlder(s._scannedAt));
  const hasAny =
    todayItems.length > 0 || weekItems.length > 0 || olderItems.length > 0;

  return (
    <section className="pt-8 pb-32">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="font-display font-black text-3xl text-white mb-1">
            Mi historial
          </h2>
          <p className="text-muted text-sm">
            {items.length > 0
              ? `${items.length} canción${items.length !== 1 ? "es" : ""} identificada${items.length !== 1 ? "s" : ""}`
              : "Tus canciones identificadas aparecerán aquí"}
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => navigate("/history/all")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-muted border border-white/10 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all"
          >
            Ver todo
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-4 h-4"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {loading && <SkeletonGrid />}

      {!loading && !hasAny && items.length === 0 && (
        <div className="flex flex-col items-center py-20 gap-4 text-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-14 h-14 text-muted/30"
          >
            <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
            <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
          </svg>
          <p className="text-white font-semibold">
            Aún no has escaneado ninguna canción
          </p>
          <p className="text-muted text-sm">
            Usa el botón de escaneo en Descubrir para empezar
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-2 px-6 py-2.5 rounded-xl gradient-bg text-white text-sm font-bold hover:opacity-90 transition-all"
          >
            Ir a Descubrir
          </button>
        </div>
      )}

      {!loading && hasAny && (
        <div className="flex flex-col gap-12">
          {todayItems.length > 0 && (
            <div>
              <SectionLabel>Hoy</SectionLabel>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {todayItems.map((song, i) => (
                  <SongCard
                    key={`today-${song._historyId ?? song.id}-${i}`}
                    song={song}
                    onPlay={onPlay}
                    isPlaying={playingId === (song.spotify_id ?? song.id)}
                    isAuthenticated
                    onOpenDetail={onOpenDetail}
                    {...methodProps(song._method)}
                    historyId={song._historyId}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {weekItems.length > 0 && (
            <div>
              <SectionLabel>Últimos 7 días</SectionLabel>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {weekItems.map((song, i) => (
                  <SongCard
                    key={`week-${song._historyId ?? song.id}-${i}`}
                    song={song}
                    onPlay={onPlay}
                    isPlaying={playingId === (song.spotify_id ?? song.id)}
                    isAuthenticated
                    onOpenDetail={onOpenDetail}
                    {...methodProps(song._method)}
                    historyId={song._historyId}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {olderItems.length > 0 && (
            <div>
              <SectionLabel>Anteriores</SectionLabel>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {olderItems.map((song, i) => (
                  <SongCard
                    key={`older-${song._historyId ?? song.id}-${i}`}
                    song={song}
                    onPlay={onPlay}
                    isPlaying={playingId === (song.spotify_id ?? song.id)}
                    isAuthenticated
                    onOpenDetail={onOpenDetail}
                    {...methodProps(song._method)}
                    historyId={song._historyId}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center pt-2">
            <button
              onClick={() => navigate("/history/all")}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl glass-card border border-white/10 hover:border-cyan/30 hover:bg-white/5 text-white font-display font-bold text-sm transition-all duration-200 group"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5 text-cyan"
              >
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ver todo mi historial
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4 text-muted group-hover:translate-x-1 transition-transform"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
