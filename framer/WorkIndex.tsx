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
const CREAM = "#F3EFE6"
const INK = "#111111"
const MUTED = "#555555"
const GAP = 20

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
    cream: string
    ink: string
    muted: string
    gridOpacity: number
    titleSize: number
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

/**
 * Work Index — Heat Bureau /projects structure:
 * large title + right intro, then full-width project → pair → full-width…
 * Cream stage + quiet desk grid. Whole card is the hit target (no Open button).
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
        cream = CREAM,
        ink = INK,
        muted = MUTED,
        gridOpacity = 0.12,
        titleSize = 96,
        footerHeadline = "back to the desk",
        footerSubline = "That's the work for now — the rest of the story lives on the homepage.",
        footerObjectScale = 1,
        footerRailHeight = 220,
        footerHeadlineSize = 48,
        footerObjects = DEFAULT_FOOTER_OBJECTS,
    } = props
    const family = props.font?.fontFamily || SANS
    const displayFamily = props.displayFont?.fontFamily || DEFAULT_ANNIE
    const isStatic = useIsStaticRenderer()
    const gridAlpha = Math.min(0.14, Math.max(0.04, Number(gridOpacity) || 0.12))

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

    // Heat pattern: full, pair, full, pair…
    const rows = useMemo(() => chunkHeatRows(list), [list])

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
                background: cream,
                color: ink,
                fontFamily: family,
                ...props.style,
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
                {/* Heat header: title left / intro right */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 40,
                        marginBottom: 28,
                        flexWrap: "wrap",
                    }}
                >
                    <h1
                        style={{
                            margin: 0,
                            fontSize: `clamp(${Math.round(titleSize * 0.55)}px, 8vw, ${titleSize}px)`,
                            fontWeight: 600,
                            letterSpacing: "-0.04em",
                            lineHeight: 0.9,
                            textTransform: "lowercase",
                            color: ink,
                            fontFamily: displayFamily,
                        }}
                    >
                        work
                    </h1>
                    <p
                        style={{
                            margin: 0,
                            maxWidth: 290,
                            fontSize: 16,
                            lineHeight: 1.2,
                            fontWeight: 400,
                            color: muted,
                            textAlign: "right",
                            paddingTop: 14,
                        }}
                    >
                        {intro}
                    </p>
                </div>

                {/* Heat project stack */}
                <div style={{ display: "flex", flexDirection: "column", gap: GAP }}>
                    {rows.map((row, i) =>
                        row.kind === "full" ? (
                            <ProjectCard key={row.items[0].slug} item={row.items[0]} size="full" />
                        ) : (
                            <div
                                key={`pair-${i}`}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: GAP,
                                }}
                                className="work-pair"
                            >
                                {row.items.map((item) => (
                                    <ProjectCard key={item.slug} item={item} size="half" />
                                ))}
                            </div>
                        ),
                    )}
                </div>

                <style>{`
                    @media (max-width: 800px) {
                        .work-pair { grid-template-columns: 1fr !important; }
                    }
                `}</style>
            </div>

            <DeskWorkFooter
                accent={accent}
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

function chunkHeatRows(
    list: WorkItem[],
): Array<{ kind: "full" | "pair"; items: WorkItem[] }> {
    const rows: Array<{ kind: "full" | "pair"; items: WorkItem[] }> = []
    let i = 0
    let fullNext = true
    while (i < list.length) {
        if (fullNext || list.length - i === 1) {
            rows.push({ kind: "full", items: [list[i]] })
            i += 1
            fullNext = false
        } else {
            rows.push({ kind: "pair", items: list.slice(i, i + 2) })
            i += 2
            fullNext = true
        }
    }
    return rows
}

function ProjectCard({
    item,
    size,
}: {
    item: WorkItem
    size: "full" | "half"
}) {
    const [hover, setHover] = useState(false)
    const tall = size === "full"
    return (
        <a
            href={`/work/${item.slug}`}
            aria-label={`${item.title} — ${item.subtitle}`}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                position: "relative",
                display: "block",
                width: "100%",
                // Heat proportions: full ~16/9.5 tall, half closer to square-ish landscape
                aspectRatio: tall ? "16 / 9.5" : "660 / 418",
                minHeight: tall ? 480 : 300,
                textDecoration: "none",
                color: "#fff",
                overflow: "hidden",
                background: item.accent,
                cursor: "pointer",
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
                        transition: "transform 0.85s cubic-bezier(0.15, 0.75, 0.5, 1)",
                    }}
                />
            ) : (
                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: `linear-gradient(145deg, ${item.accent} 0%, #1a1a1a 125%)`,
                        transform: hover ? "scale(1.03)" : "scale(1)",
                        transition: "transform 0.85s cubic-bezier(0.15, 0.75, 0.5, 1)",
                    }}
                />
            )}

            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: hover ? "rgba(0,0,0,0.22)" : "rgba(0,0,0,0.08)",
                    transition: "background 0.3s ease",
                }}
            />

            {/* Heat-style caption: title + type on the media */}
            <div
                style={{
                    position: "absolute",
                    left: 22,
                    right: 22,
                    bottom: 22,
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: 16,
                    flexWrap: "wrap",
                }}
            >
                <h3
                    style={{
                        margin: 0,
                        fontSize: tall ? 26 : 22,
                        fontWeight: 600,
                        letterSpacing: "-0.02em",
                        lineHeight: 1.1,
                        color: "#fff",
                    }}
                >
                    {item.title}
                </h3>
                <span
                    style={{
                        fontSize: 14,
                        fontWeight: 500,
                        letterSpacing: "-0.01em",
                        color: "rgba(255,255,255,0.92)",
                    }}
                >
                    {item.subtitle}
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

    cream: { type: ControlType.Color, title: "Background", defaultValue: "#F3EFE6" },
    ink: { type: ControlType.Color, title: "Ink", defaultValue: "#111111" },
    muted: { type: ControlType.Color, title: "Muted Text", defaultValue: "#555555" },
    displayFont: {
        type: ControlType.Font,
        title: "Display Font",
        controls: "extended",
        defaultFontType: "sans-serif",
        defaultValue: { fontSize: 48, variant: "Regular" },
    },
    font: {
        type: ControlType.Font,
        title: "Body Font",
        controls: "extended",
        defaultFontType: "sans-serif",
        defaultValue: { fontSize: 15, variant: "Regular", lineHeight: "1.5em" },
    },
    titleSize: {
        type: ControlType.Number,
        title: "Title Size",
        defaultValue: 96,
        min: 40,
        max: 140,
        step: 2,
    },
    footerHeadline: {
        type: ControlType.String,
        title: "Footer Headline",
        defaultValue: "back to the desk",
    },
    footerSubline: {
        type: ControlType.String,
        title: "Footer Subline",
        displayTextArea: true,
        defaultValue: "That's the work for now — the rest of the story lives on the homepage.",
    },
    footerObjectScale: {
        type: ControlType.Number,
        title: "Footer Illustration Scale",
        defaultValue: 1,
        min: 0.5,
        max: 1.8,
        step: 0.05,
    },
    footerRailHeight: {
        type: ControlType.Number,
        title: "Footer Rail Height",
        defaultValue: 220,
        min: 140,
        max: 360,
        step: 4,
    },
    footerHeadlineSize: {
        type: ControlType.Number,
        title: "Footer Headline Size",
        defaultValue: 48,
        min: 24,
        max: 96,
    },
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
