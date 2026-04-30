import { useState, useEffect, useRef } from "react";
import SoundWave from "./SoundWave";

function fmt(s) {
  if (!s || isNaN(s)) return "0:00";
  const n = Math.floor(s);
  return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
}

export default function NowPlayingBar({
  song,
  onStop,
  onOpenDetail,
  previewEnded,
  audioRef,
  previewSeconds = 30,
}) {
  const [progress, setProgress] = useState({ current: 0, duration: 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    const tick = () => {
      const a = audioRef?.current;
      if (a && !a.paused)
        setProgress({ current: a.currentTime, duration: a.duration || 0 });
      rafRef.current = requestAnimationFrame(tick);
    };
    if (!previewEnded) rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [audioRef, previewEnded]);

  if (!song) return null;

  const pct = progress.duration
    ? Math.min(100, (progress.current / progress.duration) * 100)
    : 0;

  // ── Preview ended: rotating CTA button ──────────────────────────────────
  const [ctaIdx, setCtaIdx] = useState(0);

  useEffect(() => {
    if (!previewEnded) return;
    const iv = setInterval(() => setCtaIdx((i) => (i + 1) % 3), 5000);
    return () => clearInterval(iv);
  }, [previewEnded]);

  if (previewEnded) {
    const q = encodeURIComponent(`${song.title} ${song.artist}`);
    const services = [
      {
        label: "Escuchar en Spotify",
        url: song.spotify_id
          ? `https://open.spotify.com/track/${song.spotify_id}`
          : `https://open.spotify.com/search/${q}`,
        bg: "#1DB954",
        fg: "#000",
        shadow: "rgba(29,185,84,0.35)",
        icon: (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4 flex-shrink-0"
          >
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
        ),
      },
      {
        label: "Abrir en Apple Music",
        url: `https://music.apple.com/search?term=${q}`,
        bg: "linear-gradient(135deg,#fc3c44,#ff2d55)",
        fg: "#fff",
        shadow: "rgba(252,60,68,0.35)",
        icon: (
          <svg
            viewBox="0 0 814 1000"
            fill="currentColor"
            className="w-4 h-4 flex-shrink-0"
          >
            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105.5-57.8-155.5-127.4C46 790.7 0 683.1 0 581.2 0 356.9 152.3 236.3 302.9 236.3c72.6 0 132.6 47.8 178.1 47.8 43.3 0 111.1-50.7 191.7-50.7 28.6 0 104.8 2.6 168.1 68.1zm-208-191.7c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
          </svg>
        ),
      },
      {
        label: "Buscar en YouTube",
        url: `https://www.youtube.com/results?search_query=${q}`,
        bg: "#FF0000",
        fg: "#fff",
        shadow: "rgba(255,0,0,0.3)",
        icon: (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4 flex-shrink-0"
          >
            <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
          </svg>
        ),
      },
    ];
    const svc = services[ctaIdx];

    return (
      <div
        className="fixed bottom-0 left-0 right-0 z-40 animate-slide-up"
        style={{
          background: "rgba(17,17,32,0.97)",
          backdropFilter: "blur(24px)",
          borderTop: `1px solid ${song.color}40`,
          boxShadow: `0 -8px 32px rgba(0,0,0,0.6)`,
        }}
      >
        <div
          className="h-0.5 w-full"
          style={{ background: `${song.color}60` }}
        />
        <div className="flex items-center gap-3 px-4 sm:px-6 py-3">
          <img
            src={song.cover}
            alt=""
            className="w-11 h-11 rounded-xl object-cover opacity-50 flex-shrink-0"
            style={{ filter: "brightness(0.7)" }}
            onError={(e) => {
              e.target.src = `https://picsum.photos/seed/${song.id}/100/100`;
            }}
          />
          <div className="flex-1 min-w-0">
            <p
              className="text-white/80 text-xs font-semibold truncate"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
            >
              {song.title}
            </p>
            <p
              className="text-white/45 text-[11px]"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
            >
              Vista previa de {previewSeconds}s — escuchar completo en:
            </p>
          </div>

          {/* Rotating CTA button */}
          <a
            key={ctaIdx}
            href={svc.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm flex-shrink-0
              transition-all hover:scale-[1.04] active:scale-95 animate-fade-in"
            style={{
              background: svc.bg,
              color: svc.fg,
              boxShadow: `0 4px 16px ${svc.shadow}`,
              textDecoration: "none",
            }}
          >
            {svc.icon}
            <span className="hidden sm:inline">{svc.label}</span>
            <span className="sm:hidden">Escuchar</span>
          </a>

          {/* Dot indicators */}
          <div className="flex gap-1 flex-shrink-0">
            {services.map((_, i) => (
              <button
                key={i}
                onClick={() => setCtaIdx(i)}
                className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                style={{
                  background:
                    i === ctaIdx ? song.color : "rgba(255,255,255,0.2)",
                  transform: i === ctaIdx ? "scale(1.3)" : "scale(1)",
                }}
              />
            ))}
          </div>

          <button
            onClick={onStop}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-muted/50 hover:text-white hover:bg-white/5 transition-all flex-shrink-0"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  // ── Playing ───────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 animate-slide-up cursor-pointer"
      style={{
        background: "rgba(17,17,32,0.97)",
        backdropFilter: "blur(24px)",
        borderTop: `1px solid ${song.color}33`,
        boxShadow: `0 -8px 32px rgba(0,0,0,0.5)`,
      }}
      onClick={onOpenDetail}
    >
      {/* Thin progress bar at top of bar */}
      <div className="h-0.5 bg-white/5">
        <div
          className="h-full transition-all duration-100 gradient-bg"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3">
        <div className="relative flex-shrink-0">
          <img
            src={song.cover}
            alt={song.title}
            className="w-11 h-11 rounded-xl object-cover"
            style={{ border: `1.5px solid ${song.color}60` }}
            onError={(e) => {
              e.target.src = `https://picsum.photos/seed/${song.id}/100/100`;
            }}
          />
          <span
            className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-bg animate-pulse"
            style={{ background: song.color }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="font-display font-bold text-sm truncate"
            style={{ color: song.color }}
          >
            {song.title}
          </p>
          <p className="text-muted text-xs truncate">{song.artist}</p>
        </div>

        {/* Timer */}
        {progress.current > 0 && (
          <span className="text-muted/60 text-[11px] tabular-nums font-mono hidden sm:block">
            {fmt(progress.current)} /{" "}
            {fmt(Math.min(progress.duration, previewSeconds))}
          </span>
        )}

        <SoundWave active color={song.color} bars={8} />

        <button
          onClick={(e) => {
            e.stopPropagation();
            onStop();
          }}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-muted hover:text-white hover:bg-white/5 transition-all flex-shrink-0"
        >
          ⏹
        </button>
      </div>
    </div>
  );
}
