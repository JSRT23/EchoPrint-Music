// BASE_URL: en producción usa VITE_API_URL (sin /api, se añade aquí)
// En desarrollo usa localhost automáticamente
const _apiBase = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");
const BASE_URL = _apiBase ? `${_apiBase}/api` : "http://127.0.0.1:8000/api";

// ─── TOKENS ─────────────────────────────────
const getAccess = () => localStorage.getItem("access_token");
const getRefresh = () => localStorage.getItem("refresh_token");

const setTokens = (access, refresh) => {
  localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
};

const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

// ─── FETCH BASE ─────────────────────────────
async function apiFetch(path, options = {}) {
  const headers = { ...options.headers };
  const token = getAccess();

  if (token) headers["Authorization"] = `Bearer ${token}`;

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  let res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // 🔄 refresh token automático
  if (res.status === 401 && getRefresh()) {
    const refreshRes = await fetch(`${BASE_URL}/users/login/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: getRefresh() }),
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      setTokens(data.access, null);
      headers["Authorization"] = `Bearer ${data.access}`;
      res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    } else {
      clearTokens();
      window.location.reload();
    }
  }

  return res;
}

// ─── AUTH ───────────────────────────────────
export const auth = {
  async register(username, email, password) {
    const res = await fetch(`${BASE_URL}/users/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, password2: password }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    setTokens(data.access, data.refresh);
    return data.user;
  },

  async login(email, password) {
    const res = await fetch(`${BASE_URL}/users/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    setTokens(data.access, data.refresh);
    return data;
  },

  async logout() {
    try {
      await apiFetch("/users/logout/", {
        method: "POST",
        body: JSON.stringify({ refresh: getRefresh() }),
      });
    } finally {
      clearTokens();
    }
  },

  async profile() {
    const res = await apiFetch("/users/profile/");
    if (!res.ok) throw await res.json();
    return res.json();
  },

  isLoggedIn: () => !!getAccess(),
};

// ─── SONGS ──────────────────────────────────
export const songs = {
  async history() {
    // Consume todas las páginas si el backend devuelve respuesta paginada
    let url = "/songs/history/";
    let allResults = [];

    while (url) {
      const res = await apiFetch(url);
      const data = await res.json();
      if (!res.ok) throw data;

      if (Array.isArray(data)) {
        // Respuesta directa sin paginación
        return data;
      }

      allResults = allResults.concat(data.results ?? []);

      // Si hay página siguiente, extraer solo el path+query para apiFetch
      if (data.next) {
        try {
          const nextUrl = new URL(data.next);
          url = nextUrl.pathname.replace(/^\/api/, "") + nextUrl.search;
        } catch {
          url = null;
        }
      } else {
        url = null;
      }
    }

    return allResults;
  },

  async stats() {
    const res = await apiFetch("/songs/stats/");
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async addToHistory(song) {
    const res = await apiFetch("/songs/history/add/", {
      method: "POST",
      body: JSON.stringify({
        spotify_id: song.spotify_id ?? "",
        title: song.title ?? "",
        artist: song.artist ?? "",
        album: song.album ?? "",
        cover_url: song.cover ?? "",
        preview_url: song.preview_url ?? "",
        genre: song.genre ?? "",
      }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  async deleteHistory(id) {
    const res = await apiFetch(`/songs/history/${id}/delete/`, {
      method: "DELETE",
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },
};

// ─── RECOGNITION ─────────────────────────────
export const recognition = {
  async recognize(audioBlob) {
    const form = new FormData();
    form.append("audio", audioBlob, "recording.wav");
    const res = await apiFetch("/recognize/", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  async recognizeHumming(audioBlob) {
    const form = new FormData();
    form.append("audio", audioBlob, "recording.wav");
    const res = await apiFetch("/recognize/humming/", {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },
};

// ─── SPOTIFY ────────────────────────────────
export const spotify = {
  async search(query, { signal } = {}) {
    if (!query?.trim()) return [];
    const res = await apiFetch(
      `/spotify/search/?q=${encodeURIComponent(query.trim())}`,
      { signal },
    );
    const data = await res.json();
    if (!res.ok) throw data;
    return data.results ?? data;
  },

  async getAuthUrl() {
    const res = await apiFetch("/spotify/auth/");
    const data = await res.json();
    if (!res.ok) throw data;
    return data.auth_url;
  },

  async saveTrack(spotifyTrackId, playlistId = null) {
    const body = { spotify_track_id: spotifyTrackId };
    if (playlistId) body.playlist_id = playlistId;
    const res = await apiFetch("/spotify/save/", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  async getPlaylists() {
    const res = await apiFetch("/spotify/playlists/");
    const data = await res.json();
    if (!res.ok) throw data;
    return data.playlists ?? [];
  },

  async profile() {
    const res = await apiFetch("/spotify/profile/");
    if (res.status === 404 || res.status === 400) return null;
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  async recentlyPlayed(limit = 20) {
    const res = await apiFetch(`/spotify/recently-played/?limit=${limit}`);
    const data = await res.json();
    if (!res.ok) throw data;
    return data.results ?? data;
  },

  async disconnect() {
    const res = await apiFetch("/spotify/disconnect/", { method: "POST" });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async likeTrack(spotifyTrackId) {
    const res = await apiFetch("/spotify/like/", {
      method: "POST",
      body: JSON.stringify({ spotify_track_id: spotifyTrackId }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },
};

// ─── AUDIO ──────────────────────────────────
export async function recordAudio(seconds = 10) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
    ? "audio/webm;codecs=opus"
    : MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : "audio/ogg";

  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks = [];

  return new Promise((resolve, reject) => {
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      resolve(new Blob(chunks, { type: mimeType }));
    };

    recorder.onerror = reject;
    recorder.start(250);
    setTimeout(() => recorder.stop(), seconds * 1000);
  });
}

// ─── ITUNES PREVIEW ─────────────────────────
// FIX: AbortSignal.timeout no existe en todos los browsers — usar AbortController manual
function makeTimeoutSignal(ms) {
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), ms);
  return ctrl.signal;
}

function itunesNorm(s) {
  return (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Busca un preview de iTunes para la canción dada.
 * FIX: Usa el proxy del backend (/api/songs/itunes/) en lugar de llamar
 * directamente a itunes.apple.com — evita errores CORS en móvil y algunos
 * browsers que bloquean el redirect al scheme musics://.
 */
export async function fetchItunesPreview(title, artist) {
  try {
    const term = `${title} ${artist}`;
    const r = await fetch(
      `${BASE_URL}/songs/itunes/?term=${encodeURIComponent(term)}`,
      { signal: makeTimeoutSignal(8000) },
    );
    if (!r.ok) return null;
    const data = await r.json();
    const results = (data.results ?? []).filter((t) => t.previewUrl);
    if (!results.length) return null;

    const tTitle = itunesNorm(title);
    const tArtist = itunesNorm(artist);

    const match = results.find((t) => {
      const rt = itunesNorm(t.trackName);
      const ra = itunesNorm(t.artistName);
      const titleOk =
        rt === tTitle || rt.includes(tTitle) || tTitle.includes(rt);
      const artistWords = tArtist.split(" ").filter((w) => w.length > 2);
      const artistOk =
        ra.includes(tArtist) || artistWords.some((w) => ra.includes(w));
      return titleOk && artistOk;
    });

    return match ? match.previewUrl : null;
  } catch {
    return null;
  }
}
