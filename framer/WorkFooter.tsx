import type { CSSProperties } from "react"
import { addPropertyControls, ControlType } from "framer"

const STAGE_W = 1440
const STAGE_H = 900
const DEFAULT_IMG = "https://framerusercontent.com/images/"
const DEFAULT_ANNIE = '"Annie Use Your Telescope", "Bradley Hand", cursive'
const DEFAULT_SANS =
    '"Inter Display", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

export type FooterObject = {
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

export const DEFAULT_FOOTER_OBJECTS: FooterObject[] = [
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

export interface DeskWorkFooterProps {
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
    style?: CSSProperties
}

/**
 * Illustrated desk-edge footer — fully editable via Framer property controls.
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 320
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function DeskWorkFooter(props: DeskWorkFooterProps) {
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

const objectControls = {
    key: { type: ControlType.String, title: "Name", defaultValue: "object" },
    imageUrl: { type: ControlType.Image, title: "Image" },
    cropX: { type: ControlType.Number, title: "Crop X", defaultValue: 0, min: 0, max: 1440 },
    cropY: { type: ControlType.Number, title: "Crop Y", defaultValue: 0, min: 0, max: 900 },
    cropW: { type: ControlType.Number, title: "Crop W", defaultValue: 100, min: 10, max: 1440 },
    cropH: { type: ControlType.Number, title: "Crop H", defaultValue: 100, min: 10, max: 900 },
    width: { type: ControlType.Number, title: "Display Width", defaultValue: 120, min: 40, max: 480 },
    bottom: { type: ControlType.Number, title: "Lift", defaultValue: 0, min: 0, max: 160 },
    rotate: { type: ControlType.Number, title: "Rotate", defaultValue: 0, min: -30, max: 30 },
    z: { type: ControlType.Number, title: "Z Index", defaultValue: 1, min: 1, max: 20 },
}

addPropertyControls(DeskWorkFooter, {
    headline: {
        type: ControlType.String,
        title: "Headline",
        defaultValue: "back to the desk",
    },
    subline: {
        type: ControlType.String,
        title: "Subline",
        displayTextArea: true,
        defaultValue: "More stories, sticky notes, and side quests live on the homepage.",
    },
    showHome: { type: ControlType.Boolean, title: "Show Home Link", defaultValue: true },
    cream: { type: ControlType.Color, title: "Background", defaultValue: "#F3EFE6" },
    ink: { type: ControlType.Color, title: "Ink", defaultValue: "#111111" },
    muted: { type: ControlType.Color, title: "Muted Text", defaultValue: "#555555" },
    accent: { type: ControlType.Color, title: "Accent", defaultValue: "#2C6BE0" },
    displayFont: {
        type: ControlType.Font,
        title: "Display Font",
        controls: "extended",
        defaultFontType: "sans-serif",
        defaultValue: { fontSize: 48, variant: "Regular" },
    },
    bodyFont: {
        type: ControlType.Font,
        title: "Body Font",
        controls: "extended",
        defaultFontType: "sans-serif",
        defaultValue: { fontSize: 15, variant: "Regular" },
    },
    headlineSize: {
        type: ControlType.Number,
        title: "Headline Size",
        defaultValue: 48,
        min: 24,
        max: 96,
        step: 1,
    },
    bodySize: {
        type: ControlType.Number,
        title: "Body Size",
        defaultValue: 15,
        min: 12,
        max: 28,
        step: 1,
    },
    objectScale: {
        type: ControlType.Number,
        title: "Illustration Scale",
        defaultValue: 1,
        min: 0.5,
        max: 1.8,
        step: 0.05,
    },
    railHeight: {
        type: ControlType.Number,
        title: "Rail Height",
        defaultValue: 220,
        min: 140,
        max: 360,
        step: 4,
    },
    objects: {
        type: ControlType.Array,
        title: "Illustrations",
        control: { type: ControlType.Object, controls: objectControls },
        defaultValue: DEFAULT_FOOTER_OBJECTS,
    },
})
