import { useState, useRef, useEffect } from "react";
import ScanButton from "../components/ScanButton";
import SongCard from "../components/SongCard";
import ScanErrorModal from "../components/ScanErrorModal";
import { spotify, recognition, recordAudio } from "../api";
import { normalizeSongSpotify, normalizeSong } from "../utils";
import { useAuth } from "../AuthContext";

function groupByGenre(songs) {
  const map = new Map();
  for (const s of songs) {
    const key = s.genre || "Otros";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(s);
  }
  return [...map.entries()].sort(([a], [b]) => {
    if (a === "Otros") return 1;
    if (b === "Otros") return -1;
    return 0;
  });
}

function Spinner() {
  return (
    <svg
      className="w-4 h-4 text-muted animate-spin"
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
  );
}

const SCAN_SECONDS = 10;

export default function DiscoverPage({
  onPlay,
  playingId,
  onScanResult,
  onOpenDetail,
}) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [humming, setHumming] = useState(false);
  const [scanSecs, setScanSecs] = useState(0);
  const [humSecs, setHumSecs] = useState(0);
  const [errorType, setErrorType] = useState(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const scanTimer = useRef(null); // timer for scan progress
  const humTimer = useRef(null); // timer for hum progress — separate!

  useEffect(
    () => () => {
      clearTimeout(debounceRef.current);
      clearInterval(scanTimer.current);
      clearInterval(humTimer.current);
      abortRef.current?.abort();
    },
    [],
  );

  // ── Búsqueda textual ──────────────────────────────────────────────────────
  function handleQueryChange(e) {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(debounceRef.current);
    abortRef.current?.abort();
    if (!q.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const data = await spotify.search(q, { signal: ctrl.signal });
        setResults(data.map(normalizeSongSpotify));
      } catch (err) {
        if (err?.name !== "AbortError") setResults([]);
      } finally {
        if (abortRef.current === ctrl) setSearching(false);
      }
    }, 450);
  }

  // ── Reconocimiento por audio ──────────────────────────────────────────────
  async function startScan() {
    if (scanning || humming) return;
    setErrorType(null);
    setScanSecs(0);
    setScanning(true);
    scanTimer.current = setInterval(
      () => setScanSecs((s) => Math.min(s + 1, SCAN_SECONDS)),
      1000,
    );
    try {
      const blob = await recordAudio(SCAN_SECONDS);
      clearInterval(scanTimer.current);
      const res = await recognition.recognize(blob);
      if (res.status === "success" && res.song) {
        const s = {
          ...normalizeSong(res.song),
          match_timestamp_seconds: res.match_timestamp_seconds ?? null,
        };
        onScanResult?.(s, res.score);
      } else {
        setErrorType("no_match");
      }
    } catch {
      setErrorType("mic_error");
    } finally {
      clearInterval(scanTimer.current);
      setScanSecs(0);
      setScanning(false);
    }
  }

  // ── Reconocimiento por tarareo/canto ──────────────────────────────────────
  async function startHum() {
    if (humming || scanning) return;
    setErrorType(null);
    setHumSecs(0);
    setHumming(true);
    humTimer.current = setInterval(
      () => setHumSecs((s) => Math.min(s + 1, SCAN_SECONDS)),
      1000,
    );
    try {
      const blob = await recordAudio(SCAN_SECONDS);
      clearInterval(humTimer.current);
      const res = await recognition.recognizeHumming(blob);
      if (res.status === "success" && res.song) {
        const s = {
          ...normalizeSong(res.song),
          match_timestamp_seconds: res.match_timestamp_seconds ?? null,
        };
        onScanResult?.(s, res.score);
      } else {
        setErrorType("humming_no_match");
      }
    } catch {
      setErrorType("mic_error");
    } finally {
      clearInterval(humTimer.current);
      setHumSecs(0);
      setHumming(false);
    }
  }

  const grouped = query.trim() ? groupByGenre(results) : [];
  const isActive = scanning || humming;

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center text-center pt-14 pb-12 sm:pt-20 sm:pb-16 gap-10">
        <div>
          <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight mb-3">
            Identifica cualquier
            <br />
            <span className="gradient-text">canción al instante</span>
          </h1>
          <p className="text-muted text-base sm:text-lg">
            Toca el botón y deja que Echoprint escuche
          </p>
        </div>

        {/* ── Buttons + progress ── */}
        <div className="flex flex-col items-center gap-5">
          {/* Main scan button */}
          <ScanButton scanning={isActive} onClick={startScan} />

          {/* Scan progress bar */}
          {scanning && (
            <div className="flex flex-col items-center gap-2 animate-fade-in w-48">
              <p className="text-cyan text-xs font-semibold tabular-nums">
                Escuchando… {scanSecs}s / {SCAN_SECONDS}s
              </p>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full gradient-bg transition-all duration-1000"
                  style={{ width: `${(scanSecs / SCAN_SECONDS) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Divider */}
          {!isActive && (
            <div className="flex items-center gap-3 w-48">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-muted/40 text-xs">o</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>
          )}

          {/* Hum button */}
          {!scanning && (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={startHum}
                disabled={isActive}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-semibold
                  border transition-all duration-200
                  ${
                    humming
                      ? "border-violet/50 text-violet bg-violet/10 scale-[0.97] cursor-not-allowed"
                      : "border-white/10 text-muted hover:text-white hover:border-violet/30 hover:bg-violet/5"
                  }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  className={`w-4 h-4 ${humming ? "text-violet animate-pulse" : ""}`}
                >
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                  <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
                </svg>
                {humming ? "Escuchando…" : "Tararear o cantar"}
              </button>

              {/* Hum progress bar — only visible while humming */}
              {humming && (
                <div className="flex flex-col items-center gap-1.5 animate-fade-in w-48">
                  <p className="text-violet text-xs font-semibold tabular-nums">
                    {humSecs}s / {SCAN_SECONDS}s
                  </p>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-violet transition-all duration-1000"
                      style={{ width: `${(humSecs / SCAN_SECONDS) * 100}%` }}
                    />
                  </div>
                  <p className="text-muted/50 text-[11px]">
                    Sigue cantando o tarareando…
                  </p>
                </div>
              )}

              {/* Hint — only when idle */}
              {!humming && !isActive && (
                <p className="text-muted/35 text-[11px] max-w-[180px] leading-relaxed">
                  Funciona mejor con canciones populares
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Buscador ──────────────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto mb-10">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="w-full pl-12 pr-12 py-4 bg-surface2 border border-white/10 rounded-2xl
              text-white placeholder-muted text-sm outline-none
              focus:border-cyan/40 focus:shadow-[0_0_0_3px_rgba(0,229,255,0.07)] transition-all"
            placeholder="Buscar por artista, título o álbum…"
            value={query}
            onChange={handleQueryChange}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {searching && <Spinner />}
            {!searching && query && (
              <button
                onClick={() => {
                  abortRef.current?.abort();
                  setQuery("");
                  setResults([]);
                }}
                className="w-5 h-5 rounded-full flex items-center justify-center text-muted hover:text-white hover:bg-white/10 transition-all text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        {query && (
          <p className="flex items-center gap-1.5 text-muted/60 text-xs mt-2 ml-1">
            <svg viewBox="0 0 24 24" fill="#1DB954" className="w-3.5 h-3.5">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            Resultados de Spotify · {results.length} canciones
          </p>
        )}
      </section>

      {/* ── Resultados ────────────────────────────────────────────────────── */}
      {query.trim() ? (
        <section>
          {grouped.length > 0 ? (
            <div className="flex flex-col gap-12">
              {grouped.map(([genre, songs]) => (
                <GenreSection
                  key={genre}
                  genre={genre}
                  songs={songs}
                  onPlay={onPlay}
                  playingId={playingId}
                  isAuthenticated={!!user}
                  onOpenDetail={onOpenDetail}
                />
              ))}
            </div>
          ) : (
            !searching && (
              <div className="flex flex-col items-center py-20 gap-3 text-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-12 h-12 text-muted/40"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p className="text-muted">Sin resultados para "{query}"</p>
                <p className="text-muted/50 text-sm">
                  Prueba con el nombre del artista
                </p>
              </div>
            )
          )}
        </section>
      ) : (
        !isActive && (
          <div className="flex flex-col items-center py-16 gap-3 text-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-12 h-12 text-muted/30"
            >
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            <p className="text-muted/60 text-sm">
              {user
                ? "Escanea o busca una canción"
                : "Escanea una canción o usa el buscador"}
            </p>
          </div>
        )
      )}

      {/* ── Error modal ───────────────────────────────────────────────────── */}
      {errorType && (
        <ScanErrorModal
          type={errorType}
          onRetry={() => {
            setErrorType(null);
            if (errorType === "humming_no_match") startHum();
            else startScan();
          }}
          onClose={() => setErrorType(null)}
        />
      )}
    </>
  );
}

function GenreSection({
  genre,
  songs,
  onPlay,
  playingId,
  isAuthenticated,
  onOpenDetail,
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? songs : songs.slice(0, 5);
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <span className="w-1.5 h-6 rounded-full gradient-bg flex-shrink-0" />
        <h2 className="font-display font-bold text-lg capitalize">{genre}</h2>
        <span className="text-xs text-muted bg-surface px-2.5 py-1 rounded-full border border-white/10">
          {songs.length}
        </span>
        {songs.length > 5 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="ml-auto text-xs text-cyan/70 hover:text-cyan transition-colors font-medium"
          >
            {expanded ? "Ver menos" : `Ver todos (${songs.length})`}
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {visible.map((song, i) => (
          <SongCard
            key={song.spotify_id ?? i}
            song={song}
            onPlay={onPlay}
            isPlaying={playingId === (song.spotify_id ?? song.id)}
            isAuthenticated={isAuthenticated}
            onOpenDetail={onOpenDetail}
          />
        ))}
      </div>
    </div>
  );
}
