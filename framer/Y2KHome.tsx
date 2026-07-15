import {
    useEffect,
    useMemo,
    useRef,
    useState,
    startTransition,
    type CSSProperties,
    type ReactNode,
} from "react"
import {
    motion,
    AnimatePresence,
    useScroll,
    useSpring,
    useTransform,
    useMotionValueEvent,
} from "framer-motion"
import {
    addPropertyControls,
    ControlType,
    RenderTarget,
    useIsStaticRenderer,
} from "framer"

const STAGE_W = 1280
const STAGE_H = 760
const INTRO_VH = 200 // scroll distance for the load sequence

const DISPLAY = '"Archivo Black", "Arial Black", sans-serif'
const MONO = '"Space Mono", ui-monospace, monospace'
const PIXEL = '"Silkscreen", "Space Mono", monospace'

interface CaseItem {
    label: string
    tag: string
    slug: string
}
interface NavItem {
    label: string
    href: string
}
interface Y2KHomeProps {
    name: string
    role: string
    introLine: string
    accent: string
    cases: CaseItem[]
    style?: CSSProperties
}

const GRAIN =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.9'/%3E%3C/svg%3E\")"

/**
 * Y2K Home — a near-black load sequence whose bold wordmark resolves, via a
 * scroll-linked (spring-smoothed) transition, into an illustrated B&W desk.
 *
 * @framerIntrinsicWidth 1280
 * @framerIntrinsicHeight 760
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function Y2KHome(props: Y2KHomeProps) {
    const {
        name = "NABIA SHAIKH",
        role = "GRAPHIC DESIGNER & CONTENT CREATOR — NYC",
        introLine = "NABIA SHAIKH",
        accent = "#0F27FF",
        cases = defaultCases,
    } = props

    const isStatic = useIsStaticRenderer()
    const [mode, setMode] = useState<"full" | "reduced" | "mobile">("full")
    const [vw, setVw] = useState(STAGE_W)
    const [flash, setFlash] = useState(false)

    useEffect(() => {
        if (typeof window === "undefined") return
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
        const compute = () => {
            startTransition(() => {
                setVw(window.innerWidth)
                setMode(
                    window.innerWidth < 820
                        ? "mobile"
                        : reduce.matches
                          ? "reduced"
                          : "full"
                )
            })
        }
        compute()
        window.addEventListener("resize", compute)
        return () => window.removeEventListener("resize", compute)
    }, [])

    const isFull = mode === "full" && !isStatic

    // --- Scroll-linked progress (0..1), spring-smoothed ("lerp").
    const rootRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: rootRef,
        offset: ["start start", "end end"],
    })
    const smoothed = useSpring(scrollYProgress, {
        stiffness: 110,
        damping: 26,
        mass: 0.5,
    })
    // Auto-advance fallback so the intro resolves even without scrolling.
    const auto = useSpring(isStatic ? 1 : 0, {
        stiffness: 70,
        damping: 20,
        mass: 0.5,
    })
    const scrolledRef = useRef(false)
    useMotionValueEvent(scrollYProgress, "change", (v) => {
        if (v > 0.015) scrolledRef.current = true
    })
    useEffect(() => {
        if (isStatic || mode === "reduced") {
            auto.set(1)
            return
        }
        if (mode === "mobile") {
            const t = window.setTimeout(() => auto.set(1), 1400)
            return () => window.clearTimeout(t)
        }
        const t = window.setTimeout(() => {
            if (!scrolledRef.current) auto.set(1)
        }, 1800)
        return () => window.clearTimeout(t)
    }, [mode, isStatic, auto])

    // Combined progress: scroll drives it; auto is the timed fallback.
    const p = useTransform([smoothed, auto], ([s, a]: number[]) =>
        Math.max(s, a)
    )

    // Intro (near-black + wordmark) resolves out; desk composes in from dark.
    const introOpacity = useTransform(p, [0, 0.45], [1, 0])
    const introScale = useTransform(p, [0, 0.5], [1, 0.8])
    const introY = useTransform(p, [0, 0.5], [0, -48])
    const introClip = useTransform(
        p,
        [0.18, 0.5],
        ["inset(0% 0% 0% 0%)", "inset(0% 0% 100% 0%)"]
    )
    const hintOpacity = useTransform(p, [0, 0.06], [1, 0])
    const deskOpacity = useTransform(p, [0.12, 0.55], [0, 1])
    const deskScale = useTransform(p, [0, 0.55], [0.94, 1])
    const veilOpacity = useTransform(p, [0.12, 0.62], [0.6, 0])

    const scale = useMemo(() => {
        if (mode === "mobile") return 1
        const s = Math.min((vw - 64) / STAGE_W, 1.05)
        return Math.max(0.35, s)
    }, [vw, mode])

    function go(href: string) {
        if (typeof window === "undefined") return
        setFlash(true)
        window.setTimeout(() => {
            window.location.href = href
        }, 240)
    }

    if (RenderTarget.current() === RenderTarget.thumbnail) {
        return <Thumb name={name} accent={accent} />
    }

    const nav: NavItem[] = [
        { label: "ABOUT", href: "/about" },
        { label: "GALLERY", href: "/gallery" },
        { label: "CLIENTS", href: "/clients" },
        { label: "CONTACT", href: "/contact" },
    ]

    return (
        <div
            ref={rootRef}
            style={{
                position: "relative",
                width: "100%",
                height: isFull ? `${INTRO_VH}vh` : undefined,
                minHeight: isFull ? undefined : "100vh",
                background: "#F4F2EC",
                color: "#0A0A0A",
                fontFamily: MONO,
                ...props.style,
            }}
        >
            <link
                href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Mono:wght@400;700&family=Silkscreen:wght@400;700&display=swap"
                rel="stylesheet"
            />

            {/* ===== DESK (composes in from dark, scroll-linked) ===== */}
            <div
                style={{
                    position: isFull ? "sticky" : "relative",
                    top: 0,
                    height: mode === "mobile" ? "auto" : "100vh",
                    minHeight: mode === "mobile" ? "100vh" : undefined,
                    width: "100%",
                    overflow: "hidden",
                }}
            >
                <motion.div
                    style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        minHeight: mode === "mobile" ? "100vh" : undefined,
                        opacity: deskOpacity,
                        scale: mode === "mobile" ? 1 : deskScale,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {mode === "mobile" ? (
                        <MobileHome
                            name={name}
                            role={role}
                            accent={accent}
                            cases={cases}
                            nav={nav}
                            onCase={go}
                        />
                    ) : (
                        <DeskStage
                            name={name}
                            role={role}
                            accent={accent}
                            cases={cases}
                            scale={scale}
                            onCase={go}
                        />
                    )}
                </motion.div>

                {/* dark veil that lifts as the scene resolves */}
                <motion.div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "#0A0A0A",
                        opacity: veilOpacity,
                        pointerEvents: "none",
                        zIndex: 6,
                    }}
                />
            </div>

            {/* ===== INTRO (near-black + wordmark), fixed cover, fades out ===== */}
            <motion.div
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 50,
                    background: "#080808",
                    opacity: introOpacity,
                    pointerEvents: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                }}
            >
                <motion.div
                    style={{
                        scale: introScale,
                        y: introY,
                        clipPath: introClip,
                        textAlign: "center",
                        padding: "0 24px",
                    }}
                >
                    <IntroWordmark
                        text={introLine || name}
                        accent={accent}
                        animate={!isStatic}
                    />
                </motion.div>

                {/* scroll hint */}
                <motion.div
                    style={{
                        position: "absolute",
                        bottom: 40,
                        left: 0,
                        right: 0,
                        textAlign: "center",
                        opacity: hintOpacity,
                        color: "#EDEDED",
                        fontFamily: PIXEL,
                        fontSize: 13,
                        letterSpacing: 2,
                    }}
                >
                    <motion.div
                        animate={{ y: [0, 6, 0] }}
                        transition={{ duration: 1.4, repeat: Infinity }}
                    >
                        [ SCROLL ▼ ]
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* scanlines + grain */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    backgroundImage:
                        "repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0 1px, transparent 1px 3px)",
                    mixBlendMode: "multiply",
                    zIndex: 30,
                }}
            />
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    backgroundImage: GRAIN,
                    backgroundSize: "120px 120px",
                    opacity: 0.12,
                    mixBlendMode: "multiply",
                    zIndex: 31,
                }}
            />

            {/* flash-wipe transition to case studies */}
            <AnimatePresence>
                {flash && (
                    <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeIn" }}
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: accent,
                            transformOrigin: "bottom",
                            zIndex: 90,
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

// ==========================================================================
function IntroWordmark({
    text,
    accent,
    animate,
}: {
    text: string
    accent: string
    animate: boolean
}) {
    const words = text.split(" ")
    return (
        <h1
            style={{
                margin: 0,
                fontFamily: DISPLAY,
                fontSize: "clamp(48px, 12vw, 180px)",
                lineHeight: 0.86,
                letterSpacing: -4,
                color: "#F4F2EC",
                textTransform: "uppercase",
                display: "flex",
                flexWrap: "wrap",
                gap: "0 0.28em",
                justifyContent: "center",
            }}
        >
            {words.map((w, wi) => (
                <span key={wi} style={{ display: "inline-flex", overflow: "hidden" }}>
                    {w.split("").map((ch, ci) => (
                        <motion.span
                            key={ci}
                            initial={animate ? { y: "110%", opacity: 0 } : false}
                            animate={{ y: "0%", opacity: 1 }}
                            transition={{
                                delay: animate ? 0.15 + (wi * 5 + ci) * 0.04 : 0,
                                type: "spring",
                                stiffness: 300,
                                damping: 26,
                            }}
                            style={{
                                display: "inline-block",
                                color: ch === "." ? accent : undefined,
                            }}
                        >
                            {ch}
                        </motion.span>
                    ))}
                </span>
            ))}
        </h1>
    )
}

function DeskStage({
    name,
    role,
    accent,
    cases,
    scale,
    onCase,
}: {
    name: string
    role: string
    accent: string
    cases: CaseItem[]
    scale: number
    onCase: (href: string) => void
}) {
    return (
        <div
            style={{
                width: STAGE_W,
                height: STAGE_H,
                transform: `scale(${scale})`,
                transformOrigin: "center center",
                position: "relative",
            }}
        >
            {/* Desk title + role */}
            <h1
                style={{
                    position: "absolute",
                    left: 0,
                    top: 8,
                    margin: 0,
                    fontFamily: DISPLAY,
                    fontSize: 64,
                    letterSpacing: -2,
                    lineHeight: 0.9,
                    textTransform: "uppercase",
                    zIndex: 5,
                }}
            >
                {name}
            </h1>
            <div
                style={{
                    position: "absolute",
                    left: 4,
                    top: 82,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    zIndex: 5,
                }}
            >
                <span
                    style={{
                        width: 46,
                        height: 10,
                        background: accent,
                        display: "inline-block",
                    }}
                />
                <span
                    style={{
                        fontFamily: MONO,
                        fontSize: 13,
                        letterSpacing: 2,
                        fontWeight: 700,
                    }}
                >
                    {role}
                </span>
            </div>

            {/* desk surface */}
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    top: 150,
                    right: 0,
                    height: STAGE_H - 150,
                    border: "2px solid #0A0A0A",
                    background:
                        "repeating-linear-gradient(90deg,#EDEBE4 0 2px,#E4E1D8 2px 4px)",
                }}
            />

            {/* 3 case-study objects */}
            {cases.slice(0, 3).map((c, i) => (
                <CaseObject
                    key={c.slug}
                    index={i}
                    item={c}
                    accent={accent}
                    onClick={() => onCase(`/work/${c.slug}`)}
                    style={casePos[i]}
                />
            ))}

            {/* nav objects */}
            <NavObject label="ABOUT" href="/about" accent={accent} style={{ left: 40, top: 400 }}>
                <Journal />
            </NavObject>
            <NavObject label="GALLERY" href="/gallery" accent={accent} style={{ left: 900, top: 190 }}>
                <PhotoStack accent={accent} />
            </NavObject>
            <NavObject label="CLIENTS" href="/clients" accent={accent} style={{ left: 1070, top: 450 }}>
                <Rolodex />
            </NavObject>
            <NavObject label="CONTACT" href="/contact" accent={accent} style={{ left: 120, top: 610 }}>
                <Envelope accent={accent} />
            </NavObject>

            {/* atmosphere */}
            <div
                style={{
                    position: "absolute",
                    left: 980,
                    top: 620,
                    width: 110,
                    height: 110,
                    borderRadius: "50%",
                    border: "2px solid #0A0A0A",
                    background:
                        "radial-gradient(#0A0A0A 30%, transparent 31%) 0 0/12px 12px",
                }}
            />

            {/* corner chrome */}
            <Corner pos={{ top: -30, right: 0 }}>[ NY / EST 2019 ]</Corner>
            <Corner pos={{ bottom: -34, left: 0 }}>studio@nabiashaikh.com</Corner>
            <Corner pos={{ bottom: -34, right: 0 }}>
                <Clock />
            </Corner>
        </div>
    )
}

const casePos: CSSProperties[] = [
    { left: 300, top: 200, width: 250, height: 320 },
    { left: 560, top: 240, width: 250, height: 320 },
    { left: 620, top: 470, width: 250, height: 210 },
]

function CaseObject({
    index,
    item,
    accent,
    onClick,
    style,
}: {
    index: number
    item: CaseItem
    accent: string
    onClick: () => void
    style: CSSProperties
}) {
    const [hover, setHover] = useState(false)
    const num = String(index + 1).padStart(2, "0")
    return (
        <button
            type="button"
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onFocus={() => setHover(true)}
            onBlur={() => setHover(false)}
            aria-label={`Case study: ${item.label}`}
            style={{
                position: "absolute",
                padding: 0,
                cursor: "pointer",
                border: "3px solid #0A0A0A",
                background: hover ? "#0A0A0A" : "#F4F2EC",
                color: hover ? "#F4F2EC" : "#0A0A0A",
                boxShadow: hover ? `10px 10px 0 ${accent}` : "6px 6px 0 #0A0A0A",
                transition: "background 0.08s, color 0.08s, box-shadow 0.12s",
                display: "flex",
                flexDirection: "column",
                textAlign: "left",
                overflow: "hidden",
                ...style,
            }}
        >
            <div
                style={{
                    flex: 1,
                    position: "relative",
                    borderBottom: "3px solid currentColor",
                    background: hover
                        ? `radial-gradient(${accent} 32%, transparent 33%) 0 0/10px 10px`
                        : "radial-gradient(#0A0A0A 32%, transparent 33%) 0 0/10px 10px",
                }}
            >
                <span
                    style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        fontFamily: PIXEL,
                        fontSize: 12,
                        background: accent,
                        color: "#fff",
                        padding: "2px 6px",
                    }}
                >
                    CASE {num}
                </span>
                <span
                    style={{
                        position: "absolute",
                        right: 8,
                        bottom: 8,
                        fontFamily: DISPLAY,
                        fontSize: 40,
                        color: "#F4F2EC",
                        mixBlendMode: "difference",
                    }}
                >
                    {num}
                </span>
            </div>
            <div style={{ padding: "10px 12px" }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 18 }}>{item.label}</div>
                <div
                    style={{
                        fontFamily: MONO,
                        fontSize: 11,
                        letterSpacing: 1,
                        opacity: 0.8,
                    }}
                >
                    {item.tag} {hover ? "▸ OPEN" : ""}
                </div>
            </div>
        </button>
    )
}

function NavObject({
    label,
    href,
    accent,
    style,
    children,
}: {
    label: string
    href: string
    accent: string
    style: CSSProperties
    children: ReactNode
}) {
    const [hover, setHover] = useState(false)
    return (
        <a
            href={href}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onFocus={() => setHover(true)}
            onBlur={() => setHover(false)}
            style={{
                position: "absolute",
                width: 140,
                height: 150,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                textDecoration: "none",
                outline: "none",
                ...style,
            }}
        >
            <div
                style={{
                    width: 96,
                    height: 96,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    filter: hover ? "invert(1)" : "none",
                    transition: "filter 0.06s",
                }}
            >
                {children}
            </div>
            <span
                style={{
                    fontFamily: PIXEL,
                    fontSize: 13,
                    padding: "3px 8px",
                    background: hover ? accent : "#0A0A0A",
                    color: "#fff",
                    letterSpacing: 1,
                }}
            >
                [{label}]
            </span>
        </a>
    )
}

function Journal() {
    return (
        <svg viewBox="0 0 96 96" width="96" height="96">
            <rect x="14" y="8" width="68" height="80" fill="#0A0A0A" />
            <rect x="20" y="14" width="56" height="68" fill="#F4F2EC" />
            <rect x="20" y="14" width="10" height="68" fill="#0A0A0A" />
            <line x1="38" y1="30" x2="70" y2="30" stroke="#0A0A0A" strokeWidth="3" />
            <line x1="38" y1="44" x2="70" y2="44" stroke="#0A0A0A" strokeWidth="3" />
            <line x1="38" y1="58" x2="60" y2="58" stroke="#0A0A0A" strokeWidth="3" />
        </svg>
    )
}
function PhotoStack({ accent }: { accent: string }) {
    return (
        <svg viewBox="0 0 96 96" width="96" height="96">
            <g transform="rotate(-8 48 48)">
                <rect x="14" y="20" width="68" height="56" fill="#0A0A0A" />
                <rect x="18" y="24" width="60" height="40" fill="#F4F2EC" />
            </g>
            <g transform="rotate(6 48 48)">
                <rect x="16" y="26" width="66" height="52" fill="#0A0A0A" />
                <rect x="20" y="30" width="58" height="36" fill="#F4F2EC" />
                <rect x="20" y="30" width="58" height="36" fill={accent} opacity="0.25" />
            </g>
        </svg>
    )
}
function Rolodex() {
    return (
        <svg viewBox="0 0 96 96" width="96" height="96">
            <rect x="10" y="40" width="76" height="44" fill="#0A0A0A" />
            <rect x="16" y="18" width="64" height="40" fill="#F4F2EC" stroke="#0A0A0A" strokeWidth="3" />
            <rect x="26" y="10" width="44" height="30" fill="#F4F2EC" stroke="#0A0A0A" strokeWidth="3" />
            <line x1="34" y1="22" x2="62" y2="22" stroke="#0A0A0A" strokeWidth="3" />
            <line x1="34" y1="30" x2="56" y2="30" stroke="#0A0A0A" strokeWidth="3" />
        </svg>
    )
}
function Envelope({ accent }: { accent: string }) {
    return (
        <svg viewBox="0 0 96 96" width="96" height="96">
            <rect x="8" y="24" width="80" height="52" fill="#F4F2EC" stroke="#0A0A0A" strokeWidth="3" />
            <polyline points="8,26 48,56 88,26" fill="none" stroke="#0A0A0A" strokeWidth="3" />
            <rect x="64" y="14" width="20" height="20" fill={accent} />
        </svg>
    )
}

function Corner({ children, pos }: { children: ReactNode; pos: CSSProperties }) {
    return (
        <div
            style={{
                position: "absolute",
                fontFamily: MONO,
                fontSize: 12,
                letterSpacing: 1,
                color: "#0A0A0A",
                zIndex: 5,
                ...pos,
            }}
        >
            {children}
        </div>
    )
}

function Clock() {
    const [t, setT] = useState("")
    useEffect(() => {
        const f = () =>
            setT(
                new Date().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                })
            )
        f()
        const id = window.setInterval(f, 1000)
        return () => window.clearInterval(id)
    }, [])
    return <span>{t}</span>
}

function MobileHome({
    name,
    role,
    accent,
    cases,
    nav,
    onCase,
}: {
    name: string
    role: string
    accent: string
    cases: CaseItem[]
    nav: NavItem[]
    onCase: (href: string) => void
}) {
    return (
        <div style={{ padding: "24px 16px 60px", width: "100%" }}>
            <h1
                style={{
                    margin: 0,
                    fontFamily: DISPLAY,
                    fontSize: "clamp(40px, 14vw, 72px)",
                    lineHeight: 0.9,
                    letterSpacing: -2,
                    textTransform: "uppercase",
                }}
            >
                {name}
            </h1>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    margin: "12px 0 24px",
                }}
            >
                <span style={{ width: 30, height: 8, background: accent }} />
                <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1 }}>
                    {role}
                </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {cases.slice(0, 3).map((c, i) => (
                    <button
                        key={c.slug}
                        type="button"
                        onClick={() => onCase(`/work/${c.slug}`)}
                        style={{
                            textAlign: "left",
                            border: "3px solid #0A0A0A",
                            background: "#F4F2EC",
                            boxShadow: `5px 5px 0 ${accent}`,
                            padding: 0,
                            overflow: "hidden",
                            cursor: "pointer",
                        }}
                    >
                        <div
                            style={{
                                height: 120,
                                background:
                                    "radial-gradient(#0A0A0A 32%, transparent 33%) 0 0/10px 10px",
                                borderBottom: "3px solid #0A0A0A",
                                position: "relative",
                            }}
                        >
                            <span
                                style={{
                                    position: "absolute",
                                    top: 8,
                                    left: 8,
                                    fontFamily: PIXEL,
                                    fontSize: 12,
                                    background: accent,
                                    color: "#fff",
                                    padding: "2px 6px",
                                }}
                            >
                                CASE {String(i + 1).padStart(2, "0")}
                            </span>
                        </div>
                        <div style={{ padding: "10px 12px" }}>
                            <div style={{ fontFamily: DISPLAY, fontSize: 18 }}>
                                {c.label}
                            </div>
                            <div style={{ fontFamily: MONO, fontSize: 11, opacity: 0.8 }}>
                                {c.tag} ▸ OPEN
                            </div>
                        </div>
                    </button>
                ))}
            </div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                    marginTop: 20,
                }}
            >
                {nav.map((n) => (
                    <a
                        key={n.href}
                        href={n.href}
                        style={{
                            fontFamily: PIXEL,
                            fontSize: 14,
                            textDecoration: "none",
                            textAlign: "center",
                            padding: "14px 8px",
                            background: "#0A0A0A",
                            color: "#fff",
                        }}
                    >
                        [{n.label}]
                    </a>
                ))}
            </div>
        </div>
    )
}

function Thumb({ name, accent }: { name: string; accent: string }) {
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                minHeight: 200,
                background: "#080808",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: DISPLAY,
                fontSize: 48,
                textTransform: "uppercase",
                color: "#F4F2EC",
                borderBottom: `10px solid ${accent}`,
            }}
        >
            {name}
        </div>
    )
}

const defaultCases: CaseItem[] = [
    { label: "Fintech App", tag: "PRODUCT / UX", slug: "fintech-app" },
    { label: "Health Platform", tag: "SYSTEM / UI", slug: "health-platform" },
    { label: "Chutney Studios", tag: "BRAND / WEB", slug: "chutney-studios" },
]

addPropertyControls(Y2KHome, {
    name: { type: ControlType.String, title: "Name", defaultValue: "NABIA SHAIKH" },
    introLine: {
        type: ControlType.String,
        title: "Intro Line",
        defaultValue: "NABIA SHAIKH",
    },
    role: {
        type: ControlType.String,
        title: "Role",
        defaultValue: "GRAPHIC DESIGNER & CONTENT CREATOR — NYC",
    },
    accent: { type: ControlType.Color, title: "Accent", defaultValue: "#0F27FF" },
    cases: {
        type: ControlType.Array,
        title: "Case Studies",
        control: {
            type: ControlType.Object,
            controls: {
                label: { type: ControlType.String, defaultValue: "Project" },
                tag: { type: ControlType.String, defaultValue: "BRAND" },
                slug: { type: ControlType.String, defaultValue: "project" },
            },
        },
        defaultValue: defaultCases,
        maxCount: 3,
    },
})
