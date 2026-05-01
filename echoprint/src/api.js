const BASE_URL = "http://127.0.0.1:8000/api";

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

async function apiFetch(path, options = {}) {
  const headers = { ...options.headers };
  const token = getAccess();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  let res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

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

export const songs = {
  async history() {
    const res = await apiFetch("/songs/history/");
    const data = await res.json();
    if (!res.ok) throw data;
    return data.results ?? data;
  },
  async stats() {
    const res = await apiFetch("/songs/stats/");
    if (!res.ok) throw await res.json();
    return res.json();
  },
  // Agrega al historial una canción buscada por texto
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
  // Elimina una entrada del historial por ID
  async deleteHistory(id) {
    const res = await apiFetch(`/songs/history/${id}/delete/`, {
      method: "DELETE",
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },
};

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

export const spotify = {
  /**
   * Búsqueda de canciones en Spotify.
   * Acepta un AbortSignal para cancelar peticiones obsoletas (debounce).
   */
  async search(query, { signal } = {}) {
    if (!query?.trim()) return [];
    const res = await apiFetch(
      `/spotify/search/?q=${encodeURIComponent(query.trim())}`,
      { signal },
    );
    // Si la petición fue abortada, fetch lanza un error — lo dejamos subir.
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

export async function recordAudio(seconds = 10) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
    ? "audio/webm;codecs=opus"
    : "audio/webm";
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
