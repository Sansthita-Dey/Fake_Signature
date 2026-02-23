import { useState, useRef, useEffect } from "react";

const LANGUAGES = [
    { value: "hindi", label: "Hindi", script: "हिन्दी" },
    { value: "bengali", label: "Bengali", script: "বাংলা" },
];

const API_URL = "http://localhost:8000/predict";

/* ── Shimmer / pulse for skeleton ── */
const shimmerStyle = `
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
`;

export default function App() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [language, setLanguage] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [barWidth, setBarWidth] = useState(0);
    const [hoverBtn, setHoverBtn] = useState(false);
    const fileInputRef = useRef(null);

    /* Animate bar after result arrives */
    useEffect(() => {
        if (result) {
            setBarWidth(0);
            const t = setTimeout(() => setBarWidth(result.confidence), 60);
            return () => clearTimeout(t);
        }
    }, [result]);

    const handleFile = (selected) => {
        if (!selected) return;
        setFile(selected);
        setResult(null);
        setBarWidth(0);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(selected);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped && dropped.type.startsWith("image/")) handleFile(dropped);
    };

    const handleVerify = async () => {
        if (!file || !language) return;
        setLoading(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("language", language);

            const response = await fetch(API_URL, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData?.error || `Server error: ${response.status}`);
            }

            const data = await response.json();
            setResult({ label: data.prediction, confidence: data.confidence });
        } catch (err) {
            console.error("API error:", err);
            setResult({ label: "Error", confidence: 0, errorMsg: err.message });
        } finally {
            setLoading(false);
        }
    };

    const canVerify = file && language && !loading;
    const isError = result?.label === "Error";
    const isGenuine = !isError && result?.label === "Genuine";
    const selectedLang = LANGUAGES.find((l) => l.value === language);

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        body {
          font-family: 'Inter', sans-serif;
          background: #0a0a1a;
          -webkit-font-smoothing: antialiased;
        }
        select option { background: #1e1b4b; color: #e0e7ff; }

        ${shimmerStyle}

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes floatA {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(20px) rotate(-5deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(139,92,246,0.5); }
          70%  { box-shadow: 0 0 0 12px rgba(139,92,246,0); }
          100% { box-shadow: 0 0 0 0 rgba(139,92,246,0); }
        }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(139,92,246,0.4); }
          50%       { border-color: rgba(99,102,241,0.8); }
        }

        .upload-zone:hover { border-color: rgba(139,92,246,0.7) !important; background: rgba(139,92,246,0.06) !important; }
        .upload-zone { transition: all 0.25s ease; }

        .lang-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
          border-radius: 10px;
          cursor: pointer;
          border: 1.5px solid transparent;
          transition: all 0.2s;
          background: rgba(255,255,255,0.03);
          color: #cbd5e1;
          font-size: 14px;
          font-weight: 500;
        }
        .lang-option:hover { background: rgba(139,92,246,0.12); border-color: rgba(139,92,246,0.4); color: #e0e7ff; }
        .lang-option.selected { background: rgba(139,92,246,0.18); border-color: rgba(139,92,246,0.7); color: #c4b5fd; }

        .verify-btn {
          width: 100%;
          padding: 15px;
          border-radius: 14px;
          border: none;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.03em;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
          color: #fff;
          box-shadow: 0 6px 28px rgba(139,92,246,0.45);
        }
        .verify-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 36px rgba(139,92,246,0.6);
        }
        .verify-btn:active:not(:disabled) { transform: translateY(0); }
        .verify-btn:disabled {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.25);
          cursor: not-allowed;
          box-shadow: none;
          animation: none;
        }

        .remove-btn {
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.3);
          color: #f87171;
          border-radius: 8px;
          padding: 4px 10px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .remove-btn:hover { background: rgba(239,68,68,0.22); }

        .result-anim { animation: fadeUp 0.4s cubic-bezier(0.22, 1, 0.36, 1); }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.4); border-radius: 4px; }
      `}</style>

            {/* ── Page ── */}
            <div style={S.page}>

                {/* Ambient blobs */}
                <div style={{ ...S.blob, ...S.blob1 }} />
                <div style={{ ...S.blob, ...S.blob2 }} />
                <div style={{ ...S.blob, ...S.blob3 }} />

                {/* ── Header ── */}
                <header style={S.header}>
                    <div style={S.logo}>
                        <span style={S.logoIcon}>✦</span>
                        <span style={S.logoText}>SignVerify</span>
                    </div>
                    <div style={S.pill}>AI-Powered · v2.0</div>
                </header>

                {/* ── Main ── */}
                <main style={S.main}>
                    <div style={S.card}>

                        {/* Card glow border */}
                        <div style={S.cardGlow} />

                        {/* ── Hero ── */}
                        <div style={S.hero}>
                            <div style={S.iconRing}>
                                <span style={S.heroIcon}>🖊</span>
                            </div>
                            <h1 style={S.title}>Signature Verification</h1>
                            <p style={S.subtitle}>
                                Upload a handwritten signature and our AI will analyze its authenticity in seconds.
                            </p>
                        </div>

                        {/* ── Divider ── */}
                        <div style={S.divider} />

                        {/* ── Upload ── */}
                        <div style={S.section}>
                            <label style={S.sectionLabel}>
                                <span style={S.labelDot} />
                                Upload Signature
                            </label>

                            {!preview ? (
                                <div
                                    className="upload-zone"
                                    style={{
                                        ...S.uploadZone,
                                        ...(dragActive ? S.uploadZoneActive : {}),
                                    }}
                                    onClick={() => fileInputRef.current.click()}
                                    onDragEnter={() => setDragActive(true)}
                                    onDragLeave={() => setDragActive(false)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={(e) => handleFile(e.target.files[0])}
                                    />
                                    <div style={S.uploadIconCircle}>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="17 8 12 3 7 8" />
                                            <line x1="12" y1="3" x2="12" y2="15" />
                                        </svg>
                                    </div>
                                    <p style={S.uploadTitle}>Drop your signature here</p>
                                    <p style={S.uploadSub}>or <span style={S.uploadLink}>browse files</span></p>
                                    <p style={S.uploadHint}>PNG · JPG · JPEG · up to 5 MB</p>
                                </div>
                            ) : (
                                <div style={S.previewCard}>
                                    <img src={preview} alt="Signature preview" style={S.previewImg} />
                                    <div style={S.previewMeta}>
                                        <div style={S.previewFileName}>{file.name}</div>
                                        <div style={S.previewSize}>{(file.size / 1024).toFixed(1)} KB</div>
                                    </div>
                                    <button
                                        className="remove-btn"
                                        onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                                    >
                                        ✕ Remove
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ── Language ── */}
                        <div style={S.section}>
                            <label style={S.sectionLabel}>
                                <span style={S.labelDot} />
                                Script Language
                            </label>
                            <div style={S.langGrid}>
                                {LANGUAGES.map((l) => (
                                    <div
                                        key={l.value}
                                        className={`lang-option${language === l.value ? " selected" : ""}`}
                                        onClick={() => setLanguage(l.value)}
                                    >
                                        <span style={S.langScript}>{l.script}</span>
                                        <span>{l.label}</span>
                                        {language === l.value && <span style={S.langCheck}>✓</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Verify Button ── */}
                        <button
                            className="verify-btn"
                            disabled={!canVerify}
                            onClick={handleVerify}
                        >
                            {loading ? (
                                <span style={S.spinRow}>
                                    <span style={S.spinner} />
                                    Analyzing signature…
                                </span>
                            ) : (
                                "Verify Signature →"
                            )}
                        </button>

                        {/* ── Result ── */}
                        {result && (
                            <div
                                className="result-anim"
                                style={{
                                    ...S.resultCard,
                                    ...(isError ? S.resultError : isGenuine ? S.resultGenuine : S.resultForged),
                                }}
                            >
                                {/* Top row */}
                                <div style={S.resultTop}>
                                    <div>
                                        <div style={S.resultMeta}>
                                            {selectedLang?.label} Script · AI Analysis
                                        </div>
                                        <div
                                            style={{
                                                ...S.verdictBadge,
                                                ...(isError ? S.verdictError : isGenuine ? S.verdictGenuine : S.verdictForged),
                                            }}
                                        >
                                            <span>{isError ? "⚠" : isGenuine ? "✔" : "✘"}</span>
                                            <span>{isError ? "Analysis Failed" : result.label + " Signature"}</span>
                                        </div>
                                    </div>
                                    {!isError && (
                                        <div style={S.scoreCircle}>
                                            <span style={S.scoreValue}>{result.confidence.toFixed(0)}</span>
                                            <span style={S.scoreUnit}>%</span>
                                        </div>
                                    )}
                                </div>

                                {/* Error message */}
                                {isError && result.errorMsg && (
                                    <div style={{ fontSize: "13px", color: "#fbbf24", background: "rgba(251,191,36,0.08)", borderRadius: "8px", padding: "10px 14px" }}>
                                        ⚠ {result.errorMsg}
                                    </div>
                                )}

                                {/* Progress */}
                                {!isError && <div style={S.progressSection}>
                                    <div style={S.progressLabel}>
                                        <span style={S.progressLabelText}>Confidence Score</span>
                                        <span style={S.progressLabelValue}>{result.confidence.toFixed(1)}%</span>
                                    </div>
                                    <div style={S.progressTrack}>
                                        <div
                                            style={{
                                                ...S.progressFill,
                                                width: `${barWidth}%`,
                                                background: isGenuine
                                                    ? "linear-gradient(90deg, #34d399, #10b981, #059669)"
                                                    : "linear-gradient(90deg, #fb923c, #ef4444, #dc2626)",
                                                boxShadow: isGenuine
                                                    ? "0 0 12px rgba(52,211,153,0.5)"
                                                    : "0 0 12px rgba(251,146,60,0.5)",
                                            }}
                                        />
                                        {/* Tick marks */}
                                        {[25, 50, 75].map((t) => (
                                            <div key={t} style={{ ...S.tick, left: `${t}%` }} />
                                        ))}
                                    </div>
                                    <div style={S.progressScale}>
                                        <span>Low</span><span>Medium</span><span>High</span><span>Very High</span>
                                    </div>
                                </div>}

                                {/* Footer chips */}
                                <div style={S.resultChips}>
                                    <span style={S.chip}>
                                        <span style={S.chipDot(isGenuine && !isError)} />
                                        {isError ? "Error" : isGenuine ? "Authentic" : "Suspicious"}
                                    </span>
                                    <span style={S.chip}>
                                        🕐 Just now
                                    </span>
                                </div>
                            </div>
                        )}

                    </div>
                </main>

                <footer style={S.footer}>
                    <span>© 2026 SignVerify</span>
                    <span style={S.footerDot}>·</span>
                    <span>AI-powered signature analysis</span>
                </footer>
            </div>
        </>
    );
}

/* ─── Design Tokens & Styles ────────────────────────────────────────────────── */
const S = {
    page: {
        minHeight: "100vh",
        background: "#07071a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
    },

    /* Ambient blobs */
    blob: {
        position: "fixed",
        borderRadius: "50%",
        filter: "blur(90px)",
        pointerEvents: "none",
        zIndex: 0,
    },
    blob1: {
        width: 480,
        height: 480,
        background: "radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%)",
        top: "-120px",
        left: "-100px",
        animation: "floatA 8s ease-in-out infinite",
    },
    blob2: {
        width: 400,
        height: 400,
        background: "radial-gradient(circle, rgba(168,85,247,0.15), transparent 70%)",
        bottom: "-80px",
        right: "-80px",
        animation: "floatB 10s ease-in-out infinite",
    },
    blob3: {
        width: 300,
        height: 300,
        background: "radial-gradient(circle, rgba(59,130,246,0.1), transparent 70%)",
        top: "50%",
        left: "60%",
        animation: "floatA 12s ease-in-out infinite 2s",
    },

    /* Header */
    header: {
        position: "relative",
        zIndex: 10,
        width: "100%",
        padding: "18px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(7,7,26,0.7)",
        backdropFilter: "blur(14px)",
    },
    logo: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },
    logoIcon: {
        fontSize: "20px",
        color: "#a78bfa",
        filter: "drop-shadow(0 0 8px rgba(167,139,250,0.7))",
    },
    logoText: {
        fontSize: "17px",
        fontWeight: 800,
        color: "#f1f5f9",
        letterSpacing: "-0.4px",
    },
    pill: {
        fontSize: "11px",
        fontWeight: 600,
        padding: "5px 12px",
        borderRadius: "999px",
        background: "rgba(139,92,246,0.15)",
        border: "1px solid rgba(139,92,246,0.3)",
        color: "#c4b5fd",
        letterSpacing: "0.04em",
    },

    /* Main */
    main: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
        width: "100%",
        position: "relative",
        zIndex: 1,
    },

    /* Card */
    card: {
        position: "relative",
        width: "100%",
        maxWidth: "500px",
        background: "rgba(15,15,35,0.85)",
        backdropFilter: "blur(24px)",
        borderRadius: "24px",
        border: "1px solid rgba(139,92,246,0.2)",
        padding: "36px 32px",
        display: "flex",
        flexDirection: "column",
        gap: "28px",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.08) inset",
    },
    cardGlow: {
        position: "absolute",
        inset: 0,
        borderRadius: "24px",
        background: "radial-gradient(ellipse at top, rgba(99,102,241,0.07) 0%, transparent 60%)",
        pointerEvents: "none",
    },

    /* Hero */
    hero: {
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "14px",
    },
    iconRing: {
        width: 64,
        height: 64,
        borderRadius: "50%",
        background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.25))",
        border: "1px solid rgba(139,92,246,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "26px",
        animation: "pulse-ring 2.5s ease-out infinite",
        boxShadow: "0 0 24px rgba(139,92,246,0.2)",
    },
    heroIcon: { lineHeight: 1 },
    title: {
        fontSize: "26px",
        fontWeight: 800,
        color: "#f1f5f9",
        letterSpacing: "-0.5px",
        lineHeight: 1.2,
    },
    subtitle: {
        fontSize: "14px",
        color: "#64748b",
        lineHeight: 1.65,
        maxWidth: "340px",
    },

    /* Divider */
    divider: {
        height: 1,
        background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.25), transparent)",
    },

    /* Section */
    section: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },
    sectionLabel: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "12px",
        fontWeight: 700,
        color: "#94a3b8",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
    },
    labelDot: {
        display: "inline-block",
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #6366f1, #a855f7)",
    },

    /* Upload */
    uploadZone: {
        border: "1.5px dashed rgba(139,92,246,0.35)",
        borderRadius: "16px",
        padding: "36px 24px",
        textAlign: "center",
        cursor: "pointer",
        background: "rgba(139,92,246,0.03)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
    },
    uploadZoneActive: {
        borderColor: "rgba(139,92,246,0.8)",
        background: "rgba(139,92,246,0.09)",
    },
    uploadIconCircle: {
        width: 52,
        height: 52,
        borderRadius: "14px",
        background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))",
        border: "1px solid rgba(139,92,246,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#a78bfa",
        marginBottom: "4px",
    },
    uploadTitle: {
        fontSize: "15px",
        fontWeight: 600,
        color: "#e2e8f0",
    },
    uploadSub: {
        fontSize: "13px",
        color: "#64748b",
    },
    uploadLink: {
        color: "#818cf8",
        textDecoration: "underline",
        textDecorationStyle: "dotted",
        cursor: "pointer",
    },
    uploadHint: {
        fontSize: "11px",
        color: "#475569",
        marginTop: "4px",
        padding: "4px 10px",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "6px",
        background: "rgba(255,255,255,0.03)",
    },

    /* Preview */
    previewCard: {
        borderRadius: "14px",
        border: "1px solid rgba(139,92,246,0.25)",
        background: "rgba(139,92,246,0.06)",
        padding: "16px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
    },
    previewImg: {
        width: 72,
        height: 72,
        borderRadius: "10px",
        objectFit: "contain",
        background: "rgba(255,255,255,0.95)",
        border: "1px solid rgba(255,255,255,0.2)",
        padding: "4px",
    },
    previewMeta: {
        flex: 1,
        overflow: "hidden",
    },
    previewFileName: {
        fontSize: "13px",
        fontWeight: 600,
        color: "#e2e8f0",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    previewSize: {
        fontSize: "12px",
        color: "#64748b",
        marginTop: "3px",
    },

    /* Language picker */
    langGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "10px",
    },
    langScript: {
        fontSize: "17px",
        opacity: 0.85,
    },
    langCheck: {
        marginLeft: "auto",
        color: "#a78bfa",
        fontWeight: 700,
    },

    /* Spinner */
    spinRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
    },
    spinner: {
        display: "inline-block",
        width: 17,
        height: 17,
        border: "2.5px solid rgba(255,255,255,0.25)",
        borderTopColor: "#fff",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
    },

    /* Result card */
    resultCard: {
        borderRadius: "18px",
        padding: "22px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    },
    resultGenuine: {
        background: "rgba(16,185,129,0.08)",
        border: "1px solid rgba(52,211,153,0.25)",
    },
    resultForged: {
        background: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(248,113,113,0.25)",
    },
    resultError: {
        background: "rgba(251,191,36,0.07)",
        border: "1px solid rgba(251,191,36,0.3)",
    },
    resultTop: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
    },
    resultMeta: {
        fontSize: "11px",
        fontWeight: 600,
        color: "#64748b",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        marginBottom: "8px",
    },
    verdictBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "7px 16px",
        borderRadius: "10px",
        fontSize: "14px",
        fontWeight: 700,
    },
    verdictGenuine: {
        background: "rgba(52,211,153,0.15)",
        border: "1px solid rgba(52,211,153,0.35)",
        color: "#34d399",
    },
    verdictForged: {
        background: "rgba(248,113,113,0.15)",
        border: "1px solid rgba(248,113,113,0.35)",
        color: "#f87171",
    },
    verdictError: {
        background: "rgba(251,191,36,0.15)",
        border: "1px solid rgba(251,191,36,0.4)",
        color: "#fbbf24",
    },
    scoreCircle: {
        flexShrink: 0,
        width: 68,
        height: 68,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.05)",
        border: "2px solid rgba(255,255,255,0.1)",
        display: "flex",
        alignItems: "baseline",
        justifyContent: "center",
        gap: "1px",
    },
    scoreValue: {
        fontSize: "22px",
        fontWeight: 800,
        color: "#f1f5f9",
    },
    scoreUnit: {
        fontSize: "12px",
        fontWeight: 600,
        color: "#94a3b8",
    },

    /* Progress */
    progressSection: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    progressLabel: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    progressLabelText: {
        fontSize: "12px",
        fontWeight: 600,
        color: "#94a3b8",
    },
    progressLabelValue: {
        fontSize: "13px",
        fontWeight: 700,
        color: "#e2e8f0",
    },
    progressTrack: {
        position: "relative",
        height: 10,
        borderRadius: "999px",
        background: "rgba(255,255,255,0.07)",
        overflow: "visible",
    },
    progressFill: {
        height: "100%",
        borderRadius: "999px",
        transition: "width 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
        position: "relative",
        zIndex: 1,
    },
    tick: {
        position: "absolute",
        top: 0,
        width: 1,
        height: "100%",
        background: "rgba(255,255,255,0.12)",
        zIndex: 2,
    },
    progressScale: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "10px",
        color: "#475569",
        fontWeight: 500,
    },

    /* Chips */
    resultChips: {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
    },
    chip: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "5px 11px",
        borderRadius: "999px",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        fontSize: "11px",
        fontWeight: 600,
        color: "#94a3b8",
        letterSpacing: "0.01em",
    },
    chipDot: (genuine) => ({
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: genuine ? "#34d399" : "#f87171",
        flexShrink: 0,
    }),

    /* Footer */
    footer: {
        position: "relative",
        zIndex: 1,
        padding: "20px",
        fontSize: "12px",
        color: "#334155",
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },
    footerDot: {
        color: "#1e293b",
    },
};
