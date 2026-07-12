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
    useScroll,
    useSpring,
    useTransform,
    useMotionValueEvent,
    AnimatePresence,
    type MotionValue,
} from "framer-motion"
import {
    addPropertyControls,
    ControlType,
    RenderTarget,
    useIsStaticRenderer,
} from "framer"

// --- Design stage. Objects are positioned inside this fixed coordinate space
// and the whole stage is scaled to fit the viewport, so layout math stays simple.
const STAGE_W = 1280
const STAGE_H = 800

interface Project {
    title: string
    subtitle: string
    slug: string
    accent: string
}

interface Social {
    label: string
    url: string
}

interface DeskSceneProps {
    name: string
    welcome: string
    scrollLength: number
    deskTop: string
    deskBottom: string
    projects: Project[]
    bookingUrl: string
    email: string
    socials: Social[]
    style?: CSSProperties
}

const HAND_FONT =
    '"Caveat", "Bradley Hand", "Comic Sans MS", cursive'
const SANS =
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

/**
 * Desk Scene
 *
 * A single top-down desk. Opens with the laptop closed; scroll drives a pinned
 * hero where the lid lifts to reveal the projects. Desk objects are hover-only
 * atmosphere except the phone and business card, which are real navigation.
 *
 * @framerIntrinsicWidth 1280
 * @framerIntrinsicHeight 800
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function DeskScene(props: DeskSceneProps) {
    const {
        name = "Nabia",
        welcome = "Hey, I'm Nabia. Pull up a chair.",
        scrollLength = 320,
        deskTop = "#C9A46B",
        deskBottom = "#A9814B",
        projects = defaultProjects,
        bookingUrl = "https://calendly.com/",
        email = "hello@nabia.design",
        socials = defaultSocials,
    } = props

    const isStatic = useIsStaticRenderer()

    // Environment: full scroll-jack experience, reduced motion, or mobile.
    const [mode, setMode] = useState<"full" | "reduced" | "mobile">("full")
    const [viewport, setViewport] = useState({ w: STAGE_W, h: STAGE_H })

    useEffect(() => {
        if (typeof window === "undefined") return
        const reduceMedia = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        )
        const compute = () => {
            const w = window.innerWidth
            const h = window.innerHeight
            const isMobile = w < 820
            startTransition(() => {
                setViewport({ w, h })
                setMode(
                    isMobile ? "mobile" : reduceMedia.matches ? "reduced" : "full"
                )
            })
        }
        compute()
        window.addEventListener("resize", compute)
        reduceMedia.addEventListener?.("change", compute)
        return () => {
            window.removeEventListener("resize", compute)
            reduceMedia.removeEventListener?.("change", compute)
        }
    }, [])

    const scrollJacked = mode === "full" && !isStatic

    // Fit the stage into the viewport (contain), leaving a little breathing room.
    const scale = useMemo(() => {
        const pad = mode === "mobile" ? 24 : 80
        const fitW = (viewport.w - pad) / STAGE_W
        const fitH = (viewport.h - pad) / STAGE_H
        const s = Math.min(fitW, fitH)
        return Math.max(0.2, Math.min(s, 1.15))
    }, [viewport, mode])

    // --- Scroll → 0..1 progress, spring-smoothed (the "lerp" the brief wants).
    const outerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: outerRef,
        offset: ["start start", "end end"],
    })
    const smooth = useSpring(scrollYProgress, {
        stiffness: 120,
        damping: 26,
        mass: 0.6,
    })

    // In non-scroll modes (reduced motion / mobile / canvas) the lid is open,
    // with a gentle spring intro instead of the scroll-jack.
    const introOpen = useSpring(scrollJacked ? 0 : 1, {
        stiffness: 90,
        damping: 22,
    })
    useEffect(() => {
        if (!scrollJacked) introOpen.set(1)
    }, [scrollJacked, introOpen])

    const openAmount: MotionValue<number> = scrollJacked ? smooth : introOpen

    // Track progress in state so we can toggle interactivity / hints.
    const [open01, setOpen01] = useState(scrollJacked ? 0 : 1)
    useMotionValueEvent(openAmount, "change", (v) => {
        startTransition(() => setOpen01(v))
    })
    useEffect(() => {
        if (!scrollJacked) setOpen01(1)
    }, [scrollJacked])

    const lidUnlocked = open01 > 0.92

    // Laptop lid: closed (folded flat over keyboard) → open (upright, facing us).
    const lidRotate = useTransform(openAmount, [0, 1], [-96, 0])
    const screenGlow = useTransform(openAmount, [0.55, 1], [0, 1])
    const cameraScale = useTransform(openAmount, [0, 1], [0.94, 1.06])
    const cameraY = useTransform(openAmount, [0, 1], [10, -8])

    // --- Load + welcome sequence.
    const [phase, setPhase] = useState<"load" | "welcome" | "ready">(
        isStatic ? "ready" : "load"
    )
    useEffect(() => {
        if (isStatic) return
        const t1 = window.setTimeout(
            () => startTransition(() => setPhase("welcome")),
            350
        )
        const t2 = window.setTimeout(
            () => startTransition(() => setPhase("ready")),
            2900
        )
        return () => {
            window.clearTimeout(t1)
            window.clearTimeout(t2)
        }
    }, [isStatic])

    const deskDim = phase === "welcome" ? 0.72 : 1
    const showScrollHint =
        scrollJacked && phase === "ready" && open01 < 0.06

    // --- Sound (opt-in). Short synthesized ticks via WebAudio; no assets.
    const [soundOn, setSoundOn] = useState(false)
    const audioRef = useRef<AudioContext | null>(null)
    const playTick = (freq: number) => {
        if (!soundOn || typeof window === "undefined") return
        try {
            const AC =
                window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext })
                    .webkitAudioContext
            if (!audioRef.current) audioRef.current = new AC()
            const ctx = audioRef.current
            const now = ctx.currentTime
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.type = "triangle"
            osc.frequency.setValueAtTime(freq, now)
            gain.gain.setValueAtTime(0.0001, now)
            gain.gain.exponentialRampToValueAtTime(0.06, now + 0.01)
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16)
            osc.connect(gain).connect(ctx.destination)
            osc.start(now)
            osc.stop(now + 0.18)
        } catch {
            // ignore audio failures
        }
    }

    // --- Nav overlays.
    const [overlay, setOverlay] = useState<null | "book" | "card">(null)
    const touchReveal = mode === "mobile"

    if (RenderTarget.current() === RenderTarget.thumbnail) {
        return <ThumbPreview deskTop={deskTop} deskBottom={deskBottom} />
    }

    const outerHeight = scrollJacked ? `${scrollLength}vh` : "100vh"

    return (
        <div
            ref={outerRef}
            style={{
                position: "relative",
                width: "100%",
                height: outerHeight,
                background: `radial-gradient(120% 80% at 50% 30%, ${deskTop} 0%, ${deskBottom} 78%)`,
                fontFamily: SANS,
                ...props.style,
            }}
        >
            <link
                href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&display=swap"
                rel="stylesheet"
            />
            {/* Pinned viewport */}
            <div
                style={{
                    position: scrollJacked ? "sticky" : "relative",
                    top: 0,
                    height: "100vh",
                    width: "100%",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {/* Vignette for depth */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background:
                            "radial-gradient(70% 60% at 50% 45%, rgba(0,0,0,0) 40%, rgba(60,35,10,0.28) 100%)",
                        pointerEvents: "none",
                    }}
                />

                {/* Scaled stage (fit-to-viewport wrapper + camera motion) */}
                <div
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: "center center",
                        opacity: deskDim,
                        transition: "opacity 0.7s ease",
                    }}
                >
                    <motion.div
                        style={{
                            position: "relative",
                            width: STAGE_W,
                            height: STAGE_H,
                            y: cameraY,
                            scale: cameraScale,
                        }}
                    >
                    <WoodGrain />

                    {/* Decorative, hover-only objects */}
                    <DeskObject
                        style={{ left: 96, top: 96, width: 210, height: 250 }}
                        label="Three years in, still taking notes."
                        touchReveal={touchReveal}
                        onHoverSound={() => playTick(320)}
                        rotate={-6}
                    >
                        <Journal />
                    </DeskObject>

                    <DeskObject
                        style={{ left: 930, top: 78, width: 190, height: 190 }}
                        label="Interfaces you don't have to think about."
                        touchReveal={touchReveal}
                        onHoverSound={() => playTick(520)}
                        rotate={7}
                    >
                        <PostIt color="#FFD34E" />
                    </DeskObject>

                    <DeskObject
                        style={{ left: 62, top: 470, width: 176, height: 176 }}
                        label="9–5 designer. After hours: Chutney Studios."
                        touchReveal={touchReveal}
                        onHoverSound={() => playTick(480)}
                        rotate={-4}
                    >
                        <PostIt color="#8FD8C6" />
                    </DeskObject>

                    <DeskObject
                        style={{ left: 470, top: 96, width: 340, height: 90 }}
                        label="Mid-sketch on something."
                        touchReveal={touchReveal}
                        onHoverSound={() => playTick(700)}
                        rotate={-14}
                    >
                        <Pen />
                    </DeskObject>

                    <DeskObject
                        style={{ left: 1040, top: 470, width: 180, height: 190 }}
                        label="Running on iced coffee & Figma."
                        touchReveal={touchReveal}
                        onHoverSound={() => playTick(260)}
                        rotate={0}
                    >
                        <Mug />
                    </DeskObject>

                    {/* Second monitor — passive craft demo, looping UI motion */}
                    <DeskObject
                        style={{ left: 862, top: 250, width: 300, height: 210 }}
                        label="A little motion study, always looping."
                        touchReveal={touchReveal}
                        onHoverSound={() => playTick(600)}
                        rotate={0}
                        lift={2}
                    >
                        <SecondMonitor animate={!isStatic} />
                    </DeskObject>

                    {/* The laptop — signature element */}
                    <div
                        style={{
                            position: "absolute",
                            left: STAGE_W / 2 - 300,
                            top: 250,
                            width: 600,
                            height: 440,
                            perspective: 1500,
                            perspectiveOrigin: "50% 40%",
                        }}
                    >
                        {/* base / keyboard deck */}
                        <div
                            style={{
                                position: "absolute",
                                left: 0,
                                bottom: 0,
                                width: 600,
                                height: 360,
                                transformStyle: "preserve-3d",
                                transform: "rotateX(64deg)",
                                transformOrigin: "50% 100%",
                            }}
                        >
                            <LaptopBase />
                        </div>

                        {/* lid */}
                        <motion.div
                            style={{
                                position: "absolute",
                                left: 60,
                                bottom: 150,
                                width: 480,
                                height: 300,
                                transformOrigin: "50% 100%",
                                transformStyle: "preserve-3d",
                                rotateX: lidRotate,
                            }}
                        >
                            <LaptopScreen
                                glow={screenGlow}
                                projects={projects}
                                interactive={lidUnlocked}
                                name={name}
                                onHoverSound={() => playTick(440)}
                            />
                        </motion.div>
                    </div>

                    {/* Phone — real nav (book a call) */}
                    <DeskObject
                        style={{ left: 250, top: 545, width: 150, height: 210 }}
                        label="Give me a call →"
                        touchReveal={touchReveal}
                        isNav
                        ariaLabel="Book a call"
                        onActivate={() => {
                            playTick(760)
                            setOverlay("book")
                        }}
                        onHoverSound={() => playTick(760)}
                        rotate={-8}
                    >
                        <Phone />
                    </DeskObject>

                    {/* Business card — real nav (contact) */}
                    <DeskObject
                        style={{ left: 800, top: 588, width: 300, height: 170 }}
                        label="Say hello ✻"
                        touchReveal={touchReveal}
                        isNav
                        ariaLabel="Contact details"
                        onActivate={() => {
                            playTick(300)
                            setOverlay("card")
                        }}
                        onHoverSound={() => playTick(300)}
                        rotate={6}
                    >
                        <BusinessCard name={name} />
                    </DeskObject>
                    </motion.div>
                </div>

                {/* Welcome message */}
                <AnimatePresence>
                    {phase === "welcome" && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.6 }}
                            style={{
                                position: "absolute",
                                top: "22%",
                                left: 0,
                                right: 0,
                                textAlign: "center",
                                fontFamily: HAND_FONT,
                                fontSize: "clamp(28px, 4vw, 52px)",
                                color: "#3a2410",
                                pointerEvents: "none",
                                textShadow: "0 1px 0 rgba(255,255,255,0.25)",
                            }}
                        >
                            {welcome}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Scroll hint */}
                <AnimatePresence>
                    {showScrollHint && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: "absolute",
                                bottom: 34,
                                left: 0,
                                right: 0,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 6,
                                color: "#3a2410",
                                fontFamily: HAND_FONT,
                                fontSize: 22,
                                pointerEvents: "none",
                            }}
                        >
                            <span>scroll to open</span>
                            <motion.div
                                animate={{ y: [0, 7, 0] }}
                                transition={{ duration: 1.4, repeat: Infinity }}
                                style={{ fontSize: 20, lineHeight: 1 }}
                            >
                                ⌄
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Sound toggle */}
                <button
                    type="button"
                    aria-pressed={soundOn}
                    aria-label={soundOn ? "Mute ambient sound" : "Enable ambient sound"}
                    onClick={() => {
                        setSoundOn((s) => !s)
                        playTick(500)
                    }}
                    style={{
                        position: "absolute",
                        bottom: 20,
                        right: 20,
                        width: 42,
                        height: 42,
                        borderRadius: 999,
                        border: "1px solid rgba(58,36,16,0.25)",
                        background: "rgba(255,252,244,0.7)",
                        backdropFilter: "blur(6px)",
                        color: "#3a2410",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                    }}
                >
                    {soundOn ? "♪" : "🔇"}
                </button>
            </div>

            {/* Overlays */}
            <AnimatePresence>
                {overlay && (
                    <Overlay onClose={() => setOverlay(null)}>
                        {overlay === "book" ? (
                            <BookPanel bookingUrl={bookingUrl} />
                        ) : (
                            <CardPanel
                                name={name}
                                email={email}
                                socials={socials}
                            />
                        )}
                    </Overlay>
                )}
            </AnimatePresence>
        </div>
    )
}

// --------------------------------------------------------------------------
// Interactive desk object wrapper: hover lift + handwritten tooltip, or nav.
// --------------------------------------------------------------------------
interface DeskObjectProps {
    style: CSSProperties
    label: string
    children: ReactNode
    touchReveal?: boolean
    isNav?: boolean
    ariaLabel?: string
    rotate?: number
    lift?: number
    onActivate?: () => void
    onHoverSound?: () => void
}

function DeskObject(props: DeskObjectProps) {
    const {
        style,
        label,
        children,
        touchReveal,
        isNav,
        ariaLabel,
        rotate = 0,
        lift = 4,
        onActivate,
        onHoverSound,
    } = props
    const [active, setActive] = useState(false)

    const show = () => {
        setActive(true)
        onHoverSound?.()
    }
    const hide = () => setActive(false)

    const handleClick = () => {
        if (touchReveal && !active) {
            show()
            return
        }
        onActivate?.()
    }

    return (
        <div
            role={isNav ? "button" : undefined}
            tabIndex={isNav ? 0 : undefined}
            aria-label={ariaLabel}
            onMouseEnter={touchReveal ? undefined : show}
            onMouseLeave={touchReveal ? undefined : hide}
            onFocus={show}
            onBlur={hide}
            onClick={handleClick}
            onKeyDown={(e) => {
                if (isNav && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault()
                    onActivate?.()
                }
            }}
            style={{
                position: "absolute",
                cursor: isNav ? "pointer" : "default",
                outline: "none",
                ...style,
            }}
        >
            <motion.div
                animate={{
                    y: active ? -(lift + 4) : 0,
                    rotate: active ? rotate * 0.6 : rotate,
                    filter: active
                        ? "drop-shadow(0 18px 20px rgba(40,22,4,0.34))"
                        : "drop-shadow(0 8px 12px rgba(40,22,4,0.22))",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{ width: "100%", height: "100%" }}
            >
                {children}
            </motion.div>

            <AnimatePresence>
                {active && (
                    <motion.div
                        initial={{ opacity: 0, y: 6, rotate: -3 }}
                        animate={{ opacity: 1, y: 0, rotate: -3 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.18 }}
                        style={{
                            position: "absolute",
                            left: "50%",
                            top: -18,
                            transform: "translateX(-50%)",
                            background: "#FFFDF5",
                            color: "#2c1c0c",
                            fontFamily: HAND_FONT,
                            fontSize: 22,
                            lineHeight: 1.05,
                            padding: "8px 14px",
                            borderRadius: 4,
                            whiteSpace: "nowrap",
                            boxShadow: "0 8px 16px rgba(40,22,4,0.28)",
                            border: "1px solid rgba(44,28,12,0.12)",
                            pointerEvents: "none",
                            zIndex: 40,
                        }}
                    >
                        {label}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// --------------------------------------------------------------------------
// Object art (SVG / CSS)
// --------------------------------------------------------------------------
function WoodGrain() {
    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                borderRadius: 18,
                background:
                    "repeating-linear-gradient(96deg, rgba(120,80,35,0.10) 0px, rgba(120,80,35,0.10) 2px, rgba(160,120,70,0.04) 4px, rgba(120,80,35,0.10) 9px)",
                mixBlendMode: "multiply",
                opacity: 0.5,
                pointerEvents: "none",
            }}
        />
    )
}

function Journal() {
    return (
        <svg viewBox="0 0 210 250" width="100%" height="100%">
            <rect x="8" y="10" width="194" height="232" rx="12" fill="#5a3b22" />
            <rect x="14" y="16" width="182" height="220" rx="10" fill="#6d4a2c" />
            <rect x="20" y="22" width="170" height="208" rx="8" fill="#f4ead3" />
            <rect x="20" y="22" width="18" height="208" rx="6" fill="#7a5433" />
            <line x1="60" y1="60" x2="170" y2="60" stroke="#c9b89a" strokeWidth="3" />
            <line x1="60" y1="86" x2="170" y2="86" stroke="#c9b89a" strokeWidth="3" />
            <line x1="60" y1="112" x2="150" y2="112" stroke="#c9b89a" strokeWidth="3" />
            <circle cx="150" cy="10" r="8" fill="#caa64a" />
        </svg>
    )
}

function PostIt({ color }: { color: string }) {
    return (
        <svg viewBox="0 0 190 190" width="100%" height="100%">
            <rect x="10" y="14" width="170" height="168" rx="4" fill={color} />
            <rect
                x="72"
                y="6"
                width="46"
                height="26"
                rx="2"
                fill="rgba(255,255,255,0.45)"
            />
        </svg>
    )
}

function Pen() {
    return (
        <svg viewBox="0 0 340 90" width="100%" height="100%">
            <rect x="6" y="34" width="300" height="20" rx="10" fill="#2f2a4a" />
            <rect x="270" y="34" width="46" height="20" rx="10" fill="#c9c2e8" />
            <polygon points="6,44 -18,44 6,34 6,54" fill="#e7b96b" />
            <polygon points="-8,44 -22,44 -8,40 -8,48" fill="#3a3a3a" />
            <rect x="120" y="34" width="16" height="20" fill="#5a5480" />
        </svg>
    )
}

function Mug() {
    return (
        <svg viewBox="0 0 180 190" width="100%" height="100%">
            <ellipse cx="90" cy="150" rx="70" ry="24" fill="#7a5433" opacity="0.25" />
            <circle cx="90" cy="95" r="66" fill="#efe9df" />
            <circle cx="90" cy="95" r="52" fill="#c9803f" />
            <circle cx="90" cy="95" r="40" fill="#6f3f1e" />
        </svg>
    )
}

function SecondMonitor({ animate }: { animate: boolean }) {
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                borderRadius: 14,
                background: "#1c1c22",
                border: "6px solid #111114",
                overflow: "hidden",
                position: "relative",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    inset: 10,
                    borderRadius: 6,
                    background:
                        "linear-gradient(120deg,#3b2f6e,#7457c9 40%,#d17bb0 80%)",
                    overflow: "hidden",
                }}
            >
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        animate={
                            animate
                                ? { x: ["-40%", "120%"] }
                                : { x: "40%" }
                        }
                        transition={{
                            duration: 3 + i,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.4,
                        }}
                        style={{
                            position: "absolute",
                            top: 24 + i * 34,
                            height: 14,
                            width: 90,
                            borderRadius: 8,
                            background: "rgba(255,255,255,0.65)",
                        }}
                    />
                ))}
            </div>
        </div>
    )
}

function LaptopBase() {
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                borderRadius: 22,
                background: "linear-gradient(180deg,#d8d9de,#b6b8bf)",
                boxShadow: "inset 0 -8px 16px rgba(0,0,0,0.18)",
                position: "relative",
                border: "2px solid #c4c6cc",
            }}
        >
            {/* trackpad */}
            <div
                style={{
                    position: "absolute",
                    bottom: 26,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 180,
                    height: 96,
                    borderRadius: 10,
                    background: "rgba(0,0,0,0.06)",
                    border: "1px solid rgba(0,0,0,0.08)",
                }}
            />
            {/* keys */}
            <div
                style={{
                    position: "absolute",
                    top: 30,
                    left: 40,
                    right: 40,
                    height: 150,
                    display: "grid",
                    gridTemplateColumns: "repeat(14,1fr)",
                    gridAutoRows: "1fr",
                    gap: 6,
                }}
            >
                {Array.from({ length: 70 }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            background: "#3a3a40",
                            borderRadius: 4,
                            boxShadow: "0 2px 0 rgba(0,0,0,0.35)",
                        }}
                    />
                ))}
            </div>
        </div>
    )
}

function LaptopScreen({
    glow,
    projects,
    interactive,
    name,
    onHoverSound,
}: {
    glow: MotionValue<number>
    projects: Project[]
    interactive: boolean
    name: string
    onHoverSound: () => void
}) {
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                borderRadius: "16px 16px 8px 8px",
                background: "#101014",
                border: "8px solid #17171c",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 -6px 18px rgba(0,0,0,0.25)",
            }}
        >
            {/* backlight */}
            <motion.div
                style={{
                    position: "absolute",
                    inset: 8,
                    borderRadius: 8,
                    background:
                        "linear-gradient(160deg,#faf7f0,#efe9dc)",
                    opacity: glow,
                }}
            />
            <motion.div
                style={{
                    position: "absolute",
                    inset: 8,
                    borderRadius: 8,
                    padding: 18,
                    opacity: glow,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    pointerEvents: interactive ? "auto" : "none",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "#2c1c0c",
                    }}
                >
                    <span
                        style={{
                            fontFamily: HAND_FONT,
                            fontSize: 26,
                            fontWeight: 700,
                        }}
                    >
                        {name}'s work
                    </span>
                    <span
                        style={{
                            marginLeft: "auto",
                            display: "flex",
                            gap: 6,
                        }}
                    >
                        <Dot c="#ff5f57" />
                        <Dot c="#febc2e" />
                        <Dot c="#28c840" />
                    </span>
                </div>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 12,
                        flex: 1,
                    }}
                >
                    {projects.slice(0, 4).map((p) => (
                        <a
                            key={p.slug}
                            href={`/work/${p.slug}`}
                            onMouseEnter={onHoverSound}
                            style={{
                                textDecoration: "none",
                                borderRadius: 10,
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column",
                                background: "#fff",
                                border: "1px solid rgba(44,28,12,0.1)",
                                boxShadow: "0 4px 10px rgba(40,22,4,0.08)",
                                transition: "transform 0.18s ease",
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform =
                                    "translateY(-3px)"
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = "none"
                            }}
                        >
                            <div
                                style={{
                                    height: 54,
                                    background: p.accent,
                                }}
                            />
                            <div style={{ padding: "8px 10px" }}>
                                <div
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 700,
                                        color: "#2c1c0c",
                                    }}
                                >
                                    {p.title}
                                </div>
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: "#8a7a68",
                                    }}
                                >
                                    {p.subtitle}
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}

function Dot({ c }: { c: string }) {
    return (
        <span
            style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: c,
                display: "inline-block",
            }}
        />
    )
}

function Phone() {
    return (
        <svg viewBox="0 0 150 210" width="100%" height="100%">
            <rect x="10" y="6" width="130" height="198" rx="22" fill="#15151a" />
            <rect x="18" y="14" width="114" height="182" rx="16" fill="#2b2740" />
            <rect
                x="18"
                y="14"
                width="114"
                height="182"
                rx="16"
                fill="url(#pg)"
                opacity="0.5"
            />
            <defs>
                <linearGradient id="pg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#7457c9" />
                    <stop offset="1" stopColor="#d17bb0" />
                </linearGradient>
            </defs>
            <rect x="56" y="20" width="38" height="7" rx="4" fill="#15151a" />
            <text
                x="75"
                y="118"
                textAnchor="middle"
                fontSize="42"
                fill="#fff"
            >
                ☎
            </text>
        </svg>
    )
}

function BusinessCard({ name }: { name: string }) {
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                borderRadius: 12,
                background: "linear-gradient(135deg,#fffdf6,#f2ead8)",
                border: "1px solid rgba(44,28,12,0.12)",
                padding: "18px 22px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 4,
            }}
        >
            <div
                style={{
                    fontFamily: HAND_FONT,
                    fontSize: 30,
                    color: "#2c1c0c",
                    fontWeight: 700,
                }}
            >
                {name} Shaikh
            </div>
            <div style={{ fontSize: 13, color: "#8a7a68", letterSpacing: 1 }}>
                UI / UX DESIGNER
            </div>
        </div>
    )
}

// --------------------------------------------------------------------------
// Overlays
// --------------------------------------------------------------------------
function Overlay({
    children,
    onClose,
}: {
    children: ReactNode
    onClose: () => void
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 60,
                background: "rgba(30,18,6,0.5)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
            }}
        >
            <motion.div
                initial={{ scale: 0.92, y: 12 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.94, y: 8 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "#fffdf6",
                    borderRadius: 18,
                    width: "min(560px, 92vw)",
                    maxHeight: "84vh",
                    overflow: "auto",
                    padding: 26,
                    position: "relative",
                    boxShadow: "0 24px 60px rgba(20,12,4,0.4)",
                }}
            >
                <button
                    type="button"
                    aria-label="Close"
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: 14,
                        right: 14,
                        width: 34,
                        height: 34,
                        borderRadius: 999,
                        border: "none",
                        background: "rgba(44,28,12,0.08)",
                        cursor: "pointer",
                        fontSize: 16,
                        color: "#2c1c0c",
                    }}
                >
                    ✕
                </button>
                {children}
            </motion.div>
        </motion.div>
    )
}

function BookPanel({ bookingUrl }: { bookingUrl: string }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h2
                style={{
                    margin: 0,
                    fontFamily: HAND_FONT,
                    fontSize: 40,
                    color: "#2c1c0c",
                }}
            >
                Let's talk
            </h2>
            <p style={{ margin: 0, color: "#6a5a48", fontSize: 15 }}>
                Grab a free 20-minute call — tell me what you're building.
            </p>
            <a
                href={bookingUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                    marginTop: 6,
                    textAlign: "center",
                    padding: "14px 20px",
                    borderRadius: 12,
                    background: "#2c1c0c",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: 15,
                }}
            >
                Book a call →
            </a>
        </div>
    )
}

function CardPanel({
    name,
    email,
    socials,
}: {
    name: string
    email: string
    socials: Social[]
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h2
                style={{
                    margin: 0,
                    fontFamily: HAND_FONT,
                    fontSize: 40,
                    color: "#2c1c0c",
                }}
            >
                {name} Shaikh
            </h2>
            <a
                href={`mailto:${email}`}
                style={{
                    color: "#2c1c0c",
                    fontSize: 16,
                    fontWeight: 600,
                    textDecoration: "none",
                }}
            >
                {email}
            </a>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {socials.map((s) => (
                    <a
                        key={s.label}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            padding: "8px 14px",
                            borderRadius: 999,
                            border: "1px solid rgba(44,28,12,0.16)",
                            color: "#2c1c0c",
                            textDecoration: "none",
                            fontSize: 14,
                        }}
                    >
                        {s.label}
                    </a>
                ))}
            </div>
        </div>
    )
}

function ThumbPreview({
    deskTop,
    deskBottom,
}: {
    deskTop: string
    deskBottom: string
}) {
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                minHeight: 200,
                background: `radial-gradient(120% 80% at 50% 30%, ${deskTop}, ${deskBottom})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: HAND_FONT,
                fontSize: 34,
                color: "#3a2410",
            }}
        >
            the desk
        </div>
    )
}

const defaultProjects: Project[] = [
    {
        title: "Fintech App",
        subtitle: "Onboarding redesign",
        slug: "fintech-app",
        accent: "#7457c9",
    },
    {
        title: "Health Platform",
        subtitle: "Design system",
        slug: "health-platform",
        accent: "#28a06a",
    },
    {
        title: "Chutney Studios",
        subtitle: "Brand + site",
        slug: "chutney-studios",
        accent: "#d17bb0",
    },
    {
        title: "Travel App",
        subtitle: "0→1 product",
        slug: "travel-app",
        accent: "#e0902f",
    },
]

const defaultSocials: Social[] = [
    { label: "LinkedIn", url: "https://linkedin.com/" },
    { label: "Dribbble", url: "https://dribbble.com/" },
    { label: "Instagram", url: "https://instagram.com/" },
]

addPropertyControls(DeskScene, {
    name: { type: ControlType.String, title: "Name", defaultValue: "Nabia" },
    welcome: {
        type: ControlType.String,
        title: "Welcome",
        defaultValue: "Hey, I'm Nabia. Pull up a chair.",
        displayTextArea: true,
    },
    scrollLength: {
        type: ControlType.Number,
        title: "Scroll Length",
        defaultValue: 320,
        min: 180,
        max: 500,
        step: 10,
        unit: "vh",
    },
    deskTop: {
        type: ControlType.Color,
        title: "Desk Top",
        defaultValue: "#C9A46B",
    },
    deskBottom: {
        type: ControlType.Color,
        title: "Desk Bottom",
        defaultValue: "#A9814B",
    },
    bookingUrl: {
        type: ControlType.Link,
        title: "Booking URL",
    },
    email: {
        type: ControlType.String,
        title: "Email",
        defaultValue: "hello@nabia.design",
    },
    projects: {
        type: ControlType.Array,
        title: "Projects",
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String, defaultValue: "Project" },
                subtitle: { type: ControlType.String, defaultValue: "" },
                slug: { type: ControlType.String, defaultValue: "project" },
                accent: { type: ControlType.Color, defaultValue: "#7457c9" },
            },
        },
        defaultValue: defaultProjects,
        maxCount: 4,
    },
    socials: {
        type: ControlType.Array,
        title: "Socials",
        control: {
            type: ControlType.Object,
            controls: {
                label: { type: ControlType.String, defaultValue: "Link" },
                url: { type: ControlType.Link },
            },
        },
        defaultValue: defaultSocials,
    },
})
