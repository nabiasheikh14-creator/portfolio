import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type ReactNode,
} from "react"
import {
    addPropertyControls,
    ControlType,
    RenderTarget,
    useIsStaticRenderer,
} from "framer"

const SANS =
    '"Inter Display", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
const DEFAULT_ANNIE = '"Annie Use Your Telescope", "Bradley Hand", cursive'
const GRID_BG =
    "https://framerusercontent.com/images/uTiMeYZo7Cgq17Mt2w60JYMnptc.png"
const CREAM = "#F3EFE6"
const INK = "#111111"
const MUTED = "#555555"
const PHONE_MQ = "(max-width: 809.98px)"
const BOX_RADIUS = 28

interface WorkItem {
    title: string
    subtitle: string
    slug: string
    year: string
    accent: string
    coverUrl?: string
    videoUrl?: string
    /** Optional full link override for this card (set in properties). */
    href?: string
}

interface WorkIndexProps {
    intro: string
    items: WorkItem[]
    accent: string
    cream: string
    ink: string
    muted: string
    gridOpacity: number
    titleSize: number
    font?: { fontFamily?: string }
    displayFont?: { fontFamily?: string }
    /** Editable Back pill destination. */
    backLink: string
    /** Prefix used when a project card has no custom Link — e.g. `/work`. */
    projectBasePath: string
    footerSubline: string
    footerHomeLink: string
    footerDeskScale: number
    footerHeight: number
    footerHeadlineSize: number
    footerInstagramUrl: string
    footerLinkedinUrl: string
    footerEmail: string
    style?: CSSProperties
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

/**
 * Work Index — four lightweight video frames tumble in with soft gravity,
 * bounce off each other, then float. Hover reveals the name; click opens the case.
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 900
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any
 */
export default function WorkIndex(props: WorkIndexProps) {
    const {
        items = DEFAULT_ITEMS,
        accent = "#2C6BE0",
        cream = CREAM,
        ink = INK,
        muted = MUTED,
        gridOpacity = 0.1,
        titleSize = 96,
        backLink = "/",
        projectBasePath = "/work",
        footerSubline = DEFAULT_FOOTER_SUBLINE,
        footerHomeLink = "/",
        footerDeskScale = 1,
        footerHeight = 280,
        footerHeadlineSize = 36,
        footerInstagramUrl = "https://instagram.com/",
        footerLinkedinUrl = "https://linkedin.com/",
        footerEmail = "hello@example.com",
    } = props
    const family = props.font?.fontFamily || SANS
    const displayFamily = props.displayFont?.fontFamily || DEFAULT_ANNIE
    const isStatic = useIsStaticRenderer()
    const gridAlpha = Math.min(0.14, Math.max(0.04, Number(gridOpacity) || 0.1))
    const [isPhone, setIsPhone] = useState(false)
    const backHref = resolveLink(backLink, "/")
    const homeHref = resolveLink(footerHomeLink, "/")
    const basePath =
        resolveLink(projectBasePath, "/work").replace(/\/$/, "") || "/work"
    const igHref = resolveLink(footerInstagramUrl, "https://instagram.com/")
    const liHref = resolveLink(footerLinkedinUrl, "https://linkedin.com/")

    useEffect(() => {
        if (typeof window === "undefined") return
        const mq = window.matchMedia(PHONE_MQ)
        const sync = () => setIsPhone(mq.matches)
        sync()
        mq.addEventListener?.("change", sync)
        window.addEventListener("resize", sync)
        return () => {
            mq.removeEventListener?.("change", sync)
            window.removeEventListener("resize", sync)
        }
    }, [])

    const list = useMemo(() => {
        const normalized = (items || [])
            .map((it: any, index: number) => {
                const slug =
                    String(it?.slug || "").replace(/^\//, "") || "project"
                const custom = resolveLink(it?.href || it?.link, "")
                const fallbackVideo =
                    DEFAULT_ITEMS[index % DEFAULT_ITEMS.length]?.videoUrl || ""
                return {
                    title: String(it?.title || "Untitled"),
                    subtitle: String(it?.subtitle || ""),
                    slug,
                    year: String(it?.year || ""),
                    accent: String(it?.accent || accent),
                    coverUrl: it?.coverUrl ? String(it.coverUrl) : "",
                    videoUrl: it?.videoUrl
                        ? String(it.videoUrl)
                        : fallbackVideo,
                    href: custom || `${basePath}/${slug}`,
                } satisfies WorkItem
            })
            .filter((it) => it.title)
        const base = normalized.length
            ? normalized
            : DEFAULT_ITEMS.map((it) => ({
                  ...it,
                  href: `${basePath}/${it.slug}`,
              }))
        return base.slice(0, 4)
    }, [items, accent, basePath])

    if (RenderTarget.current() === RenderTarget.thumbnail) {
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    background: CREAM,
                    padding: 16,
                    fontFamily: SANS,
                    color: INK,
                }}
            >
                <div style={{ fontSize: 28, fontWeight: 600 }}>work</div>
            </div>
        )
    }

    // Framer may pass a collapsed width/height via props.style — never let that win.
    const framerStyle = { ...(props.style || {}) } as CSSProperties
    delete framerStyle.width
    delete framerStyle.height
    delete framerStyle.minWidth
    delete framerStyle.minHeight
    delete framerStyle.maxWidth
    delete framerStyle.maxHeight

    return (
        <div
            style={{
                ...framerStyle,
                position: "relative",
                width: "100%",
                minWidth: 0,
                maxWidth: "100%",
                height: "auto",
                minHeight: isStatic ? "100%" : "100vh",
                background: cream,
                color: ink,
                fontFamily: family,
                boxSizing: "border-box",
                overflow: "visible",
            }}
        >
            <link
                href="https://fonts.googleapis.com/css2?family=Annie+Use+Your+Telescope&family=Inter:wght@400;500;600;700&display=swap"
                rel="stylesheet"
            />

            <DeskBack
                href={backHref}
                label="Back"
                ariaLabel="Back to home"
                accent={accent}
            />

            <div
                aria-hidden
                style={{
                    position: "fixed",
                    inset: 0,
                    backgroundImage: `url(${GRID_BG})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: gridAlpha,
                    pointerEvents: "none",
                    filter: "grayscale(1)",
                    zIndex: 0,
                }}
            />

            <section
                style={{
                    position: "relative",
                    zIndex: 1,
                    width: "100%",
                    minHeight: isPhone ? "100svh" : "100vh",
                    height: isPhone ? "100svh" : "100vh",
                    boxSizing: "border-box",
                }}
            >
                <h1
                    aria-hidden
                    style={{
                        position: "absolute",
                        left: isPhone ? 18 : 40,
                        bottom: isPhone ? 18 : 28,
                        margin: 0,
                        fontFamily: displayFamily,
                        fontSize: `clamp(${Math.round(titleSize * 0.42)}px, 7vw, ${titleSize}px)`,
                        fontWeight: 400,
                        letterSpacing: "-0.03em",
                        lineHeight: 0.9,
                        textTransform: "lowercase",
                        color: ink,
                        opacity: 0.12,
                        pointerEvents: "none",
                        zIndex: 0,
                        userSelect: "none",
                    }}
                >
                    work
                </h1>

                <FallingProjectStage
                    items={list}
                    displayFamily={displayFamily}
                    isPhone={isPhone}
                    isStatic={isStatic}
                />
            </section>

            <DeskWorkFooter
                accent={accent}
                cream={cream}
                ink={ink}
                muted={muted}
                subline={footerSubline}
                homeHref={homeHref}
                deskScale={footerDeskScale}
                railHeight={footerHeight}
                headlineSize={footerHeadlineSize}
                instagramUrl={igHref}
                linkedinUrl={liHref}
                email={footerEmail}
                font={props.font}
            />
        </div>
    )
}

type SimBody = {
    key: string
    item: WorkItem
    x: number
    y: number
    w: number
    h: number
    vx: number
    vy: number
    rot: number
    vr: number
    phase: number
    baseX: number
    baseY: number
    baseRot: number
}

function FallingProjectStage({
    items,
    displayFamily,
    isPhone,
    isStatic,
}: {
    items: WorkItem[]
    displayFamily: string
    isPhone: boolean
    isStatic: boolean
}) {
    const stageRef = useRef<HTMLDivElement>(null)
    const bodiesRef = useRef<SimBody[]>([])
    const rafRef = useRef(0)
    const startedRef = useRef(false)
    const settledRef = useRef(false)
    const floatTRef = useRef(0)
    const reduceMotionRef = useRef(false)
    const [, setTick] = useState(0)
    const [hovered, setHovered] = useState<string | null>(null)
    const [ready, setReady] = useState(false)

    const bump = () => setTick((n) => (n + 1) % 1_000_000)

    const measureAndSpawn = () => {
        const el = stageRef.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const W = Math.max(320, rect.width)
        const H = Math.max(480, rect.height)
        const pad = isPhone ? 14 : 28
        const floor = H - pad
        const boxW = isPhone
            ? Math.min(168, (W - pad * 3) / 2)
            : Math.min(340, Math.max(240, W * 0.24))
        const boxH = boxW * (isPhone ? 1.15 : 0.72)

        const slots = isPhone
            ? [
                  { x: pad, y: floor - boxH * 2.15 },
                  { x: W - pad - boxW, y: floor - boxH * 2.05 },
                  { x: pad + 8, y: floor - boxH - 8 },
                  { x: W - pad - boxW - 6, y: floor - boxH },
              ]
            : [
                  { x: W * 0.08, y: floor - boxH - H * 0.08 },
                  { x: W * 0.38, y: floor - boxH - H * 0.22 },
                  { x: W * 0.18, y: floor - boxH - H * 0.02 },
                  { x: W * 0.55, y: floor - boxH - H * 0.12 },
              ]

        const preferStatic = isStatic || reduceMotionRef.current
        bodiesRef.current = items.map((item, i) => {
            const slot = slots[i] || slots[0]
            const rot = preferStatic ? [-5, 4, 6, -3][i] || 0 : (Math.random() - 0.5) * 28
            const x = preferStatic
                ? slot.x
                : pad + Math.random() * Math.max(8, W - boxW - pad * 2)
            const y = preferStatic
                ? slot.y
                : -boxH - 40 - i * (boxH * 0.55 + 36)
            return {
                key: item.slug || `p-${i}`,
                item,
                w: boxW,
                h: boxH,
                x,
                y,
                vx: preferStatic ? 0 : (Math.random() - 0.5) * 120,
                vy: preferStatic ? 0 : Math.random() * 40,
                rot,
                vr: preferStatic ? 0 : (Math.random() - 0.5) * 80,
                phase: i * 1.3,
                baseX: x,
                baseY: y,
                baseRot: rot,
            }
        })
        settledRef.current = preferStatic
        startedRef.current = true
        setReady(true)
        bump()
    }

    useEffect(() => {
        if (typeof window === "undefined") return
        reduceMotionRef.current = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches
        measureAndSpawn()

        const el = stageRef.current
        if (!el) return
        const ro = new ResizeObserver(() => {
            // Keep sizes fresh but don't re-drop mid-flight unless empty
            if (!bodiesRef.current.length) measureAndSpawn()
        })
        ro.observe(el)
        return () => ro.disconnect()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, isPhone, isStatic])

    useEffect(() => {
        if (!ready || isStatic || reduceMotionRef.current) return

        let last = performance.now()
        const GRAVITY = 1650
        const BOUNCE = 0.42
        const FRICTION = 0.78
        const AIR = 0.994
        const SPIN_DAMP = 0.985
        const REST_V = 28

        const step = (now: number) => {
            const dt = Math.min(0.032, (now - last) / 1000)
            last = now
            const el = stageRef.current
            if (!el) {
                rafRef.current = requestAnimationFrame(step)
                return
            }
            const W = el.clientWidth
            const H = el.clientHeight
            const pad = isPhone ? 12 : 22
            const bodies = bodiesRef.current

            if (!settledRef.current) {
                let allResting = true
                for (const b of bodies) {
                    b.vy += GRAVITY * dt
                    b.vx *= AIR
                    b.vy *= AIR
                    b.vr *= SPIN_DAMP
                    b.x += b.vx * dt
                    b.y += b.vy * dt
                    b.rot += b.vr * dt

                    if (b.x < pad) {
                        b.x = pad
                        b.vx = Math.abs(b.vx) * BOUNCE
                        b.vr *= -0.6
                    } else if (b.x + b.w > W - pad) {
                        b.x = W - pad - b.w
                        b.vx = -Math.abs(b.vx) * BOUNCE
                        b.vr *= -0.6
                    }

                    const floor = H - pad
                    if (b.y + b.h > floor) {
                        b.y = floor - b.h
                        if (Math.abs(b.vy) > REST_V) {
                            b.vy = -Math.abs(b.vy) * BOUNCE
                            b.vx *= FRICTION
                            b.vr *= -0.55
                            allResting = false
                        } else {
                            b.vy = 0
                            b.vx *= 0.9
                            b.vr *= 0.9
                        }
                    } else {
                        allResting = false
                    }

                    if (Math.hypot(b.vx, b.vy) > REST_V || b.y + b.h < floor - 2) {
                        allResting = false
                    }
                }

                // Soft circle-ish AABB collisions — light boxes bounce off each other
                for (let i = 0; i < bodies.length; i++) {
                    for (let j = i + 1; j < bodies.length; j++) {
                        const a = bodies[i]
                        const b = bodies[j]
                        const ax = a.x + a.w / 2
                        const ay = a.y + a.h / 2
                        const bx = b.x + b.w / 2
                        const by = b.y + b.h / 2
                        const dx = bx - ax
                        const dy = by - ay
                        const gapX = (a.w + b.w) * 0.5 - 8
                        const gapY = (a.h + b.h) * 0.5 - 8
                        if (Math.abs(dx) < gapX && Math.abs(dy) < gapY) {
                            const overlapX = gapX - Math.abs(dx)
                            const overlapY = gapY - Math.abs(dy)
                            if (overlapX < overlapY) {
                                const push = (overlapX / 2) * (dx < 0 ? -1 : 1)
                                a.x -= push
                                b.x += push
                                const avx = a.vx
                                a.vx = b.vx * BOUNCE
                                b.vx = avx * BOUNCE
                                a.vr += (Math.random() - 0.5) * 20
                                b.vr += (Math.random() - 0.5) * 20
                            } else {
                                const push = (overlapY / 2) * (dy < 0 ? -1 : 1)
                                a.y -= push
                                b.y += push
                                const avy = a.vy
                                a.vy = b.vy * BOUNCE
                                b.vy = avy * BOUNCE
                            }
                            allResting = false
                        }
                    }
                }

                if (allResting) {
                    for (const b of bodies) {
                        b.baseX = b.x
                        b.baseY = b.y
                        b.baseRot = b.rot
                        b.vx = 0
                        b.vy = 0
                        b.vr = 0
                    }
                    settledRef.current = true
                    floatTRef.current = 0
                }
            } else {
                // Lightweight idle float once gravity settles
                floatTRef.current += dt
                const t = floatTRef.current
                for (const b of bodies) {
                    b.x = b.baseX + Math.cos(t * 0.85 + b.phase) * 2.6
                    b.y = b.baseY + Math.sin(t * 1.15 + b.phase) * 3.4
                    b.rot = b.baseRot + Math.sin(t * 0.95 + b.phase * 0.7) * 1.5
                }
            }

            bump()
            rafRef.current = requestAnimationFrame(step)
        }

        rafRef.current = requestAnimationFrame(step)
        return () => cancelAnimationFrame(rafRef.current)
    }, [ready, isStatic, isPhone])

    const bodies = bodiesRef.current

    return (
        <div
            ref={stageRef}
            style={{
                position: "absolute",
                inset: 0,
                overflow: "hidden",
                zIndex: 1,
            }}
        >
            {bodies.map((b) => (
                <ProjectFrame
                    key={b.key}
                    item={b.item}
                    x={b.x}
                    y={b.y}
                    w={b.w}
                    h={b.h}
                    rot={b.rot}
                    displayFamily={displayFamily}
                    hovered={hovered === b.key}
                    onHover={(on) => setHovered(on ? b.key : null)}
                />
            ))}
        </div>
    )
}

function ProjectFrame({
    item,
    x,
    y,
    w,
    h,
    rot,
    displayFamily,
    hovered,
    onHover,
}: {
    item: WorkItem
    x: number
    y: number
    w: number
    h: number
    rot: number
    displayFamily: string
    hovered: boolean
    onHover: (on: boolean) => void
}) {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        const v = videoRef.current
        if (!v) return
        v.muted = true
        const play = v.play()
        if (play && typeof play.catch === "function") play.catch(() => {})
    }, [item.videoUrl])

    return (
        <a
            href={item.href || `/work/${item.slug}`}
            aria-label={`${item.title}${item.subtitle ? ` — ${item.subtitle}` : ""}`}
            onMouseEnter={() => onHover(true)}
            onMouseLeave={() => onHover(false)}
            onFocus={() => onHover(true)}
            onBlur={() => onHover(false)}
            style={{
                position: "absolute",
                left: x,
                top: y,
                width: w,
                height: h,
                transform: `rotate(${rot}deg)`,
                transformOrigin: "center center",
                borderRadius: BOX_RADIUS,
                overflow: "hidden",
                textDecoration: "none",
                color: "#fff",
                background: item.accent || "#222",
                boxShadow: hovered
                    ? "0 18px 40px rgba(17,17,17,0.18), 0 4px 12px rgba(17,17,17,0.08)"
                    : "0 14px 34px rgba(17,17,17,0.12), 0 2px 8px rgba(17,17,17,0.06)",
                cursor: "pointer",
                display: "block",
                willChange: "transform, left, top",
                outline: "none",
                transition: "box-shadow 220ms ease",
            }}
        >
            {item.videoUrl ? (
                <video
                    ref={videoRef}
                    src={item.videoUrl}
                    poster={item.coverUrl || undefined}
                    muted
                    loop
                    playsInline
                    autoPlay
                    preload="metadata"
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                    }}
                />
            ) : item.coverUrl ? (
                <img
                    src={item.coverUrl}
                    alt=""
                    draggable={false}
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                    }}
                />
            ) : (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: `linear-gradient(145deg, ${item.accent} 0%, #1a1a1a 125%)`,
                    }}
                />
            )}

            <div
                aria-hidden
                style={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "linear-gradient(180deg, rgba(17,17,17,0.05) 0%, rgba(17,17,17,0.45) 100%)",
                    opacity: hovered ? 1 : 0.35,
                    transition: "opacity 220ms ease",
                    pointerEvents: "none",
                }}
            />

            <div
                style={{
                    position: "absolute",
                    left: 18,
                    right: 18,
                    bottom: 18,
                    opacity: hovered ? 1 : 0,
                    transform: hovered ? "translateY(0)" : "translateY(10px)",
                    transition: "opacity 220ms ease, transform 220ms ease",
                    pointerEvents: "none",
                }}
            >
                <div
                    style={{
                        fontFamily: displayFamily,
                        fontSize: Math.max(22, Math.min(34, w * 0.11)),
                        fontWeight: 400,
                        letterSpacing: "-0.02em",
                        lineHeight: 1.05,
                        color: "#fff",
                        textShadow: "0 1px 12px rgba(0,0,0,0.35)",
                    }}
                >
                    {item.title}
                </div>
                {item.subtitle ? (
                    <div
                        style={{
                            marginTop: 4,
                            fontFamily: SANS,
                            fontSize: 13,
                            fontWeight: 500,
                            letterSpacing: "-0.01em",
                            color: "rgba(255,255,255,0.88)",
                        }}
                    >
                        {item.subtitle}
                    </div>
                ) : null}
            </div>

            {/* Quiet edge so light boxes read as paper-thin frames */}
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: BOX_RADIUS,
                    boxShadow: `inset 0 0 0 1.5px rgba(255,255,255,0.22)`,
                    pointerEvents: "none",
                }}
            />
        </a>
    )
}

/** Fixed back pill — matches Archive / TopBar chrome. */
function DeskBack({
    href,
    label,
    ariaLabel,
    accent,
}: {
    href: string
    label: string
    ariaLabel?: string
    accent: string
}) {
    useEffect(() => {
        if (typeof document === "undefined") return
        document.querySelectorAll("[data-desk-back]").forEach((n) => n.remove())

        const a = document.createElement("a")
        a.href = href
        a.setAttribute("aria-label", ariaLabel || label)
        a.dataset.deskBack = "true"
        const applyChrome = () => {
            const phone = window.matchMedia(PHONE_MQ).matches
            Object.assign(a.style, {
                position: "fixed",
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
        const text = document.createElement("span")
        text.textContent = label
        a.append(arrow, text)
        document.body.appendChild(a)

        return () => {
            window.removeEventListener("resize", applyChrome)
            a.remove()
        }
    }, [href, label, ariaLabel, accent])

    return null
}

const DEFAULT_INTRO =
    "Selected projects & full case studies — product, brand, and the work in between."

const DEFAULT_ITEMS: WorkItem[] = [
    {
        title: "Fintech App",
        subtitle: "Onboarding redesign",
        slug: "fintech-app",
        year: "2025",
        accent: "#7457C9",
        videoUrl:
            "https://videos.pexels.com/video-files/3129671/3129671-sd_640_360_30fps.mp4",
    },
    {
        title: "Health Platform",
        subtitle: "Design system",
        slug: "health-platform",
        year: "2024",
        accent: "#28A06A",
        videoUrl:
            "https://videos.pexels.com/video-files/3571264/3571264-sd_640_360_30fps.mp4",
    },
    {
        title: "Chutney Studios",
        subtitle: "Brand + site",
        slug: "chutney-studios",
        year: "2025",
        accent: "#D17BB0",
        videoUrl:
            "https://videos.pexels.com/video-files/3045163/3045163-sd_640_360_25fps.mp4",
    },
    {
        title: "Travel App",
        subtitle: "0→1 product",
        slug: "travel-app",
        year: "2023",
        accent: "#E0902F",
        videoUrl:
            "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    },
]

const STAGE_W = 1440
const STAGE_H = 900
const IMG = "https://framerusercontent.com/images/"
const DEFAULT_FOOTER_SUBLINE = "let's go back to the workspace"

/**
 * Interactive zones on the footer desk crop — same stage coords as DeskWorkspace.
 * Popup items deep-link home with ?open= so the desk opens that popup.
 */
const FOOTER_HOTSPOTS: {
    key: string
    box: [number, number, number, number]
    label: string
    href: string
}[] = [
    {
        key: "laptop",
        box: [555, 430, 370, 330],
        label: "Work",
        href: "/work",
    },
    {
        key: "journal",
        box: [241, 717, 167, 126],
        label: "Get to know me",
        href: "/?open=about",
    },
    {
        key: "sticky",
        box: [834, 368, 86, 142],
        label: "Tech stack",
        href: "/?open=techstack",
    },
    {
        key: "notes",
        box: [1056, 691, 113, 88],
        label: "Substack",
        href: "/?open=substack",
    },
    {
        key: "phone",
        box: [963, 717, 100, 98],
        label: "Socials",
        href: "/?open=socials",
    },
    {
        key: "chutney",
        box: [542, 493, 84, 75],
        label: "Chutney Studios",
        href: "/?open=chutney",
    },
    {
        key: "briefcase-calendar",
        box: [355, 435, 170, 170],
        label: "Schedule",
        href: "/?open=schedule",
    },
]

FOOTER_HOTSPOTS.sort((a, b) => b.box[2] * b.box[3] - a.box[2] * a.box[3])

/** Extra layers that should jiggle with a hotspot (matches DeskWorkspace). */
const FOOTER_JIGGLE: Record<string, string[]> = {
    laptop: ["laptop", "work-laptop"],
    "briefcase-calendar": ["briefcase-calendar"],
    sticky: ["sticky"],
    journal: ["journal"],
    notes: ["notes"],
    phone: ["phone"],
    chutney: ["chutney"],
}

const FOOTER_JIGGLE_CSS = `
@keyframes nabia-footer-jiggle {
  0%, 100% { transform: rotate(0deg) scale(1); }
  20% { transform: rotate(-3deg) scale(1.03); }
  40% { transform: rotate(3deg) scale(1.03); }
  60% { transform: rotate(-2deg) scale(1.03); }
  80% { transform: rotate(1deg) scale(1.03); }
}
.nabia-footer-jiggle {
  animation: nabia-footer-jiggle 0.55s ease-in-out infinite;
}
`

function footerOriginFor(key: string): string {
    const h = FOOTER_HOTSPOTS.find((x) => x.key === key)
    if (!h) return "center center"
    const [x, y, w, ht] = h.box
    return `${((x + w / 2) / STAGE_W) * 100}% ${((y + ht / 2) / STAGE_H) * 100}%`
}

function FooterDeskHotspots({
    onHover,
}: {
    onHover: (key: string | null) => void
}) {
    return (
        <>
            {FOOTER_HOTSPOTS.map((h) => {
                const [x, y, w, hgt] = h.box
                return (
                    <a
                        key={h.key}
                        href={h.href}
                        aria-label={h.label}
                        title={h.label}
                        style={{
                            position: "absolute",
                            left: x,
                            top: y,
                            width: w,
                            height: hgt,
                            zIndex: 2,
                            display: "block",
                            cursor: "pointer",
                            background: "transparent",
                            outline: "none",
                            textDecoration: "none",
                        }}
                        onMouseEnter={() => onHover(h.key)}
                        onMouseLeave={() => onHover(null)}
                        onFocus={() => onHover(h.key)}
                        onBlur={() => onHover(null)}
                    />
                )
            })}
        </>
    )
}

const FOOTER_ANNIE = DEFAULT_ANNIE

/**
 * Exact homepage desk layer PNGs — same hashes / full-stage placement as DeskWorkspace.
 */
const HOME_FOOTER_LAYERS: { key: string; hash: string }[] = [
    { key: "desk", hash: "apgMzPB0YpfnsVlEtmJK4vj6V7w" },
    { key: "briefcase-calendar", hash: "NDoJcAe2hm9jNoRn1l3KPiH88kM" },
    { key: "chutney", hash: "AwkrKCuhUkRurlYPAzFRI4yw" },
    { key: "sooraj", hash: "O3MmyItiSJFvHk9GjYSG9NdqSc" },
    { key: "laptop", hash: "ffeeCWEVauyRc2jUztvEkKArptM" },
    { key: "work-laptop", hash: "0MCjhgOZbTIBiUWnZJdrkiXZSoA" },
    { key: "open-notebook", hash: "XJP4OGEVjXt8avb0NauKlPXYEY" },
    { key: "notes", hash: "52nGQQ7gLqDiguh8AvcoksZaBGI" },
    { key: "to-dos", hash: "qrSvY1tFyoVSVjN0zBNJIezPs" },
    { key: "sticky", hash: "Ks4KMbXjOzLJjGMxHdmGi4llY" },
    { key: "sticky-empty-1", hash: "BQDJ4rDXxap6hjzD0KdpsCrF4o" },
    { key: "sticky-empty-2", hash: "ovf3WMo3EmcNAF49KAlKzd4lbt0" },
    { key: "phone", hash: "iokbHxpk1MBj2DyMk1qoueeeQM" },
    { key: "journal", hash: "JPLbpkF1Jd17vRUT1rfmmgPhfQ" },
    { key: "pen", hash: "HUSQF2KWYyoJf9K6yBPPi8er4zY" },
    { key: "tablet", hash: "XaBwWgmK8aSgBbpn75GnNY4hRY" },
    { key: "tea", hash: "fyEQ0Kjs1B3bcThyj0H2oEfaZ8" },
    { key: "water", hash: "0zrrCMhZXsiu2gFjthkfNhc1pA" },
    { key: "pencil-holder", hash: "fBJigHoGaLK2A2qSzKnBjGiGf40" },
]

interface DeskWorkFooterProps {
    accent?: string
    cream?: string
    ink?: string
    muted?: string
    headline?: string
    subline?: string
    homeHref?: string
    instagramUrl?: string
    linkedinUrl?: string
    email?: string
    deskScale?: number
    objectScale?: number
    railHeight?: number
    headlineSize?: number
    bodySize?: number
    font?: { fontFamily?: string }
    bodyFont?: { fontFamily?: string }
    style?: CSSProperties
}

/** Home desk footer — desk art on the right, home link + socials on the left. */
function DeskWorkFooter(props: DeskWorkFooterProps) {
    const {
        accent = "#2C6BE0",
        cream = "#F3EFE6",
        ink = "#111111",
        muted = "#555555",
        subline = DEFAULT_FOOTER_SUBLINE,
        homeHref = "/",
        instagramUrl = "https://instagram.com/",
        linkedinUrl = "https://linkedin.com/",
        email = "hello@example.com",
        deskScale,
        objectScale = 1,
        railHeight = 280,
        headlineSize = 36,
        style,
    } = props
    const family =
        props.font?.fontFamily || props.bodyFont?.fontFamily || SANS
    const scaleMul = Math.max(
        0.7,
        Math.min(1.4, Number(deskScale ?? objectScale) || 1),
    )
    const stageScale = (1200 / STAGE_W) * scaleMul * 1.05
    const viewportH = Math.round(
        Math.max(220, Number(railHeight) || 280) * scaleMul,
    )
    const mailHref = email.includes("mailto:")
        ? email
        : `mailto:${email}`
    const [hovered, setHovered] = useState<string | null>(null)
    const jiggleKeys = hovered
        ? FOOTER_JIGGLE[hovered] || [hovered]
        : []

    return (
        <footer
            style={{
                position: "relative",
                width: "100%",
                marginTop: 64,
                background: cream,
                overflow: "hidden",
                fontFamily: family,
                ...style,
            }}
        >
            <style>{FOOTER_JIGGLE_CSS}</style>
            <link
                href="https://fonts.googleapis.com/css2?family=Annie+Use+Your+Telescope&family=Inter:wght@400;500;600;700&display=swap"
                rel="stylesheet"
            />
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: viewportH,
                    overflow: "hidden",
                    borderTop: `1px solid ${ink}`,
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        right: "-4%",
                        bottom: 0,
                        width: STAGE_W,
                        height: STAGE_H,
                        transform: `scale(${stageScale})`,
                        transformOrigin: "bottom right",
                        pointerEvents: "auto",
                        zIndex: 1,
                    }}
                >
                    {HOME_FOOTER_LAYERS.map((layer) => {
                        const active = jiggleKeys.includes(layer.key)
                        return (
                            <img
                                key={layer.key}
                                src={`${IMG}${layer.hash}.png`}
                                alt=""
                                draggable={false}
                                className={active ? "nabia-footer-jiggle" : undefined}
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "fill",
                                    display: "block",
                                    userSelect: "none",
                                    pointerEvents: "none",
                                    transformOrigin: hovered
                                        ? footerOriginFor(hovered)
                                        : "center center",
                                }}
                            />
                        )
                    })}
                    <FooterDeskHotspots onHover={setHovered} />
                </div>

                <div
                    style={{
                        position: "relative",
                        zIndex: 3,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        gap: 18,
                        maxWidth: 420,
                        padding: "32px 40px",
                        boxSizing: "border-box",
                        pointerEvents: "auto",
                    }}
                >
                    <a
                        href={homeHref || "/"}
                        title="Go back to the workspace"
                        aria-label="Go back to the workspace"
                        style={{
                            fontFamily: FOOTER_ANNIE,
                            fontSize: `clamp(26px, 3.6vw, ${headlineSize}px)`,
                            fontWeight: 400,
                            letterSpacing: "0",
                            lineHeight: 1.15,
                            color: ink,
                            textDecoration: "underline",
                            textDecorationColor: accent,
                            textUnderlineOffset: "6px",
                            textDecorationThickness: "2px",
                            maxWidth: 340,
                            cursor: "pointer",
                            position: "relative",
                            zIndex: 3,
                            pointerEvents: "auto",
                            transition: "color 160ms ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = accent
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = ink
                        }}
                    >
                        {subline}
                    </a>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                        }}
                    >
                        <IconLink
                            href={instagramUrl}
                            label="Instagram"
                            ink={ink}
                            accent={accent}
                        >
                            <InstagramIcon />
                        </IconLink>
                        <IconLink
                            href={linkedinUrl}
                            label="LinkedIn"
                            ink={ink}
                            accent={accent}
                        >
                            <LinkedInIcon />
                        </IconLink>
                        <IconLink
                            href={mailHref}
                            label="Email"
                            ink={ink}
                            accent={accent}
                        >
                            <EmailIcon />
                        </IconLink>
                    </div>
                </div>
            </div>
        </footer>
    )
}

function IconLink({
    href,
    label,
    ink,
    accent,
    children,
}: {
    href: string
    label: string
    ink: string
    accent: string
    children: ReactNode
}) {
    return (
        <a
            href={href}
            aria-label={label}
            target={href.startsWith("mailto:") ? undefined : "_blank"}
            rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
            style={{
                width: 40,
                height: 40,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1.5px solid ${ink}`,
                borderRadius: 8,
                background: creamSafe(),
                color: ink,
                textDecoration: "none",
                boxShadow: `2px 2px 0 ${accent}`,
                transition: "transform 160ms ease, box-shadow 160ms ease",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translate(-1px, -1px)"
                e.currentTarget.style.boxShadow = `3px 3px 0 ${accent}`
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none"
                e.currentTarget.style.boxShadow = `2px 2px 0 ${accent}`
            }}
        >
            {children}
        </a>
    )
}

function creamSafe() {
    return "rgba(243,239,230,0.92)"
}

function InstagramIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="5"
                stroke="currentColor"
                strokeWidth="1.8"
            />
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
        </svg>
    )
}

function LinkedInIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="3"
                stroke="currentColor"
                strokeWidth="1.8"
            />
            <path
                d="M8 10.5V16.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
            <circle cx="8" cy="7.5" r="1.1" fill="currentColor" />
            <path
                d="M11.5 16.5V12.2c0-1.3.9-2.2 2.1-2.2 1.2 0 2.1.9 2.1 2.2v4.3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

function EmailIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="2.5"
                stroke="currentColor"
                strokeWidth="1.8"
            />
            <path
                d="M4.5 7.5L12 12.5L19.5 7.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

addPropertyControls(WorkIndex, {
    intro: {
        type: ControlType.String,
        title: "Intro",
        defaultValue: DEFAULT_INTRO,
        displayTextArea: true,
    },
    items: {
        type: ControlType.Array,
        title: "Projects",
        maxCount: 4,
        control: {
            type: ControlType.Object,
            controls: {
                title: {
                    type: ControlType.String,
                    title: "Title",
                    defaultValue: "Project",
                },
                subtitle: {
                    type: ControlType.String,
                    title: "Subtitle",
                    defaultValue: "Type",
                },
                slug: {
                    type: ControlType.String,
                    title: "Slug",
                    defaultValue: "project",
                },
                href: {
                    type: ControlType.Link,
                    title: "Link — Card (optional)",
                },
                year: {
                    type: ControlType.String,
                    title: "Year",
                    defaultValue: "2025",
                },
                accent: {
                    type: ControlType.Color,
                    title: "Accent",
                    defaultValue: "#2C6BE0",
                },
                videoUrl: {
                    type: ControlType.String,
                    title: "Video URL",
                    defaultValue: "",
                },
                coverUrl: {
                    type: ControlType.String,
                    title: "Poster / Cover URL",
                    defaultValue: "",
                },
            },
        },
        defaultValue: DEFAULT_ITEMS,
    },
    accent: { type: ControlType.Color, title: "UI Accent", defaultValue: "#2C6BE0" },
    backLink: {
        type: ControlType.Link,
        title: "Link — Back Button",
        defaultValue: "/",
    },
    projectBasePath: {
        type: ControlType.Link,
        title: "Link — Project Base Path",
        defaultValue: "/work",
    },

    cream: { type: ControlType.Color, title: "Background", defaultValue: "#F3EFE6" },
    ink: { type: ControlType.Color, title: "Ink", defaultValue: "#111111" },
    muted: { type: ControlType.Color, title: "Muted Text", defaultValue: "#555555" },
    displayFont: {
        type: ControlType.Font,
        title: "Display Font",
        controls: "extended",
        defaultFontType: "sans-serif",
        defaultValue: {
            fontFamily: "Annie Use Your Telescope",
            fontSize: "48px",
            variant: "Regular",
        },
    },
    font: {
        type: ControlType.Font,
        title: "Body Font",
        controls: "extended",
        defaultFontType: "sans-serif",
        defaultValue: {
            fontSize: "15px",
            variant: "Regular",
            lineHeight: "1.5em",
        },
    },
    titleSize: {
        type: ControlType.Number,
        title: "Title Size",
        defaultValue: 96,
        min: 40,
        max: 140,
        step: 2,
    },
    footerSubline: {
        type: ControlType.String,
        title: "Footer Home Text",
        displayTextArea: true,
        defaultValue: DEFAULT_FOOTER_SUBLINE,
    },
    footerHomeLink: {
        type: ControlType.Link,
        title: "Link — Footer Home Text",
        defaultValue: "/",
    },
    footerInstagramUrl: {
        type: ControlType.Link,
        title: "Link — Footer Instagram",
        defaultValue: "https://instagram.com/",
    },
    footerLinkedinUrl: {
        type: ControlType.Link,
        title: "Link — Footer LinkedIn",
        defaultValue: "https://linkedin.com/",
    },
    footerEmail: {
        type: ControlType.String,
        title: "Link — Footer Email",
        defaultValue: "hello@example.com",
    },
    footerDeskScale: {
        type: ControlType.Number,
        title: "Footer Desk Scale",
        defaultValue: 1,
        min: 0.7,
        max: 1.4,
        step: 0.05,
    },
    footerHeight: {
        type: ControlType.Number,
        title: "Footer Height",
        defaultValue: 280,
        min: 220,
        max: 420,
        step: 4,
    },
    footerHeadlineSize: {
        type: ControlType.Number,
        title: "Footer Link Text Size",
        defaultValue: 36,
        min: 22,
        max: 56,
    },

    gridOpacity: {
        type: ControlType.Number,
        title: "Grid Opacity",
        defaultValue: 0.1,
        min: 0,
        max: 0.4,
        step: 0.01,
    },
})
