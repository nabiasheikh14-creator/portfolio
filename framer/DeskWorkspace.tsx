import {
    useEffect,
    useMemo,
    useRef,
    useState,
    startTransition,
    type CSSProperties,
    type ReactNode,
} from "react"
import { createPortal } from "react-dom"
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

const STAGE_W = 1440
const STAGE_H = 900
const INTRO_VH = 480
/** Phone / small-tablet: shorter scroll intro so the desk arrives sooner. */
const INTRO_VH_PHONE = 220
const PHONE_MQ = "(max-width: 809.98px)"
const IMG = "https://framerusercontent.com/images/"

const ANNIE = '"Annie Use Your Telescope", "Bradley Hand", cursive'
const INTER =
    '"Inter Display", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
const INK = "#111111"
const MUTED = "#444444"

interface Layer {
    key: string
    hash: string
    speaker?: boolean
}

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

const REVEAL_ORDER = [
    "bg",
    "desk",
    "shelf-2",
    "shelf-3",
    "books-shelf",
    "lamp",
    "frames",
    "frame-drawing",
    "drawing",
    "picture-frame",
    "archive",
    "book",
    "book-2",
    "calendar",
    "briefcase-calendar",
    "projects-books",
    "radiobox",
    "candle-2",
    "candle-3",
    "candle-2b",
    "candle-4",
    "tea",
    "water",
    "pencil-holder",
    "pen",
    "tablet",
    "chutney",
    "sooraj",
    "sooraj-2",
    "laptop",
    "work-laptop",
    "open-notebook",
    "notes",
    "to-dos",
    "sticky",
    "sticky-empty-1",
    "sticky-empty-2",
    "phone",
    "journal",
]
const REVEAL_START = 0.08
const REVEAL_END = 0.96

type PopupKind =
    | "experience"
    | "schedule"
    | "socials"
    | "chutney"
    | "substack"
    | "about"
    | "techstack"

interface TechTool {
    name: string
    logoUrl?: string
}

type Action = "popup" | "page" | "sound"
interface Click {
    key: string
    box: [number, number, number, number]
    label: string
    action: Action
    href?: string
    jiggle?: string[]
    labelPos?: "above" | "below"
    popupKind?: PopupKind
}

const CLICK_DEFS: Click[] = [
    {
        key: "archive",
        // Shelf archive boxes (label sits above the cardboard stack).
        box: [310, 285, 380, 155],
        label: "ARCHIVE",
        action: "page",
        href: "/archive",
    },
    {
        key: "laptop",
        // Full laptop including the on-screen "WORK" word + trackpad label.
        // Smaller neighbors (Chutney / Schedule) still paint above this hit area.
        box: [555, 430, 370, 330],
        label: "WORK",
        action: "page",
        href: "/work",
        jiggle: ["laptop", "work-laptop"],
        labelPos: "below",
    },
    {
        key: "projects-books",
        box: [560, 95, 190, 150],
        label: "EXPERIENCE",
        action: "popup",
        popupKind: "experience",
        labelPos: "below",
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
        label: "GET TO KNOW ME",
        action: "popup",
        popupKind: "about",
    },
    {
        key: "notes",
        box: [1056, 691, 113, 88],
        label: "SUBSTACK",
        action: "popup",
        popupKind: "substack",
    },
    {
        key: "chutney",
        box: [542, 493, 84, 75],
        label: "CHUTNEY STUDIOS",
        action: "popup",
        popupKind: "chutney",
    },
    {
        key: "phone",
        box: [963, 717, 100, 98],
        label: "SOCIALS",
        action: "popup",
        popupKind: "socials",
    },
    {
        key: "briefcase-calendar",
        box: [388, 485, 76, 68],
        label: "SCHEDULE",
        action: "popup",
        popupKind: "schedule",
    },
    {
        key: "sticky",
        // White sticky note on the desk (sticky.png content ~837–913 × 368–509).
        box: [820, 355, 110, 165],
        label: "TECH STACK",
        action: "popup",
        popupKind: "techstack",
        jiggle: ["sticky"],
        labelPos: "above",
    },
]

/** Framer Link controls may return a string or `{ href }`. */
function resolveLink(value: unknown, fallback = ""): string {
    if (value == null || value === "") return fallback
    if (typeof value === "string") {
        const s = value.trim()
        return s || fallback
    }
    if (typeof value === "object" && value && "href" in (value as object)) {
        const h = String((value as { href?: unknown }).href || "").trim()
        return h || fallback
    }
    return fallback
}

function buildClicks(workLink: string, archiveLink: string): Click[] {
    return CLICK_DEFS.map((c) => {
        if (c.key === "laptop") return { ...c, href: workLink }
        if (c.key === "archive") return { ...c, href: archiveLink }
        return c
    })
}

interface ExperienceJob {
    company: string
    role: string
    duration: string
    status: string
    learning1: string
    learning2: string
    learning3: string
    learning4: string
    order?: number
    slug?: string
}

interface DeskWorkspaceProps {
    welcomeText: string
    accent: string
    cream: string
    ink: string
    muted: string
    welcomeSize: number
    labelSize: number
    deskScale: number
    font?: { fontFamily?: string }
    displayFont?: { fontFamily?: string }
    experience: ExperienceJob[]
    clients: string[]
    email: string
    instagramUrl: string
    linkedinUrl: string
    /** Editable page link for the WORK laptop hotspot. */
    workLink: string
    /** Editable page link for the ARCHIVE shelf hotspot. */
    archiveLink: string
    scheduleMessage: string
    socialsMessage: string
    chutneyHeading: string
    chutneyText: string
    chutneyImage: string
    chutneyLink: string
    chutneyLinkLabel: string
    substackText: string
    substackImage: string
    substackUrl: string
    aboutMessage: string
    aboutImage: string
    techStackMessage: string
    techStackTools: TechTool[]
    /** Radio track URL (mp3). Defaults to Belle & Sebastian — Wrapped Up In Books (live). */
    radioTrackUrl?: string
    /** Optional UI tick sound file (mp3/wav/ogg). Empty = built-in synth tick. */
    tickSound?: string
    style?: CSSProperties
}

/** Live recording of “Wrapped Up In Books” — Belle & Sebastian (Archive.org LMA). */
const DEFAULT_RADIO_TRACK =
    "https://archive.org/download/BS2023-07-14.dpa/2023-07-14%20Institute%2C%20Birmingham%2C%20England/2023-07-14_belle_and_sebastian_02.mp3"

function playUiClick() {
    try {
        const w = window as Window & { __nabiaPlayClick?: () => void }
        w.__nabiaPlayClick?.()
    } catch {
        /* ignore */
    }
}

/**
 * Desk Workspace — illustrated desk homepage.
 * Labels open in-page popups (no sticky/mascot crops inside modals).
 * Experience is CMS-backed; Schedule / Socials / Chutney / Substack / About
 * are structured popups editable via property controls.
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
        cream = "#F3EFE6",
        ink = "#111111",
        muted = "#444444",
        welcomeSize = 72,
        labelSize = 12,
        deskScale = 1,
        experience = DEFAULT_EXPERIENCE,
        clients = DEFAULT_CLIENTS,
        email = "hello@example.com",
        instagramUrl = "https://instagram.com/",
        linkedinUrl = "https://linkedin.com/",
        workLink = "/work",
        archiveLink = "/archive",
        scheduleMessage = "My calendar fills with client work and content days — but I always make room for thoughtful collaborations. Drop me a note and tell me what you're building.",
        socialsMessage = "Bits of process, finished pieces, and the occasional desk snack — find me on the apps I actually check.",
        chutneyHeading = "Chutney Studios",
        chutneyText = "My after-hours studio — branding and sites for small, good-taste brands.",
        chutneyImage = "",
        chutneyLink = "https://",
        chutneyLinkLabel = "Visit studio",
        substackText = "Hey, naming side quests I have a substack too! Follow my writing",
        substackImage = "",
        substackUrl = "https://substack.com/",
        aboutMessage = "Hi — I'm Nabia. I design calm, considered interfaces and brand moments for wellness and lifestyle teams. Pull up a chair.",
        aboutImage = "",
        techStackMessage = DEFAULT_TECH_STACK_MESSAGE,
        techStackTools = DEFAULT_TECH_STACK_TOOLS,
        radioTrackUrl = DEFAULT_RADIO_TRACK,
        tickSound = "",
    } = props
    const family = props.font?.fontFamily || INTER
    const displayFamily = props.displayFont?.fontFamily || ANNIE
    const deskScaleSafe = Math.max(0.7, Math.min(1.4, Number(deskScale) || 1))
    const trackUrl = resolveRadioUrl(radioTrackUrl) || DEFAULT_RADIO_TRACK
    const tickUrl = resolveRadioUrl(tickSound)
    const workHref = resolveLink(workLink, "/work")
    const archiveHref = resolveLink(archiveLink, "/archive")
    const igHref = resolveLink(instagramUrl, "https://instagram.com/")
    const liHref = resolveLink(linkedinUrl, "https://linkedin.com/")
    const chutneyHref = resolveLink(chutneyLink, "")
    const substackHref = resolveLink(substackUrl, "https://substack.com/")

    const clicks = useMemo(
        () => buildClicks(workHref, archiveHref),
        [workHref, archiveHref],
    )
    const clicksOrdered = useMemo(
        () =>
            [...clicks].sort(
                (a, b) => b.box[2] * b.box[3] - a.box[2] * a.box[3],
            ),
        [clicks],
    )

    const isStatic = useIsStaticRenderer()
    const [reduced, setReduced] = useState(false)
    const [isPhone, setIsPhone] = useState(false)
    const [vp, setVp] = useState({ w: STAGE_W, h: STAGE_H })

    useEffect(() => {
        if (typeof window === "undefined" || isStatic) return
        const w = window as Window & {
            __nabiaSetTickSoundUrl?: (url: string) => void
            __nabiaTickSoundUrl?: string
        }
        if (w.__nabiaSetTickSoundUrl) w.__nabiaSetTickSoundUrl(tickUrl)
        else w.__nabiaTickSoundUrl = tickUrl
    }, [tickUrl, isStatic])

    useEffect(() => {
        if (typeof window === "undefined") return
        const rm = window.matchMedia("(prefers-reduced-motion: reduce)")
        const phone = window.matchMedia(PHONE_MQ)
        const f = () =>
            startTransition(() => {
                setReduced(rm.matches)
                setIsPhone(phone.matches)
                setVp({ w: window.innerWidth, h: window.innerHeight })
            })
        f()
        window.addEventListener("resize", f)
        phone.addEventListener?.("change", f)
        return () => {
            window.removeEventListener("resize", f)
            phone.removeEventListener?.("change", f)
        }
    }, [])

    const animated = !isStatic && !reduced
    const introVh = isPhone ? INTRO_VH_PHONE : INTRO_VH

    const rootRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: rootRef,
        offset: ["start start", "end end"],
    })
    const p = useSpring(scrollYProgress, { stiffness: 80, damping: 26, mass: 0.6 })

    const welcomeOpacity = useTransform(p, [0, 0.08], [1, 0])

    // Desktop keeps cover (fills the viewport). Phone uses contain so the full
    // desk + hotspot labels stay readable without changing desktop crop.
    const scale = useMemo(() => {
        const sx = vp.w / STAGE_W
        const sy = vp.h / STAGE_H
        const fit = isPhone ? Math.min(sx, sy) : Math.max(sx, sy)
        return fit * deskScaleSafe
    }, [vp, deskScaleSafe, isPhone])

    const [hovered, setHovered] = useState<string | null>(null)
    const [popup, setPopup] = useState<Click | null>(null)
    // All desk interactions (page links, popups, hover jiggles) unlock together
    // once the welcome fades and the illustration starts revealing.
    const [deskReady, setDeskReady] = useState(!animated)
    useMotionValueEvent(p, "change", (v) => {
        startTransition(() => setDeskReady(v > REVEAL_START))
    })
    useEffect(() => {
        if (!animated) setDeskReady(true)
    }, [animated])

    const [soundOn, setSoundOn] = useState(true)
    const [playing, setPlaying] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const ensureRadio = () => {
        if (typeof window === "undefined") return null
        if (audioRef.current) return audioRef.current
        const audio = new Audio(trackUrl)
        audio.loop = true
        audio.preload = "auto"
        audio.volume = 0.55
        audioRef.current = audio
        return audio
    }

    const startRadio = async () => {
        const audio = ensureRadio()
        if (!audio) return
        try {
            const abs = new URL(trackUrl, window.location.href).href
            if (audio.src !== abs) {
                audio.src = trackUrl
                audio.load()
            }
            await audio.play()
            setPlaying(true)
        } catch {
            setPlaying(false)
        }
    }

    const stopRadio = () => {
        const audio = audioRef.current
        if (!audio) return
        audio.pause()
        setPlaying(false)
    }

    useEffect(() => {
        return () => {
            const audio = audioRef.current
            if (!audio) return
            audio.pause()
            audioRef.current = null
        }
    }, [])

    useEffect(() => {
        if (isStatic) return
        const onGesture = () => {
            if (soundOn) void startRadio()
            window.removeEventListener("pointerdown", onGesture)
        }
        window.addEventListener("pointerdown", onGesture)
        return () => window.removeEventListener("pointerdown", onGesture)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isStatic, soundOn, trackUrl])

    function toggleSound() {
        if (soundOn) {
            setSoundOn(false)
            stopRadio()
        } else {
            setSoundOn(true)
            void startRadio()
        }
    }

    function activate(c: Click) {
        playUiClick()
        if (c.action === "sound") return toggleSound()
        if (c.action === "page" && c.href) {
            // Page hotspots are real <a href> — native navigation handles routing.
            // (A previous full-screen "flash" overlay could get stuck and block all clicks.)
            return
        }
        // Replace any open modal so popup targets never feel stuck/dead.
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
        const c = clicks.find((x) => x.key === hovered)
        if (!c) return false
        return c.key === key || (c.jiggle?.includes(key) ?? false)
    }
    const revealCount = REVEAL_ORDER.length

    const jobs = normalizeExperience(experience)

    return (
        <div
            ref={rootRef}
            onPointerDown={() => {
                if (soundOn && !playing) void startRadio()
            }}
            style={{
                position: "relative",
                width: "100%",
                height: animated ? `${introVh}vh` : undefined,
                minHeight: animated ? undefined : "100vh",
                background: cream,
                fontFamily: family,
                ...stripSize(props.style),
            }}
        >
            <link
                href="https://fonts.googleapis.com/css2?family=Annie+Use+Your+Telescope&family=Inter:wght@300;400;500;600;700&display=swap"
                rel="stylesheet"
            />

            <div
                style={{
                    position: animated ? "sticky" : "relative",
                    top: 0,
                    height: "100vh",
                    width: "100%",
                    overflow: "hidden",
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
                        flex: "none",
                    }}
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
                        const ri = REVEAL_ORDER.indexOf(l.key)
                        const idx = ri < 0 ? revealCount - 1 : ri
                        const t =
                            REVEAL_START +
                            (idx / (revealCount - 1)) * (REVEAL_END - REVEAL_START)
                        return (
                            <RevealLayer
                                key={l.key}
                                src={`${IMG}${l.hash}.png`}
                                p={p}
                                threshold={t}
                                show={!animated}
                                active={jiggleFor(l.key)}
                                origin={originFor(l.key, clicks)}
                            />
                        )
                    })}

                    {/* One hotspot stack: Work/Archive + popups/hovers share hit-testing.
                        Always interactive so adding CMS/images can't leave the desk "dead".
                        Smaller targets render later so they stay above large page hit-areas. */}
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            zIndex: 20,
                            pointerEvents: "auto",
                        }}
                    >
                        {clicksOrdered.map((c) => (
                            <Hotspot
                                key={c.key}
                                c={c}
                                accent={accent}
                                family={family}
                                labelSize={labelSize}
                                soundOn={soundOn}
                                visible={deskReady || !animated}
                                onEnter={() => setHovered(c.key)}
                                onLeave={() =>
                                    setHovered((h) => (h === c.key ? null : h))
                                }
                                onClick={() => activate(c)}
                            />
                        ))}
                    </div>
                </div>

                <AnimatePresence>
                    {animated && (
                        <>
                            <motion.div
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    background: cream,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    zIndex: 40,
                                    padding: 24,
                                    opacity: welcomeOpacity,
                                    pointerEvents: "none",
                                }}
                            >
                                <motion.h1
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{
                                        duration: 2,
                                        ease: "easeInOut",
                                        delay: 0.3,
                                    }}
                                    style={{
                                        margin: 0,
                                        fontFamily: displayFamily,
                                        fontSize: isPhone
                                            ? `clamp(34px, 9vw, 52px)`
                                            : `clamp(${Math.round(welcomeSize * 0.55)}px, 7vw, ${welcomeSize}px)`,
                                        // Always hard ink — some cursive webfonts paint nearly invisible
                                        // when color is inherited through motion layers.
                                        color: "#111111",
                                        WebkitTextFillColor: "#111111",
                                        textAlign: "center",
                                        fontWeight: 400,
                                        lineHeight: 1.1,
                                        maxWidth: isPhone ? "16ch" : undefined,
                                        padding: isPhone ? "0 12px" : undefined,
                                    }}
                                >
                                    {welcomeText}
                                </motion.h1>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {popup?.popupKind === "experience" && (
                    <ExperiencePopup
                        jobs={jobs}
                        clients={clients}
                        accent={accent}
                        family={family}
                        displayFamily={displayFamily}
                        ink={ink}
                        muted={muted}
                        onClose={() => setPopup(null)}
                    />
                )}
                {popup?.popupKind === "schedule" && (
                    <SchedulePopup
                        email={email}
                        message={scheduleMessage}
                        accent={accent}
                        family={family}
                        displayFamily={displayFamily}
                        cream={cream}
                        ink={ink}
                        muted={muted}
                        onClose={() => setPopup(null)}
                    />
                )}
                {popup?.popupKind === "socials" && (
                    <SocialsPopup
                        instagramUrl={igHref}
                        linkedinUrl={liHref}
                        message={socialsMessage}
                        accent={accent}
                        family={family}
                        displayFamily={displayFamily}
                        cream={cream}
                        ink={ink}
                        muted={muted}
                        onClose={() => setPopup(null)}
                    />
                )}
                {popup?.popupKind === "chutney" && (
                    <MediaCtaPopup
                        heading={chutneyHeading}
                        text={chutneyText}
                        image={chutneyImage}
                        link={chutneyHref}
                        linkLabel={chutneyLinkLabel}
                        accent={accent}
                        family={family}
                        displayFamily={displayFamily}
                        ink={ink}
                        muted={muted}
                        onClose={() => setPopup(null)}
                    />
                )}
                {popup?.popupKind === "substack" && (
                    <MediaCtaPopup
                        heading="Substack"
                        text={substackText}
                        image={substackImage}
                        link={substackHref}
                        linkLabel="Read on Substack"
                        accent={accent}
                        family={family}
                        displayFamily={displayFamily}
                        ink={ink}
                        muted={muted}
                        handwritten
                        onClose={() => setPopup(null)}
                    />
                )}
                {popup?.popupKind === "about" && (
                    <AboutPopup
                        message={aboutMessage}
                        image={aboutImage}
                        accent={accent}
                        family={family}
                        displayFamily={displayFamily}
                        ink={ink}
                        muted={muted}
                        onClose={() => setPopup(null)}
                    />
                )}
                {popup?.popupKind === "techstack" && (
                    <TechStackPopup
                        message={techStackMessage}
                        tools={techStackTools}
                        accent={accent}
                        family={family}
                        displayFamily={displayFamily}
                        ink={ink}
                        muted={muted}
                        onClose={() => setPopup(null)}
                    />
                )}
            </AnimatePresence>

        </div>
    )
}

function stripSize(style?: CSSProperties): CSSProperties {
    if (!style) return {}
    const next = { ...style }
    delete next.width
    delete next.height
    delete next.minWidth
    delete next.minHeight
    delete next.maxWidth
    delete next.maxHeight
    return next
}

function normalizeExperience(list: ExperienceJob[]): ExperienceJob[] {
    const rows = (list || [])
        .map((j, i) => ({
            company: String(j?.company || "Company"),
            role: String(j?.role || "Role"),
            duration: String(j?.duration || ""),
            status: String(j?.status || "Past"),
            learning1: String(j?.learning1 || ""),
            learning2: String(j?.learning2 || ""),
            learning3: String(j?.learning3 || ""),
            learning4: String(j?.learning4 || ""),
            order: Number(j?.order ?? i + 1),
            slug: String(j?.slug || `job-${i}`),
        }))
        .sort((a, b) => a.order - b.order)
    return rows.length ? rows : DEFAULT_EXPERIENCE
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

function RevealLayer({
    src,
    p,
    threshold,
    show,
    active,
    origin,
}: {
    src: string
    p: MotionValue<number>
    threshold: number
    show: boolean
    active: boolean
    origin: string
}) {
    const opacity = useTransform(p, [threshold, threshold + 0.05], [0, 1])
    const y = useTransform(p, [threshold, threshold + 0.09], [-26, 0])
    const sc = useTransform(p, [threshold, threshold + 0.09], [0.9, 1])
    return (
        <motion.div
            style={
                show
                    ? { position: "absolute", inset: 0 }
                    : { position: "absolute", inset: 0, opacity, y, scale: sc }
            }
        >
            <motion.img
                src={src}
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
                style={{ ...layerImgStyle, transformOrigin: origin }}
            />
        </motion.div>
    )
}

function originFor(key: string, clicks: Click[] = CLICK_DEFS): string {
    const c = clicks.find((x) => x.key === key || x.jiggle?.includes(key))
    if (!c) return "center"
    const [x, y, w, h] = c.box
    return `${((x + w / 2) / STAGE_W) * 100}% ${((y + h / 2) / STAGE_H) * 100}%`
}

function Hotspot({
    c,
    accent,
    family,
    labelSize = 12,
    soundOn,
    visible,
    onEnter,
    onLeave,
    onClick,
}: {
    c: Click
    accent: string
    family: string
    labelSize?: number
    soundOn: boolean
    visible: boolean
    onEnter: () => void
    onLeave: () => void
    onClick: () => void
}) {
    const [x, y, w, h] = c.box
    const below = c.labelPos === "below"
    const label =
        c.action === "sound"
            ? soundOn
                ? "WRAPPED UP IN BOOKS"
                : "SOUND OFF"
            : c.label
    const boxStyle: CSSProperties = {
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
        display: "block",
        textDecoration: "none",
        color: "inherit",
        zIndex: 1,
        pointerEvents: "auto",
    }

    const labelEl = (
        <motion.span
            initial={false}
            animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 6 }}
            transition={{ duration: 0.25 }}
            style={
                {
                    position: "absolute",
                    left: "50%",
                    [below ? "bottom" : "top"]: -26,
                    transform: "translateX(-50%)",
                    background: accent,
                    color: "#fff",
                    fontFamily: family,
                    fontWeight: 700,
                    fontSize: labelSize || 12,
                    letterSpacing: 0.6,
                    padding: "3px 8px",
                    borderRadius: 4,
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                    pointerEvents: "none",
                } as CSSProperties
            }
        >
            {label}
        </motion.span>
    )

    // Native links for Work / Archive — do not preventDefault (lets Framer route).
    if (c.action === "page" && c.href) {
        const path = c.href.startsWith("/")
            ? c.href
            : `/${String(c.href).replace(/^\.\//, "")}`
        return (
            <a
                href={path}
                aria-label={c.label}
                data-desk-page={c.key}
                data-desk-path={path}
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
                onFocus={onEnter}
                onBlur={onLeave}
                onClick={() => {
                    // Click sound only; browser/Framer follow href.
                    onClick()
                }}
                style={boxStyle}
            >
                {labelEl}
            </a>
        )
    }

    return (
        <button
            type="button"
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            onFocus={onEnter}
            onBlur={onLeave}
            onClick={onClick}
            aria-label={c.label}
            style={boxStyle}
        >
            {labelEl}
        </button>
    )
}

function ModalShell({
    onClose,
    family,
    width = "min(920px, 94vw)",
    children,
}: {
    onClose: () => void
    family: string
    width?: string
    children: ReactNode
}) {
    // Portal to body so sticky/overflow/transform on the desk never clips popups
    // or breaks hover + fixed positioning after CMS/image edits.
    const modal = (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            data-desk-modal="true"
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 10050,
                background: "rgba(30,26,18,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
                pointerEvents: "auto",
            }}
        >
            <motion.div
                initial={{ scale: 0.94, y: 14 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "#fff",
                    border: `1.5px solid ${INK}`,
                    width,
                    maxHeight: "min(86vh, 820px)",
                    overflow: "auto",
                    position: "relative",
                    fontFamily: family,
                    boxSizing: "border-box",
                    pointerEvents: "auto",
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
                        fontFamily: family,
                        fontWeight: 700,
                        fontSize: 13,
                        letterSpacing: 1,
                        background: INK,
                        color: "#fff",
                        border: "none",
                        padding: "6px 10px",
                        cursor: "pointer",
                        zIndex: 2,
                    }}
                >
                    X CLOSE
                </button>
                {children}
            </motion.div>
        </motion.div>
    )

    if (typeof document === "undefined") return modal
    return createPortal(modal, document.body)
}

/** Shared CTA style — white fill, ink border, accent offset shadow (Socials popup) */
function ShadowButton({
    href,
    label,
    accent,
    ink = INK,
    onClick,
}: {
    href?: string
    label: string
    accent: string
    ink?: string
    onClick?: () => void
}) {
    const style: CSSProperties = {
        display: "inline-block",
        border: `1.5px solid ${ink}`,
        color: ink,
        textDecoration: "none",
        fontWeight: 700,
        fontSize: 14,
        letterSpacing: 0.4,
        padding: "12px 18px",
        background: "#fff",
        boxShadow: `3px 3px 0 ${accent}`,
        cursor: "pointer",
        fontFamily: "inherit",
    }
    if (href) {
        return (
            <a
                href={href}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noreferrer"
                style={style}
                onClick={() => playUiClick()}
            >
                {label}
            </a>
        )
    }
    return (
        <button
            type="button"
            onClick={() => {
                playUiClick()
                onClick?.()
            }}
            style={style}
        >
            {label}
        </button>
    )
}

function SectionLabel({ children, ink = MUTED }: { children: ReactNode; ink?: string }) {
    return (
        <div
            style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: ink,
                marginBottom: 14,
            }}
        >
            {children}
        </div>
    )
}

function ExperiencePopup({
    jobs,
    clients,
    accent,
    family,
    displayFamily = ANNIE,
    ink = INK,
    muted = MUTED,
    onClose,
}: {
    jobs: ExperienceJob[]
    clients: string[]
    accent: string
    family: string
    displayFamily?: string
    ink?: string
    muted?: string
    onClose: () => void
}) {
    const sorted = [...(jobs || [])].sort(
        (a, b) => Number(a.order ?? 0) - Number(b.order ?? 0),
    )
    const current = sorted.filter((j) => /current/i.test(j.status))
    const past = sorted.filter((j) => /past/i.test(j.status))
    const education = sorted.filter((j) => /educat|school|grad/i.test(j.status))
    // Fallback: anything not current/education treated as past
    const earlier =
        past.length > 0
            ? past
            : sorted.filter(
                  (j) =>
                      !/current/i.test(j.status) &&
                      !/educat|school|grad/i.test(j.status),
              )

    const [selected, setSelected] = useState<ExperienceJob>(
        current[0] || earlier[0] || education[0] || sorted[0],
    )

    const learnings = [
        selected?.learning1,
        selected?.learning2,
        selected?.learning3,
        selected?.learning4,
    ].filter((x) => x && String(x).trim())

    const isActive = (j: ExperienceJob) =>
        selected?.slug === j.slug ||
        (selected?.company === j.company &&
            selected?.role === j.role &&
            selected?.duration === j.duration)

    const detailKicker = /educat|school|grad/i.test(selected?.status || "")
        ? "Highlights"
        : "What I learned"

    return (
        <ModalShell onClose={onClose} family={family} width="min(920px, 95vw)">
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(260px, 320px) 1fr",
                    minHeight: 480,
                    alignItems: "stretch",
                }}
            >
                <aside
                    style={{
                        borderRight: `1.5px solid ${ink}`,
                        padding: "52px 24px 36px",
                        boxSizing: "border-box",
                        background: "#FAFAF8",
                        overflow: "auto",
                    }}
                >
                    {current.length > 0 && (
                        <ExpGroup label="Now" muted={muted}>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        current.length > 1 ? "1fr 1fr" : "1fr",
                                    gap: 8,
                                }}
                            >
                                {current.map((j) => (
                                    <ExpNavCard
                                        key={j.slug || `${j.company}-${j.role}`}
                                        job={j}
                                        active={isActive(j)}
                                        accent={accent}
                                        ink={ink}
                                        muted={muted}
                                        family={family}
                                        compact
                                        onClick={() => setSelected(j)}
                                    />
                                ))}
                            </div>
                        </ExpGroup>
                    )}

                    {earlier.length > 0 && (
                        <ExpGroup label="Earlier" muted={muted}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {earlier.map((j) => (
                                    <ExpNavCard
                                        key={j.slug || `${j.company}-${j.role}`}
                                        job={j}
                                        active={isActive(j)}
                                        accent={accent}
                                        ink={ink}
                                        muted={muted}
                                        family={family}
                                        onClick={() => setSelected(j)}
                                    />
                                ))}
                            </div>
                        </ExpGroup>
                    )}

                    {education.length > 0 && (
                        <ExpGroup label="School" muted={muted}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {education.map((j) => (
                                    <ExpNavCard
                                        key={j.slug || `${j.company}-${j.role}`}
                                        job={j}
                                        active={isActive(j)}
                                        accent={accent}
                                        ink={ink}
                                        muted={muted}
                                        family={family}
                                        onClick={() => setSelected(j)}
                                    />
                                ))}
                            </div>
                        </ExpGroup>
                    )}

                    {clients.length > 0 && (
                        <ExpGroup label="Clients" muted={muted}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {clients.map((c) => (
                                    <span
                                        key={c}
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 500,
                                            letterSpacing: "-0.01em",
                                            color: muted,
                                            border: "1px solid rgba(17,17,17,0.16)",
                                            padding: "6px 10px",
                                            background: "#fff",
                                            lineHeight: 1.2,
                                        }}
                                    >
                                        {c}
                                    </span>
                                ))}
                            </div>
                        </ExpGroup>
                    )}
                </aside>

                <div
                    style={{
                        padding: "52px 40px 40px",
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: accent,
                            marginBottom: 10,
                        }}
                    >
                        {/current/i.test(selected?.status || "")
                            ? "Current role"
                            : /educat|school|grad/i.test(selected?.status || "")
                              ? "Education"
                              : "Past role"}
                    </div>
                    <div
                        style={{
                            fontFamily: displayFamily,
                            fontSize: "clamp(30px, 3.8vw, 40px)",
                            lineHeight: 1.08,
                            marginBottom: 10,
                            color: ink,
                        }}
                    >
                        {selected?.role}
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            alignItems: "baseline",
                            gap: "6px 14px",
                            marginBottom: 28,
                            paddingBottom: 22,
                            borderBottom: `1px solid rgba(17,17,17,0.12)`,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 16,
                                fontWeight: 600,
                                letterSpacing: "-0.02em",
                                color: ink,
                            }}
                        >
                            {selected?.company}
                        </span>
                        {selected?.duration ? (
                            <span style={{ fontSize: 14, color: muted }}>{selected.duration}</span>
                        ) : null}
                    </div>

                    <SectionLabel ink={muted}>{detailKicker}</SectionLabel>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {learnings.map((line, i) => (
                            <div
                                key={i}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "18px 1fr",
                                    gap: 10,
                                    alignItems: "start",
                                }}
                            >
                                <span
                                    style={{
                                        width: 8,
                                        height: 8,
                                        marginTop: 7,
                                        background: accent,
                                        display: "inline-block",
                                    }}
                                />
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: 16,
                                        lineHeight: 1.55,
                                        color: muted,
                                        letterSpacing: "-0.01em",
                                    }}
                                >
                                    {line}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ModalShell>
    )
}

function ExpGroup({
    label,
    muted,
    children,
}: {
    label: string
    muted: string
    children: ReactNode
}) {
    return (
        <div style={{ marginBottom: 28 }}>
            <SectionLabel ink={muted}>{label}</SectionLabel>
            {children}
        </div>
    )
}

function ExpNavCard({
    job,
    active,
    accent,
    ink,
    muted,
    family,
    compact,
    onClick,
}: {
    job: ExperienceJob
    active: boolean
    accent: string
    ink: string
    muted: string
    family: string
    compact?: boolean
    onClick: () => void
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                fontFamily: family,
                padding: compact ? "12px 12px" : "12px 14px",
                background: "#fff",
                border: active ? `1.5px solid ${ink}` : `1.5px solid rgba(17,17,17,0.08)`,
                boxShadow: active ? `3px 3px 0 ${accent}` : "none",
                transition: "box-shadow 160ms ease, border-color 160ms ease",
                boxSizing: "border-box",
                minHeight: compact ? 72 : undefined,
            }}
        >
            <div
                style={{
                    fontSize: compact ? 13 : 14,
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    color: ink,
                    lineHeight: 1.25,
                    marginBottom: 4,
                }}
            >
                {job.company}
            </div>
            <div
                style={{
                    fontSize: compact ? 12 : 13,
                    color: muted,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.35,
                }}
            >
                {job.role}
            </div>
        </button>
    )
}

function SchedulePopup({
    email,
    message,
    accent,
    family,
    displayFamily = ANNIE,
    ink = INK,
    muted = MUTED,
    onClose,
}: {
    email: string
    message?: string
    accent: string
    family: string
    displayFamily?: string
    cream?: string
    ink?: string
    muted?: string
    onClose: () => void
}) {
    const mailto = `mailto:${email}?subject=${encodeURIComponent("Let's work together")}&body=${encodeURIComponent("Hi Nabia,\n\nI'd love to chat about a project.\n\n")}`
    return (
        <ModalShell onClose={onClose} family={family} width="min(560px, 94vw)">
            <div style={{ padding: "56px 40px 40px", textAlign: "center" }}>
                <div
                    style={{
                        fontFamily: displayFamily,
                        fontSize: 42,
                        lineHeight: 1.1,
                        marginBottom: 14,
                        color: ink,
                    }}
                >
                    Got a project?
                </div>
                <p
                    style={{
                        margin: "0 auto 28px",
                        maxWidth: 380,
                        fontSize: 16,
                        lineHeight: 1.6,
                        color: muted,
                    }}
                >
                    {message}
                </p>
                <ShadowButton href={mailto} label="Email me" accent={accent} ink={ink} />
                <div style={{ marginTop: 14, fontSize: 13, color: muted }}>{email}</div>
            </div>
        </ModalShell>
    )
}

function SocialsPopup({
    instagramUrl,
    linkedinUrl,
    message,
    accent,
    family,
    displayFamily = ANNIE,
    ink = INK,
    muted = MUTED,
    onClose,
}: {
    instagramUrl: string
    linkedinUrl: string
    message?: string
    accent: string
    family: string
    displayFamily?: string
    cream?: string
    ink?: string
    muted?: string
    onClose: () => void
}) {
    return (
        <ModalShell onClose={onClose} family={family} width="min(520px, 94vw)">
            <div style={{ padding: "56px 40px 40px", textAlign: "center" }}>
                <div
                    style={{
                        fontFamily: displayFamily,
                        fontSize: 40,
                        lineHeight: 1.1,
                        marginBottom: 12,
                        color: ink,
                    }}
                >
                    Come say hi
                </div>
                <p
                    style={{
                        margin: "0 auto 28px",
                        maxWidth: 340,
                        fontSize: 16,
                        lineHeight: 1.6,
                        color: muted,
                    }}
                >
                    {message}
                </p>
                <div
                    style={{
                        display: "flex",
                        gap: 12,
                        justifyContent: "center",
                        flexWrap: "wrap",
                    }}
                >
                    <ShadowButton href={instagramUrl} label="Instagram" accent={accent} ink={ink} />
                    <ShadowButton href={linkedinUrl} label="LinkedIn" accent={accent} ink={ink} />
                </div>
            </div>
        </ModalShell>
    )
}

function MediaCtaPopup({
    heading,
    text,
    image,
    link,
    linkLabel,
    accent,
    family,
    displayFamily = ANNIE,
    ink = INK,
    muted = MUTED,
    handwritten,
    onClose,
}: {
    heading: string
    text: string
    image: string
    link: string
    linkLabel: string
    accent: string
    family: string
    displayFamily?: string
    ink?: string
    muted?: string
    handwritten?: boolean
    onClose: () => void
}) {
    const img = resolveImage(image)
    return (
        <ModalShell onClose={onClose} family={family} width="min(720px, 94vw)">
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    minHeight: 340,
                }}
            >
                <div
                    style={{
                        minHeight: 280,
                        background: img
                            ? `#111 url(${img}) center/cover no-repeat`
                            : `linear-gradient(145deg, ${accent} 0%, #111 125%)`,
                        borderRight: `1.5px solid ${INK}`,
                    }}
                />
                <div
                    style={{
                        padding: "56px 32px 36px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        boxSizing: "border-box",
                    }}
                >
                    <h3
                        style={{
                            margin: "0 0 14px",
                            fontFamily: handwritten ? displayFamily : family,
                            fontSize: handwritten ? 36 : 28,
                            fontWeight: handwritten ? 400 : 700,
                            letterSpacing: handwritten ? 0 : "-0.02em",
                            lineHeight: 1.15,
                            color: INK,
                        }}
                    >
                        {heading}
                    </h3>
                    <p
                        style={{
                            margin: "0 0 24px",
                            fontFamily: handwritten ? displayFamily : family,
                            fontSize: handwritten ? 24 : 16,
                            lineHeight: 1.45,
                            color: MUTED,
                        }}
                    >
                        {text}
                    </p>
                    {link ? (
                        <div style={{ alignSelf: "flex-start" }}>
                            <ShadowButton href={link} label={linkLabel} accent={accent} ink={ink} />
                        </div>
                    ) : null}
                </div>
            </div>
        </ModalShell>
    )
}

function AboutPopup({
    message,
    image,
    accent,
    family,
    displayFamily = ANNIE,
    ink = INK,
    muted = MUTED,
    onClose,
}: {
    message: string
    image: string
    accent: string
    family: string
    displayFamily?: string
    ink?: string
    muted?: string
    onClose: () => void
}) {
    const img = resolveImage(image)
    return (
        <ModalShell onClose={onClose} family={family} width="min(760px, 94vw)">
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    minHeight: 360,
                }}
            >
                <div
                    style={{
                        minHeight: 300,
                        background: img
                            ? `#111 url(${img}) center/cover no-repeat`
                            : `linear-gradient(160deg, ${accent} 0%, #1a1a1a 120%)`,
                        borderRight: `1.5px solid ${INK}`,
                    }}
                />
                <div style={{ padding: "56px 36px 36px", boxSizing: "border-box" }}>
                    <div
                        style={{
                            fontFamily: displayFamily,
                            fontSize: 38,
                            lineHeight: 1.1,
                            marginBottom: 18,
                            color: ink,
                        }}
                    >
                        Get to know me
                    </div>
                    <p
                        style={{
                            margin: 0,
                            fontFamily: displayFamily,
                            fontSize: 26,
                            lineHeight: 1.45,
                            color: muted,
                            whiteSpace: "pre-wrap",
                        }}
                    >
                        {message}
                    </p>
                </div>
            </div>
        </ModalShell>
    )
}

function TechStackPopup({
    message,
    tools,
    accent,
    family,
    displayFamily = ANNIE,
    ink = INK,
    muted = MUTED,
    onClose,
}: {
    message: string
    tools: TechTool[]
    accent: string
    family: string
    displayFamily?: string
    ink?: string
    muted?: string
    onClose: () => void
}) {
    const list = (tools || [])
        .map((t) => ({
            name: String(t?.name || "").trim(),
            logoUrl: resolveImage(t?.logoUrl),
        }))
        .filter((t) => t.name)
    const items = list.length ? list : DEFAULT_TECH_STACK_TOOLS

    return (
        <ModalShell onClose={onClose} family={family} width="min(720px, 94vw)">
            <div style={{ padding: "52px 36px 36px", boxSizing: "border-box" }}>
                <div
                    style={{
                        fontFamily: displayFamily,
                        fontSize: 40,
                        lineHeight: 1.1,
                        marginBottom: 12,
                        color: ink,
                    }}
                >
                    Tech stack
                </div>
                <p
                    style={{
                        margin: "0 0 28px",
                        maxWidth: 520,
                        fontSize: 16,
                        lineHeight: 1.55,
                        color: muted,
                    }}
                >
                    {message || DEFAULT_TECH_STACK_MESSAGE}
                </p>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))",
                        gap: 12,
                    }}
                >
                    {items.map((tool) => (
                        <TechToolChip
                            key={tool.name}
                            name={tool.name}
                            logoUrl={tool.logoUrl}
                            accent={accent}
                            ink={ink}
                        />
                    ))}
                </div>
            </div>
        </ModalShell>
    )
}

function TechToolChip({
    name,
    logoUrl,
    accent,
    ink,
}: {
    name: string
    logoUrl?: string
    accent: string
    ink: string
}) {
    const [logoFailed, setLogoFailed] = useState(false)
    const showLogo = Boolean(logoUrl) && !logoFailed

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                border: `1.5px solid ${ink}`,
                background: "#fff",
                boxShadow: `3px 3px 0 ${accent}`,
                boxSizing: "border-box",
                minHeight: 56,
            }}
        >
            {showLogo ? (
                <img
                    src={logoUrl}
                    alt=""
                    width={28}
                    height={28}
                    draggable={false}
                    onError={() => setLogoFailed(true)}
                    style={{
                        width: 28,
                        height: 28,
                        objectFit: "contain",
                        flex: "none",
                        display: "block",
                    }}
                />
            ) : (
                <span
                    aria-hidden
                    style={{
                        width: 28,
                        height: 28,
                        flex: "none",
                        borderRadius: 8,
                        background: accent,
                        color: "#fff",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "-0.04em",
                    }}
                >
                    {toolInitials(name)}
                </span>
            )}
            <span
                style={{
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                    color: ink,
                }}
            >
                {name}
            </span>
        </div>
    )
}

function toolInitials(name: string): string {
    const parts = name.replace(/3[dD]/, "").trim().split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
}

function resolveImage(value: unknown): string {
    if (!value) return ""
    if (typeof value === "string") return value
    if (typeof value === "object" && value !== null) {
        const v = value as { src?: string; url?: string }
        return String(v.src || v.url || "")
    }
    return ""
}

function resolveRadioUrl(value: unknown): string {
    if (!value) return ""
    if (typeof value === "string") return value.trim()
    if (typeof value === "object" && value !== null) {
        const v = value as { src?: string; url?: string }
        return String(v.src || v.url || "").trim()
    }
    return ""
}

const DEFAULT_CLIENTS = ["Lemme", "Adobe", "Wellness Co.", "Atelier"]

const DEFAULT_TECH_STACK_MESSAGE =
    "These are the softwares I reach for to design, prototype, and publish — from first frames in Figma to live sites, illustration, motion, and a little AI help along the way."

const DEFAULT_TECH_STACK_TOOLS: TechTool[] = [
    { name: "Figma" },
    { name: "Framer" },
    { name: "Claude" },
    { name: "Cursor" },
    { name: "Replit" },
    { name: "Lovable" },
    { name: "Adobe Illustrator" },
    { name: "Adobe Photoshop" },
    { name: "Procreate" },
    { name: "Canva" },
    { name: "TouchDesigner" },
    { name: "Unity 3D" },
]

const DEFAULT_EXPERIENCE: ExperienceJob[] = [
    {
        company: "Studio North",
        role: "Product Designer",
        duration: "2024 — Present",
        status: "Currently",
        learning1: "Shipping calm product UI under real sprint pressure.",
        learning2: "Pairing tightly with eng so polish survives handoff.",
        learning3: "Keeping brand voice intact inside functional flows.",
        learning4: "Defending focus time when every surface wants a redesign.",
        order: 1,
        slug: "role-one",
    },
    {
        company: "Independent",
        role: "Freelance Designer",
        duration: "2023 — Present",
        status: "Currently",
        learning1: "Scoping projects so both sides stay sane.",
        learning2: "Taste is a deliverable — not just pixels.",
        learning3: "Clear async updates beat long meetings.",
        learning4: "Saying no early protects the work.",
        order: 2,
        slug: "role-two",
    },
    {
        company: "Wellness Studio Co.",
        role: "Product Designer",
        duration: "2022 — 2023",
        status: "Past",
        learning1: "Calm UI still needs decisive hierarchy.",
        learning2: "Research without synthesis is just notes.",
        learning3: "Design systems only work if squads adopt them.",
        learning4: "Ship the thin wedge first.",
        order: 3,
        slug: "past-one",
    },
    {
        company: "Brand Lab",
        role: "Visual Designer",
        duration: "2021 — 2022",
        status: "Past",
        learning1: "Brand systems need room to bend.",
        learning2: "Photography direction changes everything.",
        learning3: "Type pairing is half the personality.",
        learning4: "Clients feel cared for when you show process.",
        order: 4,
        slug: "past-two",
    },
    {
        company: "Campus Creatives",
        role: "Design Intern",
        duration: "2020 — 2021",
        status: "Past",
        learning1: "Speed without taste is just noise.",
        learning2: "Feedback is a craft — ask better questions.",
        learning3: "Small briefs still deserve a point of view.",
        learning4: "Documenting decisions saves future-you.",
        order: 5,
        slug: "past-three",
    },
    {
        company: "Your University",
        role: "BFA / Design",
        duration: "Class of 20XX",
        status: "Education",
        learning1: "Replace with your concentration, thesis, or honors.",
        learning2: "Add coursework, labs, or exhibitions that shaped your taste.",
        learning3: "Note any leadership, clubs, or teaching-assistant work.",
        learning4: "Keep it short — hiring managers skim education.",
        order: 6,
        slug: "graduation",
    },
]

addPropertyControls(DeskWorkspace, {
    welcomeText: {
        type: ControlType.String,
        title: "Welcome",
        defaultValue: "hey, welcome to my workspace",
    },
    cream: { type: ControlType.Color, title: "Background", defaultValue: "#F3EFE6" },
    ink: { type: ControlType.Color, title: "Ink", defaultValue: "#111111" },
    muted: { type: ControlType.Color, title: "Muted Text", defaultValue: "#444444" },
    accent: {
        type: ControlType.Color,
        title: "Label Color",
        defaultValue: "#2C6BE0",
    },
    displayFont: {
        type: ControlType.Font,
        title: "Display Font",
        controls: "extended",
        defaultFontType: "sans-serif",
        defaultValue: { fontSize: 72, variant: "Regular" },
    },
    font: {
        type: ControlType.Font,
        title: "Body Font",
        controls: "extended",
        defaultFontType: "sans-serif",
        defaultValue: { fontSize: 15, variant: "Regular", lineHeight: "1.5em" },
    },
    welcomeSize: {
        type: ControlType.Number,
        title: "Welcome Size",
        defaultValue: 72,
        min: 32,
        max: 120,
        step: 2,
    },
    labelSize: {
        type: ControlType.Number,
        title: "Label Size",
        defaultValue: 12,
        min: 10,
        max: 20,
        step: 1,
    },
    deskScale: {
        type: ControlType.Number,
        title: "Desk Illustration Scale",
        defaultValue: 1,
        min: 0.7,
        max: 1.4,
        step: 0.05,
    },
    experience: {
        type: ControlType.Array,
        title: "Experience (CMS)",
        control: {
            type: ControlType.Object,
            controls: {
                company: { type: ControlType.String, title: "Company", defaultValue: "Company" },
                role: { type: ControlType.String, title: "Role", defaultValue: "Role" },
                duration: { type: ControlType.String, title: "Duration", defaultValue: "2024" },
                status: {
                    type: ControlType.Enum,
                    title: "Status",
                    options: ["Currently", "Past", "Education"],
                    optionTitles: ["Currently", "Past", "Education"],
                    defaultValue: "Past",
                },
                learning1: { type: ControlType.String, title: "Learning 1", displayTextArea: true, defaultValue: "" },
                learning2: { type: ControlType.String, title: "Learning 2", displayTextArea: true, defaultValue: "" },
                learning3: { type: ControlType.String, title: "Learning 3", displayTextArea: true, defaultValue: "" },
                learning4: { type: ControlType.String, title: "Learning 4", displayTextArea: true, defaultValue: "" },
                order: { type: ControlType.Number, title: "Order", defaultValue: 1 },
                slug: { type: ControlType.String, title: "Slug", defaultValue: "job" },
            },
        },
        defaultValue: DEFAULT_EXPERIENCE,
    },
    clients: {
        type: ControlType.Array,
        title: "Past Clients",
        control: { type: ControlType.String },
        defaultValue: DEFAULT_CLIENTS,
    },
    workLink: {
        type: ControlType.Link,
        title: "Link — Work Hotspot",
        defaultValue: "/work",
    },
    archiveLink: {
        type: ControlType.Link,
        title: "Link — Archive Hotspot",
        defaultValue: "/archive",
    },
    email: {
        type: ControlType.String,
        title: "Link — Email Address",
        defaultValue: "hello@example.com",
    },
    scheduleMessage: {
        type: ControlType.String,
        title: "Schedule Message",
        displayTextArea: true,
        defaultValue: "My calendar fills with client work and content days — but I always make room for thoughtful collaborations. Drop me a note and tell me what you're building.",
    },
    socialsMessage: {
        type: ControlType.String,
        title: "Socials Message",
        displayTextArea: true,
        defaultValue: "Bits of process, finished pieces, and the occasional desk snack — find me on the apps I actually check.",
    },
    instagramUrl: {
        type: ControlType.Link,
        title: "Link — Instagram",
        defaultValue: "https://instagram.com/",
    },
    linkedinUrl: {
        type: ControlType.Link,
        title: "Link — LinkedIn",
        defaultValue: "https://linkedin.com/",
    },
    chutneyHeading: {
        type: ControlType.String,
        title: "Chutney Heading",
        defaultValue: "Chutney Studios",
    },
    chutneyText: {
        type: ControlType.String,
        title: "Chutney Text",
        displayTextArea: true,
        defaultValue:
            "My after-hours studio — branding and sites for small, good-taste brands.",
    },
    chutneyImage: {
        type: ControlType.Image,
        title: "Chutney Image",
    },
    chutneyLink: {
        type: ControlType.Link,
        title: "Link — Chutney Button",
        defaultValue: "https://",
    },
    chutneyLinkLabel: {
        type: ControlType.String,
        title: "Chutney Button Label",
        defaultValue: "Visit studio",
    },
    substackText: {
        type: ControlType.String,
        title: "Substack Text",
        displayTextArea: true,
        defaultValue:
            "Hey, naming side quests I have a substack too! Follow my writing",
    },
    substackImage: {
        type: ControlType.Image,
        title: "Substack Image",
    },
    substackUrl: {
        type: ControlType.Link,
        title: "Link — Substack Button",
        defaultValue: "https://substack.com/",
    },
    aboutMessage: {
        type: ControlType.String,
        title: "Get to Know Me",
        displayTextArea: true,
        defaultValue:
            "Hi — I'm Nabia. I design calm, considered interfaces and brand moments for wellness and lifestyle teams. Pull up a chair.",
    },
    aboutImage: {
        type: ControlType.Image,
        title: "About Image",
    },
    techStackMessage: {
        type: ControlType.String,
        title: "Tech Stack Message",
        displayTextArea: true,
        defaultValue: DEFAULT_TECH_STACK_MESSAGE,
    },
    techStackTools: {
        type: ControlType.Array,
        title: "Tech Stack Tools",
        control: {
            type: ControlType.Object,
            controls: {
                name: {
                    type: ControlType.String,
                    title: "Name",
                    defaultValue: "Tool",
                },
                logoUrl: {
                    type: ControlType.Image,
                    title: "Logo (optional)",
                },
            },
        },
        defaultValue: DEFAULT_TECH_STACK_TOOLS,
    },
    radioTrackUrl: {
        type: ControlType.String,
        title: "Radio Track URL",
        defaultValue: DEFAULT_RADIO_TRACK,
    },
    tickSound: {
        type: ControlType.File,
        title: "Tick Sound",
        allowedFileTypes: ["mp3", "wav", "ogg", "m4a"],
    },
})
