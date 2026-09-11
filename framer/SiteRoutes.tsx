import {
    useState,
    type CSSProperties,
    type ReactNode,
} from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

const DISPLAY = '"Archivo Black", "Arial Black", sans-serif'
const MONO = '"Space Mono", ui-monospace, monospace'
const PIXEL = '"Silkscreen", "Space Mono", monospace'
const BG = "#F3EFE6"
const INK = "#0A0A0A"

const STAGE_W = 1440
const STAGE_H = 900
const IMG = "https://framerusercontent.com/images/"

const PAGE_MASCOTS: Record<string, { hash: string; box: [number, number, number, number]; width: number }> = {
    about: { hash: "AwkrKCuhUkRurlYPAzFRI4yw", box: [542, 493, 84, 75], width: 110 },
    contact: { hash: "iokbHxpk1MBj2DyMk1qoueeeQM", box: [963, 717, 100, 98], width: 120 },
}

function PageMascot({ mode }: { mode: string }) {
    const preset = PAGE_MASCOTS[mode]
    if (!preset) return null
    const [x, y, w, h] = preset.box
    const displayW = preset.width
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
                zIndex: 50,
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
                    backgroundImage: `url(${IMG}${preset.hash}.png)`,
                    backgroundSize: "100% 100%",
                    backgroundRepeat: "no-repeat",
                }}
            />
        </div>
    )
}

const GRAIN =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.9'/%3E%3C/svg%3E\")"

interface Experience {
    role: string
    place: string
    year: string
}
interface Client {
    name: string
}
interface Social {
    label: string
    url: string
}
interface GalleryItem {
    title: string
    tag: string
    blurb: string
}

interface SitePageProps {
    mode: "about" | "clients" | "contact" | "gallery"
    name: string
    accent: string
    aboutBody: string
    experience: Experience[]
    interests: string
    clients: Client[]
    email: string
    bookingUrl: string
    socials: Social[]
    galleryItems: GalleryItem[]
    style?: CSSProperties
}

/**
 * Site Page — shared B&W Y2K chrome (nav + footer) with a mode-driven body
 * for About, Clients, Contact, and the interactive Gallery.
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function SiteRoutes(props: SitePageProps) {
    const {
        mode = "about",
        name = "NABIA SHAIKH",
        accent = "#0F27FF",
        aboutBody = defaultAbout,
        experience = defaultExperience,
        interests = defaultInterests,
        clients = defaultClients,
        email = "studio@nabiashaikh.com",
        bookingUrl = "https://calendly.com/",
        socials = defaultSocials,
        galleryItems = defaultGallery,
    } = props

    const title = mode.toUpperCase()

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                minHeight: "100vh",
                background: BG,
                color: INK,
                fontFamily: MONO,
                overflow: "hidden",
                ...props.style,
            }}
        >
            <link
                href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Mono:wght@400;700&family=Silkscreen:wght@400;700&display=swap"
                rel="stylesheet"
            />

            <Nav accent={accent} name={name} active={mode} />

            {/* Page title band */}
            <div
                style={{
                    padding: "40px 32px 8px",
                    display: "flex",
                    alignItems: "baseline",
                    gap: 16,
                    flexWrap: "wrap",
                }}
            >
                <h1
                    style={{
                        margin: 0,
                        fontFamily: DISPLAY,
                        fontSize: "clamp(48px, 10vw, 120px)",
                        lineHeight: 0.9,
                        letterSpacing: -3,
                    }}
                >
                    {title}
                </h1>
                <span style={{ fontFamily: PIXEL, fontSize: 14, color: accent }}>
                    ▚ {String(sectionIndex(mode)).padStart(2, "0")} / 04
                </span>
            </div>
            <div style={{ height: 12, background: accent, margin: "8px 32px 0" }} />

            <div style={{ padding: "36px 32px 90px" }}>
                {mode === "about" && (
                    <About
                        body={aboutBody}
                        experience={experience}
                        interests={interests}
                        accent={accent}
                    />
                )}
                {mode === "clients" && (
                    <Clients clients={clients} accent={accent} />
                )}
                {mode === "contact" && (
                    <Contact
                        email={email}
                        bookingUrl={bookingUrl}
                        socials={socials}
                        accent={accent}
                    />
                )}
                {mode === "gallery" && (
                    <Gallery items={galleryItems} accent={accent} />
                )}
            </div>

            <Footer accent={accent} />

            <PageMascot mode={mode} />

            <Overlays />
        </div>
    )
}

function sectionIndex(mode: string) {
    return { about: 1, gallery: 2, clients: 3, contact: 4 }[mode] ?? 1
}

function Nav({
    accent,
    name,
    active,
}: {
    accent: string
    name: string
    active: string
}) {
    const links = [
        { label: "ABOUT", href: "/about" },
        { label: "GALLERY", href: "/gallery" },
        { label: "CLIENTS", href: "/clients" },
        { label: "CONTACT", href: "/contact" },
    ]
    return (
        <nav
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 32px",
                borderBottom: `2px solid ${INK}`,
                flexWrap: "wrap",
                gap: 12,
            }}
        >
            <a
                href="/"
                style={{
                    fontFamily: DISPLAY,
                    fontSize: 20,
                    color: INK,
                    textDecoration: "none",
                    letterSpacing: -1,
                }}
            >
                {name} <span style={{ fontFamily: PIXEL, fontSize: 12 }}>[HOME]</span>
            </a>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {links.map((l) => {
                    const on = active === l.label.toLowerCase()
                    return (
                        <a
                            key={l.href}
                            href={l.href}
                            style={{
                                fontFamily: PIXEL,
                                fontSize: 13,
                                textDecoration: "none",
                                padding: "5px 9px",
                                background: on ? accent : INK,
                                color: "#fff",
                            }}
                        >
                            [{l.label}]
                        </a>
                    )
                })}
            </div>
        </nav>
    )
}

function Footer({ accent }: { accent: string }) {
    return (
        <div
            style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "space-between",
                padding: "14px 32px",
                borderTop: `2px solid ${INK}`,
                fontFamily: MONO,
                fontSize: 12,
                background: BG,
            }}
        >
            <span>© NABIA SHAIKH 2026</span>
            <span style={{ color: accent }}>▚ MADE IN NEW YORK</span>
        </div>
    )
}

// ---- ABOUT ----
function About({
    body,
    experience,
    interests,
    accent,
}: {
    body: string
    experience: Experience[]
    interests: string
    accent: string
}) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "minmax(280px, 1.4fr) minmax(240px, 1fr)",
                gap: 40,
                maxWidth: 1100,
            }}
        >
            <div>
                <p
                    style={{
                        margin: 0,
                        fontSize: 20,
                        lineHeight: 1.5,
                        fontFamily:
                            "Inter, system-ui, sans-serif",
                        maxWidth: 560,
                    }}
                >
                    {body}
                </p>
                <Label accent={accent} style={{ marginTop: 34 }}>
                    // INTERESTS
                </Label>
                <p
                    style={{
                        fontFamily: "Inter, system-ui, sans-serif",
                        fontSize: 16,
                        lineHeight: 1.6,
                        maxWidth: 520,
                    }}
                >
                    {interests}
                </p>
            </div>
            <div>
                <Label accent={accent}>// EXPERIENCE</Label>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    {experience.map((e, i) => (
                        <div
                            key={i}
                            style={{
                                borderTop: `1px solid ${INK}`,
                                padding: "12px 0",
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 12,
                            }}
                        >
                            <div>
                                <div style={{ fontFamily: DISPLAY, fontSize: 16 }}>
                                    {e.role}
                                </div>
                                <div style={{ fontSize: 12, opacity: 0.75 }}>
                                    {e.place}
                                </div>
                            </div>
                            <span style={{ fontSize: 12, color: accent }}>
                                {e.year}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ---- CLIENTS ----
function Clients({
    clients,
    accent,
}: {
    clients: Client[]
    accent: string
}) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                borderTop: `2px solid ${INK}`,
                borderLeft: `2px solid ${INK}`,
                maxWidth: 1100,
            }}
        >
            {clients.map((c, i) => (
                <ClientCell key={i} name={c.name} accent={accent} />
            ))}
        </div>
    )
}
function ClientCell({ name, accent }: { name: string; accent: string }) {
    const [h, setH] = useState(false)
    return (
        <div
            onMouseEnter={() => setH(true)}
            onMouseLeave={() => setH(false)}
            style={{
                borderRight: `2px solid ${INK}`,
                borderBottom: `2px solid ${INK}`,
                padding: "26px 18px",
                fontFamily: DISPLAY,
                fontSize: 22,
                background: h ? INK : "transparent",
                color: h ? accent : INK,
                transition: "background 0.06s, color 0.06s",
                minHeight: 90,
                display: "flex",
                alignItems: "center",
            }}
        >
            {name}
        </div>
    )
}

// ---- CONTACT ----
function Contact({
    email,
    bookingUrl,
    socials,
    accent,
}: {
    email: string
    bookingUrl: string
    socials: Social[]
    accent: string
}) {
    return (
        <div style={{ maxWidth: 820 }}>
            <p
                style={{
                    fontFamily: "Inter, system-ui, sans-serif",
                    fontSize: 20,
                    lineHeight: 1.5,
                    maxWidth: 560,
                }}
            >
                Got a project, a collab, or just want to talk shop? Pick whichever
                is easiest.
            </p>
            <a
                href={`mailto:${email}`}
                style={{
                    display: "inline-block",
                    fontFamily: DISPLAY,
                    fontSize: "clamp(28px, 6vw, 56px)",
                    color: INK,
                    textDecoration: "none",
                    borderBottom: `6px solid ${accent}`,
                    margin: "16px 0 34px",
                    wordBreak: "break-word",
                }}
            >
                {email}
            </a>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                        fontFamily: PIXEL,
                        fontSize: 14,
                        padding: "12px 18px",
                        background: accent,
                        color: "#fff",
                        textDecoration: "none",
                    }}
                >
                    [BOOK A CALL]
                </a>
                {socials.map((s) => (
                    <a
                        key={s.label}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            fontFamily: PIXEL,
                            fontSize: 14,
                            padding: "12px 18px",
                            background: INK,
                            color: "#fff",
                            textDecoration: "none",
                        }}
                    >
                        [{s.label}]
                    </a>
                ))}
            </div>
        </div>
    )
}

// ---- GALLERY ----
function Gallery({
    items,
    accent,
}: {
    items: GalleryItem[]
    accent: string
}) {
    const [open, setOpen] = useState<number | null>(null)
    return (
        <>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fill, minmax(230px, 1fr))",
                    gap: 16,
                    maxWidth: 1100,
                }}
            >
                {items.map((it, i) => (
                    <GalleryTile
                        key={i}
                        item={it}
                        index={i}
                        accent={accent}
                        onClick={() => setOpen(i)}
                    />
                ))}
            </div>
            <AnimatePresence>
                {open !== null && (
                    <Popup item={items[open]} accent={accent} onClose={() => setOpen(null)} />
                )}
            </AnimatePresence>
        </>
    )
}

function GalleryTile({
    item,
    index,
    accent,
    onClick,
}: {
    item: GalleryItem
    index: number
    accent: string
    onClick: () => void
}) {
    const [h, setH] = useState(false)
    return (
        <button
            type="button"
            onClick={onClick}
            onMouseEnter={() => setH(true)}
            onMouseLeave={() => setH(false)}
            aria-label={`Open ${item.title}`}
            style={{
                position: "relative",
                aspectRatio: "1 / 1",
                border: `2px solid ${INK}`,
                padding: 0,
                cursor: "pointer",
                overflow: "hidden",
                background: INK,
            }}
        >
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: h
                        ? "radial-gradient(#fff 34%, transparent 35%) 0 0/7px 7px"
                        : "radial-gradient(#fff 26%, transparent 27%) 0 0/11px 11px",
                    transform: h ? "scale(1.08)" : "scale(1)",
                    transition: "transform 0.18s, background 0.12s",
                }}
            />
            <span
                style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    fontFamily: PIXEL,
                    fontSize: 11,
                    background: accent,
                    color: "#fff",
                    padding: "2px 6px",
                }}
            >
                {String(index + 1).padStart(2, "0")}
            </span>
            <AnimatePresence>
                {h && (
                    <motion.span
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: "absolute",
                            left: 8,
                            bottom: 8,
                            right: 8,
                            fontFamily: DISPLAY,
                            fontSize: 18,
                            color: "#fff",
                            textAlign: "left",
                        }}
                    >
                        {item.title}
                    </motion.span>
                )}
            </AnimatePresence>
        </button>
    )
}

function Popup({
    item,
    accent,
    onClose,
}: {
    item: GalleryItem
    accent: string
    onClose: () => void
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                background: "rgba(10,10,10,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
            }}
        >
            <motion.div
                initial={{ scale: 0.9, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: BG,
                    border: `3px solid ${INK}`,
                    boxShadow: `12px 12px 0 ${accent}`,
                    width: "min(520px, 92vw)",
                    padding: 26,
                    position: "relative",
                }}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        fontFamily: PIXEL,
                        fontSize: 13,
                        background: INK,
                        color: "#fff",
                        border: "none",
                        padding: "5px 9px",
                        cursor: "pointer",
                    }}
                >
                    X CLOSE
                </button>
                <div style={{ fontFamily: PIXEL, fontSize: 12, color: accent }}>
                    {item.tag}
                </div>
                <h3
                    style={{
                        fontFamily: DISPLAY,
                        fontSize: 34,
                        margin: "6px 0 12px",
                    }}
                >
                    {item.title}
                </h3>
                <p
                    style={{
                        fontFamily: "Inter, system-ui, sans-serif",
                        fontSize: 15,
                        lineHeight: 1.55,
                        margin: 0,
                    }}
                >
                    {item.blurb}
                </p>
            </motion.div>
        </motion.div>
    )
}

function Label({
    children,
    accent,
    style,
}: {
    children: ReactNode
    accent: string
    style?: CSSProperties
}) {
    return (
        <div
            style={{
                fontFamily: MONO,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 2,
                color: INK,
                borderLeft: `4px solid ${accent}`,
                paddingLeft: 8,
                marginBottom: 14,
                ...style,
            }}
        >
            {children}
        </div>
    )
}

function Overlays() {
    return (
        <>
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    backgroundImage:
                        "repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0 1px, transparent 1px 3px)",
                    mixBlendMode: "multiply",
                    zIndex: 40,
                }}
            />
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    backgroundImage: GRAIN,
                    backgroundSize: "120px 120px",
                    opacity: 0.1,
                    mixBlendMode: "multiply",
                    zIndex: 41,
                }}
            />
        </>
    )
}

const defaultAbout =
    "Hi, I'm Nabia — an independent graphic designer and content creator based in New York. I work with wellness and lifestyle brands on identity, campaigns, social, print, and web, bringing together digital marketing know-how, real taste, and design that holds up."
const defaultInterests =
    "Print ephemera, Y2K web nostalgia, film photography, city walks, and anything with a good grid."
const defaultExperience: Experience[] = [
    { role: "Independent Designer", place: "Self / freelance", year: "2022—" },
    { role: "Content Creator", place: "Instagram · TikTok · YouTube", year: "2020—" },
    { role: "Design Studio", place: "In-house, NYC", year: "2019—22" },
]
const defaultClients: Client[] = [
    { name: "WELLNESS CO." },
    { name: "STUDIO NORTH" },
    { name: "BODEGA" },
    { name: "LOVERS' CLUB" },
    { name: "HEAT™" },
    { name: "GOODS" },
    { name: "ATELIER 9" },
    { name: "PRESS PLAY" },
]
const defaultSocials: Social[] = [
    { label: "INSTAGRAM", url: "https://instagram.com/" },
    { label: "TIKTOK", url: "https://tiktok.com/" },
    { label: "YOUTUBE", url: "https://youtube.com/" },
]
const defaultGallery: GalleryItem[] = [
    { title: "Poster Series", tag: "PRINT", blurb: "A run of risograph posters for a local music night — bold type, halftone, one ink." },
    { title: "Social Kit", tag: "SOCIAL", blurb: "Reusable templates and motion stickers for a wellness brand's launch week." },
    { title: "Zine No.3", tag: "EDITORIAL", blurb: "A 24-page cut-and-paste zine about city mornings. Photocopied, hand-bound." },
    { title: "Type Study", tag: "LETTERING", blurb: "Chrome + blackletter lettering experiments, later reused across campaign art." },
    { title: "Packaging", tag: "3D / PRINT", blurb: "Minimal mono packaging with a single spot color and a lot of negative space." },
    { title: "Sticker Pack", tag: "MERCH", blurb: "Die-cut sticker set — the fun, low-stakes side of the practice." },
]

addPropertyControls(SiteRoutes, {
    mode: {
        type: ControlType.Enum,
        title: "Page",
        options: ["about", "clients", "contact", "gallery"],
        optionTitles: ["About", "Clients", "Contact", "Gallery"],
        defaultValue: "about",
    },
    name: { type: ControlType.String, title: "Name", defaultValue: "NABIA SHAIKH" },
    accent: { type: ControlType.Color, title: "Accent", defaultValue: "#0F27FF" },
    aboutBody: {
        type: ControlType.String,
        title: "About Body",
        defaultValue: defaultAbout,
        displayTextArea: true,
        hidden: (p: Partial<SitePageProps>) => p.mode !== "about",
    },
    interests: {
        type: ControlType.String,
        title: "Interests",
        defaultValue: defaultInterests,
        displayTextArea: true,
        hidden: (p: Partial<SitePageProps>) => p.mode !== "about",
    },
    experience: {
        type: ControlType.Array,
        title: "Experience",
        control: {
            type: ControlType.Object,
            controls: {
                role: { type: ControlType.String, defaultValue: "Role" },
                place: { type: ControlType.String, defaultValue: "Place" },
                year: { type: ControlType.String, defaultValue: "2024" },
            },
        },
        defaultValue: defaultExperience,
        hidden: (p: Partial<SitePageProps>) => p.mode !== "about",
    },
    clients: {
        type: ControlType.Array,
        title: "Clients",
        control: {
            type: ControlType.Object,
            controls: { name: { type: ControlType.String, defaultValue: "CLIENT" } },
        },
        defaultValue: defaultClients,
        hidden: (p: Partial<SitePageProps>) => p.mode !== "clients",
    },
    email: {
        type: ControlType.String,
        title: "Email",
        defaultValue: "studio@nabiashaikh.com",
        hidden: (p: Partial<SitePageProps>) => p.mode !== "contact",
    },
    bookingUrl: {
        type: ControlType.Link,
        title: "Booking URL",
        hidden: (p: Partial<SitePageProps>) => p.mode !== "contact",
    },
    socials: {
        type: ControlType.Array,
        title: "Socials",
        control: {
            type: ControlType.Object,
            controls: {
                label: { type: ControlType.String, defaultValue: "LINK" },
                url: { type: ControlType.Link },
            },
        },
        defaultValue: defaultSocials,
        hidden: (p: Partial<SitePageProps>) => p.mode !== "contact",
    },
    galleryItems: {
        type: ControlType.Array,
        title: "Gallery",
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String, defaultValue: "Project" },
                tag: { type: ControlType.String, defaultValue: "PRINT" },
                blurb: {
                    type: ControlType.String,
                    defaultValue: "",
                    displayTextArea: true,
                },
            },
        },
        defaultValue: defaultGallery,
        hidden: (p: Partial<SitePageProps>) => p.mode !== "gallery",
    },
})
