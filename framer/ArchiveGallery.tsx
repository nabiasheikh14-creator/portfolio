import { useMemo, useState, type CSSProperties } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    addPropertyControls,
    ControlType,
    RenderTarget,
    useIsStaticRenderer,
} from "framer"

const SANS =
    '"Inter", "Inter Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const GRID_BG =
    "https://framerusercontent.com/images/uTiMeYZo7Cgq17Mt2w60JYMnptc.png"

interface Img {
    src: string
    srcSet?: string
    alt?: string
}

interface GalleryItem {
    title: string
    description: string
    image: Img
}

interface ArchiveGalleryProps {
    items: GalleryItem[]
    accent: string
    columns: number
    gridOpacity: number
    style?: CSSProperties
}

/**
 * Archive Gallery — AIC Creator Awards–style multi-column infinite scroll.
 * CMS items are synced into the Items array. Click a frame to open a popup.
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 900
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function ArchiveGallery(props: ArchiveGalleryProps) {
    const {
        items = DEFAULT_ITEMS,
        accent = "#2C6BE0",
        columns = 4,
        gridOpacity = 0.08,
    } = props

    const isStatic = useIsStaticRenderer()
    const [open, setOpen] = useState<GalleryItem | null>(null)
    const colCount = Math.max(2, Math.min(5, Math.round(columns)))

    const cols = useMemo(() => {
        const buckets: GalleryItem[][] = Array.from({ length: colCount }, () => [])
        // Prefer Items with real images; fall back to baked CMS defaults when
        // Framer strips ResponsiveImage values from the Array control.
        const fromProps = (items || []).filter((it) => it?.image?.src)
        const list = fromProps.length ? fromProps : DEFAULT_ITEMS
        list.forEach((item, i) => {
            buckets[i % colCount].push(item)
        })
        // Duplicate for seamless marquee loop
        return buckets.map((col) => (col.length ? [...col, ...col, ...col] : col))
    }, [items, colCount])

    const speeds = useMemo(
        () =>
            Array.from({ length: colCount }, (_, i) => {
                const base = 48 + (i % 3) * 14
                return i % 2 === 0 ? base : base + 10
            }),
        [colCount]
    )

    if (RenderTarget.current() === RenderTarget.thumbnail) {
        return (
            <div style={{ width: "100%", height: "100%", background: "#0a0a0a", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, padding: 8 }}>
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} style={{ background: "#222", borderRadius: 4 }} />
                ))}
            </div>
        )
    }

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                minHeight: "100vh",
                background: "#050505",
                overflow: "hidden",
                fontFamily: SANS,
                ...props.style,
            }}
        >
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

            {/* Desk grid bg at low opacity — same art as Home */}
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
                    zIndex: 0,
                    filter: "grayscale(1) contrast(1.05)",
                }}
            />
            <div
                aria-hidden
                style={{
                    position: "fixed",
                    inset: 0,
                    background:
                        "radial-gradient(ellipse at 50% 0%, rgba(44,107,224,0.12), transparent 55%), linear-gradient(180deg, rgba(5,5,5,0.35), rgba(5,5,5,0.92))",
                    pointerEvents: "none",
                    zIndex: 1,
                }}
            />

            <div
                style={{
                    position: "relative",
                    zIndex: 2,
                    display: "flex",
                    gap: 16,
                    padding: "110px 16px 40px",
                    height: "100vh",
                    boxSizing: "border-box",
                    maxWidth: 1600,
                    margin: "0 auto",
                }}
            >
                {cols.map((col, ci) => (
                    <div
                        key={ci}
                        style={{
                            flex: 1,
                            minWidth: 0,
                            height: "100%",
                            overflow: "hidden",
                            maskImage:
                                "linear-gradient(180deg, transparent 0%, #000 8%, #000 92%, transparent 100%)",
                            WebkitMaskImage:
                                "linear-gradient(180deg, transparent 0%, #000 8%, #000 92%, transparent 100%)",
                        }}
                    >
                        <div
                            className={isStatic ? undefined : "archive-marquee"}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 16,
                                animation: isStatic
                                    ? undefined
                                    : `archive-scroll-${ci % 2 === 0 ? "up" : "down"} ${speeds[ci]}s linear infinite`,
                                willChange: isStatic ? undefined : "transform",
                            }}
                        >
                            {col.map((item, ii) => (
                                <Tile
                                    key={`${ci}-${ii}-${item.title}`}
                                    item={item}
                                    accent={accent}
                                    tall={((ci + ii) % 5) === 0 || ((ci + ii) % 3) === 0}
                                    onOpen={() => setOpen(item)}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes archive-scroll-up {
                    from { transform: translateY(0); }
                    to { transform: translateY(-33.333%); }
                }
                @keyframes archive-scroll-down {
                    from { transform: translateY(-33.333%); }
                    to { transform: translateY(0); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .archive-marquee { animation: none !important; }
                }
            `}</style>

            {RenderTarget.current() !== RenderTarget.canvas && (
                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(null)}
                            style={{
                                position: "fixed",
                                inset: 0,
                                zIndex: 1000,
                                background: "rgba(0,0,0,0.82)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: 20,
                                backdropFilter: "blur(6px)",
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0.94, y: 16 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.96, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 280, damping: 26 }}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    background: "#0f0f0f",
                                    border: "1px solid rgba(255,255,255,0.18)",
                                    width: "min(920px, 96vw)",
                                    maxHeight: "92vh",
                                    overflow: "auto",
                                    position: "relative",
                                    fontFamily: SANS,
                                    color: "#fff",
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpen(null)}
                                    aria-label="Close"
                                    style={{
                                        position: "absolute",
                                        top: 14,
                                        right: 14,
                                        zIndex: 2,
                                        fontFamily: SANS,
                                        fontWeight: 600,
                                        fontSize: 12,
                                        letterSpacing: "-1px",
                                        textTransform: "uppercase",
                                        background: accent,
                                        color: "#fff",
                                        border: "none",
                                        padding: "8px 12px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Close
                                </button>
                                <img
                                    src={open.image?.src}
                                    srcSet={open.image?.srcSet}
                                    alt={open.image?.alt || open.title}
                                    style={{
                                        width: "100%",
                                        maxHeight: "68vh",
                                        objectFit: "contain",
                                        display: "block",
                                        background: "#111",
                                    }}
                                />
                                <div style={{ padding: "22px 24px 28px" }}>
                                    <h3
                                        style={{
                                            margin: "0 0 8px",
                                            fontSize: 22,
                                            fontWeight: 600,
                                            letterSpacing: "-1px",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        {open.title}
                                    </h3>
                                    <p
                                        style={{
                                            margin: 0,
                                            fontSize: 15,
                                            lineHeight: 1.6,
                                            color: "rgba(255,255,255,0.72)",
                                            maxWidth: 560,
                                        }}
                                    >
                                        {open.description}
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    )
}

function Tile({
    item,
    accent,
    tall,
    onOpen,
}: {
    item: GalleryItem
    accent: string
    tall: boolean
    onOpen: () => void
}) {
    const [hover, setHover] = useState(false)
    return (
        <button
            type="button"
            onClick={onOpen}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            aria-label={`Open ${item.title}`}
            style={{
                position: "relative",
                display: "block",
                width: "100%",
                padding: 0,
                border: "none",
                background: "#161616",
                cursor: "pointer",
                overflow: "hidden",
                borderRadius: 6,
                aspectRatio: tall ? "3 / 4" : "4 / 5",
            }}
        >
            <img
                src={item.image?.src}
                srcSet={item.image?.srcSet}
                alt={item.image?.alt || item.title}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    transform: hover ? "scale(1.08)" : "scale(1)",
                    transition: "transform 1s cubic-bezier(0.15, 0.75, 0.5, 1)",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: hover ? "rgba(0,0,0,0.35)" : "transparent",
                    transition: "background 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <span
                    style={{
                        opacity: hover ? 1 : 0,
                        transform: hover ? "translateY(0)" : "translateY(8px)",
                        transition: "opacity 0.25s ease, transform 0.25s ease",
                        background: accent,
                        color: "#fff",
                        fontFamily: SANS,
                        fontWeight: 600,
                        fontSize: 12,
                        letterSpacing: "-1px",
                        textTransform: "uppercase",
                        padding: "8px 14px",
                    }}
                >
                    {item.title}
                </span>
            </div>
        </button>
    )
}

const DEFAULT_ITEMS: GalleryItem[] = [
    { title: "Poster Series", description: "Poster Series — placeholder description. Edit in the Archive CMS.", image: { src: "https://framerusercontent.com/images/EDLQntkSaJbnZp1yOK6OtSRlsY.jpg", alt: "Poster Series" } },
    { title: "Zine No.3", description: "Zine No.3 — placeholder description. Edit in the Archive CMS.", image: { src: "https://framerusercontent.com/images/0BNePQmVfEM8AvcQFkf9bvU1uk.jpg", alt: "Zine No.3" } },
    { title: "Brand Marks", description: "Brand Marks — placeholder description. Edit in the Archive CMS.", image: { src: "https://framerusercontent.com/images/CPNGiVHiKfZ1cdFpCczUfZ8A.jpg", alt: "Brand Marks" } },
    { title: "Type Study", description: "Type Study — placeholder description. Edit in the Archive CMS.", image: { src: "https://framerusercontent.com/images/DS6z3TfvONE7UyJGwD5VFHpj7A0.jpg", alt: "Type Study" } },
    { title: "Social Kit", description: "Social Kit — placeholder description. Edit in the Archive CMS.", image: { src: "https://framerusercontent.com/images/HDUMcXuln281FyQNRgyuMOT7zhY.jpg", alt: "Social Kit" } },
    { title: "Packaging", description: "Packaging — placeholder description. Edit in the Archive CMS.", image: { src: "https://framerusercontent.com/images/EDLQntkSaJbnZp1yOK6OtSRlsY.jpg", alt: "Packaging" } },
    { title: "Editorial Spread", description: "Editorial Spread — placeholder description. Edit in the Archive CMS.", image: { src: "https://framerusercontent.com/images/0BNePQmVfEM8AvcQFkf9bvU1uk.jpg", alt: "Editorial Spread" } },
    { title: "Sticker Pack", description: "Sticker Pack — placeholder description. Edit in the Archive CMS.", image: { src: "https://framerusercontent.com/images/CPNGiVHiKfZ1cdFpCczUfZ8A.jpg", alt: "Sticker Pack" } },
    { title: "Album Art", description: "Album Art — placeholder description. Edit in the Archive CMS.", image: { src: "https://framerusercontent.com/images/DS6z3TfvONE7UyJGwD5VFHpj7A0.jpg", alt: "Album Art" } },
    { title: "Wayfinding", description: "Wayfinding — placeholder description. Edit in the Archive CMS.", image: { src: "https://framerusercontent.com/images/HDUMcXuln281FyQNRgyuMOT7zhY.jpg", alt: "Wayfinding" } },
    { title: "Risograph", description: "Risograph — placeholder description. Edit in the Archive CMS.", image: { src: "https://framerusercontent.com/images/EDLQntkSaJbnZp1yOK6OtSRlsY.jpg", alt: "Risograph" } },
    { title: "Lettering", description: "Lettering — placeholder description. Edit in the Archive CMS.", image: { src: "https://framerusercontent.com/images/0BNePQmVfEM8AvcQFkf9bvU1uk.jpg", alt: "Lettering" } },
]

addPropertyControls(ArchiveGallery, {
    items: {
        type: ControlType.Array,
        title: "Items",
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String, title: "Title", defaultValue: "Untitled" },
                description: {
                    type: ControlType.String,
                    title: "Description",
                    defaultValue: "Description",
                    displayTextArea: true,
                },
                image: { type: ControlType.ResponsiveImage, title: "Image" },
            },
        },
        defaultValue: DEFAULT_ITEMS,
    },
    accent: { type: ControlType.Color, title: "Accent", defaultValue: "#2C6BE0" },
    columns: {
        type: ControlType.Number,
        title: "Columns",
        defaultValue: 4,
        min: 2,
        max: 5,
        step: 1,
        displayStepper: true,
    },
    gridOpacity: {
        type: ControlType.Number,
        title: "Grid Opacity",
        defaultValue: 0.08,
        min: 0,
        max: 0.4,
        step: 0.01,
    },
})
