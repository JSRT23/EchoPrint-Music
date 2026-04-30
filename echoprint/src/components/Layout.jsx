import { useState } from "react";
import { useAuth } from "../AuthContext";

export default function Layout({
  activeTab,
  onTabChange,
  historyCount,
  onShowAuth,
  children,
}) {
  const { user, logout } = useAuth();
  const [mobileMenu, setMobileMenu] = useState(false);

  const tabs = [
    {
      id: "discover",
      label: "Descubrir",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-4 h-4"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      id: "history",
      label: "Historial",
      badge: historyCount,
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-4 h-4"
        >
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    ...(user
      ? [
          {
            id: "stats",
            label: "Perfil",
            icon: (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4"
              >
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-bg text-white font-body">
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b border-subtle">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div
            className="flex items-center gap-2.5 font-display font-black text-lg tracking-tight flex-shrink-0 cursor-pointer"
            onClick={() => onTabChange("discover")}
          >
            <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center glow-cyan">
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
            <span className="gradient-text hidden sm:block">Echoprint</span>
            <span className="text-white/40 font-normal text-sm hidden sm:block">
              Music
            </span>
            <span className="gradient-text hidden xs:block">Echoprint</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    activeTab === tab.id
                      ? "text-cyan bg-cyan/10 border border-cyan/20"
                      : "text-muted hover:text-white hover:bg-white/5"
                  }`}
              >
                {tab.icon}
                {tab.label}
                {tab.badge > 0 && (
                  <span className="bg-cyan text-bg text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Auth + mobile toggle */}
          <div className="flex items-center gap-2">
            {user ? (
              <button
                onClick={logout}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-surface2 border border-subtle hover:border-white/15 transition-all duration-200"
              >
                <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-black font-bold text-xs">
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium hidden sm:block">
                  {user.username}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-3.5 h-3.5 text-muted hidden sm:block"
                >
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
              </button>
            ) : (
              <button
                onClick={onShowAuth}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-cyan bg-cyan/10 border border-cyan/20 hover:bg-cyan/20 transition-all duration-200"
              >
                Entrar
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              className="sm:hidden w-9 h-9 rounded-xl flex items-center justify-center text-muted hover:text-white hover:bg-white/5 transition-all"
              onClick={() => setMobileMenu((v) => !v)}
              aria-label="Menú"
            >
              {mobileMenu ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="sm:hidden border-t border-subtle bg-surface/95 backdrop-blur-xl px-4 py-3 flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  setMobileMenu(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left
                  ${
                    activeTab === tab.id
                      ? "text-cyan bg-cyan/10 border border-cyan/20"
                      : "text-muted hover:text-white hover:bg-white/5"
                  }`}
              >
                {tab.icon}
                {tab.label}
                {tab.badge > 0 && (
                  <span className="ml-auto bg-cyan text-bg text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-28">{children}</main>
    </div>
  );
}
