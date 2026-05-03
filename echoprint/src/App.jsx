import { useState, useRef, useEffect, useCallback } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthProvider } from "./AuthContext";
import { songs as songsApi, fetchItunesPreview } from "./api"; // FIX: import desde api.js
import Layout from "./components/Layout";
import NowPlayingBar from "./components/NowPlayingBar";
import SongDetailModal from "./components/SongDetailModal";
import AuthPage from "./pages/AuthPage";
import DiscoverPage from "./pages/DiscoverPage";
import HistoryPage from "./pages/HistoryPage";
import FullHistoryPage from "./pages/FullHistoryPage";
import ProfilePage from "./pages/ProfilePage";
import { useAuth } from "./AuthContext";

const PREVIEW_SECONDS_SCAN = 30;
const PREVIEW_SECONDS_SEARCH = 35;

export function serviceUrls(song) {
  const q = encodeURIComponent(`${song.title} ${song.artist}`);
  return {
    spotify: song.spotify_id
      ? `https://open.spotify.com/track/${song.spotify_id}`
      : `https://open.spotify.com/search/${q}`,
    appleMusic: `https://music.apple.com/search?term=${q}`,
    youtube: `https://www.youtube.com/results?search_query=${q}`,
  };
}

function showNoPreviewAlert(song) {
  const urls = serviceUrls(song);
  const btn = (href, bg, icon, label) => `
    <a href="${href}" target="_blank" rel="noreferrer"
       style="display:flex;align-items:center;gap:10px;padding:12px 18px;border-radius:12px;
              background:${bg};color:${bg === "#1DB954" ? "#000" : "#fff"};font-weight:700;
              font-size:13px;text-decoration:none;transition:opacity .15s"
       onmouseover="this.style.opacity='.82'" onmouseout="this.style.opacity='1'">
      ${icon}<span>${label}</span>
    </a>`;
  Swal.fire({
    html: `
      <div style="text-align:center;padding:4px 0 0">
        <img src="${song.cover}" style="width:76px;height:76px;object-fit:cover;border-radius:14px;
             margin-bottom:14px;box-shadow:0 8px 24px rgba(0,0,0,0.5)"/>
        <p style="color:#6b6b8a;font-size:11px;text-transform:uppercase;letter-spacing:.1em;margin:0 0 6px">
          Sin vista previa disponible</p>
        <h3 style="color:#fff;font-size:17px;font-weight:800;margin:0 0 4px">${song.title}</h3>
        <p style="color:#8b8ba7;font-size:13px;margin:0 0 20px">${song.artist}</p>
        <p style="color:#6b6b8a;font-size:12px;margin-bottom:12px">Escúchala completa en:</p>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${btn(urls.spotify, "#1DB954", `<svg viewBox="0 0 24 24" fill="currentColor" style="width:17px;height:17px;flex-shrink:0"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>`, "Abrir en Spotify")}
          ${btn(urls.appleMusic, "linear-gradient(135deg,#fc3c44,#ff2d55)", `<svg viewBox="0 0 814 1000" fill="currentColor" style="width:17px;height:17px;flex-shrink:0"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105.5-57.8-155.5-127.4C46 790.7 0 683.1 0 581.2 0 356.9 152.3 236.3 302.9 236.3c72.6 0 132.6 47.8 178.1 47.8 43.3 0 111.1-50.7 191.7-50.7 28.6 0 104.8 2.6 168.1 68.1zm-208-191.7c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/></svg>`, "Abrir en Apple Music")}
          ${btn(urls.youtube, "#FF0000", `<svg viewBox="0 0 24 24" fill="currentColor" style="width:17px;height:17px;flex-shrink:0"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>`, "Buscar en YouTube")}
        </div>
      </div>`,
    background: "#16162a",
    showConfirmButton: false,
    showCloseButton: true,
    width: "320px",
    padding: "1.25rem",
    customClass: {
      popup: "swal-echoprint-popup",
      closeButton: "swal-echoprint-close",
    },
  });
}

function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div
        className="absolute w-[500px] h-[500px] rounded-full bg-violet/25 blur-[80px] -top-32 -left-32"
        style={{ animation: "drift1 12s ease-in-out infinite alternate" }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full bg-cyan/20 blur-[80px] top-1/3 -right-20"
        style={{ animation: "drift2 14s ease-in-out infinite alternate" }}
      />
      <div
        className="absolute w-[350px] h-[350px] rounded-full bg-[#ff2d55]/15 blur-[80px] bottom-0 left-1/3"
        style={{ animation: "drift3 10s ease-in-out infinite alternate" }}
      />
    </div>
  );
}

function SpotifyCallbackBanner({ status, onDismiss }) {
  const isError = status?.startsWith("spotify_error");
  const messages = {
    spotify_connected: "¡Spotify conectado exitosamente!",
    spotify_error_access_denied: "Acceso a Spotify denegado.",
    spotify_error_state_expired: "La sesión expiró. Intenta de nuevo.",
    spotify_error_invalid_state: "Estado inválido.",
    spotify_error_token_exchange_failed: "Error al conectar con Spotify.",
  };
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div
        className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl backdrop-blur-xl border
        ${isError ? "bg-red-500/10 border-red-500/30" : "bg-[#1DB954]/10 border-[#1DB954]/30"}`}
      >
        <span className="text-sm font-medium text-white">
          {messages[status] ||
            (isError ? "Error al conectar." : "¡Spotify conectado!")}
        </span>
        <button
          onClick={onDismiss}
          className="text-white/50 hover:text-white ml-1"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function AppInner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuth, setShowAuth] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [playingSong, setPlayingSong] = useState(null);
  const [previewEnded, setPreviewEnded] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);
  const [spotifyStatus, setSpotifyStatus] = useState(null);
  const [detailSong, setDetailSong] = useState(null);
  const [detailScore, setDetailScore] = useState(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  const activeTab =
    location.pathname === "/history" || location.pathname === "/history/all"
      ? "history"
      : location.pathname === "/profile"
        ? "stats"
        : "discover";

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("spotify_connected") === "true") {
      setSpotifyStatus("spotify_connected");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (p.get("spotify_error")) {
      setSpotifyStatus(`spotify_error_${p.get("spotify_error")}`);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    clearTimeout(timerRef.current);
    setPreviewEnded(false);
    if (playingSong?.preview_url) {
      audio.src = playingSong.preview_url;
      audio.load();
      const startAt = playingSong._startAt ?? 0;
      const onReady = () => {
        if (startAt > 0 && startAt < audio.duration - 3) {
          audio.currentTime = startAt;
        }
        audio.play().catch(() => {});
        audio.removeEventListener("canplay", onReady);
      };
      audio.addEventListener("canplay", onReady);
      const isScan = playingSong.match_timestamp_seconds != null;
      const limitMs =
        (isScan ? PREVIEW_SECONDS_SCAN : PREVIEW_SECONDS_SEARCH) * 1000;
      timerRef.current = setTimeout(() => {
        audio.pause();
        setPreviewEnded(true);
      }, limitMs);
    } else {
      audio.pause();
    }
    return () => clearTimeout(timerRef.current);
  }, [playingSong]);

  const handlePlay = useCallback(
    async (song, startAt = 0) => {
      const id = song.spotify_id ?? song.id;

      // FIX: si la misma canción ya está sonando → pausar
      if (playingId === id && !previewEnded) {
        clearTimeout(timerRef.current);
        audioRef.current?.pause();
        setPlayingId(null);
        setPlayingSong(null);
        return;
      }

      setPreviewEnded(false);
      // FIX: setPlayingId ANTES de buscar iTunes para dar feedback visual inmediato
      setPlayingId(id);

      let enriched = song;
      if (!song.preview_url) {
        const url = await fetchItunesPreview(song.title, song.artist);
        if (url) {
          enriched = { ...song, preview_url: url };
        } else {
          // FIX: limpiar playingId ANTES de mostrar la alerta
          setPlayingId(null);
          showNoPreviewAlert(song);
          return;
        }
      }

      setPlayingSong({ ...enriched, _startAt: startAt });

      const isFromScan = enriched.match_timestamp_seconds != null;
      if (!isFromScan && user) {
        songsApi.addToHistory(enriched).catch(() => {});
      }
    },
    [playingId, previewEnded, user],
  );

  function handleStop() {
    clearTimeout(timerRef.current);
    setPlayingId(null);
    setPlayingSong(null);
    setPreviewEnded(false);
  }

  function handleAudioEnded() {
    clearTimeout(timerRef.current);
    setPreviewEnded(true);
  }

  const handleOpenDetail = useCallback((song, score = null) => {
    setDetailSong(song);
    setDetailScore(score);
  }, []);

  function handleScanResult(song, score) {
    setHistoryCount((c) => c + 1);
    handleOpenDetail(song, score);
    handlePlay(song, song.match_timestamp_seconds ?? 0);
  }

  const isPlaying = (id) => playingId === id && !previewEnded;

  const pageProps = {
    onPlay: handlePlay,
    playingId,
    onOpenDetail: handleOpenDetail,
    onShowAuth: () => setShowAuth(true),
  };

  return (
    <div className="relative min-h-screen bg-bg">
      <BackgroundOrbs />
      <audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" />

      {spotifyStatus && (
        <SpotifyCallbackBanner
          status={spotifyStatus}
          onDismiss={() => setSpotifyStatus(null)}
        />
      )}

      <div className="relative z-10">
        <Layout
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === "discover") navigate("/");
            else if (tab === "history") navigate("/history");
            else if (tab === "stats") navigate("/profile");
          }}
          historyCount={historyCount}
          onShowAuth={() => setShowAuth(true)}
        >
          <Routes>
            <Route
              path="/"
              element={
                <DiscoverPage {...pageProps} onScanResult={handleScanResult} />
              }
            />
            <Route path="/history" element={<HistoryPage {...pageProps} />} />
            <Route
              path="/history/all"
              element={<FullHistoryPage {...pageProps} />}
            />
            <Route path="/profile" element={<ProfilePage {...pageProps} />} />
          </Routes>
        </Layout>
      </div>

      {playingSong && (
        <NowPlayingBar
          song={playingSong}
          onStop={handleStop}
          onOpenDetail={() => handleOpenDetail(playingSong, null)}
          previewEnded={previewEnded}
          audioRef={audioRef}
          previewSeconds={
            playingSong?.match_timestamp_seconds != null ? 30 : 35
          }
        />
      )}

      {detailSong && (
        <SongDetailModal
          audioRef={audioRef}
          song={detailSong}
          score={detailScore}
          onClose={() => {
            setDetailSong(null);
            setDetailScore(null);
          }}
          onPlay={handlePlay}
          isPlaying={isPlaying(detailSong.spotify_id ?? detailSong.id)}
          isAuthenticated={!!user}
          previewEnded={
            previewEnded &&
            playingId === (detailSong.spotify_id ?? detailSong.id)
          }
          previewSeconds={detailSong?.match_timestamp_seconds != null ? 30 : 35}
        />
      )}

      {showAuth && <AuthPage onClose={() => setShowAuth(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
