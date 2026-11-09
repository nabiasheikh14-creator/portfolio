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
const FRAME_RADIUS = 12
/** Shared case-study rhythm */
const SECTION_GAP = 96
const BLOCK_GAP = 28
const BODY_SIZE = 16
const BODY_LH = 1.65

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
    const nav: CaseNavItem[] = []
    const push = (id: string, label: string, on: boolean) => {
        if (on) nav.push({ id, label })
    }
    push(
        "overview",
        "Overview",
        hasText(p.context || p.overview) ||
            hasMedia(p.heroImage) ||
            hasMedia(p.contextImage),
    )
    push(
        "challenge",
        "Challenge",
        hasText(p.problem) || hasMedia(p.problemImage) || hasMedia(p.researchImage),
    )
    push(
        "approach",
        "Approach",
        hasText(p.process) ||
            hasText(p.goals) ||
            hasText(p.constraints) ||
            hasMedia(p.sketchImage) ||
            hasMedia(p.wireframeImage) ||
            hasMedia(p.flowImage) ||
            hasMedia(p.processImage) ||
            hasMedia(p.iterationImage),
    )
    push(
        "decisions",
        "Decisions",
        [p.decision1, p.decision2, p.decision3].some((d) => hasText(d)),
    )
    push(
        "final",
        "Final",
        [p.finalImage1, p.finalImage2, p.finalImage3, p.finalImage4, p.prototypeVideo].some(
            (src) => hasMedia(src),
        ),
    )
    push("outcome", "Outcome", hasText(p.outcome) || hasMedia(p.outcomeImage))
    push("reflection", "Reflection", hasText(p.reflection))
    return nav.length ? nav : [{ id: "overview", label: "Overview" }]
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

    const list = useMemo(() => {
        const authored =
            Array.isArray(catalog) && catalog.length ? catalog : []
        if (!authored.length) return DEFAULT_CATALOG
        const bySlug = new Map(DEFAULT_CATALOG.map((d) => [d.slug, d]))
        return authored.map((it: any) => {
            const rawSlug = String(it?.slug || "")
            const slugKey = rawSlug === "chutney-studios" ? "voice-ai" : rawSlug
            const fb = bySlug.get(slugKey)
            if (!fb) return it as ProjectRecord
            const replaced = rawSlug === "chutney-studios"
            // Framer Projects CMS (in DEFAULT_CATALOG) wins for copy; keep
            // authored media when present. The old Chutney slot is Fred now,
            // so its leftover canvas media is not carried over.
            const media = (authoredSrc: string, fallbackSrc: string) =>
                replaced ? fallbackSrc : authoredSrc || fallbackSrc
            return {
                ...fb,
                ...it,
                title: fb.title,
                subtitle: fb.subtitle,
                role: fb.role,
                year: fb.year,
                timeline: fb.timeline,
                tools: fb.tools,
                overview: fb.overview,
                context: fb.context,
                problem: fb.problem,
                goals: fb.goals,
                constraints: fb.constraints,
                process: fb.process,
                decision1: fb.decision1,
                decision2: fb.decision2,
                decision3: fb.decision3,
                outcome: fb.outcome,
                reflection: fb.reflection,
                accent: replaced ? fb.accent : it.accent || fb.accent,
                slug: fb.slug,
                heroImage: media(it.heroImage, fb.heroImage),
                contextImage: media(it.contextImage, fb.contextImage),
                problemImage: media(it.problemImage, fb.problemImage),
                researchImage: media(it.researchImage, fb.researchImage),
                sketchImage: media(it.sketchImage, fb.sketchImage),
                wireframeImage: media(it.wireframeImage, fb.wireframeImage),
                flowImage: media(it.flowImage, fb.flowImage),
                processImage: media(it.processImage, fb.processImage),
                iterationImage: media(it.iterationImage, fb.iterationImage),
                finalImage1: media(it.finalImage1, fb.finalImage1),
                finalImage2: media(it.finalImage2, fb.finalImage2),
                finalImage3: media(it.finalImage3, fb.finalImage3),
                finalImage4: media(it.finalImage4, fb.finalImage4),
                outcomeImage: media(it.outcomeImage, fb.outcomeImage),
                prototypeVideo: media(it.prototypeVideo, fb.prototypeVideo),
            } as ProjectRecord
        })
    }, [catalog])
    const [slug, setSlug] = useState(() =>
        isStatic ? String(list[0]?.slug || "") : slugFromPath(),
    )
    useEffect(() => {
        if (isStatic) return
        setSlug(slugFromPath())
    }, [isStatic])

    const project =
        list.find((p) => p.slug === (slug === "chutney-studios" ? "voice-ai" : slug)) ||
        list.find((p) => p.slug && slug && p.slug.includes(slug) && slug !== "chutney-studios") ||
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
                            margin: "0 0 18px",
                            fontFamily: displayFamily,
                            fontSize: "clamp(34px, 3.6vw, 52px)",
                            fontWeight: 400,
                            letterSpacing: "-0.01em",
                            lineHeight: 1.05,
                            color: ink,
                        }}
                    >
                        {project.title}
                    </h1>
                    {project.overview ? (
                        <p
                            style={{
                                margin: "0 0 28px",
                                fontFamily: family,
                                fontSize: BODY_SIZE,
                                fontWeight: 400,
                                lineHeight: BODY_LH,
                                color: muted,
                                maxWidth: 340,
                            }}
                        >
                            {project.overview}
                        </p>
                    ) : null}
                    <MetaChips
                        project={project}
                        family={family}
                        displayFamily={displayFamily}
                        muted={muted}
                        ink={ink}
                    />
                </div>

                <nav
                    aria-label="Case sections"
                    style={{
                        position: "relative",
                        zIndex: 1,
                        pointerEvents: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
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
                                    fontSize: 14,
                                    fontWeight: 400,
                                    letterSpacing: "0",
                                    color: active ? ink : LABEL,
                                    textAlign: "left",
                                }}
                            >
                                <span
                                    aria-hidden
                                    style={{
                                        width: 6,
                                        height: 6,
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
                    padding: "88px 28px 80px 20px",
                    boxSizing: "border-box",
                    background: CREAM,
                    backgroundColor: CREAM,
                    display: "flex",
                    flexDirection: "column",
                    gap: SECTION_GAP,
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
                    margin: "0 0 16px",
                    fontFamily: displayFamily,
                    fontSize: 36,
                    fontWeight: 400,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.05,
                    color: ink,
                }}
            >
                {project.title}
            </h1>
            {project.overview ? (
                <p
                    style={{
                        margin: "0 0 24px",
                        fontFamily: family,
                        fontSize: BODY_SIZE,
                        fontWeight: 400,
                        lineHeight: BODY_LH,
                        color: muted,
                    }}
                >
                    {project.overview}
                </p>
            ) : null}
            <MetaChips
                project={project}
                family={family}
                displayFamily={displayFamily}
                muted={muted}
                ink={ink}
            />

            <nav
                aria-label="Case sections"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    margin: "32px 0 48px",
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
                                fontWeight: 400,
                                color: active ? ink : LABEL,
                                textAlign: "left",
                            }}
                        >
                            <span
                                aria-hidden
                                style={{
                                    width: 6,
                                    height: 6,
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

            <div style={{ display: "flex", flexDirection: "column", gap: SECTION_GAP }}>
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
    displayFamily,
    muted,
    ink,
}: {
    project: ProjectRecord
    family: string
    displayFamily: string
    muted: string
    ink: string
}) {
    const bits = [
        project.year && { k: "Date", v: project.year },
        project.timeline && { k: "Duration", v: project.timeline },
        project.role && { k: "Role", v: project.role },
        project.tools && { k: "Tools", v: project.tools },
    ].filter(Boolean) as { k: string; v: string }[]
    if (!bits.length) return null
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {bits.map((b) => (
                <div key={b.k}>
                    <div
                        style={{
                            fontFamily: displayFamily,
                            fontSize: 18,
                            fontWeight: 400,
                            letterSpacing: "0",
                            color: LABEL,
                            marginBottom: 4,
                            lineHeight: 1.2,
                        }}
                    >
                        {b.k}
                    </div>
                    <div
                        style={{
                            fontFamily: family,
                            fontSize: 14,
                            fontWeight: 400,
                            lineHeight: 1.45,
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

function CaseSection({
    id,
    setSectionRef,
    children,
}: {
    id: string
    setSectionRef: (id: string) => (el: HTMLElement | null) => void
    children: ReactNode
}) {
    return (
        <section
            ref={setSectionRef(id)}
            id={id}
            style={{
                display: "flex",
                flexDirection: "column",
                gap: BLOCK_GAP,
            }}
        >
            {children}
        </section>
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
    const a = p.accent || accent
    const showChallenge =
        hasText(p.problem) || hasMedia(p.problemImage) || hasMedia(p.researchImage)
    const showApproach =
        hasText(p.process) ||
        hasText(p.goals) ||
        hasText(p.constraints) ||
        hasMedia(p.sketchImage) ||
        hasMedia(p.wireframeImage) ||
        hasMedia(p.flowImage) ||
        hasMedia(p.processImage) ||
        hasMedia(p.iterationImage)
    const decisionBody = [p.decision1, p.decision2, p.decision3].filter((d) =>
        hasText(d),
    )
    const showFinal = [
        p.finalImage1,
        p.finalImage2,
        p.finalImage3,
        p.finalImage4,
        p.prototypeVideo,
    ].some((src) => hasMedia(src))
    const showOutcome = hasText(p.outcome) || hasMedia(p.outcomeImage)
    const showReflection = hasText(p.reflection)

    return (
        <>
            <CaseSection id="overview" setSectionRef={setSectionRef}>
                <MediaFrame src={p.heroImage} accent={a} label="Hero image" tall />
                <StoryBlock
                    kicker="Overview"
                    body={p.context || p.overview}
                    family={family}
                    displayFamily={displayFamily}
                    ink={ink}
                    muted={muted}
                />
                <MediaFrame src={p.contextImage} accent={a} label="Context image" tall />
            </CaseSection>

            {showChallenge ? (
            <CaseSection id="challenge" setSectionRef={setSectionRef}>
                <StoryBlock
                    kicker="Challenge"
                    body={p.problem}
                    family={family}
                    displayFamily={displayFamily}
                    ink={ink}
                    muted={muted}
                />
                <MediaFrame src={p.problemImage} accent={a} label="Problem image" tall />
                <MediaFrame src={p.researchImage} accent={a} label="Research image" />
            </CaseSection>
            ) : null}

            {showApproach ? (
            <CaseSection id="approach" setSectionRef={setSectionRef}>
                <StoryBlock
                    kicker="Approach"
                    body={
                        [
                            p.process,
                            hasText(p.goals) ? `Goals\n${p.goals}` : "",
                            hasText(p.constraints) ? `Constraints\n${p.constraints}` : "",
                        ]
                            .filter(Boolean)
                            .join("\n\n")
                    }
                    family={family}
                    displayFamily={displayFamily}
                    ink={ink}
                    muted={muted}
                />
                <MediaFrame src={p.sketchImage} accent={a} label="Sketches" tall />
                <MediaFrame src={p.wireframeImage} accent={a} label="Wireframes" tall />
                <MediaFrame
                    src={p.flowImage || p.processImage}
                    accent={a}
                    label="Process"
                    tall
                />
                <MediaFrame src={p.iterationImage} accent={a} label="Iteration" />
            </CaseSection>
            ) : null}

            {decisionBody.length ? (
            <CaseSection id="decisions" setSectionRef={setSectionRef}>
                <StoryBlock
                    kicker="Decisions"
                    body={decisionBody
                        .map((d, i) => {
                            const first = d.split("\n")[0].trim()
                            const labeled =
                                d.includes("\n") &&
                                first.length <= 42 &&
                                !first.includes(".")
                            return labeled
                                ? d.trim()
                                : `${String(i + 1).padStart(2, "0")}\n${d.trim()}`
                        })
                        .join("\n\n")}
                    family={family}
                    displayFamily={displayFamily}
                    ink={ink}
                    muted={muted}
                />
            </CaseSection>
            ) : null}

            {showFinal ? (
            <CaseSection id="final" setSectionRef={setSectionRef}>
                <StoryBlock
                    kicker="Final"
                    body=""
                    family={family}
                    displayFamily={displayFamily}
                    ink={ink}
                    muted={muted}
                />
                <MediaFrame src={p.finalImage1} accent={a} label="Final image 01" tall />
                <MediaFrame src={p.finalImage2} accent={a} label="Final image 02" tall />
                <MediaFrame src={p.finalImage3} accent={a} label="Final image 03" />
                <MediaFrame src={p.finalImage4} accent={a} label="Final image 04" />
                <VideoFrame src={p.prototypeVideo} accent={a} label="Prototype video" />
            </CaseSection>
            ) : null}

            {showOutcome ? (
            <CaseSection id="outcome" setSectionRef={setSectionRef}>
                <StoryBlock
                    kicker="Outcome"
                    body={p.outcome}
                    family={family}
                    displayFamily={displayFamily}
                    ink={ink}
                    muted={muted}
                />
                <MediaFrame src={p.outcomeImage} accent={a} label="Outcome image" tall />
            </CaseSection>
            ) : null}

            {showReflection ? (
            <CaseSection id="reflection" setSectionRef={setSectionRef}>
                <StoryBlock
                    kicker="Reflection"
                    body={p.reflection}
                    family={family}
                    displayFamily={displayFamily}
                    ink={ink}
                    muted={muted}
                />
            </CaseSection>
            ) : null}

            {related.length > 0 && (
                <section style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 8 }}>
                    <p
                        style={{
                            margin: 0,
                            fontFamily: displayFamily,
                            fontSize: 22,
                            fontWeight: 400,
                            color: ink,
                            lineHeight: 1.2,
                        }}
                    >
                        More work
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {related.map((r) => (
                            <a
                                key={r.slug}
                                href={`${basePath}/${r.slug}`}
                                style={{
                                    display: "flex",
                                    alignItems: "baseline",
                                    justifyContent: "space-between",
                                    gap: 16,
                                    padding: "16px 0",
                                    textDecoration: "none",
                                    color: ink,
                                    borderBottom: "1px solid rgba(17,17,17,0.1)",
                                }}
                            >
                                <span
                                    style={{
                                        fontFamily: displayFamily,
                                        fontSize: 24,
                                        fontWeight: 400,
                                        lineHeight: 1.15,
                                    }}
                                >
                                    {r.title}
                                </span>
                                <span
                                    style={{
                                        fontFamily: family,
                                        fontSize: 13,
                                        fontWeight: 400,
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

function linkify(text: string): ReactNode[] {
    return text.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
        /^https?:\/\//.test(part) ? (
            <a
                key={i}
                href={part}
                target="_blank"
                rel="noreferrer"
                style={{ color: "inherit", textDecoration: "underline" }}
            >
                website design
            </a>
        ) : (
            part
        ),
    )
}

const BODY_INK = "#333333"

function storyBlocks(body: string): { subhead: string; text: string }[] {
    return body
        .split(/\n\n+/)
        .map((block) => block.trim())
        .filter(Boolean)
        .map((block) => {
            const breakAt = block.indexOf("\n")
            if (breakAt > 0) {
                const subhead = block.slice(0, breakAt).trim()
                const text = block.slice(breakAt + 1).trim()
                if (
                    subhead &&
                    text &&
                    subhead.length <= 42 &&
                    !subhead.includes(".")
                ) {
                    return { subhead, text }
                }
            }
            if (
                block.length <= 48 &&
                !/[.!?]/.test(block)
            ) {
                return { subhead: block, text: "" }
            }
            return { subhead: "", text: block }
        })
}

function StoryBlock({
    kicker,
    body,
    family,
    displayFamily,
    ink,
}: {
    kicker: string
    body: string
    family: string
    displayFamily: string
    ink: string
    muted: string
}) {
    const blocks = hasText(body) ? storyBlocks(body) : []
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <span
                    aria-hidden
                    style={{
                        display: "block",
                        width: 36,
                        height: 1,
                        background: ink,
                    }}
                />
                <div
                    style={{
                        fontFamily: displayFamily,
                        fontSize: 40,
                        fontWeight: 400,
                        letterSpacing: "0",
                        lineHeight: 1.05,
                        color: ink,
                    }}
                >
                    {kicker}
                </div>
            </div>
            {blocks.length ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                    {blocks.map((block, i) => (
                        <div
                            key={i}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: block.subhead && block.text ? 6 : 0,
                            }}
                        >
                            {block.subhead ? (
                                <div
                                    style={{
                                        margin: 0,
                                        fontFamily: family,
                                        fontSize: 16,
                                        fontWeight: 600,
                                        letterSpacing: "0",
                                        lineHeight: 1.35,
                                        color: ink,
                                    }}
                                >
                                    {block.subhead}
                                </div>
                            ) : null}
                            {block.text ? (
                            <p
                                style={{
                                    margin: 0,
                                    fontFamily: family,
                                    fontSize: BODY_SIZE,
                                    fontWeight: 400,
                                    letterSpacing: "0",
                                    lineHeight: BODY_LH,
                                    color: BODY_INK,
                                    maxWidth: "100%",
                                }}
                            >
                                {linkify(block.text)}
                            </p>
                            ) : null}
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    )
}

function MediaRow({ children }: { children: ReactNode }) {
    const kids = (Array.isArray(children) ? children : [children]).filter(Boolean)
    if (!kids.length) return null
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: kids.length > 1 ? "1fr 1fr" : "1fr",
                gap: 16,
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
    if (!url) return null
    return (
        <figure style={{ margin: 0, width: "100%" }}>
            <img
                src={url}
                alt={label || ""}
                style={{
                    display: "block",
                    width: "100%",
                    height: "auto",
                    borderRadius: FRAME_RADIUS,
                }}
            />
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
        <figure style={{ margin: 0, width: "100%" }}>
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16 / 9",
                    borderRadius: FRAME_RADIUS,
                    overflow: "hidden",
                    background: url ? "#111" : "#E8E2D6",
                    border: url ? "none" : "1.5px solid rgba(17,17,17,0.14)",
                    boxSizing: "border-box",
                }}
            >
                {url ? (
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
                ) : (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            color: MUTED,
                            fontFamily: SANS,
                            fontSize: 14,
                            fontWeight: 400,
                            letterSpacing: "0.02em",
                            padding: 24,
                            textAlign: "center",
                            boxSizing: "border-box",
                        }}
                    >
                        <span
                            aria-hidden
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 8,
                                border: `1.5px dashed rgba(17,17,17,0.25)`,
                                display: "grid",
                                placeItems: "center",
                                fontSize: 16,
                                color: LABEL,
                            }}
                        >
                            ▶
                        </span>
                        <span>{label || "Video"}</span>
                    </div>
                )}
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
        box: [836, 428, 82, 85],
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
        title:
            "Sooraj Nagar",
        subtitle:
            "Onboarding redesign",
        role:
            "Lead Product Designer",
        year:
            "2025",
        timeline:
            "8 weeks · 2025",
        tools:
            "Figma, User interviews, Prototyping",
        overview:
            "A consumer fintech app was losing new users during a long, jargon-heavy sign-up. I reworked the first-run experience end to end.",
        context:
            "A mobile-first consumer fintech product for people managing everyday money. New users landed in a dense sign-up flow written for compliance, not for humans, and most bounced before they ever saw value.",
        problem:
            "Completion dropped hard between account creation and first funded action.\n\nSupport tickets clustered around “what do you need this for?” moments.\n\nBusiness impact\nPaid acquisition was leaking before activation.",
        goals:
            "Raise sign-up completion, reduce time-to-first-value, and keep KYC/compliance intact without scaring people off.",
        constraints:
            "Legacy API order, fixed legal copy requirements, 8-week window, engineering bandwidth for one major flow rewrite, not a full redesign.",
        process:
            "Funnel\nMapped the live funnel and drop-off points.\n\nInterviews\nInterviewed recent drop-offs and completers.\n\nQuestion order\nSketched alternate question orders.\n\nOne ask per screen\nWireframed a “one clear ask per screen” flow.\n\nPrototype\nPrototype-tested with 8 participants.\n\nCopy with compliance\nIterated copy and progress cues with compliance.",
        decision1:
            "Chose progressive disclosure over a single long form, even though it meant more screens, because testing showed cognitive load beat click count.",
        decision2:
            "Kept mandatory KYC fields but moved “why we ask” inline next to each field instead of a separate FAQ, after users skipped the FAQ entirely.",
        decision3:
            "Cut a “product tour” after sign-up; first success action replaced it. Tour completion was vanity. Funded accounts were the real metric.",
        outcome:
            "Sign-up completion improved noticeably in testing; the flow now sets expectations before asking for sensitive details.\n\nShipped to production in the following release train.",
        reflection:
            "I’d bring compliance into the first workshop earlier.\n\nWe lost a week negotiating copy that could have been co-authored up front.",
        accent: "#7457C9",
        slug: "fintech-app",
        ...EMPTY_MEDIA,
    },
    {
        title:
            "Bridge",
        subtitle:
            "Website & platform",
        role:
            "UI/UX, Service & Graphic Design",
        year:
            "2024",
        timeline:
            "3 months",
        tools:
            "Figma",
        overview:
            "Bridge aims to reduce the gap between independent (indie) filmmakers and film-related personnel by connecting them efficiently and supporting them in their creative ventures.",
        context:
            "Bridge aims to reduce the gap between independent (indie) filmmakers and film-related personnel by connecting them efficiently and supporting them in their creative ventures.\n\nCompany\nBrown Noise Media.",
        problem:
            "With the rise of Indie Filmmaking and non-unionised productions in North America, there is a gap between film makers and hiring talent, crew, locations and props making it an inefficient and time consuming process.\n\nSince it's difficult for independent filmmakers to join film unions, given the high costs and barriers to entry, all pre-production processes are handled by filmmakers themselves.",
        goals:
            "",
        constraints:
            "",
        process:
            "What we designed\nTo solve this, my team and I designed brand identity, strategy, social media presence, and the website for the platform, Bridge.\n\nPrototype\nClick to view https://www.figma.com/proto/l2ZT9Uzivb5Xrch3WTzhJN/Bridge-Website-and-Platform?node-id=1115-33934",
        decision1:
            "",
        decision2:
            "",
        decision3:
            "",
        outcome:
            "Bridge is where the independent filmmaker, actor, crew member, and more, meets the rest of the industry. It's a one stop for all things production, so that the user does not have to go look for different resources in different places. It's available under one platform, Bridge.",
        reflection:
            "",
        accent: "#ED3B3F",
        slug: "health-platform",
        ...EMPTY_MEDIA,
        heroImage:
            "https://framerusercontent.com/images/niA4BuNKihF3x0I5SNEfvIzeQ.png",
        contextImage:
            "https://framerusercontent.com/images/o1o7XLmSOvwaUnIPgAgr38u4W6A.png",
        flowImage:
            "https://framerusercontent.com/images/ySY62RMkHS8GCaPiveQJoEjMI.png",
        finalImage1:
            "https://framerusercontent.com/images/LW98LXJUXre173gnGBbyk1H0Q.png",
        finalImage2:
            "https://framerusercontent.com/images/mTA1xLceIzElk7HNOxsCjPjFX0U.png",
        finalImage3:
            "https://framerusercontent.com/images/hJjJJphe37WqOQyA70MdZzOd8eI.jpeg",
        prototypeVideo:
            "https://framerusercontent.com/assets/wbgcrMiL0WgXOBz69jYf7LJa5Lg.mp4",
    },
    {
        title:
            "Fred",
        subtitle:
            "Designing how a real estate agent supervises an AI that calls their leads",
        role:
            "UI/UX Designer",
        year:
            "June 2025",
        timeline:
            "",
        tools:
            "Figma, FigJam",
        overview:
            "A voice AI assistant for real estate agents. It sorts their leads, makes the calls and follows up, from a chat-first mobile app and a web version on the same system.",
        context:
            "Fred is a voice AI assistant for real estate agents. It sorts their leads, makes the calls and follows up, all from a chat-first mobile app, with a web version built on the same system.\n\nClient project. I designed the wireframes, the design system, the high-fidelity UI, and the web version.",
        problem:
            "The brief\nThe client wanted a CRM that real estate agents talk to instead of filling in. Chat is the home screen. You import your sheets and documents, and Fred sorts every lead into projects, queues tasks and shows where each lead stands.\n\nWhat the problem really was\nThe hard part wasn’t the chat, it was trust. An agent that calls twenty clients on your behalf can embarrass you at scale. Hence the real question became how Fred shows what it’s about to do, and how you step in when something goes wrong.",
        goals:
            "",
        constraints:
            "",
        process:
            "Visual direction\nIn mid 2025, Claude, Replit and Manus were setting the patterns for mobile AI agents, so I studied how they handled chat, progress and long-running tasks. Most of those references were dark. I went the other way, with warm neutrals and slate blue, olive and burgundy accents, because this is a tool agents would live in all day and I wanted it to feel calm.\n\nThe system\nThe system runs on Satoshi and Urbanist. Its core pieces are step cards for multi-stage tasks, collapsible “AI-inferred facts” so the agent’s guesses can be checked, status tags and a shared icon set.\n\nKey screens\nThe home screen is the chat, with five tabs: Portfolio, Leads, Fred, Updates and Analytics. Onboarding is a 4 to 5 step setup covering your number, voice settings, lead import, WhatsApp and promo material, with an option to be guided by voice and a demo call to see Fred in action.\n\nFrom mobile to web\nThe web version carries the same system across eight flows, including pipeline and calendar, inbound and outbound email, replying and scheduling meetings with a lead, archive, portfolio and analytics. Desktop gave me room to run things side by side, which is why the calling progress and the chat can live in separate windows.",
        decision1:
            "Nothing goes out without a dry run\nWhen you type “Call hot leads in Dubai”, Fred finds the leads, shows their names, languages and risk flags like do-not-disturb and night hours, then waits for you to confirm, modify or cancel. You confirm the call script too. A mistake here goes out under the agent’s name, so the checkpoint sits before the action.\n\nProgress stays visible while calls run\nA minimisable banner shows “12 calls in progress, ETA 6 min”, split into successful and failed, with retry, cancel all or schedule for later. On web, the chat moves to the side and progress gets its own window.\n\nWhen the AI gets confused, it tells you\nFred notifies the agent in chat, and the agent can pause the batch, merge into the live call or mark the lead for human follow-up. If the agent is offline, actions queue and run when they’re back.\n\nResults turn into actions\nEvery call gets a transcript and a summary, with highlighted insights like “Client said: send floorplan” and a button to create the follow-up. Lead cards collapse and expand, with retry and reschedule built in.\n\nImporting cleans up after itself\nCSV, CRM sync or quick add, then duplicate detection and phone cleanup, then a plain summary: “32 new leads added; 5 duplicates removed.” Leads with gaps get prompts like “Add phone for AI calling.”\n\nThreads became Projects\nEarly on I had Leads and Threads as separate ideas, and how they related wasn’t clear. Projects fixed that by giving every lead a home, and the agent a clear context to work in.",
        decision2:
            "",
        decision3:
            "",
        outcome:
            "I delivered the wireframes, the design system, 50+ high-fidelity mobile screens and the web version. The work stayed at design stage.",
        reflection:
            "The next thing I’d push for is testing the dry-run and failure flows with real agents, since that’s where trust is won or lost.",
        accent: "#44586A",
        slug: "voice-ai",
        ...EMPTY_MEDIA,
        heroImage:
            "https://cdn.jsdelivr.net/gh/nabiasheikh14-creator/portfolio@e0a6ed93fecadfef835294f13bafbc170bac6726/framer/case/fred/laptop-pipeline.png",
        contextImage:
            "https://cdn.jsdelivr.net/gh/nabiasheikh14-creator/portfolio@e0a6ed93fecadfef835294f13bafbc170bac6726/framer/case/fred/flow-overview.png",
        problemImage:
            "https://cdn.jsdelivr.net/gh/nabiasheikh14-creator/portfolio@e0a6ed93fecadfef835294f13bafbc170bac6726/framer/case/fred/flow-bulk-calling.png",
        wireframeImage:
            "https://cdn.jsdelivr.net/gh/nabiasheikh14-creator/portfolio@e0a6ed93fecadfef835294f13bafbc170bac6726/framer/case/fred/wireframes.png",
        flowImage:
            "https://cdn.jsdelivr.net/gh/nabiasheikh14-creator/portfolio@e0a6ed93fecadfef835294f13bafbc170bac6726/framer/case/fred/flow-onboarding.png",
        prototypeVideo:
            "https://cdn.jsdelivr.net/gh/nabiasheikh14-creator/portfolio@e0a6ed93fecadfef835294f13bafbc170bac6726/framer/case/fred/design-system.mp4",
    },
    {
        title:
            "Safar-e-Asaan",
        subtitle:
            "Making Karachi’s Bus System Legible",
        role:
            "Designer, with Maheen Qadri and Zahabiya Murtaza",
        year:
            "2024",
        timeline:
            "4 months",
        tools:
            "Figma",
        overview:
            "A route-and-signage system for riders who currently have to ask strangers which bus to take.",
        context:
            "A route-and-signage system for riders who currently have to ask strangers which bus to take.\n\nUniversity group project, framed as a design solution for the Sindh Ministry of Transportation. Team of three designers: Nabia Shaikh, Maheen Qadri, and Zahabiya Murtaza. We did the field research, synthesis, ideation, prototyping, usability testing, and all the deliverables together.",
        problem:
            "Karachi’s W-11 “rani” buses make up a large part of the city’s public transport, but riders can’t see the system. Stops are informal, routes are rarely written anywhere, and riders end up asking conductors, strangers, or the driver. Our secondary research cited 1,029 working buses against 15,000 needed. We asked: how can signage, displays, and announcements make navigating the bus easier, and what else in the system has to change?",
        goals:
            "",
        constraints:
            "",
        process:
            "We used four methods, each chosen to answer a different question.\n\nInterviews\nWith 4 riders, for how the bus feels in their words.\n\nRide-alongs\nOn the W-11 and the Green Line. None of us were regular bus riders, so we needed to experience both.\n\nFly-on-the-wall observation\nWe recorded audio and images while riding and watched how people interacted with the bus.\n\nSecondary research\nFrom news articles and transport-planning literature.\n\nNo reliable routes\nRiders have no reliable source for routes. Salma, a frequent rider, asks people nearby. Salauddin, who uses both systems, walked a mile to find a stop and said: “Yeh bus ka route kiu nahi likha hua kahin par?” (Why isn’t the route written anywhere?)\n\nDoubt on board\nDoubt continues on board. In our journey map, Salma wonders mid-ride, “Yeh driver konsa route leraha hai?” (Which route is this driver taking?)\n\nSafety and comfort\nSafety and comfort decide which system people prefer. Salauddin chooses the Green Line for safety and cleanliness. He still takes the W-11 because it goes where he needs to go. His concerns are pickpocketing, overcrowding, and diesel smell.\n\nThe Green Line\nThe Green Line shows what order looks like. It has a maintained station, a bus every 5 to 6 minutes, and separate sections for women, families, and men. Its network is too small to replace the W-11.\n\nThe missing information\nThe buses aren’t the whole problem. The missing information is. People already use the W-11 because it is cheap and it reaches everywhere. The system fails at telling them where it goes, when it comes, and whether they are safe. That shifted our focus from improving the bus to improving the information and the stops around it.\n\nStakeholders\nWe mapped the stakeholders: riders, drivers and conductors, government, technology providers, local businesses, and communities. The map showed who would have to act for any solution to work.",
        decision1:
            "Digital infographics and screens could show live arrivals, but funding, maintenance, and literacy would limit them.",
        decision2:
            "Iconography and signage, starting in Urdu. A sign has to say why. Naming the foods that aren’t allowed, such as strong-smelling or liquid ones, is clearer than “no eating”. People may ignore a sign that doesn’t.",
        decision3:
            "We kept signage and maps as the core. Because screens fail people who can’t read, we added audio announcements and a helpline button. A feedback helpline only works if customer care exists, so it stayed a support, not the system.",
        outcome:
            "We built mid-fidelity prototypes, a stop map and an infographic poster, wrote four task scenarios, and tested on 6 April 2024. The scenarios were a first-time visitor who doesn’t speak English, a wheelchair user, a student, and a non-reader. We measured time on task and success or failure.\n\nParticipants understood the map layout and found stops, but were confused about route colors. The poster didn’t show the direction of travel or the order of stops. Nobody could tell where they were or what came next.\n\nWe changed to larger, heavier type, a simpler map, a simpler color scheme with higher contrast, distinct icons for connecting stops, and arrows and a clear “you are here” on the poster.\n\nSix parts\nThe system has six parts.\n\nNo route information\nA route map and infographic listing all routes, plus bus stop signage on lamp posts.\n\nDoubt on board\nSignage inside the bus showing every stop on the route.\n\nNon-readers excluded\nA ticker, speaker announcements, and a helpline button at stops and on buses.\n\nSafety fears\nA redesigned stop with shelter, fan, CCTV, alarm, and emergency button.\n\nDrivers stopping mid-road\nA workshop and manual for drivers on technology and conduct.\n\nNobody owns the system\nA service blueprint across passenger, staff, and backstage actions. A ticker, a GPS tracker, and an alarm each need people behind them, such as a technical team or a control center.\n\nWhat we delivered\nThe signage and map system, the stop concept, the blueprint, the driver manual, and a documentary. What we didn’t get: a pilot, real-rider testing, or any measurable change.",
        reflection:
            "Participants were classmates, not the riders, who vary widely in literacy, language, and familiarity with the area. We also A/B tested poster versions. Which version won isn’t in the file.\n\nI’d test with real riders at a real stop, including people who can’t read. Cost and maintenance are also open. We flagged them for screens but didn’t price the stop.",
        accent: "#5E151C",
        slug: "travel-app",
        ...EMPTY_MEDIA,
        heroImage:
            "https://framerusercontent.com/images/TnPPCytxq6rtcJNIu4De1aMBWI.png",
        problemImage:
            "https://framerusercontent.com/images/RepxRzPvw2JAFsVCMhtRV31Zg.png",
        flowImage:
            "https://framerusercontent.com/images/OBwAPf0O5vThuNUcRREffArnGOc.png",
        finalImage1:
            "https://framerusercontent.com/images/gbIKhHbiXemfvan0Mz3qV7RO4I8.png",
        finalImage2:
            "https://framerusercontent.com/images/Q5BxRRTHioPZGEZPzTYczijeEY.jpeg",
        finalImage3:
            "https://framerusercontent.com/images/Y6ZFPJecluq3cj3YDQ0NSGoKNck.png",
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
