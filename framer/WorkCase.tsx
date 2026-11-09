import {
    createContext,
    useContext,
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
const BLOCK_GAP = 64
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
    storyVideo?: string
    collaborators?: string
    research?: string
    system?: string
    experience?: string
    beyond?: string
    decision4?: string
    longform?: boolean
    frames?: { section: string; src: string; video?: boolean; label?: string; after?: number }[]
}

const CaseMotion = createContext({
    lift: false,
    section: 80,
    media: 64,
    cover: false,
})

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
    push("research", "Research", hasText(p.research))
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
    push("system", "System", hasText(p.system))
    push("experience", "Experience", hasText(p.experience))
    push("beyond", "Beyond the room", hasText(p.beyond))
    push(
        "decisions",
        "Decisions",
        [p.decision1, p.decision2, p.decision3, p.decision4].some((d) => hasText(d)),
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
                storyVideo: media(it.storyVideo || "", fb.storyVideo || ""),
                collaborators: fb.collaborators || "",
                research: fb.research || "",
                system: fb.system || "",
                experience: fb.experience || "",
                beyond: fb.beyond || "",
                decision4: fb.decision4 || "",
                longform: Boolean(fb.longform),
                frames: fb.frames || [],
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
            const aside = document.querySelector("[data-case-aside]")
            if (
                target &&
                aside &&
                aside.contains(target) &&
                aside.scrollHeight > aside.clientHeight + 4
            ) {
                return
            }
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
                padding: phone ? "14px 16px" : "10px 22px",
                minHeight: phone ? "44px" : "",
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
                    justifyContent: project.longform ? "flex-start" : "space-between",
                    padding: project.longform
                        ? "108px 2.2vw 28px 3.2vw"
                        : "108px 2.2vw 40px 3.2vw",
                    boxSizing: "border-box",
                    overflow: "hidden",
                    background: CREAM,
                    backgroundColor: CREAM,
                    pointerEvents: "none",
                }}
            >
                <div
                    data-case-aside={project.longform ? "true" : undefined}
                    style={{
                        position: "relative",
                        zIndex: 1,
                        pointerEvents: "auto",
                        flex: project.longform ? "1 1 auto" : undefined,
                        minHeight: project.longform ? 0 : undefined,
                        overflowY: project.longform ? "auto" : "visible",
                    }}
                >
                    <h1
                        style={{
                            margin: "0 0 18px",
                            fontFamily: displayFamily,
                            fontSize: project.longform
                                ? "clamp(32px, 3vw, 42px)"
                                : "clamp(34px, 3.6vw, 52px)",
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
                                margin: project.longform ? "0 0 14px" : "0 0 28px",
                                fontFamily: family,
                                fontSize: project.longform ? 14 : BODY_SIZE,
                                fontWeight: 400,
                                lineHeight: project.longform ? 1.45 : BODY_LH,
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
                        compact={project.longform}
                    />
                </div>

                <nav
                    aria-label="Case sections"
                    style={{
                        position: "relative",
                        zIndex: 1,
                        pointerEvents: "auto",
                        flex: "none",
                        display: "flex",
                        flexDirection: "column",
                        gap: nav.length > 7 ? 4 : 10,
                        paddingTop: nav.length > 7 ? 16 : 24,
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
                    gap: project.longform ? 28 : SECTION_GAP,
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
                padding: "140px 18px 48px",
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
                    gap: 4,
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
                                minHeight: 44,
                                padding: "12px 0",
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

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: project.longform ? 28 : SECTION_GAP,
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
    compact,
}: {
    project: ProjectRecord
    family: string
    displayFamily: string
    muted: string
    ink: string
    compact?: boolean
}) {
    const bits = [
        project.year && { k: "Date", v: project.year },
        project.timeline && { k: "Duration", v: project.timeline },
        project.role && { k: "Role", v: project.role },
        project.tools && { k: "Tools", v: project.tools },
        project.collaborators && { k: "Collaborators", v: project.collaborators },
    ].filter(Boolean) as { k: string; v: string }[]
    if (!bits.length) return null
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: compact ? 8 : 14 }}>
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
                            fontSize: compact ? 13 : 14,
                            fontWeight: 400,
                            lineHeight: compact ? 1.35 : 1.45,
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
    lead,
    children,
}: {
    id: string
    setSectionRef: (id: string) => (el: HTMLElement | null) => void
    lead?: boolean
    children: ReactNode
}) {
    const motion = useContext(CaseMotion)
    return (
        <section
            ref={setSectionRef(id)}
            id={id}
            style={
                motion.cover
                    ? {
                          position: "relative",
                          zIndex: 1,
                          background: CREAM,
                          marginTop: lead ? 0 : -72,
                          paddingBottom: 96,
                      }
                    : undefined
            }
        >
            <Parallax amount={motion.section} lift={motion.lift}>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: motion.cover ? 40 : BLOCK_GAP,
                    }}
                >
                    {children}
                </div>
            </Parallax>
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
    const decisionBody = [p.decision1, p.decision2, p.decision3, p.decision4].filter(
        (d) => hasText(d),
    )
    const motion = {
        lift: Boolean(p.longform),
        section: p.longform ? 64 : 80,
        media: p.longform ? 110 : 64,
        cover: Boolean(p.longform),
    }
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
        <CaseMotion.Provider value={motion}>
            <CaseSection id="overview" lead setSectionRef={setSectionRef}>
                <MediaFrame src={p.heroImage} accent={a} label="Hero image" tall />
                <StoryBlock
                    kicker="Overview"
                    body={p.context || p.overview}
                    family={family}
                    displayFamily={displayFamily}
                    ink={ink}
                    muted={muted}
                />
                <VideoFrame src={p.storyVideo || ""} accent={a} label="Case study film" />
                <MediaFrame src={p.processImage} accent={a} label="Sales pipeline" tall />
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
                    frames={p.frames}
                    section="challenge"
                    accent={a}
                />
                <MediaFrame src={p.problemImage} accent={a} label="Problem image" tall />
                <MediaFrame src={p.researchImage} accent={a} label="Research image" />
            </CaseSection>
            ) : null}

            {hasText(p.research) ? (
            <CaseSection id="research" setSectionRef={setSectionRef}>
                <StoryBlock
                    kicker="Research"
                    body={p.research || ""}
                    family={family}
                    displayFamily={displayFamily}
                    ink={ink}
                    muted={muted}
                    frames={p.frames}
                    section="research"
                    accent={a}
                />
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
                    frames={p.frames}
                    section="approach"
                    accent={a}
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

            {hasText(p.system) ? (
            <CaseSection id="system" setSectionRef={setSectionRef}>
                {String(p.system).startsWith("Nine actions") ? (
                    <SystemBoard
                        family={family}
                        displayFamily={displayFamily}
                        ink={ink}
                        accent={a}
                        frames={p.frames}
                    />
                ) : (
                <StoryBlock
                    kicker="System"
                    body={p.system || ""}
                    family={family}
                    displayFamily={displayFamily}
                    ink={ink}
                    muted={muted}
                    frames={p.frames}
                    section="system"
                    accent={a}
                />
                )}
            </CaseSection>
            ) : null}

            {hasText(p.experience) ? (
            <CaseSection id="experience" setSectionRef={setSectionRef}>
                <StoryBlock
                    kicker="Experience"
                    body={p.experience || ""}
                    family={family}
                    displayFamily={displayFamily}
                    ink={ink}
                    muted={muted}
                    frames={p.frames}
                    section="experience"
                    accent={a}
                />
            </CaseSection>
            ) : null}

            {hasText(p.beyond) ? (
            <CaseSection id="beyond" setSectionRef={setSectionRef}>
                <StoryBlock
                    kicker="Beyond the room"
                    body={p.beyond || ""}
                    family={family}
                    displayFamily={displayFamily}
                    ink={ink}
                    muted={muted}
                    frames={p.frames}
                    section="beyond"
                    accent={a}
                />
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
        </CaseMotion.Provider>
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

function Parallax({
    amount,
    lift,
    children,
}: {
    amount: number
    lift?: boolean
    children: ReactNode
}) {
    const boxRef = useRef<HTMLDivElement>(null)
    const layerRef = useRef<HTMLDivElement>(null)
    const isStatic = useIsStaticRenderer()

    useEffect(() => {
        const box = boxRef.current
        const layer = layerRef.current
        if (!box || !layer || isStatic || typeof window === "undefined") return
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
        const scroller = box.closest("[data-case-scroller]") as HTMLElement | null
        let frame = 0
        const update = () => {
            frame = 0
            const rect = box.getBoundingClientRect()
            const viewTop = scroller ? scroller.getBoundingClientRect().top : 0
            const viewH = scroller ? scroller.clientHeight : window.innerHeight
            const viewMid = viewTop + viewH / 2
            const elMid = rect.top + rect.height / 2
            const below = elMid - viewMid
            let shift = 0
            if (lift) {
                // A chapter rises only once it is at the bottom edge, and
                // only through the empty padding of the chapter above it.
                const entering = rect.top - viewTop
                if (entering > viewH - 24) {
                    shift = -Math.min(amount, (entering - (viewH - 24)) * 0.5)
                }
            } else {
                const progress = Math.max(0, Math.min(1, below / (viewH * 0.55)))
                shift = progress * amount
            }
            layer.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`
        }
        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(update)
        }
        update()
        const target: HTMLElement | Window = scroller || window
        target.addEventListener("scroll", onScroll, { passive: true })
        window.addEventListener("resize", onScroll)
        return () => {
            if (frame) cancelAnimationFrame(frame)
            target.removeEventListener("scroll", onScroll)
            window.removeEventListener("resize", onScroll)
            layer.style.transform = ""
        }
    }, [amount, lift, isStatic])

    return (
        <div ref={boxRef}>
            <div ref={layerRef} style={{ willChange: "transform" }}>
                {children}
            </div>
        </div>
    )
}

const COOL = "#1B6B45"
const HEAT = "#A33B24"

type SystemAction = { name: string; delta: string; detail: string }

const SYSTEM_ROLES: {
    role: string
    renewal: SystemAction[]
    collapse: SystemAction[]
}[] = [
    {
        role: "Government",
        renewal: [
            {
                name: "Solar and wind",
                delta: "−3°C",
                detail: "A government action toward renewal. Each press cools the scene by 3°C. Solar panels appear on two rooftops and on five street poles.",
            },
            {
                name: "Urban reforestation",
                delta: "−3°C",
                detail: "A government action toward renewal, 3°C cooler per press. Walkable space grows, two or three buildings turn green, and wind turbines and street solar appear.",
            },
        ],
        collapse: [
            {
                name: "Smart city policy",
                delta: "+4°C",
                detail: "A government action toward collapse, 4°C hotter per press. Four buildings become half-built towers or empty plots.",
            },
        ],
    },
    {
        role: "Community",
        renewal: [
            {
                name: "Neighbourhood gardens",
                delta: "−2°C",
                detail: "A community action toward renewal, 2°C cooler per press. Greenery spreads across balconies and unused rooftops.",
            },
            {
                name: "Rooftop gardens",
                delta: "−2°C",
                detail: "A community action toward renewal, 2°C cooler per press. Gardens appear on the roofs.",
            },
        ],
        collapse: [
            {
                name: "Palm trees",
                delta: "+3°C",
                detail: "A community action toward collapse, 3°C hotter per press. Palms replace the trees that were already there.",
            },
        ],
    },
    {
        role: "Individual",
        renewal: [
            {
                name: "Travel by bus",
                delta: "Cools",
                detail: "An individual action toward renewal. Choosing the bus is one of the choices that cools the road.",
            },
        ],
        collapse: [
            {
                name: "Travel by car",
                delta: "Heats",
                detail: "An individual action toward collapse. Traffic and exhaust smoke build with every press.",
            },
            {
                name: "Central air conditioning",
                delta: "Heats",
                detail: "An individual action toward collapse. Running central air is one of the choices that heats the city.",
            },
        ],
    },
]

const SYSTEM_NOTES: { name: string; detail: string }[] = [
    {
        name: "Palms that heat the city",
        detail: "Palms are a popular greening choice along Karachi's roads, but they are not native, they draw heavily on groundwater, they cast almost no shade, and they do little to cool the air compared with indigenous trees. A green-looking action that makes things worse.",
    },
    {
        name: "A smart city can mean collapse",
        detail: "In practice, top-down, tech-first megaprojects bring glass towers and half-finished developments. Those intensify the heat island rather than relieve it.",
    },
]

function SystemBoard({
    family,
    displayFamily,
    ink,
    accent,
    frames,
}: {
    family: string
    displayFamily: string
    ink: string
    accent: string
    frames?: { section: string; src: string; video?: boolean; label?: string; after?: number }[]
}) {
    const phone = useMediaQuery(PHONE_MQ)
    const room = (frames || []).filter((f) => f.section === "system" && hasMedia(f.src))
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <span
                    aria-hidden
                    style={{ display: "block", width: 36, height: 1, background: ink }}
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
                    System
                </div>
            </div>
            <p
                style={{
                    margin: 0,
                    fontFamily: family,
                    fontSize: BODY_SIZE,
                    fontWeight: 400,
                    lineHeight: BODY_LH,
                    color: BODY_INK,
                }}
            >
                Nine actions, three roles, two futures. Each button is a research-backed claim about how Karachi gets hotter or cooler, translated into a rule the 3D world obeys.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div
                    style={{
                        fontFamily: family,
                        fontSize: 16,
                        fontWeight: 600,
                        lineHeight: 1.35,
                        color: ink,
                    }}
                >
                    Three roles
                </div>
                <p
                    style={{
                        margin: 0,
                        fontFamily: family,
                        fontSize: BODY_SIZE,
                        fontWeight: 400,
                        lineHeight: BODY_LH,
                        color: BODY_INK,
                    }}
                >
                    I split the actions across government, community and individual because the interviews pulled in opposite directions. Urban planners argued that individual action is ineffective without policy. Young people asked why it was on them when the state does nothing. Giving every visitor all three roles answers both. You can see what is in your hands, and what is not.
                </p>
            </div>
            {room.map((f, i) => (
                <FramePiece key={`system-room-${i}`} frame={f} accent={accent} />
            ))}
            <div
                style={{
                    borderRadius: FRAME_RADIUS,
                    background: "#E9E3D6",
                    overflow: "hidden",
                }}
            >
                {phone ? (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {SYSTEM_ROLES.map((group) => (
                            <div
                                key={group.role}
                                style={{ borderTop: "1px solid rgba(17,17,17,0.1)" }}
                            >
                                <RoleMark role={group.role} family={family} ink={ink} />
                                <PoleLabel family={family} tone="cool" label="Renewal" hint="cools the road" />
                                {group.renewal.map((action, i) => (
                                    <ActionRow
                                        key={action.name}
                                        action={action}
                                        tone="cool"
                                        family={family}
                                        ink={ink}
                                        rule={i > 0}
                                    />
                                ))}
                                <PoleLabel family={family} tone="heat" label="Collapse" hint="heats the road" />
                                {group.collapse.map((action, i) => (
                                    <ActionRow
                                        key={action.name}
                                        action={action}
                                        tone="heat"
                                        family={family}
                                        ink={ink}
                                        rule={i > 0}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 44px 1fr",
                            }}
                        >
                            <PoleLabel family={family} tone="cool" label="Renewal" hint="cools the road" align="right" />
                            <div />
                            <PoleLabel family={family} tone="heat" label="Collapse" hint="heats the road" />
                        </div>
                        {SYSTEM_ROLES.map((group) => (
                            <div
                                key={group.role}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 44px 1fr",
                                    borderTop: `1px solid ${accent}55`,
                                }}
                            >
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    {group.renewal.map((action, i) => (
                                        <ActionRow
                                            key={action.name}
                                            action={action}
                                            tone="cool"
                                            family={family}
                                            ink={ink}
                                            align="right"
                                            rule={i > 0}
                                        />
                                    ))}
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderLeft: `1px solid ${accent}`,
                                        borderRight: `1px solid ${accent}`,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily: family,
                                            fontSize: 11,
                                            fontWeight: 600,
                                            letterSpacing: "0.14em",
                                            textTransform: "uppercase",
                                            color: ink,
                                            writingMode: "vertical-rl",
                                            textOrientation: "mixed",
                                        }}
                                    >
                                        {group.role}
                                    </span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    {group.collapse.map((action, i) => (
                                        <ActionRow
                                            key={action.name}
                                            action={action}
                                            tone="heat"
                                            family={family}
                                            ink={ink}
                                            rule={i > 0}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: phone ? "1fr" : "1fr 1fr",
                    gap: phone ? 22 : 28,
                }}
            >
                {SYSTEM_NOTES.map((note) => (
                    <div
                        key={note.name}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                            borderLeft: `2px solid ${HEAT}`,
                            paddingLeft: 14,
                        }}
                    >
                        <div
                            style={{
                                fontFamily: family,
                                fontSize: 16,
                                fontWeight: 600,
                                lineHeight: 1.35,
                                color: ink,
                            }}
                        >
                            {note.name}
                        </div>
                        <p
                            style={{
                                margin: 0,
                                fontFamily: family,
                                fontSize: BODY_SIZE,
                                fontWeight: 400,
                                lineHeight: BODY_LH,
                                color: BODY_INK,
                            }}
                        >
                            {note.detail}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}

function RoleMark({ role, family, ink }: { role: string; family: string; ink: string }) {
    return (
        <div
            style={{
                padding: "14px 16px 4px",
                fontFamily: family,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: ink,
            }}
        >
            {role}
        </div>
    )
}

function PoleLabel({
    family,
    tone,
    label,
    hint,
    align,
}: {
    family: string
    tone: "cool" | "heat"
    label: string
    hint: string
    align?: "right"
}) {
    return (
        <div
            style={{
                padding: align ? "16px 18px 8px" : "16px 18px 8px",
                textAlign: align || "left",
            }}
        >
            <div
                style={{
                    fontFamily: family,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: tone === "cool" ? COOL : HEAT,
                }}
            >
                {label}
            </div>
            <div
                style={{
                    marginTop: 3,
                    fontFamily: family,
                    fontSize: 13,
                    fontWeight: 400,
                    lineHeight: 1.3,
                    color: LABEL,
                }}
            >
                {hint}
            </div>
        </div>
    )
}

function ActionRow({
    action,
    tone,
    family,
    ink,
    align,
    rule,
}: {
    action: SystemAction
    tone: "cool" | "heat"
    family: string
    ink: string
    align?: "right"
    rule?: boolean
}) {
    const numeric = action.delta.includes("°")
    const delta = (
        <div
            style={{
                flex: "none",
                width: 72,
                fontFamily: family,
                fontSize: numeric ? 22 : 12,
                fontWeight: 600,
                letterSpacing: numeric ? "-0.04em" : "0.08em",
                textTransform: numeric ? "none" : "uppercase",
                color: tone === "cool" ? COOL : HEAT,
                lineHeight: 1.1,
                paddingTop: numeric ? 1 : 4,
                textAlign: "center",
            }}
        >
            {action.delta}
        </div>
    )
    const copy = (
        <div style={{ flex: 1, minWidth: 0, textAlign: align || "left" }}>
            <div
                style={{
                    fontFamily: family,
                    fontSize: 16,
                    fontWeight: 600,
                    lineHeight: 1.35,
                    color: ink,
                }}
            >
                {action.name}
            </div>
            <p
                style={{
                    margin: "4px 0 0",
                    fontFamily: family,
                    fontSize: 15,
                    fontWeight: 400,
                    lineHeight: 1.5,
                    color: BODY_INK,
                }}
            >
                {action.detail}
            </p>
        </div>
    )
    return (
        <div
            style={{
                display: "flex",
                gap: 8,
                padding: "14px 16px 16px",
                alignItems: "flex-start",
                borderTop: rule ? "1px solid rgba(17,17,17,0.08)" : "none",
            }}
        >
            {align === "right" ? (
                <>
                    {copy}
                    {delta}
                </>
            ) : (
                <>
                    {delta}
                    {copy}
                </>
            )}
        </div>
    )
}

function StoryBlock({
    kicker,
    body,
    family,
    displayFamily,
    ink,
    frames,
    section,
    accent,
}: {
    kicker: string
    body: string
    family: string
    displayFamily: string
    ink: string
    muted: string
    frames?: { section: string; src: string; video?: boolean; label?: string; after?: number }[]
    section?: string
    accent?: string
}) {
    const blocks = hasText(body) ? storyBlocks(body) : []
    const inserts = (frames || []).filter(
        (f) => section && f.section === section && hasMedia(f.src),
    )
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
                <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                    {blocks.flatMap((block, i) => {
                        const here = inserts.filter((f) => f.after === i + 1)
                        return [
                            <div
                                key={`b-${i}`}
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
                            </div>,
                            ...here.map((f, n) => (
                                <FramePiece key={`m-${i}-${n}`} frame={f} accent={accent || ""} />
                            )),
                        ]
                    })}
                </div>
            ) : null}
        </div>
    )
}

function FramePiece({
    frame,
    accent,
}: {
    frame: { src: string; video?: boolean; label?: string }
    accent: string
}) {
    return frame.video ? (
        <VideoFrame src={frame.src} accent={accent} label={frame.label || ""} />
    ) : (
        <MediaFrame src={frame.src} accent={accent} label={frame.label || ""} tall />
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
    const motion = useContext(CaseMotion)
    if (!url) return null
    return (
        <Parallax amount={motion.media} lift={motion.lift}>
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
        </Parallax>
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
    const motion = useContext(CaseMotion)
    if (!url) return null
    return (
        <Parallax amount={motion.media} lift={motion.lift}>
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
        </Parallax>
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
        title: "Sooraj Nagar",
        subtitle: "Speculative climate installation",
        role: "Project Lead, Design Researcher and Experience Designer, undergraduate thesis at IVSAA",
        year: "2025",
        timeline: "9 months, from research to a public installation",
        tools: "Participatory futures workshops, surveys, expert interviews, Futures Wheel, XF Ladder, LOOPY, Unity 3D, SketchUp, TouchDesigner, Figma, FigJam, and a physical button panel with projection",
        collaborators: "Nabeel Ashraf, 3D modelling. Umair Abbas, Unity development. Advisor: Fatin Nawaz.",
        overview: "92% of young Karachiites I surveyed believe their city's climate future is bleak. I led a year-long research and design project that let them press a button, watch Shahra-e-Faisal heat up or heal by 2120, and leave knowing which actions actually matter.",
        context: "Sooraj Nagar, City of the Sun, is a speculative, interactive installation about Karachi's climate future. Visitors stand in front of a projected 3D model of Shahra-e-Faisal, the city's main artery, and press physical buttons for nine real climate actions. The actions sit across three roles: government, community and individual. Every press shifts the road toward one of two futures in the year 2120, a future of collapse or a future of renewal.\n\nThe project started with a question. If every headline says we are doomed, what does that belief do to how we act today? Nine months of research later, it became an immersive experience, a future-news website, a take-home zine and an online community, all designed to turn climate dread into agency.",
        problem: "Living through Karachi's urban heat island has convinced young Karachiites that climate decline is inevitable. That belief limits their vision of a hopeful future and convinces them they are powerless.\n\n92% of 65 survey respondents, ages 20 to 35, described the climate future as bad. The only optimistic answers came from people living in the US, UK or Australia.\n\nIn workshops, people drew Karachi on fire or turned to desert. One wrote, \"I'm leaving the country before it kills me.\"\n\nKarachi's 2015 heatwave killed 1,181 people in a week, the deadliest in Pakistan in over 50 years. Heat is the climate impact residents feel most, every day.\n\nPakistani institutions are stuck firefighting present crises. There is almost no local futures work, and global future visions either leave out the Global South or cast it as the dystopia.\n\nWhy it matters\nHopelessness is not neutral. It produces disengagement and emigration. A population that cannot picture a liveable future will not push for the policies or habits that would create one. The design challenge was to make a better future feel real, local and reachable, without preaching.\n\nHow might we let people envision and experience Karachi's heat across more than one future, so the warning about the present arrives with a reason to hope?",
        research: "Six months of mixed-method research shaped every decision in the build. I designed and ran each stream myself, then brought it together on one FigJam board that became the project's source of truth.\n\nSurvey, 65 people\nPeople aged 20 to 35, in Karachi and in the diaspora. The pessimism was near-universal among people still in the city, 92%, and it tracked geography rather than generation.\n\nFutures workshop\nUniversity students in Karachi. Heat came through as the climate impact people feel in their bodies, and the future showed up as fire, desert and suffocation.\n\nFutures worksheets\n32 responses from young adults, filled in remotely. The same two themes held outside the workshop room.\n\nUrban design interviews\nArif Hasan, architect, and Farhan Anwar, urban planning and sustainability. They reframed responsibility. Individual action on its own does not cool a city. State policy has to be in the system. India's GRIHA rating came up as one example of policy that actually sets a standard.\n\nClimate and futures interviews\nAvinash Kumar of Greenpeace India, Talha Kehar of Earth's Heartbeat, Sahibzada Mayed, Faizan Raza of Ideate Innovations, and Aqdas Fatima of Karachi Urban Lab, plus a Culture Hacks Lab webinar. They held the Global South framing and pushed for the dystopia to be shown honestly, not softened.\n\nTwo lines from those conversations stayed with the work.\n\n\"For the West, climate change is a near future. We are going through it.\"\n\n\"People need to see how bad things can get.\"\n\nUrban heat\nI traced Karachi's heat to four drivers. Asphalt and concrete have replaced land that used to absorb less heat. Vehicles and air conditioners dump waste heat into the street. Vegetation loss cuts the cooling that comes from transpiration. Dense, glass-faced towers trap heat and block the wind. The Handbook on Urban Heat Management supplied evidence for cooling strategies that suit the Global South: green corridors, neighbourhood gardens and urban reforestation.\n\nTheory\nMurray Bookchin's social ecology: these crises are rooted in social hierarchy, so the response has to be collective. Arturo Escobar's Designs for the Pluriverse: many local futures, not one Western one. Mitchell and Chaudhury's Worlding Beyond the End of the World: for colonised communities the apocalypse already happened, and their futures are built on survival rather than fear. Anna Tsing's The Mushroom at the End of the World: hope can be messy and still real. Reina-Rozo on solarpunk as a decolonial technology.\n\nPrecedents\nLiam Young's Planetary Redesign, Slow Factory's Applied Utopia, Kaspersky's Earth 2050, Puffball Studios' Sheh-re-Tabassum, Weathering with You, A Psalm for the Wild-Built and The Lorax. The gap across all of them was the same. Almost no hopeful future is set in Pakistan.\n\nDestruction as the default\nYoung people equate the future with destruction. The pessimism was not an opinion. It was the starting point.\n\nHeat is the shared language\nBurning, suffocating, fainting. Everyone already had a bodily reference for climate change.\n\nResponsibility, split honestly\nBlaming individuals alienates people. Blaming only the state breeds passivity. The design had to show both.\n\nAbstraction does not land\nPeople needed to see their own city, not a metaphor. Testing made that impossible to ignore.",
        process: "Listen first\nSurveyed 65 people, ran a futures workshop and collected 32 worksheets to map how Karachi imagines its future.\n\nAsk the experts\nInterviewed 7 urban planners, climate activists and futures researchers to ground the speculation in policy reality.\n\nBuild two futures\nUsed the Futures Wheel and XF Ladder to world-build a future of collapse and a future of renewal for 2120.\n\nModel the system\nMapped how each action ripples through heat, air and greenery in LOOPY, then turned that map into the logic behind the buttons.\n\nPrototype, fail, re-root\nTested an abstract TouchDesigner version, learned it did not land, and rebuilt the experience on a real Karachi road in Unity.\n\nExtend beyond the room\nDesigned a future-news website, a take-home zine and an Instagram community so the experience did not end at the exit.",
        goals: "Make a hopeful Karachi feel physically real, not theoretical.\n\nGive visitors agency by letting their own choices determine the city's outcome.\n\nTeach, without preaching, which actions genuinely cool a city and which only look green.\n\nLeave people with a next step they can take that week.",
        constraints: "One designer leading a year-long thesis on an academic calendar. No budget for commercial hardware or a dedicated venue. 3D modelling and Unity development sat outside my core skills, so I recruited two collaborators and directed their work. A first-time visitor had to understand the installation within seconds, with no one there to explain it.\n\nTimeline\nResearch and conceptualisation took six months. The installation took six weeks to build. Branding and the design system took four weeks, the website a week, and the zine a week.",
        system: "Nine actions, three roles, two futures. Each button is a research-backed claim about how Karachi gets hotter or cooler, translated into a rule the 3D world obeys.\n\nThree roles\nI split the actions across government, community and individual because the interviews pulled in opposite directions. Urban planners argued that individual action is ineffective without policy. Young people asked why it was on them when the state does nothing. Giving every visitor all three roles answers both. You can see what is in your hands, and what is not.\n\nSolar and wind\nA government action toward renewal. Each press cools the scene by 3°C. Solar panels appear on two rooftops and on five street poles.\n\nUrban reforestation\nA government action toward renewal, 3°C cooler per press. Walkable space grows, two or three buildings turn green, and wind turbines and street solar appear.\n\nSmart city policy\nA government action toward collapse, 4°C hotter per press. Four buildings become half-built towers or empty plots.\n\nNeighbourhood gardens\nA community action toward renewal, 2°C cooler per press. Greenery spreads across balconies and unused rooftops.\n\nRooftop gardens\nA community action toward renewal, 2°C cooler per press. Gardens appear on the roofs.\n\nPalm trees\nA community action toward collapse, 3°C hotter per press. Palms replace the trees that were already there.\n\nTravel by bus\nAn individual action toward renewal. Choosing the bus is one of the choices that cools the road.\n\nTravel by car\nAn individual action toward collapse. Traffic and exhaust smoke build with every press.\n\nCentral air conditioning\nAn individual action toward collapse. Running central air is one of the choices that heats the city.\n\nPalms that heat the city\nPalms are a popular greening choice along Karachi's roads, but they are not native, they draw heavily on groundwater, they cast almost no shade, and they do little to cool the air compared with indigenous trees. A green-looking action that makes things worse.\n\nA smart city can mean collapse\nIn practice, top-down, tech-first megaprojects bring glass towers and half-finished developments. Those intensify the heat island rather than relieve it.",
        experience: "Two futures for 2120\nUsing the Futures Wheel and the Experiential Futures Ladder, I traced the second- and third-order consequences of today's choices and built two versions of Shahra-e-Faisal. In the future of collapse, unchecked tech consumption and heat have made the air toxic: AC exhaust, cracked asphalt and a permanent heat fog. In the future of renewal, the city invested in heat-resilient infrastructure: 30% green cover, rooftop gardens, walkable streets, wind and solar.\n\nThe first prototype failed\nThe first build was a TouchDesigner piece. Four community actions changed an abstract picture of the air. I tested it with people in their twenties and thirties. The feedback was blunt. It was not understandable until someone explained it. If a button says solar panels, people expected to see the panels, not only the air changing. Testers also wanted to know who is responsible, the public or the authorities.\n\nRebuilt on Shahra-e-Faisal\nI threw out the abstraction and rebuilt the experience on Shahra-e-Faisal, the road most Karachiites have sat in traffic, flooded or baked on. The Unity scene starts in present-day Karachi. Each press of a physical button spawns a visible consequence, panels, gardens, smoke or half-built towers, and moves a live temperature readout. Testing is also what pushed the piece from four community actions to nine actions across three roles. A physical button panel fed a laptop running the Unity scene, and a projector filled the room.\n\nFive ways a press confirms itself\nEvery press answered through five channels, so no one was left guessing. The tactile button glowed. A message popped up. A short line rooted the action in real life, such as \"The palm trees still stand tall. Everyone else is looking for shade.\" Sound played. A temperature reading climbed or fell.\n\nA mixed ending\nThe journey was deliberately open. Visitors could end in a mixed future, dystopian and hopeful elements side by side, because that is closer to how real change happens. The experience closes on a call to action and a QR code to join the Sooraj Nagar community.",
        beyond: "An installation lasts an afternoon. I designed three touchpoints so the idea kept working after people left.\n\nFuture's Archive\nA research-based news archive from 2120. Visitors switch between the collapse archive and the renewal archive and read headlines from each future about Shahra-e-Faisal. It built anticipation before the installation, and it let people explore the futures on their own devices.\n\nZine and manifesto kit\nEvery visitor left with a printed guide to the real actions behind each button, plus a manifesto kit. To work toward a renewed future, we first have to imagine it.\n\nThe community\nThe @soorajnagarkarachi Instagram turns visitors into a community that keeps reimagining the city.",
        decision1: "A real road, not an abstraction\nI rebuilt the whole experience on a real Karachi road instead of refining the abstract prototype. It meant a much heavier 3D build inside a six-week window, but testing showed that abstraction broke comprehension, and comprehension was the point.",
        decision2: "Three roles on every button\nEvery visitor could act as government, community and individual, rather than only as a private person. The expert interviews showed that an individual-only frame is both ineffective and alienating. Young people needed to see where their power ends and the state's begins.",
        decision3: "Hope had to include the harm\nI kept buttons that make things worse, including ones that look green. Palm trees and smart city policy both push toward collapse. A hope-only experience would have been easy to dismiss. Showing the trade-offs is what made the hopeful future believable.",
        decision4: "Specialists, with me directing\nI brought in specialists rather than doing everything myself. I scoped the 3D modelling and the Unity development as separate workstreams, wrote the button-logic spec they built against, and kept research, narrative and the experience with me. That is how one person shipped an installation, a website, a zine and a community in one academic year.",
        outcome: "Sooraj Nagar was exhibited as my final-year thesis at the Indus Valley School of Art and Architecture in Karachi.\n\nWhat it proved\nA research-led, locally rooted experience can move young people from \"Karachi is doomed\" to \"here is what would change it\". The same method can travel to any city facing extreme heat.",
        reflection: "Measure the shift\nI would measure the change, not only watch it. Two questions before and after, \"How hopeful do you feel about Karachi's future?\", would have turned strong anecdotes into evidence.\n\nBring policy in earlier\nFarhan Anwar's interview changed the whole system. Organisations such as Karachi Urban Lab, or the Sindh government, could have co-owned the actions and carried them forward.\n\nA method, not a one-off\nSooraj Nagar is a method. Participatory futures research, a research-backed model of actions, and an immersive public touchpoint can be run for any heat-stressed city in the Global South.",
        accent: "#7457C9",
        slug: "fintech-app",
        longform: true,
        ...EMPTY_MEDIA,
        storyVideo:
            "https://cdn.jsdelivr.net/gh/nabiasheikh14-creator/portfolio@fbccb08ab644d59b5951a7bd77a5888666bd4914/framer/films/sooraj-reel.mp4",
        frames: [
            {
                section: "research",
                after: 10,
                label: "Research board",
                src: "https://cdn.jsdelivr.net/gh/nabiasheikh14-creator/portfolio@34b1200b65bf191f3a52150972c2c5644f5dba5c/framer/case/sooraj/research.jpg",
            },
            {
                section: "approach",
                after: 6,
                label: "Project architecture",
                src: "https://cdn.jsdelivr.net/gh/nabiasheikh14-creator/portfolio@34b1200b65bf191f3a52150972c2c5644f5dba5c/framer/case/sooraj/architecture.jpg",
            },
            {
                section: "system",
                after: 6,
                label: "The room",
                src: "https://cdn.jsdelivr.net/gh/nabiasheikh14-creator/portfolio@34b1200b65bf191f3a52150972c2c5644f5dba5c/framer/case/sooraj/room.jpg",
            },
            {
                section: "experience",
                after: 1,
                label: "Two futures",
                src: "https://cdn.jsdelivr.net/gh/nabiasheikh14-creator/portfolio@34b1200b65bf191f3a52150972c2c5644f5dba5c/framer/case/sooraj/futures.jpg",
            },
            {
                section: "experience",
                after: 4,
                label: "Room mockup",
                video: true,
                src: "https://cdn.jsdelivr.net/gh/nabiasheikh14-creator/portfolio@d9417c4df01d96d017fe3248e066e792521acaf6/framer/films/sooraj-room.mp4",
            },
            {
                section: "beyond",
                after: 2,
                label: "Future's Archive website",
                src: "https://cdn.jsdelivr.net/gh/nabiasheikh14-creator/portfolio@34b1200b65bf191f3a52150972c2c5644f5dba5c/framer/case/sooraj/website.jpg",
            },
        ],
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
            "FRED.AI",
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
            "https://cdn.jsdelivr.net/gh/nabiasheikh14-creator/portfolio@728b0f26b130f1d4e2b1213c8a934fd7acadaa96/framer/case/fred/fred-cover.jpg",
        processImage:
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
            "https://cdn.jsdelivr.net/gh/nabiasheikh14-creator/portfolio@72eb47359c0f2ee37ca957db816338ca6bd4edc3/framer/films/fred-reel.mp4",
        storyVideo:
            "https://cdn.jsdelivr.net/gh/nabiasheikh14-creator/portfolio@72eb47359c0f2ee37ca957db816338ca6bd4edc3/framer/films/fred-reel.mp4",
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
