import { useState } from 'react';
import { login, register } from './api';
import './App.css';

/* ------------------------------------------------------------------ */
/*  Fonts — add this to index.html <head>:                            */
/*  <link rel="preconnect" href="https://fonts.googleapis.com">       */
/*  <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet"> */
/* ------------------------------------------------------------------ */

const DISPLAY = "'Archivo Black', 'Arial Black', sans-serif";
const BODY = "'Manrope', 'Inter', system-ui, sans-serif";

const STYLES = [
  { id: "bold", name: "Bold Reaction", swatch: "#FFB627" },
  { id: "minimal", name: "Clean Minimal", swatch: "#2FD9C4" },
  { id: "tech", name: "Tech Review", swatch: "#5B8CFF" },
  { id: "vlog", name: "Vlog Diary", swatch: "#FF7A9C" },
  { id: "gaming", name: "Neon Gaming", swatch: "#B980FF" },
  { id: "tutorial", name: "Clear Tutorial", swatch: "#8FE388" },
];

const HISTORY = [
  { id: 1, title: "How I built a $10k/mo SaaS", style: "Bold Reaction", ctr: "9.1%", grade: "A", when: "2h ago" },
  { id: 2, title: "React vs Vue in 2026", style: "Tech Review", ctr: "7.8%", grade: "B+", when: "1d ago" },
  { id: 3, title: "My morning routine as a founder", style: "Vlog Diary", ctr: "6.4%", grade: "B", when: "3d ago" },
  { id: 4, title: "Speedrunning FastAPI", style: "Neon Gaming", ctr: "8.9%", grade: "A-", when: "5d ago" },
];

const PLANS = [
  { id: "starter", name: "STARTER", credits: 20, price: "$5", tag: null },
  { id: "pro", name: "PRO", credits: 100, price: "$18", tag: "MOST POPULAR" },
  { id: "studio", name: "STUDIO", credits: 300, price: "$45", tag: "BEST VALUE" },
];

const SprocketRule = ({ className = "" }) => (
  <div
    aria-hidden="true"
    className={`h-[6px] w-full ${className}`}
    style={{
      backgroundImage: "radial-gradient(circle, #2A2E36 1.4px, transparent 1.6px)",
      backgroundSize: "13px 6px",
      backgroundRepeat: "repeat-x",
      backgroundPosition: "left center",
    }}
  />
);

const GradeStamp = ({ label, value, tone = "amber", size = 84 }) => {
  const colors = {
    amber: "border-[#FFB627]/70 text-[#FFB627]",
    teal: "border-[#2FD9C4]/70 text-[#2FD9C4]",
    blue: "border-[#5B8CFF]/70 text-[#5B8CFF]",
  };
  return (
    <div
      className={`inline-flex shrink-0 flex-col items-center justify-center rounded-full border-2 border-dashed rotate-[-7deg] ${colors[tone]}`}
      style={{ width: size, height: size }}
    >
      {label && (
        <span className="font-mono text-[8px] tracking-[0.18em] leading-none text-center px-2">
          {label}
        </span>
      )}
      <span className="text-lg font-black leading-none mt-1.5" style={{ fontFamily: DISPLAY }}>
        {value}
      </span>
    </div>
  );
};

const IconUpload = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <path d="M12 16V4M12 4l-4 4M12 4l4 4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconLock = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" strokeLinecap="round" />
  </svg>
);
const IconLogout = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconTrend = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <path d="M3 17l6-6 4 4 8-8M21 7h-6v6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconFilm = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M7 5v14M17 5v14M3 9h4M17 9h4M3 15h4M17 15h4" strokeLinecap="round" />
  </svg>
);
const IconBolt = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconCheck = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="bg-[#15171C] border border-[#2A2E36] rounded-xl p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-[#0E0F11] border border-[#2A2E36] flex items-center justify-center text-[#FFB627] shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-mono text-[10px] tracking-[0.13em] text-[#8A8F98] truncate">{label}</p>
        <p className="text-lg font-black leading-tight" style={{ fontFamily: DISPLAY }}>
          {value}
          {sub && <span className="text-xs font-normal text-[#5F636D] ml-1.5" style={{ fontFamily: BODY }}>{sub}</span>}
        </p>
      </div>
    </div>
  );
}

function App() {
  const [prompt, setPrompt] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [activeTab, setActiveTab] = useState("generate");
  const [selectedStyle, setSelectedStyle] = useState("bold");

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("token");
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    if (!isLoginMode && password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }
    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      setIsAuthenticated(true);
      setIsAuthModalOpen(false);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  const closeModal = () => {
    setIsAuthModalOpen(false);
    setAuthError("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const TABS = [
    { id: "generate", label: "Generate" },
    { id: "history", label: "History" },
    { id: "billing", label: "Billing" },
  ];

  return (
    <div
      className="min-h-screen text-[#F1EEE6] p-6 md:p-12 relative overflow-hidden"
      style={{ fontFamily: BODY, backgroundColor: "#0E0F11" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(1100px 520px at 15% -8%, rgba(255,182,39,0.08), transparent 60%), radial-gradient(900px 480px at 100% 10%, rgba(47,217,196,0.06), transparent 55%)",
        }}
      />

      {/* --- AUTH MODAL --- */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer" onClick={closeModal} />
          <div className="bg-[#15171C] border border-[#2A2E36] rounded-2xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden animate-[popIn_0.3s_cubic-bezier(0.16,1,0.3,1)]">
            <SprocketRule />
            <div className="p-8">
              <button
                onClick={closeModal}
                className="absolute top-5 right-5 text-[#7A7F89] hover:text-[#F1EEE6] hover:rotate-90 transition-all duration-200"
                aria-label="Close"
              >
                ✕
              </button>

              <div className="mb-6">
                <span className="font-mono text-[10px] tracking-[0.2em] text-[#FFB627]">
                  {isLoginMode ? "ACCOUNT ACCESS" : "NEW ACCOUNT"}
                </span>
                <h2 className="text-2xl font-black mt-2 leading-tight" style={{ fontFamily: DISPLAY }}>
                  {isLoginMode ? "Welcome back" : "Start creating"}
                </h2>
                <p className="text-sm text-[#8A8F98] mt-2 flex items-center gap-1.5">
                  {isLoginMode ? "Sign in to reach your workspace" : (
                    <span className="text-[#2FD9C4] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2FD9C4]" />
                      5 free credits on signup
                    </span>
                  )}
                </p>
              </div>

              {authError && (
                <div className="bg-[#FF5D5D]/10 border border-[#FF5D5D]/40 text-[#FF9B9B] px-3 py-2.5 rounded-lg text-sm mb-4 animate-[shake_0.4s_ease-in-out]">
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label className="block font-mono text-[10px] tracking-[0.15em] text-[#8A8F98] mb-1.5">EMAIL</label>
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0E0F11] border border-[#2A2E36] rounded-lg px-3.5 py-3 text-sm focus:outline-none focus:border-[#FFB627] focus:ring-1 focus:ring-[#FFB627] transition-all duration-150"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] tracking-[0.15em] text-[#8A8F98] mb-1.5">PASSWORD</label>
                  <input
                    type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0E0F11] border border-[#2A2E36] rounded-lg px-3.5 py-3 text-sm focus:outline-none focus:border-[#FFB627] focus:ring-1 focus:ring-[#FFB627] transition-all duration-150"
                  />
                </div>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isLoginMode ? "max-h-0 opacity-0" : "max-h-24 opacity-100"}`}>
                  <label className="block font-mono text-[10px] tracking-[0.15em] text-[#8A8F98] mb-1.5">CONFIRM PASSWORD</label>
                  <input
                    type="password" required={!isLoginMode} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#0E0F11] border border-[#2A2E36] rounded-lg px-3.5 py-3 text-sm focus:outline-none focus:border-[#FFB627] focus:ring-1 focus:ring-[#FFB627] transition-all duration-150"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#FFB627] hover:bg-[#FFC552] text-[#0E0F11] font-bold py-3 rounded-lg transition-all duration-150 mt-2 active:scale-[0.98]"
                  style={{ fontFamily: DISPLAY, letterSpacing: "0.01em" }}
                >
                  {isLoginMode ? "SIGN IN" : "CREATE ACCOUNT"}
                </button>
              </form>

              <p className="text-center text-sm text-[#8A8F98] mt-6 border-t border-[#2A2E36] pt-6">
                {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => { setIsLoginMode(!isLoginMode); setAuthError(""); }}
                  className="text-[#2FD9C4] hover:text-[#F1EEE6] transition-colors duration-150 font-semibold"
                >
                  {isLoginMode ? "Sign up" : "Log in"}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="max-w-7xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-base shrink-0"
              style={{ fontFamily: DISPLAY, background: "linear-gradient(135deg, #FFB627, #FF8A3D)", color: "#0E0F11" }}
            >
              T
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none" style={{ fontFamily: DISPLAY }}>
                THUMBMAKER
              </h1>
              <p className="font-mono text-[10px] tracking-[0.15em] text-[#8A8F98] mt-1">
                AI THUMBNAILS, TUNED FOR THE CLICK
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center gap-2 bg-[#15171C] px-4 py-2 rounded-full border border-[#2A2E36]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2FD9C4]" />
                  <span className="text-xs text-[#8A8F98]">Balance</span>
                  <span className="font-mono text-xs font-semibold text-[#F1EEE6]">5 CR</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 border border-[#2A2E36] text-[#B8BCC4] px-4 py-2 rounded-full text-sm hover:border-[#3A3F49] hover:text-[#F1EEE6] transition-colors"
                >
                  <IconLogout className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-[#F1EEE6] text-[#0E0F11] px-5 py-2 rounded-full text-sm font-bold hover:bg-white transition-colors"
              >
                Sign in
              </button>
            )}
          </div>
        </div>

        {/* Tab nav */}
        <nav className="flex items-center gap-1 mb-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "bg-[#15171C] text-[#F1EEE6] border border-[#2A2E36]"
                  : "text-[#8A8F98] hover:text-[#F1EEE6] border border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <SprocketRule />
      </header>

      {/* --- GENERATE TAB --- */}
      {activeTab === "generate" && (
        <>
          <section className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 relative z-10">
            <StatCard icon={<IconFilm className="w-4.5 h-4.5" />} label="THUMBNAILS MADE" value="47" />
            <StatCard icon={<IconTrend className="w-4.5 h-4.5" />} label="AVG PREDICTED CTR" value="8.1%" />
            <StatCard icon={<IconBolt className="w-4.5 h-4.5" />} label="CREDITS LEFT" value="5" />
            <StatCard icon={<IconCheck className="w-4.5 h-4.5" />} label="BEST GRADE" value="A" sub="this month" />
          </section>

          <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 relative z-10">
            <section className="lg:col-span-4">
              <div className="bg-[#15171C] border border-[#2A2E36] rounded-2xl relative overflow-hidden">
                {!isAuthenticated && (
                  <div className="absolute inset-0 bg-[#0E0F11]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-11 h-11 rounded-full border border-[#2A2E36] flex items-center justify-center mb-4 text-[#FFB627]">
                      <IconLock className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold mb-1.5" style={{ fontFamily: DISPLAY }}>SIGN IN TO GENERATE</h3>
                    <p className="text-sm text-[#8A8F98] mb-5 max-w-[26ch]">
                      Create an account to upload a source image and spend credits.
                    </p>
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="bg-[#FFB627] hover:bg-[#FFC552] text-[#0E0F11] px-6 py-2.5 rounded-full font-bold text-sm transition-transform active:scale-95"
                    >
                      Create account
                    </button>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-[10px] tracking-[0.15em] text-[#FFB627]">GENERATE</span>
                    <GradeStamp label="AVG PREDICTED CTR" value="8.4%" tone="amber" />
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="font-mono text-[10px] tracking-[0.15em] text-[#8A8F98] mb-2.5">STEP 01 — SOURCE</p>
                      <div className="border-2 border-dashed border-[#2A2E36] hover:border-[#FFB627] hover:bg-[#FFB627]/5 transition-all duration-200 rounded-xl h-28 flex flex-col items-center justify-center cursor-pointer bg-[#0E0F11]/50">
                        <IconUpload className="w-5 h-5 text-[#8A8F98] mb-2" />
                        <span className="text-[#B8BCC4] text-sm">Upload a headshot</span>
                        <span className="text-xs text-[#5F636D] mt-0.5">PNG or JPG, up to 5MB</span>
                      </div>
                    </div>

                    <div>
                      <p className="font-mono text-[10px] tracking-[0.15em] text-[#8A8F98] mb-2.5">STEP 02 — STYLE</p>
                      <div className="flex flex-wrap gap-2">
                        {STYLES.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setSelectedStyle(s.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                              selectedStyle === s.id
                                ? "border-[#FFB627] bg-[#FFB627]/10 text-[#F1EEE6]"
                                : "border-[#2A2E36] text-[#8A8F98] hover:border-[#3A3F49]"
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.swatch }} />
                            {s.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="font-mono text-[10px] tracking-[0.15em] text-[#8A8F98] mb-2.5">STEP 03 — CONCEPT</p>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. How I built a $10k/mo SaaS in 30 days..."
                        className="w-full bg-[#0E0F11] border border-[#2A2E36] rounded-xl p-3.5 text-sm focus:outline-none focus:border-[#FFB627] focus:ring-1 focus:ring-[#FFB627] transition-all duration-150 resize-none h-24 placeholder:text-[#5F636D]"
                      />
                    </div>

                    <button
                      className="w-full bg-[#FFB627] hover:bg-[#FFC552] text-[#0E0F11] font-bold py-3.5 rounded-xl transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2"
                      style={{ fontFamily: DISPLAY, letterSpacing: "0.01em" }}
                    >
                      GENERATE
                      <span className="font-mono text-[10px] bg-[#0E0F11]/15 px-2 py-1 rounded-full tracking-normal">− 3 CR</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="lg:col-span-8">
              <div className="bg-[#15171C]/60 border border-[#2A2E36] rounded-2xl p-6 min-h-[600px]">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-mono text-[10px] tracking-[0.15em] text-[#8A8F98]">RECENT CUTS</span>
                  <button
                    onClick={() => setActiveTab("history")}
                    className="text-xs text-[#2FD9C4] hover:text-[#F1EEE6] font-medium transition-colors"
                  >
                    View all →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-min">
                  <div className="md:col-span-2 rounded-xl bg-[#0E0F11] border border-[#2A2E36] relative overflow-hidden group min-h-[260px] flex flex-col items-center justify-center gap-4 hover:border-[#3A3F49] transition-colors duration-200">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:animate-[shimmer_1.4s_ease-in-out]" />
                    <GradeStamp label="NOTHING GRADED YET" value="—" tone="teal" />
                    <p className="text-[#5F636D] text-sm">Your first generation will land here</p>
                  </div>
                  {HISTORY.slice(0, 3).map((h) => (
                    <div
                      key={h.id}
                      className="rounded-xl bg-[#0E0F11] border border-[#2A2E36] p-4 flex items-center justify-between hover:border-[#3A3F49] transition-colors duration-200 min-h-[110px]"
                    >
                      <div className="min-w-0 pr-3">
                        <p className="text-sm font-semibold truncate">{h.title}</p>
                        <p className="font-mono text-[10px] text-[#8A8F98] mt-1.5">{h.style} · {h.when}</p>
                      </div>
                      <GradeStamp value={h.grade} tone="amber" size={54} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </main>
        </>
      )}

      {/* --- HISTORY TAB --- */}
      {activeTab === "history" && (
        <main className="max-w-7xl mx-auto mt-8 relative z-10">
          <div className="bg-[#15171C]/60 border border-[#2A2E36] rounded-2xl overflow-hidden">
            <div className="p-6 pb-0">
              <span className="font-mono text-[10px] tracking-[0.15em] text-[#8A8F98]">ALL GENERATIONS</span>
            </div>
            <div className="divide-y divide-[#2A2E36] mt-4">
              {HISTORY.map((h) => (
                <div key={h.id} className="flex items-center justify-between px-6 py-4 hover:bg-[#0E0F11]/40 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <GradeStamp value={h.grade} tone="amber" size={48} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{h.title}</p>
                      <p className="font-mono text-[10px] text-[#8A8F98] mt-1">{h.style} · {h.when}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-4">
                    <p className="font-mono text-sm font-semibold text-[#2FD9C4]">{h.ctr}</p>
                    <p className="text-[10px] text-[#5F636D] mt-0.5">predicted CTR</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* --- BILLING TAB --- */}
      {activeTab === "billing" && (
        <main className="max-w-7xl mx-auto mt-8 relative z-10">
          <div className="bg-[#15171C] border border-[#2A2E36] rounded-2xl p-6 mb-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="font-mono text-[10px] tracking-[0.15em] text-[#8A8F98]">CURRENT BALANCE</span>
              <p className="text-3xl font-black mt-1" style={{ fontFamily: DISPLAY }}>5 CREDITS</p>
            </div>
            <div className="w-full sm:w-64">
              <div className="h-2 rounded-full bg-[#0E0F11] border border-[#2A2E36] overflow-hidden">
                <div className="h-full bg-[#FFB627] rounded-full" style={{ width: "17%" }} />
              </div>
              <p className="text-xs text-[#5F636D] mt-1.5">5 / 30 used this cycle</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-[#15171C] border rounded-2xl p-6 flex flex-col ${
                  plan.tag ? "border-[#FFB627]" : "border-[#2A2E36]"
                }`}
              >
                {plan.tag && (
                  <span className="absolute -top-3 left-6 bg-[#FFB627] text-[#0E0F11] text-[10px] font-mono tracking-[0.1em] px-2.5 py-1 rounded-full">
                    {plan.tag}
                  </span>
                )}
                <span className="font-mono text-[10px] tracking-[0.15em] text-[#8A8F98]">{plan.name}</span>
                <p className="text-3xl font-black mt-2" style={{ fontFamily: DISPLAY }}>{plan.price}</p>
                <p className="text-sm text-[#8A8F98] mt-1 mb-6">{plan.credits} credits</p>
                <button
                  className={`mt-auto w-full py-2.5 rounded-lg text-sm font-bold transition-all active:scale-[0.98] ${
                    plan.tag
                      ? "bg-[#FFB627] hover:bg-[#FFC552] text-[#0E0F11]"
                      : "border border-[#2A2E36] text-[#F1EEE6] hover:border-[#3A3F49]"
                  }`}
                >
                  Buy pack
                </button>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* --- FOOTER --- */}
      <footer className="max-w-7xl mx-auto mt-16 pt-6 relative z-10">
        <SprocketRule className="mb-6" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#5F636D]">
          <p>© 2026 ThumbMaker. Built for creators who need the click.</p>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-[#F1EEE6] transition-colors">Docs</a>
            <a href="#" className="hover:text-[#F1EEE6] transition-colors">Support</a>
            <a href="#" className="hover:text-[#F1EEE6] transition-colors">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;