import {
    useEffect,
    useMemo,
    useState,
    startTransition,
    type CSSProperties,
    type ReactNode,
} from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    addPropertyControls,
    ControlType,
    RenderTarget,
    useIsStaticRenderer,
} from "framer"

const STAGE_W = 1280
const STAGE_H = 760

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
    accent: string
    cases: CaseItem[]
    style?: CSSProperties
}

// SVG grain (feTurbulence) as a data URI, tiled over the scene.
const GRAIN =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.9'/%3E%3C/svg%3E\")"

/**
 * Y2K Home — kinetic B&W type intro that resolves into an illustrated desk.
 * Strict black & white with a single accent. Halftone + grain + scanlines.
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

    // phases: intro (name big) -> reveal (settle + desk in) -> ready
    const animated = mode === "full" && !isStatic
    const [phase, setPhase] = useState<"intro" | "reveal" | "ready">(
        animated ? "intro" : "ready"
    )
    useEffect(() => {
        if (!animated) {
            setPhase("ready")
            return
        }
        const t1 = window.setTimeout(
            () => startTransition(() => setPhase("reveal")),
            1900
        )
        const t2 = window.setTimeout(
            () => startTransition(() => setPhase("ready")),
            2600
        )
        return () => {
            window.clearTimeout(t1)
            window.clearTimeout(t2)
        }
    }, [animated])

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

    const introActive = phase === "intro"
    const showDesk = phase !== "intro"

    const nav: NavItem[] = [
        { label: "ABOUT", href: "/about" },
        { label: "GALLERY", href: "/gallery" },
        { label: "CLIENTS", href: "/clients" },
        { label: "CONTACT", href: "/contact" },
    ]

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                minHeight: "100vh",
                background: "#F4F2EC",
                color: "#0A0A0A",
                overflow: "hidden",
                fontFamily: MONO,
                ...props.style,
            }}
        >
            <link
                href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Mono:wght@400;700&family=Silkscreen:wght@400;700&display=swap"
                rel="stylesheet"
            />

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
                <div
                    style={{
                        position: "relative",
                        width: "100%",
                        minHeight: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div
                        style={{
                            width: STAGE_W,
                            height: STAGE_H,
                            transform: `scale(${scale})`,
                            transformOrigin: "center center",
                            position: "relative",
                        }}
                    >
                        {/* Wordmark: big + centered in intro, settles to top */}
                        <motion.div
                            initial={false}
                            animate={
                                introActive
                                    ? { top: 300, scale: 1, opacity: 1 }
                                    : { top: 0, scale: 0.42, opacity: 1 }
                            }
                            transition={{
                                type: "spring",
                                stiffness: 120,
                                damping: 20,
                            }}
                            style={{
                                position: "absolute",
                                left: 0,
                                width: STAGE_W,
                                transformOrigin: "left top",
                                zIndex: 5,
                            }}
                        >
                            <Wordmark
                                name={name}
                                accent={accent}
                                animateIn={animated}
                            />
                        </motion.div>

                        {/* Role line + accent bar */}
                        <AnimatePresence>
                            {showDesk && (
                                <motion.div
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15 }}
                                    style={{
                                        position: "absolute",
                                        left: 4,
                                        top: 92,
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
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* DESK */}
                        <AnimatePresence>
                            {showDesk && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.4 }}
                                    style={{
                                        position: "absolute",
                                        left: 0,
                                        top: 150,
                                        width: STAGE_W,
                                        height: STAGE_H - 150,
                                    }}
                                >
                                    {/* desk surface */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            top: 20,
                                            border: "2px solid #0A0A0A",
                                            background:
                                                "repeating-linear-gradient(90deg,#EDEBE4 0 2px,#E4E1D8 2px 4px)",
                                        }}
                                    />

                                    {/* 3 CASE STUDY objects — prominent */}
                                    {cases.slice(0, 3).map((c, i) => (
                                        <CaseObject
                                            key={c.slug}
                                            index={i}
                                            item={c}
                                            accent={accent}
                                            delay={0.1 + i * 0.08}
                                            onClick={() => go(`/work/${c.slug}`)}
                                            style={casePos[i]}
                                        />
                                    ))}

                                    {/* Secondary nav objects */}
                                    <NavObject
                                        label="ABOUT"
                                        href="/about"
                                        accent={accent}
                                        delay={0.4}
                                        style={{ left: 40, top: 250 }}
                                    >
                                        <Journal />
                                    </NavObject>
                                    <NavObject
                                        label="GALLERY"
                                        href="/gallery"
                                        accent={accent}
                                        delay={0.46}
                                        style={{ left: 900, top: 40 }}
                                    >
                                        <PhotoStack accent={accent} />
                                    </NavObject>
                                    <NavObject
                                        label="CLIENTS"
                                        href="/clients"
                                        accent={accent}
                                        delay={0.52}
                                        style={{ left: 1060, top: 300 }}
                                    >
                                        <Rolodex />
                                    </NavObject>
                                    <NavObject
                                        label="CONTACT"
                                        href="/contact"
                                        accent={accent}
                                        delay={0.58}
                                        style={{ left: 120, top: 470 }}
                                    >
                                        <Envelope accent={accent} />
                                    </NavObject>

                                    {/* atmosphere: halftone blob + mug */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: 980,
                                            top: 470,
                                            width: 120,
                                            height: 120,
                                            borderRadius: "50%",
                                            border: "2px solid #0A0A0A",
                                            background:
                                                "radial-gradient(#0A0A0A 30%, transparent 31%) 0 0/12px 12px",
                                        }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Corner UI chrome */}
                    <Corner pos={{ top: 16, left: 20 }}>
                        [ NABIA™ 2026 ]
                    </Corner>
                    <Corner pos={{ top: 16, right: 20 }}>[ NY / EST 2019 ]</Corner>
                    <Corner pos={{ bottom: 16, left: 20 }}>
                        studio@nabiashaikh.com
                    </Corner>
                    <Corner pos={{ bottom: 16, right: 20 }}>
                        <Clock />
                    </Corner>
                </div>
            )}

            {/* scanlines + grain overlays */}
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

            {/* flash-wipe transition */}
            <AnimatePresence>
                {flash && (
                    <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeIn" }}
                        style={{
                            position: "absolute",
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

const casePos: CSSProperties[] = [
    { left: 300, top: 110, width: 250, height: 320 },
    { left: 560, top: 70, width: 250, height: 320 },
    { left: 620, top: 360, width: 250, height: 230 },
]

// --------------------------------------------------------------------------
function Wordmark({
    name,
    accent,
    animateIn,
}: {
    name: string
    accent: string
    animateIn: boolean
}) {
    const letters = name.split("")
    return (
        <h1
            style={{
                margin: 0,
                fontFamily: DISPLAY,
                fontSize: 150,
                lineHeight: 0.86,
                letterSpacing: -4,
                color: "#0A0A0A",
                whiteSpace: "pre-wrap",
                textTransform: "uppercase",
            }}
        >
            {letters.map((ch, i) => (
                <motion.span
                    key={i}
                    initial={animateIn ? { y: 120, opacity: 0 } : false}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        delay: animateIn ? i * 0.035 : 0,
                        type: "spring",
                        stiffness: 320,
                        damping: 24,
                    }}
                    style={{
                        display: "inline-block",
                        color: ch === "." ? accent : undefined,
                    }}
                >
                    {ch === " " ? "\u00A0" : ch}
                </motion.span>
            ))}
        </h1>
    )
}

function CaseObject({
    index,
    item,
    accent,
    delay,
    onClick,
    style,
}: {
    index: number
    item: CaseItem
    accent: string
    delay: number
    onClick: () => void
    style: CSSProperties
}) {
    const [hover, setHover] = useState(false)
    const num = String(index + 1).padStart(2, "0")
    return (
        <motion.button
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
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
                boxShadow: hover
                    ? `10px 10px 0 ${accent}`
                    : "6px 6px 0 #0A0A0A",
                transition: "background 0.08s, color 0.08s, box-shadow 0.12s",
                display: "flex",
                flexDirection: "column",
                textAlign: "left",
                overflow: "hidden",
                ...style,
            }}
        >
            {/* halftone image area */}
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
                        color: hover ? "#F4F2EC" : "#F4F2EC",
                        mixBlendMode: "difference",
                    }}
                >
                    {num}
                </span>
            </div>
            <div style={{ padding: "10px 12px" }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 18 }}>
                    {item.label}
                </div>
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
        </motion.button>
    )
}

function NavObject({
    label,
    href,
    accent,
    delay,
    style,
    children,
}: {
    label: string
    href: string
    accent: string
    delay: number
    style: CSSProperties
    children: ReactNode
}) {
    const [hover, setHover] = useState(false)
    return (
        <motion.a
            href={href}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onFocus={() => setHover(true)}
            onBlur={() => setHover(false)}
            style={{
                position: "absolute",
                width: 140,
                height: 140,
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
        </motion.a>
    )
}

// ---- object art (B&W, halftone) ----
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
                <rect
                    x="20"
                    y="30"
                    width="58"
                    height="36"
                    fill="#F4F2EC"
                    style={{}}
                />
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

function Corner({
    children,
    pos,
}: {
    children: ReactNode
    pos: CSSProperties
}) {
    return (
        <div
            style={{
                position: "absolute",
                fontFamily: MONO,
                fontSize: 12,
                letterSpacing: 1,
                color: "#0A0A0A",
                zIndex: 20,
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
        <div style={{ padding: "24px 16px 60px" }}>
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
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
            </motion.h1>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    margin: "12px 0 24px",
                }}
            >
                <span
                    style={{
                        width: 30,
                        height: 8,
                        background: accent,
                        display: "inline-block",
                    }}
                />
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
                            <div
                                style={{
                                    fontFamily: MONO,
                                    fontSize: 11,
                                    opacity: 0.8,
                                }}
                            >
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
                background: "#F4F2EC",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: DISPLAY,
                fontSize: 48,
                textTransform: "uppercase",
                color: "#0A0A0A",
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
    name: {
        type: ControlType.String,
        title: "Name",
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
