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
/** Session flag — scroll intro only on the first homepage visit in this tab. */
const INTRO_SEEN_KEY = "__nabiaDeskIntroSeen"
/** Set before navigating home → /work so WorkIndex can settle the zoom. */
const LAPTOP_ZOOM_KEY = "__nabiaLaptopZoom"
const IMG = "https://framerusercontent.com/images/"
const GRID_BG = `${IMG}uTiMeYZo7Cgq17Mt2w60JYMnptc.png`

function hasSeenDeskIntro(): boolean {
    if (typeof window === "undefined") return false
    try {
        if (sessionStorage.getItem(INTRO_SEEN_KEY) === "1") return true
        return Boolean((window as Window & { __nabiaDeskIntroSeen?: boolean }).__nabiaDeskIntroSeen)
    } catch {
        return Boolean((window as Window & { __nabiaDeskIntroSeen?: boolean }).__nabiaDeskIntroSeen)
    }
}

function markDeskIntroSeen() {
    if (typeof window === "undefined") return
    try {
        sessionStorage.setItem(INTRO_SEEN_KEY, "1")
    } catch {
        /* private mode, etc. */
    }
    ;(window as Window & { __nabiaDeskIntroSeen?: boolean }).__nabiaDeskIntroSeen = true
}

const ANNIE = '"Annie Use Your Telescope", "Bradley Hand", cursive'
const INTER =
    '"Inter Display", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
const CREAM = "#F3EFE6"
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
    /** Distance of the hover label from the hotspot edge (px). Default 26. */
    labelGap?: number
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
        // Shelf books only (~576–745 × 78–185) — tall box pushed EXPERIENCE way below.
        box: [575, 78, 172, 112],
        label: "EXPERIENCE",
        action: "popup",
        popupKind: "experience",
        labelPos: "below",
        labelGap: 8,
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
        // Match the full calendar art (~359–523 × 438–602).
        box: [355, 435, 170, 170],
        label: "SCHEDULE",
        action: "popup",
        popupKind: "schedule",
        jiggle: ["briefcase-calendar", "calendar"],
        labelPos: "above",
        labelGap: 8,
    },
    {
        key: "sticky",
        // Sticky note ink (~837–915 × 433–510) — previous tall box floated TECH STACK up onto the portrait.
        box: [836, 428, 82, 85],
        label: "TECH STACK",
        action: "popup",
        popupKind: "techstack",
        jiggle: ["sticky"],
        labelPos: "above",
        labelGap: 6,
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
    welcomeHint: string
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
    "https://archive.org/download/BS2023-07-14.dpa/Belle_and_Sebastian_2023-07-14t02.mp3"

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
        welcomeHint = "scroll to enter",
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
    // First homepage visit in this tab gets the scroll reveal; return trips
    // (and footer deep-links with ?open=) land on the fully set-up desk.
    const [skipIntro] = useState(() => {
        if (isStatic) return false
        if (hasSeenDeskIntro()) return true
        if (typeof window !== "undefined") {
            try {
                const open = new URLSearchParams(window.location.search).get("open")
                if (open) {
                    markDeskIntroSeen()
                    return true
                }
            } catch {
                /* ignore */
            }
        }
        return false
    })

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

    // Leaving the homepage marks the intro as done for this tab session.
    useEffect(() => {
        if (isStatic || skipIntro) return
        return () => {
            markDeskIntroSeen()
        }
    }, [isStatic, skipIntro])

    const animated = !isStatic && !reduced && !skipIntro
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
        // Once the desk has mostly assembled, future visits can skip the scroll.
        if (v > 0.85) markDeskIntroSeen()
    })
    useEffect(() => {
        if (!animated) setDeskReady(true)
    }, [animated])

    // Deep links from footer desk hotspots: /?open=techstack|about|socials|…
    useEffect(() => {
        if (isStatic || typeof window === "undefined") return
        const params = new URLSearchParams(window.location.search)
        const open = (params.get("open") || "").trim().toLowerCase()
        if (!open) return
        markDeskIntroSeen()
        const match =
            clicks.find((c) => c.popupKind === open) ||
            clicks.find((c) => c.key === open)
        if (match?.action === "popup") {
            startTransition(() => setPopup(match))
        }
        params.delete("open")
        const q = params.toString()
        const next = `${window.location.pathname}${q ? `?${q}` : ""}${window.location.hash}`
        window.history.replaceState({}, "", next)
    }, [isStatic, clicks])

    // Sitewide radio lives on window (bodyStart custom code) so playback
    // survives Framer SPA navigations. Desk hotspot only toggles that singleton.
    // Default ON — mirrors site-radio.js (off only after an explicit mute).
    const [playing, setPlaying] = useState(false)
    const [soundOn, setSoundOn] = useState(true)

    type NabiaRadioWindow = Window & {
        __nabiaRadioPlay?: () => Promise<boolean> | boolean
        __nabiaRadioPause?: () => void
        __nabiaRadioToggle?: () => void
        __nabiaRadioIsPlaying?: () => boolean
        __nabiaRadioWantOn?: () => boolean
        __nabiaRadioSetTrack?: (url: string) => void
    }

    const startRadio = async () => {
        if (typeof window === "undefined") return false
        const w = window as NabiaRadioWindow
        w.__nabiaRadioSetTrack?.(trackUrl)
        const ok = await Promise.resolve(w.__nabiaRadioPlay?.())
        setPlaying(Boolean(w.__nabiaRadioIsPlaying?.() ?? ok))
        setSoundOn(w.__nabiaRadioWantOn ? Boolean(w.__nabiaRadioWantOn()) : true)
        return Boolean(ok)
    }

    const stopRadio = () => {
        if (typeof window === "undefined") return
        const w = window as NabiaRadioWindow
        w.__nabiaRadioPause?.()
        setPlaying(false)
        setSoundOn(false)
    }

    function toggleSound() {
        if (typeof window === "undefined") return
        const w = window as NabiaRadioWindow
        if (w.__nabiaRadioToggle) {
            void Promise.resolve(w.__nabiaRadioToggle()).finally(() => {
                setPlaying(Boolean(w.__nabiaRadioIsPlaying?.()))
                setSoundOn(w.__nabiaRadioWantOn ? Boolean(w.__nabiaRadioWantOn()) : false)
            })
            return
        }
        if (soundOn) stopRadio()
        else void startRadio()
    }

    useEffect(() => {
        if (typeof window === "undefined" || isStatic) return
        const w = window as NabiaRadioWindow
        w.__nabiaRadioSetTrack?.(trackUrl)
        const sync = () => {
            setPlaying(Boolean(w.__nabiaRadioIsPlaying?.()))
            setSoundOn(w.__nabiaRadioWantOn ? Boolean(w.__nabiaRadioWantOn()) : true)
        }
        sync()
        // Kick autoplay as soon as the desk mounts (gesture unlock handled sitewide).
        if (w.__nabiaRadioWantOn?.() !== false) void startRadio()
        window.addEventListener("nabia-radio", sync)
        const id = window.setInterval(sync, 500)
        return () => {
            window.removeEventListener("nabia-radio", sync)
            window.clearInterval(id)
            // Do NOT pause — leaving the desk must keep the track going.
        }
    }, [trackUrl, isStatic])

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
                if (typeof window === "undefined") return
                const w = window as NabiaRadioWindow
                if (w.__nabiaRadioWantOn?.() && !w.__nabiaRadioIsPlaying?.()) {
                    void startRadio()
                }
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
                    data-desk-stage
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
                                cream={cream}
                                family={family}
                                labelSize={labelSize}
                                soundOn={playing || soundOn}
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
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: isPhone ? 18 : 22,
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
                                <motion.div
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.8,
                                        ease: "easeOut",
                                        delay: 1.1,
                                    }}
                                    style={{
                                        fontFamily: family,
                                        fontSize: isPhone ? 11 : 12,
                                        fontWeight: 300,
                                        letterSpacing: "0.04em",
                                        textTransform: "uppercase",
                                        color: muted,
                                        textAlign: "center",
                                    }}
                                >
                                    {welcomeHint}
                                </motion.div>
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

/**
 * Sandra Creates–style frame expand: the Work page starts the size of the
 * laptop screen and zooms out to fill the viewport, then we navigate.
 */
let laptopZoomBusy = false

function runLaptopZoom(fromEl: HTMLElement, href: string, cream: string) {
    if (typeof document === "undefined" || typeof window === "undefined") return
    if (laptopZoomBusy || document.getElementById("nabia-laptop-zoom")) return
    laptopZoomBusy = true

    try {
        sessionStorage.setItem(LAPTOP_ZOOM_KEY, "1")
    } catch {
        /* private mode */
    }

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        window.location.assign(href)
        return
    }

    const r = fromEl.getBoundingClientRect()
    const screenRect = {
        left: r.left + r.width * 0.1,
        top: r.top + r.height * 0.05,
        width: r.width * 0.8,
        height: r.height * 0.5,
    }
    const vw = window.innerWidth
    const vh = window.innerHeight
    const creamBg = cream || "#F3EFE6"
    // Uniform scale so the frame grows like a portal (not a clipped wipe).
    const s0 = Math.max(0.08, Math.min(screenRect.width / vw, screenRect.height / vh))
    const tx0 = screenRect.left + screenRect.width / 2 - vw / 2
    const ty0 = screenRect.top + screenRect.height / 2 - vh / 2
    const stageScale = Math.min(vw / STAGE_W, vh / STAGE_H)

    const overlay = document.createElement("div")
    overlay.id = "nabia-laptop-zoom"
    overlay.setAttribute("aria-hidden", "true")
    Object.assign(overlay.style, {
        position: "fixed",
        left: "0",
        top: "0",
        width: `${vw}px`,
        height: `${vh}px`,
        zIndex: "2147483000",
        pointerEvents: "auto",
        background: creamBg,
        overflow: "hidden",
        borderRadius: "16px",
        boxShadow:
            "0 0 0 10px #d9d2c6, 0 0 0 11px rgba(44,107,224,0.25), 0 40px 100px rgba(17,17,17,0.28)",
        transformOrigin: "center center",
        transform: `translate(${tx0}px, ${ty0}px) scale(${s0})`,
        opacity: "1",
        transition: "none",
        willChange: "transform, border-radius, box-shadow",
    } as CSSStyleDeclaration)

    // Same stage-scaled grid as the Work page / homepage (not cover-zoomed).
    const gridWrap = document.createElement("div")
    Object.assign(gridWrap.style, {
        position: "absolute",
        inset: "0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        overflow: "hidden",
    } as CSSStyleDeclaration)
    const grid = document.createElement("div")
    Object.assign(grid.style, {
        width: `${STAGE_W}px`,
        height: `${STAGE_H}px`,
        flex: "none",
        transform: `scale(${stageScale})`,
        transformOrigin: "center center",
        backgroundImage: `url(${GRID_BG})`,
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        opacity: "0.12",
        filter: "grayscale(1)",
    } as CSSStyleDeclaration)
    gridWrap.appendChild(grid)
    overlay.appendChild(gridWrap)

    // Soft folder silhouettes so the expanding frame reads as the Work desktop.
    const folders = document.createElement("div")
    Object.assign(folders.style, {
        position: "absolute",
        inset: "0",
        pointerEvents: "none",
    } as CSSStyleDeclaration)
    ;[
        { left: "9%", top: "14%", w: 280, h: 360 },
        { right: "10%", top: "42%", w: 300, h: 380 },
    ].forEach((f, i) => {
        const card = document.createElement("div")
        Object.assign(card.style, {
            position: "absolute",
            left: f.left || "auto",
            right: (f as { right?: string }).right || "auto",
            top: f.top,
            width: `${f.w}px`,
            height: `${f.h}px`,
            borderRadius: "26px",
            background: "rgba(255,255,255,0.55)",
            border: "2px solid rgba(255,255,255,0.9)",
            boxShadow:
                "0 18px 40px rgba(17,17,17,0.1), 0 0 40px rgba(44,107,224,0.22)",
            opacity: String(0.55 + i * 0.12),
        } as CSSStyleDeclaration)
        folders.appendChild(card)
    })
    overlay.appendChild(folders)

    document.body.appendChild(overlay)
    // Force layout so the starting transform paints before we enable transition.
    void overlay.getBoundingClientRect()
    requestAnimationFrame(() => {
        overlay.style.transition =
            "transform 1.15s cubic-bezier(0.16, 1, 0.3, 1), border-radius 1.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 1s ease"
        requestAnimationFrame(() => {
            overlay.style.transform = "translate(0px, 0px) scale(1)"
            overlay.style.borderRadius = "0px"
            overlay.style.boxShadow = "0 0 0 0 transparent"
        })
    })

    window.setTimeout(() => {
        document.getElementById("nabia-laptop-zoom")?.remove()
        laptopZoomBusy = false
    }, 6000)

    window.setTimeout(() => {
        window.location.assign(href)
    }, 1180)
}

function Hotspot({
    c,
    accent,
    cream,
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
    cream: string
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
    const labelGap = c.labelGap ?? 26
    const label =
        c.action === "sound"
            ? soundOn
                ? "SOUND ON"
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
        <div
            style={{
                position: "absolute",
                left: "50%",
                [below ? "bottom" : "top"]: -labelGap,
                transform: "translateX(-50%)",
                pointerEvents: "none",
            }}
        >
            <motion.span
                initial={false}
                animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 6 }}
                transition={{ duration: 0.25 }}
                style={
                    {
                        display: "block",
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
        </div>
    )

    // Archive stays a native link. Laptop → Work uses a button so Framer's
    // client router can't race the zoom-in transition.
    if (c.action === "page" && c.href) {
        const path = c.href.startsWith("/")
            ? c.href
            : `/${String(c.href).replace(/^\.\//, "")}`
        const isLaptopWork =
            c.key === "laptop" || path.replace(/\/$/, "") === "/work"

        if (isLaptopWork) {
            return (
                <button
                    type="button"
                    aria-label={c.label}
                    data-desk-page={c.key}
                    data-desk-path={path}
                    onMouseEnter={onEnter}
                    onMouseLeave={onLeave}
                    onFocus={onEnter}
                    onBlur={onLeave}
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onClick()
                        runLaptopZoom(e.currentTarget, path, cream)
                    }}
                    style={boxStyle}
                >
                    {labelEl}
                </button>
            )
        }

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

/** Shared popup type + spacing — every desk modal uses these tokens. */
const POPUP = {
    pad: "52px 36px 36px",
    padCentered: "52px 40px 40px",
    padSplit: "52px 36px 36px",
    titleSize: 40,
    titleLine: 1.1,
    titleMb: 14,
    bodySize: 16,
    bodyLine: 1.55,
    bodyMb: 28,
    labelSize: 11,
    labelTracking: "0.08em",
} as const

function PopupTitle({
    children,
    displayFamily,
    ink = INK,
    align = "left",
}: {
    children: ReactNode
    displayFamily: string
    ink?: string
    align?: "left" | "center"
}) {
    return (
        <div
            style={{
                fontFamily: displayFamily,
                fontWeight: 400,
                fontSize: POPUP.titleSize,
                lineHeight: POPUP.titleLine,
                marginBottom: POPUP.titleMb,
                color: ink,
                textAlign: align,
            }}
        >
            {children}
        </div>
    )
}

function PopupBody({
    children,
    muted = MUTED,
    align = "left",
    maxWidth,
    mb = POPUP.bodyMb,
}: {
    children: ReactNode
    muted?: string
    align?: "left" | "center"
    maxWidth?: number | string
    mb?: number
}) {
    return (
        <p
            style={{
                margin: `0 ${align === "center" ? "auto" : 0} ${mb}px`,
                maxWidth: maxWidth ?? (align === "center" ? 380 : undefined),
                fontSize: POPUP.bodySize,
                lineHeight: POPUP.bodyLine,
                letterSpacing: "-0.01em",
                color: muted,
                textAlign: align,
                whiteSpace: "pre-wrap",
            }}
        >
            {children}
        </p>
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
                    background: CREAM,
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
                        textTransform: "uppercase",
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
                fontSize: POPUP.labelSize,
                fontWeight: 600,
                letterSpacing: POPUP.labelTracking,
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
                        padding: POPUP.padSplit,
                        boxSizing: "border-box",
                        background: CREAM,
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
                background: "#fff", // CTA chips — keep white for contrast on cream panels
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
                        padding: POPUP.padSplit,
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div
                        style={{
                            fontSize: POPUP.labelSize,
                            fontWeight: 700,
                            letterSpacing: POPUP.labelTracking,
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
                    <PopupTitle displayFamily={displayFamily} ink={ink}>
                        {selected?.role}
                    </PopupTitle>
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            alignItems: "baseline",
                            gap: "6px 14px",
                            marginBottom: POPUP.bodyMb,
                            paddingBottom: 22,
                            borderBottom: `1px solid rgba(17,17,17,0.12)`,
                        }}
                    >
                        <span
                            style={{
                                fontSize: POPUP.bodySize,
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
                                        fontSize: POPUP.bodySize,
                                        lineHeight: POPUP.bodyLine,
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
            <div style={{ padding: POPUP.padCentered, textAlign: "center", boxSizing: "border-box" }}>
                <PopupTitle displayFamily={displayFamily} ink={ink} align="center">
                    Got a project?
                </PopupTitle>
                <PopupBody muted={muted} align="center" maxWidth={380}>
                    {message}
                </PopupBody>
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
            <div style={{ padding: POPUP.padCentered, textAlign: "center", boxSizing: "border-box" }}>
                <PopupTitle displayFamily={displayFamily} ink={ink} align="center">
                    Come say hi
                </PopupTitle>
                <PopupBody muted={muted} align="center" maxWidth={340}>
                    {message}
                </PopupBody>
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
                        padding: POPUP.padSplit,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        boxSizing: "border-box",
                    }}
                >
                    <PopupTitle displayFamily={displayFamily} ink={ink}>
                        {heading}
                    </PopupTitle>
                    <PopupBody muted={muted}>{text}</PopupBody>
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
                <div style={{ padding: POPUP.padSplit, boxSizing: "border-box" }}>
                    <PopupTitle displayFamily={displayFamily} ink={ink}>
                        Get to know me
                    </PopupTitle>
                    <PopupBody muted={muted} mb={0}>
                        {message}
                    </PopupBody>
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
    const defaultsByName = new Map(
        DEFAULT_TECH_STACK_TOOLS.map((t) => [t.name.toLowerCase(), t.logoUrl || ""]),
    )
    const list = (tools || [])
        .map((t) => {
            const name = String(t?.name || "").trim()
            const fromProp = resolveImage(t?.logoUrl)
            const fromDefault = defaultsByName.get(name.toLowerCase()) || ""
            return {
                name,
                logoUrl: fromProp || fromDefault,
            }
        })
        .filter((t) => t.name)
    const items = list.length ? list : DEFAULT_TECH_STACK_TOOLS

    return (
        <ModalShell onClose={onClose} family={family} width="min(720px, 94vw)">
            <div style={{ padding: POPUP.pad, boxSizing: "border-box" }}>
                <PopupTitle displayFamily={displayFamily} ink={ink}>
                    Tech stack
                </PopupTitle>
                <PopupBody muted={muted} maxWidth={520}>
                    {message || DEFAULT_TECH_STACK_MESSAGE}
                </PopupBody>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(112px, 1fr))",
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
            title={name}
            aria-label={name}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 18,
                border: `1.5px solid ${ink}`,
                background: "#fff",
                boxShadow: `3px 3px 0 ${accent}`,
                boxSizing: "border-box",
                minHeight: 88,
            }}
        >
            {showLogo ? (
                <img
                    src={logoUrl}
                    alt={name}
                    width={44}
                    height={44}
                    draggable={false}
                    onError={() => setLogoFailed(true)}
                    style={{
                        width: 44,
                        height: 44,
                        objectFit: "contain",
                        display: "block",
                    }}
                />
            ) : (
                <span
                    aria-hidden
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: accent,
                        color: "#fff",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 700,
                        letterSpacing: "-0.04em",
                    }}
                >
                    {toolInitials(name)}
                </span>
            )}
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
    { name: "Figma", logoUrl: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20128%20128%22%3E%3Cpath%20fill%3D%22%230acf83%22%20d%3D%22M45.5%20129c11.9%200%2021.5-9.6%2021.5-21.5V86H45.5C33.6%2086%2024%2095.6%2024%20107.5S33.6%20129%2045.5%20129zm0%200%22/%3E%3Cpath%20fill%3D%22%23a259ff%22%20d%3D%22M24%2064.5C24%2052.6%2033.6%2043%2045.5%2043H67v43H45.5C33.6%2086%2024%2076.4%2024%2064.5zm0%200%22/%3E%3Cpath%20fill%3D%22%23f24e1e%22%20d%3D%22M24%2021.5C24%209.6%2033.6%200%2045.5%200H67v43H45.5C33.6%2043%2024%2033.4%2024%2021.5zm0%200%22/%3E%3Cpath%20fill%3D%22%23ff7262%22%20d%3D%22M67%200h21.5C100.4%200%20110%209.6%20110%2021.5S100.4%2043%2088.5%2043H67zm0%200%22/%3E%3Cpath%20fill%3D%22%231abcfe%22%20d%3D%22M110%2064.5c0%2011.9-9.6%2021.5-21.5%2021.5S67%2076.4%2067%2064.5%2076.6%2043%2088.5%2043%20110%2052.6%20110%2064.5zm0%200%22/%3E%3C/svg%3E' },
    { name: "Framer", logoUrl: 'data:image/svg+xml,%3Csvg%20fill%3D%22%230055FF%22%20role%3D%22img%22%20viewBox%3D%220%200%2024%2024%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Ctitle%3EFramer%3C/title%3E%3Cpath%20d%3D%22M4%200h16v8h-8zM4%208h8l8%208H4zM4%2016h8v8z%22/%3E%3C/svg%3E' },
    { name: "Claude", logoUrl: 'https://www.google.com/s2/favicons?domain=claude.ai&sz=128' },
    { name: "Cursor", logoUrl: 'https://www.google.com/s2/favicons?domain=cursor.com&sz=128' },
    { name: "Replit", logoUrl: 'data:image/svg+xml,%3Csvg%20fill%3D%22%23F26207%22%20role%3D%22img%22%20viewBox%3D%220%200%2024%2024%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Ctitle%3EReplit%3C/title%3E%3Cpath%20d%3D%22M2%201.5A1.5%201.5%200%200%201%203.5%200h7A1.5%201.5%200%200%201%2012%201.5V8H3.5A1.5%201.5%200%200%201%202%206.5ZM12%208h8.5A1.5%201.5%200%200%201%2022%209.5v5a1.5%201.5%200%200%201-1.5%201.5H12ZM2%2017.5A1.5%201.5%200%200%201%203.5%2016H12v6.5a1.5%201.5%200%200%201-1.5%201.5h-7A1.5%201.5%200%200%201%202%2022.5Z%22/%3E%3C/svg%3E' },
    { name: "Lovable", logoUrl: 'https://www.google.com/s2/favicons?domain=lovable.dev&sz=128' },
    { name: "Adobe Illustrator", logoUrl: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20data-name%3D%22Layer%201%22%20viewBox%3D%220%200%20128%20128%22%3E%3Cpath%20fill%3D%22%23330000%22%20d%3D%22M105.33%201.6H22.67A22.64%2022.64%200%200%200%200%2024.27v79.46a22.64%2022.64%200%200%200%2022.67%2022.67h82.66A22.64%2022.64%200%200%200%20128%20103.73V24.27A22.64%2022.64%200%200%200%20105.33%201.6Zm-27.09%2088H67.09a.82.82%200%200%201-.85-.59l-4.37-12.74H42L38%2088.8a.93.93%200%200%201-1%20.75H27c-.58%200-.74-.32-.58-1l17.1-49.4c.16-.54.32-1.12.53-1.76a18.14%2018.14%200%200%200%20.32-3.47.54.54%200%200%201%20.43-.59h13.81c.43%200%20.64.16.7.43l19.46%2054.93c.16.59%200%20.86-.53.86Zm18.4-.6c0%20.59-.21.85-.69.85H85.49a.75.75%200%200%201-.8-.85V47.89c0-.53.22-.74.7-.74H96c.48%200%20.69.26.69.74Zm-1.12-48.2a6.3%206.3%200%200%201-4.85%201.87%206.61%206.61%200%200%201-4.75-1.87%206.87%206.87%200%200%201-1.81-4.91A6.23%206.23%200%200%201%2086%2031.15a6.8%206.8%200%200%201%204.74-1.87%206.4%206.4%200%200%201%204.86%201.87%206.75%206.75%200%200%201%201.76%204.74%206.76%206.76%200%200%201-1.84%204.91ZM58.67%2065.44H45.12c.8-2.24%201.6-4.75%202.35-7.47s1.65-5.33%202.45-7.89a64.65%2064.65%200%200%200%201.81-6.88h.11c.37%201.28.75%202.67%201.17%204.16s.91%203.09%201.44%204.75%201%203.25%201.55%204.9%201%203.15%201.44%204.59.91%202.72%201.23%203.84Z%22/%3E%3C/svg%3E' },
    { name: "Adobe Photoshop", logoUrl: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20128%20128%22%3E%3Cpath%20fill%3D%22%23001e36%22%20d%3D%22M22.666%201.6C10.133%201.6%200%2011.734%200%2024.268v79.464C0%20116.266%2010.133%20126.4%2022.666%20126.4h82.668c12.533%200%2022.666-10.134%2022.666-22.668V24.268C128%2011.734%20117.867%201.6%20105.334%201.6H22.666zm23.201%2031.734c4.373%200%208%20.532%2010.986%201.652A19.05%2019.05%200%200%201%2064%2039.361a16.976%2016.976%200%200%201%203.894%206.079c.8%202.24%201.225%204.533%201.225%206.933%200%204.587-1.066%208.373-3.2%2011.36-2.132%202.986-5.118%205.227-8.585%206.507-3.627%201.334-7.627%201.813-12%201.813-1.28%200-2.135%200-2.668-.053-.533-.053-1.28-.053-2.293-.053v17.12c.053.373-.213.694-.586.747H29.44c-.426%200-.638-.215-.638-.695V34.24c0-.373.16-.588.533-.588.907%200%201.76%200%202.986-.052%201.28-.054%202.613-.052%204.053-.106%201.44-.053%202.987-.054%204.64-.107%201.654-.054%203.254-.053%204.854-.053zm1.19%2010.504a18.68%2018.68%200%200%200-.817.002c-1.386%200-2.613.001-3.627.055-1.066-.054-1.812-.001-2.185.052v17.92c.746.054%201.438.106%202.078.106h2.828c2.08%200%204.16-.32%206.133-.96%201.707-.48%203.2-1.494%204.373-2.827%201.12-1.334%201.654-3.146%201.654-5.493a8.776%208.776%200%200%200-1.226-4.746c-.907-1.386-2.188-2.454-3.735-3.04-1.727-.7-3.576-1.033-5.476-1.07zm44.73%202.723c2.187%200%204.427.158%206.613.478%201.6.213%203.146.642%204.586%201.229.214.053.427.265.533.478.054.213.108.427.108.64v8.694a.655.655%200%200%201-.266.533c-.48.107-.747.107-.96%200-1.6-.853-3.308-1.439-5.122-1.812-1.973-.427-3.946-.695-5.972-.695-1.067-.054-2.188.108-3.201.374-.694.16-1.28.534-1.653%201.067-.266.427-.426.96-.426%201.44s.214.96.534%201.386c.48.587%201.119%201.068%201.812%201.442a48.8%2048.8%200%200%200%203.787%201.757c2.88.96%205.653%202.295%208.213%203.895%201.76%201.12%203.2%202.614%204.213%204.427a11.509%2011.509%200%200%201%201.228%205.493%2012.412%2012.412%200%200%201-2.082%207.093%2013.362%2013.362%200%200%201-5.972%204.746c-2.614%201.12-5.814%201.707-9.654%201.707-2.454%200-4.852-.213-7.252-.693a21.51%2021.51%200%200%201-5.44-1.707c-.373-.213-.641-.587-.588-1.014V78.24c0-.16.053-.374.213-.48.16-.107.32-.052.48.054a22.83%2022.83%200%200%200%206.614%202.614c2.027.533%204.161.799%206.295.799%202.026%200%203.466-.267%204.426-.747.853-.373%201.439-1.28%201.439-2.24%200-.746-.426-1.441-1.28-2.135-.853-.693-2.613-1.492-5.226-2.505a32.638%2032.638%200%200%201-7.574-3.84%2013.81%2013.81%200%200%201-4.053-4.533%2011.44%2011.44%200%200%201-1.226-5.44c0-2.293.639-4.48%201.812-6.453%201.333-2.133%203.308-3.84%205.602-4.906%202.506-1.28%205.652-1.867%209.44-1.867z%22/%3E%3C/svg%3E' },
    { name: "Procreate", logoUrl: 'https://www.google.com/s2/favicons?domain=procreate.com&sz=128' },
    { name: "Canva", logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/canva/canva-original.svg' },
    { name: "TouchDesigner", logoUrl: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2064%2064%22%20fill%3D%22none%22%3E%0A%20%20%3Crect%20width%3D%2264%22%20height%3D%2264%22%20rx%3D%2212%22%20fill%3D%22%23111%22/%3E%0A%20%20%3Cpath%20d%3D%22M14%2018h36v8H38v28h-12V26H14V18z%22%20fill%3D%22%23FF6A00%22/%3E%0A%20%20%3Ccircle%20cx%3D%2248%22%20cy%3D%2246%22%20r%3D%226%22%20fill%3D%22%23FF6A00%22/%3E%0A%3C/svg%3E' },
    { name: "Unity 3D", logoUrl: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20128%20128%22%3E%3Cpath%20d%3D%22m63.991%20128%2051.702-29.855-19.817-11.461-20.26%2011.704a1.151%201.151%200%200%201-1.125-.009%201.145%201.145%200%200%201-.568-.975V69.608c0-.819.424-1.56%201.133-1.968L99.13%2053.737a1.119%201.119%200%200%201%201.124.009c.352.195.572.564.576.966V78.11l19.83%2011.454V29.855L63.99%2062.566Zm0%200%22/%3E%3Cpath%20fill%3D%22%234d4d4d%22%20d%3D%22m52.397%2098.401-20.27-11.718-19.832%2011.46L63.991%20128V62.566L7.34%2029.854V89.56l19.825-11.45V54.714c.009-.401.225-.77.572-.966a1.13%201.13%200%200%201%201.13-.009L52.953%2067.64a2.275%202.275%200%200%201%201.133%201.97v27.8a1.156%201.156%200%200%201-.565.98%201.131%201.131%200%200%201-1.124.012%22/%3E%3Cpath%20fill%3D%22gray%22%20d%3D%22M68.959%200v22.9L89.22%2034.597c.348.203.555.576.555.984%200%20.403-.212.772-.555.975L65.137%2050.468a2.302%202.302%200%200%201-2.27%200L38.791%2036.556a1.122%201.122%200%200%201-.56-.975%201.127%201.127%200%200%201%20.56-.984L59.048%2022.9V0L7.339%2029.855l56.652%2032.711%2056.665-32.71Zm0%200%22/%3E%3C/svg%3E' },
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
    welcomeHint: {
        type: ControlType.String,
        title: "Welcome Hint",
        defaultValue: "scroll to enter",
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
