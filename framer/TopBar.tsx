import { type CSSProperties } from "react"
import { addPropertyControls, ControlType } from "framer"

const INTER =
    '"Inter Display", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

interface TopBarProps {
    name: string
    workHref: string
    archiveHref: string
    contactHref: string
    accent: string
    font?: { fontFamily?: string }
    style?: CSSProperties
}

/**
 * Top Bar — a floating, sticky pill centered at the top of the page: the name
 * (→ home), Work + Archive links, and a Contact button.
 *
 * @framerIntrinsicHeight 72
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function TopBar(props: TopBarProps) {
    const {
        name = "NABIA SHAIKH NADEEM",
        workHref = "/work",
        archiveHref = "/archive",
        contactHref = "/contact",
        accent = "#2C6BE0",
    } = props
    const family = props.font?.fontFamily || INTER

    return (
        <div
            style={{
                position: "sticky",
                top: 16,
                zIndex: 1000,
                width: "100%",
                display: "flex",
                justifyContent: "center",
                pointerEvents: "none",
                padding: "0 16px",
                boxSizing: "border-box",
                fontFamily: family,
                ...props.style,
            }}
        >
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            <div
                style={{
                    pointerEvents: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    maxWidth: "100%",
                    padding: "9px 10px 9px 22px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.86)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    border: "1.5px solid #111",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
                }}
            >
                <a
                    href="/"
                    style={{
                        fontFamily: family,
                        fontSize: 16,
                        fontWeight: 700,
                        letterSpacing: "0.02em",
                        color: "#111",
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                    }}
                >
                    {name}
                </a>
                <span style={{ width: 1, height: 20, background: "rgba(17,17,17,0.25)", flex: "none" }} />
                <nav style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <a href={workHref} style={linkStyle(family)}>
                        Work
                    </a>
                    <a href={archiveHref} style={linkStyle(family)}>
                        Archive
                    </a>
                    <a
                        href={contactHref}
                        style={{
                            fontFamily: family,
                            fontWeight: 600,
                            fontSize: 14,
                            color: "#fff",
                            background: accent,
                            textDecoration: "none",
                            padding: "9px 16px",
                            borderRadius: 999,
                            whiteSpace: "nowrap",
                        }}
                    >
                        Contact me
                    </a>
                </nav>
            </div>
        </div>
    )
}

function linkStyle(family: string): CSSProperties {
    return {
        fontFamily: family,
        fontWeight: 400,
        fontSize: 15,
        color: "#111",
        textDecoration: "none",
        whiteSpace: "nowrap",
    }
}

addPropertyControls(TopBar, {
    name: { type: ControlType.String, title: "Name", defaultValue: "NABIA SHAIKH NADEEM" },
    workHref: { type: ControlType.Link, title: "Work Link" },
    archiveHref: { type: ControlType.Link, title: "Archive Link" },
    contactHref: { type: ControlType.Link, title: "Contact Link" },
    accent: { type: ControlType.Color, title: "Accent", defaultValue: "#2C6BE0" },
    font: {
        type: ControlType.Font,
        title: "Font",
        controls: "extended",
        defaultFontType: "sans-serif",
        defaultValue: { fontSize: 15, variant: "Regular" },
    },
})
