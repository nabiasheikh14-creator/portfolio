import {
    useEffect,
    useMemo,
    useRef,
    useState,
    startTransition,
    type CSSProperties,
    type MutableRefObject,
} from "react"
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

interface GalleryItem {
    title: string
    description: string
    imageUrl: string
}

interface ArchiveGalleryProps {
    items: GalleryItem[]
    accent: string
    columns: number
    gridOpacity: number
    style?: CSSProperties
}

const CREAM = "#F3EFE6"
const STAGE_W = 1440
const STAGE_H = 900
const ARCHIVE_HASH = "969XNx9nZpgbsuyO98EvRf52B4w"
const ARCHIVE_BOX: [number, number, number, number] = [329, 292, 384, 140]

function ArchiveMascot() {
    const [x, y, w, h] = ARCHIVE_BOX
    const displayW = 220
    const displayH = (h / w) * displayW
    const scale = displayW / w
    return (
        <div
            aria-hidden
            style={{
                position: "fixed",
                right: 0,
                bottom: 0,
                width: displayW,
                height: displayH,
                zIndex: 1100,
                pointerEvents: "none",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    width: STAGE_W * scale,
                    height: STAGE_H * scale,
                    left: -x * scale,
                    top: -y * scale,
                    backgroundImage: `url(https://framerusercontent.com/images/${ARCHIVE_HASH}.png)`,
                    backgroundSize: "100% 100%",
                    backgroundRepeat: "no-repeat",
                }}
            />
        </div>
    )
}

/**
 * Archive Gallery — fixed full-viewport cream stage (matches home).
 * Columns 1+3 and 2+4 auto-drift opposite ways in an infinite loop.
 * Mouse wheel / trackpad speeds the columns (does not move the page).
 * Archive desk art stuck flush bottom-right. Items from Archive CMS.
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
        gridOpacity = 0.06,
    } = props

    const isStatic = useIsStaticRenderer()
    const [open, setOpen] = useState<GalleryItem | null>(null)
    const colCount = Math.max(2, Math.min(5, Math.round(columns)))

    // Shared speed multiplier for all columns (wheel boosts this)
    const speedRef = useRef(1)
    const scrollingRef = useRef(false)
    const scrollTimeout = useRef<number | null>(null)

    const sourceItems = useMemo(() => {
        const normalized = (items || [])
            .map((it: any) => {
                const imageUrl =
                    it?.imageUrl ||
                    it?.image?.src ||
                    (typeof it?.image === "string" ? it.image : "") ||
                    ""
                if (!imageUrl) return null
                return {
                    title: it.title || "Untitled",
                    description: it.description || "",
                    imageUrl: String(imageUrl),
                } as GalleryItem
            })
            .filter(Boolean) as GalleryItem[]
        return normalized.length ? normalized : DEFAULT_ITEMS
    }, [items])

    const colItems = useMemo(() => {
        const buckets: GalleryItem[][] = Array.from({ length: colCount }, () => [])
        sourceItems.forEach((item, i) => {
            buckets[i % colCount].push(item)
        })
        return buckets.map((col) => {
            const base = col.length ? col : sourceItems
            return [...base, ...base, ...base, ...base]
        })
    }, [sourceItems, colCount])

    // Lock page scroll on this route; wheel only drives column speed
    useEffect(() => {
        if (isStatic || typeof window === "undefined") return

        const html = document.documentElement
        const body = document.body
        const prevHtmlOverflow = html.style.overflow
        const prevBodyOverflow = body.style.overflow
        const prevHtmlBg = html.style.background
        const prevBodyBg = body.style.background

        html.style.overflow = "hidden"
        body.style.overflow = "hidden"
        html.style.background = CREAM
        body.style.background = CREAM

        const onWheel = (e: WheelEvent) => {
            e.preventDefault()
            scrollingRef.current = true
            const delta = Math.abs(e.deltaY)
            const goingDown = e.deltaY > 0
            const bump = Math.min(8, 0.06 * delta)
            if (goingDown) {
                speedRef.current = Math.min(speedRef.current + bump, 36)
            } else {
                speedRef.current = Math.max(speedRef.current - bump, -36)
            }
            if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current)
            scrollTimeout.current = window.setTimeout(() => {
                scrollingRef.current = false
            }, 50)
        }

        // Settle speed back toward idle (1)
        const settle = window.setInterval(() => {
            if (scrollingRef.current) return
            const s = speedRef.current
            if (s > 1) speedRef.current = Math.max(s - 0.9, 1)
            else if (s < 1) speedRef.current = Math.min(s + 0.9, 1)
        }, 25)

        window.addEventListener("wheel", onWheel, { passive: false })

        return () => {
            window.removeEventListener("wheel", onWheel)
            window.clearInterval(settle)
            if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current)
            html.style.overflow = prevHtmlOverflow
            body.style.overflow = prevBodyOverflow
            html.style.background = prevHtmlBg
            body.style.background = prevBodyBg
        }
    }, [isStatic])

    if (RenderTarget.current() === RenderTarget.thumbnail) {
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    background: CREAM,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: 8,
                    padding: 8,
                }}
            >
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} style={{ background: "#e4dfd3", borderRadius: 6 }} />
                ))}
            </div>
        )
    }

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: isStatic ? "100%" : "100vh",
                minHeight: "100vh",
                background: CREAM,
                overflow: "hidden",
                fontFamily: SANS,
                ...props.style,
            }}
        >
            <link
                href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                rel="stylesheet"
            />

            {/* Soft desk grid under the cream stage */}
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url(${GRID_BG})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: gridOpacity,
                    pointerEvents: "none",
                    filter: "grayscale(1) brightness(1.05) contrast(0.92)",
                    zIndex: 0,
                }}
            />

            <div
                style={{
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    gap: 14,
                    padding: "0 14px",
                    boxSizing: "border-box",
                    height: "100%",
                    width: "100%",
                    overflow: "hidden",
                }}
            >
                {colItems.map((col, ci) => (
                    <Column
                        key={ci}
                        items={col}
                        index={ci}
                        accent={accent}
                        animated={!isStatic}
                        speedRef={speedRef}
                        onOpen={(item) => startTransition(() => setOpen(item))}
                    />
                ))}
            </div>

            {RenderTarget.current() !== RenderTarget.canvas && (
                <>
                    <ArchiveMascot />
                    <AnimatePresence>
                        {open && (
                            <Lightbox
                                item={open}
                                accent={accent}
                                onClose={() => setOpen(null)}
                            />
                        )}
                    </AnimatePresence>
                </>
            )}
        </div>
    )
}

function Column({
    items,
    index,
    accent,
    animated,
    speedRef,
    onOpen,
}: {
    items: GalleryItem[]
    index: number
    accent: string
    animated: boolean
    speedRef: MutableRefObject<number>
    onOpen: (item: GalleryItem) => void
}) {
    const trackRef = useRef<HTMLDivElement>(null)
    const offsetRef = useRef(0)
    const loopH = useRef(1)

    // Even cols → up (−), odd cols → down (+)
    const direction = index % 2 === 0 ? -1 : 1
    const idlePxPerSec = 16

    useEffect(() => {
        if (!animated || typeof window === "undefined") return

        let raf = 0
        let last = performance.now()

        const measure = () => {
            const el = trackRef.current
            if (!el) return
            loopH.current = Math.max(1, el.scrollHeight / 4)
        }

        const ro =
            typeof ResizeObserver !== "undefined"
                ? new ResizeObserver(measure)
                : null
        if (trackRef.current) {
            measure()
            ro?.observe(trackRef.current)
        }

        const tick = (now: number) => {
            const dt = Math.min(0.05, (now - last) / 1000)
            last = now
            measure()

            const px = idlePxPerSec * speedRef.current * direction * dt
            offsetRef.current += px

            const h = loopH.current
            if (offsetRef.current >= h) offsetRef.current -= h
            if (offsetRef.current < 0) offsetRef.current += h

            if (trackRef.current) {
                trackRef.current.style.transform = `translate3d(0, ${-offsetRef.current}px, 0)`
            }
            raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)

        return () => {
            cancelAnimationFrame(raf)
            ro?.disconnect()
        }
    }, [animated, direction, speedRef])

    return (
        <div
            style={{
                flex: 1,
                minWidth: 0,
                height: "100%",
                overflow: "hidden",
                position: "relative",
            }}
        >
            <div
                ref={trackRef}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    willChange: animated ? "transform" : undefined,
                    paddingTop: index % 2 === 0 ? 0 : 40,
                }}
            >
                {items.map((item, ii) => (
                    <Tile
                        key={`${index}-${ii}-${item.title}`}
                        item={item}
                        accent={accent}
                        tall={((index + ii) % 5) === 0 || ((index + ii) % 3) === 0}
                        onOpen={() => onOpen(item)}
                    />
                ))}
            </div>
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
                background: "#e8e2d6",
                cursor: "pointer",
                overflow: "hidden",
                borderRadius: 8,
                boxShadow: "0 2px 10px rgba(28,24,20,0.08)",
                aspectRatio: tall ? "3 / 4.2" : "4 / 5",
                flex: "none",
            }}
        >
            <img
                src={item.imageUrl}
                alt={item.title}
                draggable={false}
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

function Lightbox({
    item,
    accent,
    onClose,
}: {
    item: GalleryItem
    accent: string
    onClose: () => void
}) {
    useEffect(() => {
        if (typeof window === "undefined") return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [onClose])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 1000,
                background: "rgba(30,26,18,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
            }}
        >
            <motion.div
                initial={{ scale: 0.94, y: 16 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 26 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "#fff",
                    border: "1.5px solid #111",
                    width: "min(920px, 96vw)",
                    maxHeight: "92vh",
                    overflow: "auto",
                    position: "relative",
                    fontFamily: SANS,
                    color: "#111",
                }}
            >
                <button
                    type="button"
                    onClick={onClose}
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
                    src={item.imageUrl}
                    alt={item.title}
                    style={{
                        width: "100%",
                        maxHeight: "68vh",
                        objectFit: "contain",
                        display: "block",
                        background: CREAM,
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
                            color: "#111",
                        }}
                    >
                        {item.title}
                    </h3>
                    <p
                        style={{
                            margin: 0,
                            fontSize: 15,
                            lineHeight: 1.6,
                            color: "#333",
                            maxWidth: 560,
                        }}
                    >
                        {item.description}
                    </p>
                </div>
            </motion.div>
        </motion.div>
    )
}

const DEFAULT_ITEMS: GalleryItem[] = [
    { title: "Poster Series", description: "Poster Series — placeholder description. Edit in the Archive CMS.", imageUrl: "https://framerusercontent.com/images/EDLQntkSaJbnZp1yOK6OtSRlsY.jpg" },
    { title: "Zine No.3", description: "Zine No.3 — placeholder description. Edit in the Archive CMS.", imageUrl: "https://framerusercontent.com/images/0BNePQmVfEM8AvcQFkf9bvU1uk.jpg" },
    { title: "Brand Marks", description: "Brand Marks — placeholder description. Edit in the Archive CMS.", imageUrl: "https://framerusercontent.com/images/CPNGiVHiKfZ1cdFpCczUfZ8A.jpg" },
    { title: "Type Study", description: "Type Study — placeholder description. Edit in the Archive CMS.", imageUrl: "https://framerusercontent.com/images/DS6z3TfvONE7UyJGwD5VFHpj7A0.jpg" },
    { title: "Social Kit", description: "Social Kit — placeholder description. Edit in the Archive CMS.", imageUrl: "https://framerusercontent.com/images/HDUMcXuln281FyQNRgyuMOT7zhY.jpg" },
    { title: "Packaging", description: "Packaging — placeholder description. Edit in the Archive CMS.", imageUrl: "https://framerusercontent.com/images/EDLQntkSaJbnZp1yOK6OtSRlsY.jpg" },
    { title: "Editorial Spread", description: "Editorial Spread — placeholder description. Edit in the Archive CMS.", imageUrl: "https://framerusercontent.com/images/0BNePQmVfEM8AvcQFkf9bvU1uk.jpg" },
    { title: "Sticker Pack", description: "Sticker Pack — placeholder description. Edit in the Archive CMS.", imageUrl: "https://framerusercontent.com/images/CPNGiVHiKfZ1cdFpCczUfZ8A.jpg" },
    { title: "Album Art", description: "Album Art — placeholder description. Edit in the Archive CMS.", imageUrl: "https://framerusercontent.com/images/DS6z3TfvONE7UyJGwD5VFHpj7A0.jpg" },
    { title: "Wayfinding", description: "Wayfinding — placeholder description. Edit in the Archive CMS.", imageUrl: "https://framerusercontent.com/images/HDUMcXuln281FyQNRgyuMOT7zhY.jpg" },
    { title: "Risograph", description: "Risograph — placeholder description. Edit in the Archive CMS.", imageUrl: "https://framerusercontent.com/images/EDLQntkSaJbnZp1yOK6OtSRlsY.jpg" },
    { title: "Lettering", description: "Lettering — placeholder description. Edit in the Archive CMS.", imageUrl: "https://framerusercontent.com/images/0BNePQmVfEM8AvcQFkf9bvU1uk.jpg" },
]

addPropertyControls(ArchiveGallery, {
    items: {
        type: ControlType.Array,
        title: "Items (Archive CMS)",
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
                imageUrl: {
                    type: ControlType.String,
                    title: "Image URL",
                    defaultValue: "https://framerusercontent.com/images/EDLQntkSaJbnZp1yOK6OtSRlsY.jpg",
                },
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
        defaultValue: 0.06,
        min: 0,
        max: 0.4,
        step: 0.01,
    },
})
