import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { songs } from "../api";
import { normalizeSong } from "../utils";
import SongCard from "../components/SongCard";

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {[...Array(10)].map((_, i) => (
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

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Ayer";
  if (diff < 7) return `Hace ${diff} días`;
  return d.toLocaleDateString("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function groupByDate(items) {
  const map = new Map();
  for (const s of items) {
    const label = formatDate(s._scannedAt);
    if (!map.has(label)) map.set(label, []);
    map.get(label).push(s);
  }
  return [...map.entries()];
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

export default function FullHistoryPage({ onPlay, playingId, onOpenDetail }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/history");
      return;
    }
    setLoading(true);
    songs
      .history()
      .then((data) => {
        setItems(
          data.map((h) => ({
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
  }, [user, navigate]);

  async function handleDelete(historyId) {
    try {
      await songs.deleteHistory(historyId);
      setItems((prev) => prev.filter((s) => s._historyId !== historyId));
    } catch {
      alert("No se pudo eliminar. Intenta de nuevo.");
    }
  }

  const filtered = search.trim()
    ? items.filter(
        (s) =>
          s.title.toLowerCase().includes(search.toLowerCase()) ||
          s.artist.toLowerCase().includes(search.toLowerCase()),
      )
    : items;

  const grouped = groupByDate(filtered);

  return (
    <section className="pt-8 pb-32">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/history")}
          className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 text-muted hover:text-white hover:bg-white/5 transition-all"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="font-display font-black text-2xl text-white">
            Todo mi historial
          </h2>
          <p className="text-muted text-xs">
            {items.length} canciones identificadas
          </p>
        </div>
      </div>

      {/* Search */}
      {items.length > 0 && (
        <div className="relative mb-8">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="w-full pl-11 pr-4 py-3.5 bg-surface2 border border-white/10 rounded-xl text-white placeholder-muted text-sm outline-none focus:border-cyan/40 transition-all"
            placeholder="Filtrar por título o artista…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-muted hover:text-white hover:bg-white/10 transition-all text-xs"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {loading && <SkeletonGrid />}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center py-20 gap-3 text-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-12 h-12 text-muted/40"
          >
            {search ? (
              <>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </>
            ) : (
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
          <p className="text-muted">
            {search ? `Sin resultados para "${search}"` : "Historial vacío"}
          </p>
        </div>
      )}

      {!loading && grouped.length > 0 && (
        <div className="flex flex-col gap-12">
          {grouped.map(([label, group]) => (
            <div key={label}>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-1.5 h-5 rounded-full gradient-bg flex-shrink-0" />
                <h3 className="font-display font-bold text-base text-white/90">
                  {label}
                </h3>
                <span className="text-xs text-muted bg-surface px-2.5 py-0.5 rounded-full border border-white/10">
                  {group.length}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {group.map((song, i) => (
                  <SongCard
                    key={`${song._historyId ?? song.id}-${i}`}
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
          ))}
        </div>
      )}
    </section>
  );
}
