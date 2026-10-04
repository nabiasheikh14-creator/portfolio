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
    /** Grid/tile image. */
    imageUrl: string
    /** Optional first (or only) lightbox image — falls back to imageUrl. */
    popupImageUrl?: string
    /** Extra lightbox slides. One image → static; 2+ → auto slideshow. */
    galleryImages?: string[]
    /**
     * Color behind the card when it is not as tall as the archive tile.
     * Matched to the card itself (Cher’s pink, Aagahi black, and so on).
     */
    tileColor?: string
    /** Popup fit. Portrait photos use contain so the frame does not slice them. */
    popupFit?: "cover" | "contain"
    /**
     * Lock the tile to the tall archive ratio. Used when the display artwork
     * was made for that frame (Cher’s poster is exactly 3 / 4.2).
     */
    tall?: boolean
}

interface ArchiveGalleryProps {
    items: GalleryItem[]
    accent: string
    columns: number
    gridOpacity: number
    /** Editable Back pill destination. */
    backLink: string
    /** Seconds each popup slide stays visible before the next hard cut. */
    slideshowInterval: number
    /** Seconds to wait after opening before the first slide change. */
    slideshowDelay: number
    style?: CSSProperties
}

/** Default: faster cut between frames (was 2.8s). Overridable in Framer. */
const DEFAULT_SLIDESHOW_INTERVAL_S = 1.4
/** Default pause after open before first advance. Overridable in Framer. */
const DEFAULT_SLIDESHOW_DELAY_S = 0.6

function resolveImageSrc(value: unknown): string {
    if (value == null || value === "") return ""
    if (typeof value === "string") return value.trim()
    if (typeof value === "object" && value && "src" in (value as object)) {
        return String((value as { src?: unknown }).src || "").trim()
    }
    return ""
}

/**
 * Popup slides. The grid card is a different shape from these horizontal
 * frames, so it stays out of the slideshow whenever other images exist.
 */
function collectSlides(item: GalleryItem): string[] {
    const extras = (item.galleryImages || [])
        .map((g) => resolveImageSrc(g))
        .filter(Boolean)
    const primary =
        resolveImageSrc(item.imageUrl) || resolveImageSrc(item.popupImageUrl)
    const urls = extras.length > 0 ? extras : primary ? [primary] : []
    const out: string[] = []
    const seen = new Set<string>()
    for (const url of urls) {
        if (!url || seen.has(url)) continue
        seen.add(url)
        out.push(url)
    }
    return out
}

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

const CREAM = "#F3EFE6"
const PHONE_MQ = "(max-width: 809.98px)"
const TABLET_MQ = "(min-width: 810px) and (max-width: 1199.98px)"

/** Back control — vertically aligned with the TopBar pill (pill sits at top: 48px). */
function ArchiveBack({ accent, href = "/" }: { accent: string; href?: string }) {
    useEffect(() => {
        if (typeof document === "undefined") return

        // Clean up any leftover archive mascot from earlier deploys
        document.querySelectorAll("[data-archive-mascot]").forEach((n) => n.remove())

        const a = document.createElement("a")
        a.href = href || "/"
        a.setAttribute("aria-label", "Back to desk")
        a.dataset.archiveBack = "true"
        const applyChrome = () => {
            const phone = window.matchMedia(PHONE_MQ).matches
            Object.assign(a.style, {
                position: "fixed",
                // Match TopBar on desktop; drop under the bar on phone.
                top: phone ? "88px" : "48px",
                left: phone ? "12px" : "24px",
                zIndex: "1200",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: phone ? "8px 14px" : "10px 22px",
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
        const label = document.createElement("span")
        label.textContent = "Back"
        a.append(arrow, label)
        document.body.appendChild(a)

        return () => {
            window.removeEventListener("resize", applyChrome)
            a.remove()
        }
    }, [accent, href])

    return null
}

/**
 * Archive Gallery — fixed full-viewport cream stage (matches home).
 * Columns 1+3 and 2+4 auto-drift opposite ways in an infinite loop.
 * Mouse wheel / trackpad speeds the columns (does not move the page).
 * Back pill aligned with TopBar returns to the desk. Items from Archive CMS.
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
        backLink = "/",
        slideshowInterval = DEFAULT_SLIDESHOW_INTERVAL_S,
        slideshowDelay = DEFAULT_SLIDESHOW_DELAY_S,
    } = props

    const intervalMs = Math.round(
        Math.max(0.3, Number(slideshowInterval) || DEFAULT_SLIDESHOW_INTERVAL_S) *
            1000,
    )
    const delayMs = Math.round(
        Math.max(0, Number(slideshowDelay) || DEFAULT_SLIDESHOW_DELAY_S) * 1000,
    )

    const isStatic = useIsStaticRenderer()
    const [open, setOpen] = useState<GalleryItem | null>(null)
    const [viewportCols, setViewportCols] = useState<number | null>(null)
    const backHref = resolveLink(backLink, "/")

    useEffect(() => {
        if (typeof window === "undefined") return
        const sync = () => {
            if (window.matchMedia(PHONE_MQ).matches) setViewportCols(2)
            else if (window.matchMedia(TABLET_MQ).matches) setViewportCols(3)
            else setViewportCols(null)
        }
        sync()
        window.addEventListener("resize", sync)
        return () => window.removeEventListener("resize", sync)
    }, [])

    // Desktop keeps the author/control column count. Phone/tablet override only.
    const colCount = Math.max(
        2,
        Math.min(5, Math.round(viewportCols ?? columns)),
    )

    // Shared speed multiplier for all columns (wheel boosts this)
    const speedRef = useRef(1)
    const scrollingRef = useRef(false)
    const scrollTimeout = useRef<number | null>(null)

    const sourceItems = useMemo(() => {
        const authored = (items || [])
            .map((it: any) => {
                const imageUrl =
                    resolveImageSrc(it?.imageUrl) ||
                    resolveImageSrc(it?.image) ||
                    ""
                if (!imageUrl) return null
                const description = String(it.description || "")
                // Framer ships stock placeholder rows on the canvas instance;
                // skip them so real projects from DEFAULT_ITEMS can show.
                if (/placeholder description/i.test(description)) return null
                const popupImageUrl =
                    resolveImageSrc(it?.popupImageUrl) ||
                    resolveImageSrc(it?.popupImage) ||
                    imageUrl
                const galleryImages = (
                    Array.isArray(it?.galleryImages) ? it.galleryImages : []
                )
                    .map((g: unknown) => resolveImageSrc(g))
                    .filter(Boolean) as string[]
                return {
                    title: it.title || "Untitled",
                    description,
                    imageUrl: String(imageUrl),
                    popupImageUrl: String(popupImageUrl),
                    galleryImages,
                } as GalleryItem
            })
            .filter(Boolean) as GalleryItem[]

        // Canonical archive list is DEFAULT_ITEMS (synced from the Archive CMS).
        // Canvas instance rows only add extra projects (e.g. volunteering),
        // so stale component props can't override CMS photos.
        const defaultTitles = new Set(
            DEFAULT_ITEMS.map((d) => d.title.toLowerCase()),
        )
        const retired =
            /kodoto|giethoorn|geithorn|fintech|health platform|readings placeholder/i
        const extras = authored.filter((it) => {
            const title = it.title.toLowerCase()
            if (defaultTitles.has(title)) return false
            if (retired.test(it.title)) return false
            return true
        })
        return [...DEFAULT_ITEMS, ...extras]
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
                    gap: viewportCols === 2 ? 10 : 14,
                    padding: viewportCols === 2 ? "0 8px" : "0 14px",
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
                    <ArchiveBack accent={accent} href={backHref} />
                    <AnimatePresence>
                        {open && (
                            <Lightbox
                                item={open}
                                accent={accent}
                                intervalMs={intervalMs}
                                delayMs={delayMs}
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
    const loopRef = useRef<HTMLDivElement>(null)
    const offsetRef = useRef(0)
    const loopH = useRef(1)

    // Even cols → up (−), odd cols → down (+)
    const direction = index % 2 === 0 ? -1 : 1
    const idlePxPerSec = 16
    const gap = 14
    const copies = 4
    // The list is the same column repeated. Height must follow the slot in
    // that column, not the copy, or a card grows and shrinks as it loops.
    const baseLen =
        items.length > 0 && items.length % copies === 0
            ? items.length / copies
            : Math.max(1, items.length)

    useEffect(() => {
        if (!animated || typeof window === "undefined") return

        let raf = 0
        let last = performance.now()

        const measure = () => {
            const block = loopRef.current
            if (!block) return
            // Stride is one repeated block plus the gap before the next one.
            loopH.current = Math.max(1, block.offsetHeight + gap)
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
    }, [animated, direction, speedRef, items.length])

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
                    gap,
                    willChange: animated ? "transform" : undefined,
                    paddingTop: index % 2 === 0 ? 0 : 40,
                }}
            >
                {Array.from({ length: copies }, (_, copy) => {
                    const block = items.slice(copy * baseLen, (copy + 1) * baseLen)
                    if (!block.length) return null
                    return (
                        <div
                            key={copy}
                            ref={copy === 0 ? loopRef : undefined}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap,
                            }}
                        >
                            {block.map((item, slot) => (
                                <Tile
                                    key={`${index}-${copy}-${slot}-${item.title}`}
                                    item={item}
                                    accent={accent}
                                    tall={
                                        item.tall ??
                                        ((index + slot) % 5 === 0 ||
                                            (index + slot) % 3 === 0)
                                    }
                                    onOpen={() => onOpen(item)}
                                />
                            ))}
                        </div>
                    )
                })}
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
    const tileBg = item.tileColor || "#e8e2d6"
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
                background: tileBg,
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
                    objectPosition: "center",
                    display: "block",
                    background: tileBg,
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
    intervalMs,
    delayMs,
    onClose,
}: {
    item: GalleryItem
    accent: string
    intervalMs: number
    delayMs: number
    onClose: () => void
}) {
    const slides = useMemo(() => collectSlides(item), [item])
    const multi = slides.length > 1
    const [index, setIndex] = useState(0)

    useEffect(() => {
        if (typeof window === "undefined") return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [onClose])

    // Preload every slide so instant cuts never flash blank/cream.
    useEffect(() => {
        if (!multi || typeof window === "undefined") return
        const loaders = slides.map((src) => {
            const img = new window.Image()
            img.src = src
            return img
        })
        return () => {
            loaders.forEach((img) => {
                img.src = ""
            })
        }
    }, [multi, slides])

    // Auto slideshow — starts after a delay, only when 2+ images exist.
    // Hard cut between frames (no fade / dissolve). Popup-only.
    useEffect(() => {
        if (!multi || typeof window === "undefined") return
        setIndex(0)
        let intervalId: number | null = null
        const startId = window.setTimeout(() => {
            intervalId = window.setInterval(() => {
                setIndex((i) => (i + 1) % slides.length)
            }, intervalMs)
        }, delayMs)
        return () => {
            window.clearTimeout(startId)
            if (intervalId != null) window.clearInterval(intervalId)
        }
    }, [multi, slides.length, item.title, intervalMs, delayMs])

    const current = slides[index] || slides[0] || item.imageUrl

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
                        zIndex: 3,
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

                <div
                    style={{
                        position: "relative",
                        // Full width of the dialog, same proportion as the
                        // campaign frames, so cover meets every edge.
                        width: "100%",
                        aspectRatio: "3588 / 2355",
                        background: "#111",
                        overflow: "hidden",
                    }}
                >
                    {multi ? (
                        // Stack all slides; toggle with no transition so
                        // each advance is an instant hard cut (no dissolve).
                        slides.map((src, i) => (
                            <img
                                key={src}
                                src={src}
                                alt={
                                    i === index
                                        ? `${item.title} — ${i + 1} of ${slides.length}`
                                        : ""
                                }
                                aria-hidden={i !== index}
                                draggable={false}
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    display: "block",
                                    opacity: i === index ? 1 : 0,
                                    zIndex: i === index ? 1 : 0,
                                    pointerEvents: "none",
                                    // Force hard cut — kill any inherited fade/transition.
                                    transition: "none",
                                    animation: "none",
                                }}
                            />
                        ))
                    ) : (
                        <img
                            src={current}
                            alt={item.title}
                            draggable={false}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit:
                                    item.popupFit === "contain"
                                        ? "contain"
                                        : "cover",
                                objectPosition: "center",
                                display: "block",
                            }}
                        />
                    )}
                </div>

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
    {
        title: "Broken Hearts Crux",
        description:
            "Branding for a themed coffee pop-up with punk-hearted energy.",
        imageUrl:
            "https://framerusercontent.com/images/Un3gv23Abjx2sxAXxmWzbbiRoA.png",
        galleryImages: [
            "https://framerusercontent.com/images/8NVeowU29foyOIpNXI9JXw4afA.webp",
            "https://framerusercontent.com/images/WYkfkReD6dCBqQjZAJHsAwIqZY.png",
            "https://framerusercontent.com/images/4mjK0YcKaecuLeCg0eUPMRku4fc.webp",
            "https://framerusercontent.com/images/XGWVwMWHnvVhyLkgLFDhrE5lgHU.webp",
        ],
    },
    {
        title: "readings.pk",
        description:
            "Home redesign for Readings.pk, Pakistan’s online bookstore.",
        imageUrl:
            "https://framerusercontent.com/images/e4MUzlSYmjvY3kY9Sn9e4FCkmU.jpg",
        tileColor: "#3E5FAC",
        galleryImages: [
            "https://framerusercontent.com/images/xcsmDwgXswKqkG2iATX1imKWPM4.png",
            "https://framerusercontent.com/images/CRMzkccnukfnUKjcPzQF2HG1LwI.png",
            "https://framerusercontent.com/images/OAwKQcQ4VFrbezsIL3xUddcMm4s.png",
        ],
    },
    {
        title: "Aagahi",
        description: "Social media campaign.",
        imageUrl:
            "https://framerusercontent.com/images/2GV6n7qSiyaXmNM5OFQP6xdDMo.jpg",
        tileColor: "#000000",
        galleryImages: [
            "https://framerusercontent.com/images/jgzzpmDWkJYh6lbtZO2hbwks.png",
            "https://framerusercontent.com/images/IkHDE6ZZV9sjmFRwQIlyQ2aj0.png",
            "https://framerusercontent.com/images/SOVSQZi0bQgzYZivQYgLZXBq0.png",
        ],
    },
    {
        title: "Friends of Figma Karachi",
        description:
            "Chutney Studios has been a part of the friends of figma community for it's Karachi chapter for the past two years. With every meetup, watchparty, and event, best believe that team chutney has the design side handled.",
        imageUrl:
            "https://framerusercontent.com/images/A4rorcJflWymhHNKivqdF31jbMQ.jpg",
        tileColor: "#56A3EB",
        popupFit: "contain",
        galleryImages: [
            "https://framerusercontent.com/images/NIHetRF37gg7bJmwR6rWccSevQ.jpg",
            "https://framerusercontent.com/images/RNYpDUOiQg49PaNuGzExeYPNU.jpg",
        ],
    },
    {
        title: "Sindbad App",
        description:
            "While I was the designer at WonderTech, I got the change to design Sindbad's mobile application for Pakistan. This was my first real world experience and I was so proud of my work being used by people to date!",
        imageUrl:
            "https://framerusercontent.com/images/wYjUv5M7i82OeT0bXJu8DhO6Y.jpg",
        tileColor: "#F3EEE5",
        galleryImages: [
            "https://framerusercontent.com/images/mIN8fjFYbCS6HvrQP0PvlWVuQk4.jpg",
            "https://framerusercontent.com/images/ZfEo0GBvGRiOi0ADA1oClWA0g.jpg",
            "https://framerusercontent.com/images/BRJL8HCiiNeLl3Im5Go0bt38PHM.jpg",
        ],
    },
    {
        title: "Cher's Closet",
        description:
            "A fashion wardrobe app — one-step styling for outfits, mood boards, and personal fit.",
        imageUrl:
            "https://framerusercontent.com/images/jGLbOvqUNVSniVYVJDoE4HvhsrE.jpg",
        tileColor: "#E295C3",
        tall: true,
        galleryImages: [
            "https://framerusercontent.com/images/vRyItVCUBfQiZ5TNkuHSFTYc9u8.png",
            "https://framerusercontent.com/images/waAOmDklpQafvsglPwGXm5Fhzmk.png",
            "https://framerusercontent.com/images/b9X6XfccTpBGnAayUlmBP22sf4.png",
        ],
    },
    {
        title: "Paanshah",
        description:
            "Brand identity for a paan shop — bilingual manuals, stickers, and calligraphic mark.",
        imageUrl:
            "https://framerusercontent.com/images/XnOyAN2XugGMwfR1YvU0DWn3U.jpg",
        tileColor: "#F7F7F7",
        galleryImages: [
            "https://framerusercontent.com/images/Y4Ey9MYHxnh51s83YDMyO10NS0.png",
            "https://framerusercontent.com/images/NrSW54w1qY4GaBXoHxxwCN2fzM.png",
            "https://framerusercontent.com/images/e1HED0acPUyBbRN3zIDLgCA5rRc.png",
        ],
    },
    {
        title: "Wave e-commerce website",
        description:
            "Mobile e-commerce for Wave Apparel — product grids, cart, and checkout.",
        imageUrl:
            "https://framerusercontent.com/images/w7oKQ4d106sGi9e5QcIDRM3GmM.jpg",
        tileColor: "#FDFBF7",
        galleryImages: [
            "https://framerusercontent.com/images/J0fMbOfcmArbBzxDKuO3du8t54.png",
            "https://framerusercontent.com/images/DiJp3kKqHZB5Y3710xf0GySnk.png",
            "https://framerusercontent.com/images/zdILYmkHktzG68JSEYeBwP6Y.png",
        ],
    },
    {
        title: "Nowa Atelier",
        description: "Brand and visual work for Nowa Atelier.",
        imageUrl:
            "https://framerusercontent.com/images/tZB1o5FmFeG85QaGZXn7OQ3fayo.jpg",
        tileColor: "#5A4630",
        tall: true,
    },
]

addPropertyControls(ArchiveGallery, {
    items: {
        type: ControlType.Array,
        title: "Archive Items",
        control: {
            type: ControlType.Object,
            controls: {
                title: {
                    type: ControlType.String,
                    title: "Title",
                    defaultValue: "Untitled",
                },
                description: {
                    type: ControlType.String,
                    title: "Description",
                    defaultValue: "Description",
                    displayTextArea: true,
                },
                imageUrl: {
                    type: ControlType.Image,
                    title: "Display Image",
                },
                galleryImages: {
                    type: ControlType.Array,
                    title: "Popup Images (optional)",
                    control: {
                        type: ControlType.Image,
                        title: "Image",
                    },
                    defaultValue: [],
                },
                tileColor: {
                    type: ControlType.Color,
                    title: "Tile Background",
                    optional: true,
                },
            },
        },
        defaultValue: DEFAULT_ITEMS,
    },
    accent: { type: ControlType.Color, title: "Accent", defaultValue: "#2C6BE0" },
    slideshowInterval: {
        type: ControlType.Number,
        title: "Slideshow Interval (sec)",
        defaultValue: DEFAULT_SLIDESHOW_INTERVAL_S,
        min: 0.4,
        max: 6,
        step: 0.1,
        displayStepper: true,
    },
    slideshowDelay: {
        type: ControlType.Number,
        title: "Slideshow Start Delay (sec)",
        defaultValue: DEFAULT_SLIDESHOW_DELAY_S,
        min: 0,
        max: 4,
        step: 0.1,
        displayStepper: true,
    },
    backLink: {
        type: ControlType.Link,
        title: "Link — Back Button",
        defaultValue: "/",
    },
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
