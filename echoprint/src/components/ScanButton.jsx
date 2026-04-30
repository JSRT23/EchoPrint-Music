export default function ScanButton({ scanning, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={scanning ? "Escuchando..." : "Escanear canción"}
      className="relative flex flex-col items-center gap-4 bg-transparent border-0 cursor-pointer disabled:cursor-wait group"
    >
      {/* Rings */}
      <div
        className={`absolute inset-0 flex items-center justify-content-center pointer-events-none scan-btn--${scanning ? "active" : "idle"}`}
      >
        {[120, 160, 200].map((size, i) => (
          <span
            key={i}
            className="scan-ring absolute"
            style={{
              width: size,
              height: size,
              marginLeft: -size / 2,
              marginTop: -size / 2,
              left: "50%",
              top: "50%",
              animationDelay: `${i * 0.6}s`,
            }}
          />
        ))}
      </div>

      {/* Circle button */}
      <div
        className={`
          relative z-10 w-24 h-24 rounded-full gradient-bg
          flex items-center justify-center
          transition-all duration-200
          glow-cyan
          ${scanning ? "animate-pulse" : "group-hover:scale-105 group-hover:glow-cyan-lg"}
        `}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-10 h-10"
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>

      {/* Label */}
      <span
        className={`
          relative z-10 font-display font-bold text-xs tracking-widest uppercase
          transition-colors duration-200
          ${scanning ? "text-cyan" : "text-muted group-hover:text-white"}
        `}
      >
        {scanning ? "Escuchando…" : "Escanear"}
      </span>
    </button>
  );
}
