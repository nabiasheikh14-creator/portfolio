import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type MutableRefObject,
    type RefObject,
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
const VISUAL_RADIUS = 28
const ACCENT = "#2C6BE0"
const LAPTOP_ZOOM_KEY = "__nabiaLaptopZoom"

export interface WorkProject {
    title: string
    subtitle: string
    description: string
    slug: string
    year: string
    accent: string
    coverUrl?: string
    videoUrl?: string
    href?: string
}

interface WorkIndexProps {
    intro: string
    sectionLabel: string
    ctaLabel: string
    archiveLabel: string
    archiveLink: string
    items: WorkProject[]
    accent: string
    cream: string
    ink: string
    muted: string
    gridOpacity: number
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

function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(false)
    useEffect(() => {
        if (typeof window === "undefined") return
        const mq = window.matchMedia(query)
        const sync = () => setMatches(mq.matches)
        sync()
        mq.addEventListener?.("change", sync)
        window.addEventListener("resize", sync)
        return () => {
            mq.removeEventListener?.("change", sync)
            window.removeEventListener("resize", sync)
        }
    }, [query])
    return matches
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

function normalizeProjects(
    items: WorkProject[] | undefined,
    accent: string,
    basePath: string,
): WorkProject[] {
    const normalized = (items || [])
        .map((it: any, index: number) => {
            const slug =
                String(it?.slug || "").replace(/^\//, "") || `project-${index + 1}`
            const custom = resolveLink(it?.href || it?.link, "")
            const fallback = DEFAULT_ITEMS[index % DEFAULT_ITEMS.length]
            return {
                title: String(it?.title || fallback?.title || "Untitled"),
                subtitle: String(it?.subtitle || fallback?.subtitle || ""),
                description: String(
                    it?.description || fallback?.description || "",
                ),
                slug,
                year: String(it?.year || fallback?.year || ""),
                accent: String(it?.accent || accent || ACCENT),
                coverUrl: it?.coverUrl ? String(it.coverUrl) : fallback?.coverUrl || "",
                videoUrl: it?.videoUrl
                    ? String(it.videoUrl)
                    : fallback?.videoUrl || "",
                href: custom || `${basePath}/${slug}`,
            } satisfies WorkProject
        })
        .filter((it) => it.title)

    if (normalized.length) return normalized
    return DEFAULT_ITEMS.map((it) => ({
        ...it,
        href: `${basePath}/${it.slug}`,
    }))
}

/**
 * Work Index — scroll-driven project browser.
 * Desktop: sticky info + large visual that advances with scroll.
 * Mobile: natural vertical project sequence.
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 900
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function WorkIndex(props: WorkIndexProps) {
    const {
        items = DEFAULT_ITEMS,
        sectionLabel = "Selected work",
        ctaLabel = "View case study",
        archiveLabel = "View archive",
        archiveLink = "/archive",
        accent = ACCENT,
        cream = CREAM,
        ink = INK,
        muted = MUTED,
        gridOpacity = 0.12,
        backLink = "/",
        projectBasePath = "/work",
    } = props
    const family = props.font?.fontFamily || SANS
    const isStatic = useIsStaticRenderer()
    const isPhone = useMediaQuery(PHONE_MQ)
    const stageScale = useStageScale()
    const backHref = resolveLink(backLink, "/")
    const archiveHref = resolveLink(archiveLink, "/archive")
    const basePath =
        resolveLink(projectBasePath, "/work").replace(/\/$/, "") || "/work"
    const gridAlpha = Math.min(0.2, Math.max(0.04, Number(gridOpacity) || 0.12))

    const list = useMemo(
        () => normalizeProjects(items, accent, basePath),
        [items, accent, basePath],
    )

    const [activeIndex, setActiveIndex] = useState(0)
    const [infoVisible, setInfoVisible] = useState(true)
    const [reveal, setReveal] = useState<"idle" | "from" | "to">("idle")
    const scrollerRef = useRef<HTMLDivElement>(null)
    const slideRefs = useRef<(HTMLElement | null)[]>([])
    const activeRef = useRef(0)

    // Laptop zoom settle
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

    // Desktop: lock page scroll; only the project scroller moves.
    useEffect(() => {
        if (typeof document === "undefined" || isStatic || isPhone) return
        const html = document.documentElement
        const body = document.body
        const prev = {
            htmlOverflow: html.style.overflow,
            bodyOverflow: body.style.overflow,
            htmlHeight: html.style.height,
            bodyHeight: body.style.height,
            htmlOverscroll: html.style.overscrollBehavior,
            bodyOverscroll: body.style.overscrollBehavior,
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
        }
    }, [isStatic, isPhone])

    // Route wheel to internal scroller on desktop
    useEffect(() => {
        if (typeof window === "undefined" || isStatic || isPhone) return
        const onWheel = (e: WheelEvent) => {
            const el = scrollerRef.current
            if (!el) return
            e.preventDefault()
            el.scrollTop += e.deltaY
        }
        window.addEventListener("wheel", onWheel, { passive: false })
        return () => window.removeEventListener("wheel", onWheel)
    }, [isStatic, isPhone])

    // Scroll-driven active project (desktop scroller or mobile window)
    useEffect(() => {
        if (typeof window === "undefined" || isStatic) return

        const pickActive = () => {
            const nodes = slideRefs.current.filter(Boolean) as HTMLElement[]
            if (!nodes.length) return

            const root = isPhone ? null : scrollerRef.current
            const viewTop = root ? root.getBoundingClientRect().top : 0
            const viewH = root ? root.clientHeight : window.innerHeight
            const center = viewTop + viewH * 0.42

            let best = 0
            let bestDist = Infinity
            nodes.forEach((node, i) => {
                const r = node.getBoundingClientRect()
                const mid = r.top + r.height / 2
                const dist = Math.abs(mid - center)
                if (dist < bestDist) {
                    bestDist = dist
                    best = i
                }
            })

            if (best !== activeRef.current) {
                activeRef.current = best
                setInfoVisible(false)
                window.setTimeout(() => {
                    setActiveIndex(best)
                    setInfoVisible(true)
                }, 120)
            }
        }

        let raf = 0
        const onScroll = () => {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(pickActive)
        }

        pickActive()
        const root = scrollerRef.current
        if (!isPhone && root) {
            root.addEventListener("scroll", onScroll, { passive: true })
        }
        window.addEventListener("scroll", onScroll, { passive: true })
        window.addEventListener("resize", onScroll)
        return () => {
            cancelAnimationFrame(raf)
            root?.removeEventListener("scroll", onScroll)
            window.removeEventListener("scroll", onScroll)
            window.removeEventListener("resize", onScroll)
        }
    }, [isStatic, isPhone, list.length])

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
                <div style={{ fontSize: 22, fontWeight: 600 }}>work</div>
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

    const revealScale = reveal === "from" ? 1.04 : 1
    const revealOpacity = reveal === "from" ? 0.88 : 1
    const active = list[Math.min(activeIndex, list.length - 1)] || list[0]

    const shellStyle: CSSProperties = {
        ...framerStyle,
        position: isStatic || isPhone ? "relative" : "fixed",
        inset: isStatic || isPhone ? undefined : 0,
        width: isStatic || isPhone ? "100%" : "100vw",
        height: isStatic || isPhone ? "100%" : "100vh",
        minHeight: isPhone ? "100vh" : undefined,
        maxWidth: "100vw",
        maxHeight: isStatic || isPhone ? undefined : "100vh",
        minWidth: 0,
        zIndex: isStatic ? undefined : 2,
        background: cream,
        color: ink,
        fontFamily: family,
        boxSizing: "border-box",
        overflow: isPhone ? "visible" : "hidden",
        transform: `scale(${revealScale})`,
        transformOrigin: "center center",
        opacity: revealOpacity,
        transition:
            reveal === "from"
                ? "none"
                : "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease",
    }

    return (
        <div id="nabia-work-index" style={shellStyle}>
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

            <GridBackdrop stageScale={stageScale} opacity={gridAlpha} />

            {isPhone ? (
                <MobileSequence
                    list={list}
                    accent={accent}
                    ink={ink}
                    muted={muted}
                    cream={cream}
                    family={family}
                    sectionLabel={sectionLabel}
                    ctaLabel={ctaLabel}
                    archiveLabel={archiveLabel}
                    archiveHref={archiveHref}
                    slideRefs={slideRefs}
                    activeIndex={activeIndex}
                />
            ) : (
                    <DesktopBrowser
                    list={list}
                    active={active}
                    activeIndex={activeIndex}
                    infoVisible={infoVisible}
                    accent={accent}
                    ink={ink}
                    muted={muted}
                    cream={cream}
                    family={family}
                    sectionLabel={sectionLabel}
                    ctaLabel={ctaLabel}
                    archiveLabel={archiveLabel}
                    archiveHref={archiveHref}
                    scrollerRef={scrollerRef}
                    slideRefs={slideRefs}
                />
            )}
        </div>
    )
}

function GridBackdrop({
    stageScale,
    opacity,
}: {
    stageScale: number
    opacity: number
}) {
    return (
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
                    opacity,
                    filter: "grayscale(1)",
                }}
            />
        </div>
    )
}

function DesktopBrowser({
    list,
    active,
    activeIndex,
    infoVisible,
    accent,
    ink,
    muted,
    cream,
    family,
    sectionLabel,
    ctaLabel,
    archiveLabel,
    archiveHref,
    scrollerRef,
    slideRefs,
}: {
    list: WorkProject[]
    active: WorkProject
    activeIndex: number
    infoVisible: boolean
    accent: string
    ink: string
    muted: string
    cream: string
    family: string
    sectionLabel: string
    ctaLabel: string
    archiveLabel: string
    archiveHref: string
    scrollerRef: RefObject<HTMLDivElement | null>
    slideRefs: MutableRefObject<(HTMLElement | null)[]>
}) {
    return (
        <div
            style={{
                position: "relative",
                zIndex: 2,
                display: "grid",
                gridTemplateColumns: "minmax(260px, 32%) minmax(0, 1fr)",
                width: "100%",
                height: "100%",
                boxSizing: "border-box",
                padding: "108px 4vw 48px",
                gap: "clamp(28px, 4vw, 56px)",
            }}
        >
            {/* Persistent info column */}
            <aside
                style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 0,
                    paddingTop: 8,
                    paddingBottom: 8,
                }}
            >
                <div
                    style={{
                        opacity: infoVisible ? 1 : 0,
                        transform: infoVisible
                            ? "translateY(0)"
                            : "translateY(10px)",
                        transition:
                            "opacity 0.28s ease, transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                >
                    <span
                        style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            background: accent,
                            color: "#fff",
                            fontFamily: family,
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            borderRadius: 6,
                            marginBottom: 22,
                        }}
                    >
                        {sectionLabel}
                    </span>

                    <h1
                        style={{
                            margin: "0 0 18px",
                            fontFamily: family,
                            fontSize: "clamp(28px, 3.4vw, 52px)",
                            fontWeight: 700,
                            letterSpacing: "-0.04em",
                            lineHeight: 0.98,
                            textTransform: "uppercase",
                            color: ink,
                        }}
                    >
                        {active.title}
                    </h1>

                    {(active.subtitle || active.year) && (
                        <p
                            style={{
                                margin: "0 0 28px",
                                fontFamily: family,
                                fontSize: 13,
                                fontWeight: 500,
                                letterSpacing: "0.04em",
                                textTransform: "uppercase",
                                color: muted,
                            }}
                        >
                            {[active.subtitle, active.year]
                                .filter(Boolean)
                                .join(" · ")}
                        </p>
                    )}
                </div>

                <div
                    style={{
                        opacity: infoVisible ? 1 : 0,
                        transform: infoVisible
                            ? "translateY(0)"
                            : "translateY(8px)",
                        transition:
                            "opacity 0.28s ease 0.04s, transform 0.28s cubic-bezier(0.16, 1, 0.3, 1) 0.04s",
                        display: "flex",
                        flexDirection: "column",
                        gap: 28,
                    }}
                >
                    {active.description ? (
                        <p
                            style={{
                                margin: 0,
                                maxWidth: 340,
                                fontFamily: family,
                                fontSize: 15,
                                fontWeight: 400,
                                lineHeight: 1.55,
                                color: ink,
                            }}
                        >
                            {active.description}
                        </p>
                    ) : null}

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 18,
                        }}
                    >
                        <a
                            href={active.href}
                            style={{
                                alignSelf: "flex-start",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "12px 22px",
                                background: accent,
                                color: "#fff",
                                textDecoration: "none",
                                fontFamily: family,
                                fontSize: 13,
                                fontWeight: 600,
                                letterSpacing: "-0.02em",
                                textTransform: "uppercase",
                                borderRadius: 999,
                                border: `1.5px solid ${accent}`,
                                boxShadow: "0 10px 28px rgba(44,107,224,0.28)",
                            }}
                        >
                            {ctaLabel}
                            <span aria-hidden style={{ fontSize: 14 }}>
                                →
                            </span>
                        </a>

                        <ProjectMeta
                            project={active}
                            family={family}
                            ink={ink}
                            muted={muted}
                            cream={cream}
                        />
                    </div>
                </div>

                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        right: -18,
                        top: "8%",
                        bottom: "8%",
                        width: 1,
                        background:
                            "repeating-linear-gradient(to bottom, rgba(17,17,17,0.18) 0 4px, transparent 4px 9px)",
                        pointerEvents: "none",
                    }}
                />
            </aside>

            {/* Scrollable visual column */}
            <div
                ref={scrollerRef}
                data-work-scroller="true"
                style={{
                    position: "relative",
                    minWidth: 0,
                    height: "100%",
                    overflowX: "hidden",
                    overflowY: "auto",
                    WebkitOverflowScrolling: "touch",
                    overscrollBehavior: "contain",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    scrollSnapType: "y mandatory",
                }}
            >
                {list.map((item, index) => (
                    <VisualSlide
                        key={item.slug}
                        item={item}
                        index={index}
                        active={index === activeIndex}
                        accent={accent}
                        cream={cream}
                        setRef={(el) => {
                            slideRefs.current[index] = el
                        }}
                    />
                ))}

                <footer
                    style={{
                        minHeight: "42vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "stretch",
                        padding: "24px 0 48px",
                        boxSizing: "border-box",
                        scrollSnapAlign: "start",
                    }}
                >
                    <a
                        href={archiveHref}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            minHeight: 88,
                            padding: "22px 28px",
                            background: ink,
                            color: cream,
                            textDecoration: "none",
                            fontFamily: family,
                            fontSize: 14,
                            fontWeight: 600,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            borderRadius: VISUAL_RADIUS,
                            boxSizing: "border-box",
                        }}
                    >
                        <span>[ {archiveLabel} ]</span>
                        <span aria-hidden style={{ fontSize: 18 }}>
                            ↗
                        </span>
                    </a>
                </footer>

                <div
                    aria-live="polite"
                    style={{
                        position: "sticky",
                        bottom: 16,
                        left: 0,
                        width: "fit-content",
                        marginTop: -40,
                        padding: "6px 12px",
                        background: "rgba(255,255,255,0.88)",
                        border: "1px solid rgba(17,17,17,0.12)",
                        borderRadius: 999,
                        fontFamily: family,
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: muted,
                        pointerEvents: "none",
                    }}
                >
                    {String(activeIndex + 1).padStart(2, "0")} /{" "}
                    {String(list.length).padStart(2, "0")}
                </div>
            </div>
        </div>
    )
}

function MobileSequence({
    list,
    accent,
    ink,
    muted,
    cream,
    family,
    sectionLabel,
    ctaLabel,
    archiveLabel,
    archiveHref,
    slideRefs,
    activeIndex,
}: {
    list: WorkProject[]
    accent: string
    ink: string
    muted: string
    cream: string
    family: string
    sectionLabel: string
    ctaLabel: string
    archiveLabel: string
    archiveHref: string
    slideRefs: MutableRefObject<(HTMLElement | null)[]>
    activeIndex: number
}) {
    return (
        <div
            style={{
                position: "relative",
                zIndex: 2,
                display: "flex",
                flexDirection: "column",
                gap: 56,
                padding: "100px 18px 80px",
                boxSizing: "border-box",
            }}
        >
            <header style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span
                    style={{
                        alignSelf: "flex-start",
                        padding: "6px 12px",
                        background: accent,
                        color: "#fff",
                        fontFamily: family,
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        borderRadius: 6,
                    }}
                >
                    {sectionLabel}
                </span>
            </header>

            {list.map((item, index) => (
                <article
                    key={item.slug}
                    ref={(el) => {
                        slideRefs.current[index] = el
                    }}
                    data-work-slide={index}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 18,
                        opacity: Math.abs(index - activeIndex) <= 1 ? 1 : 0.72,
                        transition: "opacity 0.35s ease",
                    }}
                >
                    <ProjectVisual
                        item={item}
                        accent={accent}
                        cream={cream}
                        tall
                    />
                    <h2
                        style={{
                            margin: 0,
                            fontFamily: family,
                            fontSize: 28,
                            fontWeight: 700,
                            letterSpacing: "-0.04em",
                            lineHeight: 1,
                            textTransform: "uppercase",
                            color: ink,
                        }}
                    >
                        {item.title}
                    </h2>
                    {(item.subtitle || item.year) && (
                        <p
                            style={{
                                margin: 0,
                                fontFamily: family,
                                fontSize: 12,
                                fontWeight: 500,
                                letterSpacing: "0.04em",
                                textTransform: "uppercase",
                                color: muted,
                            }}
                        >
                            {[item.subtitle, item.year].filter(Boolean).join(" · ")}
                        </p>
                    )}
                    {item.description ? (
                        <p
                            style={{
                                margin: 0,
                                fontFamily: family,
                                fontSize: 15,
                                lineHeight: 1.55,
                                color: ink,
                            }}
                        >
                            {item.description}
                        </p>
                    ) : null}
                    <a
                        href={item.href}
                        style={{
                            alignSelf: "flex-start",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "12px 20px",
                            background: accent,
                            color: "#fff",
                            textDecoration: "none",
                            fontFamily: family,
                            fontSize: 13,
                            fontWeight: 600,
                            letterSpacing: "-0.02em",
                            textTransform: "uppercase",
                            borderRadius: 999,
                        }}
                    >
                        {ctaLabel}
                        <span aria-hidden>→</span>
                    </a>
                </article>
            ))}

            <a
                href={archiveHref}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "20px 22px",
                    background: ink,
                    color: cream,
                    textDecoration: "none",
                    fontFamily: family,
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    borderRadius: 22,
                }}
            >
                <span>[ {archiveLabel} ]</span>
                <span aria-hidden>↗</span>
            </a>
        </div>
    )
}

function VisualSlide({
    item,
    index,
    active,
    accent,
    cream,
    setRef,
}: {
    item: WorkProject
    index: number
    active: boolean
    accent: string
    cream: string
    setRef: (el: HTMLElement | null) => void
}) {
    return (
        <section
            ref={setRef}
            data-work-slide={index}
            aria-label={item.title}
            style={{
                minHeight: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                boxSizing: "border-box",
                padding: "12px 0 28px",
                scrollSnapAlign: "center",
                scrollSnapStop: "always",
            }}
        >
            <div
                style={{
                    width: "100%",
                    height: "min(72vh, 640px)",
                    transform: active ? "scale(1)" : "scale(0.965)",
                    opacity: active ? 1 : 0.42,
                    transition:
                        "opacity 0.45s ease, transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)",
                    willChange: "opacity, transform",
                }}
            >
                <ProjectVisual item={item} accent={accent} cream={cream} fill />
            </div>
        </section>
    )
}

function ProjectVisual({
    item,
    accent,
    cream,
    fill,
    tall,
}: {
    item: WorkProject
    accent: string
    cream: string
    fill?: boolean
    tall?: boolean
}) {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        const v = videoRef.current
        if (!v) return
        const play = () => {
            v.play().catch(() => {})
        }
        play()
        v.addEventListener("loadeddata", play)
        return () => v.removeEventListener("loadeddata", play)
    }, [item.videoUrl])

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: fill ? "100%" : undefined,
                aspectRatio: fill ? undefined : tall ? "4 / 5" : "16 / 10",
                borderRadius: VISUAL_RADIUS,
                overflow: "hidden",
                background: `linear-gradient(145deg, ${cream} 0%, ${accent}22 55%, ${accent}44 100%)`,
                border: "2px solid rgba(255,255,255,0.85)",
                boxShadow:
                    "0 22px 50px rgba(17,17,17,0.12), 0 0 0 1px rgba(17,17,17,0.04)",
            }}
        >
            {item.videoUrl ? (
                <video
                    ref={videoRef}
                    src={item.videoUrl}
                    poster={item.coverUrl || undefined}
                    muted
                    playsInline
                    loop
                    autoPlay
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                    }}
                />
            ) : item.coverUrl ? (
                <img
                    src={item.coverUrl}
                    alt=""
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
                        display: "grid",
                        placeItems: "center",
                        padding: 24,
                        textAlign: "center",
                        color: "rgba(17,17,17,0.45)",
                        fontFamily: SANS,
                        fontSize: 14,
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                    }}
                >
                    {item.title}
                </div>
            )}
        </div>
    )
}

function ProjectMeta({
    project,
    family,
    ink,
    muted,
    cream,
}: {
    project: WorkProject
    family: string
    ink: string
    muted: string
    cream: string
}) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
            }}
        >
            <div
                style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    overflow: "hidden",
                    flex: "none",
                    background: cream,
                    border: "1px solid rgba(17,17,17,0.1)",
                }}
            >
                {project.coverUrl || project.videoUrl ? (
                    project.coverUrl ? (
                        <img
                            src={project.coverUrl}
                            alt=""
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width: "100%",
                                height: "100%",
                                background: project.accent || ACCENT,
                                opacity: 0.35,
                            }}
                        />
                    )
                ) : null}
            </div>
            <div style={{ minWidth: 0 }}>
                <div
                    style={{
                        fontFamily: family,
                        fontSize: 13,
                        fontWeight: 700,
                        color: ink,
                        letterSpacing: "-0.02em",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {project.title}
                </div>
                {project.year ? (
                    <div
                        style={{
                            fontFamily: family,
                            fontSize: 12,
                            color: muted,
                            marginTop: 2,
                        }}
                    >
                        {project.year}
                    </div>
                ) : null}
            </div>
        </div>
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
        } as Partial<CSSStyleDeclaration>)

        const text = document.createElement("span")
        text.textContent = label

        a.appendChild(arrow)
        a.appendChild(text)
        document.body.appendChild(a)

        return () => {
            window.removeEventListener("resize", applyChrome)
            a.remove()
        }
    }, [href, label, ariaLabel, accent])

    return null
}

const DEFAULT_ITEMS: WorkProject[] = [
    {
        title: "Fintech Onboarding",
        subtitle: "Product design",
        description:
            "A consumer fintech app was losing new users during a long, jargon-heavy sign-up. Reworked the first-run experience end to end.",
        slug: "fintech-onboarding",
        year: "2025",
        accent: ACCENT,
        videoUrl:
            "https://framerusercontent.com/assets/ORbhq8svUVYaQVK6qVkEsQVUyc.mp4",
    },
    {
        title: "Archive System",
        subtitle: "Brand & web",
        description:
            "A growing brand needed a clearer archive and web presence — structured, editorial, and easy to extend.",
        slug: "archive-system",
        year: "2024",
        accent: ACCENT,
        videoUrl:
            "https://framerusercontent.com/assets/BNCHHO0RxeNVJXt0bV6lIpxZeo.mp4",
    },
    {
        title: "Studio Site",
        subtitle: "Art direction",
        description:
            "Art direction and site structure for a studio that needed to feel warm and clear — not agency-slick.",
        slug: "studio-site",
        year: "2024",
        accent: ACCENT,
        videoUrl:
            "https://framerusercontent.com/assets/1l5FmP2EGRoLJ5xUbGoAAne5sg.mp4",
    },
    {
        title: "Editorial Deck",
        subtitle: "Campaign",
        description:
            "Campaign storytelling shaped into an editorial deck — tactile pacing, strong hierarchy, and room to breathe.",
        slug: "editorial-deck",
        year: "2023",
        accent: ACCENT,
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
    sectionLabel: {
        type: ControlType.String,
        title: "Section Label",
        defaultValue: "Selected work",
    },
    ctaLabel: {
        type: ControlType.String,
        title: "CTA Label",
        defaultValue: "View case study",
    },
    archiveLabel: {
        type: ControlType.String,
        title: "Archive Label",
        defaultValue: "View archive",
    },
    archiveLink: {
        type: ControlType.Link,
        title: "Archive Link",
        defaultValue: "/archive",
    },
    items: {
        type: ControlType.Array,
        title: "Projects",
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String, title: "Title" },
                subtitle: { type: ControlType.String, title: "Subtitle" },
                description: {
                    type: ControlType.String,
                    title: "Description",
                    displayTextArea: true,
                },
                slug: { type: ControlType.String, title: "Slug" },
                year: { type: ControlType.String, title: "Year" },
                accent: {
                    type: ControlType.Color,
                    title: "Accent",
                    defaultValue: ACCENT,
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
        defaultValue: ACCENT,
    },
    cream: {
        type: ControlType.Color,
        title: "Cream",
        defaultValue: CREAM,
    },
    ink: {
        type: ControlType.Color,
        title: "Ink",
        defaultValue: INK,
    },
    muted: {
        type: ControlType.Color,
        title: "Muted",
        defaultValue: MUTED,
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
    gridOpacity: {
        type: ControlType.Number,
        title: "Grid Opacity",
        defaultValue: 0.12,
        min: 0,
        max: 0.3,
        step: 0.01,
    },
})
