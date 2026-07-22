import { useEffect, type CSSProperties, type ReactNode } from "react"
import {
    addPropertyControls,
    ControlType,
    RenderTarget,
    useIsStaticRenderer,
} from "framer"

const SANS =
    '"Inter Display", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
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
    footerHeadline: string
    footerSubline: string
    footerObjectScale: number
    footerRailHeight: number
    footerHeadlineSize: number
    footerObjects: any[]
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
        footerHeadline = "back to the desk",
        footerSubline = "Case closed for now — wander home for the rest of the desk.",
        footerObjectScale = 1,
        footerRailHeight = 220,
        footerHeadlineSize = 48,
        footerObjects = DEFAULT_FOOTER_OBJECTS,
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
                accent={project.accent || accent}
                cream={cream}
                ink={ink}
                muted={muted}
                headline={footerHeadline}
                subline={footerSubline}
                objectScale={footerObjectScale}
                railHeight={footerRailHeight}
                headlineSize={footerHeadlineSize}
                displayFont={props.displayFont}
                bodyFont={props.font}
                objects={footerObjects}
            />
        </div>
    )
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
const DEFAULT_IMG = "https://framerusercontent.com/images/"
const DEFAULT_ANNIE = '"Annie Use Your Telescope", "Bradley Hand", cursive'
const DEFAULT_SANS =
    '"Inter Display", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

type FooterObject = {
    key: string
    imageUrl: string
    cropX: number
    cropY: number
    cropW: number
    cropH: number
    width: number
    bottom: number
    rotate: number
    z: number
}

const DEFAULT_FOOTER_OBJECTS: FooterObject[] = [
    {
        key: "books",
        imageUrl: `${DEFAULT_IMG}z3PLroDJfbET05ZaDmzpA5lIAk.png`,
        cropX: 560,
        cropY: 95,
        cropW: 190,
        cropH: 150,
        width: 150,
        bottom: 18,
        rotate: -6,
        z: 2,
    },
    {
        key: "journal",
        imageUrl: `${DEFAULT_IMG}JPLbpkF1Jd17vRUT1rfmmgPhfQ.png`,
        cropX: 241,
        cropY: 717,
        cropW: 167,
        cropH: 126,
        width: 168,
        bottom: 8,
        rotate: -3,
        z: 3,
    },
    {
        key: "schedule",
        imageUrl: `${DEFAULT_IMG}NDoJcAe2hm9jNoRn1l3KPiH88kM.png`,
        cropX: 388,
        cropY: 485,
        cropW: 76,
        cropH: 68,
        width: 96,
        bottom: 42,
        rotate: 8,
        z: 4,
    },
    {
        key: "chutney",
        imageUrl: `${DEFAULT_IMG}AwkrKCuhUkRurlYPAzFRI4yw.png`,
        cropX: 542,
        cropY: 493,
        cropW: 84,
        cropH: 75,
        width: 108,
        bottom: 36,
        rotate: -4,
        z: 5,
    },
    {
        key: "sooraj",
        imageUrl: `${DEFAULT_IMG}O3MmyItiSJFvHk9GjYSG9NdqSc.png`,
        cropX: 556,
        cropY: 428,
        cropW: 68,
        cropH: 60,
        width: 92,
        bottom: 78,
        rotate: 0,
        z: 6,
    },
    {
        key: "laptop",
        imageUrl: `${DEFAULT_IMG}ffeeCWEVauyRc2jUztvEkKArptM.png`,
        cropX: 570,
        cropY: 526,
        cropW: 354,
        cropH: 245,
        width: 280,
        bottom: 0,
        rotate: 0,
        z: 7,
    },
    {
        key: "phone",
        imageUrl: `${DEFAULT_IMG}iokbHxpk1MBj2DyMk1qoueeeQM.png`,
        cropX: 963,
        cropY: 717,
        cropW: 100,
        cropH: 98,
        width: 110,
        bottom: 14,
        rotate: 5,
        z: 8,
    },
    {
        key: "notes",
        imageUrl: `${DEFAULT_IMG}52nGQQ7gLqDiguh8AvcoksZaBGI.png`,
        cropX: 1056,
        cropY: 691,
        cropW: 113,
        cropH: 88,
        width: 120,
        bottom: 48,
        rotate: -8,
        z: 4,
    },
    {
        key: "sticky",
        imageUrl: `${DEFAULT_IMG}Ks4KMbXjOzLJjGMxHdmGi4llY.png`,
        cropX: 980,
        cropY: 520,
        cropW: 90,
        cropH: 90,
        width: 88,
        bottom: 96,
        rotate: 10,
        z: 3,
    },
]

function DeskWorkFooter(props: {
    accent?: string
    cream?: string
    ink?: string
    muted?: string
    headline?: string
    subline?: string
    showHome?: boolean
    objectScale?: number
    railHeight?: number
    headlineSize?: number
    bodySize?: number
    displayFont?: { fontFamily?: string }
    bodyFont?: { fontFamily?: string }
    objects?: FooterObject[]
}) {
    const {
        accent = "#2C6BE0",
        cream = "#F3EFE6",
        ink = "#111111",
        muted = "#555555",
        headline = "back to the desk",
        subline = "More stories, sticky notes, and side quests live on the homepage.",
        showHome = true,
        objectScale = 1,
        railHeight = 220,
        headlineSize = 48,
        bodySize = 15,
        objects = DEFAULT_FOOTER_OBJECTS,
        style,
    } = props
    const displayFamily = props.displayFont?.fontFamily || DEFAULT_ANNIE
    const bodyFamily = props.bodyFont?.fontFamily || DEFAULT_SANS
    const scale = Math.max(0.5, Math.min(1.8, Number(objectScale) || 1))
    const list = (objects?.length ? objects : DEFAULT_FOOTER_OBJECTS).map((o) => ({
        ...o,
        width: Math.round((Number(o.width) || 100) * scale),
        bottom: Math.round((Number(o.bottom) || 0) * scale),
    }))

    return (
        <footer
            style={{
                position: "relative",
                width: "100%",
                marginTop: 72,
                background: cream,
                borderTop: `1.5px solid ${ink}`,
                overflow: "hidden",
                fontFamily: bodyFamily,
                ...style,
            }}
        >
            <div
                style={{
                    position: "relative",
                    zIndex: 10,
                    maxWidth: 1360,
                    margin: "0 auto",
                    padding: "40px 40px 12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    gap: 24,
                    flexWrap: "wrap",
                    boxSizing: "border-box",
                }}
            >
                <div style={{ maxWidth: 520 }}>
                    <div
                        style={{
                            fontFamily: displayFamily,
                            fontSize: `clamp(${Math.round(headlineSize * 0.7)}px, 5vw, ${headlineSize}px)`,
                            lineHeight: 1.05,
                            color: ink,
                            marginBottom: 10,
                        }}
                    >
                        {headline}
                    </div>
                    <p
                        style={{
                            margin: 0,
                            fontSize: bodySize,
                            lineHeight: 1.5,
                            color: muted,
                            maxWidth: 380,
                        }}
                    >
                        {subline}
                    </p>
                </div>

                <nav
                    style={{
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                        alignItems: "center",
                        paddingBottom: 6,
                    }}
                >
                    {showHome ? <Chip href="/" label="Home" accent={accent} ink={ink} /> : null}
                    <Chip href="/work" label="Work" accent={accent} ink={ink} />
                    <Chip href="/archive" label="Archive" accent={accent} ink={ink} />
                    <Chip href="/contact" label="Contact" accent={accent} ink={ink} />
                </nav>
            </div>

            <div
                aria-hidden
                style={{
                    position: "relative",
                    height: Math.round(railHeight * Math.max(0.85, scale)),
                    marginTop: 8,
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: 54,
                        background:
                            "linear-gradient(180deg, rgba(194,170,130,0.35) 0%, rgba(160,130,90,0.55) 100%)",
                        borderTop: `1.5px solid ${ink}`,
                        zIndex: 1,
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: 18,
                        background: "rgba(90,70,45,0.35)",
                        zIndex: 2,
                    }}
                />

                <div
                    style={{
                        position: "absolute",
                        inset: "0 2% 0",
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        gap: "clamp(4px, 1.2vw, 18px)",
                        zIndex: 3,
                        paddingBottom: 10,
                    }}
                >
                    {list.map((obj) => (
                        <Crop key={obj.key || obj.imageUrl} obj={obj} />
                    ))}
                </div>
            </div>
        </footer>
    )
}

function Chip({
    href,
    label,
    accent,
    ink,
}: {
    href: string
    label: string
    accent: string
    ink: string
}) {
    return (
        <a
            href={href}
            style={{
                display: "inline-block",
                textDecoration: "none",
                color: "#fff",
                background: ink,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 0.6,
                padding: "8px 12px",
                borderRadius: 4,
                border: `1.5px solid ${ink}`,
                boxShadow: `2px 2px 0 ${accent}`,
            }}
        >
            {label}
        </a>
    )
}

function Crop({ obj }: { obj: FooterObject }) {
    const x = Number(obj.cropX) || 0
    const y = Number(obj.cropY) || 0
    const w = Number(obj.cropW) || 100
    const h = Number(obj.cropH) || 100
    const displayW = Number(obj.width) || 100
    const displayH = (h / w) * displayW
    const scale = displayW / w
    const src = resolveImg(obj.imageUrl)
    return (
        <div
            style={{
                position: "relative",
                width: displayW,
                height: displayH,
                marginBottom: Number(obj.bottom) || 0,
                transform: `rotate(${Number(obj.rotate) || 0}deg)`,
                zIndex: Number(obj.z) || 1,
                flex: "0 0 auto",
                overflow: "hidden",
                filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.18))",
                transition: "transform 220ms ease",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = `rotate(${Number(obj.rotate) || 0}deg) translateY(-8px) scale(1.04)`
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = `rotate(${Number(obj.rotate) || 0}deg)`
            }}
        >
            <div
                style={{
                    position: "absolute",
                    width: STAGE_W * scale,
                    height: STAGE_H * scale,
                    left: -x * scale,
                    top: -y * scale,
                    backgroundImage: src ? `url(${src})` : undefined,
                    backgroundColor: src ? undefined : "#ddd",
                    backgroundSize: "100% 100%",
                    backgroundRepeat: "no-repeat",
                    pointerEvents: "none",
                }}
            />
        </div>
    )
}

function resolveImg(value: unknown): string {
    if (!value) return ""
    if (typeof value === "string") return value
    if (typeof value === "object" && value !== null) {
        const v = value as { src?: string; url?: string }
        return String(v.src || v.url || "")
    }
    return ""
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
        defaultValue: { fontSize: 40, variant: "Regular" },
    },
    font: {
        type: ControlType.Font,
        title: "Body Font",
        controls: "extended",
        defaultFontType: "sans-serif",
        defaultValue: { fontSize: 15, variant: "Regular", lineHeight: "1.5em" },
    },
    footerHeadline: { type: ControlType.String, title: "Footer Headline", defaultValue: "back to the desk" },
    footerSubline: { type: ControlType.String, title: "Footer Subline", displayTextArea: true, defaultValue: "Case closed for now — wander home for the rest of the desk." },
    footerObjectScale: { type: ControlType.Number, title: "Footer Illustration Scale", defaultValue: 1, min: 0.5, max: 1.8, step: 0.05 },
    footerRailHeight: { type: ControlType.Number, title: "Footer Rail Height", defaultValue: 220, min: 140, max: 360 },
    footerHeadlineSize: { type: ControlType.Number, title: "Footer Headline Size", defaultValue: 48, min: 24, max: 96 },
    footerObjects: {
        type: ControlType.Array,
        title: "Footer Illustrations",
        control: {
            type: ControlType.Object,
            controls: {
                key: { type: ControlType.String, title: "Name", defaultValue: "object" },
                imageUrl: { type: ControlType.Image, title: "Image" },
                cropX: { type: ControlType.Number, title: "Crop X", defaultValue: 0 },
                cropY: { type: ControlType.Number, title: "Crop Y", defaultValue: 0 },
                cropW: { type: ControlType.Number, title: "Crop W", defaultValue: 100 },
                cropH: { type: ControlType.Number, title: "Crop H", defaultValue: 100 },
                width: { type: ControlType.Number, title: "Display Width", defaultValue: 120 },
                bottom: { type: ControlType.Number, title: "Lift", defaultValue: 0 },
                rotate: { type: ControlType.Number, title: "Rotate", defaultValue: 0 },
                z: { type: ControlType.Number, title: "Z", defaultValue: 1 },
            },
        },
        defaultValue: DEFAULT_FOOTER_OBJECTS,
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
