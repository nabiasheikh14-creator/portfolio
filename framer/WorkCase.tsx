import { useEffect, type CSSProperties } from "react"
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
const INK = "#111111"
const MUTED = "#666666"
const LABEL = "#888888"

interface ProjectRecord {
    title: string
    subtitle: string
    role: string
    year: string
    overview: string
    approach: string
    outcome: string
    accent: string
    slug: string
}

interface RelatedItem {
    title: string
    subtitle: string
    slug: string
    accent: string
}

interface WorkCaseProps {
    title: string
    subtitle: string
    role: string
    year: string
    overview: string
    approach: string
    outcome: string
    accent: string
    gridOpacity: number
    related: RelatedItem[]
    /** Full project catalog — used to resolve the active case from the URL slug */
    catalog: ProjectRecord[]
    style?: CSSProperties
}

function slugFromPath(): string {
    if (typeof window === "undefined") return ""
    const parts = window.location.pathname.replace(/\/$/, "").split("/").filter(Boolean)
    // /work/:slug
    if (parts[0] === "work" && parts[1]) return parts[1]
    return ""
}

/**
 * Work Case — Heat Bureau–style project detail adapted to Nabia's system.
 * Meta grid (project / bio / deliverables / year) + body sections.
 * White stage + home desk grid. Laptop via DeskCorner on the page.
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 900
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function WorkCase(props: WorkCaseProps) {
    const {
        catalog = DEFAULT_CATALOG,
        gridOpacity = 0.5,
        related: relatedProp,
    } = props
    const isStatic = useIsStaticRenderer()

    const slug = !isStatic ? slugFromPath() : ""
    const fromCatalog = slug
        ? (catalog || []).find((p) => p.slug === slug)
        : null

    const title = fromCatalog?.title || props.title || "Fintech App"
    const subtitle = fromCatalog?.subtitle || props.subtitle || "Onboarding redesign"
    const role = fromCatalog?.role || props.role || "Lead Product Designer"
    const year = fromCatalog?.year || props.year || "2025"
    const overview = fromCatalog?.overview || props.overview || ""
    const approach = fromCatalog?.approach || props.approach || ""
    const outcome = fromCatalog?.outcome || props.outcome || ""
    const accent = fromCatalog?.accent || props.accent || "#2C6BE0"

    const related =
        relatedProp && relatedProp.length
            ? relatedProp
            : (catalog || [])
                  .filter((p) => p.slug !== (fromCatalog?.slug || slug))
                  .slice(0, 3)
                  .map((p) => ({
                      title: p.title,
                      subtitle: p.subtitle,
                      slug: p.slug,
                      accent: p.accent,
                  }))

    const deliverables = String(role || "")
        .split(/[,/·|]+/)
        .map((s) => s.trim())
        .filter(Boolean)

    useEffect(() => {
        if (typeof document === "undefined") return
        document.querySelectorAll("[data-archive-mascot]").forEach((n) => n.remove())

        // Sticky laptop flush bottom-right (same art as home work hotspot)
        if (document.querySelector('[data-desk-corner="laptop"]')) return
        const box: [number, number, number, number] = [570, 526, 354, 245]
        const dw = 280
        const dh = (box[3] / box[2]) * dw
        const scale = dw / box[2]
        const host = document.createElement("div")
        host.dataset.deskCorner = "laptop"
        host.setAttribute("aria-hidden", "true")
        Object.assign(host.style, {
            position: "fixed",
            right: "0px",
            bottom: "0px",
            width: `${dw}px`,
            height: `${dh}px`,
            zIndex: "45",
            pointerEvents: "none",
            overflow: "hidden",
        } as Partial<CSSStyleDeclaration>)
        const inner = document.createElement("div")
        Object.assign(inner.style, {
            position: "absolute",
            width: `${1440 * scale}px`,
            height: `${900 * scale}px`,
            left: `${-box[0] * scale}px`,
            top: `${-box[1] * scale}px`,
            backgroundImage:
                "url(https://framerusercontent.com/images/ffeeCWEVauyRc2jUztvEkKArptM.png)",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
        } as Partial<CSSStyleDeclaration>)
        host.appendChild(inner)
        document.body.appendChild(host)
        return () => {
            host.remove()
        }
    }, [])

    if (RenderTarget.current() === RenderTarget.thumbnail) {
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    background: "#fff",
                    padding: 16,
                    fontFamily: SANS,
                    color: INK,
                }}
            >
                <div style={{ fontSize: 22, fontWeight: 600 }}>{title}</div>
            </div>
        )
    }

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                minHeight: isStatic ? "100%" : "100vh",
                background: "#FFFFFF",
                color: INK,
                fontFamily: SANS,
                ...props.style,
            }}
        >
            <link
                href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
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
                    opacity: gridOpacity,
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
                    padding: "120px 40px 180px",
                    boxSizing: "border-box",
                }}
            >
                {/* Heat-style meta grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                        gap: 28,
                        marginBottom: 48,
                    }}
                    className="work-case-meta"
                >
                    <MetaCol label="project">
                        <div
                            style={{
                                fontSize: "clamp(28px, 3.2vw, 42px)",
                                fontWeight: 600,
                                letterSpacing: "-0.03em",
                                lineHeight: 1.05,
                                marginBottom: 18,
                            }}
                        >
                            {title}
                        </div>
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
                                background: "rgba(255,255,255,0.9)",
                                color: accent,
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
                            {subtitle}
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
                            {overview}
                        </p>
                    </MetaCol>

                    <MetaCol label="deliverables">
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {(deliverables.length ? deliverables : [role]).map((d) => (
                                <div
                                    key={d}
                                    style={{
                                        fontSize: 22,
                                        fontWeight: 500,
                                        letterSpacing: "-0.02em",
                                        lineHeight: 1.2,
                                    }}
                                >
                                    {d}
                                </div>
                            ))}
                        </div>
                    </MetaCol>

                    <MetaCol label="year">
                        <div
                            style={{
                                fontSize: 22,
                                fontWeight: 500,
                                letterSpacing: "-0.02em",
                            }}
                        >
                            {year}
                        </div>
                    </MetaCol>
                </div>

                <style>{`
                    @media (max-width: 900px) {
                        .work-case-meta { grid-template-columns: 1fr 1fr !important; }
                    }
                    @media (max-width: 560px) {
                        .work-case-meta { grid-template-columns: 1fr !important; }
                    }
                `}</style>

                {/* Visual band using project accent */}
                <div
                    style={{
                        width: "100%",
                        minHeight: 360,
                        marginBottom: 56,
                        border: `1.5px solid ${INK}`,
                        background: `linear-gradient(145deg, ${accent} 0%, #111 125%)`,
                        display: "flex",
                        alignItems: "flex-end",
                        padding: 28,
                        boxSizing: "border-box",
                        color: "#fff",
                    }}
                >
                    <div
                        style={{
                            fontSize: 13,
                            fontWeight: 600,
                            letterSpacing: "-1px",
                            textTransform: "uppercase",
                            background: accent,
                            border: "1.5px solid #fff",
                            padding: "8px 12px",
                        }}
                    >
                        {subtitle || "Case study"}
                    </div>
                </div>

                <Section label="Overview" accent={accent} body={overview} />
                <Section label="Approach" accent={accent} body={approach} />
                <Section label="Outcome" accent={accent} body={outcome} />

                {related?.length > 0 && (
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
                                        border: `1.5px solid ${INK}`,
                                        background: `linear-gradient(145deg, ${r.accent} 0%, #111 120%)`,
                                        textDecoration: "none",
                                        color: "#fff",
                                        padding: 20,
                                        boxSizing: "border-box",
                                        position: "relative",
                                    }}
                                >
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: 20,
                                            bottom: 20,
                                            right: 20,
                                        }}
                                    >
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
                                                fontSize: 12,
                                                fontWeight: 600,
                                                letterSpacing: "-1px",
                                                textTransform: "uppercase",
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
        </div>
    )
}

function MetaCol({
    label,
    children,
}: {
    label: string
    children: React.ReactNode
}) {
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

function Section({
    label,
    body,
    accent,
}: {
    label: string
    body: string
    accent: string
}) {
    if (!body) return null
    return (
        <div style={{ marginBottom: 40, maxWidth: 720 }}>
            <div
                style={{
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    color: INK,
                    borderLeft: `4px solid ${accent}`,
                    paddingLeft: 10,
                    marginBottom: 12,
                }}
            >
                // {label}
            </div>
            <p
                style={{
                    margin: 0,
                    fontSize: 17,
                    lineHeight: 1.6,
                    color: MUTED,
                }}
            >
                {body}
            </p>
        </div>
    )
}

const DEFAULT_CATALOG: ProjectRecord[] = [
    {
        title: "Fintech App",
        subtitle: "Onboarding redesign",
        role: "Lead Product Designer",
        year: "2025",
        overview:
            "A consumer fintech app was losing new users during a long, jargon-heavy sign-up.",
        approach:
            "Mapped the existing funnel, cut steps that didn't earn their place, and rebuilt the flow around clarity.",
        outcome:
            "Sign-up completion improved noticeably in testing and the flow now sets expectations early.",
        accent: "#7457C9",
        slug: "fintech-app",
    },
    {
        title: "Health Platform",
        subtitle: "Design system",
        role: "Senior Product Designer",
        year: "2024",
        overview:
            "A growing health platform had drifting UI across teams. I led the creation of a shared system.",
        approach:
            "Audited every surface, defined tokens and components, and paired with engineers to land adoption.",
        outcome:
            "Teams now build faster from one source of truth, and the product feels like a single product.",
        accent: "#28A06A",
        slug: "health-platform",
    },
    {
        title: "Chutney Studios",
        subtitle: "Brand + site",
        role: "Founder & Designer",
        year: "2025",
        overview:
            "Chutney Studios is my after-hours practice. This is the brand and site I built for it.",
        approach:
            "Started from a warm, personal tone, chose a friendly type pairing, and kept the system light.",
        outcome:
            "A site that sounds like me and gives freelance clients a clear, low-pressure way in.",
        accent: "#D17BB0",
        slug: "chutney-studios",
    },
    {
        title: "Travel App",
        subtitle: "0→1 product",
        role: "Product Designer",
        year: "2023",
        overview:
            "A 0→1 travel app that needed to feel effortless for people planning trips on the move.",
        approach:
            "Prototyped the core planning loop early, tested with real travellers, and let that steer scope.",
        outcome:
            "Shipped a first version that people could use one-handed on a train without a tutorial.",
        accent: "#E0902F",
        slug: "travel-app",
    },
]

addPropertyControls(WorkCase, {
    catalog: {
        type: ControlType.Array,
        title: "Catalog (Projects CMS)",
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String, defaultValue: "Project" },
                subtitle: { type: ControlType.String, defaultValue: "Type" },
                role: { type: ControlType.String, defaultValue: "Role" },
                year: { type: ControlType.String, defaultValue: "2025" },
                overview: {
                    type: ControlType.String,
                    displayTextArea: true,
                    defaultValue: "",
                },
                approach: {
                    type: ControlType.String,
                    displayTextArea: true,
                    defaultValue: "",
                },
                outcome: {
                    type: ControlType.String,
                    displayTextArea: true,
                    defaultValue: "",
                },
                accent: { type: ControlType.Color, defaultValue: "#2C6BE0" },
                slug: { type: ControlType.String, defaultValue: "project" },
            },
        },
        defaultValue: DEFAULT_CATALOG,
    },
    gridOpacity: {
        type: ControlType.Number,
        title: "Grid Opacity",
        defaultValue: 0.5,
        min: 0,
        max: 1,
        step: 0.05,
    },
})
