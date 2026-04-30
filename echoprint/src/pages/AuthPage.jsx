import { useState } from "react";
import { useAuth } from "../AuthContext";

function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
  error,
  autoComplete,
}) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted/80">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/60 w-4 h-4 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          type={isPass ? (show ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full bg-white/5 border rounded-xl py-3 text-sm text-white placeholder-muted/40
            outline-none transition-all duration-200
            ${icon ? "pl-11 pr-4" : "px-4"} ${isPass ? "pr-11" : ""}
            ${error ? "border-red-500/40 focus:border-red-400" : "border-white/8 focus:border-cyan/40 focus:bg-white/8 focus:shadow-[0_0_0_3px_rgba(0,229,255,0.06)]"}`}
        />
        {isPass && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            tabIndex={-1}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted/50 hover:text-muted transition-colors"
          >
            {show ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-red-400/90 text-xs flex items-center gap-1">
          <span>⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}

export default function AuthPage({ onClose }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function validate() {
    const e = {};
    if (mode === "register" && !form.username.trim())
      e.username = "Nombre de usuario requerido";
    if (!form.email.trim()) e.email = "Correo requerido";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Correo inválido";
    if (!form.password) e.password = "Contraseña requerida";
    else if (form.password.length < 8) e.password = "Mínimo 8 caracteres";
    if (mode === "register" && form.password !== form.password2)
      e.password2 = "Las contraseñas no coinciden";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      if (mode === "login") await login(form.email, form.password);
      else await register(form.username, form.email, form.password);
      onClose();
    } catch (err) {
      const msg =
        err?.detail ||
        err?.email?.[0] ||
        err?.password?.[0] ||
        err?.username?.[0] ||
        err?.non_field_errors?.[0];
      setErrors({ general: msg || "Ocurrió un error. Intenta de nuevo." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)" }}
      onClick={onClose}
    >
      {/* Card — two-column on sm+ */}
      <div
        className="w-full max-w-3xl relative animate-slide-up flex rounded-3xl overflow-hidden
        border border-white/10 shadow-2xl"
        style={{
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Left decorative panel (hidden on mobile) ───────────────────── */}
        <div
          className="hidden sm:flex flex-col justify-between w-80 flex-shrink-0 relative overflow-hidden p-8"
          style={{
            background:
              "linear-gradient(135deg, #1a0533 0%, #0a1628 50%, #001a1a 100%)",
          }}
        >
          {/* Orbs */}
          <div className="absolute w-64 h-64 rounded-full bg-violet/30 blur-3xl -top-10 -left-10 pointer-events-none" />
          <div className="absolute w-48 h-48 rounded-full bg-cyan/20 blur-3xl bottom-10 -right-10 pointer-events-none" />

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  className="w-5 h-5"
                >
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <span className="font-display font-black text-lg text-white">
                Echoprint
              </span>
            </div>

            {/* Features list */}
            <div className="flex flex-col gap-5">
              {[
                {
                  icon: (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      className="w-5 h-5 text-cyan"
                    >
                      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                      <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
                    </svg>
                  ),
                  title: "Identifica canciones",
                  desc: "Reconocimiento por audio instantáneo",
                },
                {
                  icon: (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      className="w-5 h-5 text-violet"
                    >
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: "Guarda tu historial",
                  desc: "Todas tus canciones identificadas",
                },
                {
                  icon: (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      className="w-5 h-5 text-cyan"
                    >
                      <path d="M18 20V10M12 20V4M6 20v-6" />
                    </svg>
                  ),
                  title: "Estadísticas",
                  desc: "Tus géneros y artistas favoritos",
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0">
                    {icon}
                  </div>
                  <div className="pt-0.5">
                    <p className="text-white font-semibold text-sm">{title}</p>
                    <p className="text-muted/60 text-xs mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-muted/30 text-xs">
            Echoprint Music © 2024
          </p>
        </div>

        {/* ── Right: Form panel ──────────────────────────────────────────── */}
        <div
          className="flex-1 bg-surface2 flex flex-col overflow-y-auto"
          style={{ maxHeight: "90vh" }}
        >
          {/* Top gradient bar */}
          <div className="h-0.5 w-full gradient-bg flex-shrink-0" />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted hover:text-white transition-all text-sm z-10"
          >
            ✕
          </button>

          <div className="px-7 pt-7 pb-3 sm:pt-10 sm:px-10">
            {/* Mobile logo */}
            <div className="flex items-center gap-2 mb-6 sm:hidden">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  className="w-4 h-4"
                >
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <span className="font-display font-black text-base text-white">
                Echoprint
              </span>
            </div>

            <h1 className="font-display font-black text-2xl text-white mb-1">
              {mode === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta"}
            </h1>
            <p className="text-muted text-sm mb-7">
              {mode === "login"
                ? "Inicia sesión para continuar"
                : "Únete a Echoprint Music"}
            </p>

            {/* Tab switcher */}
            <div className="p-1 rounded-xl bg-surface flex gap-1 mb-7">
              {[
                ["login", "Iniciar sesión"],
                ["register", "Registrarse"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => {
                    setMode(id);
                    setErrors({});
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                    ${mode === id ? "bg-surface2 text-white shadow-sm" : "text-muted hover:text-white"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="px-7 pb-7 sm:px-10 sm:pb-10 flex flex-col gap-4 flex-1"
          >
            {mode === "register" && (
              <InputField
                label="Nombre de usuario"
                value={form.username}
                onChange={set("username")}
                placeholder="tu_usuario"
                autoComplete="username"
                error={errors.username}
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                }
              />
            )}
            <InputField
              label="Correo electrónico"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="tu@correo.com"
              autoComplete="email"
              error={errors.email}
              icon={
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              }
            />
            <InputField
              label="Contraseña"
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="Mínimo 8 caracteres"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              error={errors.password}
              icon={
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              }
            />
            {mode === "register" && (
              <InputField
                label="Confirmar contraseña"
                type="password"
                value={form.password2}
                onChange={set("password2")}
                placeholder="Repite tu contraseña"
                autoComplete="new-password"
                error={errors.password2}
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
              />
            )}

            {errors.general && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4 flex-shrink-0"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errors.general}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="relative w-full gradient-bg text-white font-display font-bold text-base py-3.5 rounded-xl
                transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]
                disabled:opacity-60 disabled:cursor-not-allowed glow-cyan mt-1 overflow-hidden"
            >
              {loading && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="animate-spin w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="white"
                      strokeWidth="3"
                      strokeOpacity="0.25"
                    />
                    <path
                      d="M22 12a10 10 0 01-10 10"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              )}
              <span className={loading ? "opacity-0" : ""}>
                {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </span>
            </button>

            <div className="flex items-center gap-3 my-0.5">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-muted/50 text-xs">
                o continúa sin cuenta
              </span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl text-sm font-medium text-muted border border-white/10 hover:border-white/20 hover:text-white hover:bg-white/5 transition-all"
            >
              Explorar sin iniciar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
