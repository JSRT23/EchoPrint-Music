/**
 * ScanErrorModal
 * type: "no_match" | "mic_error" | "humming_no_match"
 */
export default function ScanErrorModal({
  type = "no_match",
  onRetry,
  onClose,
}) {
  const config = {
    no_match: {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-10 h-10 text-violet"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
          />
        </svg>
      ),
      accent: "rgba(175,82,222,0.15)",
      border: "rgba(175,82,222,0.25)",
      title: "Canción no encontrada",
      lines: [
        "No logramos identificar ninguna canción en ese fragmento.",
        "Asegúrate de que haya música sonando cerca del micrófono.",
      ],
      tips: [
        { icon: <MicIcon />, text: "Acerca el teléfono a la fuente de sonido" },
        {
          icon: <VolumeIcon />,
          text: "Sube el volumen si la canción es muy baja",
        },
        { icon: <WifiIcon />, text: "Verifica tu conexión a internet" },
      ],
      retryLabel: "Intentar de nuevo",
    },
    humming_no_match: {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-10 h-10 text-cyan"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
          />
        </svg>
      ),
      accent: "rgba(0,229,255,0.1)",
      border: "rgba(0,229,255,0.2)",
      title: "Melodía no identificada",
      lines: [
        "No pudimos identificar la melodía.",
        "Para mejores resultados, prueba tararear el coro claramente durante los 10 segundos completos, o usa el botón de escaneo con la canción sonando.",
      ],
      tips: [
        { icon: <MusicIcon />, text: "Tararea el coro, no el verso" },
        {
          icon: <TimerIcon />,
          text: "Mantén la melodía los 10 segundos completos",
        },
        { icon: <MicIcon />, text: 'Haz "mmm" siguiendo el tono exacto' },
      ],
      retryLabel: "Volver a cantar / tararear",
    },
    mic_error: {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-10 h-10 text-red-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
          />
          <line
            x1="4"
            y1="4"
            x2="20"
            y2="20"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
      accent: "rgba(239,68,68,0.12)",
      border: "rgba(239,68,68,0.22)",
      title: "Sin acceso al micrófono",
      lines: [
        "Echoprint necesita permiso para acceder al micrófono.",
        "Revisa la configuración de permisos del navegador e intenta de nuevo.",
      ],
      tips: null,
      retryLabel: "Reintentar",
    },
  };

  const { icon, accent, border, title, lines, tips, retryLabel } =
    config[type] ?? config.no_match;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(16px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm relative animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div
          className="absolute -inset-3 rounded-3xl opacity-20 blur-2xl pointer-events-none"
          style={{ background: accent }}
        />

        <div
          className="relative rounded-2xl overflow-hidden border"
          style={{
            background: "#14142a",
            borderColor: border,
            boxShadow: `0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px ${border}`,
          }}
        >
          <div
            className="h-0.5 w-full"
            style={{
              background: `linear-gradient(90deg,transparent,${border},transparent)`,
            }}
          />

          <div className="px-7 py-8 flex flex-col items-center text-center gap-5">
            {/* Icon */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: accent, border: `1px solid ${border}` }}
            >
              {icon}
            </div>

            {/* Text */}
            <div className="flex flex-col gap-2">
              <h2 className="font-display font-black text-xl text-white">
                {title}
              </h2>
              {lines.map((l, i) => (
                <p
                  key={i}
                  className="text-sm leading-relaxed"
                  style={{
                    color:
                      i === 0
                        ? "rgba(255,255,255,0.65)"
                        : "rgba(255,255,255,0.4)",
                  }}
                >
                  {l}
                </p>
              ))}
            </div>

            {/* Tips */}
            {tips && (
              <div
                className="w-full rounded-xl px-4 py-3 flex flex-col gap-2"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {tips.map(({ icon: ic, text }) => (
                  <div key={text} className="flex items-center gap-2.5">
                    <span className="text-muted/50 flex-shrink-0">{ic}</span>
                    <span className="text-xs text-muted/60">{text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2.5 w-full mt-1">
              <button
                onClick={onRetry}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl
                  font-display font-bold text-sm text-white gradient-bg
                  transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] glow-cyan"
              >
                <RetryIcon />
                {retryLabel}
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl text-sm font-medium transition-all
                  hover:bg-white/5 hover:text-white"
                style={{
                  color: "rgba(255,255,255,0.35)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                Cancelar
              </button>
            </div>
          </div>

          <div
            className="h-0.5 w-full"
            style={{
              background: `linear-gradient(90deg,transparent,${border},transparent)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function RetryIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
    </svg>
  );
}
function MicIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className="w-3.5 h-3.5"
    >
      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
      <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
    </svg>
  );
}
function VolumeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className="w-3.5 h-3.5"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
    </svg>
  );
}
function WifiIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className="w-3.5 h-3.5"
    >
      <path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" />
    </svg>
  );
}
function MusicIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className="w-3.5 h-3.5"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}
function TimerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className="w-3.5 h-3.5"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
