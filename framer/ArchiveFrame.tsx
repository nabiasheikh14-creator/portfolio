import { useMemo, useRef, useState, type CSSProperties } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    addPropertyControls,
    ControlType,
    RenderTarget,
    useIsStaticRenderer,
} from "framer"

const SANS = '"Inter Display", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

// Heavy, very visible film grain.
const GRAIN =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

interface Img {
    src: string
    srcSet?: string
    alt?: string
}
interface ArchiveFrameProps {
    title: string
    description: string
    image: Img
    size: string
    accent: string
    grain: number
    style?: CSSProperties
}

const SIZES: Record<string, { w: number; h: number }> = {
    S: { w: 230, h: 300 },
    M: { w: 330, h: 250 },
    L: { w: 390, h: 330 },
}

/**
 * Archive Frame — a grainy framed image. Hover shows the project title; click
 * opens a pop-up with the image, title and description. Gentle idle float.
 * Bind title / image / description / size to a CMS collection.
 *
 * @framerIntrinsicWidth 330
 * @framerIntrinsicHeight 250
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function ArchiveFrame(props: ArchiveFrameProps) {
    const {
        title = "Untitled Project",
        description = "A short description of this project goes here — edit it in the Archive CMS.",
        image = {
            src: "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg",
            alt: "Project",
        },
        size = "M",
        accent = "#2C6BE0",
        grain = 0.55,
    } = props

    const isStatic = useIsStaticRenderer()
    const [hover, setHover] = useState(false)
    const [open, setOpen] = useState(false)

    const dims = SIZES[size] || SIZES.M
    const drift = useRef({
        d: Math.random() * 2.5,
        r: (Math.random() - 0.5) * 3,
        y: 6 + Math.random() * 6,
    })

    const isFixedWidth = props?.style && (props.style as CSSProperties).width === "100%"

    const float = isStatic
        ? {}
        : {
              y: [0, -drift.current.y, 0],
              rotate: [0, drift.current.r, 0],
          }

    return (
        <motion.div
            style={{
                position: "relative",
                width: isFixedWidth ? "100%" : dims.w,
                height: dims.h,
                flex: "none",
            }}
            animate={float}
            transition={{
                duration: 5 + drift.current.d,
                repeat: isStatic ? 0 : Infinity,
                ease: "easeInOut",
            }}
        >
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            <button
                type="button"
                onClick={() => setOpen(true)}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                onFocus={() => setHover(true)}
                onBlur={() => setHover(false)}
                aria-label={`Open ${title}`}
                style={{
                    width: "100%",
                    height: "100%",
                    padding: 8,
                    background: "#fbfaf6",
                    border: "2px solid #111",
                    boxShadow: hover
                        ? "8px 8px 0 rgba(17,17,17,0.9)"
                        : "4px 4px 0 rgba(17,17,17,0.55)",
                    cursor: "pointer",
                    position: "relative",
                    transform: hover ? "scale(1.03)" : "scale(1)",
                    transition: "transform 0.12s ease, box-shadow 0.12s ease",
                    display: "block",
                }}
            >
                <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#ddd" }}>
                    <img
                        src={image?.src}
                        srcSet={image?.srcSet}
                        alt={image?.alt || title}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    {/* grain */}
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            backgroundImage: GRAIN,
                            backgroundSize: "160px 160px",
                            opacity: grain,
                            mixBlendMode: "multiply",
                            pointerEvents: "none",
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            backgroundImage: GRAIN,
                            backgroundSize: "220px 220px",
                            opacity: grain * 0.5,
                            mixBlendMode: "overlay",
                            pointerEvents: "none",
                        }}
                    />
                    {/* hover label */}
                    <AnimatePresence>
                        {hover && (
                            <motion.span
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                transition={{ duration: 0.16 }}
                                style={{
                                    position: "absolute",
                                    left: 10,
                                    bottom: 10,
                                    background: accent,
                                    color: "#fff",
                                    fontFamily: SANS,
                                    fontWeight: 700,
                                    fontSize: 13,
                                    letterSpacing: 0.4,
                                    padding: "5px 10px",
                                    borderRadius: 4,
                                    maxWidth: "88%",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                                }}
                            >
                                {title}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
            </button>

            {RenderTarget.current() !== RenderTarget.canvas && (
                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                            style={{
                                position: "fixed",
                                inset: 0,
                                zIndex: 1000,
                                background: "rgba(20,18,12,0.6)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: 20,
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0.92, y: 12 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.94 }}
                                transition={{ type: "spring", stiffness: 300, damping: 26 }}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    background: "#fff",
                                    border: "1.5px solid #111",
                                    width: "min(760px, 94vw)",
                                    maxHeight: "90vh",
                                    overflow: "auto",
                                    padding: 16,
                                    position: "relative",
                                    fontFamily: SANS,
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    aria-label="Close"
                                    style={{
                                        position: "absolute",
                                        top: 14,
                                        right: 14,
                                        zIndex: 2,
                                        fontFamily: SANS,
                                        fontWeight: 700,
                                        fontSize: 13,
                                        letterSpacing: 1,
                                        background: "#111",
                                        color: "#fff",
                                        border: "none",
                                        padding: "6px 10px",
                                        cursor: "pointer",
                                    }}
                                >
                                    X CLOSE
                                </button>
                                <div style={{ position: "relative", width: "100%", maxHeight: "60vh", overflow: "hidden", background: "#ddd" }}>
                                    <img src={image?.src} srcSet={image?.srcSet} alt={image?.alt || title} style={{ width: "100%", display: "block", objectFit: "contain" }} />
                                    <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, backgroundSize: "160px 160px", opacity: grain * 0.85, mixBlendMode: "multiply", pointerEvents: "none" }} />
                                </div>
                                <div style={{ padding: "18px 14px 10px" }}>
                                    <h3 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 800, color: "#111" }}>{title}</h3>
                                    <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "#444" }}>{description}</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </motion.div>
    )
}

addPropertyControls(ArchiveFrame, {
    title: { type: ControlType.String, title: "Title", defaultValue: "Untitled Project" },
    description: {
        type: ControlType.String,
        title: "Description",
        defaultValue: "A short description of this project goes here — edit it in the Archive CMS.",
        displayTextArea: true,
    },
    image: { type: ControlType.ResponsiveImage, title: "Image" },
    size: {
        type: ControlType.String,
        title: "Size (S / M / L)",
        defaultValue: "M",
    },
    accent: { type: ControlType.Color, title: "Accent", defaultValue: "#2C6BE0" },
    grain: { type: ControlType.Number, title: "Grain", defaultValue: 0.55, min: 0, max: 1, step: 0.05 },
})
