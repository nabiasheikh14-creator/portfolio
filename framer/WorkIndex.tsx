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
const CREAM = "#F3EFE6"
const INK = "#111111"
const MUTED = "#555555"
const PHONE_MQ = "(max-width: 809.98px)"
const VISUAL_RADIUS = 12
const ACCENT = "#2C6BE0"
const LAPTOP_ZOOM_KEY = "__nabiaLaptopZoom"
const LEFT_COL = "max(220px, 26vw)"
const GRID_BG =
    "https://framerusercontent.com/images/uTiMeYZo7Cgq17Mt2w60JYMnptc.png"
/** Whisper-soft desk grid — same art as home/archive, barely there. */
const GRID_OPACITY_DEFAULT = 0.028

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
            const fallback =
                DEFAULT_ITEMS.find((d) => d.slug === slug) ||
                DEFAULT_ITEMS[index % DEFAULT_ITEMS.length]
            const title = String(it?.title || fallback?.title || "Untitled")
            const description = String(
                it?.description || it?.overview || "",
            ).trim()
            const matchedDefault =
                DEFAULT_ITEMS.find(
                    (d) =>
                        d.slug === slug ||
                        d.title.toLowerCase() === title.toLowerCase(),
                ) || null
            return {
                title,
                subtitle: String(it?.subtitle || matchedDefault?.subtitle || ""),
                description: description || matchedDefault?.description || "",
                slug,
                year: String(it?.year || matchedDefault?.year || ""),
                accent: String(it?.accent || accent || ACCENT),
                coverUrl: it?.coverUrl
                    ? String(it.coverUrl)
                    : matchedDefault?.coverUrl || "",
                videoUrl: it?.videoUrl
                    ? String(it.videoUrl)
                    : matchedDefault?.videoUrl || fallback?.videoUrl || "",
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
 * Desktop: sticky left typography + right visual scroll on solid OUR offwhite
 * (#F3EFE6, same as home — no pure white stage).
 * Mobile: natural vertical project sequence on the same offwhite.
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
        accent = ACCENT,
        cream = CREAM,
        ink = INK,
        muted = MUTED,
        gridOpacity = GRID_OPACITY_DEFAULT,
        backLink = "/",
        projectBasePath = "/work",
    } = props
    const family = props.font?.fontFamily || SANS
    const isStatic = useIsStaticRenderer()
    const isPhone = useMediaQuery(PHONE_MQ)
    const backHref = resolveLink(backLink, "/")
    const basePath =
        resolveLink(projectBasePath, "/work").replace(/\/$/, "") || "/work"
    const gridAlpha = Math.max(0, Math.min(0.3, Number(gridOpacity) || 0))

    const list = useMemo(
        () => normalizeProjects(items, accent, basePath),
        [items, accent, basePath],
    )

    const [activeIndex, setActiveIndex] = useState(0)
    const [dims, setDims] = useState<number[]>(() =>
        list.map((_, i) => (i === 0 ? 0 : 1)),
    )
    const [reveal, setReveal] = useState<"idle" | "from" | "to">("idle")
    const scrollerRef = useRef<HTMLDivElement>(null)
    const slideRefs = useRef<(HTMLElement | null)[]>([])
    const activeRef = useRef(0)
    const dimsRef = useRef<number[]>(dims)

    useEffect(() => {
        const next = list.map((_, i) => (i === 0 ? 0 : 1))
        dimsRef.current = next
        setDims(next)
        activeRef.current = 0
        setActiveIndex(0)
    }, [list.length])

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

    // Desktop: lock the page; ONLY the right visual column scrolls (native overflow).
    // Mobile: natural document scroll.
    useEffect(() => {
        if (typeof document === "undefined" || isStatic) return
        document
            .querySelectorAll("[data-nabia-work-lock], [data-nabia-work-scroll]")
            .forEach((n) => n.remove())

        const html = document.documentElement
        const body = document.body
        const prev = {
            htmlOverflow: html.style.overflow,
            bodyOverflow: body.style.overflow,
            htmlHeight: html.style.height,
            bodyHeight: body.style.height,
        }

        const style = document.createElement("style")
        if (isPhone) {
            html.style.overflow = ""
            body.style.overflow = ""
            html.style.height = ""
            body.style.height = ""
            style.setAttribute("data-nabia-work-scroll", "true")
            style.textContent = `
              html, body {
                overflow-x: clip;
                overflow-y: auto !important;
                height: auto !important;
                max-height: none !important;
              }
              html, body, #nabia-work-index {
                background: #F3EFE6 !important;
                background-color: #F3EFE6 !important;
              }
              #nabia-work-index {
                height: auto !important;
                max-height: none !important;
                overflow: visible !important;
              }
              /* Hide Framer page-level grid duplicates — we paint our own soft grid */
              [data-framer-name="Grid"],
              [data-framer-name="grid"] {
                opacity: 0 !important;
                visibility: hidden !important;
              }
              @keyframes nabia-work-fade {
                from { opacity: 0; transform: translateY(6px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `
        } else {
            html.style.overflow = "hidden"
            body.style.overflow = "hidden"
            html.style.height = "100%"
            body.style.height = "100%"
            window.scrollTo(0, 0)
            style.setAttribute("data-nabia-work-lock", "true")
            style.textContent = `
              html, body {
                overflow: hidden !important;
                height: 100% !important;
                overscroll-behavior: none !important;
                background: #F3EFE6 !important;
                background-color: #F3EFE6 !important;
              }
              body > div, #main, [data-framer-root], [data-framer-page-container] {
                overflow: hidden !important;
                max-height: 100vh !important;
                height: 100% !important;
              }
              #nabia-work-index {
                position: fixed !important;
                inset: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                max-height: 100vh !important;
                overflow: hidden !important;
                background: #F3EFE6 !important;
                background-color: #F3EFE6 !important;
              }
              /* Left + right sit over cream + soft grid (no opaque cream wash) */
              [data-work-info-col] {
                background: transparent !important;
                background-color: transparent !important;
              }
              [data-nabia-cream-strip] {
                position: fixed !important;
                inset: 0 !important;
                width: 100vw !important;
                background: #F3EFE6 !important;
                z-index: 1 !important;
                pointer-events: none !important;
              }
              [data-work-scroller] {
                -webkit-overflow-scrolling: touch;
                overscroll-behavior-y: contain;
                scrollbar-width: none;
                background: transparent !important;
                background-color: transparent !important;
              }
              [data-work-scroller]::-webkit-scrollbar { width: 0; height: 0; display: none; }
              @keyframes nabia-work-fade {
                from { opacity: 0; transform: translateY(6px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `

            // Body-level cream strip so off-white always sits behind typography
            document.querySelectorAll("[data-nabia-cream-strip]").forEach((n) => n.remove())
            const strip = document.createElement("div")
            strip.setAttribute("data-nabia-cream-strip", "true")
            strip.setAttribute("aria-hidden", "true")
            document.body.appendChild(strip)
        }
        document.head.appendChild(style)

        return () => {
            style.remove()
            document.querySelectorAll("[data-nabia-cream-strip]").forEach((n) => n.remove())
            html.style.overflow = prev.htmlOverflow
            body.style.overflow = prev.bodyOverflow
            html.style.height = prev.htmlHeight
            body.style.height = prev.bodyHeight
        }
    }, [isStatic, isPhone])

    // Desktop wheel: never fight the right scroller's native momentum.
    // When the pointer is over the left panel / chrome, forward delta into the scroller.
    useEffect(() => {
        if (typeof window === "undefined" || isStatic || isPhone) return
        const onWheel = (e: WheelEvent) => {
            const el = scrollerRef.current
            if (!el) return
            const target = e.target as Node | null
            // Over the scroller → let the browser handle it (smooth / inertial)
            if (target && el.contains(target)) return
            // Elsewhere (left copy, back pill, empty chrome) → drive the scroller
            e.preventDefault()
            el.scrollTop += e.deltaY
        }
        window.addEventListener("wheel", onWheel, { passive: false })
        return () => window.removeEventListener("wheel", onWheel)
    }, [isStatic, isPhone])

    // Scroll-driven active project + continuous dim for white overlays
    useEffect(() => {
        if (typeof window === "undefined" || isStatic) return

        const pickActive = () => {
            const nodes = slideRefs.current.filter(Boolean) as HTMLElement[]
            if (!nodes.length) return

            const root = isPhone ? null : scrollerRef.current
            const viewTop = root ? root.getBoundingClientRect().top : 0
            const viewH = root ? root.clientHeight : window.innerHeight
            const center = viewTop + viewH * 0.42
            const nextDims = nodes.map(() => 1)
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
                const t = Math.min(
                    1,
                    Math.max(0, (dist - viewH * 0.08) / (viewH * 0.38)),
                )
                nextDims[i] = t
            })

            const prev = dimsRef.current
            let changed = prev.length !== nextDims.length
            if (!changed) {
                for (let i = 0; i < nextDims.length; i++) {
                    if (Math.abs((prev[i] || 0) - nextDims[i]) > 0.02) {
                        changed = true
                        break
                    }
                }
            }
            if (changed) {
                dimsRef.current = nextDims
                setDims(nextDims)
            }

            if (best !== activeRef.current) {
                activeRef.current = best
                setActiveIndex(best)
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

    const leftW = "max(220px, 26vw)"
    const shellStyle: CSSProperties = {
        ...framerStyle,
        position: isStatic || isPhone ? "relative" : "fixed",
        inset: isStatic || isPhone ? undefined : 0,
        width: isStatic || isPhone ? "100%" : "100vw",
        height: isStatic || isPhone ? undefined : "100vh",
        minHeight: isPhone || isStatic ? "100vh" : undefined,
        maxWidth: "100vw",
        maxHeight: isStatic || isPhone ? undefined : "100vh",
        minWidth: 0,
        zIndex: isStatic ? undefined : 2,
        // Solid OUR offwhite behind the whole Work stage (type + frames)
        background: CREAM,
        backgroundColor: CREAM,
        color: ink,
        fontFamily: family,
        boxSizing: "border-box",
        overflow: isPhone ? "visible" : "hidden",
        ...(reveal !== "idle"
            ? {
                  transform: `scale(${revealScale})`,
                  transformOrigin: "center center",
                  opacity: revealOpacity,
                  transition:
                      reveal === "from"
                          ? "none"
                          : "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease",
              }
            : {
                  transform: "none",
                  opacity: 1,
              }),
    }

    return (
        <div id="nabia-work-index" style={shellStyle}>
            <link
                href="https://fonts.googleapis.com/css2?family=Annie+Use+Your+Telescope&family=Inter:wght@400;500;600;700&display=swap"
                rel="stylesheet"
            />

            <SoftDeskGrid opacity={gridAlpha} />

            <DeskBack
                href={backHref}
                label="Back"
                ariaLabel="Back to home"
                accent={accent}
            />

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
                    slideRefs={slideRefs}
                    activeIndex={activeIndex}
                />
            ) : (
                <DesktopBrowser
                    list={list}
                    active={active}
                    activeIndex={activeIndex}
                    dims={dims}
                    accent={accent}
                    ink={ink}
                    muted={muted}
                    cream={cream}
                    family={family}
                    sectionLabel={sectionLabel}
                    ctaLabel={ctaLabel}
                    scrollerRef={scrollerRef}
                    slideRefs={slideRefs}
                />
            )}
        </div>
    )
}

/** Same desk grid art as home / archive — whisper opacity over OUR cream. */
function SoftDeskGrid({ opacity }: { opacity: number }) {
    if (opacity <= 0) return null
    return (
        <div
            aria-hidden
            data-nabia-work-grid="true"
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 1,
                pointerEvents: "none",
                backgroundImage: `url(${GRID_BG})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity,
                filter: "grayscale(1) brightness(1.05) contrast(0.92)",
            }}
        />
    )
}

function DesktopBrowser({
    list,
    active,
    activeIndex,
    dims,
    accent,
    ink,
    muted,
    cream,
    family,
    sectionLabel,
    ctaLabel,
    scrollerRef,
    slideRefs,
}: {
    list: WorkProject[]
    active: WorkProject
    activeIndex: number
    dims: number[]
    accent: string
    ink: string
    muted: string
    cream: string
    family: string
    sectionLabel: string
    ctaLabel: string
    scrollerRef: RefObject<HTMLDivElement | null>
    slideRefs: MutableRefObject<(HTMLElement | null)[]>
}) {
    return (
        <div
            style={{
                position: "relative",
                zIndex: 2,
                width: "100%",
                height: "100%",
                boxSizing: "border-box",
            }}
        >
            {/* Left typography — transparent so soft desk grid reads through */}
            <aside
                data-work-info-col="true"
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    zIndex: 3,
                    width: "max(220px, 26vw)",
                    display: "flex",
                    flexDirection: "column",
                    padding: "108px 2.5vw 48px 3.5vw",
                    boxSizing: "border-box",
                    overflow: "hidden",
                    backgroundColor: "transparent",
                    background: "transparent",
                    pointerEvents: "none",
                }}
            >
                <div
                    key={`top-${active.slug}`}
                    style={{
                        position: "relative",
                        zIndex: 1,
                        pointerEvents: "auto",
                        animation:
                            "nabia-work-fade 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
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
                            borderRadius: 4,
                            marginBottom: 20,
                        }}
                    >
                        {sectionLabel}
                    </span>

                    <h1
                        style={{
                            margin: "0 0 16px",
                            fontFamily: family,
                            fontSize: "clamp(26px, 3.2vw, 48px)",
                            fontWeight: 700,
                            letterSpacing: "-0.045em",
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
                                margin: 0,
                                fontFamily: family,
                                fontSize: 12,
                                fontWeight: 500,
                                letterSpacing: "0.05em",
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
                    key={`bot-${active.slug}`}
                    style={{
                        position: "relative",
                        zIndex: 1,
                        pointerEvents: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: 24,
                        marginTop: "auto",
                        paddingBottom: 28,
                        animation:
                            "nabia-work-fade 0.75s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both",
                    }}
                >
                    {active.description ? (
                        <p
                            style={{
                                margin: 0,
                                maxWidth: 320,
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
                        }}
                    >
                        {ctaLabel}
                        <span aria-hidden>→</span>
                    </a>
                </div>
            </aside>

            {/* Right visual scroller — native overflow over OUR offwhite stage */}
            <div
                ref={scrollerRef}
                data-work-scroller="true"
                style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: "max(220px, 26vw)",
                    zIndex: 2,
                    overflowX: "hidden",
                    overflowY: "auto",
                    WebkitOverflowScrolling: "touch",
                    overscrollBehavior: "contain",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    padding: "72px 16px 120px 16px",
                    boxSizing: "border-box",
                    background: "transparent",
                    backgroundColor: "transparent",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                }}
            >
                {list.map((item, index) => (
                    <VisualSlide
                        key={item.slug}
                        item={item}
                        index={index}
                        active={index === activeIndex}
                        dim={dims[index] ?? (index === activeIndex ? 0 : 1)}
                        accent={accent}
                        cream={cream}
                        setRef={(el) => {
                            slideRefs.current[index] = el
                        }}
                    />
                ))}
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
                        opacity: Math.abs(index - activeIndex) <= 1 ? 1 : 0.78,
                        transition: "opacity 0.4s ease",
                    }}
                >
                    <a
                        href={item.href}
                        style={{
                            display: "block",
                            textDecoration: "none",
                            color: "inherit",
                        }}
                    >
                        <ProjectVisual
                            item={item}
                            accent={accent}
                            cream={cream}
                            tall
                        />
                    </a>
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
        </div>
    )
}

function VisualSlide({
    item,
    index,
    dim,
    accent,
    cream,
    setRef,
}: {
    item: WorkProject
    index: number
    active?: boolean
    dim: number
    accent: string
    cream: string
    setRef: (el: HTMLElement | null) => void
}) {
    // Nevermind-style milky white veil on out-of-focus frames
    const overlay = Math.min(1, Math.max(0, dim)) * 0.55

    return (
        <section
            ref={setRef}
            data-work-slide={index}
            aria-label={item.title}
            style={{
                display: "block",
                boxSizing: "border-box",
            }}
        >
            <a
                href={item.href}
                aria-label={`View ${item.title}`}
                style={{
                    position: "relative",
                    display: "block",
                    width: "100%",
                    // Nevermind-like landscape ratio (was too tall before)
                    aspectRatio: "16 / 9",
                    textDecoration: "none",
                    color: "inherit",
                    cursor: "pointer",
                    borderRadius: VISUAL_RADIUS,
                    overflow: "hidden",
                }}
            >
                <ProjectVisual item={item} accent={accent} cream={cream} fill />
                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        inset: 0,
                        // Cream veil (not pure white) so dimmed frames stay on OUR offwhite
                        background: CREAM,
                        opacity: overlay,
                        pointerEvents: "none",
                        transition: "opacity 0.35s ease",
                        zIndex: 2,
                    }}
                />
            </a>
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
                // Neutral dark under video — no tinted accent fill flashing through
                background: "#1a1a1a",
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
                        pointerEvents: "none",
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
                        pointerEvents: "none",
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
                        color: "rgba(255,255,255,0.45)",
                        fontFamily: SANS,
                        fontSize: 14,
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        background: cream,
                    }}
                >
                    {item.title}
                </div>
            )}
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
        title: "Fintech App",
        subtitle: "Onboarding redesign",
        description:
            "A consumer fintech app was losing new users during a long, jargon-heavy sign-up. Reworked the first-run experience end to end.",
        slug: "fintech-app",
        year: "2025",
        accent: ACCENT,
        videoUrl:
            "https://framerusercontent.com/assets/ORbhq8svUVYaQVK6qVkEsQVUyc.mp4",
    },
    {
        title: "Health Platform",
        subtitle: "Design system",
        description:
            "A growing health platform had drifting UI across teams. Led the creation of a shared system.",
        slug: "health-platform",
        year: "2024",
        accent: ACCENT,
        videoUrl:
            "https://framerusercontent.com/assets/BNCHHO0RxeNVJXt0bV6lIpxZeo.mp4",
    },
    {
        title: "Chutney Studios",
        subtitle: "Brand + site",
        description:
            "Chutney Studios is my after-hours practice — brand and site built to feel warm and clear, not agency-slick.",
        slug: "chutney-studios",
        year: "2025",
        accent: ACCENT,
        videoUrl:
            "https://framerusercontent.com/assets/1l5FmP2EGRoLJ5xUbGoAAne5sg.mp4",
    },
    {
        title: "Travel App",
        subtitle: "0→1 product",
        description:
            "A 0→1 travel app that needed to feel effortless for people planning trips on the move.",
        slug: "travel-app",
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
        defaultValue: GRID_OPACITY_DEFAULT,
        min: 0,
        max: 0.3,
        step: 0.005,
    },
})
