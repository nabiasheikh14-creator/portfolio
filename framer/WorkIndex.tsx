import {
    useEffect,
    useMemo,
    useState,
    type CSSProperties,
    type ReactNode,
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
    footerSubline: string
    footerDeskScale: number
    footerHeight: number
    footerHeadlineSize: number
    footerInstagramUrl: string
    footerLinkedinUrl: string
    footerEmail: string
    style?: CSSProperties
}

/**
 * Work Index — Heat Bureau /projects structure:
 * large title + right intro, then full-width project → pair → full-width…
 * Cream stage + quiet desk grid. Whole card is the hit target (no Open button).
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 1800
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any
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

            <DeskBack href="/" label="Back" accent={accent} />

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
    accent,
}: {
    href: string
    label: string
    accent: string
}) {
    useEffect(() => {
        if (typeof document === "undefined") return
        document.querySelectorAll("[data-desk-back]").forEach((n) => n.remove())

        const a = document.createElement("a")
        a.href = href
        a.setAttribute("aria-label", label)
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
    }, [href, label, accent])

    return null
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
                width: "100%",
                marginTop: 64,
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
                        zIndex: 2,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        gap: 18,
                        maxWidth: 420,
                        padding: "32px 40px",
                        boxSizing: "border-box",
                    }}
                >
                    <a
                        href={homeHref}
                        style={{
                            fontFamily: FOOTER_ANNIE,
                            fontSize: `clamp(26px, 3.6vw, ${headlineSize}px)`,
                            fontWeight: 400,
                            letterSpacing: "0",
                            lineHeight: 1.15,
                            color: ink,
                            textDecoration: "none",
                            maxWidth: 340,
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
        defaultValue: { fontFamily: "Annie Use Your Telescope", fontSize: "48px", variant: "Regular" },
    },
    font: {
        type: ControlType.Font,
        title: "Body Font",
        controls: "extended",
        defaultFontType: "sans-serif",
        defaultValue: { fontSize: "15px", variant: "Regular", lineHeight: "1.5em" },
    },
    titleSize: {
        type: ControlType.Number,
        title: "Title Size",
        defaultValue: 96,
        min: 40,
        max: 140,
        step: 2,
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
