import { useState } from "react";
import SoundWave from "./SoundWave";
import { spotify } from "../api";

export default function ResultModal({
  song,
  score,
  onClose,
  onPlay,
  isPlaying,
  isAuthenticated,
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!song) return null;

  async function handleSave() {
    if (!song.spotify_id) return alert("Esta canción no tiene ID de Spotify.");
    setSaving(true);
    try {
      await spotify.saveTrack(song.spotify_id);
      setSaved(true);
    } catch {
      alert("No se pudo guardar. Asegúrate de tener Spotify conectado.");
    } finally {
      setSaving(false);
    }
  }

  /**
   * handlePlay — cuando hay un match_timestamp_seconds válido,
   * le pasamos ese segundo a onPlay para que el audio arranque
   * exactamente en el fragmento que fue reconocido.
   */
  function handlePlayClick() {
    const startAt =
      !isPlaying && song.match_timestamp_seconds != null
        ? song.match_timestamp_seconds
        : 0;
    onPlay(song, startAt);
  }

  const matchPct = score ? Math.round(score * 100) : null;

  // Si hay timestamp de coincidencia, lo mostramos como badge adicional
  const hasTimestamp =
    song.match_timestamp_seconds != null && song.match_timestamp_seconds > 0;
  const timestampLabel = hasTimestamp
    ? formatTimestamp(song.match_timestamp_seconds)
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-surface2 rounded-t-3xl sm:rounded-3xl overflow-hidden relative animate-slide-up"
        style={{
          border: `1px solid ${song.color}40`,
          boxShadow: `0 32px 80px rgba(0,0,0,0.7), 0 0 40px ${song.color}20`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/60 transition-all text-sm"
        >
          ✕
        </button>

        {/* Cover hero */}
        <div className="relative h-52 sm:h-60 overflow-hidden">
          <img
            src={song.cover}
            alt={song.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = `https://picsum.photos/seed/${song.id}/400/400`;
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, #1a1a2e 0%, transparent 55%)`,
            }}
          />

          {/* Badges superiores */}
          <div className="absolute top-4 left-4 flex gap-2">
            {matchPct && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
                <span className="text-xs font-semibold text-white">
                  {matchPct}% match
                </span>
              </div>
            )}

            {/* Timestamp badge — muestra el segundo de coincidencia */}
            {timestampLabel && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-3 h-3 text-violet"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="text-xs font-semibold text-white">
                  desde {timestampLabel}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-8 -mt-4 relative z-10">
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-2"
            style={{ color: song.color }}
          >
            🎵 Canción identificada
          </p>
          <h2 className="font-display font-black text-3xl text-white leading-tight mb-1">
            {song.title}
          </h2>
          <p className="text-muted text-base mb-0.5">{song.artist}</p>
          {song.album && (
            <p className="text-muted/60 text-sm mb-5">{song.album}</p>
          )}

          {/* Wave */}
          <div className="flex justify-center mb-6">
            <SoundWave active={isPlaying} color={song.color} bars={16} />
          </div>

          {/* ── Hint de reproducción desde fragmento ──────────────────── */}
          {!isPlaying && timestampLabel && song.preview_url && (
            <p className="text-center text-muted/60 text-xs mb-4">
              ▶ Reproducirá desde{" "}
              <span className="text-violet font-semibold">
                {timestampLabel}
              </span>{" "}
              — donde se identificó el fragmento
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {song.preview_url ? (
              <button
                onClick={handlePlayClick}
                className="flex-1 gradient-bg text-white font-display font-bold text-sm py-3.5 rounded-xl transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-95"
              >
                {isPlaying ? "⏸ Pausar" : "▶ Reproducir preview"}
              </button>
            ) : (
              <button
                disabled
                className="flex-1 bg-white/5 text-muted font-semibold text-sm py-3.5 rounded-xl cursor-not-allowed"
              >
                Sin preview disponible
              </button>
            )}

            {isAuthenticated && (
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm
                  border transition-all duration-200 hover:scale-[1.02] active:scale-95 whitespace-nowrap
                  ${
                    saved
                      ? "border-cyan/40 text-cyan bg-cyan/10"
                      : "border-white/10 text-white bg-white/5 hover:bg-white/10"
                  }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill={saved ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                </svg>
                {saved ? "Guardado" : saving ? "…" : "Guardar"}
              </button>
            )}

            {song.spotify_id && (
              <button
                onClick={() =>
                  window.open(
                    `https://open.spotify.com/track/${song.spotify_id}`,
                    "_blank",
                  )
                }
                className="w-12 h-12 rounded-xl flex items-center justify-center text-muted hover:text-[#1DB954] hover:bg-[#1DB954]/10 border border-white/10 hover:border-[#1DB954]/30 transition-all duration-200"
                title="Abrir en Spotify"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Formatea segundos como "m:ss" (ej: 75 → "1:15") */
function formatTimestamp(seconds) {
  if (seconds == null) return null;
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, "0")}`;
}
