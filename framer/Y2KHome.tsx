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
    type MotionValue,
} from "framer-motion"
import {
    addPropertyControls,
    ControlType,
    RenderTarget,
    useIsStaticRenderer,
} from "framer"

const STAGE_W = 1280
const STAGE_H = 760
const INTRO_VH = 220

const DISPLAY = '"Archivo Black", "Arial Black", sans-serif'
const MONO = '"Space Mono", ui-monospace, monospace'
const PIXEL = '"Silkscreen", "Space Mono", monospace'
const INK = "#0A0A0A"
const PAPER = "#F4F2EC"

type Section = "about" | "gallery" | "clients" | "contact"

interface CaseItem {
    label: string
    tag: string
    slug: string
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

const NAV_CONTENT: Record<
    Section,
    { label: string; heading: string; blurb: string; href: string }
> = {
    about: {
        label: "ABOUT",
        heading: "WHO IS NABIA",
        blurb: "Independent graphic designer & content creator in New York, working with wellness and lifestyle brands.",
        href: "/about",
    },
    gallery: {
        label: "GALLERY",
        heading: "ODDS & ENDS",
        blurb: "Smaller projects — posters, zines, social kits, lettering. The fun, low-stakes side of the practice.",
        href: "/gallery",
    },
    clients: {
        label: "CLIENTS",
        heading: "IN GOOD COMPANY",
        blurb: "A short list of the brands and studios I've made things with.",
        href: "/clients",
    },
    contact: {
        label: "CONTACT",
        heading: "SAY HELLO",
        blurb: "Got a project, a collab, or just want to talk shop? Let's talk.",
        href: "/contact",
    },
}

/**
 * Y2K Home — a Heat-style scroll-linked load sequence (wordmark + a grainy B&W
 * collage assembling in) that resolves into an illustrated B&W desk scene with
 * device-screen case studies and clickable desk objects.
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
    const [openNav, setOpenNav] = useState<Section | null>(null)

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

    const p = useTransform([smoothed, auto], ([s, a]: number[]) =>
        Math.max(s, a)
    )

    const introOpacity = useTransform(p, [0, 0.52], [1, 0])
    const wordScale = useTransform(p, [0, 0.55], [1, 0.82])
    const wordY = useTransform(p, [0, 0.55], [0, -40])
    const wordClip = useTransform(
        p,
        [0.3, 0.55],
        ["inset(0% 0% 0% 0%)", "inset(0% 0% 100% 0%)"]
    )
    const hintOpacity = useTransform(p, [0, 0.06], [1, 0])
    const deskOpacity = useTransform(p, [0.2, 0.62], [0, 1])
    const deskScale = useTransform(p, [0.1, 0.65], [0.94, 1])
    const veilOpacity = useTransform(p, [0.2, 0.7], [0.7, 0])

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

    return (
        <div
            ref={rootRef}
            style={{
                position: "relative",
                width: "100%",
                height: isFull ? `${INTRO_VH}vh` : undefined,
                minHeight: isFull ? undefined : "100vh",
                background: PAPER,
                color: INK,
                fontFamily: MONO,
                ...props.style,
            }}
        >
            <link
                href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Mono:wght@400;700&family=Silkscreen:wght@400;700&display=swap"
                rel="stylesheet"
            />

            {/* ===== DESK ===== */}
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
                            onCase={go}
                            onNav={setOpenNav}
                        />
                    ) : (
                        <DeskStage
                            name={name}
                            role={role}
                            accent={accent}
                            cases={cases}
                            scale={scale}
                            onCase={go}
                            onNav={setOpenNav}
                        />
                    )}
                </motion.div>

                <motion.div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: INK,
                        opacity: veilOpacity,
                        pointerEvents: "none",
                        zIndex: 6,
                    }}
                />
            </div>

            {/* ===== INTRO (near-black + wordmark + grainy collage) ===== */}
            <motion.div
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 50,
                    background: "#080808",
                    opacity: introOpacity,
                    pointerEvents: "none",
                    overflow: "hidden",
                }}
            >
                {mode === "full" && (
                    <div style={{ position: "absolute", inset: 0 }}>
                        {introTiles.map((t, i) => (
                            <IntroTile key={i} p={p} conf={t} accent={accent} />
                        ))}
                    </div>
                )}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <motion.div
                        style={{
                            scale: wordScale,
                            y: wordY,
                            clipPath: wordClip,
                            textAlign: "center",
                            padding: "0 24px",
                            position: "relative",
                            zIndex: 2,
                        }}
                    >
                        <IntroWordmark
                            text={introLine || name}
                            accent={accent}
                            animate={!isStatic}
                        />
                    </motion.div>
                </div>
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

            {/* nav pop-up (Barbiana [X CLOSE] style) */}
            <AnimatePresence>
                {openNav && (
                    <NavPopup
                        content={NAV_CONTENT[openNav]}
                        accent={accent}
                        onClose={() => setOpenNav(null)}
                        onVisit={go}
                    />
                )}
            </AnimatePresence>

            {/* flash-wipe transition */}
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
// INTRO collage
interface TileConf {
    left: string
    top: string
    w: number
    h: number
    rot: number
    start: number
    pattern: "dots" | "lines" | "big" | "grad"
}
const introTiles: TileConf[] = [
    { left: "18%", top: "24%", w: 150, h: 180, rot: -6, start: 0.06, pattern: "dots" },
    { left: "70%", top: "18%", w: 170, h: 120, rot: 5, start: 0.1, pattern: "lines" },
    { left: "26%", top: "60%", w: 140, h: 140, rot: 4, start: 0.14, pattern: "grad" },
    { left: "64%", top: "58%", w: 180, h: 150, rot: -5, start: 0.18, pattern: "big" },
    { left: "80%", top: "40%", w: 120, h: 160, rot: 8, start: 0.22, pattern: "dots" },
    { left: "10%", top: "44%", w: 130, h: 110, rot: -8, start: 0.26, pattern: "lines" },
]

function IntroTile({
    p,
    conf,
    accent,
}: {
    p: MotionValue<number>
    conf: TileConf
    accent: string
}) {
    const { start } = conf
    const opacity = useTransform(
        p,
        [start, start + 0.08, 0.42, 0.52],
        [0, 1, 1, 0]
    )
    const y = useTransform(p, [start, start + 0.14], [40, 0])
    const s = useTransform(p, [start, start + 0.14], [0.8, 1])
    return (
        <motion.div
            style={{
                position: "absolute",
                left: conf.left,
                top: conf.top,
                width: conf.w,
                height: conf.h,
                rotate: conf.rot,
                opacity,
                y,
                scale: s,
                border: "3px solid #EDEDED",
                background: "#111",
                overflow: "hidden",
                zIndex: 1,
            }}
        >
            <TilePattern pattern={conf.pattern} accent={accent} />
        </motion.div>
    )
}

function TilePattern({
    pattern,
    accent,
}: {
    pattern: TileConf["pattern"]
    accent: string
}) {
    if (pattern === "dots")
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    background:
                        "radial-gradient(#EDEDED 30%, transparent 31%) 0 0/9px 9px, #111",
                }}
            />
        )
    if (pattern === "lines")
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    background:
                        "repeating-linear-gradient(45deg,#EDEDED 0 3px,#111 3px 8px)",
                }}
            />
        )
    if (pattern === "grad")
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    background:
                        "linear-gradient(135deg,#EDEDED,#111 70%)",
                }}
            />
        )
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                background: "#111",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#EDEDED",
                fontFamily: DISPLAY,
                fontSize: 60,
            }}
        >
            <span style={{ color: accent }}>✳</span>
        </div>
    )
}

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
                fontSize: "clamp(48px, 12vw, 176px)",
                lineHeight: 0.86,
                letterSpacing: -4,
                color: PAPER,
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

// ==========================================================================
// DESK
function DeskStage({
    name,
    role,
    accent,
    cases,
    scale,
    onCase,
    onNav,
}: {
    name: string
    role: string
    accent: string
    cases: CaseItem[]
    scale: number
    onCase: (href: string) => void
    onNav: (s: Section) => void
}) {
    const devices: Array<"laptop" | "monitor" | "tablet"> = [
        "laptop",
        "monitor",
        "tablet",
    ]
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
            <h1
                style={{
                    position: "absolute",
                    left: 0,
                    top: 8,
                    margin: 0,
                    fontFamily: DISPLAY,
                    fontSize: 60,
                    letterSpacing: -2,
                    lineHeight: 0.9,
                    textTransform: "uppercase",
                    zIndex: 8,
                }}
            >
                {name}
            </h1>
            <div
                style={{
                    position: "absolute",
                    left: 4,
                    top: 78,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    zIndex: 8,
                }}
            >
                <span style={{ width: 46, height: 10, background: accent }} />
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
                    top: 140,
                    right: 0,
                    height: STAGE_H - 140,
                    border: `2px solid ${INK}`,
                    background:
                        "radial-gradient(rgba(10,10,10,0.16) 22%, transparent 23%) 0 0/16px 16px, #E7E4DB",
                }}
            />

            {/* CASE STUDY device screens */}
            {cases.slice(0, 3).map((c, i) => (
                <CaseScreen
                    key={c.slug}
                    index={i}
                    item={c}
                    device={devices[i]}
                    accent={accent}
                    style={casePos[i]}
                    onClick={() => onCase(`/work/${c.slug}`)}
                />
            ))}

            {/* NAV objects (open pop-ups) */}
            <NavObject label="ABOUT" accent={accent} style={{ left: 44, top: 300 }} onClick={() => onNav("about")}>
                <Journal />
            </NavObject>
            <NavObject label="GALLERY" accent={accent} style={{ left: 1090, top: 210 }} onClick={() => onNav("gallery")}>
                <PhotoStack accent={accent} />
            </NavObject>
            <NavObject label="CLIENTS" accent={accent} style={{ left: 1095, top: 470 }} onClick={() => onNav("clients")}>
                <Rolodex />
            </NavObject>
            <NavObject label="CONTACT" accent={accent} style={{ left: 70, top: 560 }} onClick={() => onNav("contact")}>
                <Envelope accent={accent} />
            </NavObject>

            {/* decorative objects */}
            <Decoration style={{ left: 250, top: 630 }}>
                <Pen accent={accent} />
            </Decoration>
            <Decoration style={{ left: 980, top: 640 }}>
                <PostIt accent={accent} />
            </Decoration>

            <Corner pos={{ top: -30, right: 0 }}>[ NY / EST 2019 ]</Corner>
            <Corner pos={{ bottom: -34, left: 0 }}>studio@nabiashaikh.com</Corner>
            <Corner pos={{ bottom: -34, right: 0 }}>
                <Clock />
            </Corner>
        </div>
    )
}

const casePos: CSSProperties[] = [
    { left: 250, top: 240, width: 340, height: 250 }, // laptop
    { left: 660, top: 210, width: 300, height: 260 }, // monitor
    { left: 470, top: 500, width: 190, height: 240 }, // tablet
]

// ---- Case study device screens ----
function CaseScreen({
    index,
    item,
    device,
    accent,
    style,
    onClick,
}: {
    index: number
    item: CaseItem
    device: "laptop" | "monitor" | "tablet"
    accent: string
    style: CSSProperties
    onClick: () => void
}) {
    const [hover, setHover] = useState(false)
    const num = String(index + 1).padStart(2, "0")
    const still = (
        <Still title={item.label} tag={item.tag} num={num} accent={accent} invert={hover} />
    )
    return (
        <button
            type="button"
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onFocus={() => setHover(true)}
            onBlur={() => setHover(false)}
            aria-label={`Open case study: ${item.label}`}
            style={{
                position: "absolute",
                padding: 0,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                transform: hover ? "translateY(-6px) scale(1.03)" : "none",
                transition: "transform 0.09s ease-out",
                zIndex: hover ? 9 : 3,
                ...style,
            }}
        >
            {device === "laptop" && <Laptop accent={accent} hover={hover}>{still}</Laptop>}
            {device === "monitor" && <Monitor accent={accent} hover={hover}>{still}</Monitor>}
            {device === "tablet" && <Tablet accent={accent} hover={hover}>{still}</Tablet>}
        </button>
    )
}

function Still({
    title,
    tag,
    num,
    accent,
    invert,
}: {
    title: string
    tag: string
    num: string
    accent: string
    invert: boolean
}) {
    const fg = invert ? PAPER : INK
    const bg = invert ? INK : PAPER
    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                background: bg,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    flex: 1,
                    position: "relative",
                    backgroundImage: `radial-gradient(${fg} 30%, transparent 31%)`,
                    backgroundSize: "8px 8px",
                }}
            >
                <span
                    style={{
                        position: "absolute",
                        top: 6,
                        left: 6,
                        fontFamily: PIXEL,
                        fontSize: 10,
                        background: accent,
                        color: "#fff",
                        padding: "2px 5px",
                    }}
                >
                    CASE {num}
                </span>
            </div>
            <div
                style={{
                    background: fg,
                    color: bg,
                    padding: "6px 8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 6,
                }}
            >
                <span
                    style={{
                        fontFamily: DISPLAY,
                        fontSize: 13,
                        lineHeight: 1,
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                    }}
                >
                    {title}
                </span>
                <span style={{ fontFamily: MONO, fontSize: 9, opacity: 0.8, whiteSpace: "nowrap" }}>
                    {invert ? "OPEN ▸" : tag}
                </span>
            </div>
        </div>
    )
}

function Laptop({
    children,
    accent,
    hover,
}: {
    children: ReactNode
    accent: string
    hover: boolean
}) {
    const frame = hover ? accent : INK
    return (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
            <div
                style={{
                    flex: 1,
                    border: `5px solid ${frame}`,
                    borderRadius: "10px 10px 0 0",
                    background: frame,
                    padding: 5,
                    position: "relative",
                }}
            >
                <div style={{ position: "absolute", inset: 5, overflow: "hidden" }}>
                    {children}
                </div>
            </div>
            {/* base / keyboard deck */}
            <div style={{ position: "relative", height: 20 }}>
                <div
                    style={{
                        position: "absolute",
                        left: "-8%",
                        width: "116%",
                        height: 20,
                        background: PAPER,
                        border: `4px solid ${frame}`,
                        borderRadius: "0 0 8px 8px",
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            top: 2,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 60,
                            height: 4,
                            background: frame,
                            borderRadius: 3,
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

function Monitor({
    children,
    accent,
    hover,
}: {
    children: ReactNode
    accent: string
    hover: boolean
}) {
    const frame = hover ? accent : INK
    return (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
            <div
                style={{
                    flex: 1,
                    border: `6px solid ${frame}`,
                    borderRadius: 8,
                    background: frame,
                    padding: 6,
                    position: "relative",
                }}
            >
                <div style={{ position: "absolute", inset: 6, overflow: "hidden" }}>
                    {children}
                </div>
            </div>
            <div style={{ position: "relative", height: 34 }}>
                <div
                    style={{
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                        top: 0,
                        width: 34,
                        height: 20,
                        background: frame,
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                        bottom: 0,
                        width: 120,
                        height: 10,
                        background: frame,
                        borderRadius: 4,
                    }}
                />
            </div>
        </div>
    )
}

function Tablet({
    children,
    accent,
    hover,
}: {
    children: ReactNode
    accent: string
    hover: boolean
}) {
    const frame = hover ? accent : INK
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                border: `6px solid ${frame}`,
                borderRadius: 16,
                background: frame,
                padding: 6,
                position: "relative",
            }}
        >
            <div style={{ position: "absolute", inset: 6, overflow: "hidden", borderRadius: 6 }}>
                {children}
            </div>
            <div
                style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: PAPER,
                    zIndex: 2,
                }}
            />
        </div>
    )
}

// ---- Nav objects ----
function NavObject({
    label,
    accent,
    style,
    onClick,
    children,
}: {
    label: string
    accent: string
    style: CSSProperties
    onClick: () => void
    children: ReactNode
}) {
    const [hover, setHover] = useState(false)
    return (
        <button
            type="button"
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onFocus={() => setHover(true)}
            onBlur={() => setHover(false)}
            aria-label={`Open ${label}`}
            style={{
                position: "absolute",
                width: 120,
                height: 132,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                outline: "none",
                transform: hover ? "translateY(-4px) scale(1.06)" : "none",
                transition: "transform 0.08s ease-out",
                zIndex: hover ? 9 : 4,
                ...style,
            }}
        >
            <div
                style={{
                    width: 88,
                    height: 88,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    filter: hover ? "invert(1)" : "none",
                    transition: "filter 0.05s",
                }}
            >
                {children}
            </div>
            <span
                style={{
                    fontFamily: PIXEL,
                    fontSize: 12,
                    padding: "3px 8px",
                    background: hover ? accent : INK,
                    color: "#fff",
                    letterSpacing: 1,
                }}
            >
                [{label}]
            </span>
        </button>
    )
}

function Decoration({
    children,
    style,
}: {
    children: ReactNode
    style: CSSProperties
}) {
    const [hover, setHover] = useState(false)
    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                position: "absolute",
                width: 90,
                height: 90,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: hover ? "scale(1.06) rotate(-2deg)" : "none",
                transition: "transform 0.08s",
                zIndex: 4,
                ...style,
            }}
        >
            {children}
        </div>
    )
}

// ---- object art ----
function Journal() {
    return (
        <svg viewBox="0 0 88 88" width="88" height="88">
            <rect x="12" y="8" width="64" height="72" fill={INK} />
            <rect x="18" y="13" width="52" height="62" fill={PAPER} />
            <rect x="18" y="13" width="9" height="62" fill={INK} />
            <line x1="34" y1="28" x2="64" y2="28" stroke={INK} strokeWidth="3" />
            <line x1="34" y1="40" x2="64" y2="40" stroke={INK} strokeWidth="3" />
            <line x1="34" y1="52" x2="56" y2="52" stroke={INK} strokeWidth="3" />
        </svg>
    )
}
function PhotoStack({ accent }: { accent: string }) {
    return (
        <svg viewBox="0 0 88 88" width="88" height="88">
            <g transform="rotate(-8 44 44)">
                <rect x="12" y="18" width="64" height="52" fill={INK} />
                <rect x="16" y="22" width="56" height="36" fill={PAPER} />
            </g>
            <g transform="rotate(7 44 44)">
                <rect x="14" y="24" width="62" height="50" fill={INK} />
                <rect x="18" y="28" width="54" height="34" fill={PAPER} />
                <rect x="18" y="28" width="54" height="34" fill={accent} opacity="0.22" />
            </g>
        </svg>
    )
}
function Rolodex() {
    return (
        <svg viewBox="0 0 88 88" width="88" height="88">
            <rect x="8" y="38" width="72" height="42" fill={INK} />
            <rect x="14" y="16" width="60" height="38" fill={PAPER} stroke={INK} strokeWidth="3" />
            <rect x="24" y="9" width="40" height="28" fill={PAPER} stroke={INK} strokeWidth="3" />
            <line x1="32" y1="20" x2="58" y2="20" stroke={INK} strokeWidth="3" />
            <line x1="32" y1="28" x2="52" y2="28" stroke={INK} strokeWidth="3" />
        </svg>
    )
}
function Envelope({ accent }: { accent: string }) {
    return (
        <svg viewBox="0 0 88 88" width="88" height="88">
            <rect x="6" y="22" width="76" height="48" fill={PAPER} stroke={INK} strokeWidth="3" />
            <polyline points="6,24 44,52 82,24" fill="none" stroke={INK} strokeWidth="3" />
            <rect x="60" y="12" width="18" height="18" fill={accent} />
        </svg>
    )
}
function Pen({ accent }: { accent: string }) {
    return (
        <svg viewBox="0 0 90 90" width="90" height="90">
            <g transform="rotate(38 45 45)">
                <rect x="38" y="10" width="14" height="60" fill={INK} />
                <rect x="38" y="10" width="14" height="14" fill={accent} />
                <polygon points="38,70 52,70 45,84" fill={INK} />
            </g>
        </svg>
    )
}
function PostIt({ accent }: { accent: string }) {
    return (
        <svg viewBox="0 0 90 90" width="90" height="90">
            <rect x="12" y="12" width="66" height="66" fill={PAPER} stroke={INK} strokeWidth="3" />
            <rect x="12" y="12" width="66" height="12" fill={accent} />
            <line x1="22" y1="38" x2="68" y2="38" stroke={INK} strokeWidth="3" />
            <line x1="22" y1="50" x2="68" y2="50" stroke={INK} strokeWidth="3" />
            <line x1="22" y1="62" x2="52" y2="62" stroke={INK} strokeWidth="3" />
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
                color: INK,
                zIndex: 8,
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

// ---- Barbiana-style pop-up ----
function NavPopup({
    content,
    accent,
    onClose,
    onVisit,
}: {
    content: { label: string; heading: string; blurb: string; href: string }
    accent: string
    onClose: () => void
    onVisit: (href: string) => void
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 80,
                background: "rgba(10,10,10,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
                fontFamily: MONO,
            }}
        >
            <motion.div
                initial={{ scale: 0.92, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "#FFFFFF",
                    border: `1px solid ${INK}`,
                    width: "min(520px, 92vw)",
                    padding: "44px 34px 34px",
                    position: "relative",
                    textAlign: "center",
                }}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        fontFamily: MONO,
                        fontWeight: 700,
                        fontSize: 13,
                        letterSpacing: 1,
                        background: INK,
                        color: "#fff",
                        border: "none",
                        padding: "6px 10px",
                        cursor: "pointer",
                    }}
                >
                    X CLOSE
                </button>
                <div
                    style={{
                        fontFamily: PIXEL,
                        fontSize: 12,
                        letterSpacing: 1,
                        color: accent,
                        marginBottom: 10,
                    }}
                >
                    [{content.label}]
                </div>
                <h3
                    style={{
                        fontFamily: DISPLAY,
                        fontSize: 30,
                        margin: "0 0 14px",
                        textTransform: "uppercase",
                        letterSpacing: -1,
                    }}
                >
                    {content.heading}
                </h3>
                <p
                    style={{
                        fontFamily: "Inter, system-ui, sans-serif",
                        fontSize: 15,
                        lineHeight: 1.55,
                        margin: "0 auto 22px",
                        maxWidth: 380,
                        color: "#333",
                    }}
                >
                    {content.blurb}
                </p>
                <button
                    type="button"
                    onClick={() => onVisit(content.href)}
                    style={{
                        fontFamily: PIXEL,
                        fontSize: 14,
                        background: INK,
                        color: "#fff",
                        border: "none",
                        padding: "12px 20px",
                        cursor: "pointer",
                    }}
                >
                    ★ VISIT {content.label} ★
                </button>
            </motion.div>
        </motion.div>
    )
}

function MobileHome({
    name,
    role,
    accent,
    cases,
    onCase,
    onNav,
}: {
    name: string
    role: string
    accent: string
    cases: CaseItem[]
    onCase: (href: string) => void
    onNav: (s: Section) => void
}) {
    const navs: Section[] = ["about", "gallery", "clients", "contact"]
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
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 0 24px" }}>
                <span style={{ width: 30, height: 8, background: accent }} />
                <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1 }}>{role}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {cases.slice(0, 3).map((c, i) => (
                    <button
                        key={c.slug}
                        type="button"
                        onClick={() => onCase(`/work/${c.slug}`)}
                        style={{
                            textAlign: "left",
                            border: `4px solid ${INK}`,
                            borderRadius: "10px 10px 4px 4px",
                            background: INK,
                            padding: 5,
                            cursor: "pointer",
                        }}
                    >
                        <div style={{ height: 150, position: "relative", overflow: "hidden" }}>
                            <Still title={c.label} tag={c.tag} num={String(i + 1).padStart(2, "0")} accent={accent} invert={false} />
                        </div>
                    </button>
                ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 20 }}>
                {navs.map((n) => (
                    <button
                        key={n}
                        type="button"
                        onClick={() => onNav(n)}
                        style={{
                            fontFamily: PIXEL,
                            fontSize: 14,
                            textAlign: "center",
                            padding: "14px 8px",
                            background: INK,
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        [{n.toUpperCase()}]
                    </button>
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
                color: PAPER,
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
