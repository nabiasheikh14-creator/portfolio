import {
    useMemo,
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
const GRID_BG =
    "https://framerusercontent.com/images/uTiMeYZo7Cgq17Mt2w60JYMnptc.png"
const INK = "#111111"
const MUTED = "#555555"

interface WorkItem {
    title: string
    subtitle: string
    slug: string
    year: string
    accent: string
    coverUrl?: string
}

interface WorkIndexProps {
    intro: string
    items: WorkItem[]
    accent: string
    gridOpacity: number
    style?: CSSProperties
}

/**
 * Work Index — Heat Bureau–style project listing adapted to Nabia's system.
 * White stage + home desk grid, large title + intro, immersive project cards.
 * Laptop corner art is handled by DeskCorner on the page.
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 900
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function WorkIndex(props: WorkIndexProps) {
    const {
        intro = DEFAULT_INTRO,
        items = DEFAULT_ITEMS,
        accent = "#2C6BE0",
        gridOpacity = 0.5,
    } = props
    const isStatic = useIsStaticRenderer()

    const list = useMemo(() => {
        const normalized = (items || [])
            .map((it: any) => ({
                title: String(it?.title || "Untitled"),
                subtitle: String(it?.subtitle || ""),
                slug: String(it?.slug || "").replace(/^\//, "") || "project",
                year: String(it?.year || ""),
                accent: String(it?.accent || accent),
                coverUrl: it?.coverUrl ? String(it.coverUrl) : "",
            }))
            .filter((it) => it.title)
        return normalized.length ? normalized : DEFAULT_ITEMS
    }, [items, accent])

    const featured = list[0]
    const rest = list.slice(1)

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
                <div style={{ fontSize: 28, fontWeight: 600 }}>work</div>
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
                    padding: "120px 40px 160px",
                    boxSizing: "border-box",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 40,
                        marginBottom: 36,
                        flexWrap: "wrap",
                    }}
                >
                    <h1
                        style={{
                            margin: 0,
                            fontSize: "clamp(56px, 8vw, 96px)",
                            fontWeight: 600,
                            letterSpacing: "-0.04em",
                            lineHeight: 0.9,
                            textTransform: "lowercase",
                            color: INK,
                        }}
                    >
                        work
                    </h1>
                    <p
                        style={{
                            margin: 0,
                            maxWidth: 300,
                            fontSize: 16,
                            lineHeight: 1.25,
                            fontWeight: 400,
                            color: MUTED,
                            textAlign: "right",
                            paddingTop: 12,
                        }}
                    >
                        {intro}
                    </p>
                </div>

                {featured && (
                    <ProjectCard
                        item={featured}
                        accentLink={accent}
                        tall
                        style={{ marginBottom: 20 }}
                    />
                )}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: 20,
                    }}
                >
                    {rest.map((item) => (
                        <ProjectCard key={item.slug} item={item} accentLink={accent} />
                    ))}
                </div>
            </div>
        </div>
    )
}

function ProjectCard({
    item,
    accentLink,
    tall,
    style,
}: {
    item: WorkItem
    accentLink: string
    tall?: boolean
    style?: CSSProperties
}) {
    const [hover, setHover] = useState(false)
    return (
        <a
            href={`/work/${item.slug}`}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                position: "relative",
                display: "block",
                width: "100%",
                aspectRatio: tall ? "16 / 9" : "1 / 1",
                minHeight: tall ? 420 : 280,
                textDecoration: "none",
                color: "#fff",
                overflow: "hidden",
                border: `1.5px solid ${INK}`,
                background: item.accent || accentLink,
                ...style,
            }}
        >
            {item.coverUrl ? (
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
                        transform: hover ? "scale(1.04)" : "scale(1)",
                        transition: "transform 0.7s cubic-bezier(0.15, 0.75, 0.5, 1)",
                    }}
                />
            ) : (
                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: `linear-gradient(145deg, ${item.accent} 0%, #111 120%)`,
                        transform: hover ? "scale(1.03)" : "scale(1)",
                        transition: "transform 0.7s cubic-bezier(0.15, 0.75, 0.5, 1)",
                    }}
                />
            )}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: hover ? "rgba(0,0,0,0.28)" : "rgba(0,0,0,0.12)",
                    transition: "background 0.25s ease",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    left: 22,
                    right: 22,
                    bottom: 22,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    gap: 16,
                }}
            >
                <div>
                    <div
                        style={{
                            fontSize: tall ? 26 : 22,
                            fontWeight: 600,
                            letterSpacing: "-0.02em",
                            lineHeight: 1.1,
                        }}
                    >
                        {item.title}
                    </div>
                    <div
                        style={{
                            marginTop: 6,
                            fontSize: 13,
                            fontWeight: 500,
                            letterSpacing: "-1px",
                            textTransform: "uppercase",
                            opacity: 0.9,
                        }}
                    >
                        {item.subtitle}
                        {item.year ? ` · ${item.year}` : ""}
                    </div>
                </div>
                <span
                    style={{
                        fontSize: 13,
                        fontWeight: 600,
                        letterSpacing: "-1px",
                        textTransform: "uppercase",
                        color: "#fff",
                        background: accentLink,
                        padding: "8px 12px",
                        border: "1.5px solid #fff",
                        opacity: hover ? 1 : 0.92,
                    }}
                >
                    Open →
                </span>
            </div>
        </a>
    )
}

const DEFAULT_INTRO =
    "Selected projects & full case studies — product, brand, and the work in between."

const DEFAULT_ITEMS: WorkItem[] = [
    {
        title: "Fintech App",
        subtitle: "Onboarding redesign",
        slug: "fintech-app",
        year: "2025",
        accent: "#7457C9",
    },
    {
        title: "Health Platform",
        subtitle: "Design system",
        slug: "health-platform",
        year: "2024",
        accent: "#28A06A",
    },
    {
        title: "Chutney Studios",
        subtitle: "Brand + site",
        slug: "chutney-studios",
        year: "2025",
        accent: "#D17BB0",
    },
    {
        title: "Travel App",
        subtitle: "0→1 product",
        slug: "travel-app",
        year: "2023",
        accent: "#E0902F",
    },
]

addPropertyControls(WorkIndex, {
    intro: {
        type: ControlType.String,
        title: "Intro",
        defaultValue: DEFAULT_INTRO,
        displayTextArea: true,
    },
    items: {
        type: ControlType.Array,
        title: "Projects",
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String, title: "Title", defaultValue: "Project" },
                subtitle: { type: ControlType.String, title: "Subtitle", defaultValue: "Type" },
                slug: { type: ControlType.String, title: "Slug", defaultValue: "project" },
                year: { type: ControlType.String, title: "Year", defaultValue: "2025" },
                accent: { type: ControlType.Color, title: "Accent", defaultValue: "#2C6BE0" },
                coverUrl: { type: ControlType.String, title: "Cover URL", defaultValue: "" },
            },
        },
        defaultValue: DEFAULT_ITEMS,
    },
    accent: { type: ControlType.Color, title: "UI Accent", defaultValue: "#2C6BE0" },
    gridOpacity: {
        type: ControlType.Number,
        title: "Grid Opacity",
        defaultValue: 0.5,
        min: 0,
        max: 1,
        step: 0.05,
    },
})
