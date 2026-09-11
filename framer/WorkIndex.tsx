import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
} from "react"
import {
    addPropertyControls,
    ControlType,
    RenderTarget,
    useIsStaticRenderer,
} from "framer"

const SANS =
    '"Inter Display", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
const DEFAULT_ANNIE = '"Annie Use Your Telescope", "Bradley Hand", cursive'
const GRID_BG =
    "https://framerusercontent.com/images/uTiMeYZo7Cgq17Mt2w60JYMnptc.png"
const CREAM = "#F3EFE6"
const INK = "#111111"
const MUTED = "#555555"
const PHONE_MQ = "(max-width: 809.98px)"
const FOLDER_RADIUS = 28
const DESKTOP_WORDMARK = "Nabia's desktop 2026 edition"

interface WorkItem {
    title: string
    subtitle: string
    slug: string
    year: string
    accent: string
    coverUrl?: string
    videoUrl?: string
    /** Optional full link override for this card (set in properties). */
    href?: string
}

interface WorkIndexProps {
    intro: string
    items: WorkItem[]
    accent: string
    cream: string
    ink: string
    muted: string
    gridOpacity: number
    titleSize: number
    desktopWordmark: string
    font?: { fontFamily?: string }
    displayFont?: { fontFamily?: string }
    /** Editable Back pill destination. */
    backLink: string
    /** Prefix used when a project card has no custom Link — e.g. `/work`. */
    projectBasePath: string
    style?: CSSProperties
}

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

/**
 * Work Index — laptop desktop: sticky wordmark behind large vertically
 * scrollable project folders. Hover reveals the name; click opens the case.
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 1800
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any
 */
export default function WorkIndex(props: WorkIndexProps) {
    const {
        items = DEFAULT_ITEMS,
        accent = "#2C6BE0",
        cream = CREAM,
        ink = INK,
        gridOpacity = 0.06,
        titleSize = 120,
        desktopWordmark = DESKTOP_WORDMARK,
        backLink = "/",
        projectBasePath = "/work",
    } = props
    const family = props.font?.fontFamily || SANS
    const displayFamily = props.displayFont?.fontFamily || DEFAULT_ANNIE
    const isStatic = useIsStaticRenderer()
    const gridAlpha = Math.min(0.12, Math.max(0, Number(gridOpacity) || 0.06))
    const [isPhone, setIsPhone] = useState(false)
    const backHref = resolveLink(backLink, "/")
    const basePath =
        resolveLink(projectBasePath, "/work").replace(/\/$/, "") || "/work"

    useEffect(() => {
        if (typeof window === "undefined") return
        const mq = window.matchMedia(PHONE_MQ)
        const sync = () => setIsPhone(mq.matches)
        sync()
        mq.addEventListener?.("change", sync)
        window.addEventListener("resize", sync)
        return () => {
            mq.removeEventListener?.("change", sync)
            window.removeEventListener("resize", sync)
        }
    }, [])

    const list = useMemo(() => {
        const normalized = (items || [])
            .map((it: any, index: number) => {
                const slug =
                    String(it?.slug || "").replace(/^\//, "") || "project"
                const custom = resolveLink(it?.href || it?.link, "")
                const fallbackVideo =
                    DEFAULT_ITEMS[index % DEFAULT_ITEMS.length]?.videoUrl || ""
                return {
                    title: String(it?.title || "Untitled"),
                    subtitle: String(it?.subtitle || ""),
                    slug,
                    year: String(it?.year || ""),
                    accent: String(it?.accent || accent),
                    coverUrl: it?.coverUrl ? String(it.coverUrl) : "",
                    videoUrl: it?.videoUrl
                        ? String(it.videoUrl)
                        : fallbackVideo,
                    href: custom || `${basePath}/${slug}`,
                } satisfies WorkItem
            })
            .filter((it) => it.title)
        const base = normalized.length
            ? normalized
            : DEFAULT_ITEMS.map((it) => ({
                  ...it,
                  href: `${basePath}/${it.slug}`,
              }))
        return base.slice(0, 4)
    }, [items, accent, basePath])

    if (RenderTarget.current() === RenderTarget.thumbnail) {
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    background: CREAM,
                    padding: 16,
                    fontFamily: SANS,
                    color: INK,
                }}
            >
                <div style={{ fontSize: 22, fontWeight: 600 }}>desktop</div>
            </div>
        )
    }

    const framerStyle = { ...(props.style || {}) } as CSSProperties
    delete framerStyle.width
    delete framerStyle.height
    delete framerStyle.minWidth
    delete framerStyle.minHeight
    delete framerStyle.maxWidth
    delete framerStyle.maxHeight

    const wordmark = String(desktopWordmark || DESKTOP_WORDMARK).trim()

    return (
        <div
            style={{
                ...framerStyle,
                position: "relative",
                width: "100%",
                minWidth: 0,
                maxWidth: "100%",
                height: "auto",
                minHeight: isStatic ? "100%" : "100vh",
                background: cream,
                color: ink,
                fontFamily: family,
                boxSizing: "border-box",
                overflow: "visible",
            }}
        >
            <link
                href="https://fonts.googleapis.com/css2?family=Annie+Use+Your+Telescope&family=Inter:wght@400;500;600;700&display=swap"
                rel="stylesheet"
            />

            <DeskBack
                href={backHref}
                label="Back"
                ariaLabel="Back to home"
                accent={accent}
            />

            {/* Quiet desktop wallpaper grain */}
            <div
                aria-hidden
                style={{
                    position: "fixed",
                    inset: 0,
                    backgroundImage: `url(${GRID_BG})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: gridAlpha,
                    pointerEvents: "none",
                    filter: "grayscale(1)",
                    zIndex: 0,
                }}
            />

            {/* Sticky oversized desktop wordmark — sits behind folders */}
            <div
                aria-hidden
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                    overflow: "hidden",
                    padding: isPhone ? "0 12px" : "0 40px",
                }}
            >
                <p
                    style={{
                        margin: 0,
                        maxWidth: "100%",
                        fontFamily: family,
                        fontSize: isPhone
                            ? `clamp(42px, 14vw, 88px)`
                            : `clamp(72px, 9.2vw, ${Math.max(titleSize, 140)}px)`,
                        fontWeight: 700,
                        letterSpacing: "-0.05em",
                        lineHeight: 0.92,
                        textAlign: "center",
                        textTransform: "none",
                        color: ink,
                        opacity: 0.1,
                        userSelect: "none",
                        whiteSpace: isPhone ? "normal" : "nowrap",
                    }}
                >
                    {wordmark}
                </p>
            </div>

            {/* Vertically scrollable folder stack */}
            <div
                style={{
                    position: "relative",
                    zIndex: 2,
                    width: "100%",
                    minHeight: isStatic ? "100%" : "100vh",
                    padding: isPhone
                        ? "120px 18px 100px"
                        : "110px 56px 140px",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    gap: isPhone ? 56 : 72,
                }}
            >
                {list.map((item, index) => (
                    <DesktopFolder
                        key={item.slug}
                        item={item}
                        index={index}
                        isPhone={isPhone}
                        displayFamily={displayFamily}
                    />
                ))}
            </div>
        </div>
    )
}

function DesktopFolder({
    item,
    index,
    isPhone,
    displayFamily,
}: {
    item: WorkItem
    index: number
    isPhone: boolean
    displayFamily: string
}) {
    const [hovered, setHovered] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        const v = videoRef.current
        if (!v) return
        v.muted = true
        const play = v.play()
        if (play && typeof play.catch === "function") play.catch(() => {})
    }, [item.videoUrl])

    // Stagger left / right like a desktop of oversized folders
    const side = index % 2 === 0 ? "left" : "right"
    const maxW = isPhone ? "100%" : "min(560px, 46vw)"
    const alignSelf =
        isPhone ? "center" : side === "left" ? "flex-start" : "flex-end"
    const rotate = isPhone
        ? index % 2 === 0
            ? "-1.2deg"
            : "1.4deg"
        : side === "left"
          ? "-1.6deg"
          : "1.8deg"

    return (
        <a
            href={item.href || `/work/${item.slug}`}
            aria-label={`${item.title}${item.subtitle ? ` — ${item.subtitle}` : ""}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setHovered(true)}
            onBlur={() => setHovered(false)}
            style={{
                position: "relative",
                alignSelf,
                width: maxW,
                maxWidth: isPhone ? 420 : 560,
                aspectRatio: "4 / 5",
                textDecoration: "none",
                color: "#fff",
                cursor: "pointer",
                outline: "none",
                transform: `rotate(${rotate})`,
                transformOrigin: "center center",
                filter: hovered
                    ? "drop-shadow(0 22px 40px rgba(17,17,17,0.18))"
                    : "drop-shadow(0 14px 28px rgba(17,17,17,0.12))",
                transition: "filter 220ms ease, transform 220ms ease",
            }}
        >
            {/* Folder tab */}
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    left: side === "left" ? 22 : undefined,
                    right: side === "right" ? 22 : undefined,
                    top: -18,
                    width: isPhone ? "38%" : "34%",
                    height: 28,
                    background: item.accent || "#2C6BE0",
                    borderRadius: "14px 14px 0 0",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
                    zIndex: 0,
                }}
            />

            {/* Folder body */}
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    borderRadius: FOLDER_RADIUS,
                    overflow: "hidden",
                    background: item.accent || "#222",
                    border: `1.5px solid rgba(17,17,17,0.12)`,
                    boxSizing: "border-box",
                    zIndex: 1,
                }}
            >
                {item.videoUrl ? (
                    <video
                        ref={videoRef}
                        src={item.videoUrl}
                        poster={item.coverUrl || undefined}
                        muted
                        loop
                        playsInline
                        autoPlay
                        preload="metadata"
                        style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                        }}
                    />
                ) : item.coverUrl ? (
                    <img
                        src={item.coverUrl}
                        alt=""
                        draggable={false}
                        style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                    />
                ) : (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: `linear-gradient(145deg, ${item.accent} 0%, #1a1a1a 125%)`,
                        }}
                    />
                )}

                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        inset: 0,
                        background:
                            "linear-gradient(180deg, rgba(17,17,17,0.04) 0%, rgba(17,17,17,0.5) 100%)",
                        opacity: hovered ? 1 : 0.4,
                        transition: "opacity 220ms ease",
                        pointerEvents: "none",
                    }}
                />

                {/* Quiet folder chrome label */}
                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        top: 16,
                        left: 18,
                        fontFamily: SANS,
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.72)",
                        opacity: hovered ? 0 : 0.85,
                        transition: "opacity 180ms ease",
                        pointerEvents: "none",
                    }}
                >
                    Folder
                </div>

                <div
                    style={{
                        position: "absolute",
                        left: 22,
                        right: 22,
                        bottom: 24,
                        opacity: hovered ? 1 : 0,
                        transform: hovered ? "translateY(0)" : "translateY(12px)",
                        transition: "opacity 220ms ease, transform 220ms ease",
                        pointerEvents: "none",
                    }}
                >
                    <div
                        style={{
                            fontFamily: displayFamily,
                            fontSize: isPhone
                                ? "clamp(28px, 8vw, 40px)"
                                : "clamp(34px, 3.4vw, 48px)",
                            fontWeight: 400,
                            letterSpacing: "-0.02em",
                            lineHeight: 1.05,
                            color: "#fff",
                            textShadow: "0 1px 14px rgba(0,0,0,0.35)",
                        }}
                    >
                        {item.title}
                    </div>
                    {item.subtitle ? (
                        <div
                            style={{
                                marginTop: 6,
                                fontFamily: SANS,
                                fontSize: 14,
                                fontWeight: 500,
                                letterSpacing: "-0.01em",
                                color: "rgba(255,255,255,0.9)",
                            }}
                        >
                            {item.subtitle}
                        </div>
                    ) : null}
                </div>

                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: FOLDER_RADIUS,
                        boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.2)",
                        pointerEvents: "none",
                    }}
                />
            </div>
        </a>
    )
}

/** Fixed back pill — matches Archive / TopBar chrome. */
function DeskBack({
    href,
    label,
    ariaLabel,
    accent,
}: {
    href: string
    label: string
    ariaLabel?: string
    accent: string
}) {
    useEffect(() => {
        if (typeof document === "undefined") return
        document.querySelectorAll("[data-desk-back]").forEach((n) => n.remove())

        const a = document.createElement("a")
        a.href = href
        a.setAttribute("aria-label", ariaLabel || label)
        a.dataset.deskBack = "true"
        const applyChrome = () => {
            const phone = window.matchMedia(PHONE_MQ).matches
            Object.assign(a.style, {
                position: "fixed",
                top: phone ? "88px" : "48px",
                left: phone ? "12px" : "24px",
                zIndex: "1200",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: phone ? "8px 14px" : "10px 22px",
                background: "rgba(255,255,255,0.9)",
                border: "1.5px solid rgb(17,17,17)",
                borderRadius: "999px",
                color: "rgb(17,17,17)",
                textDecoration: "none",
                fontFamily: SANS,
                fontWeight: "500",
                fontSize: "13px",
                letterSpacing: "-1px",
                textTransform: "uppercase",
                boxShadow: "0px 8px 24px rgba(0,0,0,0.14)",
                cursor: "pointer",
                pointerEvents: "auto",
                boxSizing: "border-box",
                lineHeight: "1",
            } as Partial<CSSStyleDeclaration>)
        }
        applyChrome()
        window.addEventListener("resize", applyChrome)

        const arrow = document.createElement("span")
        arrow.textContent = "←"
        Object.assign(arrow.style, {
            color: accent,
            fontSize: "14px",
            lineHeight: "1",
            fontWeight: "600",
        })
        const text = document.createElement("span")
        text.textContent = label
        a.append(arrow, text)
        document.body.appendChild(a)

        return () => {
            window.removeEventListener("resize", applyChrome)
            a.remove()
        }
    }, [href, label, ariaLabel, accent])

    return null
}

const DEFAULT_INTRO =
    "Selected projects & full case studies — product, brand, and the work in between."

const DEFAULT_ITEMS: WorkItem[] = [
    {
        title: "Fintech App",
        subtitle: "Onboarding redesign",
        slug: "fintech-app",
        year: "2025",
        accent: "#7457C9",
        videoUrl:
            "https://framerusercontent.com/assets/ORbhq8svUVYaQVK6qVkEsQVUyc.mp4",
    },
    {
        title: "Health Platform",
        subtitle: "Design system",
        slug: "health-platform",
        year: "2024",
        accent: "#28A06A",
        videoUrl:
            "https://framerusercontent.com/assets/BNCHHO0RxeNVJXt0bV6lIpxZeo.mp4",
    },
    {
        title: "Chutney Studios",
        subtitle: "Brand + site",
        slug: "chutney-studios",
        year: "2025",
        accent: "#D17BB0",
        videoUrl:
            "https://framerusercontent.com/assets/1l5FmP2EGRoLJ5xUbGoAAne5sg.mp4",
    },
    {
        title: "Travel App",
        subtitle: "0→1 product",
        slug: "travel-app",
        year: "2023",
        accent: "#E0902F",
        videoUrl:
            "https://framerusercontent.com/assets/08VoVyi5fkN62AMjxKHCOQ84iI.mp4",
    },
]

addPropertyControls(WorkIndex, {
    intro: {
        type: ControlType.String,
        title: "Intro",
        defaultValue: DEFAULT_INTRO,
        displayTextArea: true,
    },
    desktopWordmark: {
        type: ControlType.String,
        title: "Desktop Wordmark",
        defaultValue: DESKTOP_WORDMARK,
    },
    items: {
        type: ControlType.Array,
        title: "Projects",
        maxCount: 4,
        control: {
            type: ControlType.Object,
            controls: {
                title: {
                    type: ControlType.String,
                    title: "Title",
                    defaultValue: "Project",
                },
                subtitle: {
                    type: ControlType.String,
                    title: "Subtitle",
                    defaultValue: "Type",
                },
                slug: {
                    type: ControlType.String,
                    title: "Slug",
                    defaultValue: "project",
                },
                href: {
                    type: ControlType.Link,
                    title: "Link — Card (optional)",
                },
                year: {
                    type: ControlType.String,
                    title: "Year",
                    defaultValue: "2025",
                },
                accent: {
                    type: ControlType.Color,
                    title: "Accent",
                    defaultValue: "#2C6BE0",
                },
                videoUrl: {
                    type: ControlType.String,
                    title: "Video URL",
                    defaultValue: "",
                },
                coverUrl: {
                    type: ControlType.String,
                    title: "Poster / Cover URL",
                    defaultValue: "",
                },
            },
        },
        defaultValue: DEFAULT_ITEMS,
    },
    accent: { type: ControlType.Color, title: "UI Accent", defaultValue: "#2C6BE0" },
    backLink: {
        type: ControlType.Link,
        title: "Link — Back Button",
        defaultValue: "/",
    },
    projectBasePath: {
        type: ControlType.Link,
        title: "Link — Project Base Path",
        defaultValue: "/work",
    },
    cream: { type: ControlType.Color, title: "Background", defaultValue: "#F3EFE6" },
    ink: { type: ControlType.Color, title: "Ink", defaultValue: "#111111" },
    muted: { type: ControlType.Color, title: "Muted Text", defaultValue: "#555555" },
    displayFont: {
        type: ControlType.Font,
        title: "Display Font",
        controls: "extended",
        defaultFontType: "sans-serif",
        defaultValue: {
            fontSize: "48px",
            variant: "Regular",
        },
    },
    font: {
        type: ControlType.Font,
        title: "Body Font",
        controls: "extended",
        defaultFontType: "sans-serif",
        defaultValue: {
            fontSize: "15px",
            variant: "Regular",
            lineHeight: "1.5em",
        },
    },
    titleSize: {
        type: ControlType.Number,
        title: "Wordmark Size",
        defaultValue: 120,
        min: 64,
        max: 200,
        step: 2,
    },
    gridOpacity: {
        type: ControlType.Number,
        title: "Grain Opacity",
        defaultValue: 0.06,
        min: 0,
        max: 0.3,
        step: 0.01,
    },
})
