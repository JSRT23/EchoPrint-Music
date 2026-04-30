import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { songs, spotify } from "../api";

function GatedView({ onShowAuth }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center gap-5">
      <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center text-3xl shadow-xl">
        👤
      </div>
      <div className="max-w-xs">
        <h2 className="font-display font-black text-xl text-white mb-2">
          Tu perfil musical
        </h2>
        <p className="text-muted text-sm leading-relaxed">
          Inicia sesión para ver tus estadísticas y géneros favoritos.
        </p>
      </div>
      <button
        onClick={onShowAuth}
        className="px-8 py-3.5 rounded-xl gradient-bg text-white font-display font-bold text-sm hover:opacity-90 transition-all"
      >
        Iniciar sesión
      </button>
    </div>
  );
}

function StatCard({ value, label, color = "cyan" }) {
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-1">
      <p className={`font-display font-black text-4xl gradient-text`}>
        {value}
      </p>
      <p className="text-muted text-xs uppercase tracking-wider">{label}</p>
    </div>
  );
}

function RankList({ title, items, valueKey, labelKey, color }) {
  if (!items?.length) return null;
  const max = items[0]?.count ?? 1;
  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="font-display font-bold text-sm uppercase tracking-wider text-muted mb-5">
        {title}
      </h3>
      <div className="flex flex-col gap-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-muted/50 text-xs w-4 text-right tabular-nums">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-white/90">
                {item[labelKey] || "—"}
              </p>
              <div className="mt-1.5 h-1 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${color === "cyan" ? "gradient-bg" : "bg-violet"}`}
                  style={{
                    width: `${Math.min(100, (item.count / max) * 100)}%`,
                    transition: "width .6s ease",
                  }}
                />
              </div>
            </div>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${color === "cyan" ? "text-cyan bg-cyan/10" : "text-violet bg-violet/10"}`}
            >
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage({ onShowAuth }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [spotifyProfile, setSpotifyProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      songs.stats().catch(() => null),
      spotify.profile().catch(() => null),
    ])
      .then(([s, sp]) => {
        setStats(s);
        setSpotifyProfile(sp);
      })
      .finally(() => setLoading(false));
  }, [user]);

  async function connectSpotify() {
    try {
      const url = await spotify.getAuthUrl();
      window.location.href = url;
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo obtener la URL de Spotify. Intenta de nuevo.",
        background: "#16162a",
        color: "#fff",
        confirmButtonColor: "#06B6D4",
        customClass: { popup: "swal-echoprint-popup" },
      });
    }
  }
  async function disconnectSpotify() {
    const result = await Swal.fire({
      html: `
        <div style="text-align:center;padding:4px 0">
          <div style="width:48px;height:48px;border-radius:14px;background:rgba(239,68,68,0.12);
               border:1px solid rgba(239,68,68,0.25);display:flex;align-items:center;
               justify-content:center;margin:0 auto 16px">
            <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.8"
              style="width:24px;height:24px">
              <path stroke-linecap="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4
                M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </div>
          <h3 style="color:#fff;font-size:1rem;font-weight:700;margin:0 0 8px">
            ¿Desconectar Spotify?
          </h3>
          <p style="color:#8b8ba7;font-size:0.85rem;margin:0">
            Ya no podrás guardar canciones en tus playlists desde Echoprint.
          </p>
        </div>`,
      background: "#16162a",
      showConfirmButton: true,
      confirmButtonText: "Sí, desconectar",
      confirmButtonColor: "#ef4444",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      width: "300px",
      padding: "1.25rem",
      customClass: { popup: "swal-echoprint-popup" },
    });
    if (!result.isConfirmed) return;
    try {
      await spotify.disconnect();
      setSpotifyProfile(null);
      Swal.fire({
        icon: "success",
        title: "Spotify desconectado",
        text: "Tu cuenta de Spotify ha sido desvinculada.",
        background: "#16162a",
        color: "#fff",
        confirmButtonColor: "#06B6D4",
        timer: 2500,
        timerProgressBar: true,
        customClass: { popup: "swal-echoprint-popup" },
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo desconectar. Intenta de nuevo.",
        background: "#16162a",
        color: "#fff",
        confirmButtonColor: "#06B6D4",
        customClass: { popup: "swal-echoprint-popup" },
      });
    }
  }

  if (!user) return <GatedView onShowAuth={onShowAuth} />;

  return (
    <section className="pt-8 pb-32 max-w-2xl">
      {/* User card */}
      <div className="glass-card rounded-2xl p-5 mb-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center text-black font-display font-black text-2xl flex-shrink-0">
          {user.username?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-bold text-lg text-white">
            {user.username}
          </h2>
          <p className="text-muted text-xs truncate">{user.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-muted border border-white/10 hover:text-white hover:bg-white/5 transition-all"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-3.5 h-3.5"
          >
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Salir
        </button>
      </div>

      {/* Spotify card */}
      <div className="glass-card rounded-2xl p-4 mb-6 flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${spotifyProfile ? "bg-[#1DB954]/15" : "bg-white/5"}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill={spotifyProfile ? "#1DB954" : "#6b6b8a"}
            className="w-4 h-4"
          >
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-white">
            {spotifyProfile ? "Spotify conectado" : "Spotify no conectado"}
          </p>
          <p className="text-muted text-xs truncate">
            {spotifyProfile
              ? (spotifyProfile.display_name ?? spotifyProfile.id)
              : "Conecta para guardar canciones"}
          </p>
        </div>
        {spotifyProfile ? (
          <button
            onClick={disconnectSpotify}
            className="text-xs text-muted border border-white/10 px-3 py-1.5 rounded-lg hover:text-white transition-all"
          >
            Desconectar
          </button>
        ) : (
          <button
            onClick={connectSpotify}
            className="text-xs font-semibold text-[#1DB954] border border-[#1DB954]/30 bg-[#1DB954]/10 px-3 py-1.5 rounded-lg hover:bg-[#1DB954]/20 transition-all"
          >
            Conectar
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <svg
            className="w-6 h-6 text-muted animate-spin"
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
        </div>
      )}

      {stats && (
        <div className="flex flex-col gap-4">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              value={stats.total_identified ?? 0}
              label="Identificadas"
            />
            <StatCard
              value={
                stats.by_method?.find((m) => m.method === "audio")?.count ?? 0
              }
              label="Por audio"
            />
            <StatCard
              value={
                stats.by_method?.find((m) => m.method === "text")?.count ?? 0
              }
              label="Por texto"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RankList
              title="Artistas favoritos"
              items={stats.top_artists}
              valueKey="count"
              labelKey="song__artist__name"
              color="cyan"
            />
            <RankList
              title="Géneros favoritos"
              items={stats.top_genres}
              valueKey="count"
              labelKey="song__genre"
              color="violet"
            />
          </div>

          <button
            onClick={() => navigate("/history")}
            className="glass-card rounded-2xl p-4 flex items-center gap-3 border border-white/10 hover:border-cyan/30 hover:bg-white/5 transition-all group text-left"
          >
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="black"
                strokeWidth="2.5"
                className="w-4 h-4"
              >
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-white">
                Ver mi historial
              </p>
              <p className="text-muted text-xs">
                Todas las canciones que has identificado
              </p>
            </div>
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
      )}
    </section>
  );
}
