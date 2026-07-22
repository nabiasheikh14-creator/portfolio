import { useEffect, type CSSProperties, type ReactNode } from "react"
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
const LABEL = "#888888"

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
    footerSubline: string
    footerDeskScale: number
    footerHeight: number
    footerHeadlineSize: number
    footerInstagramUrl: string
    footerLinkedinUrl: string
    footerEmail: string
    style?: CSSProperties
}

function slugFromPath(): string {
    if (typeof window === "undefined") return ""
    const parts = window.location.pathname.replace(/\/$/, "").split("/").filter(Boolean)
    if (parts[0] === "work" && parts[1]) return parts[1]
    return ""
}

/**
 * Work Case — complete UI/UX case study.
 * Heat-style meta hero, then skimmable → deep sections:
 * Context → Problem → Goals & constraints → Process → Key decisions →
 * Final design → Outcome → Reflection.
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 2400
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any
 */
export default function WorkCase(props: WorkCaseProps) {
    const {
        catalog = DEFAULT_CATALOG,
        gridOpacity = 0.12,
        cream = CREAM,
        ink = INK,
        muted = MUTED,
        accent = "#2C6BE0",
        footerSubline = "The rest of the story lives on the homepage.",
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
    const gridAlpha = Math.min(0.14, Math.max(0.04, Number(gridOpacity) || 0.12))

    const slug = !isStatic ? slugFromPath() : ""
    const project =
        (slug && (catalog || []).find((p) => p.slug === slug)) ||
        (catalog || [])[0] ||
        DEFAULT_CATALOG[0]

    const related = (catalog || [])
        .filter((p) => p.slug !== project.slug)
        .slice(0, 3)

    const decisions = [project.decision1, project.decision2, project.decision3].filter(
        (d) => d && String(d).trim(),
    )

    const tools = String(project.tools || "")
        .split(/[,/|]+/)
        .map((s) => s.trim())
        .filter(Boolean)

    useEffect(() => {
        if (typeof document === "undefined") return
        document.querySelectorAll("[data-archive-mascot]").forEach((n) => n.remove())
        // Footer owns desk art — clear any legacy fixed laptop corner
        document.querySelectorAll('[data-desk-corner="laptop"]').forEach((n) => n.remove())
    }, [])

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

    // Framer may pass a collapsed width/height via props.style — never let that win.
    const framerStyle = { ...(props.style || {}) } as CSSProperties
    delete framerStyle.width
    delete framerStyle.height
    delete framerStyle.minWidth
    delete framerStyle.minHeight
    delete framerStyle.maxWidth
    delete framerStyle.maxHeight

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

            <DeskBack href="/work" label="Back" ariaLabel="Back to work" accent={accent} />

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

            <div
                style={{
                    position: "relative",
                    zIndex: 1,
                    maxWidth: 1360,
                    margin: "0 auto",
                    padding: "120px 40px 80px",
                    boxSizing: "border-box",
                }}
            >
                {/* ——— HERO (5-second skim) ——— */}
                {/* auto-fit: no @media — Framer strips media queries from code-component <style> */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: 28,
                        marginBottom: 36,
                    }}
                >
                    <MetaCol label="project">
                        <h1
                            style={{
                                margin: "0 0 18px",
                                fontSize: "clamp(28px, 3.2vw, 42px)",
                                fontWeight: 600,
                                letterSpacing: "-0.03em",
                                lineHeight: 1.05,
                                fontFamily: displayFamily,
                            }}
                        >
                            {project.title}
                        </h1>
                        <a
                            href="/work"
                            aria-label="Back to work"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 44,
                                height: 44,
                                border: `1.5px solid ${INK}`,
                                borderRadius: "50%",
                                background: "rgba(255,255,255,0.85)",
                                color: project.accent || "#2C6BE0",
                                textDecoration: "none",
                                fontSize: 20,
                                fontWeight: 600,
                            }}
                        >
                            ←
                        </a>
                    </MetaCol>

                    <MetaCol label="bio">
                        <div
                            style={{
                                fontSize: 22,
                                fontWeight: 600,
                                letterSpacing: "-0.02em",
                                lineHeight: 1.2,
                                marginBottom: 12,
                            }}
                        >
                            {project.subtitle}
                        </div>
                        <p
                            style={{
                                margin: 0,
                                fontSize: 15,
                                lineHeight: 1.55,
                                color: MUTED,
                                maxWidth: 320,
                            }}
                        >
                            {project.overview}
                        </p>
                    </MetaCol>

                    <MetaCol label="role / tools">
                        <div
                            style={{
                                fontSize: 18,
                                fontWeight: 500,
                                letterSpacing: "-0.02em",
                                marginBottom: 10,
                            }}
                        >
                            {project.role}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {(tools.length ? tools : ["Figma", "Research", "Prototype"]).map(
                                (t) => (
                                    <div
                                        key={t}
                                        style={{
                                            fontSize: 15,
                                            color: MUTED,
                                            letterSpacing: "-0.01em",
                                        }}
                                    >
                                        {t}
                                    </div>
                                ),
                            )}
                        </div>
                    </MetaCol>

                    <MetaCol label="timeline">
                        <div
                            style={{
                                fontSize: 22,
                                fontWeight: 500,
                                letterSpacing: "-0.02em",
                            }}
                        >
                            {project.timeline || project.year}
                        </div>
                        {project.timeline && project.year && project.timeline !== project.year ? (
                            <div style={{ marginTop: 8, fontSize: 14, color: MUTED }}>
                                {project.year}
                            </div>
                        ) : null}
                    </MetaCol>
                </div>

                {/* Hero visual / outcome stripe */}
                <p
                    style={{
                        margin: "0 0 20px",
                        fontSize: 18,
                        lineHeight: 1.45,
                        color: INK,
                        maxWidth: 720,
                        fontWeight: 500,
                        letterSpacing: "-0.02em",
                    }}
                >
                    {oneLiner(project)}
                </p>
                <MediaBlock
                    src={project.heroImage}
                    accent={project.accent}
                    caption="Hero / key screen"
                    placeholder="Drop hero imagery here"
                    tall
                />

                {/* ——— DEPTH SECTIONS ——— */}
                <Section kicker="01" title="Context" body={project.context} />
                <MediaBlock
                    src={project.contextImage}
                    accent={project.accent}
                    caption="Product / user context"
                    placeholder="Drop context imagery here"
                />

                <Section kicker="02" title="The problem" body={project.problem} />
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: 16,
                        marginBottom: 56,
                    }}
                >
                    <MediaBlock
                        src={project.problemImage}
                        accent={project.accent}
                        caption="Problem in the wild"
                        placeholder="Drop problem imagery here"
                        fill
                    />
                    <MediaBlock
                        src={project.researchImage}
                        accent={project.accent}
                        caption="Research / insight artifact"
                        placeholder="Drop research imagery here"
                        fill
                    />
                </div>

                <div style={{ marginBottom: 56 }}>
                    <SectionHeading kicker="03" title="Goals & constraints" />
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                            gap: 20,
                        }}
                    >
                        <TextCard title="Goals" body={project.goals} accent={project.accent} />
                        <TextCard
                            title="Constraints"
                            body={project.constraints}
                            accent={project.accent}
                        />
                    </div>
                </div>

                <Section kicker="04" title="Process" body={project.process} />
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: 16,
                        marginBottom: 16,
                    }}
                >
                    <MediaBlock
                        src={project.sketchImage}
                        accent={project.accent}
                        caption="Sketches"
                        placeholder="Drop sketches here"
                        fill
                    />
                    <MediaBlock
                        src={project.wireframeImage}
                        accent={project.accent}
                        caption="Wireframes"
                        placeholder="Drop wireframes here"
                        fill
                    />
                    <MediaBlock
                        src={project.flowImage}
                        accent={project.accent}
                        caption="Flows / IA"
                        placeholder="Drop flow diagram here"
                        fill
                    />
                </div>
                <MediaBlock
                    src={project.processImage}
                    accent={project.accent}
                    caption="Process overview — the messy middle"
                    placeholder="Drop process collage here"
                />
                <MediaBlock
                    src={project.iterationImage}
                    accent={project.accent}
                    caption="Iteration / before → after"
                    placeholder="Drop iteration comparison here"
                />

                {decisions.length > 0 && (
                    <div style={{ marginBottom: 56 }}>
                        <SectionHeading kicker="05" title="Key decisions" />
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(220px, 1fr))",
                                gap: 16,
                            }}
                        >
                            {decisions.map((d, i) => (
                                <TextCard
                                    key={i}
                                    title={`Decision ${i + 1}`}
                                    body={d}
                                    accent={project.accent}
                                    compact
                                />
                            ))}
                        </div>
                    </div>
                )}

                <SectionHeading kicker="06" title="Final design" />
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: 16,
                        marginBottom: 16,
                    }}
                >
                    <MediaBlock
                        src={project.finalImage1}
                        accent={project.accent}
                        caption="Primary screen / flow"
                        placeholder="Drop final screen 1 here"
                        fill
                    />
                    <MediaBlock
                        src={project.finalImage2}
                        accent={project.accent}
                        caption="Supporting screen / state"
                        placeholder="Drop final screen 2 here"
                        fill
                    />
                </div>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: 16,
                        marginBottom: 16,
                    }}
                >
                    <MediaBlock
                        src={project.finalImage3}
                        accent={project.accent}
                        caption="Detail / component"
                        placeholder="Drop final screen 3 here"
                        fill
                    />
                    <MediaBlock
                        src={project.finalImage4}
                        accent={project.accent}
                        caption="Edge case / empty state"
                        placeholder="Drop final screen 4 here"
                        fill
                    />
                </div>
                <VideoBlock
                    src={project.prototypeVideo}
                    accent={project.accent}
                    caption="Prototype walkthrough / motion study"
                />

                <Section kicker="07" title="Outcome" body={project.outcome} />
                <MediaBlock
                    src={project.outcomeImage}
                    accent={project.accent}
                    caption="Outcome / shipped result"
                    placeholder="Drop outcome imagery here"
                />
                {project.reflection ? (
                    <Section kicker="08" title="Reflection" body={project.reflection} />
                ) : null}

                {/* Related */}
                {related.length > 0 && (
                    <div style={{ marginTop: 72 }}>
                        <h2
                            style={{
                                margin: "0 0 24px",
                                fontSize: "clamp(32px, 5vw, 52px)",
                                fontWeight: 600,
                                letterSpacing: "-0.03em",
                                lineHeight: 1,
                            }}
                        >
                            Related projects
                        </h2>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                                gap: 16,
                            }}
                        >
                            {related.map((r) => (
                                <a
                                    key={r.slug}
                                    href={`/work/${r.slug}`}
                                    style={{
                                        display: "block",
                                        minHeight: 220,
                                        background: `linear-gradient(145deg, ${r.accent} 0%, #111 120%)`,
                                        textDecoration: "none",
                                        color: "#fff",
                                        padding: 20,
                                        boxSizing: "border-box",
                                        position: "relative",
                                    }}
                                >
                                    <div style={{ position: "absolute", left: 20, bottom: 20, right: 20 }}>
                                        <div
                                            style={{
                                                fontSize: 22,
                                                fontWeight: 600,
                                                letterSpacing: "-0.02em",
                                            }}
                                        >
                                            {r.title}
                                        </div>
                                        <div
                                            style={{
                                                marginTop: 6,
                                                fontSize: 13,
                                                opacity: 0.9,
                                            }}
                                        >
                                            {r.subtitle}
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <DeskWorkFooter
                accent={accent}
                cream={cream}
                ink={ink}
                muted={muted}
                subline={footerSubline}
                deskScale={footerDeskScale}
                railHeight={footerHeight}
                headlineSize={footerHeadlineSize}
                instagramUrl={footerInstagramUrl}
                linkedinUrl={footerLinkedinUrl}
                email={footerEmail}
                font={props.font}
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
        Object.assign(a.style, {
            position: "fixed",
            top: "48px",
            left: "24px",
            zIndex: "1200",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 22px",
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
            a.remove()
        }
    }, [href, label, ariaLabel, accent])

    return null
}

function oneLiner(p: ProjectRecord) {
    const problem = (p.problem || "").split(/[.!?]/)[0]
    const outcome = (p.outcome || "").split(/[.!?]/)[0]
    if (problem && outcome) return `${problem.trim()}. → ${outcome.trim()}.`
    return p.overview
}

function MetaCol({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div>
            <div
                style={{
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: "-0.5px",
                    textTransform: "lowercase",
                    color: LABEL,
                    marginBottom: 14,
                }}
            >
                {label}
            </div>
            {children}
        </div>
    )
}

function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
    return (
        <div style={{ marginBottom: 18 }}>
            <div
                style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "-1px",
                    textTransform: "uppercase",
                    color: LABEL,
                    marginBottom: 8,
                }}
            >
                {kicker}
            </div>
            <h2
                style={{
                    margin: 0,
                    fontSize: "clamp(28px, 4vw, 40px)",
                    fontWeight: 600,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.1,
                }}
            >
                {title}
            </h2>
        </div>
    )
}

function Section({
    kicker,
    title,
    body,
}: {
    kicker: string
    title: string
    body: string
}) {
    if (!body || !String(body).trim()) return null
    return (
        <div style={{ marginBottom: 56, maxWidth: 720 }}>
            <SectionHeading kicker={kicker} title={title} />
            <p
                style={{
                    margin: 0,
                    fontSize: 17,
                    lineHeight: 1.65,
                    color: MUTED,
                    whiteSpace: "pre-wrap",
                }}
            >
                {body}
            </p>
        </div>
    )
}

function TextCard({
    title,
    body,
    accent,
    compact,
}: {
    title: string
    body: string
    accent: string
    compact?: boolean
}) {
    if (!body || !String(body).trim()) return null
    return (
        <div
            style={{
                background: "rgba(255,255,255,0.72)",
                border: `1.5px solid ${INK}`,
                padding: compact ? "20px 18px" : "28px 24px",
                boxSizing: "border-box",
                minHeight: compact ? 160 : 200,
            }}
        >
            <div
                style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: INK,
                    borderLeft: `4px solid ${accent}`,
                    paddingLeft: 10,
                    marginBottom: 14,
                }}
            >
                {title}
            </div>
            <p
                style={{
                    margin: 0,
                    fontSize: 15,
                    lineHeight: 1.55,
                    color: MUTED,
                    whiteSpace: "pre-wrap",
                }}
            >
                {body}
            </p>
        </div>
    )
}

function MediaBlock({
    src,
    accent,
    caption,
    placeholder = "Drop project imagery here",
    tall,
    fill,
}: {
    src?: string
    accent: string
    caption?: string
    placeholder?: string
    tall?: boolean
    fill?: boolean
}) {
    const url = resolveMedia(src)
    return (
        <figure
            style={{
                width: "100%",
                margin: tall || !fill ? "0 0 56px" : 0,
                padding: 0,
            }}
        >
            <div
                style={{
                    width: "100%",
                    minHeight: tall ? 420 : fill ? 240 : 300,
                    border: `1.5px solid ${INK}`,
                    background: url
                        ? "#111"
                        : `linear-gradient(145deg, ${accent} 0%, #111 125%)`,
                    position: "relative",
                    overflow: "hidden",
                    boxSizing: "border-box",
                }}
            >
                {url ? (
                    <img
                        src={url}
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
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10,
                            color: "rgba(255,255,255,0.88)",
                            fontSize: 14,
                            fontWeight: 500,
                            letterSpacing: "-0.01em",
                            padding: 24,
                            textAlign: "center",
                        }}
                    >
                        <div
                            style={{
                                width: 44,
                                height: 44,
                                border: "1.5px solid rgba(255,255,255,0.7)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 20,
                            }}
                        >
                            ▦
                        </div>
                        {placeholder}
                    </div>
                )}
            </div>
            {caption ? (
                <figcaption
                    style={{
                        marginTop: 10,
                        fontSize: 13,
                        lineHeight: 1.4,
                        color: LABEL,
                        letterSpacing: "-0.01em",
                    }}
                >
                    {caption}
                </figcaption>
            ) : null}
        </figure>
    )
}

function VideoBlock({
    src,
    accent,
    caption,
}: {
    src?: string
    accent: string
    caption?: string
}) {
    const url = resolveMedia(src)
    return (
        <figure style={{ width: "100%", margin: "0 0 56px", padding: 0 }}>
            <div
                style={{
                    width: "100%",
                    minHeight: 420,
                    border: `1.5px solid ${INK}`,
                    background: url
                        ? "#000"
                        : `linear-gradient(160deg, ${accent} 0%, #0a0a0a 120%)`,
                    position: "relative",
                    overflow: "hidden",
                    boxSizing: "border-box",
                }}
            >
                {url ? (
                    <video
                        src={url}
                        controls
                        playsInline
                        style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            background: "#000",
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
                            gap: 14,
                            color: "rgba(255,255,255,0.9)",
                            padding: 28,
                            textAlign: "center",
                        }}
                    >
                        <div
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: "50%",
                                border: "1.5px solid rgba(255,255,255,0.85)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 22,
                                paddingLeft: 4,
                            }}
                        >
                            ▶
                        </div>
                        <div
                            style={{
                                fontSize: 15,
                                fontWeight: 600,
                                letterSpacing: "-0.01em",
                            }}
                        >
                            Drop prototype video here
                        </div>
                        <div
                            style={{
                                fontSize: 13,
                                opacity: 0.8,
                                maxWidth: 320,
                                lineHeight: 1.4,
                            }}
                        >
                            MP4 / WebM walkthrough of the final flow
                        </div>
                    </div>
                )}
            </div>
            {caption ? (
                <figcaption
                    style={{
                        marginTop: 10,
                        fontSize: 13,
                        lineHeight: 1.4,
                        color: LABEL,
                        letterSpacing: "-0.01em",
                    }}
                >
                    {caption}
                </figcaption>
            ) : null}
        </figure>
    )
}

function resolveMedia(value: unknown): string {
    if (!value) return ""
    if (typeof value === "string") return value.trim()
    if (typeof value === "object" && value !== null) {
        const v = value as { src?: string; url?: string }
        return String(v.src || v.url || "").trim()
    }
    return ""
}

const STAGE_W = 1440
const STAGE_H = 900
const IMG = "https://framerusercontent.com/images/"
const FOOTER_ANNIE = DEFAULT_ANNIE

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
        subline = "The rest of the story lives on the homepage.",
        homeHref = "/",
        instagramUrl = "https://instagram.com/",
        linkedinUrl = "https://linkedin.com/",
        email = "hello@example.com",
        deskScale,
        objectScale = 1,
        railHeight = 280,
        headlineSize = 36,
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

    return (
        <footer
            style={{
                position: "relative",
                width: "100vw",
                maxWidth: "100vw",
                marginTop: 64,
                marginLeft: "calc(50% - 50vw)",
                background: cream,
                overflow: "hidden",
                fontFamily: family,
                ...style,
            }}
        >
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
                    aria-hidden
                    style={{
                        position: "absolute",
                        right: "-4%",
                        bottom: 0,
                        width: STAGE_W,
                        height: STAGE_H,
                        transform: `scale(${stageScale})`,
                        transformOrigin: "bottom right",
                        pointerEvents: "none",
                    }}
                >
                    {HOME_FOOTER_LAYERS.map((layer) => (
                        <img
                            key={layer.key}
                            src={`${IMG}${layer.hash}.png`}
                            alt=""
                            draggable={false}
                            style={{
                                position: "absolute",
                                inset: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "fill",
                                display: "block",
                                userSelect: "none",
                            }}
                        />
                    ))}
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
                        title="Go to homepage"
                        aria-label="Go to homepage"
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
    footerSubline: {
        type: ControlType.String,
        title: "Footer Home Text",
        displayTextArea: true,
        defaultValue: "The rest of the story lives on the homepage.",
    },
    footerInstagramUrl: {
        type: ControlType.String,
        title: "Footer Instagram",
        defaultValue: "https://instagram.com/",
    },
    footerLinkedinUrl: {
        type: ControlType.String,
        title: "Footer LinkedIn",
        defaultValue: "https://linkedin.com/",
    },
    footerEmail: {
        type: ControlType.String,
        title: "Footer Email",
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
