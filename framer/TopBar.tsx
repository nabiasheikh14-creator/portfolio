import { type CSSProperties } from "react"
import { addPropertyControls, ControlType } from "framer"

const HAND = '"Caveat", "Bradley Hand", cursive'
const SANS = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

interface TopBarProps {
    name: string
    archiveHref: string
    projectsHref: string
    contactHref: string
    accent: string
    style?: CSSProperties
}

/**
 * Top Bar — a constant floating header: name (→ home), Archive + Projects
 * links, and a Contact button. Sticks to the top of every page.
 *
 * @framerIntrinsicHeight 66
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function TopBar(props: TopBarProps) {
    const {
        name = "NABIA SHAIKH",
        archiveHref = "/archive",
        projectsHref = "/work",
        contactHref = "/contact",
        accent = "#2C6BE0",
    } = props

    return (
        <div
            style={{
                position: "sticky",
                top: 0,
                zIndex: 1000,
                width: "100%",
                height: 66,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 24px",
                background: "rgba(243,239,230,0.82)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                borderBottom: "2px solid #111",
                fontFamily: SANS,
                ...props.style,
            }}
        >
            <a
                href="/"
                style={{
                    fontFamily: HAND,
                    fontSize: 30,
                    fontWeight: 700,
                    color: "#111",
                    textDecoration: "none",
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                }}
            >
                {name}
            </a>
            <nav style={{ display: "flex", alignItems: "center", gap: 22 }}>
                <a href={archiveHref} style={linkStyle}>
                    Archive
                </a>
                <a href={projectsHref} style={linkStyle}>
                    Projects
                </a>
                <a
                    href={contactHref}
                    style={{
                        fontFamily: SANS,
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#fff",
                        background: accent,
                        textDecoration: "none",
                        padding: "9px 16px",
                        borderRadius: 6,
                        whiteSpace: "nowrap",
                    }}
                >
                    Contact me
                </a>
            </nav>
        </div>
    )
}

const linkStyle: CSSProperties = {
    fontFamily: SANS,
    fontWeight: 600,
    fontSize: 15,
    color: "#111",
    textDecoration: "none",
    whiteSpace: "nowrap",
}

addPropertyControls(TopBar, {
    name: { type: ControlType.String, title: "Name", defaultValue: "NABIA SHAIKH" },
    archiveHref: { type: ControlType.Link, title: "Archive Link" },
    projectsHref: { type: ControlType.Link, title: "Projects Link" },
    contactHref: { type: ControlType.Link, title: "Contact Link" },
    accent: { type: ControlType.Color, title: "Accent", defaultValue: "#2C6BE0" },
})
