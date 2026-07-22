import {
    useEffect,
    useMemo,
    useRef,
    useState,
    startTransition,
    type CSSProperties,
    type ReactNode,
} from "react"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import {
    addPropertyControls,
    ControlType,
    RenderTarget,
    useIsStaticRenderer,
} from "framer"

const STAGE_W = 1440
const STAGE_H = 900
const IMG = "https://framerusercontent.com/images/"

const HAND = '"Caveat", "Bradley Hand", cursive'
const SANS = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

interface Layer {
    key: string
    hash: string
    speaker?: boolean
}

// Full desk illustration, back-to-front. Each PNG is a full 1440x900 layer.
const LAYERS: Layer[] = [
    { key: "bg", hash: "uTiMeYZo7Cgq17Mt2w60JYMnptc" },
    { key: "archive", hash: "969XNx9nZpgbsuyO98EvRf52B4w" },
    { key: "book", hash: "JOsvv9IQCI9S3QH3r8xPjqZ1TI" },
    { key: "books-shelf", hash: "G3bxc0mGuO743uxAK388KbtY4I" },
    { key: "briefcase-calendar", hash: "NDoJcAe2hm9jNoRn1l3KPiH88kM" },
    { key: "calendar", hash: "DzcTOxISPyXrYPkt85OoeLa8xU" },
    { key: "candle-2", hash: "mmj4FpFExdTcUbHD14IPQxi8qQ" },
    { key: "candle-3", hash: "3CEfiYr6gW3dznxSGwG5vV2Y3Gs" },
    { key: "chutney", hash: "AwkrKCuhUkRurlYPAzFRI4yw" },
    { key: "desk", hash: "apgMzPB0YpfnsVlEtmJK4vj6V7w" },
    { key: "drawing", hash: "p7R3bXkBa9WKgoOEKsOgqN3a2I" },
    { key: "frame-drawing", hash: "JMyrLySIyEy37UGKKlp90Gz8kT4" },
    { key: "frames", hash: "FWWEXrr48rpOeVAiLvdcTtAtDk" },
    { key: "journal", hash: "JPLbpkF1Jd17vRUT1rfmmgPhfQ" },
    { key: "lamp", hash: "kePpxiZKZgE71A4q7vRCIyG462s" },
    { key: "laptop", hash: "ffeeCWEVauyRc2jUztvEkKArptM" },
    { key: "notes", hash: "52nGQQ7gLqDiguh8AvcoksZaBGI" },
    { key: "open-notebook", hash: "XJP4OGEVjXt8avb0NauKlPXYEY" },
    { key: "pen", hash: "HUSQF2KWYyoJf9K6yBPPi8er4zY" },
    { key: "pencil-holder", hash: "fBJigHoGaLK2A2qSzKnBjGiGf40" },
    { key: "phone", hash: "iokbHxpk1MBj2DyMk1qoueeeQM" },
    { key: "picture-frame", hash: "uZt8h5TY4pUVBCIx0Y3iyYh9FhY" },
    { key: "projects-books", hash: "z3PLroDJfbET05ZaDmzpA5lIAk" },
    { key: "radiobox", hash: "ezRTuCWZT8OYPcOsXUDyRi4c4U" },
    { key: "shelf-2", hash: "lsHg2RONYFapvMXeWvu0IShYhg" },
    { key: "shelf-3", hash: "g8SoHQvfBK9tK1bOg6EhAtrOOQw" },
    { key: "sooraj", hash: "O3MmyItiSJFvHk9GjYSG9NdqSc" },
    { key: "speaker-2", hash: "WbJK42XfFic3S8Ck9Y79PHKQoOo", speaker: true },
    { key: "speaker-3", hash: "ZdbAuzrVhSzXzYUeUKkeZcwgq3Q", speaker: true },
    { key: "speaker-4", hash: "r1m4VNIbBxNgDDbxWkFTXXgKQTU", speaker: true },
    { key: "sticky-empty-1", hash: "BQDJ4rDXxap6hjzD0KdpsCrF4o" },
    { key: "sticky-empty-2", hash: "ovf3WMo3EmcNAF49KAlKzd4lbt0" },
    { key: "sticky", hash: "Ks4KMbXjOzLJjGMxHdmGi4llY" },
    { key: "tablet", hash: "XaBwWgmK8aSgBbpn75GnNY4hRY" },
    { key: "tea", hash: "fyEQ0Kjs1B3bcThyj0H2oEfaZ8" },
    { key: "to-dos", hash: "qrSvY1tFyoVSVjN0zBNJIezPs" },
    { key: "water", hash: "0zrrCMhZXsiu2gFjthkfNhc1pA" },
    { key: "work-laptop", hash: "0MCjhgOZbTIBiUWnZJdrkiXZSoA" },
    { key: "book-2", hash: "JOsvv9IQCI9S3QH3r8xPjqZ1TI" },
    { key: "candle-2b", hash: "mmj4FpFExdTcUbHD14IPQxi8qQ" },
    { key: "candle-4", hash: "3CEfiYr6gW3dznxSGwG5vV2Y3Gs" },
    { key: "sooraj-2", hash: "O3MmyItiSJFvHk9GjYSG9NdqSc" },
]

type Action = "popup" | "page" | "sound"
interface Click {
    key: string
    box: [number, number, number, number]
    label: string
    action: Action
    href?: string
    jiggle?: string[]
    labelPos?: "above" | "below"
    popup?: { heading: string; blurb: string; href?: string; visit?: string }
}

const CLICKS: Click[] = [
    {
        key: "archive",
        box: [329, 292, 384, 140],
        label: "ARCHIVE",
        action: "page",
        href: "/archive",
    },
    {
        key: "laptop",
        box: [570, 526, 354, 245],
        label: "WORK",
        action: "page",
        href: "/work",
        jiggle: ["laptop", "work-laptop"],
        labelPos: "below",
    },
    {
        key: "projects-books",
        box: [560, 95, 190, 150],
        label: "PROJECTS",
        action: "popup",
        labelPos: "below",
        popup: {
            heading: "PROJECT BOOKS",
            blurb: "The work I keep coming back to — full case studies live on the work laptop.",
        },
    },
    {
        key: "radiobox",
        box: [366, 51, 190, 133],
        label: "SOUND",
        action: "sound",
        labelPos: "below",
    },
    {
        key: "journal",
        box: [241, 717, 167, 126],
        label: "JOURNAL",
        action: "popup",
        popup: {
            heading: "THE JOURNAL",
            blurb: "Day-to-day notes, sketches, and process. Mostly thinking out loud.",
        },
    },
    {
        key: "notes",
        box: [1056, 691, 113, 88],
        label: "NOTES",
        action: "popup",
        popup: {
            heading: "STICKY BRAIN",
            blurb: "Configs, wireframes and reminders I swear I'll get to.",
        },
    },
    {
        key: "chutney",
        box: [542, 493, 84, 75],
        label: "CHUTNEY",
        action: "popup",
        popup: {
            heading: "CHUTNEY STUDIOS",
            blurb: "My after-hours studio — branding and sites for small, good-taste brands.",
            visit: "VISIT STUDIO",
            href: "/about",
        },
    },
    {
        key: "phone",
        box: [963, 717, 100, 98],
        label: "CALL",
        action: "popup",
        popup: {
            heading: "SAY HELLO",
            blurb: "Ring ring. Email or a DM works too — I actually pick up.",
            visit: "CONTACT ME",
            href: "/contact",
        },
    },
    {
        key: "briefcase-calendar",
        box: [388, 485, 76, 68],
        label: "SCHEDULE",
        action: "popup",
        popup: {
            heading: "THE SCHEDULE",
            blurb: "Booked with client work + content. Grab a slot if you want to team up.",
        },
    },
    {
        key: "sooraj",
        box: [556, 428, 68, 60],
        label: "SOORAJ",
        action: "popup",
        popup: {
            heading: "SOORAJ",
            blurb: "A little friend keeping me company on the desk. Say hi.",
        },
    },
]
// large hotspots first so small ones sit on top and stay clickable
const CLICKS_ORDERED = [...CLICKS].sort(
    (a, b) => b.box[2] * b.box[3] - a.box[2] * a.box[3]
)

interface DeskWorkspaceProps {
    welcomeText: string
    accent: string
    style?: CSSProperties
}

/**
 * Desk Workspace — Nabia's illustrated desk (layered PNGs). A welcome message
 * dissolves in, then the desk is "placed" element-by-element. Objects jiggle on
 * hover, the radio toggles rain sound (speakers appear when playing), and each
 * object opens a pop-up — except the work laptop and archive, which are pages.
 *
 * @framerIntrinsicWidth 1440
 * @framerIntrinsicHeight 900
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function DeskWorkspace(props: DeskWorkspaceProps) {
    const {
        welcomeText = "hey, welcome to my workspace",
        accent = "#2C6BE0",
    } = props

    const isStatic = useIsStaticRenderer()
    const [reduced, setReduced] = useState(false)
    const [vp, setVp] = useState({ w: STAGE_W, h: STAGE_H })

    useEffect(() => {
        if (typeof window === "undefined") return
        const rm = window.matchMedia("(prefers-reduced-motion: reduce)")
        const f = () =>
            startTransition(() => {
                setReduced(rm.matches)
                setVp({ w: window.innerWidth, h: window.innerHeight })
            })
        f()
        window.addEventListener("resize", f)
        return () => window.removeEventListener("resize", f)
    }, [])

    const animated = !isStatic && !reduced
    const [phase, setPhase] = useState<"welcome" | "placing" | "ready">(
        animated ? "welcome" : "ready"
    )
    useEffect(() => {
        if (!animated) {
            setPhase("ready")
            return
        }
        const t1 = window.setTimeout(
            () => startTransition(() => setPhase("placing")),
            2300
        )
        const t2 = window.setTimeout(
            () => startTransition(() => setPhase("ready")),
            3400
        )
        return () => {
            window.clearTimeout(t1)
            window.clearTimeout(t2)
        }
    }, [animated])

    const scale = useMemo(() => {
        const pad = vp.w < 820 ? 8 : 48
        return Math.max(
            0.2,
            Math.min((vp.w - pad) / STAGE_W, (vp.h - pad) / STAGE_H, 1.1)
        )
    }, [vp])

    const [hovered, setHovered] = useState<string | null>(null)
    const [popup, setPopup] = useState<Click | null>(null)
    const [flash, setFlash] = useState(false)

    // ---- rain sound ----
    const [soundOn, setSoundOn] = useState(true)
    const [playing, setPlaying] = useState(false)
    const audioRef = useRef<{
        ctx: AudioContext
        gain: GainNode
        src: AudioBufferSourceNode
    } | null>(null)

    const startRain = () => {
        if (typeof window === "undefined" || audioRef.current) {
            audioRef.current?.ctx.resume()
            setPlaying(true)
            return
        }
        try {
            const AC =
                window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext })
                    .webkitAudioContext
            const ctx = new AC()
            const size = 2 * ctx.sampleRate
            const buffer = ctx.createBuffer(1, size, ctx.sampleRate)
            const data = buffer.getChannelData(0)
            for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1
            const src = ctx.createBufferSource()
            src.buffer = buffer
            src.loop = true
            const hp = ctx.createBiquadFilter()
            hp.type = "highpass"
            hp.frequency.value = 380
            const lp = ctx.createBiquadFilter()
            lp.type = "lowpass"
            lp.frequency.value = 1100
            const gain = ctx.createGain()
            gain.gain.value = 0.055
            src.connect(hp)
            hp.connect(lp)
            lp.connect(gain)
            gain.connect(ctx.destination)
            src.start()
            audioRef.current = { ctx, gain, src }
            setPlaying(true)
        } catch {
            /* ignore */
        }
    }
    const stopRain = () => {
        audioRef.current?.ctx.suspend()
        setPlaying(false)
    }

    // start rain on first gesture if enabled (autoplay policy)
    useEffect(() => {
        if (isStatic) return
        const onGesture = () => {
            if (soundOn) startRain()
            window.removeEventListener("pointerdown", onGesture)
        }
        window.addEventListener("pointerdown", onGesture)
        return () => window.removeEventListener("pointerdown", onGesture)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isStatic, soundOn])

    function toggleSound() {
        if (soundOn) {
            setSoundOn(false)
            stopRain()
        } else {
            setSoundOn(true)
            startRain()
        }
    }

    function activate(c: Click) {
        if (c.action === "sound") return toggleSound()
        if (c.action === "page" && c.href) {
            setFlash(true)
            window.setTimeout(() => {
                window.location.href = c.href as string
            }, 260)
            return
        }
        setPopup(c)
    }

    if (RenderTarget.current() === RenderTarget.thumbnail) {
        return (
            <img
                src={`${IMG}uTiMeYZo7Cgq17Mt2w60JYMnptc.png`}
                alt="Desk"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
        )
    }

    const jiggleFor = (key: string): boolean => {
        if (!hovered) return false
        const c = CLICKS.find((x) => x.key === hovered)
        if (!c) return false
        return c.key === key || (c.jiggle?.includes(key) ?? false)
    }

    return (
        <div
            onPointerDown={() => {
                if (soundOn && !playing) startRain()
            }}
            style={{
                position: "relative",
                width: "100%",
                minHeight: "100vh",
                background: "#F3EFE6",
                overflow: "hidden",
                fontFamily: SANS,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                ...props.style,
            }}
        >
            <link
                href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&display=swap"
                rel="stylesheet"
            />

            <div
                style={{
                    width: STAGE_W,
                    height: STAGE_H,
                    transform: `scale(${scale})`,
                    transformOrigin: "center center",
                    position: "relative",
                    flex: "none",
                }}
            >
                {/* layers */}
                <motion.div
                    variants={containerVariants}
                    initial={animated ? "hidden" : "visible"}
                    animate={phase === "welcome" ? "hidden" : "visible"}
                    style={{ position: "absolute", inset: 0 }}
                >
                    {LAYERS.map((l) => {
                        if (l.speaker) {
                            return (
                                <motion.img
                                    key={l.key}
                                    src={`${IMG}${l.hash}.png`}
                                    alt=""
                                    animate={{
                                        opacity: playing ? 1 : 0,
                                        scale: playing ? [1, 1.015, 1] : 1,
                                    }}
                                    transition={{
                                        opacity: { duration: 0.4 },
                                        scale: {
                                            duration: 0.9,
                                            repeat: playing ? Infinity : 0,
                                        },
                                    }}
                                    style={layerImgStyle}
                                />
                            )
                        }
                        const active = jiggleFor(l.key)
                        return (
                            <motion.div
                                key={l.key}
                                variants={itemVariants}
                                style={{ position: "absolute", inset: 0 }}
                            >
                                <motion.img
                                    src={`${IMG}${l.hash}.png`}
                                    alt=""
                                    animate={
                                        active
                                            ? { rotate: [0, -3, 3, -2, 1, 0], scale: 1.03 }
                                            : { rotate: 0, scale: 1 }
                                    }
                                    transition={
                                        active
                                            ? { duration: 0.55, ease: "easeInOut" }
                                            : { duration: 0.2 }
                                    }
                                    style={{
                                        ...layerImgStyle,
                                        transformOrigin: originFor(l.key),
                                    }}
                                />
                            </motion.div>
                        )
                    })}
                </motion.div>

                {/* hotspots + labels */}
                {phase !== "welcome" && (
                    <div style={{ position: "absolute", inset: 0, zIndex: 20 }}>
                        {CLICKS_ORDERED.map((c) => (
                            <Hotspot
                                key={c.key}
                                c={c}
                                accent={accent}
                                soundOn={soundOn}
                                onEnter={() => setHovered(c.key)}
                                onLeave={() =>
                                    setHovered((h) => (h === c.key ? null : h))
                                }
                                onClick={() => activate(c)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* welcome */}
            <AnimatePresence>
                {phase === "welcome" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.9 }}
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "#F3EFE6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 40,
                            padding: 24,
                        }}
                    >
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            style={{
                                margin: 0,
                                fontFamily: HAND,
                                fontSize: "clamp(34px, 6vw, 72px)",
                                color: "#111",
                                textAlign: "center",
                                fontWeight: 700,
                            }}
                        >
                            {welcomeText}
                        </motion.h1>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* pop-up */}
            <AnimatePresence>
                {popup && popup.popup && (
                    <Popup
                        title={popup.popup.heading}
                        blurb={popup.popup.blurb}
                        visit={popup.popup.visit}
                        href={popup.popup.href}
                        accent={accent}
                        onClose={() => setPopup(null)}
                        onVisit={(h) => {
                            setPopup(null)
                            setFlash(true)
                            window.setTimeout(() => {
                                window.location.href = h
                            }, 260)
                        }}
                    />
                )}
            </AnimatePresence>

            {/* flash-wipe */}
            <AnimatePresence>
                {flash && (
                    <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.24, ease: "easeIn" }}
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "#111",
                            transformOrigin: "bottom",
                            zIndex: 90,
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

const layerImgStyle: CSSProperties = {
    position: "absolute",
    left: 0,
    top: 0,
    width: STAGE_W,
    height: STAGE_H,
    pointerEvents: "none",
    userSelect: "none",
}

const containerVariants: Variants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.09, delayChildren: 0.15 },
    },
}
const itemVariants: Variants = {
    hidden: { opacity: 0, y: -26, scale: 0.92 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 19 },
    },
}

function originFor(key: string): string {
    const c = CLICKS.find((x) => x.key === key || x.jiggle?.includes(key))
    if (!c) return "center"
    const [x, y, w, h] = c.box
    return `${((x + w / 2) / STAGE_W) * 100}% ${((y + h / 2) / STAGE_H) * 100}%`
}

function Hotspot({
    c,
    accent,
    soundOn,
    onEnter,
    onLeave,
    onClick,
}: {
    c: Click
    accent: string
    soundOn: boolean
    onEnter: () => void
    onLeave: () => void
    onClick: () => void
}) {
    const [x, y, w, h] = c.box
    const below = c.labelPos === "below"
    const label =
        c.action === "sound" ? (soundOn ? "SOUND ON" : "SOUND OFF") : c.label
    return (
        <button
            type="button"
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            onFocus={onEnter}
            onBlur={onLeave}
            onClick={onClick}
            aria-label={c.label}
            style={{
                position: "absolute",
                left: x,
                top: y,
                width: w,
                height: h,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: 0,
                outline: "none",
            }}
        >
            <span
                style={{
                    position: "absolute",
                    left: "50%",
                    [below ? "bottom" : "top"]: -26,
                    transform: "translateX(-50%)",
                    background: accent,
                    color: "#fff",
                    fontFamily: SANS,
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: 0.6,
                    padding: "3px 8px",
                    borderRadius: 4,
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                    pointerEvents: "none",
                } as CSSProperties}
            >
                {label}
            </span>
        </button>
    )
}

function Popup({
    title,
    blurb,
    visit,
    href,
    accent,
    onClose,
    onVisit,
}: {
    title: string
    blurb: string
    visit?: string
    href?: string
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
                background: "rgba(30,26,18,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
            }}
        >
            <motion.div
                initial={{ scale: 0.92, y: 12 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "#fff",
                    border: "1.5px solid #111",
                    width: "min(500px, 92vw)",
                    padding: "48px 34px 34px",
                    position: "relative",
                    textAlign: "center",
                    fontFamily: SANS,
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
                        fontFamily: SANS,
                        fontWeight: 700,
                        fontSize: 13,
                        letterSpacing: 1,
                        background: "#111",
                        color: "#fff",
                        border: "none",
                        padding: "6px 10px",
                        cursor: "pointer",
                    }}
                >
                    X CLOSE
                </button>
                <h3
                    style={{
                        fontFamily: HAND,
                        fontSize: 40,
                        margin: "0 0 12px",
                        color: "#111",
                    }}
                >
                    {title}
                </h3>
                <p
                    style={{
                        fontSize: 16,
                        lineHeight: 1.55,
                        margin: "0 auto",
                        maxWidth: 360,
                        color: "#333",
                    }}
                >
                    {blurb}
                </p>
                {visit && href && (
                    <button
                        type="button"
                        onClick={() => onVisit(href)}
                        style={{
                            marginTop: 22,
                            fontFamily: SANS,
                            fontWeight: 700,
                            fontSize: 14,
                            letterSpacing: 0.5,
                            background: accent,
                            color: "#fff",
                            border: "none",
                            padding: "12px 20px",
                            cursor: "pointer",
                            borderRadius: 4,
                        }}
                    >
                        ★ {visit} ★
                    </button>
                )}
            </motion.div>
        </motion.div>
    )
}

addPropertyControls(DeskWorkspace, {
    welcomeText: {
        type: ControlType.String,
        title: "Welcome",
        defaultValue: "hey, welcome to my workspace",
    },
    accent: { type: ControlType.Color, title: "Label Color", defaultValue: "#2C6BE0" },
})
