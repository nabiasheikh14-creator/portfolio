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
const CREAM = "#F3EFE6"
const INK = "#111111"
const MUTED = "#555555"
const PHONE_MQ = "(max-width: 809.98px)"
const FOLDER_RADIUS = 26
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
 * Work Index — laptop desktop with horizontally parallaxing wordmark and
 * straight, mid-size project folders in a vertical scroll.
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 2200
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any
 */
export default function WorkIndex(props: WorkIndexProps) {
    const {
        items = DEFAULT_ITEMS,
        accent = "#2C6BE0",
        cream = CREAM,
        ink = INK,
        titleSize = 160,
        desktopWordmark = DESKTOP_WORDMARK,
        backLink = "/",
        projectBasePath = "/work",
    } = props
    const family = props.font?.fontFamily || SANS
    const displayFamily = props.displayFont?.fontFamily || DEFAULT_ANNIE
    const isStatic = useIsStaticRenderer()
    const [isPhone, setIsPhone] = useState(false)
    const [scrollP, setScrollP] = useState(0)
    const backHref = resolveLink(backLink, "/")
    const basePath =
        resolveLink(projectBasePath, "/work").replace(/\/$/, "") || "/work"
    const wordmark = String(desktopWordmark || DESKTOP_WORDMARK).trim()

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

    useEffect(() => {
        if (typeof window === "undefined" || isStatic) return
        let raf = 0
        const update = () => {
            const max = Math.max(
                1,
                document.documentElement.scrollHeight - window.innerHeight,
            )
            setScrollP(Math.min(1, Math.max(0, window.scrollY / max)))
        }
        const onScroll = () => {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(update)
        }
        update()
        window.addEventListener("scroll", onScroll, { passive: true })
        window.addEventListener("resize", onScroll)
        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener("scroll", onScroll)
            window.removeEventListener("resize", onScroll)
        }
    }, [isStatic])

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

    // Fasquelle-style: vertical scroll drives a long horizontal wordmark track
    const trackShift = isPhone
        ? 28 + scrollP * 70
        : 18 + scrollP * 92
    const wordmarkX = `${50 - trackShift}%`

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

            {/* Fixed horizontal wordmark track — moves with vertical scroll */}
            <div
                aria-hidden
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 1,
                    display: "flex",
                    alignItems: "center",
                    pointerEvents: "none",
                    overflow: "hidden",
                }}
            >
                <p
                    style={{
                        margin: 0,
                        position: "absolute",
                        left: wordmarkX,
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        fontFamily: family,
                        fontSize: isPhone
                            ? `clamp(64px, 18vw, 120px)`
                            : `clamp(96px, 12vw, ${Math.max(titleSize, 160)}px)`,
                        fontWeight: 700,
                        letterSpacing: "-0.055em",
                        lineHeight: 0.9,
                        whiteSpace: "nowrap",
                        color: ink,
                        opacity: 0.13,
                        userSelect: "none",
                        willChange: "left",
                    }}
                >
                    {`${wordmark}  ·  ${wordmark}  ·  ${wordmark}`}
                </p>
            </div>

            {/* Quiet progress chrome */}
            <div
                aria-hidden
                style={{
                    position: "fixed",
                    left: isPhone ? 14 : 28,
                    bottom: isPhone ? 18 : 28,
                    zIndex: 5,
                    fontFamily: family,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: MUTED,
                    pointerEvents: "none",
                    opacity: 0.7,
                }}
            >
                {Math.min(list.length, Math.max(1, Math.round(scrollP * list.length) || 1))}
                {" / "}
                {list.length} folders
            </div>

            {/* Vertically scrollable folder stack */}
            <div
                style={{
                    position: "relative",
                    zIndex: 2,
                    width: "100%",
                    minHeight: isStatic ? "100%" : "140vh",
                    padding: isPhone
                        ? "120px 20px 160px"
                        : "130px 8vw 200px",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    gap: isPhone ? 64 : 96,
                }}
            >
                {list.map((item, index) => (
                    <DesktopFolder
                        key={item.slug}
                        item={item}
                        index={index}
                        total={list.length}
                        isPhone={isPhone}
                        displayFamily={displayFamily}
                        bodyFamily={family}
                    />
                ))}
            </div>
        </div>
    )
}

function DesktopFolder({
    item,
    index,
    total,
    isPhone,
    displayFamily,
    bodyFamily,
}: {
    item: WorkItem
    index: number
    total: number
    isPhone: boolean
    displayFamily: string
    bodyFamily: string
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

    const side = index % 2 === 0 ? "left" : "right"
    const folderW = isPhone ? "min(300px, 82vw)" : 340
    const alignSelf = isPhone
        ? "center"
        : side === "left"
          ? "flex-start"
          : "flex-end"
    const number = `${String(index + 1).padStart(2, "0")}/${String(total).padStart(2, "0")}`

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
                width: folderW,
                aspectRatio: "3 / 4",
                textDecoration: "none",
                color: "#fff",
                cursor: "pointer",
                outline: "none",
                transform: hovered ? "translateY(-6px)" : "translateY(0)",
                transition: "transform 280ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 280ms ease",
                boxShadow: hovered
                    ? "0 28px 60px rgba(17,17,17,0.16)"
                    : "0 16px 40px rgba(17,17,17,0.1)",
                borderRadius: FOLDER_RADIUS,
            }}
        >
            {/* Folder tab */}
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    left: side === "right" ? undefined : 18,
                    right: side === "right" ? 18 : undefined,
                    top: -14,
                    width: "32%",
                    height: 22,
                    background: item.accent || "#2C6BE0",
                    borderRadius: "12px 12px 0 0",
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
                    background: item.accent || "#1a1a1a",
                    border: "1px solid rgba(17,17,17,0.08)",
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
                            transform: hovered ? "scale(1.03)" : "scale(1)",
                            transition: "transform 500ms ease",
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
                            transform: hovered ? "scale(1.03)" : "scale(1)",
                            transition: "transform 500ms ease",
                        }}
                    />
                ) : (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: `linear-gradient(145deg, ${item.accent} 0%, #111 125%)`,
                        }}
                    />
                )}

                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        inset: 0,
                        background:
                            "linear-gradient(180deg, rgba(17,17,17,0.08) 0%, rgba(17,17,17,0.55) 100%)",
                        opacity: hovered ? 1 : 0.45,
                        transition: "opacity 240ms ease",
                        pointerEvents: "none",
                    }}
                />

                {/* Utility labels */}
                <div
                    style={{
                        position: "absolute",
                        top: 16,
                        left: 16,
                        right: 16,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        fontFamily: bodyFamily,
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.78)",
                        pointerEvents: "none",
                    }}
                >
                    <span>(project)</span>
                    <span>{number}</span>
                </div>

                {/* Hover name */}
                <div
                    style={{
                        position: "absolute",
                        left: 18,
                        right: 18,
                        bottom: 20,
                        opacity: hovered ? 1 : 0,
                        transform: hovered ? "translateY(0)" : "translateY(10px)",
                        transition: "opacity 240ms ease, transform 240ms ease",
                        pointerEvents: "none",
                    }}
                >
                    <div
                        style={{
                            fontFamily: displayFamily,
                            fontSize: isPhone ? 30 : 34,
                            fontWeight: 400,
                            letterSpacing: "-0.02em",
                            lineHeight: 1.05,
                            color: "#fff",
                            textShadow: "0 1px 16px rgba(0,0,0,0.3)",
                        }}
                    >
                        {item.title}
                    </div>
                    <div
                        style={{
                            marginTop: 8,
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 12,
                            fontFamily: bodyFamily,
                            fontSize: 11,
                            fontWeight: 500,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,0.88)",
                        }}
                    >
                        <span>{item.subtitle || "Case study"}</span>
                        {item.year ? <span>{item.year}</span> : null}
                    </div>
                </div>

                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: FOLDER_RADIUS,
                        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.16)",
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
                background: "rgba(255,255,255,0.92)",
                border: "1.5px solid rgb(17,17,17)",
                borderRadius: "999px",
                color: "rgb(17,17,17)",
                textDecoration: "none",
                fontFamily: SANS,
                fontWeight: "500",
                fontSize: "13px",
                letterSpacing: "-1px",
                textTransform: "uppercase",
                boxShadow: "0px 8px 24px rgba(0,0,0,0.12)",
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
        defaultValue: 160,
        min: 96,
        max: 240,
        step: 4,
    },
})
