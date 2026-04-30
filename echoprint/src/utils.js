// ── Fix mojibake: UTF-8 bytes misread as Latin-1 (e.g. "DeBAÃ" → "DEBÍ")
function cleanText(s) {
  if (!s || typeof s !== "string") return s;
  try {
    if (!/[À-ÿ]/.test(s)) return s;
    const bytes = new Uint8Array([...s].map((ch) => ch.charCodeAt(0) & 0xff));
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return s;
  }
}

export function formatDuration(seconds) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDurationMs(ms) {
  if (!ms) return "—";
  return formatDuration(Math.floor(ms / 1000));
}

export function songColor(song) {
  const COLORS = [
    "#ff2d55",
    "#af52de",
    "#ff9500",
    "#30d158",
    "#0a84ff",
    "#64d2ff",
    "#ff6b6b",
    "#ffd93d",
  ];
  const name = song?.artist_name ?? song?.artist?.name ?? song?.artist ?? "";
  if (!name) return COLORS[0];
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return COLORS[Math.abs(hash) % COLORS.length];
}

/**
 * Normaliza una canción que viene del backend (AcoustID → BD).
 *
 * @param {object} raw            Datos crudos del backend
 * @param {number|null} [matchTs] Timestamp de coincidencia en segundos
 *                                (viene del campo match_timestamp_seconds
 *                                 de la respuesta de /api/recognize/, no del song).
 *                                Se incluye aquí para que el componente de
 *                                reproducción pueda usarlo directamente.
 */
export function normalizeSong(raw, matchTs = undefined) {
  if (!raw) return null;
  return {
    id: raw.id,
    title: cleanText(raw.title) ?? "Desconocido",
    artist:
      cleanText(raw.artist_name ?? raw.artist?.name ?? raw.artist) ??
      "Artista desconocido",
    album: cleanText(raw.album_title ?? raw.album?.title ?? raw.album) ?? "",
    genre: raw.genre ?? "",
    duration: formatDuration(raw.duration_seconds),
    cover:
      raw.cover_url ||
      `https://picsum.photos/seed/${encodeURIComponent(raw.title ?? "song")}/400/400`,
    spotify_id: raw.spotify_id ?? null,
    preview_url: raw.spotify_preview_url ?? raw.preview_url ?? null,
    color: songColor(raw),
    // Timestamp donde el fragmento grabado encajó en la canción original.
    // null = no disponible o no aplicable (búsqueda de texto).
    match_timestamp_seconds:
      matchTs !== undefined ? matchTs : (raw.match_timestamp_seconds ?? null),
  };
}

/**
 * Normaliza una canción que viene directo de Spotify (search o recently-played).
 * No toca la BD — solo datos de la API de Spotify formateados.
 */
export function normalizeSongSpotify(raw) {
  if (!raw) return null;

  const artistName =
    raw.artist ?? raw.artists?.[0]?.name ?? "Artista desconocido";
  const albumName = raw.album ?? raw.album?.name ?? "";
  const cover =
    raw.cover_url ??
    raw.album?.images?.[0]?.url ??
    `https://picsum.photos/seed/${encodeURIComponent(raw.title ?? "track")}/400/400`;

  return {
    id: raw.spotify_id ?? raw.id ?? null,
    spotify_id: raw.spotify_id ?? raw.id ?? null,
    title: cleanText(raw.title ?? raw.name) ?? "Desconocido",
    artist: artistName,
    album: albumName,
    genre: raw.genre ?? "",
    duration:
      formatDurationMs(raw.duration_ms) || formatDuration(raw.duration_seconds),
    cover,
    preview_url: raw.preview_url ?? null,
    external_url: raw.external_url ?? null,
    color: songColor({ artist: artistName }),
    // Las canciones de búsqueda textual no tienen timestamp de coincidencia
    match_timestamp_seconds: null,
  };
}
