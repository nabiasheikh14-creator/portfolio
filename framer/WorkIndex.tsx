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
/** Same stage as DeskWorkspace so the grid matches home scale/placement. */
const STAGE_W = 1440
const STAGE_H = 900
const CREAM = "#F3EFE6"
const INK = "#111111"
const MUTED = "#555555"
const PHONE_MQ = "(max-width: 809.98px)"
const FOLDER_RADIUS = 26
const DESKTOP_WORDMARK = "NABIA'S DESKTOP 2026 EDITION"
const FOLDER_BLUE = "#2C6BE0"
const LAPTOP_ZOOM_KEY = "__nabiaLaptopZoom"

interface WorkItem {
    title: string
    subtitle: string
    slug: string
    year: string
    accent: string
    coverUrl?: string
    videoUrl?: string
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
    gridOpacity: number
    desktopWordmark: string
    font?: { fontFamily?: string }
    displayFont?: { fontFamily?: string }
    backLink: string
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

function useStageScale() {
    const [scale, setScale] = useState(1)
    useEffect(() => {
        if (typeof window === "undefined") return
        const sync = () => {
            setScale(
                Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H),
            )
        }
        sync()
        window.addEventListener("resize", sync)
        return () => window.removeEventListener("resize", sync)
    }, [])
    return scale
}

/**
 * Work Index — fixed desktop viewport (page does not scroll).
 * Folders scroll inside; desk grid matches homepage stage scale.
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 900
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function WorkIndex(props: WorkIndexProps) {
    const {
        items = DEFAULT_ITEMS,
        accent = "#2C6BE0",
        cream = CREAM,
        ink = INK,
        titleSize = 160,
        gridOpacity = 0.12,
        desktopWordmark = DESKTOP_WORDMARK,
        backLink = "/",
        projectBasePath = "/work",
    } = props
    const family = props.font?.fontFamily || SANS
    const displayFamily = props.displayFont?.fontFamily || DEFAULT_ANNIE
    const isStatic = useIsStaticRenderer()
    const [isPhone, setIsPhone] = useState(false)
    const [scrollP, setScrollP] = useState(0)
    const [reveal, setReveal] = useState<"idle" | "from" | "to">("idle")
    const scrollerRef = useRef<HTMLDivElement>(null)
    const stageScale = useStageScale()
    const backHref = resolveLink(backLink, "/")
    const basePath =
        resolveLink(projectBasePath, "/work").replace(/\/$/, "") || "/work"
    const wordmark = String(desktopWordmark || DESKTOP_WORDMARK).trim()
    const gridAlpha = Math.min(0.2, Math.max(0.04, Number(gridOpacity) || 0.12))

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

    // Hard-lock the Framer page: viewport stays put; only folders move.
    useEffect(() => {
        if (typeof document === "undefined" || isStatic) return
        const html = document.documentElement
        const body = document.body
        const prev = {
            htmlOverflow: html.style.overflow,
            bodyOverflow: body.style.overflow,
            htmlHeight: html.style.height,
            bodyHeight: body.style.height,
            htmlOverscroll: html.style.overscrollBehavior,
            bodyOverscroll: body.style.overscrollBehavior,
            bodyPosition: body.style.position,
        }

        const lock = () => {
            html.style.overflow = "hidden"
            body.style.overflow = "hidden"
            html.style.height = "100%"
            body.style.height = "100%"
            html.style.overscrollBehavior = "none"
            body.style.overscrollBehavior = "none"
            window.scrollTo(0, 0)
        }
        lock()

        const style = document.createElement("style")
        style.setAttribute("data-nabia-work-lock", "true")
        style.textContent = `
          html, body { overflow: hidden !important; height: 100% !important; overscroll-behavior: none !important; }
          body > div, #main, [data-framer-root], [data-framer-page-container] {
            overflow: hidden !important;
            max-height: 100vh !important;
          }
          [data-work-scroller]::-webkit-scrollbar { width: 0; height: 0; display: none; }
        `
        document.head.appendChild(style)

        const onScroll = () => {
            if (window.scrollY !== 0 || window.scrollX !== 0) window.scrollTo(0, 0)
        }
        window.addEventListener("scroll", onScroll, { passive: false })
        const interval = window.setInterval(lock, 500)

        return () => {
            window.clearInterval(interval)
            window.removeEventListener("scroll", onScroll)
            style.remove()
            html.style.overflow = prev.htmlOverflow
            body.style.overflow = prev.bodyOverflow
            html.style.height = prev.htmlHeight
            body.style.height = prev.bodyHeight
            html.style.overscrollBehavior = prev.htmlOverscroll
            body.style.overscrollBehavior = prev.bodyOverscroll
            body.style.position = prev.bodyPosition
        }
    }, [isStatic])

    // Route wheel / trackpad to the folder scroller (page never moves).
    useEffect(() => {
        if (typeof window === "undefined" || isStatic) return
        const onWheel = (e: WheelEvent) => {
            const el = scrollerRef.current
            if (!el) return
            e.preventDefault()
            el.scrollTop += e.deltaY
        }
        window.addEventListener("wheel", onWheel, { passive: false })
        return () => window.removeEventListener("wheel", onWheel)
    }, [isStatic])

    // Home overlay already did the frame zoom-out — clear it; light settle only.
    useEffect(() => {
        if (typeof window === "undefined" || isStatic) return
        try {
            document.getElementById("nabia-laptop-zoom")?.remove()
        } catch (_) {}

        let fromZoom = false
        try {
            fromZoom = sessionStorage.getItem(LAPTOP_ZOOM_KEY) === "1"
            sessionStorage.removeItem(LAPTOP_ZOOM_KEY)
        } catch (_) {}
        if (!fromZoom) return
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
            return
        }

        setReveal("from")
        let toId = 0
        const fromId = window.setTimeout(() => {
            setReveal("to")
            toId = window.setTimeout(() => setReveal("idle"), 700)
        }, 30)
        return () => {
            window.clearTimeout(fromId)
            window.clearTimeout(toId)
        }
    }, [isStatic])

    useEffect(() => {
        if (typeof window === "undefined" || isStatic) return
        const el = scrollerRef.current
        if (!el) return
        let raf = 0
        const update = () => {
            const max = Math.max(1, el.scrollHeight - el.clientHeight)
            setScrollP(Math.min(1, Math.max(0, el.scrollTop / max)))
        }
        const onScroll = () => {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(update)
        }
        update()
        el.addEventListener("scroll", onScroll, { passive: true })
        window.addEventListener("resize", onScroll)
        return () => {
            cancelAnimationFrame(raf)
            el.removeEventListener("scroll", onScroll)
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

    const trackShift = isPhone ? 28 + scrollP * 70 : 18 + scrollP * 92
    const wordmarkX = `${50 - trackShift}%`

    // Soft handoff after the home frame-expand (avoid a second hard zoom).
    const revealScale = reveal === "from" ? 1.04 : 1
    const revealOpacity = reveal === "from" ? 0.88 : 1

    return (
        <div
            id="nabia-work-index"
            style={{
                ...framerStyle,
                position: isStatic ? "relative" : "fixed",
                inset: isStatic ? undefined : 0,
                left: isStatic ? undefined : 0,
                top: isStatic ? undefined : 0,
                right: isStatic ? undefined : 0,
                bottom: isStatic ? undefined : 0,
                width: isStatic ? "100%" : "100vw",
                height: isStatic ? "100%" : "100vh",
                maxWidth: "100vw",
                maxHeight: "100vh",
                minWidth: 0,
                zIndex: isStatic ? undefined : 2,
                background: cream,
                color: ink,
                fontFamily: family,
                boxSizing: "border-box",
                overflow: "hidden",
                transform: `scale(${revealScale})`,
                transformOrigin: "center center",
                opacity: revealOpacity,
                transition:
                    reveal === "from"
                        ? "none"
                        : "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease",
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

            {/* Homepage-matched desk grid: 1440×900 stage, same fit-scale as DeskWorkspace */}
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 0,
                    pointerEvents: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        width: STAGE_W,
                        height: STAGE_H,
                        flex: "none",
                        transform: `scale(${stageScale})`,
                        transformOrigin: "center center",
                        backgroundImage: `url(${GRID_BG})`,
                        backgroundSize: "100% 100%",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        opacity: gridAlpha,
                        filter: "grayscale(1)",
                    }}
                />
            </div>

            <div
                aria-hidden
                style={{
                    position: "absolute",
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
                        letterSpacing: "-0.04em",
                        lineHeight: 0.9,
                        whiteSpace: "nowrap",
                        textTransform: "uppercase",
                        color: ink,
                        opacity: 0.34,
                        userSelect: "none",
                        willChange: "left",
                    }}
                >
                    {`${wordmark.toUpperCase()}  ·  ${wordmark.toUpperCase()}  ·  ${wordmark.toUpperCase()}`}
                </p>
            </div>

            <div
                aria-hidden
                style={{
                    position: "absolute",
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
                    opacity: 0.75,
                }}
            >
                {Math.min(
                    list.length,
                    Math.max(1, Math.round(scrollP * list.length) || 1),
                )}
                {" / "}
                {list.length} folders
            </div>

            {/* Cards scroll here — the page shell stays fixed */}
            <div
                ref={scrollerRef}
                data-work-scroller="true"
                style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 2,
                    overflowX: "hidden",
                    overflowY: "auto",
                    WebkitOverflowScrolling: "touch",
                    overscrollBehavior: "contain",
                    padding: isPhone
                        ? "110px 18px 120px"
                        : "110px 7vw 140px",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    gap: isPhone ? 22 : 28,
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
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
                        folderBlue={accent || FOLDER_BLUE}
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
    folderBlue,
}: {
    item: WorkItem
    index: number
    total: number
    isPhone: boolean
    displayFamily: string
    bodyFamily: string
    folderBlue: string
}) {
    const [hovered, setHovered] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const blue = folderBlue || FOLDER_BLUE

    useEffect(() => {
        const v = videoRef.current
        if (!v) return
        v.muted = true
        const play = v.play()
        if (play && typeof play.catch === "function") play.catch(() => {})
    }, [item.videoUrl])

    const side = index % 2 === 0 ? "left" : "right"
    // Wide horizontal folders, tighter stack
    const folderW = isPhone ? "min(100%, 92vw)" : "min(720px, 58vw)"
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
                flex: "none",
                aspectRatio: isPhone ? "16 / 11" : "16 / 10",
                textDecoration: "none",
                color: "#fff",
                cursor: "pointer",
                outline: "none",
                transform: hovered ? "translateY(-5px)" : "translateY(0)",
                transition: "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
        >
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    inset: isPhone ? "-10% -8%" : "-12% -10%",
                    background: `radial-gradient(ellipse at center, ${blue} 0%, rgba(44,107,224,0.35) 42%, rgba(44,107,224,0) 72%)`,
                    opacity: hovered ? 0.9 : 0.7,
                    filter: "blur(18px)",
                    zIndex: 0,
                    pointerEvents: "none",
                    transition: "opacity 280ms ease",
                }}
            />

            <div
                aria-hidden
                style={{
                    position: "absolute",
                    left: side === "right" ? undefined : 20,
                    right: side === "right" ? 20 : undefined,
                    top: -16,
                    width: "34%",
                    height: 26,
                    background: blue,
                    borderRadius: "14px 14px 0 0",
                    zIndex: 1,
                    boxShadow: `0 0 24px ${blue}55`,
                }}
            />

            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    borderRadius: FOLDER_RADIUS,
                    overflow: "hidden",
                    background: "#f7f4ee",
                    border: `2.5px solid rgba(255,255,255,0.92)`,
                    boxShadow: hovered
                        ? `0 26px 50px rgba(17,17,17,0.14), 0 0 0 1px ${blue}33, inset 0 0 0 1px rgba(17,17,17,0.06)`
                        : `0 18px 40px rgba(17,17,17,0.1), 0 0 0 1px ${blue}22, inset 0 0 0 1px rgba(17,17,17,0.05)`,
                    boxSizing: "border-box",
                    zIndex: 2,
                    transition: "box-shadow 280ms ease",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        inset: 10,
                        borderRadius: FOLDER_RADIUS - 10,
                        overflow: "hidden",
                        background: "#111",
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
                                transform: hovered ? "scale(1.04)" : "scale(1)",
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
                                transform: hovered ? "scale(1.04)" : "scale(1)",
                                transition: "transform 500ms ease",
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                background: `linear-gradient(145deg, ${blue} 0%, #111 125%)`,
                            }}
                        />
                    )}

                    <div
                        aria-hidden
                        style={{
                            position: "absolute",
                            inset: 0,
                            background:
                                "linear-gradient(180deg, rgba(17,17,17,0.1) 0%, rgba(17,17,17,0.58) 100%)",
                            opacity: hovered ? 1 : 0.5,
                            transition: "opacity 240ms ease",
                            pointerEvents: "none",
                        }}
                    />

                    <div
                        style={{
                            position: "absolute",
                            top: 14,
                            left: 14,
                            right: 14,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            fontFamily: bodyFamily,
                            fontSize: 10,
                            fontWeight: 600,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,0.82)",
                            pointerEvents: "none",
                        }}
                    >
                        <span>(folder)</span>
                        <span>{number}</span>
                    </div>

                    <div
                        style={{
                            position: "absolute",
                            left: 16,
                            right: 16,
                            bottom: 18,
                            opacity: hovered ? 1 : 0,
                            transform: hovered
                                ? "translateY(0)"
                                : "translateY(10px)",
                            transition:
                                "opacity 240ms ease, transform 240ms ease",
                            pointerEvents: "none",
                        }}
                    >
                        <div
                            style={{
                                fontFamily: displayFamily,
                                fontSize: isPhone ? 30 : 36,
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
                                color: "rgba(255,255,255,0.9)",
                            }}
                        >
                            <span>{item.subtitle || "Case study"}</span>
                            {item.year ? <span>{item.year}</span> : null}
                        </div>
                    </div>
                </div>
            </div>
        </a>
    )
}

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

const DEFAULT_ITEMS: WorkItem[] = [
    {
        title: "Fintech Onboarding",
        subtitle: "Product design",
        slug: "fintech-onboarding",
        year: "2025",
        accent: "#2C6BE0",
        videoUrl:
            "https://framerusercontent.com/assets/ORbhq8svUVYaQVK6qVkEsQVUyc.mp4",
    },
    {
        title: "Archive System",
        subtitle: "Brand & web",
        slug: "archive-system",
        year: "2024",
        accent: "#2C6BE0",
        videoUrl:
            "https://framerusercontent.com/assets/BNCHHO0RxeNVJXt0bV6lIpxZeo.mp4",
    },
    {
        title: "Studio Site",
        subtitle: "Art direction",
        slug: "studio-site",
        year: "2024",
        accent: "#2C6BE0",
        videoUrl:
            "https://framerusercontent.com/assets/1l5FmP2EGRoLJ5xUbGoAAne5sg.mp4",
    },
    {
        title: "Editorial Deck",
        subtitle: "Campaign",
        slug: "editorial-deck",
        year: "2023",
        accent: "#2C6BE0",
        videoUrl:
            "https://framerusercontent.com/assets/08VoVyi5fkN62AMjxKHCOQ84iI.mp4",
    },
]

addPropertyControls(WorkIndex, {
    intro: {
        type: ControlType.String,
        title: "Intro",
        displayTextArea: true,
        defaultValue:
            "Selected work from product, brand, and editorial projects.",
    },
    items: {
        type: ControlType.Array,
        title: "Projects",
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String, title: "Title" },
                subtitle: { type: ControlType.String, title: "Subtitle" },
                slug: { type: ControlType.String, title: "Slug" },
                year: { type: ControlType.String, title: "Year" },
                accent: {
                    type: ControlType.Color,
                    title: "Accent",
                    defaultValue: "#2C6BE0",
                },
                coverUrl: {
                    type: ControlType.Image,
                    title: "Cover",
                },
                videoUrl: {
                    type: ControlType.String,
                    title: "Video URL",
                },
                href: {
                    type: ControlType.Link,
                    title: "Link",
                },
            },
        },
    },
    accent: {
        type: ControlType.Color,
        title: "Accent",
        defaultValue: "#2C6BE0",
    },
    cream: {
        type: ControlType.Color,
        title: "Cream",
        defaultValue: "#F3EFE6",
    },
    ink: {
        type: ControlType.Color,
        title: "Ink",
        defaultValue: "#111111",
    },
    muted: {
        type: ControlType.Color,
        title: "Muted",
        defaultValue: "#555555",
    },
    backLink: {
        type: ControlType.Link,
        title: "Back Link",
        defaultValue: "/",
    },
    projectBasePath: {
        type: ControlType.String,
        title: "Project Base",
        defaultValue: "/work",
    },
    desktopWordmark: {
        type: ControlType.String,
        title: "Wordmark",
        defaultValue: DESKTOP_WORDMARK,
    },
    displayFont: {
        type: ControlType.Font,
        title: "Display Font",
        controls: "extended",
        defaultFontType: "sans-serif",
        defaultValue: {
            fontSize: "36px",
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
    gridOpacity: {
        type: ControlType.Number,
        title: "Grid Opacity",
        defaultValue: 0.12,
        min: 0,
        max: 0.3,
        step: 0.01,
    },
})
