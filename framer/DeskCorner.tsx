import { useEffect, useRef, type CSSProperties } from "react"
import {
    addPropertyControls,
    ControlType,
    RenderTarget,
    useIsStaticRenderer,
} from "framer"

const STAGE_W = 1440
const STAGE_H = 900
const IMG = "https://framerusercontent.com/images/"

/** Crop boxes [x,y,w,h] from 1440×900 desk layer PNGs */
export const DESK_OBJECTS: Record<
    string,
    { hash: string; box: [number, number, number, number]; width: number }
> = {
    archive: { hash: "969XNx9nZpgbsuyO98EvRf52B4w", box: [329, 292, 384, 140], width: 220 },
    laptop: { hash: "ffeeCWEVauyRc2jUztvEkKArptM", box: [570, 526, 354, 245], width: 210 },
    "projects-books": { hash: "z3PLroDJfbET05ZaDmzpA5lIAk", box: [560, 95, 190, 150], width: 160 },
    journal: { hash: "JPLbpkF1Jd17vRUT1rfmmgPhfQ", box: [241, 717, 167, 126], width: 150 },
    notes: { hash: "52nGQQ7gLqDiguh8AvcoksZaBGI", box: [1056, 691, 113, 88], width: 130 },
    chutney: { hash: "AwkrKCuhUkRurlYPAzFRI4yw", box: [542, 493, 84, 75], width: 110 },
    phone: { hash: "iokbHxpk1MBj2DyMk1qoueeeQM", box: [963, 717, 100, 98], width: 120 },
    schedule: { hash: "NDoJcAe2hm9jNoRn1l3KPiH88kM", box: [388, 485, 76, 68], width: 110 },
    sooraj: { hash: "O3MmyItiSJFvHk9GjYSG9NdqSc", box: [556, 428, 68, 60], width: 100 },
}

function paintMascot(host: HTMLDivElement, objectKey: string, width?: number) {
    const preset = DESK_OBJECTS[objectKey] ?? DESK_OBJECTS.archive
    const [x, y, w, h] = preset.box
    const displayW = width ?? preset.width
    const displayH = (h / w) * displayW
    const scale = displayW / w
    const src = `${IMG}${preset.hash}.png`

    host.replaceChildren()
    host.setAttribute("aria-hidden", "true")
    Object.assign(host.style, {
        position: "fixed",
        right: "0px",
        bottom: "0px",
        width: `${displayW}px`,
        height: `${displayH}px`,
        zIndex: "45",
        pointerEvents: "none",
        overflow: "hidden",
        animation: "none",
        transform: "none",
        filter: "none",
    } as Partial<CSSStyleDeclaration>)

    const inner = document.createElement("div")
    Object.assign(inner.style, {
        position: "absolute",
        width: `${STAGE_W * scale}px`,
        height: `${STAGE_H * scale}px`,
        left: `${-x * scale}px`,
        top: `${-y * scale}px`,
        backgroundImage: `url(${src})`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
    } as Partial<CSSStyleDeclaration>)
    host.appendChild(inner)
}

/**
 * Desk object stuck flush to the bottom-right corner (no float animation).
 * Place on destination pages so the clicked desk element travels with you.
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 * @framerIntrinsicWidth 220
 * @framerIntrinsicHeight 160
 */
export default function DeskCorner(props: {
    object?: string
    mascotWidth?: number
    width?: number
    style?: CSSProperties
}) {
    const object = props.object || "archive"
    const mascotWidth = props.mascotWidth ?? props.width
    const isStatic = useIsStaticRenderer()
    const hostRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (typeof document === "undefined") return
        if (isStatic || RenderTarget.current() === RenderTarget.canvas) return

        const host = document.createElement("div")
        host.dataset.deskCorner = object
        document.body.appendChild(host)
        hostRef.current = host
        paintMascot(host, object, typeof mascotWidth === "number" ? mascotWidth : undefined)

        return () => {
            host.remove()
            hostRef.current = null
        }
    }, [object, mascotWidth, isStatic])

    if (RenderTarget.current() === RenderTarget.thumbnail) {
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    background: "#F3EFE6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    color: "#111",
                }}
            >
                DeskCorner
            </div>
        )
    }

    // Canvas / static: in-flow preview so the instance stays selectable
    if (isStatic || RenderTarget.current() === RenderTarget.canvas) {
        const preset = DESK_OBJECTS[object] ?? DESK_OBJECTS.archive
        const [x, y, w, h] = preset.box
        const displayW = typeof mascotWidth === "number" ? mascotWidth : preset.width
        const displayH = (h / w) * displayW
        const scale = displayW / w
        return (
            <div
                style={{
                    width: displayW,
                    height: displayH,
                    position: "relative",
                    overflow: "hidden",
                    ...props.style,
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

    // Live: mascot is mounted on document.body via effect
    return <div style={{ width: 1, height: 1, opacity: 0 }} aria-hidden />
}

addPropertyControls(DeskCorner, {
    object: {
        type: ControlType.Enum,
        title: "Object",
        options: [
            "archive",
            "laptop",
            "projects-books",
            "journal",
            "notes",
            "chutney",
            "phone",
            "schedule",
            "sooraj",
        ],
        optionTitles: [
            "Archive",
            "Laptop",
            "Projects books",
            "Journal",
            "Notes",
            "Chutney",
            "Phone",
            "Schedule",
            "Sooraj",
        ],
        defaultValue: "archive",
    },
    mascotWidth: {
        type: ControlType.Number,
        title: "Width",
        defaultValue: 200,
        min: 80,
        max: 360,
    },
})
