import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import SoundWave from "./SoundWave";
import { spotify } from "../api";
import { serviceUrls } from "../App.jsx";

// ── Apple Music icon (real apple logo) ───────────────────────────────────────
function AppleIcon({ size = 16 }) {
  return (
    <svg
      viewBox="0 0 814 1000"
      fill="currentColor"
      style={{ width: size, height: size }}
    >
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105.5-57.8-155.5-127.4C46 790.7 0 683.1 0 581.2C0 356.9 152.3 236.3 302.9 236.3c72.6 0 132.6 47.8 178.1 47.8 43.3 0 111.1-50.7 191.7-50.7 28.6 0 104.8 2.6 168.1 68.1zm-208-191.7c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
    </svg>
  );
}

function MusicNoteIcon({ size = 16 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{ width: size, height: size }}
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

// ── Service buttons ───────────────────────────────────────────────────────────
function ServiceButtons({ song, size = "sm" }) {
  const urls = serviceUrls(song);
  const cls =
    size === "sm"
      ? "w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-200"
      : "flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm border transition-all duration-200";
  return (
    <div className={`flex ${size === "lg" ? "flex-col w-full" : ""} gap-2`}>
      <a
        href={urls.spotify}
        target="_blank"
        rel="noreferrer"
        className={`${cls} border-white/10 text-muted hover:text-[#1DB954] hover:bg-[#1DB954]/10 hover:border-[#1DB954]/30`}
        title="Spotify"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{
            width: size === "sm" ? 16 : 18,
            height: size === "sm" ? 16 : 18,
          }}
        >
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
        {size === "lg" && <span>Abrir en Spotify</span>}
      </a>
      <a
        href={urls.appleMusic}
        target="_blank"
        rel="noreferrer"
        className={`${cls} border-white/10 text-muted hover:text-[#fc3c44] hover:bg-[#fc3c44]/10 hover:border-[#fc3c44]/30`}
        title="Apple Music"
      >
        <AppleIcon size={size === "sm" ? 15 : 17} />
        {size === "lg" && <span>Abrir en Apple Music</span>}
      </a>
      <a
        href={urls.youtube}
        target="_blank"
        rel="noreferrer"
        className={`${cls} border-white/10 text-muted hover:text-[#FF0000] hover:bg-[#FF0000]/10 hover:border-[#FF0000]/30`}
        title="YouTube"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{
            width: size === "sm" ? 16 : 18,
            height: size === "sm" ? 16 : 18,
          }}
        >
          <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
        </svg>
        {size === "lg" && <span>Buscar en YouTube</span>}
      </a>
    </div>
  );
}

// ── Plain lyrics ──────────────────────────────────────────────────────────────
function PlainLyrics({ text, color }) {
  const stanzas = text.split(/\n\s*\n/).filter(Boolean);
  return (
    <div className="pb-8">
      <div className="flex items-center gap-3 mb-5 px-1">
        <div className="flex gap-0.5 items-end">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1 rounded-full"
              style={{
                height: 8 + i * 4,
                background: color,
                opacity: 0.3 + i * 0.25,
              }}
            />
          ))}
        </div>
        <p className="text-muted/50 text-xs tracking-widest uppercase">Letra</p>
      </div>
      <div className="flex flex-col gap-6">
        {stanzas.map((stanza, si) => {
          const lines = stanza.split("\n").filter((l) => l.trim());
          return (
            <div key={si} className="relative pl-4">
              <div
                className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full"
                style={{ background: color, opacity: 0.2 }}
              />
              <div className="flex flex-col gap-1.5">
                {lines.map((line, li) => (
                  <p
                    key={li}
                    className="text-sm leading-relaxed"
                    style={{
                      color:
                        li === 0
                          ? "rgba(255,255,255,0.9)"
                          : "rgba(255,255,255,0.58)",
                      fontWeight: li === 0 ? 500 : 400,
                    }}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Progress hook — reads audio.currentTime via RAF ───────────────────────────
function useAudioProgress(audioRef, isPlaying) {
  const [progress, setProgress] = useState({ current: 0, duration: 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    const update = () => {
      const a = audioRef?.current;
      if (a) setProgress({ current: a.currentTime, duration: a.duration || 0 });
      rafRef.current = requestAnimationFrame(update);
    };
    if (isPlaying) {
      rafRef.current = requestAnimationFrame(update);
    } else {
      cancelAnimationFrame(rafRef.current);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, audioRef]);

  return progress;
}

function fmt(s) {
  if (!s || isNaN(s)) return "0:00";
  const n = Math.floor(s);
  return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SongDetailModal({
  song,
  onClose,
  onPlay,
  isPlaying,
  isAuthenticated,
  score = null,
  previewEnded = false,
  previewSeconds = 30,
  audioRef,
}) {
  const [lyricsData, setLyricsData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [liking, setLiking] = useState(false);
  const [liked, setLiked] = useState(false);
  const prevId = useRef(null);
  const { current, duration } = useAudioProgress(audioRef, isPlaying);
  const pct = duration ? Math.min(100, (current / duration) * 100) : 0;

  useEffect(() => {
    const id = song?.spotify_id ?? song?.id;
    if (id === prevId.current) return;
    prevId.current = id;
    setLyricsData(null);
    setSaved(false);
    setLiked(false);
  }, [song]);

  useEffect(() => {
    if (!song || lyricsData !== null) return;
    setLyricsData("loading");
    fetchLyrics(song.artist, song.title).then((d) =>
      setLyricsData(d ?? "error"),
    );
  }, [song, lyricsData]);

  async function handleLike() {
    if (!song.spotify_id) return;
    if (!isAuthenticated) {
      Swal.fire({
        html: `<div style="text-align:center;padding:8px 0">
          <div style="font-size:2rem;margin-bottom:10px">❤️</div>
          <h3 style="color:#fff;font-size:1rem;font-weight:700;margin:0 0 8px">Inicia sesión primero</h3>
          <p style="color:#8b8ba7;font-size:0.85rem;margin:0">Necesitas una cuenta para guardar canciones.</p>
        </div>`,
        background: "#16162a",
        confirmButtonText: "Iniciar sesión",
        confirmButtonColor: "#1DB954",
        width: "300px",
        padding: "1.25rem",
        customClass: { popup: "swal-echoprint-popup" },
      }).then((r) => {
        if (r.isConfirmed) window.location.href = "/auth";
      });
      return;
    }

    setLiking(true);
    try {
      await spotify.likeTrack(song.spotify_id);

      setLiked(true);
      Swal.fire({
        html: `<div style="text-align:center;padding:8px 0">
          <div style="font-size:2.5rem;margin-bottom:8px">❤️</div>
          <h3 style="color:#fff;font-size:1rem;font-weight:700;margin:0 0 6px">¡Me gusta!</h3>
          <p style="color:#8b8ba7;font-size:0.85rem;margin:0">"${song.title}" añadida a tus favoritos de Spotify.</p>
        </div>`,
        background: "#16162a",
        confirmButtonColor: "#1DB954",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        width: "280px",
        padding: "1.25rem",
        customClass: { popup: "swal-echoprint-popup" },
      });
    } catch (err) {
      const code = err?.code;
      if (code === "not_connected") {
        try {
          const url = await spotify.getAuthUrl();
          window.location.href = url;
        } catch {
          window.location.href = "/profile";
        }
        return;
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err?.error ??
          "No se pudo guardar en Me gusta. Intenta reconectar tu cuenta de Spotify.",
        background: "#16162a",
        color: "#fff",
        confirmButtonColor: "#06B6D4",
        width: "300px",
        customClass: { popup: "swal-echoprint-popup" },
      });
    } finally {
      setLiking(false);
    }
  }

  async function handleSave() {
    if (!song.spotify_id) return;
    if (!isAuthenticated) {
      Swal.fire({
        html: `<div style="text-align:center;padding:8px 0">
          <div style="width:48px;height:48px;border-radius:14px;background:rgba(29,185,84,0.12);
               border:1px solid rgba(29,185,84,0.25);display:flex;align-items:center;
               justify-content:center;margin:0 auto 14px">
            <svg viewBox="0 0 24 24" fill="#1DB954" style="width:24px;height:24px">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02z"/>
            </svg>
          </div>
          <h3 style="color:#fff;font-size:1rem;font-weight:700;margin:0 0 8px">Inicia sesión primero</h3>
          <p style="color:#8b8ba7;font-size:0.85rem;margin:0">Necesitas una cuenta para guardar canciones.</p>
        </div>`,
        background: "#16162a",
        confirmButtonText: "Iniciar sesión",
        confirmButtonColor: "#06B6D4",
        showCancelButton: true,
        cancelButtonText: "Cerrar",
        width: "300px",
        padding: "1.25rem",
        customClass: { popup: "swal-echoprint-popup" },
      });
      return;
    }

    setSaving(true);
    let playlists = [];
    try {
      playlists = await spotify.getPlaylists();
    } catch (err) {
      // Not connected to Spotify
      setSaving(false);
      Swal.fire({
        html: `<div style="text-align:center;padding:8px 0">
          <div style="width:48px;height:48px;border-radius:14px;background:rgba(29,185,84,0.12);
               border:1px solid rgba(29,185,84,0.25);display:flex;align-items:center;
               justify-content:center;margin:0 auto 14px">
            <svg viewBox="0 0 24 24" fill="#1DB954" style="width:24px;height:24px">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </div>
          <h3 style="color:#fff;font-size:1rem;font-weight:700;margin:0 0 8px">Conecta Spotify</h3>
          <p style="color:#8b8ba7;font-size:0.85rem;margin:0">Conecta tu cuenta de Spotify para guardar canciones en tus playlists.</p>
        </div>`,
        background: "#16162a",
        confirmButtonText: "Conectar Spotify",
        confirmButtonColor: "#1DB954",
        showCancelButton: true,
        cancelButtonText: "Cerrar",
        width: "300px",
        padding: "1.25rem",
        customClass: { popup: "swal-echoprint-popup" },
      }).then(async (r) => {
        if (!r.isConfirmed) return;
        try {
          const url = await spotify.getAuthUrl();
          window.location.href = url;
        } catch {
          window.location.href = "/profile";
        }
      });
      return;
    }
    setSaving(false);

    // Build playlist options HTML
    const echoItem = `
      <div data-playlist-id="__echoprint__"
        style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;
               cursor:pointer;border:2px solid rgba(29,185,84,0.4);background:rgba(29,185,84,0.08);
               margin-bottom:8px;transition:all .15s"
        onmouseover="this.style.background='rgba(29,185,84,0.18)'"
        onmouseout="this.style.background='rgba(29,185,84,0.08)'"
        onclick="window._echoPick('__echoprint__')">
        <div style="width:36px;height:36px;border-radius:8px;background:rgba(29,185,84,0.2);
                    display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <svg viewBox="0 0 24 24" fill="#1DB954" style="width:18px;height:18px">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </div>
        <div style="flex:1;min-width:0">
          <p style="color:#1DB954;font-weight:700;font-size:13px;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
            Echoprint – Mis Canciones
          </p>
          <p style="color:#6b6b8a;font-size:11px;margin:0">Playlist automática de Echoprint</p>
        </div>
      </div>`;

    const playlistItems = playlists
      .map((pl) => {
        const img = pl.image
          ? `<img src="${pl.image}" style="width:36px;height:36px;border-radius:8px;object-fit:cover;flex-shrink:0"/>`
          : `<div style="width:36px;height:36px;border-radius:8px;background:#2a2a3e;flex-shrink:0;display:flex;align-items:center;justify-content:center">
             <svg viewBox="0 0 24 24" fill="none" stroke="#6b6b8a" stroke-width="2" style="width:16px;height:16px"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
           </div>`;
        return `
        <div data-playlist-id="${pl.id}"
          style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;
                 cursor:pointer;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);
                 margin-bottom:6px;transition:all .15s"
          onmouseover="this.style.background='rgba(255,255,255,0.07)';this.style.borderColor='rgba(255,255,255,0.15)'"
          onmouseout="this.style.background='rgba(255,255,255,0.03)';this.style.borderColor='rgba(255,255,255,0.08)'"
          onclick="window._echoPick('${pl.id}')">
          ${img}
          <div style="flex:1;min-width:0">
            <p style="color:#fff;font-weight:600;font-size:13px;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${pl.name}</p>
            <p style="color:#6b6b8a;font-size:11px;margin:0">${pl.tracks_total} canciones</p>
          </div>
        </div>`;
      })
      .join("");

    const { isConfirmed, isDismissed } = await new Promise((resolve) => {
      window._echoPick = (id) => {
        window._echoPickedId = id;
        Swal.clickConfirm();
      };
      Swal.fire({
        html: `
          <div style="text-align:left">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;padding:0 2px">
              <img src="${song.cover}" style="width:42px;height:42px;border-radius:10px;object-fit:cover"/>
              <div style="min-width:0">
                <p style="color:#fff;font-weight:700;font-size:14px;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${song.title}</p>
                <p style="color:#8b8ba7;font-size:12px;margin:0">${song.artist}</p>
              </div>
            </div>
            <p style="color:#6b6b8a;font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin:0 0 10px;padding:0 2px">
              Guardar en playlist
            </p>
            <div style="max-height:280px;overflow-y:auto;padding-right:2px">
              ${echoItem}
              ${playlistItems}
            </div>
          </div>`,
        background: "#16162a",
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        width: "340px",
        padding: "1.25rem",
        customClass: { popup: "swal-echoprint-popup" },
      }).then(resolve);
    });

    const chosenId = window._echoPickedId;
    delete window._echoPick;
    delete window._echoPickedId;

    if (!isConfirmed || !chosenId) return;

    setSaving(true);
    try {
      const playlistIdToUse = chosenId === "__echoprint__" ? null : chosenId;
      const result = await spotify.saveTrack(song.spotify_id, playlistIdToUse);
      setSaved(true);

      const isLikedSongs = result?.saved_as === "liked_songs";
      const playlistName =
        chosenId === "__echoprint__"
          ? "Echoprint – Mis Canciones"
          : (playlists.find((p) => p.id === chosenId)?.name ?? "tu playlist");

      if (isLikedSongs) {
        Swal.fire({
          html: `<div style="text-align:center;padding:8px 0">
            <div style="font-size:2rem;margin-bottom:10px">❤️</div>
            <h3 style="color:#fff;font-size:1rem;font-weight:700;margin:0 0 8px">¡Guardada en Me gusta!</h3>
            <p style="color:#8b8ba7;font-size:0.82rem;margin:0;line-height:1.5">
              "${song.title}" fue añadida a tus canciones favoritas de Spotify.<br/>
              <span style="color:#6b6b8a;font-size:0.78rem">La app está en modo desarrollo — para guardar en playlists solicita
              <a href="https://developer.spotify.com/dashboard" target="_blank" style="color:#1DB954">Extended Quota</a> en el dashboard.</span>
            </p>
          </div>`,
          background: "#16162a",
          confirmButtonText: "OK",
          confirmButtonColor: "#1DB954",
          width: "320px",
          padding: "1.25rem",
          customClass: { popup: "swal-echoprint-popup" },
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "¡Guardada!",
          text: `"${song.title}" añadida a ${playlistName}.`,
          background: "#16162a",
          color: "#fff",
          confirmButtonColor: "#1DB954",
          timer: 2500,
          timerProgressBar: true,
          customClass: { popup: "swal-echoprint-popup" },
        });
      }
    } catch (err) {
      const code = err?.code;
      const isScope = code === "insufficient_scope";
      const isDisconnected = code === "not_connected";
      Swal.fire({
        html: `<div style="text-align:center;padding:8px 0">
          <div style="width:48px;height:48px;border-radius:14px;background:rgba(29,185,84,0.12);
               border:1px solid rgba(29,185,84,0.25);display:flex;align-items:center;
               justify-content:center;margin:0 auto 14px">
            <svg viewBox="0 0 24 24" fill="#1DB954" style="width:24px;height:24px">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </div>
          <h3 style="color:#fff;font-size:1rem;font-weight:700;margin:0 0 8px">
            ${isScope || isDisconnected ? "Reconecta Spotify" : "No se pudo guardar"}
          </h3>
          <p style="color:#8b8ba7;font-size:0.85rem;margin:0">
            ${
              isScope
                ? "Tu sesión de Spotify no tiene permisos para editar playlists. Desconecta y vuelve a conectar tu cuenta."
                : isDisconnected
                  ? "Tu sesión de Spotify expiró. Vuelve a conectar tu cuenta."
                  : "Ocurrió un error al guardar. Intenta de nuevo."
            }
          </p>
        </div>`,
        background: "#16162a",
        confirmButtonText:
          isScope || isDisconnected ? "Ir al Perfil" : "Cerrar",
        confirmButtonColor: isScope || isDisconnected ? "#1DB954" : "#06B6D4",
        showCancelButton: isScope || isDisconnected,
        cancelButtonText: "Cerrar",
        width: "300px",
        padding: "1.25rem",
        customClass: { popup: "swal-echoprint-popup" },
      }).then((r) => {
        if (r.isConfirmed && (isScope || isDisconnected)) {
          window.location.href = "/profile";
        }
      });
    } finally {
      setSaving(false);
    }
  }

  if (!song) return null;
  const matchPct = score ? Math.round(score * 100) : null;
  const isFromScan = score !== null;
  const plain = lyricsData?.plain ?? null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in"
      style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(18px)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-surface2 rounded-t-3xl sm:rounded-3xl overflow-hidden relative animate-slide-up flex flex-col"
        style={{
          border: `1px solid ${song.color}30`,
          boxShadow: `0 32px 80px rgba(0,0,0,0.8), 0 0 60px ${song.color}15`,
          maxHeight: "92vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover */}
        <div className="relative h-44 sm:h-52 flex-shrink-0 overflow-hidden">
          <img
            src={song.cover}
            alt={song.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = `https://picsum.photos/seed/${song.id}/600/300`;
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, #1a1a2e 0%, transparent 60%)",
            }}
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white/70 hover:text-white transition-all text-sm"
          >
            ✕
          </button>
          <div className="absolute top-3 left-3 flex gap-2">
            {isFromScan && matchPct && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
                <span className="text-[11px] font-semibold text-white">
                  {matchPct}% match
                </span>
              </div>
            )}
            {isFromScan && (
              <div className="px-2.5 py-1 rounded-full bg-cyan/20 backdrop-blur-sm border border-cyan/30">
                <span className="text-[11px] font-semibold text-cyan">
                  🎵 Identificada
                </span>
              </div>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-3">
            <h2 className="font-display font-black text-2xl text-white leading-tight">
              {song.title}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-white/70 text-sm">{song.artist}</p>
              {song.album && (
                <>
                  <span className="text-white/30">·</span>
                  <p className="text-white/40 text-xs truncate">{song.album}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Controls + progress ───────────────────────────────────────── */}
        <div className="flex-shrink-0 px-5 py-3 border-b border-white/8">
          <div className="flex items-center gap-3">
            {/* Waveform */}
            <SoundWave active={isPlaying} color={song.color} bars={14} />

            {/* Timer */}
            {isPlaying && (
              <span className="text-xs tabular-nums font-mono text-muted/70 flex-shrink-0">
                {fmt(current)} / {fmt(Math.min(duration, previewSeconds))}
              </span>
            )}

            <div className="flex items-center gap-2 ml-auto">
              {/* Play/Pause */}
              <button
                onClick={() => onPlay(song, song.match_timestamp_seconds ?? 0)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-bg text-white text-sm font-bold transition-all hover:opacity-90 active:scale-95"
              >
                {isPlaying ? (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                    Pausar
                  </>
                ) : (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                    Escuchar
                  </>
                )}
              </button>
              {/* Like (Me gusta Spotify) */}
              {isAuthenticated && song.spotify_id && (
                <button
                  onClick={handleLike}
                  disabled={liking || liked}
                  title={
                    liked ? "Ya en Me gusta" : "Añadir a Me gusta de Spotify"
                  }
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all
                    ${liked ? "border-red-400/40 text-red-400 bg-red-400/10" : "border-white/10 text-muted hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5"}`}
                >
                  {liking ? (
                    <svg
                      className="w-4 h-4 animate-spin"
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
                        d="M12 2a10 10 0 0110 10"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill={liked ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-4 h-4"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                  )}
                </button>
              )}
              {/* Save to playlist */}
              {isAuthenticated && song.spotify_id && (
                <button
                  onClick={handleSave}
                  disabled={saving || saved}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all
                    ${saved ? "border-cyan/40 text-cyan bg-cyan/10" : "border-white/10 text-muted hover:text-white hover:bg-white/5"}`}
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
              <ServiceButtons song={song} size="sm" />
            </div>
          </div>

          {/* Progress bar */}
          {(isPlaying || current > 0) && (
            <div className="mt-2.5 h-1 bg-white/8 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-100 gradient-bg"
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
        </div>

        {/* Lyrics */}
        <div
          className="flex-1 overflow-y-auto px-5 py-4"
          style={{ minHeight: 0 }}
        >
          {lyricsData === "loading" && (
            <div className="flex flex-col items-center py-16 gap-3">
              <svg
                className="w-5 h-5 text-muted animate-spin"
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
              <p className="text-muted text-sm">Buscando letra…</p>
            </div>
          )}
          {lyricsData === "error" && (
            <div className="flex flex-col items-center py-16 gap-3 text-center">
              <span className="text-4xl">🎤</span>
              <p className="text-muted text-sm">Letra no disponible</p>
            </div>
          )}
          {lyricsData &&
            lyricsData !== "loading" &&
            lyricsData !== "error" &&
            plain && <PlainLyrics text={plain} color={song.color} />}
        </div>

        {/* Preview ended overlay */}
        {previewEnded && (
          <div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 rounded-t-3xl sm:rounded-3xl"
            style={{
              background: "rgba(10,10,20,0.94)",
              backdropFilter: "blur(12px)",
            }}
          >
            <img
              src={song.cover}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-8 rounded-t-3xl sm:rounded-3xl"
            />
            <div className="relative z-10 flex flex-col items-center gap-5 px-8 text-center">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={song.cover}
                  alt={song.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://picsum.photos/seed/${song.id}/200/200`;
                  }}
                />
              </div>
              <div>
                <p className="text-muted text-xs uppercase tracking-widest mb-2">
                  Vista previa terminada
                </p>
                <h3 className="font-display font-black text-2xl text-white mb-1">
                  {song.title}
                </h3>
                <p className="text-muted text-sm">{song.artist}</p>
              </div>
              <p className="text-muted/60 text-sm">
                Escuchaste {previewSeconds}s — continúa en:
              </p>
              <ServiceButtons song={song} size="lg" />
              <button
                onClick={onClose}
                className="text-muted/40 hover:text-muted text-sm transition-colors mt-1"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Lyrics fetch ──────────────────────────────────────────────────────────────
async function fetchLyrics(artist, title) {
  try {
    const r = await fetch(
      `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}`,
      { signal: AbortSignal.timeout(6000) },
    );
    if (r.ok) {
      const d = await r.json();
      if (d.lyrics) return { plain: d.lyrics };
    }
  } catch {}
  try {
    const r = await fetch(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (r.ok) {
      const d = await r.json();
      if (d.lyrics) return { plain: d.lyrics.trim() };
    }
  } catch {}
  return null;
}
