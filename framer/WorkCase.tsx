import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type ReactNode,
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
const CREAM = "#F3EFE6"
const INK = "#111111"
const MUTED = "#555555"
const LABEL = "#888888"
const PHONE_MQ = "(max-width: 809.98px)"
const LEFT_COL = "max(240px, 28vw)"
const FRAME_RADIUS = 20

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

interface ProjectRecord {
    title: string
    subtitle: string
    role: string
    year: string
    timeline: string
    tools: string
    overview: string
    context: string
    problem: string
    goals: string
    constraints: string
    process: string
    decision1: string
    decision2: string
    decision3: string
    outcome: string
    reflection: string
    accent: string
    slug: string
    heroImage: string
    contextImage: string
    problemImage: string
    researchImage: string
    sketchImage: string
    wireframeImage: string
    flowImage: string
    processImage: string
    iterationImage: string
    finalImage1: string
    finalImage2: string
    finalImage3: string
    finalImage4: string
    outcomeImage: string
    prototypeVideo: string
}

interface WorkCaseProps {
    catalog: ProjectRecord[]
    gridOpacity: number
    cream: string
    ink: string
    muted: string
    accent: string
    font?: { fontFamily?: string }
    displayFont?: { fontFamily?: string }
    backLink: string
    projectBasePath: string
    footerSubline: string
    footerHomeLink: string
    footerDeskScale: number
    footerHeight: number
    footerHeadlineSize: number
    footerInstagramUrl: string
    footerLinkedinUrl: string
    footerEmail: string
    style?: CSSProperties
}

type CaseNavItem = { id: string; label: string }

function slugFromPath(): string {
    if (typeof window === "undefined") return ""
    const parts = window.location.pathname.replace(/\/$/, "").split("/").filter(Boolean)
    if (parts[0] === "work" && parts[1]) return parts[1]
    return ""
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

function hasText(v: unknown) {
    return Boolean(String(v || "").trim())
}

function hasMedia(v: unknown) {
    return Boolean(String(v || "").trim())
}

function buildNav(p: ProjectRecord): CaseNavItem[] {
    const items: CaseNavItem[] = []
    if (hasMedia(p.heroImage) || hasText(p.overview) || hasText(p.context)) {
        items.push({ id: "overview", label: "Overview" })
    }
    if (hasText(p.problem) || hasMedia(p.problemImage) || hasMedia(p.researchImage)) {
        items.push({ id: "challenge", label: "Challenge" })
    }
    if (
        hasText(p.goals) ||
        hasText(p.constraints) ||
        hasText(p.process) ||
        hasMedia(p.sketchImage) ||
        hasMedia(p.wireframeImage) ||
        hasMedia(p.flowImage) ||
        hasMedia(p.processImage) ||
        hasMedia(p.iterationImage)
    ) {
        items.push({ id: "approach", label: "Approach" })
    }
    if (hasText(p.decision1) || hasText(p.decision2) || hasText(p.decision3)) {
        items.push({ id: "decisions", label: "Decisions" })
    }
    if (
        hasMedia(p.finalImage1) ||
        hasMedia(p.finalImage2) ||
        hasMedia(p.finalImage3) ||
        hasMedia(p.finalImage4) ||
        hasMedia(p.prototypeVideo)
    ) {
        items.push({ id: "final", label: "Final" })
    }
    if (hasText(p.outcome) || hasMedia(p.outcomeImage)) {
        items.push({ id: "outcome", label: "Outcome" })
    }
    if (hasText(p.reflection)) {
        items.push({ id: "reflection", label: "Reflection" })
    }
    if (!items.length) items.push({ id: "overview", label: "Overview" })
    return items
}

/**
 * Work Case — Nevermind-style sticky left chrome + scrolling right narrative,
 * in Nabia Work-page language (solid OUR offwhite, no grid wash).
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 2400
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any
 */
export default function WorkCase(props: WorkCaseProps) {
    const {
        catalog = DEFAULT_CATALOG,
        cream = CREAM,
        ink = INK,
        muted = MUTED,
        accent = "#2C6BE0",
        backLink = "/work",
        projectBasePath = "/work",
        footerSubline = DEFAULT_FOOTER_SUBLINE,
        footerHomeLink = "/",
        footerDeskScale = 1,
        footerHeight = 280,
        footerHeadlineSize = 36,
        footerInstagramUrl = "https://instagram.com/",
        footerLinkedinUrl = "https://linkedin.com/",
        footerEmail = "hello@example.com",
    } = props
    const family = props.font?.fontFamily || SANS
    const displayFamily = props.displayFont?.fontFamily || DEFAULT_ANNIE
    const isStatic = useIsStaticRenderer()
    const isPhone = useMediaQuery(PHONE_MQ)
    const backHref = resolveLink(backLink, "/work")
    const basePath =
        resolveLink(projectBasePath, "/work").replace(/\/$/, "") || "/work"

    const list = Array.isArray(catalog) && catalog.length ? catalog : DEFAULT_CATALOG
    const [slug, setSlug] = useState(() =>
        isStatic ? String(list[0]?.slug || "") : slugFromPath(),
    )
    useEffect(() => {
        if (isStatic) return
        setSlug(slugFromPath())
    }, [isStatic])

    const project =
        list.find((p) => p.slug === slug) ||
        list.find((p) => p.slug && slug && p.slug.includes(slug)) ||
        list[0] ||
        DEFAULT_CATALOG[0]

    const nav = useMemo(() => buildNav(project), [project])
    const [activeSection, setActiveSection] = useState(nav[0]?.id || "overview")
    const scrollerRef = useRef<HTMLDivElement>(null)
    const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

    const related = list.filter((p) => p.slug && p.slug !== project.slug).slice(0, 3)

    // Desktop: lock page; only right column scrolls (same idea as WorkIndex)
    useEffect(() => {
        if (typeof document === "undefined" || isStatic) return
        document.querySelectorAll("[data-nabia-case-lock], [data-nabia-case-scroll]").forEach((n) => n.remove())
        const html = document.documentElement
        const body = document.body
        const prev = {
            htmlOverflow: html.style.overflow,
            bodyOverflow: body.style.overflow,
            htmlHeight: html.style.height,
            bodyHeight: body.style.height,
            htmlBg: html.style.background,
            bodyBg: body.style.background,
        }
        const style = document.createElement("style")
        if (isPhone) {
            html.style.overflow = ""
            body.style.overflow = ""
            html.style.height = ""
            body.style.height = ""
            html.style.background = CREAM
            body.style.background = CREAM
            style.setAttribute("data-nabia-case-scroll", "true")
            style.textContent = `
              html, body { background: #F3EFE6 !important; background-color: #F3EFE6 !important; }
              #nabia-work-case { height: auto !important; max-height: none !important; overflow: visible !important; }
            `
        } else {
            html.style.overflow = "hidden"
            body.style.overflow = "hidden"
            html.style.height = "100%"
            body.style.height = "100%"
            html.style.background = CREAM
            body.style.background = CREAM
            window.scrollTo(0, 0)
            style.setAttribute("data-nabia-case-lock", "true")
            style.textContent = `
              html, body {
                overflow: hidden !important;
                height: 100% !important;
                background: #F3EFE6 !important;
                background-color: #F3EFE6 !important;
                overscroll-behavior: none !important;
              }
              body > div, #main, [data-framer-root], [data-framer-page-container] {
                overflow: hidden !important;
                max-height: 100vh !important;
                height: 100% !important;
              }
              #nabia-work-case {
                position: fixed !important;
                inset: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                overflow: hidden !important;
                background: #F3EFE6 !important;
              }
              [data-case-scroller] {
                -webkit-overflow-scrolling: touch;
                overscroll-behavior-y: contain;
                scrollbar-width: none;
                background: #F3EFE6 !important;
              }
              [data-case-scroller]::-webkit-scrollbar { width: 0; height: 0; display: none; }
            `
        }
        document.head.appendChild(style)
        return () => {
            style.remove()
            html.style.overflow = prev.htmlOverflow
            body.style.overflow = prev.bodyOverflow
            html.style.height = prev.htmlHeight
            body.style.height = prev.bodyHeight
            html.style.background = prev.htmlBg
            body.style.background = prev.bodyBg
        }
    }, [isStatic, isPhone])

    // Active section from right scroller (desktop) or window (mobile)
    useEffect(() => {
        if (typeof window === "undefined" || isStatic) return
        const ids = nav.map((n) => n.id)
        const pick = () => {
            const root = isPhone ? null : scrollerRef.current
            const viewTop = root ? root.getBoundingClientRect().top : 0
            const viewH = root ? root.clientHeight : window.innerHeight
            const marker = viewTop + viewH * 0.28
            let best = ids[0]
            let bestDist = Infinity
            ids.forEach((id) => {
                const el = sectionRefs.current[id]
                if (!el) return
                const top = el.getBoundingClientRect().top
                const dist = Math.abs(top - marker)
                if (top - marker <= 40 && dist < bestDist) {
                    bestDist = dist
                    best = id
                }
            })
            setActiveSection((prev) => (prev === best ? prev : best))
        }
        pick()
        const root = isPhone ? window : scrollerRef.current
        root?.addEventListener("scroll", pick, { passive: true } as AddEventListenerOptions)
        window.addEventListener("resize", pick)
        return () => {
            if (root && root !== window) root.removeEventListener("scroll", pick as EventListener)
            else window.removeEventListener("scroll", pick)
            window.removeEventListener("resize", pick)
        }
    }, [isStatic, isPhone, nav, project.slug])

    // Forward wheel from left panel into right scroller
    useEffect(() => {
        if (typeof window === "undefined" || isStatic || isPhone) return
        const onWheel = (e: WheelEvent) => {
            const el = scrollerRef.current
            if (!el) return
            const target = e.target as Node | null
            if (target && el.contains(target)) return
            e.preventDefault()
            el.scrollTop += e.deltaY
        }
        window.addEventListener("wheel", onWheel, { passive: false })
        return () => window.removeEventListener("wheel", onWheel)
    }, [isStatic, isPhone])

    const scrollToSection = (id: string) => {
        const el = sectionRefs.current[id]
        if (!el) return
        if (isPhone) {
            el.scrollIntoView({ behavior: "smooth", block: "start" })
        } else {
            const root = scrollerRef.current
            if (!root) return
            const top =
                el.getBoundingClientRect().top -
                root.getBoundingClientRect().top +
                root.scrollTop -
                24
            root.scrollTo({ top, behavior: "smooth" })
        }
        setActiveSection(id)
    }

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
                <div style={{ fontSize: 22, fontWeight: 600 }}>{project.title}</div>
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
        background: CREAM,
        backgroundColor: CREAM,
        color: ink,
        fontFamily: family,
        boxSizing: "border-box",
        overflow: isPhone ? "visible" : "hidden",
    }

    const setSectionRef = (id: string) => (el: HTMLElement | null) => {
        sectionRefs.current[id] = el
    }

    return (
        <div id="nabia-work-case" style={shellStyle}>
            <link
                href="https://fonts.googleapis.com/css2?family=Annie+Use+Your+Telescope&family=Inter:wght@400;500;600;700&display=swap"
                rel="stylesheet"
            />

            <DeskBack
                href={backHref}
                label="Back"
                ariaLabel="Back to work"
                accent={accent}
            />

            {isPhone ? (
                <MobileCase
                    project={project}
                    nav={nav}
                    activeSection={activeSection}
                    onNavigate={scrollToSection}
                    setSectionRef={setSectionRef}
                    related={related}
                    basePath={basePath}
                    accent={accent}
                    ink={ink}
                    muted={muted}
                    cream={cream}
                    family={family}
                    displayFamily={displayFamily}
                    footer={{
                        subline: footerSubline,
                        homeHref: footerHomeLink,
                        deskScale: footerDeskScale,
                        railHeight: footerHeight,
                        headlineSize: footerHeadlineSize,
                        instagramUrl: footerInstagramUrl,
                        linkedinUrl: footerLinkedinUrl,
                        email: footerEmail,
                    }}
                />
            ) : (
                <DesktopCase
                    project={project}
                    nav={nav}
                    activeSection={activeSection}
                    onNavigate={scrollToSection}
                    scrollerRef={scrollerRef}
                    setSectionRef={setSectionRef}
                    related={related}
                    basePath={basePath}
                    accent={accent}
                    ink={ink}
                    muted={muted}
                    cream={cream}
                    family={family}
                    displayFamily={displayFamily}
                    footer={{
                        subline: footerSubline,
                        homeHref: footerHomeLink,
                        deskScale: footerDeskScale,
                        railHeight: footerHeight,
                        headlineSize: footerHeadlineSize,
                        instagramUrl: footerInstagramUrl,
                        linkedinUrl: footerLinkedinUrl,
                        email: footerEmail,
                    }}
                />
            )}
        </div>
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

function DesktopCase({
    project,
    nav,
    activeSection,
    onNavigate,
    scrollerRef,
    setSectionRef,
    related,
    basePath,
    accent,
    ink,
    muted,
    cream,
    family,
    displayFamily,
    footer,
}: {
    project: ProjectRecord
    nav: CaseNavItem[]
    activeSection: string
    onNavigate: (id: string) => void
    scrollerRef: RefObject<HTMLDivElement | null>
    setSectionRef: (id: string) => (el: HTMLElement | null) => void
    related: ProjectRecord[]
    basePath: string
    accent: string
    ink: string
    muted: string
    cream: string
    family: string
    displayFamily: string
    footer: FooterBits
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
            <aside
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    zIndex: 3,
                    width: LEFT_COL,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "108px 2.2vw 40px 3.2vw",
                    boxSizing: "border-box",
                    overflow: "hidden",
                    background: CREAM,
                    backgroundColor: CREAM,
                    pointerEvents: "none",
                }}
            >
                <div style={{ position: "relative", zIndex: 1, pointerEvents: "auto" }}>
                    <h1
                        style={{
                            margin: "0 0 16px",
                            fontFamily: family,
                            fontSize: "clamp(28px, 3.2vw, 48px)",
                            fontWeight: 700,
                            letterSpacing: "-0.045em",
                            lineHeight: 0.96,
                            textTransform: "uppercase",
                            color: ink,
                        }}
                    >
                        {project.title}
                    </h1>
                    {project.overview ? (
                        <p
                            style={{
                                margin: "0 0 22px",
                                fontFamily: family,
                                fontSize: 15,
                                lineHeight: 1.55,
                                color: ink,
                                maxWidth: 340,
                            }}
                        >
                            {project.overview}
                        </p>
                    ) : null}
                    <MetaChips project={project} family={family} muted={muted} ink={ink} />
                </div>

                <nav
                    aria-label="Case sections"
                    style={{
                        position: "relative",
                        zIndex: 1,
                        pointerEvents: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        paddingTop: 24,
                    }}
                >
                    {nav.map((item) => {
                        const active = item.id === activeSection
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => onNavigate(item.id)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    background: "transparent",
                                    border: "none",
                                    padding: 0,
                                    cursor: "pointer",
                                    fontFamily: family,
                                    fontSize: 13,
                                    fontWeight: active ? 700 : 500,
                                    letterSpacing: "-0.01em",
                                    color: active ? ink : muted,
                                    textAlign: "left",
                                }}
                            >
                                <span
                                    aria-hidden
                                    style={{
                                        width: 7,
                                        height: 7,
                                        background: active ? ink : "transparent",
                                        border: active ? "none" : `1px solid ${LABEL}`,
                                        flex: "none",
                                    }}
                                />
                                {item.label}
                            </button>
                        )
                    })}
                </nav>
            </aside>

            <div
                ref={scrollerRef}
                data-case-scroller="true"
                style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: LEFT_COL,
                    zIndex: 2,
                    overflowX: "hidden",
                    overflowY: "auto",
                    WebkitOverflowScrolling: "touch",
                    overscrollBehavior: "contain",
                    scrollbarWidth: "none",
                    padding: "72px 18px 64px 12px",
                    boxSizing: "border-box",
                    background: CREAM,
                    backgroundColor: CREAM,
                    display: "flex",
                    flexDirection: "column",
                    gap: 64,
                }}
            >
                <CaseNarrative
                    project={project}
                    setSectionRef={setSectionRef}
                    related={related}
                    basePath={basePath}
                    accent={accent}
                    ink={ink}
                    muted={muted}
                    cream={cream}
                    family={family}
                    displayFamily={displayFamily}
                />
                <DeskWorkFooter
                    accent={accent}
                    cream={cream}
                    ink={ink}
                    muted={muted}
                    subline={footer.subline}
                    homeHref={footer.homeHref}
                    deskScale={footer.deskScale}
                    railHeight={footer.railHeight}
                    headlineSize={footer.headlineSize}
                    instagramUrl={footer.instagramUrl}
                    linkedinUrl={footer.linkedinUrl}
                    email={footer.email}
                    font={{ fontFamily: family }}
                    contained
                />
            </div>
        </div>
    )
}

function MobileCase({
    project,
    nav,
    activeSection,
    onNavigate,
    setSectionRef,
    related,
    basePath,
    accent,
    ink,
    muted,
    cream,
    family,
    displayFamily,
    footer,
}: {
    project: ProjectRecord
    nav: CaseNavItem[]
    activeSection: string
    onNavigate: (id: string) => void
    setSectionRef: (id: string) => (el: HTMLElement | null) => void
    related: ProjectRecord[]
    basePath: string
    accent: string
    ink: string
    muted: string
    cream: string
    family: string
    displayFamily: string
    footer: FooterBits
}) {
    return (
        <div
            style={{
                position: "relative",
                zIndex: 2,
                padding: "100px 18px 48px",
                boxSizing: "border-box",
                background: CREAM,
            }}
        >
            <h1
                style={{
                    margin: "0 0 14px",
                    fontFamily: family,
                    fontSize: 34,
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                    lineHeight: 0.98,
                    textTransform: "uppercase",
                    color: ink,
                }}
            >
                {project.title}
            </h1>
            {project.overview ? (
                <p
                    style={{
                        margin: "0 0 20px",
                        fontFamily: family,
                        fontSize: 15,
                        lineHeight: 1.55,
                        color: ink,
                    }}
                >
                    {project.overview}
                </p>
            ) : null}
            <MetaChips project={project} family={family} muted={muted} ink={ink} />

            <nav
                aria-label="Case sections"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    margin: "28px 0 40px",
                }}
            >
                {nav.map((item) => {
                    const active = item.id === activeSection
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onNavigate(item.id)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                background: "transparent",
                                border: "none",
                                padding: 0,
                                cursor: "pointer",
                                fontFamily: family,
                                fontSize: 14,
                                fontWeight: active ? 700 : 500,
                                letterSpacing: "-0.01em",
                                color: active ? ink : muted,
                                textAlign: "left",
                            }}
                        >
                            <span
                                aria-hidden
                                style={{
                                    width: 7,
                                    height: 7,
                                    background: active ? ink : "transparent",
                                    border: active ? "none" : `1px solid ${LABEL}`,
                                    flex: "none",
                                }}
                            />
                            {item.label}
                        </button>
                    )
                })}
            </nav>

            <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
                <CaseNarrative
                    project={project}
                    setSectionRef={setSectionRef}
                    related={related}
                    basePath={basePath}
                    accent={accent}
                    ink={ink}
                    muted={muted}
                    cream={cream}
                    family={family}
                    displayFamily={displayFamily}
                />
            </div>

            <DeskWorkFooter
                accent={accent}
                cream={cream}
                ink={ink}
                muted={muted}
                subline={footer.subline}
                homeHref={footer.homeHref}
                deskScale={footer.deskScale}
                railHeight={footer.railHeight}
                headlineSize={footer.headlineSize}
                instagramUrl={footer.instagramUrl}
                linkedinUrl={footer.linkedinUrl}
                email={footer.email}
                font={{ fontFamily: family }}
                contained
            />
        </div>
    )
}

type FooterBits = {
    subline: string
    homeHref: string
    deskScale: number
    railHeight: number
    headlineSize: number
    instagramUrl: string
    linkedinUrl: string
    email: string
}

function MetaChips({
    project,
    family,
    muted,
    ink,
}: {
    project: ProjectRecord
    family: string
    muted: string
    ink: string
}) {
    // Nevermind-style left meta: Date + Duration first, then role.
    const bits = [
        project.year && { k: "Date", v: project.year },
        project.timeline && { k: "Duration", v: project.timeline },
        project.role && { k: "Role", v: project.role },
    ].filter(Boolean) as { k: string; v: string }[]
    if (!bits.length) return null
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {bits.map((b) => (
                <div key={b.k}>
                    <div
                        style={{
                            fontFamily: family,
                            fontSize: 10,
                            fontWeight: 600,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: LABEL,
                            marginBottom: 3,
                        }}
                    >
                        {b.k}
                    </div>
                    <div
                        style={{
                            fontFamily: family,
                            fontSize: 13,
                            lineHeight: 1.4,
                            color: ink,
                        }}
                    >
                        {b.v}
                    </div>
                </div>
            ))}
        </div>
    )
}

function CaseNarrative({
    project,
    setSectionRef,
    related,
    basePath,
    accent,
    ink,
    muted,
    cream,
    family,
    displayFamily,
}: {
    project: ProjectRecord
    setSectionRef: (id: string) => (el: HTMLElement | null) => void
    related: ProjectRecord[]
    basePath: string
    accent: string
    ink: string
    muted: string
    cream: string
    family: string
    displayFamily: string
}) {
    const p = project
    return (
        <>
            <section ref={setSectionRef("overview")} id="overview" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                {hasMedia(p.heroImage) ? (
                    <MediaFrame src={p.heroImage} accent={p.accent || accent} label="Hero" tall />
                ) : (
                    <MediaFrame src="" accent={p.accent || accent} label="Hero / key screen" tall />
                )}
                {(hasText(p.context) || hasText(p.overview)) && (
                    <StoryBlock
                        kicker="Overview"
                        title={null}
                        body={p.context || p.overview}
                        family={family}
                        ink={ink}
                        muted={muted}
                        large
                    />
                )}
                {hasMedia(p.contextImage) && (
                    <MediaFrame src={p.contextImage} accent={p.accent || accent} label="Context" />
                )}
            </section>

            {(hasText(p.problem) || hasMedia(p.problemImage) || hasMedia(p.researchImage)) && (
                <section ref={setSectionRef("challenge")} id="challenge" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                    <StoryBlock
                        kicker="Challenge"
                        title="The challenge"
                        body={p.problem}
                        family={family}
                        ink={ink}
                        muted={muted}
                        large
                    />
                    <MediaRow>
                        {hasMedia(p.problemImage) && (
                            <MediaFrame src={p.problemImage} accent={p.accent || accent} label="Problem" />
                        )}
                        {hasMedia(p.researchImage) && (
                            <MediaFrame src={p.researchImage} accent={p.accent || accent} label="Research" />
                        )}
                    </MediaRow>
                </section>
            )}

            {(hasText(p.goals) ||
                hasText(p.constraints) ||
                hasText(p.process) ||
                hasMedia(p.sketchImage) ||
                hasMedia(p.wireframeImage) ||
                hasMedia(p.flowImage) ||
                hasMedia(p.processImage) ||
                hasMedia(p.iterationImage)) && (
                <section ref={setSectionRef("approach")} id="approach" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                    <StoryBlock
                        kicker="Approach"
                        title="How we got there"
                        body={p.process}
                        family={family}
                        ink={ink}
                        muted={muted}
                    />
                    {(hasText(p.goals) || hasText(p.constraints)) && (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                gap: 14,
                            }}
                        >
                            {hasText(p.goals) && (
                                <TextCard title="Goals" body={p.goals} accent={accent} ink={ink} muted={muted} family={family} />
                            )}
                            {hasText(p.constraints) && (
                                <TextCard title="Constraints" body={p.constraints} accent={accent} ink={ink} muted={muted} family={family} />
                            )}
                        </div>
                    )}
                    <MediaRow>
                        {hasMedia(p.sketchImage) && (
                            <MediaFrame src={p.sketchImage} accent={p.accent || accent} label="Sketches" />
                        )}
                        {hasMedia(p.wireframeImage) && (
                            <MediaFrame src={p.wireframeImage} accent={p.accent || accent} label="Wireframes" />
                        )}
                        {hasMedia(p.flowImage) && (
                            <MediaFrame src={p.flowImage} accent={p.accent || accent} label="Flow" />
                        )}
                    </MediaRow>
                    <MediaRow>
                        {hasMedia(p.processImage) && (
                            <MediaFrame src={p.processImage} accent={p.accent || accent} label="Process" />
                        )}
                        {hasMedia(p.iterationImage) && (
                            <MediaFrame src={p.iterationImage} accent={p.accent || accent} label="Iteration" />
                        )}
                    </MediaRow>
                </section>
            )}

            {(hasText(p.decision1) || hasText(p.decision2) || hasText(p.decision3)) && (
                <section ref={setSectionRef("decisions")} id="decisions" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <StoryBlock
                        kicker="Decisions"
                        title="Key decisions"
                        body=""
                        family={family}
                        ink={ink}
                        muted={muted}
                    />
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: 14,
                        }}
                    >
                        {hasText(p.decision1) && (
                            <TextCard title="01" body={p.decision1} accent={accent} ink={ink} muted={muted} family={family} />
                        )}
                        {hasText(p.decision2) && (
                            <TextCard title="02" body={p.decision2} accent={accent} ink={ink} muted={muted} family={family} />
                        )}
                        {hasText(p.decision3) && (
                            <TextCard title="03" body={p.decision3} accent={accent} ink={ink} muted={muted} family={family} />
                        )}
                    </div>
                </section>
            )}

            {(hasMedia(p.finalImage1) ||
                hasMedia(p.finalImage2) ||
                hasMedia(p.finalImage3) ||
                hasMedia(p.finalImage4) ||
                hasMedia(p.prototypeVideo)) && (
                <section ref={setSectionRef("final")} id="final" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <StoryBlock
                        kicker="Final"
                        title="Final design"
                        body=""
                        family={family}
                        ink={ink}
                        muted={muted}
                    />
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                            gap: 14,
                        }}
                    >
                        {hasMedia(p.finalImage1) && (
                            <MediaFrame src={p.finalImage1} accent={p.accent || accent} label="Final 01" />
                        )}
                        {hasMedia(p.finalImage2) && (
                            <MediaFrame src={p.finalImage2} accent={p.accent || accent} label="Final 02" />
                        )}
                        {hasMedia(p.finalImage3) && (
                            <MediaFrame src={p.finalImage3} accent={p.accent || accent} label="Final 03" />
                        )}
                        {hasMedia(p.finalImage4) && (
                            <MediaFrame src={p.finalImage4} accent={p.accent || accent} label="Final 04" />
                        )}
                    </div>
                    {hasMedia(p.prototypeVideo) && (
                        <VideoFrame src={p.prototypeVideo} accent={p.accent || accent} label="Prototype" />
                    )}
                </section>
            )}

            {(hasText(p.outcome) || hasMedia(p.outcomeImage)) && (
                <section ref={setSectionRef("outcome")} id="outcome" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <StoryBlock
                        kicker="Outcome"
                        title="What changed"
                        body={p.outcome}
                        family={family}
                        ink={ink}
                        muted={muted}
                        large
                    />
                    {hasMedia(p.outcomeImage) && (
                        <MediaFrame src={p.outcomeImage} accent={p.accent || accent} label="Outcome" />
                    )}
                </section>
            )}

            {hasText(p.reflection) && (
                <section ref={setSectionRef("reflection")} id="reflection">
                    <StoryBlock
                        kicker="Reflection"
                        title="What I'd do next"
                        body={p.reflection}
                        family={family}
                        ink={ink}
                        muted={muted}
                    />
                </section>
            )}

            {related.length > 0 && (
                <section style={{ display: "flex", flexDirection: "column", gap: 18, paddingTop: 12 }}>
                    <p
                        style={{
                            margin: 0,
                            fontFamily: family,
                            fontSize: 12,
                            fontWeight: 600,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            color: LABEL,
                        }}
                    >
                        More work
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {related.map((r) => (
                            <a
                                key={r.slug}
                                href={`${basePath}/${r.slug}`}
                                style={{
                                    display: "flex",
                                    alignItems: "baseline",
                                    justifyContent: "space-between",
                                    gap: 16,
                                    padding: "14px 0",
                                    textDecoration: "none",
                                    color: ink,
                                    borderBottom: "1px solid rgba(17,17,17,0.12)",
                                }}
                            >
                                <span
                                    style={{
                                        fontFamily: family,
                                        fontSize: 20,
                                        fontWeight: 700,
                                        letterSpacing: "-0.03em",
                                        textTransform: "uppercase",
                                        lineHeight: 1.1,
                                    }}
                                >
                                    {r.title}
                                </span>
                                <span
                                    style={{
                                        fontFamily: family,
                                        fontSize: 12,
                                        fontWeight: 500,
                                        letterSpacing: "0.04em",
                                        textTransform: "uppercase",
                                        color: muted,
                                        flex: "none",
                                    }}
                                >
                                    {r.year || "View"} →
                                </span>
                            </a>
                        ))}
                    </div>
                </section>
            )}
        </>
    )
}

function StoryBlock({
    kicker,
    title,
    body,
    family,
    ink,
    muted,
    large,
}: {
    kicker: string
    title: string | null
    body: string
    family: string
    ink: string
    muted: string
    large?: boolean
}) {
    // Nevermind-style: small section label, then a dominant narrative block.
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: large ? 18 : 12 }}>
            <div
                style={{
                    fontFamily: family,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: LABEL,
                }}
            >
                {kicker}
            </div>
            {title ? (
                <h2
                    style={{
                        margin: 0,
                        fontFamily: family,
                        fontSize: large ? "clamp(24px, 2.6vw, 36px)" : 22,
                        fontWeight: 700,
                        letterSpacing: "-0.03em",
                        lineHeight: 1.15,
                        color: ink,
                        maxWidth: 720,
                    }}
                >
                    {title}
                </h2>
            ) : null}
            {hasText(body) ? (
                <p
                    style={{
                        margin: 0,
                        fontFamily: family,
                        fontSize: large ? "clamp(18px, 1.7vw, 26px)" : 15,
                        fontWeight: large ? 600 : 400,
                        letterSpacing: large ? "-0.02em" : "0",
                        lineHeight: large ? 1.35 : 1.55,
                        color: large ? ink : muted,
                        maxWidth: large ? 760 : 640,
                        whiteSpace: "pre-wrap",
                    }}
                >
                    {body}
                </p>
            ) : null}
        </div>
    )
}

function TextCard({
    title,
    body,
    accent,
    ink,
    muted,
    family,
}: {
    title: string
    body: string
    accent: string
    ink: string
    muted: string
    family: string
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
                style={{
                    fontFamily: family,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: accent || ink,
                }}
            >
                {title}
            </div>
            <p
                style={{
                    margin: 0,
                    fontFamily: family,
                    fontSize: 15,
                    lineHeight: 1.5,
                    color: muted,
                    whiteSpace: "pre-wrap",
                }}
            >
                {body}
            </p>
        </div>
    )
}

function MediaRow({ children }: { children: ReactNode }) {
    const kids = Array.isArray(children) ? children.filter(Boolean) : [children]
    if (!kids.length) return null
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: kids.length > 1 ? "repeat(auto-fit, minmax(240px, 1fr))" : "1fr",
                gap: 14,
            }}
        >
            {children}
        </div>
    )
}

function MediaFrame({
    src,
    accent,
    label,
    tall,
}: {
    src: string
    accent: string
    label?: string
    tall?: boolean
}) {
    const url = String(src || "").trim()
    return (
        <figure style={{ margin: 0 }}>
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: tall ? "16 / 10" : "16 / 9",
                    borderRadius: FRAME_RADIUS,
                    overflow: "hidden",
                    background: url
                        ? `#111 url(${url}) center/cover no-repeat`
                        : `linear-gradient(160deg, ${accent} 0%, #1a1a1a 125%)`,
                    boxSizing: "border-box",
                }}
            >
                {!url && (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            display: "grid",
                            placeItems: "center",
                            color: "rgba(255,255,255,0.55)",
                            fontFamily: SANS,
                            fontSize: 13,
                            fontWeight: 600,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                            padding: 24,
                            textAlign: "center",
                        }}
                    >
                        Drop {label || "imagery"} here
                    </div>
                )}
            </div>
        </figure>
    )
}

function VideoFrame({
    src,
    accent,
    label,
}: {
    src: string
    accent: string
    label?: string
}) {
    const url = String(src || "").trim()
    if (!url) return null
    return (
        <figure style={{ margin: 0 }}>
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16 / 9",
                    borderRadius: FRAME_RADIUS,
                    overflow: "hidden",
                    background: "#111",
                }}
            >
                <video
                    src={url}
                    muted
                    playsInline
                    loop
                    autoPlay
                    controls
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                    }}
                />
            </div>
        </figure>
    )
}


const STAGE_W = 1440
const STAGE_H = 900
const IMG = "https://framerusercontent.com/images/"
const FOOTER_ANNIE = DEFAULT_ANNIE


const DEFAULT_FOOTER_SUBLINE = "let's go back to the workspace"

/**
 * Interactive zones on the footer desk crop — same stage coords as DeskWorkspace.
 * Popup items deep-link home with ?open= so the desk opens that popup.
 */
const FOOTER_HOTSPOTS: {
    key: string
    box: [number, number, number, number]
    label: string
    href: string
}[] = [
    {
        key: "laptop",
        box: [555, 430, 370, 330],
        label: "Work",
        href: "/work",
    },
    {
        key: "journal",
        box: [241, 717, 167, 126],
        label: "Get to know me",
        href: "/?open=about",
    },
    {
        key: "sticky",
        box: [834, 368, 86, 142],
        label: "Tech stack",
        href: "/?open=techstack",
    },
    {
        key: "notes",
        box: [1056, 691, 113, 88],
        label: "Substack",
        href: "/?open=substack",
    },
    {
        key: "phone",
        box: [963, 717, 100, 98],
        label: "Socials",
        href: "/?open=socials",
    },
    {
        key: "chutney",
        box: [542, 493, 84, 75],
        label: "Chutney Studios",
        href: "/?open=chutney",
    },
    {
        key: "briefcase-calendar",
        box: [355, 435, 170, 170],
        label: "Schedule",
        href: "/?open=schedule",
    },
].sort((a, b) => b.box[2] * b.box[3] - a.box[2] * a.box[3])

/** Extra layers that should jiggle with a hotspot (matches DeskWorkspace). */
const FOOTER_JIGGLE: Record<string, string[]> = {
    laptop: ["laptop", "work-laptop"],
    "briefcase-calendar": ["briefcase-calendar"],
    sticky: ["sticky"],
    journal: ["journal"],
    notes: ["notes"],
    phone: ["phone"],
    chutney: ["chutney"],
}

const FOOTER_JIGGLE_CSS = `
@keyframes nabia-footer-jiggle {
  0%, 100% { transform: rotate(0deg) scale(1); }
  20% { transform: rotate(-3deg) scale(1.03); }
  40% { transform: rotate(3deg) scale(1.03); }
  60% { transform: rotate(-2deg) scale(1.03); }
  80% { transform: rotate(1deg) scale(1.03); }
}
.nabia-footer-jiggle {
  animation: nabia-footer-jiggle 0.55s ease-in-out infinite;
}
`

function footerOriginFor(key: string): string {
    const h = FOOTER_HOTSPOTS.find((x) => x.key === key)
    if (!h) return "center center"
    const [x, y, w, ht] = h.box
    return `${((x + w / 2) / STAGE_W) * 100}% ${((y + ht / 2) / STAGE_H) * 100}%`
}

function FooterDeskHotspots({
    onHover,
}: {
    onHover: (key: string | null) => void
}) {
    return (
        <>
            {FOOTER_HOTSPOTS.map((h) => {
                const [x, y, w, hgt] = h.box
                return (
                    <a
                        key={h.key}
                        href={h.href}
                        aria-label={h.label}
                        title={h.label}
                        style={{
                            position: "absolute",
                            left: x,
                            top: y,
                            width: w,
                            height: hgt,
                            zIndex: 2,
                            display: "block",
                            cursor: "pointer",
                            background: "transparent",
                            outline: "none",
                            textDecoration: "none",
                        }}
                        onMouseEnter={() => onHover(h.key)}
                        onMouseLeave={() => onHover(null)}
                        onFocus={() => onHover(h.key)}
                        onBlur={() => onHover(null)}
                    />
                )
            })}
        </>
    )
}

/**
 * Exact homepage desk layer PNGs — same hashes / full-stage placement as DeskWorkspace.
 */
const HOME_FOOTER_LAYERS: { key: string; hash: string }[] = [
    { key: "desk", hash: "apgMzPB0YpfnsVlEtmJK4vj6V7w" },
    { key: "briefcase-calendar", hash: "NDoJcAe2hm9jNoRn1l3KPiH88kM" },
    { key: "chutney", hash: "AwkrKCuhUkRurlYPAzFRI4yw" },
    { key: "sooraj", hash: "O3MmyItiSJFvHk9GjYSG9NdqSc" },
    { key: "laptop", hash: "ffeeCWEVauyRc2jUztvEkKArptM" },
    { key: "work-laptop", hash: "0MCjhgOZbTIBiUWnZJdrkiXZSoA" },
    { key: "open-notebook", hash: "XJP4OGEVjXt8avb0NauKlPXYEY" },
    { key: "notes", hash: "52nGQQ7gLqDiguh8AvcoksZaBGI" },
    { key: "to-dos", hash: "qrSvY1tFyoVSVjN0zBNJIezPs" },
    { key: "sticky", hash: "Ks4KMbXjOzLJjGMxHdmGi4llY" },
    { key: "sticky-empty-1", hash: "BQDJ4rDXxap6hjzD0KdpsCrF4o" },
    { key: "sticky-empty-2", hash: "ovf3WMo3EmcNAF49KAlKzd4lbt0" },
    { key: "phone", hash: "iokbHxpk1MBj2DyMk1qoueeeQM" },
    { key: "journal", hash: "JPLbpkF1Jd17vRUT1rfmmgPhfQ" },
    { key: "pen", hash: "HUSQF2KWYyoJf9K6yBPPi8er4zY" },
    { key: "tablet", hash: "XaBwWgmK8aSgBbpn75GnNY4hRY" },
    { key: "tea", hash: "fyEQ0Kjs1B3bcThyj0H2oEfaZ8" },
    { key: "water", hash: "0zrrCMhZXsiu2gFjthkfNhc1pA" },
    { key: "pencil-holder", hash: "fBJigHoGaLK2A2qSzKnBjGiGf40" },
]

interface DeskWorkFooterProps {
    accent?: string
    cream?: string
    ink?: string
    muted?: string
    headline?: string
    subline?: string
    homeHref?: string
    instagramUrl?: string
    linkedinUrl?: string
    email?: string
    deskScale?: number
    objectScale?: number
    railHeight?: number
    headlineSize?: number
    bodySize?: number
    contained?: boolean
    font?: { fontFamily?: string }
    bodyFont?: { fontFamily?: string }
    style?: CSSProperties
}

/** Home desk footer — desk art on the right, home link + socials on the left. */
function DeskWorkFooter(props: DeskWorkFooterProps) {
    const {
        accent = "#2C6BE0",
        cream = "#F3EFE6",
        ink = "#111111",
        muted = "#555555",
        subline = DEFAULT_FOOTER_SUBLINE,
        homeHref = "/",
        instagramUrl = "https://instagram.com/",
        linkedinUrl = "https://linkedin.com/",
        email = "hello@example.com",
        deskScale,
        objectScale = 1,
        railHeight = 280,
        headlineSize = 36,
        contained = false,
        style,
    } = props
    const family =
        props.font?.fontFamily || props.bodyFont?.fontFamily || SANS
    const scaleMul = Math.max(
        0.7,
        Math.min(1.4, Number(deskScale ?? objectScale) || 1),
    )
    const stageScale = (1200 / STAGE_W) * scaleMul * 1.05
    const viewportH = Math.round(
        Math.max(220, Number(railHeight) || 280) * scaleMul,
    )
    const mailHref = email.includes("mailto:")
        ? email
        : `mailto:${email}`
    const [hovered, setHovered] = useState<string | null>(null)
    const jiggleKeys = hovered
        ? FOOTER_JIGGLE[hovered] || [hovered]
        : []

    return (
        <footer
            style={{
                position: "relative",
                width: contained ? "100%" : "100vw",
                maxWidth: contained ? "100%" : "100vw",
                marginTop: 64,
                marginLeft: contained ? 0 : "calc(50% - 50vw)",
                background: cream,
                overflow: "hidden",
                fontFamily: family,
                ...style,
            }}
        >
            <style>{FOOTER_JIGGLE_CSS}</style>
            <link
                href="https://fonts.googleapis.com/css2?family=Annie+Use+Your+Telescope&family=Inter:wght@400;500;600;700&display=swap"
                rel="stylesheet"
            />
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: viewportH,
                    overflow: "hidden",
                    borderTop: `1px solid ${ink}`,
                }}
            >
                {/* Home desk stage — anchored to the right */}
                <div
                    style={{
                        position: "absolute",
                        right: "-4%",
                        bottom: 0,
                        width: STAGE_W,
                        height: STAGE_H,
                        transform: `scale(${stageScale})`,
                        transformOrigin: "bottom right",
                        pointerEvents: "auto",
                        zIndex: 1,
                    }}
                >
                    {HOME_FOOTER_LAYERS.map((layer) => {
                        const active = jiggleKeys.includes(layer.key)
                        return (
                            <img
                                key={layer.key}
                                src={`${IMG}${layer.hash}.png`}
                                alt=""
                                draggable={false}
                                className={active ? "nabia-footer-jiggle" : undefined}
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "fill",
                                    display: "block",
                                    userSelect: "none",
                                    pointerEvents: "none",
                                    transformOrigin: hovered
                                        ? footerOriginFor(hovered)
                                        : "center center",
                                }}
                            />
                        )
                    })}
                    <FooterDeskHotspots onHover={setHovered} />
                </div>

                {/* Left copy + quick links */}
                <div
                    style={{
                        position: "relative",
                        zIndex: 3,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        gap: 18,
                        maxWidth: 420,
                        padding: "32px 40px",
                        boxSizing: "border-box",
                        pointerEvents: "auto",
                    }}
                >
                    <a
                        href={homeHref || "/"}
                        title="Go back to the workspace"
                        aria-label="Go back to the workspace"
                        style={{
                            fontFamily: FOOTER_ANNIE,
                            fontSize: `clamp(26px, 3.6vw, ${headlineSize}px)`,
                            fontWeight: 400,
                            letterSpacing: "0",
                            lineHeight: 1.15,
                            color: ink,
                            textDecoration: "underline",
                            textDecorationColor: accent,
                            textUnderlineOffset: "6px",
                            textDecorationThickness: "2px",
                            maxWidth: 340,
                            cursor: "pointer",
                            position: "relative",
                            zIndex: 3,
                            pointerEvents: "auto",
                            transition: "color 160ms ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = accent
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = ink
                        }}
                    >
                        {subline}
                    </a>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                        }}
                    >
                        <IconLink
                            href={instagramUrl}
                            label="Instagram"
                            ink={ink}
                            accent={accent}
                        >
                            <InstagramIcon />
                        </IconLink>
                        <IconLink
                            href={linkedinUrl}
                            label="LinkedIn"
                            ink={ink}
                            accent={accent}
                        >
                            <LinkedInIcon />
                        </IconLink>
                        <IconLink
                            href={mailHref}
                            label="Email"
                            ink={ink}
                            accent={accent}
                        >
                            <EmailIcon />
                        </IconLink>
                    </div>
                </div>
            </div>
        </footer>
    )
}

function IconLink({
    href,
    label,
    ink,
    accent,
    children,
}: {
    href: string
    label: string
    ink: string
    accent: string
    children: ReactNode
}) {
    return (
        <a
            href={href}
            aria-label={label}
            target={href.startsWith("mailto:") ? undefined : "_blank"}
            rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
            style={{
                width: 40,
                height: 40,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1.5px solid ${ink}`,
                borderRadius: 8,
                background: creamSafe(),
                color: ink,
                textDecoration: "none",
                boxShadow: `2px 2px 0 ${accent}`,
                transition: "transform 160ms ease, box-shadow 160ms ease",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translate(-1px, -1px)"
                e.currentTarget.style.boxShadow = `3px 3px 0 ${accent}`
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none"
                e.currentTarget.style.boxShadow = `2px 2px 0 ${accent}`
            }}
        >
            {children}
        </a>
    )
}

function creamSafe() {
    return "rgba(243,239,230,0.92)"
}

function InstagramIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="5"
                stroke="currentColor"
                strokeWidth="1.8"
            />
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
        </svg>
    )
}

function LinkedInIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="3"
                stroke="currentColor"
                strokeWidth="1.8"
            />
            <path
                d="M8 10.5V16.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
            <circle cx="8" cy="7.5" r="1.1" fill="currentColor" />
            <path
                d="M11.5 16.5V12.2c0-1.3.9-2.2 2.1-2.2 1.2 0 2.1.9 2.1 2.2v4.3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

function EmailIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="2.5"
                stroke="currentColor"
                strokeWidth="1.8"
            />
            <path
                d="M4.5 7.5L12 12.5L19.5 7.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

const EMPTY_MEDIA = {
    heroImage: "",
    contextImage: "",
    problemImage: "",
    researchImage: "",
    sketchImage: "",
    wireframeImage: "",
    flowImage: "",
    processImage: "",
    iterationImage: "",
    finalImage1: "",
    finalImage2: "",
    finalImage3: "",
    finalImage4: "",
    outcomeImage: "",
    prototypeVideo: "",
}

const DEFAULT_CATALOG: ProjectRecord[] = [
    {
        title: "Fintech App",
        subtitle: "Onboarding redesign",
        role: "Lead Product Designer",
        year: "2025",
        timeline: "8 weeks",
        tools: "Figma, User interviews, Prototyping",
        overview:
            "A consumer fintech app was losing new users during a long, jargon-heavy sign-up. I reworked the first-run experience end to end.",
        context:
            "A mobile-first consumer fintech product for people managing everyday money. New users landed in a dense sign-up flow written for compliance, not for humans — and most bounced before they ever saw value.",
        problem:
            "Completion dropped hard between account creation and first funded action. Support tickets clustered around “what do you need this for?” moments. Business impact: paid acquisition was leaking before activation.",
        goals:
            "Raise sign-up completion, reduce time-to-first-value, and keep KYC/compliance intact without scaring people off.",
        constraints:
            "Legacy API order, fixed legal copy requirements, 8-week window, engineering bandwidth for one major flow rewrite — not a full redesign.",
        process:
            "Mapped the live funnel and drop-off points → interviewed recent drop-offs and completers → sketched alternate question orders → wireframed a “one clear ask per screen” flow → prototype-tested with 8 participants → iterated copy and progress cues with compliance.",
        decision1:
            "Chose progressive disclosure over a single long form — even though it meant more screens — because testing showed cognitive load beat click count.",
        decision2:
            "Kept mandatory KYC fields but moved “why we ask” inline next to each field instead of a separate FAQ, after users skipped the FAQ entirely.",
        decision3:
            "Cut a “product tour” after sign-up; first success action replaced it. Tour completion was vanity — funded accounts were the real metric.",
        outcome:
            "Sign-up completion improved noticeably in testing; the flow now sets expectations before asking for sensitive details. Shipped to production in the following release train.",
        reflection:
            "I’d bring compliance into the first workshop earlier — we lost a week negotiating copy that could have been co-authored up front.",
        accent: "#7457C9",
        slug: "fintech-app",
        ...EMPTY_MEDIA,
    },
    {
        title: "Health Platform",
        subtitle: "Design system",
        role: "Senior Product Designer",
        year: "2024",
        timeline: "4 months",
        tools: "Figma, Tokens, Storybook",
        overview:
            "A growing health platform had drifting UI across teams. I led the creation of a shared system.",
        context:
            "Multi-squad health platform spanning patient and clinician surfaces. Visual language had forked as teams shipped fast without a shared source of truth.",
        problem:
            "Inconsistent components slowed engineering, eroded trust in clinical UI, and made every new feature a redesign debate.",
        goals:
            "One tokenized system, documented components, and adoption across squads without freezing product velocity.",
        constraints:
            "Live product (no greenfield), mixed React native web, limited design-eng pairing time, accessibility bar for clinical use.",
        process:
            "Audit → token proposal → core components → pilot with one squad → harden docs in Storybook → expand coverage → governance rituals.",
        decision1:
            "Started with tokens + 8 primitives instead of 40 components — adoption needed a thin wedge, not a catalog.",
        decision2:
            "Favored semantic tokens (color.text.danger) over raw palettes so clinical meaning stayed portable across themes.",
        decision3:
            "Made “escape hatches” explicit rather than banning one-offs — squads needed a path for experiments without forking the system.",
        outcome:
            "Teams now build faster from one source of truth, and the product feels like a single product again.",
        reflection:
            "I’d measure adoption weekly from day one — qualitative buy-in looked fine while two squads quietly kept local components.",
        accent: "#28A06A",
        slug: "health-platform",
        ...EMPTY_MEDIA,
    },
    {
        title: "Chutney Studios",
        subtitle: "Brand + site",
        role: "Founder & Designer",
        year: "2025",
        timeline: "6 weeks",
        tools: "Figma, Framer, Brand",
        overview:
            "Chutney Studios is my after-hours practice. This is the brand and site I built for it.",
        context:
            "A personal studio for branding and sites for small, good-taste brands. Needed a presence that felt warm and clear — not agency-slick.",
        problem:
            "Without a sharp site, inquiries were vague and mismatched. I needed a filter as much as a brochure.",
        goals:
            "Sound like me, show craft, and give freelancers/clients a low-pressure way to start a conversation.",
        constraints:
            "Evenings/weekends only, solo build, budget of time not money.",
        process:
            "Tone board → type pairing tests → logo sketches → site IA → build in Framer → soft launch to peers for feedback.",
        decision1:
            "Picked a friendly type pairing over a colder “premium” stack — the studio’s edge is approachable taste, not intimidation.",
        decision2:
            "Kept case studies short on the marketing site; deep work lives in this portfolio instead of duplicating.",
        decision3:
            "Used a single CTA (email/book) rather than a form maze — conversion quality over lead volume.",
        outcome:
            "A site that sounds like me and gives freelance clients a clear, low-pressure way in.",
        reflection:
            "I’d ship a rough site in week two and iterate live — I polished offline longer than I needed to.",
        accent: "#D17BB0",
        slug: "chutney-studios",
        ...EMPTY_MEDIA,
    },
    {
        title: "Travel App",
        subtitle: "0→1 product",
        role: "Product Designer",
        year: "2023",
        timeline: "10 weeks",
        tools: "Figma, Prototyping, Field tests",
        overview:
            "A 0→1 travel app that needed to feel effortless for people planning trips on the move.",
        context:
            "Early-stage travel planning app for people who plan in scraps of time — trains, queues, couches — not desktop research marathons.",
        problem:
            "Competitive apps assumed leisurely desktop sessions. Our users abandoned complex planners mid-commute.",
        goals:
            "One-handed core loop, first trip plan under 5 minutes, clarity over feature breadth for v1.",
        constraints:
            "Tiny eng team, no backend for fancy collaboration yet, App Store deadline.",
        process:
            "Street interviews → paper flows → clickable prototype → ride-along tests on transit → scope cut → UI polish → handoff.",
        decision1:
            "Cut collaborative planning from v1 despite stakeholder love — it doubled complexity before the solo loop worked.",
        decision2:
            "Defaulted to “good enough itinerary” templates users could mutate, instead of a blank canvas.",
        decision3:
            "Used large tap targets and bottom-sheet edits for one-handed use, even when it looked less “minimal” on desktop mocks.",
        outcome:
            "Shipped a first version people could use one-handed on a train without a tutorial.",
        reflection:
            "I’d prototype offline states earlier — transit users hit dead zones constantly and we treated online as default too long.",
        accent: "#E0902F",
        slug: "travel-app",
        ...EMPTY_MEDIA,
    },
]

const catalogControls = {
    title: { type: ControlType.String, defaultValue: "Project" },
    subtitle: { type: ControlType.String, defaultValue: "Type" },
    role: { type: ControlType.String, defaultValue: "Role" },
    year: { type: ControlType.String, defaultValue: "2025" },
    timeline: { type: ControlType.String, defaultValue: "8 weeks" },
    tools: { type: ControlType.String, defaultValue: "Figma, Research" },
    overview: { type: ControlType.String, displayTextArea: true, defaultValue: "" },
    context: { type: ControlType.String, displayTextArea: true, defaultValue: "" },
    problem: { type: ControlType.String, displayTextArea: true, defaultValue: "" },
    goals: { type: ControlType.String, displayTextArea: true, defaultValue: "" },
    constraints: { type: ControlType.String, displayTextArea: true, defaultValue: "" },
    process: { type: ControlType.String, displayTextArea: true, defaultValue: "" },
    decision1: { type: ControlType.String, displayTextArea: true, defaultValue: "" },
    decision2: { type: ControlType.String, displayTextArea: true, defaultValue: "" },
    decision3: { type: ControlType.String, displayTextArea: true, defaultValue: "" },
    outcome: { type: ControlType.String, displayTextArea: true, defaultValue: "" },
    reflection: { type: ControlType.String, displayTextArea: true, defaultValue: "" },
    accent: { type: ControlType.Color, defaultValue: "#2C6BE0" },
    slug: { type: ControlType.String, defaultValue: "project" },
    heroImage: { type: ControlType.Image, title: "Hero Image", defaultValue: "" },
    contextImage: { type: ControlType.Image, title: "Context Image", defaultValue: "" },
    problemImage: { type: ControlType.Image, title: "Problem Image", defaultValue: "" },
    researchImage: { type: ControlType.Image, title: "Research Image", defaultValue: "" },
    sketchImage: { type: ControlType.Image, title: "Sketch Image", defaultValue: "" },
    wireframeImage: { type: ControlType.Image, title: "Wireframe Image", defaultValue: "" },
    flowImage: { type: ControlType.Image, title: "Flow Image", defaultValue: "" },
    processImage: { type: ControlType.Image, title: "Process Image", defaultValue: "" },
    iterationImage: { type: ControlType.Image, title: "Iteration Image", defaultValue: "" },
    finalImage1: { type: ControlType.Image, title: "Final Image 1", defaultValue: "" },
    finalImage2: { type: ControlType.Image, title: "Final Image 2", defaultValue: "" },
    finalImage3: { type: ControlType.Image, title: "Final Image 3", defaultValue: "" },
    finalImage4: { type: ControlType.Image, title: "Final Image 4", defaultValue: "" },
    outcomeImage: { type: ControlType.Image, title: "Outcome Image", defaultValue: "" },
    prototypeVideo: { type: ControlType.String, title: "Prototype Video URL", defaultValue: "" },
}

addPropertyControls(WorkCase, {
    catalog: {
        type: ControlType.Array,
        title: "Catalog (Projects CMS)",
        control: { type: ControlType.Object, controls: catalogControls },
        defaultValue: DEFAULT_CATALOG,
    },
    cream: { type: ControlType.Color, title: "Background", defaultValue: "#F3EFE6" },
    ink: { type: ControlType.Color, title: "Ink", defaultValue: "#111111" },
    muted: { type: ControlType.Color, title: "Muted Text", defaultValue: "#555555" },
    accent: { type: ControlType.Color, title: "UI Accent", defaultValue: "#2C6BE0" },
    displayFont: {
        type: ControlType.Font,
        title: "Display Font",
        controls: "extended",
        defaultFontType: "sans-serif",
        defaultValue: { fontSize: "40px", variant: "Regular" },
    },
    font: {
        type: ControlType.Font,
        title: "Body Font",
        controls: "extended",
        defaultFontType: "sans-serif",
        defaultValue: { fontSize: "15px", variant: "Regular", lineHeight: "1.5em" },
    },
    backLink: {
        type: ControlType.Link,
        title: "Link — Back Button",
        defaultValue: "/work",
    },
    projectBasePath: {
        type: ControlType.Link,
        title: "Link — Related Project Base",
        defaultValue: "/work",
    },
    footerSubline: {
        type: ControlType.String,
        title: "Footer Home Text",
        displayTextArea: true,
        defaultValue: DEFAULT_FOOTER_SUBLINE,
    },
    footerHomeLink: {
        type: ControlType.Link,
        title: "Link — Footer Home Text",
        defaultValue: "/",
    },
    footerInstagramUrl: {
        type: ControlType.Link,
        title: "Link — Footer Instagram",
        defaultValue: "https://instagram.com/",
    },
    footerLinkedinUrl: {
        type: ControlType.Link,
        title: "Link — Footer LinkedIn",
        defaultValue: "https://linkedin.com/",
    },
    footerEmail: {
        type: ControlType.String,
        title: "Link — Footer Email",
        defaultValue: "hello@example.com",
    },
    footerDeskScale: {
        type: ControlType.Number,
        title: "Footer Desk Scale",
        defaultValue: 1,
        min: 0.7,
        max: 1.4,
        step: 0.05,
    },
    footerHeight: {
        type: ControlType.Number,
        title: "Footer Height",
        defaultValue: 280,
        min: 220,
        max: 420,
        step: 4,
    },
    footerHeadlineSize: {
        type: ControlType.Number,
        title: "Footer Link Text Size",
        defaultValue: 36,
        min: 22,
        max: 56,
    },
    gridOpacity: {
        type: ControlType.Number,
        title: "Grid Opacity",
        defaultValue: 0.12,
        min: 0,
        max: 0.4,
        step: 0.01,
    },
})
