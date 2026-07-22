import type { CSSProperties } from "react"

const IMG = "https://framerusercontent.com/images/"
const STAGE_W = 1440
const STAGE_H = 900
const ANNIE = '"Annie Use Your Telescope", "Bradley Hand", cursive'
const INTER =
    '"Inter Display", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
const INK = "#111111"
const CREAM = "#F3EFE6"

/** Cropped desk objects [x,y,w,h] from homepage illustration layers */
const FOOTER_OBJECTS: {
    key: string
    hash: string
    box: [number, number, number, number]
    width: number
    bottom: number
    rotate: number
    z: number
}[] = [
    {
        key: "books",
        hash: "z3PLroDJfbET05ZaDmzpA5lIAk",
        box: [560, 95, 190, 150],
        width: 150,
        bottom: 18,
        rotate: -6,
        z: 2,
    },
    {
        key: "journal",
        hash: "JPLbpkF1Jd17vRUT1rfmmgPhfQ",
        box: [241, 717, 167, 126],
        width: 168,
        bottom: 8,
        rotate: -3,
        z: 3,
    },
    {
        key: "schedule",
        hash: "NDoJcAe2hm9jNoRn1l3KPiH88kM",
        box: [388, 485, 76, 68],
        width: 96,
        bottom: 42,
        rotate: 8,
        z: 4,
    },
    {
        key: "chutney",
        hash: "AwkrKCuhUkRurlYPAzFRI4yw",
        box: [542, 493, 84, 75],
        width: 108,
        bottom: 36,
        rotate: -4,
        z: 5,
    },
    {
        key: "sooraj",
        hash: "O3MmyItiSJFvHk9GjYSG9NdqSc",
        box: [556, 428, 68, 60],
        width: 92,
        bottom: 78,
        rotate: 0,
        z: 6,
    },
    {
        key: "laptop",
        hash: "ffeeCWEVauyRc2jUztvEkKArptM",
        box: [570, 526, 354, 245],
        width: 280,
        bottom: 0,
        rotate: 0,
        z: 7,
    },
    {
        key: "phone",
        hash: "iokbHxpk1MBj2DyMk1qoueeeQM",
        box: [963, 717, 100, 98],
        width: 110,
        bottom: 14,
        rotate: 5,
        z: 8,
    },
    {
        key: "notes",
        hash: "52nGQQ7gLqDiguh8AvcoksZaBGI",
        box: [1056, 691, 113, 88],
        width: 120,
        bottom: 48,
        rotate: -8,
        z: 4,
    },
    {
        key: "sticky",
        hash: "Ks4KMbXjOzLJjGMxHdmGi4llY",
        box: [980, 520, 90, 90],
        width: 88,
        bottom: 96,
        rotate: 10,
        z: 3,
    },
]

export interface DeskWorkFooterProps {
    accent?: string
    headline?: string
    subline?: string
    showHome?: boolean
    style?: CSSProperties
}

/**
 * Illustrated desk-edge footer for Work + Case study pages.
 * Uses cropped homepage desk PNGs as a lively object parade.
 */
export default function DeskWorkFooter({
    accent = "#2C6BE0",
    headline = "back to the desk",
    subline = "More stories, sticky notes, and side quests live on the homepage.",
    showHome = true,
    style,
}: DeskWorkFooterProps) {
    return (
        <footer
            style={{
                position: "relative",
                width: "100%",
                marginTop: 72,
                background: CREAM,
                borderTop: `1.5px solid ${INK}`,
                overflow: "hidden",
                fontFamily: INTER,
                ...style,
            }}
        >
            <link
                href="https://fonts.googleapis.com/css2?family=Annie+Use+Your+Telescope&display=swap"
                rel="stylesheet"
            />

            {/* Copy band */}
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
                            fontFamily: ANNIE,
                            fontSize: "clamp(36px, 5vw, 56px)",
                            lineHeight: 1.05,
                            color: INK,
                            marginBottom: 10,
                        }}
                    >
                        {headline}
                    </div>
                    <p
                        style={{
                            margin: 0,
                            fontSize: 15,
                            lineHeight: 1.5,
                            color: "#555",
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
                    {showHome ? <FooterLink href="/" label="Home" accent={accent} /> : null}
                    <FooterLink href="/work" label="Work" accent={accent} />
                    <FooterLink href="/archive" label="Archive" accent={accent} />
                    <FooterLink href="/contact" label="Contact" accent={accent} />
                </nav>
            </div>

            {/* Desk surface + object parade */}
            <div
                aria-hidden
                style={{
                    position: "relative",
                    height: 220,
                    marginTop: 8,
                }}
            >
                {/* desk edge */}
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: 54,
                        background:
                            "linear-gradient(180deg, rgba(194,170,130,0.35) 0%, rgba(160,130,90,0.55) 100%)",
                        borderTop: `1.5px solid ${INK}`,
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
                    {FOOTER_OBJECTS.map((obj) => (
                        <DeskCrop key={obj.key} obj={obj} />
                    ))}
                </div>
            </div>
        </footer>
    )
}

function FooterLink({
    href,
    label,
    accent,
}: {
    href: string
    label: string
    accent: string
}) {
    return (
        <a
            href={href}
            style={{
                display: "inline-block",
                textDecoration: "none",
                color: "#fff",
                background: INK,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 0.6,
                padding: "8px 12px",
                borderRadius: 4,
                border: `1.5px solid ${INK}`,
                boxShadow: `2px 2px 0 ${accent}`,
            }}
        >
            {label}
        </a>
    )
}

function DeskCrop({
    obj,
}: {
    obj: (typeof FOOTER_OBJECTS)[number]
}) {
    const [x, y, w, h] = obj.box
    const displayW = obj.width
    const displayH = (h / w) * displayW
    const scale = displayW / w
    return (
        <div
            style={{
                position: "relative",
                width: displayW,
                height: displayH,
                marginBottom: obj.bottom,
                transform: `rotate(${obj.rotate}deg)`,
                zIndex: obj.z,
                flex: "0 0 auto",
                overflow: "hidden",
                filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.18))",
                transition: "transform 220ms ease",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = `rotate(${obj.rotate}deg) translateY(-8px) scale(1.04)`
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = `rotate(${obj.rotate}deg)`
            }}
        >
            <div
                style={{
                    position: "absolute",
                    width: STAGE_W * scale,
                    height: STAGE_H * scale,
                    left: -x * scale,
                    top: -y * scale,
                    backgroundImage: `url(${IMG}${obj.hash}.png)`,
                    backgroundSize: "100% 100%",
                    backgroundRepeat: "no-repeat",
                    pointerEvents: "none",
                }}
            />
        </div>
    )
}
