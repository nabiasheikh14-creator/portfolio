/**
 * TopBar — DEPRECATED as a code component.
 *
 * The live site now uses an editable **design component** named "TopBar"
 * (Inter, all-caps, letter-spacing -1px, Contact as a text link like Work /
 * Archive). Kept here only so older instances don't break if referenced.
 *
 * Prefer the canvas design component for text / font / spacing edits.
 */
import { type CSSProperties } from "react"
import { addPropertyControls, ControlType } from "framer"

const INTER =
    '"Inter", "Inter Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

interface TopBarProps {
    name: string
    homeHref: string
    workHref: string
    archiveHref: string
    contactHref: string
    accent: string
    font?: { fontFamily?: string }
    style?: CSSProperties
}

/**
 * @framerIntrinsicHeight 72
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function TopBar(props: TopBarProps) {
    const {
        name = "NABIA SHAIKH NADEEM",
        homeHref = "/",
        workHref = "/work",
        archiveHref = "/archive",
        contactHref = 'mailto:hello@example.com?subject=Let%27s%20work%20together&body=Hi%20Nabia%2C%0A%0AI%27d%20love%20to%20chat%20about%20a%20project.%0A%0A',
    } = props
    const family = props.font?.fontFamily || INTER

    const link: CSSProperties = {
        fontFamily: family,
        fontWeight: 500,
        fontSize: 13,
        letterSpacing: "-1px",
        textTransform: "uppercase",
        color: "#111",
        textDecoration: "none",
        whiteSpace: "nowrap",
    }

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                pointerEvents: "none",
                padding: "20px 24px 0",
                boxSizing: "border-box",
                fontFamily: family,
                ...props.style,
            }}
        >
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            <div
                style={{
                    pointerEvents: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 22,
                    maxWidth: "100%",
                    padding: "10px 22px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.88)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    border: "1.5px solid #111",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
                }}
            >
                <a href={homeHref || "/"} style={{ ...link, fontWeight: 600, fontSize: 14 }}>
                    {name}
                </a>
                <span style={{ width: 1, height: 16, background: "rgba(17,17,17,0.22)", flex: "none" }} />
                <nav style={{ display: "flex", alignItems: "center", gap: 18 }}>
                    <a href={workHref || "/work"} style={link}>
                        Work
                    </a>
                    <a href={archiveHref || "/archive"} style={link}>
                        Archive
                    </a>
                    <a href={contactHref} style={link}>
                        Contact
                    </a>
                </nav>
            </div>
        </div>
    )
}

addPropertyControls(TopBar, {
    name: { type: ControlType.String, title: "Name", defaultValue: "NABIA SHAIKH NADEEM" },
    homeHref: { type: ControlType.Link, title: "Link — Home / Name", defaultValue: "/" },
    workHref: { type: ControlType.Link, title: "Link — Work", defaultValue: "/work" },
    archiveHref: { type: ControlType.Link, title: "Link — Archive", defaultValue: "/archive" },
    contactHref: {
        type: ControlType.Link,
        title: "Link — Contact",
        defaultValue:
            "mailto:hello@example.com?subject=Let%27s%20work%20together&body=Hi%20Nabia%2C%0A%0AI%27d%20love%20to%20chat%20about%20a%20project.%0A%0A",
    },
    accent: { type: ControlType.Color, title: "Accent", defaultValue: "#2C6BE0" },
    font: {
        type: ControlType.Font,
        title: "Font",
        controls: "extended",
        defaultFontType: "sans-serif",
        defaultValue: { fontSize: 13, variant: "Medium" },
    },
})
