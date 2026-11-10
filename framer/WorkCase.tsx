import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type MouseEvent as ReactMouseEvent,
    type PointerEvent as ReactPointerEvent,
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
    '"Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
const DEFAULT_ANNIE = '"Annie Use Your Telescope", "Bradley Hand", cursive'
const CREAM = "#F3EFE6"
const INK = "#111111"
const MUTED = "#555555"
const LABEL = "#888888"
const PHONE_MQ = "(max-width: 809.98px)"
const LEFT_COL = "max(240px, 28vw)"
const FRAME_RADIUS = 12
const OUTLINE = "1.5px solid #111111"
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
    const family = SANS
    const displayFamily = SANS
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
            const slugKey =
                rawSlug === "chutney-studios"
                    ? "voice-ai"
                    : rawSlug === "fintech-app"
                      ? "sooraj-nagar"
                      : rawSlug
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
                accent: slugKey === "sooraj-nagar" ? "#2C6BE0" : replaced ? fb.accent : it.accent || fb.accent,
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
        list.find((p) => p.slug === (slug === "chutney-studios" ? "voice-ai" : slug === "fintech-app" ? "sooraj-nagar" : slug)) ||
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
                href="https://fonts.googleapis.com/css2?family=Annie+Use+Your+Telescope&family=Outfit:wght@300;400;500;600;700&display=swap"
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
            <SectionSheet
                nav={nav}
                activeId={activeSection}
                onNavigate={scrollToSection}
                phone={isPhone}
                longform={Boolean(project.longform)}
                family={family}
            />
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

function SectionSheet({
    nav,
    activeId,
    onNavigate,
    phone,
    longform,
    family,
}: {
    nav: CaseNavItem[]
    activeId: string
    onNavigate: (id: string) => void
    phone: boolean
    longform: boolean
    family: string
}) {
    const [open, setOpen] = useState(false)
    const active = nav.find((item) => item.id === activeId) || nav[0]
    if (!active) return null
    // Sit in the left column, using the same side insets as the sidebar type.
    const place: CSSProperties = phone
        ? { left: 12, right: 12 }
        : longform
          ? { left: 40, width: 272 }
          : { left: "3.2vw", width: `calc(${LEFT_COL} - 5.4vw)` }
    return (
        <>
            {open ? (
                <button
                    type="button"
                    aria-label="Close sections"
                    onClick={() => setOpen(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 30,
                        border: "none",
                        background: "rgba(28, 27, 24, 0.08)",
                        cursor: "pointer",
                    }}
                />
            ) : null}
            <div
                style={{
                    position: "fixed",
                    ...place,
                    bottom: 20,
                    zIndex: 40,
                    background: "#FBF9F5",
                    border: "1px solid #DAD4C8",
                    borderRadius: 20,
                    boxShadow: "0 16px 40px rgba(28, 27, 24, 0.12)",
                    overflow: "hidden",
                    display: "grid",
                    gridTemplateRows: open ? "auto 1fr" : "auto 0fr",
                    transition: "grid-template-rows 0.32s ease",
                }}
            >
                <button
                    type="button"
                    aria-expanded={open}
                    aria-controls="case-section-sheet"
                    onClick={() => setOpen((value) => !value)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        width: "100%",
                        minWidth: 0,
                        minHeight: 52,
                        padding: "10px 14px",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        fontFamily: family,
                        color: "#1C1B18",
                        textAlign: "left",
                    }}
                >
                    <span
                        aria-hidden
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: 99,
                            background: "#E3E9FA",
                            color: "#2C6BE0",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flex: "none",
                            transform: open ? "rotate(180deg)" : "none",
                            transition: "transform 0.32s ease",
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M3 9 L7 5 L11 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.96px", textTransform: "uppercase", color: "#6A665D" }}>
                        Sections
                    </span>
                    <span style={{ marginLeft: "auto", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 15, fontWeight: 600 }}>{active.label}</span>
                </button>
                <div style={{ overflow: "hidden" }}>
                    <div
                        id="case-section-sheet"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            padding: "4px 8px 12px",
                            maxHeight: "46vh",
                            overflowY: "auto",
                        }}
                    >
                        {nav.map((item) => {
                            const on = item.id === activeId
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                        onNavigate(item.id)
                                        setOpen(false)
                                    }}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        minHeight: 44,
                                        padding: "8px 10px",
                                        border: "none",
                                        borderRadius: 12,
                                        background: on ? "#E3E9FA" : "transparent",
                                        cursor: "pointer",
                                        fontFamily: family,
                                        fontSize: 15,
                                        fontWeight: on ? 600 : 400,
                                        color: on ? "#1C1B18" : "#6A665D",
                                        textAlign: "left",
                                    }}
                                >
                                    <span
                                        aria-hidden
                                        style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: 99,
                                            background: on ? "#2C6BE0" : "transparent",
                                            border: on ? "none" : "1px solid #DAD4C8",
                                            flex: "none",
                                        }}
                                    />
                                    {item.label}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </>
    )
}

function DesktopCase({
    project,
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
                    bottom: 92,
                    zIndex: 3,
                    width: project.longform ? 340 : LEFT_COL,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    padding: project.longform
                        ? "108px 28px 28px 40px"
                        : "108px 2.2vw 28px 3.2vw",
                    boxSizing: "border-box",
                    overflow: "auto",
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
                        flex: project.longform ? "none" : undefined,
                        minHeight: undefined,
                        overflowY: "visible",
                    }}
                >
                    <h1
                        style={{
                            margin: project.longform ? "0 0 12px" : "0 0 18px",
                            fontFamily: project.longform ? family : displayFamily,
                            fontSize: project.longform
                                ? 40
                                : "clamp(34px, 3.6vw, 52px)",
                            fontWeight: project.longform ? 700 : 400,
                            letterSpacing: project.longform ? "-1.2px" : "-0.01em",
                            lineHeight: project.longform ? 1.1 : 1.05,
                            color: ink,
                        }}
                    >
                        {project.title}
                    </h1>
                    {project.overview ? (
                        <p
                            style={{
                                margin: project.longform ? "0 0 10px" : "0 0 28px",
                                fontFamily: family,
                                fontSize: project.longform ? 15 : BODY_SIZE,
                                fontWeight: 400,
                                lineHeight: 1.45,
                                color: muted,
                                maxWidth: 340,
                            }}
                        >
                            {project.longform && project.overview.startsWith("92% of young Karachiites I surveyed") ? (
                                <>
                                    <span style={{ fontWeight: 600, color: ink }}>92% of young Karachiites I surveyed </span>
                                    {project.overview.slice("92% of young Karachiites I surveyed".length)}
                                </>
                            ) : (
                                project.overview
                            )}
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
            </aside>

            <div
                ref={scrollerRef}
                data-case-scroller="true"
                style={{
                    position: "absolute",
                    top: 88,
                    right: 0,
                    bottom: 0,
                    left: project.longform ? 340 : LEFT_COL,
                    zIndex: 2,
                    overflowX: "hidden",
                    overflowY: "auto",
                    WebkitOverflowScrolling: "touch",
                    overscrollBehavior: "contain",
                    scrollbarWidth: "none",
                    padding: "20px 40px 56px 40px",
                    boxSizing: "border-box",
                    background: CREAM,
                    backgroundColor: CREAM,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0,
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
                padding: "140px 18px 140px",
                boxSizing: "border-box",
                background: CREAM,
            }}
        >
            <h1
                style={{
                    margin: "0 0 16px",
                    fontFamily: project.longform ? family : displayFamily,
                    fontSize: project.longform ? 40 : 36,
                    fontWeight: project.longform ? 700 : 400,
                    letterSpacing: project.longform ? "-1.2px" : "-0.01em",
                    lineHeight: project.longform ? 1.1 : 1.05,
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
                    {project.longform && project.overview.startsWith("92% of young Karachiites I surveyed") ? (
                        <>
                            <span style={{ fontWeight: 600, color: ink }}>92% of young Karachiites I surveyed </span>
                            {project.overview.slice("92% of young Karachiites I surveyed".length)}
                        </>
                    ) : (
                        project.overview
                    )}
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

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0,
                    marginTop: 36,
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
    const when = [project.year, project.timeline].filter(Boolean).join(" · ")
    const bits = [
        when && { k: "Date", v: when },
        project.role && { k: "Role", v: project.role },
        project.tools && { k: "Tools", v: project.tools },
        project.collaborators && { k: "Collaborators", v: project.collaborators },
    ].filter(Boolean) as { k: string; v: string }[]
    if (!bits.length) return null
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: compact ? 12 : 16 }}>
            {bits.map((b) => (
                <div key={b.k}>
                    <div
                        style={{
                            fontFamily: compact ? family : displayFamily,
                            fontSize: compact ? 12 : 18,
                            fontWeight: compact ? 600 : 400,
                            letterSpacing: compact ? "0.96px" : "0",
                            textTransform: compact ? "uppercase" : "none",
                            color: compact ? "#6A665D" : LABEL,
                            marginBottom: 4,
                            lineHeight: 1.2,
                        }}
                    >
                        {b.k}
                    </div>
                    {b.k === "Tools" ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: compact ? 4 : 6 }}>
                            {b.v
                                .split(",")
                                .map((part) => part.trim().replace(/^and\s+/i, ""))
                                .filter((part) => part && !/physical button panel/i.test(part))
                                .map((part) => (
                                    <span
                                        key={part}
                                        style={{
                                            fontFamily: family,
                                            fontSize: compact ? 13 : 12,
                                            lineHeight: 1.3,
                                            color: compact ? "#6A665D" : ink,
                                            border: "1px solid rgba(17,17,17,0.16)",
                                            borderRadius: 999,
                                            padding: compact ? "3px 8px" : "5px 10px",
                                        }}
                                    >
                                        {part}
                                    </span>
                                ))}
                        </div>
                    ) : (
                    <div
                        style={{
                            fontFamily: family,
                            fontSize: compact ? 15 : 14,
                            fontWeight: 400,
                            lineHeight: compact ? 1.35 : 1.45,
                            color: ink,
                        }}
                    >
                        {b.v}
                    </div>
                    )}
                </div>
            ))}
        </div>
    )
}

const STACK_INSET = 40
const STACK_INSET_PHONE = 18

function stackStyle(lead: boolean, phone: boolean): CSSProperties {
    const inset = phone ? STACK_INSET_PHONE : STACK_INSET
    return {
        position: "relative",
        zIndex: 2,
        background: CREAM,
        marginTop: lead ? 0 : phone ? -48 : -72,
        marginLeft: -inset,
        marginRight: -inset,
        paddingTop: lead ? 0 : phone ? 28 : 40,
        paddingBottom: phone ? 112 : 168,
        paddingLeft: inset,
        paddingRight: inset,
        borderTop: lead ? "none" : `1px solid ${JOURNAL_LINE}`,
        boxShadow: lead ? "none" : "0 -16px 28px rgba(28, 27, 24, 0.05)",
    }
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
    const phone = useMediaQuery(PHONE_MQ)
    return (
        <section
            ref={setSectionRef(id)}
            id={id}
            style={motion.cover ? stackStyle(Boolean(lead), phone) : undefined}
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
    const phone = useMediaQuery(PHONE_MQ)
    const motion = {
        lift: true,
        section: 48,
        media: p.longform ? 110 : 64,
        cover: true,
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
            {p.slug === "sooraj-nagar" && p.longform ? (
                <SoorajSections
                    project={p}
                    setSectionRef={setSectionRef}
                    accent={a}
                    ink={ink}
                    muted={muted}
                    family={family}
                    displayFamily={displayFamily}
                />
            ) : (
            <>
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
            </>
            )}

            {related.length > 0 && (
                <section
                    style={{
                        ...stackStyle(false, phone),
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                    }}
                >
                    <p
                        style={{
                            margin: 0,
                            fontFamily: family,
                            fontSize: 12,
                            fontWeight: 600,
                            letterSpacing: "0.96px",
                            textTransform: "uppercase",
                            color: JOURNAL_MUTED,
                            lineHeight: 1.3,
                        }}
                    >
                        More work
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", borderTop: `1px solid ${JOURNAL_LINE}` }}>
                        {related.map((r) => (
                            <a
                                key={r.slug}
                                href={`${basePath}/${r.slug}`}
                                style={{
                                    display: "flex",
                                    alignItems: "baseline",
                                    justifyContent: "space-between",
                                    gap: 16,
                                    textDecoration: "none",
                                    color: ink,
                                    background: "transparent",
                                    borderBottom: `1px solid ${JOURNAL_LINE}`,
                                    padding: "20px 4px",
                                }}
                            >
                                <span
                                    style={{
                                        fontFamily: family,
                                        fontSize: 24,
                                        fontWeight: 600,
                                        letterSpacing: "-0.36px",
                                        lineHeight: 1.2,
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
                // The next chapter lags while it is still low in the view,
                // then catches the one above it so the sheets stack.
                const entering = rect.top - viewTop
                if (entering > viewH * 0.42) {
                    shift = Math.min(amount, (entering - viewH * 0.42) * 0.45)
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

type StepItem = { label: string; detail?: string; pivot?: boolean }
type StatItem = { value: string; caption: string }
type CardItem = { title: string; body: string; image?: string }
type DecisionPart = { label: string; text: string }
type DecisionItem = { title: string; parts: DecisionPart[] }
type TierAction = { name: string; delta: string; detail: string }
type TierGroup = { role: string; renewal: TierAction[]; collapse: TierAction[] }
type NoteItem = { title: string; body: string }

const SOORAJ_UI = {
    process: [
        { label: "Question" },
        { label: "Research" },
        { label: "TouchDesigner prototype", pivot: true },
        { label: "Karachi build" },
        { label: "Public installation" },
    ] as StepItem[],
    approach: [
        { label: "Listen first", detail: "Surveyed 65 people, ran a futures workshop and collected 32 worksheets." },
        { label: "Ask the experts", detail: "Interviewed 7 urban planners, climate activists and futures researchers." },
        { label: "Build two futures", detail: "A future of collapse and a future of renewal for 2120." },
        { label: "Model the system", detail: "Mapped each action through heat, air and greenery, then into the buttons." },
        { label: "Prototype, fail, re-root", detail: "An abstract TouchDesigner test failed. The rebuild sits on a real Karachi road." },
        { label: "Extend beyond the room", detail: "A future-news website, a take-home zine and an Instagram community." },
    ] as StepItem[],
    stats: [
        { value: "92%", caption: "described the climate future as bad" },
        { value: "65", caption: "people surveyed, ages 20 to 35" },
        { value: "32", caption: "futures worksheets, filled in remotely" },
        { value: "7", caption: "expert interviews" },
    ] as StatItem[],
    outcomeStats: [
        { value: "9", caption: "months, from research to the installation" },
        { value: "6", caption: "weeks to build the room" },
        { value: "2", caption: "futures for Shahra-e-Faisal" },
        { value: "3", caption: "touchpoints after people leave" },
    ] as StatItem[],
    methods: [
        { title: "Survey", body: "65 people, aged 20 to 35, in Karachi and in the diaspora. The pessimism tracked where they lived." },
        { title: "Futures workshop", body: "University students drew the future as fire, desert and suffocation. Heat was what they felt in their bodies." },
        { title: "Futures worksheets", body: "32 remote responses from young adults. The same two themes held outside the workshop room." },
        { title: "Urban design interviews", body: "Arif Hasan and Farhan Anwar. Individual action does not cool a city unless state policy is in the system." },
        { title: "Climate and futures interviews", body: "Five practitioners and a webinar. They asked for the dystopia to be shown honestly, not softened." },
    ] as CardItem[],
    findings: [
        { title: "Destruction as the default", body: "Young people equate the future with destruction. That pessimism was the starting point." },
        { title: "Heat is the shared language", body: "Burning, suffocating, fainting. Everyone already had a bodily reference for climate change." },
        { title: "Responsibility, split honestly", body: "Blaming individuals alienates people. Blaming only the state breeds passivity." },
        { title: "Abstraction does not land", body: "People needed to see their own city, not a metaphor." },
    ] as CardItem[],
    flow: [
        { label: "Button", detail: "A physical panel for the nine actions." },
        { label: "Laptop", detail: "Unity runs the Shahra-e-Faisal scene." },
        { label: "Projector", detail: "The road fills the room." },
    ] as StepItem[],
    tiers: [
        {
            role: "Government",
            renewal: [
                { name: "Solar and wind", delta: "−3°C", detail: "Solar panels appear on two rooftops and on five street poles." },
                { name: "Urban reforestation", delta: "−3°C", detail: "Walkable space grows, buildings turn green, and wind and street solar appear." },
            ],
            collapse: [
                { name: "Smart city policy", delta: "+4°C", detail: "Four buildings become half-built towers or empty plots." },
            ],
        },
        {
            role: "Community",
            renewal: [
                { name: "Neighbourhood gardens", delta: "−2°C", detail: "Greenery spreads across balconies and unused rooftops." },
                { name: "Rooftop gardens", delta: "−2°C", detail: "Gardens appear on the roofs." },
            ],
            collapse: [
                { name: "Palm trees", delta: "+3°C", detail: "Palms replace the trees that were already there." },
            ],
        },
        {
            role: "Individual",
            renewal: [
                { name: "Travel by bus", delta: "Cools", detail: "Choosing the bus is one of the choices that cools the road." },
            ],
            collapse: [
                { name: "Travel by car", delta: "Heats", detail: "Traffic and exhaust smoke build with every press." },
                { name: "Central air conditioning", delta: "Heats", detail: "Running central air is one of the choices that heats the city." },
            ],
        },
    ] as TierGroup[],
    notes: [
        { title: "Palms that heat the city", body: "Palms are a popular greening choice along Karachi's roads, but they are not native, they draw heavily on groundwater, they cast almost no shade, and they do little to cool the air compared with indigenous trees. A green-looking action that makes things worse." },
        { title: "A smart city can mean collapse", body: "In practice, top-down, tech-first megaprojects bring glass towers and half-finished developments. Those intensify the heat island rather than relieve it." },
    ] as NoteItem[],
    decisions: [
        {
            title: "A real road, not an abstraction",
            parts: [
                { label: "Decision", text: "Rebuild the whole experience on Shahra-e-Faisal instead of refining the abstract prototype." },
                { label: "Why", text: "Testing showed that abstraction broke comprehension, and comprehension was the point." },
                { label: "Trade-off", text: "A much heavier 3D build inside a six-week window." },
            ],
        },
        {
            title: "Three roles on every button",
            parts: [
                { label: "Decision", text: "Every visitor can act as government, community and individual, rather than only as a private person." },
                { label: "Why", text: "An individual-only frame is both ineffective and alienating." },
                { label: "Trade-off", text: "The piece has to show where a visitor's power ends and the state's begins." },
            ],
        },
        {
            title: "Hope had to include the harm",
            parts: [
                { label: "Decision", text: "Keep buttons that make things worse, including ones that look green." },
                { label: "Why", text: "A hope-only experience would have been easy to dismiss." },
                { label: "Trade-off", text: "Palm trees and smart city policy both push the road toward collapse." },
            ],
        },
        {
            title: "Specialists, with me directing",
            parts: [
                { label: "Decision", text: "Scope the 3D modelling and the Unity development as separate workstreams." },
                { label: "Why", text: "One person still had to ship an installation, a website, a zine and a community in one academic year." },
                { label: "Trade-off", text: "Research, narrative and the experience stayed with me. The build did not." },
            ],
        },
    ] as DecisionItem[],
    reflections: [
        { title: "Measure the shift", body: "I would measure the change, not only watch it. Two questions before and after, \"How hopeful do you feel about Karachi's future?\", would have turned strong anecdotes into evidence." },
        { title: "Bring policy in earlier", body: "Farhan Anwar's interview changed the whole system. Organisations such as Karachi Urban Lab, or the Sindh government, could have co-owned the actions and carried them forward." },
        { title: "A method, not a one-off", body: "Sooraj Nagar is a method. Participatory futures research, a research-backed model of actions, and an immersive public touchpoint can be run for any heat-stressed city in the Global South." },
    ] as { title: string; body: string }[],
}

function SectionKicker({
    kicker,
    displayFamily,
    ink,
}: {
    kicker: string
    displayFamily: string
    ink: string
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
    )
}

function BodyCopy({ family, children }: { family: string; children: ReactNode }) {
    return (
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
            {children}
        </p>
    )
}

function StatBlock({
    value,
    caption,
    family,
    displayFamily,
    ink,
}: StatItem & { family: string; displayFamily: string; ink: string }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
            <div
                style={{
                    fontFamily: displayFamily,
                    fontSize: 52,
                    fontWeight: 400,
                    lineHeight: 0.95,
                    color: ink,
                }}
            >
                {value}
            </div>
            <div
                style={{
                    fontFamily: family,
                    fontSize: 13,
                    fontWeight: 400,
                    lineHeight: 1.4,
                    color: LABEL,
                    maxWidth: 180,
                }}
            >
                {caption}
            </div>
        </div>
    )
}

function StepCopy({
    step,
    index,
    family,
    displayFamily,
    ink,
    accent,
    align,
}: {
    step: StepItem
    index: number
    family: string
    displayFamily: string
    ink: string
    accent: string
    align: "center" | "left"
}) {
    const color = step.pivot ? accent : ink
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                alignItems: align === "center" ? "center" : "flex-start",
                textAlign: align,
                minWidth: 0,
            }}
        >
            <span style={{ fontFamily: displayFamily, fontSize: 32, lineHeight: 1, color }}>{String(index + 1).padStart(2, "0")}</span>
            <span style={{ fontFamily: family, fontSize: 14, fontWeight: 600, lineHeight: 1.35, color }}>{step.label}</span>
            {step.pivot ? (
                <span style={{ fontFamily: family, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: accent }}>
                    Pivot
                </span>
            ) : null}
            {step.detail ? <span style={{ fontFamily: family, fontSize: 13, lineHeight: 1.45, color: BODY_INK }}>{step.detail}</span> : null}
        </div>
    )
}

function TimelineDot({ pivot, accent }: { pivot?: boolean; accent: string }) {
    return (
        <span
            style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                border: OUTLINE,
                background: pivot ? accent : CREAM,
                boxSizing: "border-box",
                flex: "none",
                position: "relative",
                zIndex: 1,
            }}
        />
    )
}

function ProcessStrip({
    steps,
    family,
    displayFamily,
    ink,
    accent,
    direction,
}: {
    steps: StepItem[]
    family: string
    displayFamily: string
    ink: string
    accent: string
    direction?: "horizontal" | "vertical"
}) {
    const phone = useMediaQuery(PHONE_MQ)
    const rail = direction === "vertical" || phone
    if (rail) {
        return (
            <div style={{ display: "flex", flexDirection: "column" }}>
                {steps.map((step, i) => (
                    <div key={step.label} style={{ display: "grid", gridTemplateColumns: "14px 1fr", columnGap: 16 }}>
                        <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                            {i < steps.length - 1 ? (
                                <div style={{ position: "absolute", top: 14, bottom: 0, left: "50%", borderLeft: OUTLINE }} />
                            ) : null}
                            <TimelineDot pivot={step.pivot} accent={accent} />
                        </div>
                        <div style={{ paddingBottom: i === steps.length - 1 ? 0 : 22 }}>
                            <StepCopy step={step} index={i} family={family} displayFamily={displayFamily} ink={ink} accent={accent} align="left" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }
    const cols = `repeat(${steps.length}, minmax(0, 1fr))`
    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "grid", gridTemplateColumns: cols, alignItems: "end" }}>
                {steps.map((step, i) => (
                    <div key={step.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "0 8px" }}>
                        {i % 2 === 0 ? (
                            <>
                                <StepCopy step={step} index={i} family={family} displayFamily={displayFamily} ink={ink} accent={accent} align="center" />
                                <span style={{ width: 1.5, height: 16, background: "#111111" }} />
                            </>
                        ) : (
                            <span style={{ height: 16 }} />
                        )}
                    </div>
                ))}
            </div>
            <div style={{ position: "relative", display: "grid", gridTemplateColumns: cols, alignItems: "center", height: 18 }}>
                <div style={{ position: "absolute", left: 0, right: 0, top: "50%", borderTop: OUTLINE }} />
                {steps.map((step) => (
                    <div key={step.label} style={{ display: "flex", justifyContent: "center" }}>
                        <TimelineDot pivot={step.pivot} accent={accent} />
                    </div>
                ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: cols, alignItems: "start" }}>
                {steps.map((step, i) => (
                    <div key={step.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "0 8px" }}>
                        {i % 2 === 1 ? (
                            <>
                                <span style={{ width: 1.5, height: 16, background: "#111111" }} />
                                <StepCopy step={step} index={i} family={family} displayFamily={displayFamily} ink={ink} accent={accent} align="center" />
                            </>
                        ) : (
                            <span style={{ height: 16 }} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

function CardGrid({
    cards,
    columns,
    family,
    ink,
    displayFamily,
    plates,
}: {
    cards: CardItem[]
    columns?: number
    family: string
    ink: string
    displayFamily?: string
    plates?: boolean
}) {
    const phone = useMediaQuery(PHONE_MQ)
    const cols = phone ? 1 : columns || 2
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gap: 12,
            }}
        >
            {cards.map((card) => (
                <div
                    key={card.title}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        borderRadius: FRAME_RADIUS,
                        border: OUTLINE,
                        padding: card.image ? 10 : 16,
                        background: "transparent",
                        minWidth: 0,
                    }}
                >
                    {card.image ? (
                        <img
                            src={card.image}
                            alt={card.title}
                            style={{
                                display: "block",
                                width: "100%",
                                height: "auto",
                                borderRadius: 8,
                            }}
                        />
                    ) : plates ? (
                        <div
                            style={{
                                minHeight: 140,
                                borderRadius: 8,
                                background: "#E7E1D6",
                                display: "flex",
                                alignItems: "flex-end",
                                padding: 16,
                                fontFamily: displayFamily,
                                fontSize: 34,
                                lineHeight: 1,
                                color: ink,
                            }}
                        >
                            {card.title}
                        </div>
                    ) : null}
                    {card.image || !plates ? (
                    <div
                        style={{
                            fontFamily: family,
                            fontSize: 16,
                            fontWeight: 600,
                            lineHeight: 1.35,
                            color: ink,
                            padding: card.image ? "4px 6px 0" : 0,
                        }}
                    >
                        {card.title}
                    </div>
                    ) : null}
                    <p
                        style={{
                            margin: 0,
                            fontFamily: family,
                            fontSize: 14,
                            fontWeight: 400,
                            lineHeight: 1.45,
                            color: BODY_INK,
                            padding: card.image ? "0 6px 6px" : 0,
                        }}
                    >
                        {card.body}
                    </p>
                </div>
            ))}
        </div>
    )
}

const ZINE_SHA = "0e72c1ff56aef3811e27ef6c699e0acbbbf739be"
const ZINE_PAGES: { src: string; alt: string }[] = [
    ["01", "Sooraj Nagar"],
    ["02", "Being a young adult in Karachi"],
    ["03", "UGH"],
    ["04", "So what should we do?"],
    ["05", "Predictions"],
    ["06", "Public Buses"],
    ["07", "Rooftop Gardening"],
    ["08", "Solar And Wind Energy"],
    ["09", "Neighbourhood Gardens"],
    ["10", "Urban Reforestation Policy"],
    ["11", "The right trees"],
    ["12", "Palm Trees"],
    ["13", "Smart City Policy"],
    ["14", "Central Air Conditioning"],
    ["15", "Travelling By Cars"],
    ["16", "by Nabia Shaikh"],
].map(([file, alt]) => ({
    src: `https://cdn.jsdelivr.net/gh/nabiasheikh14-creator/portfolio@${ZINE_SHA}/framer/case/sooraj/zine/${file}.jpg`,
    alt,
}))

function ZineFlip({
    family,
    displayFamily,
    ink,
    accent,
}: {
    family: string
    displayFamily: string
    ink: string
    accent: string
}) {
    const spreads = Math.ceil(ZINE_PAGES.length / 2)
    const [spread, setSpread] = useState(0)
    const [turn, setTurn] = useState<{ from: number; to: number; hot: boolean } | null>(null)
    const turnRef = useRef(turn)
    const spreadRef = useRef(0)
    const turnToken = useRef(0)
    const downRef = useRef<{ x: number; y: number; pointerId: number; direction: number } | null>(null)
    turnRef.current = turn
    const last = spreads - 1
    const finish = (to: number) => {
        turnToken.current += 1
        spreadRef.current = to
        turnRef.current = null
        setSpread(to)
        setTurn(null)
    }
    const go = (to: number) => {
        const from = spreadRef.current
        if (turnRef.current || to === from || to < 0 || to > last) return
        const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
        if (reduce) {
            finish(to)
            return
        }
        const token = ++turnToken.current
        const next = { from, to, hot: false }
        turnRef.current = next
        setTurn(next)
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                if (turnToken.current !== token) return
                setTurn((current) => {
                    if (!current || current.to !== to) return current
                    const hot = { ...current, hot: true }
                    turnRef.current = hot
                    return hot
                })
            })
        })
        window.setTimeout(() => {
            if (turnToken.current === token && turnRef.current?.to === to) finish(to)
        }, 760)
    }
    const press = (direction: number) => {
        const begin = (event: ReactPointerEvent<HTMLButtonElement>) => {
            if (event.pointerType === "mouse" && event.button !== 0) return
            downRef.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId, direction }
        }
        const end = (event: ReactPointerEvent<HTMLButtonElement>) => {
            if (event.pointerType === "mouse" && event.button !== 0) return
            const start = downRef.current
            downRef.current = null
            if (!start || start.pointerId !== event.pointerId || start.direction !== direction) return
            const dx = event.clientX - start.x
            const dy = event.clientY - start.y
            if (dx * dx + dy * dy > 196) return
            event.preventDefault()
            event.stopPropagation()
            go(spreadRef.current + direction)
        }
        const click = (event: ReactMouseEvent<HTMLButtonElement>) => {
            event.preventDefault()
            event.stopPropagation()
            go(spreadRef.current + direction)
        }
        return {
            onPointerDown: begin,
            onPointerUp: end,
            onPointerCancel: () => {
                downRef.current = null
            },
            onClick: click,
        }
    }
    const forward = !turn || turn.to > turn.from
    const angle = !turn ? 0 : forward ? (turn.hot ? -180 : 0) : turn.hot ? 180 : 0
    const from = turn ? turn.from : spread
    const to = turn ? turn.to : spread
    const leftPage = ZINE_PAGES[(forward ? from : to) * 2]
    const rightPage = ZINE_PAGES[(forward ? to : from) * 2 + 1]
    const leafFront = turn ? ZINE_PAGES[from * 2 + (forward ? 1 : 0)] : null
    const leafBack = turn ? ZINE_PAGES[to * 2 + (forward ? 0 : 1)] : null
    const shown = turn ? turn.to : spread
    const face: CSSProperties = {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        backfaceVisibility: "hidden",
    }
    const pill: CSSProperties = {
        fontFamily: family,
        fontSize: 13,
        lineHeight: 1.2,
        color: ink,
        background: "transparent",
        border: OUTLINE,
        borderRadius: 999,
        padding: "10px 16px",
        cursor: "pointer",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
    }
    const hit = (side: "left" | "right", blocked: boolean): CSSProperties => ({
        position: "absolute",
        top: 0,
        bottom: 0,
        width: "50%",
        [side]: 0,
        background: "rgba(17,17,17,0.01)",
        border: 0,
        padding: 0,
        zIndex: 4,
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        cursor: blocked ? "default" : "pointer",
    })
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{ position: "relative", width: "100%", aspectRatio: "2276 / 1638", touchAction: "manipulation" }}>
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        perspective: "2200px",
                        border: "1px solid #DAD4C8",
                        borderRadius: 14,
                        background: "#FBF9F5",
                    }}
                >
                    <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "50%", overflow: "hidden" }}>
                        <img src={leftPage.src} alt={turn ? "" : leftPage.alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </div>
                    <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "50%", overflow: "hidden" }}>
                        <img src={rightPage.src} alt={turn ? "" : rightPage.alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </div>
                    <div
                        aria-hidden
                        style={{
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            left: "50%",
                            width: 28,
                            transform: "translateX(-50%)",
                            background: "linear-gradient(90deg, transparent, rgba(17,17,17,0.16) 46%, rgba(17,17,17,0.22) 50%, rgba(17,17,17,0.16) 54%, transparent)",
                            pointerEvents: "none",
                            zIndex: 2,
                        }}
                    />
                    {leafFront && leafBack ? (
                        <div
                            onTransitionEnd={(event) => {
                                if (event.propertyName !== "transform" || event.target !== event.currentTarget || !turnRef.current?.hot) return
                                finish(turnRef.current.to)
                            }}
                            style={{
                                position: "absolute",
                                top: 0,
                                bottom: 0,
                                width: "50%",
                                left: forward ? "50%" : 0,
                                transformOrigin: forward ? "left center" : "right center",
                                transform: `rotateY(${angle}deg)`,
                                transition: turn?.hot ? "transform 0.7s cubic-bezier(.2,.7,.2,1)" : "none",
                                transformStyle: "preserve-3d",
                                zIndex: 3,
                                pointerEvents: "none",
                            }}
                        >
                            <img src={leafFront.src} alt="" style={face} />
                            <img src={leafBack.src} alt="" style={{ ...face, transform: "rotateY(180deg)" }} />
                        </div>
                    ) : null}
                </div>
                <button type="button" aria-label="Previous pages" aria-disabled={shown === 0 || Boolean(turn)} {...press(-1)} style={hit("left", shown === 0 || Boolean(turn))} />
                <button type="button" aria-label="Next pages" aria-disabled={shown === last || Boolean(turn)} {...press(1)} style={hit("right", shown === last || Boolean(turn))} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
                <button type="button" aria-disabled={shown === 0 || Boolean(turn)} {...press(-1)} style={{ ...pill, opacity: shown === 0 ? 0.35 : 1, cursor: shown === 0 || turn ? "default" : "pointer" }}>
                    Previous
                </button>
                <span aria-live="polite" style={{ fontFamily: family, fontSize: 15, fontWeight: 600, lineHeight: 1.4, color: ink, minWidth: 64, textAlign: "center" }}>
                    {`${String(shown * 2 + 1).padStart(2, "0")}–${String(shown * 2 + 2).padStart(2, "0")}`}
                </span>
                <button type="button" aria-disabled={shown === last || Boolean(turn)} {...press(1)} style={{ ...pill, color: "#fff", background: accent, borderColor: accent, opacity: shown === last ? 0.35 : 1, cursor: shown === last || turn ? "default" : "pointer" }}>
                    Next
                </button>
            </div>
        </div>
    )
}
function PullQuote({
    quote,
    displayFamily,
    ink,
}: {
    quote: string
    displayFamily: string
    ink: string
}) {
    return (
        <blockquote style={{ margin: 0, padding: "4px 0" }}>
            <p
                style={{
                    margin: 0,
                    fontFamily: displayFamily,
                    fontSize: 36,
                    fontWeight: 400,
                    lineHeight: 1.15,
                    color: ink,
                    maxWidth: 640,
                }}
            >
                {quote}
            </p>
        </blockquote>
    )
}

function DecisionRow({
    index,
    title,
    parts,
    family,
    displayFamily,
    ink,
    accent,
}: {
    index: number
    title: string
    parts: DecisionPart[]
    family: string
    displayFamily: string
    ink: string
    accent: string
}) {
    const phone = useMediaQuery(PHONE_MQ)
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: phone ? "1fr" : "76px 1fr",
                gap: phone ? 8 : 18,
                marginBottom: 12,
                padding: "18px 18px 20px",
                background: "transparent",
                border: OUTLINE,
                borderRadius: FRAME_RADIUS,
            }}
        >
            <div
                style={{
                    fontFamily: displayFamily,
                    fontSize: 40,
                    lineHeight: 1,
                    color: accent,
                }}
            >
                {String(index).padStart(2, "0")}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
                <div
                    style={{
                        fontFamily: family,
                        fontSize: 16,
                        fontWeight: 600,
                        lineHeight: 1.35,
                        color: ink,
                    }}
                >
                    {title}
                </div>
                {parts.map((item) => (
                    <div
                        key={item.label}
                        style={{
                            display: "grid",
                            gridTemplateColumns: phone ? "1fr" : "96px 1fr",
                            gap: phone ? 2 : 12,
                        }}
                    >
                        <div
                            style={{
                                fontFamily: family,
                                fontSize: 11,
                                fontWeight: 600,
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                                color: LABEL,
                                paddingTop: phone ? 0 : 4,
                            }}
                        >
                            {item.label}
                        </div>
                        <div
                            style={{
                                fontFamily: family,
                                fontSize: 16,
                                lineHeight: 1.55,
                                color: BODY_INK,
                            }}
                        >
                            {item.text}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function deltaNumber(delta: string): number | null {
    if (!delta.endsWith("°C")) return null
    const raw = delta.slice(0, -2).replace("−", "-").replace("+", "").trim()
    const n = Number(raw)
    if (!Number.isFinite(n)) return null
    return delta.trim().startsWith("−") || delta.trim().startsWith("-") ? -Math.abs(n) : Math.abs(n)
}

function formatRoad(n: number): string {
    if (n === 0) return "0°C"
    const sign = n > 0 ? "+" : "−"
    const abs = Math.abs(n)
    const text = Number.isInteger(abs) ? String(abs) : abs.toFixed(1)
    return `${sign}${text}°C`
}

function TierTable({
    groups,
    notes,
    legend,
    family,
    ink,
    accent,
}: {
    groups: TierGroup[]
    notes: NoteItem[]
    legend: string
    family: string
    ink: string
    accent: string
}) {
    const phone = useMediaQuery(PHONE_MQ)
    const [role, setRole] = useState("All")
    const [pressed, setPressed] = useState<string[]>([])
    const roles = ["All", ...groups.map((group) => group.role)]
    const visible = role === "All" ? groups : groups.filter((group) => group.role === role)
    const catalog = groups.flatMap((group) => [
        ...group.renewal.map((action) => ({ ...action, tone: "cool" as const })),
        ...group.collapse.map((action) => ({ ...action, tone: "heat" as const })),
    ])
    const on = catalog.filter((action) => pressed.includes(action.name))
    const numbered = on.map((action) => deltaNumber(action.delta)).filter((n): n is number => n != null)
    const sum = numbered.reduce((total, n) => total + n, 0)
    const words = on.filter((action) => deltaNumber(action.delta) == null)
    const figure = numbered.length ? formatRoad(sum) : words.length ? (words.every((action) => action.tone === "cool") ? "Cools" : words.every((action) => action.tone === "heat") ? "Heats" : "Mixed") : "0°C"
    const figureColor = figure === "Cools" || sum < 0 ? COOL : figure === "Heats" || sum > 0 ? HEAT : ink
    const toggle = (name: string) => setPressed((cur) => (cur.includes(name) ? cur.filter((item) => item !== name) : [...cur, name]))
    const chip = (label: string, active: boolean, onClick: () => void): ReactNode => (
        <button
            type="button"
            className="sooraj-press"
            aria-pressed={active}
            onClick={onClick}
            style={{
                fontFamily: family,
                fontSize: 14,
                lineHeight: 1.2,
                color: active ? "#FFFFFF" : ink,
                background: active ? accent : "transparent",
                border: active ? `1.5px solid ${accent}` : OUTLINE,
                borderRadius: 999,
                padding: "8px 14px",
                cursor: "pointer",
            }}
        >
            {label}
        </button>
    )
    const actionButton = (action: TierAction, tone: "cool" | "heat") => {
        const active = pressed.includes(action.name)
        const toneColor = tone === "cool" ? COOL : HEAT
        return (
            <button
                key={action.name}
                type="button"
                className="sooraj-action"
                aria-pressed={active}
                onClick={() => toggle(action.name)}
                style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    width: "100%",
                    textAlign: "left",
                    background: active ? (tone === "cool" ? "rgba(27,107,69,0.08)" : "rgba(163,59,36,0.08)") : undefined,
                    border: active ? `1.5px solid ${toneColor}` : OUTLINE,
                    borderRadius: FRAME_RADIUS,
                    padding: "12px 14px",
                    cursor: "pointer",
                    color: ink,
                }}
            >
                <span
                    style={{
                        flex: "none",
                        fontFamily: family,
                        fontSize: 13,
                        fontWeight: 600,
                        lineHeight: 1.2,
                        color: active ? "#FFFFFF" : toneColor,
                        background: active ? toneColor : "transparent",
                        border: `1.5px solid ${toneColor}`,
                        borderRadius: 999,
                        padding: "6px 10px",
                        marginTop: 1,
                    }}
                >
                    {action.delta}
                </span>
                <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontFamily: family, fontSize: 16, fontWeight: 600, lineHeight: 1.35, color: ink }}>
                        {action.name}
                    </span>
                    <span style={{ display: "block", marginTop: 4, fontFamily: family, fontSize: 14, lineHeight: 1.45, color: BODY_INK }}>
                        {action.detail}
                    </span>
                </span>
            </button>
        )
    }
    const column = (label: string, color: string, items: ReactNode) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
            <div style={{ fontFamily: family, fontSize: 16, fontWeight: 600, lineHeight: 1.3, color }}>{label}</div>
            {items}
        </div>
    )
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <style>
                {`.sooraj-press:focus-visible,.sooraj-action:focus-visible{outline:2px solid ${accent};outline-offset:2px}.sooraj-action:hover{background:rgba(17,17,17,0.03)}`}
            </style>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16, alignItems: "flex-end" }}>
                <div>
                    <div style={{ fontFamily: family, fontSize: 14, lineHeight: 1.3, color: LABEL }}>The road</div>
                    <div style={{ fontFamily: family, fontSize: phone ? 40 : 48, fontWeight: 600, lineHeight: 1, color: figureColor, marginTop: 4 }}>
                        {figure}
                    </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", maxWidth: 460 }}>
                    <span style={{ fontFamily: family, fontSize: 14, lineHeight: 1.45, color: BODY_INK }}>
                        {on.length ? on.map((action) => action.name).join(", ") : legend}
                    </span>
                    {on.length ? chip("Clear", false, () => setPressed([])) : null}
                </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {roles.map((item) => (
                    <span key={item}>{chip(item, role === item, () => setRole(item))}</span>
                ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                {visible.map((group) => (
                    <div key={group.role} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ fontFamily: family, fontSize: 16, fontWeight: 600, lineHeight: 1.3, color: ink }}>{group.role}</div>
                        <div style={{ display: "grid", gridTemplateColumns: phone ? "1fr" : "1fr 1fr", gap: 16 }}>
                            {column("Renewal", COOL, <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{group.renewal.map((action) => actionButton(action, "cool"))}</div>)}
                            {column("Collapse", HEAT, <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{group.collapse.map((action) => actionButton(action, "heat"))}</div>)}
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: phone ? "1fr" : "1fr 1fr", gap: 12 }}>
                {notes.map((note) => {
                    const linked = note.title.startsWith("Palms") ? pressed.includes("Palm trees") : pressed.includes("Smart city policy")
                    return (
                        <div
                            key={note.title}
                            style={{
                                border: linked ? `1.5px solid ${HEAT}` : OUTLINE,
                                borderRadius: FRAME_RADIUS,
                                padding: "16px 16px 18px",
                                background: linked ? "rgba(163,59,36,0.06)" : "transparent",
                            }}
                        >
                            <div style={{ fontFamily: family, fontSize: 16, fontWeight: 600, lineHeight: 1.35, color: ink }}>{note.title}</div>
                            <p style={{ margin: "8px 0 0", fontFamily: family, fontSize: 15, lineHeight: 1.55, color: BODY_INK }}>{note.body}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

const JOURNAL_LINE = "#DAD4C8"
const JOURNAL_SURFACE = "#FBF9F5"
const JOURNAL_MUTED = "#6A665D"
const JOURNAL_RENEW = "#1E7A49"
const JOURNAL_RENEW_SOFT = "#DDEFE3"
const JOURNAL_HEAT = "#B3361D"
const JOURNAL_HEAT_SOFT = "#F6E0D9"

function JournalBlock({
    id,
    setSectionRef,
    phone,
    lead,
    children,
}: {
    id: string
    setSectionRef: (id: string) => (el: HTMLElement | null) => void
    phone: boolean
    lead?: boolean
    children: ReactNode
}) {
    const motion = useContext(CaseMotion)
    return (
        <section
            ref={setSectionRef(id)}
            id={id}
            style={stackStyle(Boolean(lead), phone)}
        >
            <Parallax amount={motion.section} lift={motion.lift}>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: phone ? 24 : 36,
                    }}
                >
                    {children}
                </div>
            </Parallax>
        </section>
    )
}

function JournalTitle({ family, children }: { family: string; children: ReactNode }) {
    return (
        <h2
            style={{
                margin: 0,
                fontFamily: family,
                fontWeight: 600,
                fontSize: "clamp(36px, 4.2vw, 52px)",
                lineHeight: 1.1,
                letterSpacing: "-1.56px",
                color: "#1C1B18",
            }}
        >
            {children}
        </h2>
    )
}

function JournalLede({ family, children, quiet }: { family: string; children: ReactNode; quiet?: boolean }) {
    return (
        <p
            style={{
                margin: 0,
                fontFamily: family,
                fontWeight: 400,
                fontSize: quiet ? 17 : 20,
                lineHeight: quiet ? 1.55 : 1.5,
                color: quiet ? JOURNAL_MUTED : "#1C1B18",
            }}
        >
            {children}
        </p>
    )
}

function JournalCard({ children, pad }: { children: ReactNode; pad?: string }) {
    return (
        <div
            style={{
                background: JOURNAL_SURFACE,
                border: `1px solid ${JOURNAL_LINE}`,
                borderRadius: 14,
                padding: pad || "24px",
                minWidth: 0,
            }}
        >
            {children}
        </div>
    )
}

function NaturalStill({ src, alt }: { src: string; alt: string }) {
    if (!src) return null
    return (
        <img
            src={src}
            alt={alt}
            style={{
                display: "block",
                width: "100%",
                height: "auto",
                borderRadius: 14,
                border: `1px solid ${JOURNAL_LINE}`,
                background: JOURNAL_SURFACE,
            }}
        />
    )
}

function NaturalFilm({ src, label }: { src: string; label: string }) {
    if (!src) return null
    return (
        <video
            src={src}
            aria-label={label}
            muted
            playsInline
            loop
            autoPlay
            controls
            preload="metadata"
            style={{
                display: "block",
                width: "100%",
                height: "auto",
                borderRadius: 14,
                background: "#111",
            }}
        />
    )
}

function RoadScene({ on, heat }: { on: string[]; heat: number }) {
    const has = (name: string) => on.includes(name)
    const sky = heat > 0.62 ? "#F6C9A4" : heat < 0.4 ? "#B9D8E6" : "#D7E4D8"
    const palms = has("Palm trees")
    const forest = has("Urban reforestation")
    const solar = has("Solar and wind")
    const roofs = has("Rooftop gardens")
    const gardens = has("Neighbourhood gardens")
    const smart = has("Smart city policy")
    const bus = has("Travel by bus")
    const cars = has("Travel by car")
    const ac = has("Central air conditioning")
    const tree = (x: number, scale = 1) => (
        <g key={`t-${x}`} transform={`translate(${x} 168)`}>
            <rect x={-2 * scale} y={-28 * scale} width={4 * scale} height={28 * scale} rx={2} fill="#6B5344" />
            <circle cy={-34 * scale} r={14 * scale} fill="#2F8A4A" />
            <circle cx={10 * scale} cy={-28 * scale} r={10 * scale} fill="#3E9A5C" />
        </g>
    )
    const palm = (x: number) => (
        <g key={`p-${x}`} transform={`translate(${x} 182)`}>
            <rect x="-2" y="-36" width="4" height="36" rx="2" fill="#C4A574" />
            <ellipse cy="-38" rx="16" ry="4" fill="#3E9A5C" />
            <ellipse cy="-44" rx="11" ry="4" fill="#2F8A4A" />
            <ellipse cy="-42" rx="4" ry="10" fill="#2A7A45" />
        </g>
    )
    return (
        <svg viewBox="0 0 472 224" width="100%" role="img" aria-label="Shahra-e-Faisal, responding to the actions" style={{ display: "block", width: "100%", height: "auto" }}>
            <rect width="472" height="224" rx="12" fill={sky} />
            <rect width="472" height="224" fill="#F1B27C" opacity={0.08 + Math.max(0, heat - 0.45) * 0.85} />
            <circle cx="404" cy="40" r={ac ? 24 : 18} fill={ac || heat > 0.6 ? "#F08A3C" : "#F6C56B"} />
            <rect x="18" y={smart ? 118 : 90} width="70" height={smart ? 66 : 94} fill="#D9D2C3" />
            <rect x="100" y={smart ? 96 : 48} width="82" height={smart ? 88 : 136} fill={forest ? "#D5E6D2" : "#C9C1B0"} />
            <rect x="196" y="102" width="58" height="82" fill="#E2DCCF" />
            <rect x="266" y={smart ? 108 : 66} width="76" height={smart ? 76 : 118} fill="#D9D2C3" />
            <rect x="354" y="84" width="88" height="100" fill={forest ? "#D5E6D2" : "#C9C1B0"} />
            {smart ? (
                <g stroke="#8A8478" strokeWidth="1.6" fill="none">
                    <path d="M100 96 H182 M112 78 V96 M170 70 V96" />
                    <path d="M266 108 H342 M280 90 V108 M328 86 V108" />
                </g>
            ) : null}
            {(solar || forest) && (
                <g fill="#27468A">
                    <rect x="24" y="84" width="26" height="5" rx="1" />
                    <rect x="54" y="84" width="26" height="5" rx="1" />
                    <rect x="204" y="96" width="40" height="5" rx="1" />
                    {[96, 250, 340, 430].map((x) => (
                        <g key={x}>
                            <rect x={x} y="164" width="2" height="18" fill="#1C1B18" opacity="0.55" />
                            <rect x={x - 6} y="158" width="14" height="6" rx="1" />
                        </g>
                    ))}
                </g>
            )}
            {roofs && (
                <g>
                    {[
                        [100, 44, 82],
                        [266, 62, 76],
                        [354, 80, 88],
                    ].map(([x, y, w]) => (
                        <g key={x}>
                            <rect x={x} y={y} width={w} height="6" rx="2" fill="#3E9A5C" />
                            <circle cx={x + 16} cy={y} r="5" fill="#2A7A45" />
                            <circle cx={x + w / 2} cy={y} r="5" fill="#2A7A45" />
                            <circle cx={x + w - 16} cy={y} r="5" fill="#2A7A45" />
                        </g>
                    ))}
                </g>
            )}
            {gardens && (
                <g fill="#3E9A5C">
                    <rect x="28" y="118" width="16" height="8" rx="2" />
                    <rect x="52" y="140" width="16" height="8" rx="2" />
                    <rect x="210" y="128" width="16" height="8" rx="2" />
                    <rect x="372" y="120" width="16" height="8" rx="2" />
                    <rect x="400" y="146" width="16" height="8" rx="2" />
                </g>
            )}
            {forest && (
                <g>
                    <path d="M300 150 l8 -18 h-4 l6 -12 h-20 l6 12 h-4 z" fill="#8FA3A8" />
                    <rect x="306" y="150" width="3" height="22" fill="#8A8478" />
                </g>
            )}
            {ac && (
                <g fill="#F4F1EA" stroke="#8A8478" strokeWidth="1">
                    <rect x="30" y="96" width="18" height="8" />
                    <rect x="214" y="112" width="18" height="8" />
                    <rect x="380" y="96" width="18" height="8" />
                </g>
            )}
            <rect y="182" width="472" height="8" fill="#CFC8B8" />
            <rect y="190" width="472" height="34" fill="#5A5852" />
            <path d="M0 206 H472" stroke="#EDE8DC" strokeDasharray="12 10" strokeWidth="1.6" />
            {(palms ? [70, 160, 250] : [70, 160, 250]).map((x) => (palms ? palm(x) : tree(x)))}
            {forest && [40, 210, 390].map((x) => tree(x, 0.85))}
            {bus && <rect x="300" y="168" width="54" height="20" rx="4" fill="#2C6BE0" />}
            {cars && (
                <g>
                    <rect x="40" y="172" width="36" height="16" rx="4" fill="#B3361D" />
                    <rect x="120" y="174" width="32" height="14" rx="4" fill="#8E2E1C" />
                    <ellipse cx="58" cy="166" rx="10" ry="4" fill="#D9D2C3" opacity="0.7" />
                </g>
            )}
            {!cars && !bus && <rect x="180" y="174" width="28" height="12" rx="3" fill="#E7E1D6" opacity="0.8" />}
        </svg>
    )
}

function SoorajSections({
    project,
    setSectionRef,
    accent,
    ink,
    family,
    displayFamily,
}: {
    project: ProjectRecord
    setSectionRef: (id: string) => (el: HTMLElement | null) => void
    accent: string
    ink: string
    muted: string
    family: string
    displayFamily: string
}) {
    const phone = useMediaQuery(PHONE_MQ)
    const frames = project.frames || []
    const pic = (section: string, video?: boolean) =>
        frames.find((f) => f.section === section && Boolean(f.video) === Boolean(video) && hasMedia(f.src))
    const researchImg = pic("research")
    const architecture = pic("approach")
    const room = pic("system")
    const futures = pic("experience")
    const roomFilm = pic("experience", true)
    const website = pic("beyond")
    const [method, setMethod] = useState(0)
    const [step, setStep] = useState(2)
    const [pressed, setPressed] = useState<string[]>([])
    const [touch, setTouch] = useState(0)
    const [openDecision, setOpenDecision] = useState<number | null>(0)
    void displayFamily

    const catalog = SOORAJ_UI.tiers.flatMap((group) => [
        ...group.renewal.map((action) => ({ ...action, tone: "cool" as const, role: group.role })),
        ...group.collapse.map((action) => ({ ...action, tone: "heat" as const, role: group.role })),
    ])
    const on = catalog.filter((action) => pressed.includes(action.name))
    const numbered = on.map((action) => deltaNumber(action.delta)).filter((n): n is number => n != null)
    const sum = numbered.reduce((total, n) => total + n, 0)
    const coolWords = on.filter((action) => deltaNumber(action.delta) == null && action.tone === "cool").length
    const heatWords = on.filter((action) => deltaNumber(action.delta) == null && action.tone === "heat").length
    const gaugeScore = sum + coolWords * -2 + heatWords * 2
    const heat = Math.max(0, Math.min(1, (gaugeScore + 12) / 24))
    const hasCool = on.some((action) => action.tone === "cool")
    const hasHeat = on.some((action) => action.tone === "heat")
    const mixed = hasCool && hasHeat
    const figure = numbered.length
        ? formatRoad(sum)
        : coolWords && !heatWords
          ? "Cools"
          : heatWords && !coolWords
            ? "Heats"
            : on.length
              ? "Mixed"
              : "0°C"
    const figureColor = !on.length ? ink : mixed ? ink : hasCool ? JOURNAL_RENEW : JOURNAL_HEAT
    const verdict = !on.length ? "The road is still" : mixed ? "A mixed future" : hasCool ? "A cooler road" : "A hotter road"
    const verdictCopy = !on.length
        ? "Press an action. The road, the scale and the note respond."
        : mixed
          ? `${on.length} ${on.length === 1 ? "action" : "actions"} pressed. Cooling and heating are pulling against each other.`
          : hasCool
            ? "The cooling actions are winning."
            : "The heating actions are winning."
    const dialogues = SOORAJ_UI.notes.filter((note) =>
        note.title.startsWith("Palms") ? pressed.includes("Palm trees") : pressed.includes("Smart city policy"),
    )
    const toggle = (name: string) =>
        setPressed((cur) => (cur.includes(name) ? cur.filter((item) => item !== name) : [...cur, name]))

    const methodFigures = ["65", "", "32", "2", "5"]
    const steps = SOORAJ_UI.approach
    const touchpoints = [
        { title: "Zine", body: "A printed guide to the real action behind each button, plus a manifesto kit.", image: "" },
        { title: "Website", body: "Future's Archive, a newsroom from 2120 that switches between collapse and renewal.", image: website?.src || "" },
        {
            title: "Instagram",
            body: "@soorajnagarkarachi turns visitors into a community that keeps reimagining the city.",
            image: "https://cdn.jsdelivr.net/gh/nabiasheikh14-creator/portfolio@606433ca18d8eff29f5738eb5ce295c59ea6f19b/framer/case/sooraj/instagram.jpg",
        },
    ]
    const pill = (label: string, active: boolean, onClick: () => void) => (
        <button
            type="button"
            onClick={onClick}
            style={{
                fontFamily: family,
                fontSize: 15,
                fontWeight: 500,
                lineHeight: 1.3,
                color: active ? "#F3EFE8" : ink,
                background: active ? ink : "transparent",
                border: active ? `1.5px solid ${ink}` : `1.5px solid ${JOURNAL_LINE}`,
                borderRadius: 99,
                padding: "8px 16px",
                cursor: "pointer",
            }}
        >
            {label}
        </button>
    )

    return (
        <>
            <JournalBlock id="overview" setSectionRef={setSectionRef} phone={phone} lead>
                <JournalTitle family={family}>Overview</JournalTitle>
                <JournalLede family={family}>
                    Sooraj Nagar, City of the Sun, is a speculative, interactive installation about Karachi's climate future. Visitors stand in front of a projected 3D model of Shahra-e-Faisal, the city's main artery, and press physical buttons for nine real climate actions across three roles: government, community and individual. Every press shifts the road toward one of two futures in 2120, collapse or renewal.
                </JournalLede>
                <JournalLede family={family} quiet>
                    The project started with a question. If every headline says we are doomed, what does that belief do to how we act today? Nine months of research later, it became an immersive experience, a future-news website, a take-home zine and an online community, all designed to turn climate dread into agency.
                </JournalLede>
                <div style={{ display: "flex", position: "relative", paddingTop: 8 }}>
                    <div style={{ position: "absolute", left: "8%", right: "8%", top: 15, height: 2, background: JOURNAL_LINE }} />
                    {[
                        ["Question", "If it's doomed, why act?"],
                        ["Research", "Surveys, workshops, interviews"],
                        ["Pivot", "TouchDesigner prototype"],
                        ["Karachi build", "Shahra-e-Faisal in Unity"],
                        ["Public installation", "Exhibited at IVSAA"],
                    ].map(([title, detail]) => (
                        <div key={title} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", position: "relative" }}>
                            <i style={{ width: 16, height: 16, borderRadius: 99, background: CREAM, border: `2px solid ${JOURNAL_LINE}`, display: "block" }} />
                            <b style={{ fontFamily: family, fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>{title}</b>
                            <span style={{ fontFamily: family, fontSize: 15, lineHeight: 1.45, color: JOURNAL_MUTED }}>{detail}</span>
                        </div>
                    ))}
                </div>
                <NaturalFilm src={project.storyVideo || ""} label="Case study film" />
            </JournalBlock>

            <JournalBlock id="challenge" setSectionRef={setSectionRef} phone={phone}>
                <JournalTitle family={family}>Challenge</JournalTitle>
                <div style={{ display: "grid", gridTemplateColumns: phone ? "1fr" : "1fr 1fr", gap: 16 }}>
                    <JournalCard>
                        <p style={{ margin: 0, fontFamily: family, fontSize: 17, lineHeight: 1.55 }}>
                            Living through Karachi's urban heat island has convinced young Karachiites that climate decline is inevitable. That belief limits their vision of a hopeful future and convinces them they are powerless.
                        </p>
                    </JournalCard>
                    <JournalCard>
                        <p style={{ margin: 0, fontFamily: family, fontSize: 17, lineHeight: 1.55 }}>
                            Karachi's 2015 heatwave killed 1,181 people in a week, the deadliest in Pakistan in over 50 years. Heat is the climate impact residents feel most, every day.
                        </p>
                    </JournalCard>
                </div>
                <p style={{ margin: 0, maxWidth: 620, fontFamily: family, fontSize: phone ? 28 : 34, fontWeight: 500, lineHeight: 1.25, letterSpacing: "-0.68px" }}>
                    “I'm leaving the country before it kills me.”
                </p>
                <div style={{ background: accent, color: "#fff", borderRadius: 20, padding: phone ? "28px 22px" : "48px", display: "flex", flexDirection: "column", gap: 12 }}>
                    <p style={{ margin: 0, fontFamily: family, fontSize: 12, fontWeight: 600, letterSpacing: "0.96px", textTransform: "uppercase", opacity: 0.75 }}>How might we</p>
                    <p style={{ margin: 0, maxWidth: 760, fontFamily: family, fontSize: phone ? 26 : 34, fontWeight: 500, lineHeight: 1.25, letterSpacing: "-0.68px" }}>
                        let people envision and experience Karachi's heat across more than one future, so the warning about the present arrives with a reason to hope?
                    </p>
                </div>
            </JournalBlock>

            <JournalBlock id="research" setSectionRef={setSectionRef} phone={phone}>
                <JournalTitle family={family}>Research</JournalTitle>
                <JournalLede family={family}>
                    Six months of mixed-method research shaped every decision in the build. I designed and ran each stream myself, then brought it together on one FigJam board.
                </JournalLede>
                <div style={{ display: "grid", gridTemplateColumns: phone ? "1fr 1fr" : "repeat(4, minmax(0, 1fr))", gap: 16 }}>
                    {SOORAJ_UI.stats.map((item) => (
                        <div key={item.caption} style={{ background: JOURNAL_SURFACE, border: `1px solid ${JOURNAL_LINE}`, borderRadius: 14, padding: "22px 22px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                            <b style={{ fontFamily: family, fontSize: phone ? 48 : 72, fontWeight: 600, lineHeight: 1, letterSpacing: "-2.88px" }}>{item.value}</b>
                            {item.value === "92%" ? (
                                <div style={{ height: 6, borderRadius: 3, background: JOURNAL_LINE, position: "relative" }}>
                                    <i style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "92%", borderRadius: 3, background: accent }} />
                                </div>
                            ) : null}
                            <span style={{ fontFamily: family, fontSize: 15, lineHeight: 1.45, color: JOURNAL_MUTED }}>{item.caption}</span>
                        </div>
                    ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <h3 style={{ margin: 0, fontFamily: family, fontSize: 24, fontWeight: 600, letterSpacing: "-0.36px", lineHeight: 1.2 }}>Methods</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {SOORAJ_UI.methods.map((item, index) => (
                            <span key={item.title}>{pill(item.title, method === index, () => setMethod(index))}</span>
                        ))}
                    </div>
                    <div style={{ background: JOURNAL_SURFACE, border: `1px solid ${JOURNAL_LINE}`, borderRadius: 14, padding: phone ? 20 : 32, display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
                        {methodFigures[method] ? (
                            <b style={{ fontFamily: family, fontSize: 72, fontWeight: 600, lineHeight: 1, letterSpacing: "-2.88px" }}>{methodFigures[method]}</b>
                        ) : null}
                        <p style={{ margin: 0, flex: "1 1 240px", fontFamily: family, fontSize: 20, lineHeight: 1.5 }}>{SOORAJ_UI.methods[method].body}</p>
                    </div>
                </div>
                <NaturalStill src={researchImg?.src || ""} alt={researchImg?.label || "Research board"} />
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <h3 style={{ margin: 0, fontFamily: family, fontSize: 24, fontWeight: 600, letterSpacing: "-0.36px" }}>Findings</h3>
                    <div style={{ display: "grid", gridTemplateColumns: phone ? "1fr" : "1fr 1fr", gap: 32 }}>
                        {[
                            "For the West, climate change is a near future. We are going through it.",
                            "People need to see how bad things can get.",
                        ].map((quote) => (
                            <p key={quote} style={{ margin: 0, fontFamily: family, fontSize: 22, fontWeight: 500, lineHeight: 1.25, letterSpacing: "-0.22px" }}>{`“${quote}”`}</p>
                        ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: phone ? "1fr" : "1fr 1fr", gap: 16 }}>
                        {SOORAJ_UI.findings.map((card) => (
                            <JournalCard key={card.title}>
                                <b style={{ display: "block", fontFamily: family, fontSize: 20, fontWeight: 600, letterSpacing: "-0.2px", lineHeight: 1.25 }}>{card.title}</b>
                                <p style={{ margin: "8px 0 0", fontFamily: family, fontSize: 15, lineHeight: 1.45, color: JOURNAL_MUTED }}>{card.body}</p>
                            </JournalCard>
                        ))}
                    </div>
                </div>
                <JournalLede family={family} quiet>
                    Asphalt, waste heat, lost vegetation and glass towers drive the heat. The cooling that fits this city is green corridors, neighbourhood gardens and urban reforestation. Across the precedents, almost no hopeful future is set in Pakistan.
                </JournalLede>
            </JournalBlock>

            <JournalBlock id="approach" setSectionRef={setSectionRef} phone={phone}>
                <JournalTitle family={family}>Approach</JournalTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <div style={{ display: "grid", gridTemplateColumns: phone ? "1fr 1fr" : "repeat(6, minmax(0, 1fr))", gap: 8 }}>
                        {steps.map((item, index) => (
                            <button
                                key={item.label}
                                type="button"
                                onClick={() => setStep(index)}
                                style={{
                                    textAlign: "left",
                                    background: "none",
                                    border: 0,
                                    borderTop: `3px solid ${index === step ? accent : index < step ? "#E3E9FA" : JOURNAL_LINE}`,
                                    padding: "14px 8px 0 0",
                                    cursor: "pointer",
                                    fontFamily: family,
                                }}
                            >
                                <span style={{ display: "block", fontSize: 12, fontWeight: 600, letterSpacing: "0.96px", color: JOURNAL_MUTED }}>{String(index + 1).padStart(2, "0")}</span>
                                <span style={{ display: "block", marginTop: 2, fontSize: 15, fontWeight: 600, lineHeight: 1.4, color: index === step ? ink : JOURNAL_MUTED }}>{item.label}</span>
                            </button>
                        ))}
                    </div>
                    <div style={{ background: JOURNAL_SURFACE, border: `1px solid ${JOURNAL_LINE}`, borderRadius: 14, padding: phone ? 20 : 28 }}>
                        <p style={{ margin: 0, maxWidth: 640, fontFamily: family, fontSize: 20, lineHeight: 1.5 }}>{steps[step].detail}</p>
                    </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: phone ? "1fr" : "1fr 1fr", gap: 16 }}>
                    <JournalCard>
                        <b style={{ fontFamily: family, fontSize: 20, fontWeight: 600, letterSpacing: "-0.2px" }}>Goals</b>
                        <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontFamily: family, fontSize: 15, lineHeight: 1.45 }}>
                            <li>Make a hopeful Karachi feel physically real.</li>
                            <li>Give visitors agency over the outcome.</li>
                            <li>Teach which actions cool a city, and which only look green.</li>
                            <li>Leave a next step they can take that week.</li>
                        </ul>
                    </JournalCard>
                    <JournalCard>
                        <b style={{ fontFamily: family, fontSize: 20, fontWeight: 600, letterSpacing: "-0.2px" }}>Constraints</b>
                        <p style={{ margin: "8px 0 0", fontFamily: family, fontSize: 15, lineHeight: 1.45, color: JOURNAL_MUTED }}>
                            One designer, an academic calendar, and no budget for commercial hardware or a venue. 3D and Unity sat outside my core skills, so I directed two collaborators. A first-time visitor had to understand the room within seconds.
                        </p>
                    </JournalCard>
                </div>
                <div>
                    <p style={{ margin: "0 0 12px", fontFamily: family, fontSize: 12, fontWeight: 600, letterSpacing: "0.96px", textTransform: "uppercase", color: JOURNAL_MUTED }}>Where the time went</p>
                    <div style={{ display: "flex", gap: 3 }}>
                        <span style={{ flex: 26, height: 44, borderRadius: 6, background: accent, color: "#fff", display: "flex", alignItems: "center", padding: "0 12px", fontFamily: family, fontSize: 15, whiteSpace: "nowrap" }}>Research · 6 months</span>
                        <span style={{ flex: 6, height: 44, borderRadius: 6, background: "#E3E9FA", display: "flex", alignItems: "center", padding: "0 12px", fontFamily: family, fontSize: 15, whiteSpace: "nowrap" }}>Installation · 6 wk</span>
                        <span style={{ flex: 4, height: 44, borderRadius: 6, background: "#E3E9FA", display: "flex", alignItems: "center", padding: "0 12px", fontFamily: family, fontSize: 15, whiteSpace: "nowrap" }}>Brand · 4 wk</span>
                        <span style={{ flex: 1, height: 44, borderRadius: 6, background: "#E3E9FA" }} />
                        <span style={{ flex: 1, height: 44, borderRadius: 6, background: "#E3E9FA" }} />
                    </div>
                    <p style={{ margin: "12px 0 0", fontFamily: family, fontSize: 15, lineHeight: 1.45, color: JOURNAL_MUTED }}>Research 6 months · Installation 6 weeks · Branding 4 weeks · Website 1 week · Zine 1 week</p>
                </div>
                <NaturalStill src={architecture?.src || ""} alt={architecture?.label || "Project architecture"} />
            </JournalBlock>

            <JournalBlock id="system" setSectionRef={setSectionRef} phone={phone}>
                <JournalTitle family={family}>System</JournalTitle>
                <JournalLede family={family}>
                    Nine actions, three roles, two futures. Each button is a research-backed claim about how Karachi gets hotter or cooler, translated into a rule the 3D world obeys.
                </JournalLede>
                <JournalLede family={family} quiet>
                    I split the actions across government, community and individual because the interviews pulled in opposite directions. Urban planners argued that individual action is ineffective without policy. Young people asked why it was on them when the state does nothing. Giving every visitor all three roles answers both. You can see what is in your hands, and what is not.
                </JournalLede>
                <div style={{ display: "flex", flexDirection: phone ? "column" : "row", gap: 28, alignItems: "flex-start" }}>
                    <div style={{ flex: phone ? "none" : "0 0 46%", width: phone ? "100%" : undefined, background: JOURNAL_SURFACE, border: `1px solid ${JOURNAL_LINE}`, borderRadius: 20, padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
                        <div style={{ borderRadius: 12, overflow: "hidden" }}>
                            <RoadScene on={pressed} heat={heat} />
                        </div>
                        <div style={{ display: "flex", gap: 18, alignItems: "center", padding: "0 8px" }}>
                            <p style={{ margin: 0, fontFamily: family, fontSize: phone ? 56 : 72, fontWeight: 600, lineHeight: 0.95, letterSpacing: "-3px", color: figureColor }}>{figure}</p>
                            <div>
                                <b style={{ display: "block", fontFamily: family, fontSize: 24, fontWeight: 600, letterSpacing: "-0.36px", lineHeight: 1.2 }}>{verdict}</b>
                                <p style={{ margin: "6px 0 0", fontFamily: family, fontSize: 15, lineHeight: 1.45, color: JOURNAL_MUTED }}>{verdictCopy}</p>
                            </div>
                        </div>
                        <div style={{ position: "relative", height: 22, margin: "0 8px" }}>
                            <div style={{ position: "absolute", left: 0, right: 0, top: 8, height: 6, borderRadius: 3, background: "linear-gradient(90deg, #1E7A49, #E7C15A, #B3361D)" }} />
                            <div
                                style={{
                                    position: "absolute",
                                    top: 2,
                                    width: 18,
                                    height: 18,
                                    borderRadius: 99,
                                    background: JOURNAL_SURFACE,
                                    border: "2px solid #1C1B18",
                                    left: `calc(${heat * 100}% - 9px)`,
                                    transition: "left 0.25s ease",
                                }}
                            />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "0 8px", fontFamily: family, fontSize: 15, color: JOURNAL_MUTED }}>
                            <span>Renewal</span><span>2120</span><span>Collapse</span>
                        </div>
                        {dialogues.map((note) => (
                            <div key={note.title} style={{ background: JOURNAL_HEAT_SOFT, borderRadius: 12, padding: "14px 16px" }}>
                                <b style={{ display: "block", fontFamily: family, fontSize: 15, fontWeight: 600, lineHeight: 1.4, color: JOURNAL_HEAT }}>{note.title}</b>
                                <p style={{ margin: "2px 0 0", fontFamily: family, fontSize: 15, lineHeight: 1.45 }}>{note.body}</p>
                            </div>
                        ))}
                    </div>
                    <div style={{ flex: "1 1 auto", width: phone ? "100%" : undefined, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <p style={{ margin: 0, flex: 1, fontFamily: family, fontSize: 20, lineHeight: 1.5 }}>Role based actions</p>
                            <button
                                type="button"
                                disabled={!on.length}
                                onClick={() => setPressed([])}
                                style={{
                                    fontFamily: family,
                                    fontSize: 15,
                                    fontWeight: 500,
                                    lineHeight: 1.3,
                                    color: on.length ? "#fff" : "#8A8478",
                                    background: on.length ? accent : "#E6E0D4",
                                    border: "none",
                                    borderRadius: 99,
                                    padding: "8px 18px",
                                    cursor: on.length ? "pointer" : "default",
                                }}
                            >
                                Reset road
                            </button>
                        </div>
                        {SOORAJ_UI.tiers.map((group) => (
                            <div key={group.role}>
                                <p style={{ margin: "8px 0", fontFamily: family, fontSize: 12, fontWeight: 600, letterSpacing: "0.96px", textTransform: "uppercase", color: JOURNAL_MUTED }}>{group.role}</p>
                                <div className="sooraj-role-grid">
                                    {[...group.renewal.map((action) => ({ ...action, tone: "cool" as const })), ...group.collapse.map((action) => ({ ...action, tone: "heat" as const }))].map((action) => {
                                        const active = pressed.includes(action.name)
                                        const tone = action.tone === "cool" ? JOURNAL_RENEW : JOURNAL_HEAT
                                        return (
                                            <button
                                                key={action.name}
                                                type="button"
                                                aria-pressed={active}
                                                onClick={() => toggle(action.name)}
                                                style={{
                                                    fontFamily: family,
                                                    textAlign: "left",
                                                    cursor: "pointer",
                                                    color: ink,
                                                    background: active ? (action.tone === "cool" ? JOURNAL_RENEW_SOFT : JOURNAL_HEAT_SOFT) : JOURNAL_SURFACE,
                                                    border: `1.5px solid ${active ? tone : JOURNAL_LINE}`,
                                                    borderRadius: 14,
                                                    padding: "14px 14px 12px",
                                                }}
                                            >
                                                <span style={{ display: "block" }}>
                                                    <b style={{ display: "block", fontSize: 15, fontWeight: 600, lineHeight: 1.35 }}>{action.name}</b>
                                                    <span style={{ display: "block", marginTop: 4, fontSize: 15, fontWeight: 400, lineHeight: 1.45, color: JOURNAL_MUTED }}>{action.detail}</span>
                                                </span>
                                                <em style={{ marginTop: 14, fontStyle: "normal", fontSize: 15, fontWeight: 500, lineHeight: 1.3, color: tone, border: `1.5px solid ${tone}`, borderRadius: 99, padding: "3px 11px" }}>{action.delta}</em>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <style>
                    {`.sooraj-role-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;align-items:stretch}.sooraj-role-grid>button{height:100%;min-height:188px;display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start}@media (max-width:809.98px){.sooraj-role-grid{grid-template-columns:1fr}.sooraj-role-grid>button{min-height:0}}`}
                </style>
            </JournalBlock>

            <JournalBlock id="experience" setSectionRef={setSectionRef} phone={phone}>
                <JournalTitle family={family}>Experience</JournalTitle>
                <NaturalStill src={room?.src || ""} alt={room?.label || "The room"} />
                <NaturalFilm src={roomFilm?.src || ""} label={roomFilm?.label || "Room mockup"} />
                <div style={{ display: "flex", gap: 10, alignItems: "stretch", flexDirection: phone ? "column" : "row" }}>
                    {SOORAJ_UI.flow.map((item, index) => (
                        <div key={item.label} style={{ display: "contents" }}>
                            <div style={{ flex: 1, borderRadius: 14, border: `1.5px solid ${index === 0 ? accent : JOURNAL_LINE}`, background: index === 0 ? "#E3E9FA" : JOURNAL_SURFACE, padding: 18 }}>
                                <span style={{ display: "block", fontFamily: family, fontSize: 12, fontWeight: 600, letterSpacing: "0.96px", color: JOURNAL_MUTED }}>{String(index + 1).padStart(2, "0")}</span>
                                <b style={{ display: "block", marginTop: 2, fontFamily: family, fontSize: 20, fontWeight: 600, letterSpacing: "-0.2px" }}>{item.label}</b>
                                <p style={{ margin: "8px 0 0", fontFamily: family, fontSize: 15, lineHeight: 1.45, color: JOURNAL_MUTED }}>{item.detail}</p>
                            </div>
                            {index < SOORAJ_UI.flow.length - 1 && !phone ? <span style={{ alignSelf: "center", fontFamily: family, fontSize: 24, color: JOURNAL_MUTED }}>→</span> : null}
                        </div>
                    ))}
                </div>
                <JournalLede family={family}>
                    Using the Futures Wheel and the Experiential Futures Ladder, I built two versions of Shahra-e-Faisal. Collapse is toxic air, cracked asphalt and a permanent heat fog. Renewal is 30% green cover, rooftop gardens, walkable streets, wind and solar.
                </JournalLede>
                <div style={{ display: "grid", gridTemplateColumns: phone ? "1fr" : "1fr 1fr 1fr", gap: 16 }}>
                    {[
                        ["Two futures", "One road in 2120, pulled between renewal and collapse.", "https://cdn.jsdelivr.net/gh/nabiasheikh14-creator/portfolio@408031853393997955fd80b3b058d3439be054e2/framer/case/sooraj/split.jpg", ink],
                        ["Collapse", "Toxic air, cracked asphalt and a permanent heat fog.", "https://cdn.jsdelivr.net/gh/nabiasheikh14-creator/portfolio@408031853393997955fd80b3b058d3439be054e2/framer/case/sooraj/collapse.jpg", JOURNAL_HEAT],
                        ["Renewal", "30% green cover, rooftop gardens, walkable streets, wind and solar.", "https://cdn.jsdelivr.net/gh/nabiasheikh14-creator/portfolio@408031853393997955fd80b3b058d3439be054e2/framer/case/sooraj/renewal.jpg", JOURNAL_RENEW],
                    ].map(([title, body, src, color]) => (
                        <div key={title} style={{ background: JOURNAL_SURFACE, border: `1px solid ${JOURNAL_LINE}`, borderRadius: 14, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                            <img src={src} alt={title} style={{ display: "block", width: "100%", height: "auto", borderRadius: 14 }} />
                            <div style={{ padding: "8px 8px 8px" }}>
                                <b style={{ display: "block", fontFamily: family, fontSize: 20, fontWeight: 600, letterSpacing: "-0.2px", color }}>{title}</b>
                                <p style={{ margin: "6px 0 0", fontFamily: family, fontSize: 15, lineHeight: 1.45, color: JOURNAL_MUTED }}>{body}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: phone ? "1fr" : "1fr 1fr", gap: 16 }}>
                    <JournalCard>
                        <b style={{ fontFamily: family, fontSize: 20, fontWeight: 600, letterSpacing: "-0.2px" }}>Why I threw the prototype away</b>
                        <p style={{ margin: "8px 0 0", fontFamily: family, fontSize: 15, lineHeight: 1.45, color: JOURNAL_MUTED }}>
                            The first build was a TouchDesigner piece. Testers could not read it until someone explained it. If a button said solar panels, they expected to see the panels. I rebuilt the scene on the road most Karachiites have sat in traffic, flooded or baked on.
                        </p>
                    </JournalCard>
                    <JournalCard>
                        <b style={{ fontFamily: family, fontSize: 20, fontWeight: 600, letterSpacing: "-0.2px" }}>Every press answers five ways</b>
                        <p style={{ margin: "8px 0 0", fontFamily: family, fontSize: 15, lineHeight: 1.45, color: JOURNAL_MUTED }}>
                            Visitors could end in a mixed future, because that is closer to how real change happens.
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                            {["Glowing button", "A message", "A line rooted in real life", "A sound", "A temperature"].map((chip) => (
                                <span key={chip} style={{ background: "#E3E9FA", borderRadius: 99, padding: "6px 14px", fontFamily: family, fontSize: 15, lineHeight: 1.45 }}>{chip}</span>
                            ))}
                        </div>
                    </JournalCard>
                </div>
            </JournalBlock>

            <JournalBlock id="beyond" setSectionRef={setSectionRef} phone={phone}>
                <JournalTitle family={family}>Beyond the room</JournalTitle>
                <JournalLede family={family}>
                    An installation lasts an afternoon. I designed three touchpoints so the idea kept working after people left.
                </JournalLede>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {touchpoints.map((item, index) => (
                        <span key={item.title}>{pill(item.title, touch === index, () => setTouch(index))}</span>
                    ))}
                </div>
                <div style={{ background: JOURNAL_SURFACE, border: `1px solid ${JOURNAL_LINE}`, borderRadius: 14, padding: phone ? 16 : 28, display: "grid", gridTemplateColumns: phone || touch !== 0 ? "1fr" : "0.8fr 1.2fr", gap: 28, alignItems: "center" }}>
                    <div>
                        <h3 style={{ margin: 0, fontFamily: family, fontSize: 24, fontWeight: 600, letterSpacing: "-0.36px" }}>{touchpoints[touch].title}</h3>
                        <p style={{ margin: "10px 0 0", fontFamily: family, fontSize: 20, lineHeight: 1.5, color: JOURNAL_MUTED }}>{touchpoints[touch].body}</p>
                    </div>
                    {touch === 0 ? (
                        <ZineFlip family={family} displayFamily={family} ink={ink} accent={accent} />
                    ) : (
                        <NaturalStill src={touchpoints[touch].image || ""} alt={touchpoints[touch].title} />
                    )}
                </div>
            </JournalBlock>

            <JournalBlock id="decisions" setSectionRef={setSectionRef} phone={phone}>
                <JournalTitle family={family}>Decisions</JournalTitle>
                <div style={{ borderTop: `1px solid ${JOURNAL_LINE}` }}>
                    {SOORAJ_UI.decisions.map((item, index) => {
                        const open = openDecision === index
                        return (
                            <article key={item.title} style={{ borderBottom: `1px solid ${JOURNAL_LINE}` }}>
                                <button
                                    type="button"
                                    onClick={() => setOpenDecision(open ? null : index)}
                                    style={{ width: "100%", display: "flex", gap: 16, alignItems: "center", padding: "22px 4px", background: "none", border: 0, cursor: "pointer", textAlign: "left", fontFamily: family }}
                                >
                                    <span style={{ width: 56, fontSize: 30, fontWeight: 300, lineHeight: 1.1, letterSpacing: "-0.6px", color: JOURNAL_MUTED }}>{String(index + 1).padStart(2, "0")}</span>
                                    <b style={{ flex: 1, fontSize: 20, fontWeight: 600, letterSpacing: "-0.2px", lineHeight: 1.25 }}>{item.title}</b>
                                    <span style={{ width: 32, height: 32, borderRadius: 99, display: "grid", placeItems: "center", fontSize: 18, background: open ? ink : "transparent", color: open ? "#F3EFE8" : ink, border: open ? "none" : `1.5px solid ${JOURNAL_LINE}` }}>{open ? "−" : "+"}</span>
                                </button>
                                {open ? (
                                    <div style={{ padding: "0 4px 26px 76px" }}>
                                        {item.parts.map((part) => (
                                            <div key={part.label} style={{ display: "grid", gridTemplateColumns: phone ? "1fr" : "110px 1fr", gap: phone ? 4 : 20, padding: "14px 0", borderTop: part.label === "Decision" ? "none" : `1px solid ${JOURNAL_LINE}` }}>
                                                <small style={{ fontFamily: family, fontSize: 12, fontWeight: 600, letterSpacing: "0.96px", textTransform: "uppercase", color: JOURNAL_MUTED }}>{part.label}</small>
                                                <p style={{ margin: 0, fontFamily: family, fontSize: 17, lineHeight: 1.55, color: part.label === "Trade-off" ? JOURNAL_HEAT : ink }}>{part.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                            </article>
                        )
                    })}
                </div>
            </JournalBlock>

            <JournalBlock id="outcome" setSectionRef={setSectionRef} phone={phone}>
                <JournalTitle family={family}>Outcome</JournalTitle>
                <div style={{ display: "grid", gridTemplateColumns: phone ? "1fr 1fr" : "repeat(4, minmax(0, 1fr))", gap: 16 }}>
                    {SOORAJ_UI.outcomeStats.map((item) => (
                        <div key={item.caption} style={{ background: JOURNAL_SURFACE, border: `1px solid ${JOURNAL_LINE}`, borderRadius: 14, padding: "22px 22px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                            <b style={{ fontFamily: family, fontSize: phone ? 48 : 72, fontWeight: 600, lineHeight: 1, letterSpacing: "-2.88px" }}>{item.value}</b>
                            <span style={{ fontFamily: family, fontSize: 15, lineHeight: 1.45, color: JOURNAL_MUTED }}>{item.caption}</span>
                        </div>
                    ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: phone ? "1fr" : "1fr 1fr", gap: 16 }}>
                    <JournalCard>
                        <p style={{ margin: 0, fontFamily: family, fontSize: 17, lineHeight: 1.55 }}>
                            Sooraj Nagar was exhibited as my final-year thesis at the Indus Valley School of Art and Architecture in Karachi.
                        </p>
                    </JournalCard>
                    <JournalCard>
                        <p style={{ margin: 0, fontFamily: family, fontSize: 17, lineHeight: 1.55 }}>
                            A research-led, locally rooted experience can move young people from “Karachi is doomed” to “here is what would change it”. The same method can travel to any city facing extreme heat.
                        </p>
                    </JournalCard>
                </div>
                <NaturalStill src={futures?.src || ""} alt="Two futures" />
            </JournalBlock>

            <JournalBlock id="reflection" setSectionRef={setSectionRef} phone={phone}>
                <JournalTitle family={family}>Reflection</JournalTitle>
                <div style={{ display: "grid", gridTemplateColumns: phone ? "1fr" : "1fr 1fr 1fr", gap: 16 }}>
                    {SOORAJ_UI.reflections.map((item) => (
                        <JournalCard key={item.title}>
                            <b style={{ display: "block", fontFamily: family, fontSize: 20, fontWeight: 600, letterSpacing: "-0.2px", lineHeight: 1.25 }}>{item.title}</b>
                            <p style={{ margin: "8px 0 0", fontFamily: family, fontSize: 15, lineHeight: 1.45, color: JOURNAL_MUTED }}>{item.body}</p>
                        </JournalCard>
                    ))}
                </div>
            </JournalBlock>
        </>
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
    const phone = useMediaQuery(PHONE_MQ)
    const blocks = hasText(body) ? storyBlocks(body) : []
    const inserts = (frames || []).filter(
        (f) => section && f.section === section && hasMedia(f.src),
    )
    const labeled = blocks.filter((block) => block.subhead)
    const asCards = labeled.length >= 2
    type StoryPiece =
        | { kind: "prose"; key: string; block: { subhead: string; text: string } }
        | { kind: "cards"; key: string; items: { subhead: string; text: string }[] }
        | { kind: "media"; key: string; frames: typeof inserts }
    const pieces: StoryPiece[] = []
    let run: { subhead: string; text: string }[] = []
    const flush = () => {
        if (!run.length) return
        pieces.push({ kind: "cards", key: `c-${pieces.length}`, items: run })
        run = []
    }
    blocks.forEach((block, i) => {
        const here = inserts.filter((frame) => frame.after === i + 1)
        if (asCards && block.subhead) run.push(block)
        else {
            flush()
            pieces.push({ kind: "prose", key: `p-${i}`, block })
        }
        if (here.length) {
            flush()
            pieces.push({ kind: "media", key: `m-${i}`, frames: here })
        }
    })
    flush()
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
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
            {pieces.map((piece) => {
                if (piece.kind === "media") {
                    return piece.frames.map((frame, n) => (
                        <FramePiece key={`${piece.key}-${n}`} frame={frame} accent={accent || ""} />
                    ))
                }
                if (piece.kind === "prose") {
                    const block = piece.block
                    return (
                        <div key={piece.key} style={{ display: "flex", flexDirection: "column", gap: block.subhead && block.text ? 6 : 0 }}>
                            {block.subhead ? (
                                <div style={{ fontFamily: family, fontSize: 16, fontWeight: 600, lineHeight: 1.35, color: ink }}>
                                    {block.subhead}
                                </div>
                            ) : null}
                            {block.text ? (
                                <p style={{ margin: 0, fontFamily: family, fontSize: BODY_SIZE, lineHeight: BODY_LH, color: BODY_INK }}>
                                    {linkify(block.text)}
                                </p>
                            ) : null}
                        </div>
                    )
                }
                return (
                    <div
                        key={piece.key}
                        style={{
                            display: "grid",
                            gridTemplateColumns: phone ? "1fr" : "1fr 1fr",
                            gap: 12,
                        }}
                    >
                        {piece.items.map((item, index) => (
                            <div
                                key={`${item.subhead}-${index}`}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8,
                                    textAlign: "left",
                                    background: "transparent",
                                    border: OUTLINE,
                                    borderRadius: FRAME_RADIUS,
                                    padding: "16px 16px 18px",
                                    minWidth: 0,
                                }}
                            >
                                <span style={{ fontFamily: family, fontSize: 16, fontWeight: 600, lineHeight: 1.35, color: ink }}>
                                    {item.subhead}
                                </span>
                                {item.text ? (
                                    <span style={{ fontFamily: family, fontSize: 15, fontWeight: 400, lineHeight: 1.55, color: BODY_INK }}>
                                        {linkify(item.text)}
                                    </span>
                                ) : null}
                            </div>
                        ))}
                    </div>
                )
            })}
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
    const family = SANS
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
                href="https://fonts.googleapis.com/css2?family=Annie+Use+Your+Telescope&family=Outfit:wght@300;400;500;600;700&display=swap"
                rel="stylesheet"
            />
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: viewportH,
                    overflow: "hidden",
                    borderTop: contained ? "none" : `1px solid ${ink}`,
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
        tools: "Participatory futures workshops, surveys, expert interviews, Futures Wheel, XF Ladder, LOOPY, Unity 3D, SketchUp, TouchDesigner, Figma, FigJam",
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
        accent: "#2C6BE0",
        slug: "sooraj-nagar",
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
                src: "https://cdn.jsdelivr.net/gh/nabiasheikh14-creator/portfolio@0e72c1ff56aef3811e27ef6c699e0acbbbf739be/framer/films/sooraj-room.mp4",
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
