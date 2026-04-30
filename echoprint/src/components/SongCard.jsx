import { useState } from "react";
import Swal from "sweetalert2";
import SoundWave from "./SoundWave";
import { spotify } from "../api";

export default function SongCard({
  song,
  onPlay,
  isPlaying,
  isAuthenticated,
  onOpenDetail,
  // Historial: etiqueta de método + borrar
  methodLabel,
  methodColor,
  onDelete,
  historyId,
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave(e) {
    e.stopPropagation();
    if (!song.spotify_id || saving || saved) return;
    setSaving(true);
    try {
      await spotify.saveTrack(song.spotify_id);
      setSaved(true);
    } catch {
      Swal.fire({
        html: `
          <div style="text-align:center;padding:8px 0">
            <div style="font-size:2rem;margin-bottom:12px">🔗</div>
            <h3 style="color:#fff;font-size:1rem;font-weight:700;margin:0 0 8px">No se pudo guardar</h3>
            <p style="color:#8b8ba7;font-size:0.85rem;margin:0">
              Conecta tu cuenta de Spotify en tu <strong style="color:#fff">Perfil</strong>
              para guardar canciones directamente.
            </p>
          </div>`,
        background: "#16162a",
        showConfirmButton: true,
        confirmButtonText: "Ir al Perfil",
        confirmButtonColor: "#06B6D4",
        showCancelButton: true,
        cancelButtonText: "Cerrar",
        width: "300px",
        padding: "1.25rem",
        customClass: { popup: "swal-echoprint-popup" },
      }).then((r) => {
        if (r.isConfirmed) window.location.href = "/profile";
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(e) {
    e.stopPropagation();
    if (!historyId || deleting) return;
    setDeleting(true);
    await onDelete?.(historyId);
    setDeleting(false);
  }

  return (
    <article
      className="glass-card rounded-2xl overflow-hidden transition-all duration-300 ease-out
        hover:-translate-y-1.5 hover:shadow-2xl group cursor-pointer"
      style={{
        "--accent": song.color,
        boxShadow: isPlaying ? `0 0 0 1.5px ${song.color}` : undefined,
      }}
      onClick={() => onOpenDetail?.(song)}
    >
      {/* ── Cover ──────────────────────────────────────────────────────── */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={song.cover}
          alt={`${song.title} cover`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = `https://picsum.photos/seed/${song.id ?? song.title}/400/400`;
          }}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(song);
            }}
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
            className="w-14 h-14 rounded-full flex items-center justify-center text-black shadow-xl transition-transform hover:scale-110 active:scale-95"
            style={{ background: song.color }}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
          </button>
        </div>

        {/* Playing indicator */}
        {isPlaying && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <SoundWave active color={song.color} />
          </div>
        )}

        {/* Genre badge top-left */}
        {song.genre && (
          <div
            className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-black/60 backdrop-blur-sm"
            style={{ color: song.color }}
          >
            {song.genre}
          </div>
        )}

        {/* Delete button (top-right) — solo en historial */}
        {historyId && onDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Eliminar del historial"
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm
              flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/20
              opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            {deleting ? (
              <svg
                className="w-3 h-3 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeOpacity="0.25"
                />
                <path
                  d="M22 12a10 10 0 01-10 10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-3.5 h-3.5"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* ── Info ───────────────────────────────────────────────────────── */}
      <div className="p-4">
        <h3 className="font-display font-bold text-sm text-white truncate mb-0.5">
          {song.title}
        </h3>
        <p className="text-muted text-xs mb-0.5 truncate">{song.artist}</p>
        {song.album && (
          <p
            className={`text-muted/60 text-[11px] truncate ${methodLabel ? "" : "mb-3"}`}
          >
            {song.album}
          </p>
        )}
        {/* Etiqueta de método — solo en historial */}
        {methodLabel && (
          <p
            className={`text-[11px] font-semibold mt-1.5 mb-2 ${methodColor ?? "text-cyan/80"}`}
          >
            {methodLabel}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="text-muted text-[11px] tabular-nums">
            {song.duration}
          </span>
          <div className="flex gap-1">
            {isAuthenticated && song.spotify_id && (
              <button
                onClick={handleSave}
                disabled={saving}
                title={saved ? "Guardado en Spotify" : "Guardar en Spotify"}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                  ${saved ? "text-cyan bg-cyan/10" : "text-muted hover:text-white hover:bg-white/5"}`}
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
              </button>
            )}
            {song.spotify_id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(
                    `https://open.spotify.com/track/${song.spotify_id}`,
                    "_blank",
                  );
                }}
                title="Ver en Spotify"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-[#1DB954] hover:bg-[#1DB954]/10 transition-all duration-200"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
