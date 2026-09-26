/**
 * Sitewide desk radio — persists across Framer client navigations.
 * Injected via bodyStart custom code (alongside click sound).
 * Floating MUSIC ON/OFF control, top-right, aligned with TopBar.
 */
(function () {
    if (window.__nabiaRadioReady) return
    window.__nabiaRadioReady = true

    var DEFAULT_TRACK =
        "https://archive.org/download/BS2023-07-14.dpa/Belle_and_Sebastian_2023-07-14t02.mp3"
    var WANT_KEY = "__nabiaRadioWantOn"
    var TRACK_KEY = "__nabiaRadioTrackUrl"

    var audio = new Audio()
    audio.loop = true
    audio.preload = "auto"
    audio.volume = 0.55
    audio.crossOrigin = "anonymous"

    function trackUrl() {
        try {
            var stored = sessionStorage.getItem(TRACK_KEY)
            if (stored) return stored
        } catch (_) {}
        return window.__nabiaRadioTrackUrl || DEFAULT_TRACK
    }

    function wantOn() {
        try {
            return sessionStorage.getItem(WANT_KEY) === "1"
        } catch (_) {
            return false
        }
    }

    function setWant(on) {
        try {
            sessionStorage.setItem(WANT_KEY, on ? "1" : "0")
        } catch (_) {}
    }

    function setTrack(url) {
        var next = String(url || "").trim() || DEFAULT_TRACK
        window.__nabiaRadioTrackUrl = next
        try {
            sessionStorage.setItem(TRACK_KEY, next)
        } catch (_) {}
        var file = next.split("/").pop() || ""
        var cur = ""
        try {
            cur = decodeURIComponent(audio.src || "")
        } catch (_) {
            cur = audio.src || ""
        }
        if (!audio.src || (file && cur.indexOf(file) === -1)) {
            var wasPlaying = !audio.paused
            audio.src = next
            audio.load()
            if (wasPlaying) {
                audio.play().catch(function () {})
            }
        }
    }

    function emit() {
        var detail = { playing: !audio.paused, wantOn: wantOn() }
        try {
            window.dispatchEvent(new CustomEvent("nabia-radio", { detail: detail }))
        } catch (_) {}
        syncBtn()
    }

    function play() {
        setTrack(trackUrl())
        setWant(true)
        return audio
            .play()
            .then(function () {
                emit()
                return true
            })
            .catch(function () {
                emit()
                return false
            })
    }

    function pause() {
        setWant(false)
        audio.pause()
        emit()
    }

    function toggle() {
        if (!audio.paused) pause()
        else return play()
    }

    window.__nabiaRadioPlay = play
    window.__nabiaRadioPause = pause
    window.__nabiaRadioToggle = toggle
    window.__nabiaRadioIsPlaying = function () {
        return !audio.paused
    }
    window.__nabiaRadioWantOn = wantOn
    window.__nabiaRadioSetTrack = setTrack

    audio.addEventListener("playing", emit)
    audio.addEventListener("pause", emit)
    audio.addEventListener("ended", emit)

    var SANS =
        '"Inter Display", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

    function isHome() {
        var p = (location.pathname || "/").replace(/\/+$/, "") || "/"
        return p === "/"
    }

    function applyChrome(btn) {
        var phone = false
        try {
            phone = window.matchMedia("(max-width: 809.98px)").matches
        } catch (_) {}
        var on = !audio.paused
        var home = isHome()
        btn.textContent = on ? "MUSIC ON" : "MUSIC OFF"
        btn.setAttribute("aria-pressed", on ? "true" : "false")
        btn.setAttribute("aria-label", on ? "Pause music" : "Play music")
        // Desk homepage already has the radio hotspot — show pill on other pages only.
        Object.assign(btn.style, {
            position: "fixed",
            top: phone ? "88px" : "48px",
            right: phone ? "12px" : "24px",
            zIndex: "1200",
            display: home ? "none" : "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: phone ? "8px 14px" : "10px 22px",
            background: "rgba(255,255,255,0.9)",
            border: "1.5px solid rgb(17,17,17)",
            borderRadius: "999px",
            color: "rgb(17,17,17)",
            fontFamily: SANS,
            fontWeight: "500",
            fontSize: "13px",
            letterSpacing: "-1px",
            textTransform: "uppercase",
            boxShadow: "0px 8px 24px rgba(0,0,0,0.14)",
            cursor: "pointer",
            pointerEvents: home ? "none" : "auto",
            boxSizing: "border-box",
            lineHeight: "1",
            margin: "0",
            appearance: "none",
            WebkitAppearance: "none",
        })
    }

    function ensureBtn() {
        var btn = document.getElementById("nabia-radio-toggle")
        if (btn && btn.isConnected) {
            applyChrome(btn)
            return btn
        }
        if (btn && !btn.isConnected) {
            try {
                btn.remove()
            } catch (_) {}
        }
        btn = document.createElement("button")
        btn.id = "nabia-radio-toggle"
        btn.type = "button"
        btn.dataset.nabiaRadioToggle = "true"
        applyChrome(btn)
        btn.addEventListener("click", function (e) {
            e.preventDefault()
            e.stopPropagation()
            try {
                if (window.__nabiaPlayClick) window.__nabiaPlayClick()
            } catch (_) {}
            toggle()
        })
        document.body.appendChild(btn)
        return btn
    }

    function syncBtn() {
        if (!document.body) return
        ensureBtn()
    }

    function boot() {
        syncBtn()
        window.addEventListener("resize", syncBtn)
        // Framer SPA may remount body children / change routes — keep control in sync.
        setInterval(function () {
            syncBtn()
        }, 800)
        // Resume if user left music on (may need a gesture on hard reload).
        if (wantOn()) {
            play()
        }
        // Any pointer: retry resume if still wanted but paused (autoplay policy).
        document.addEventListener(
            "pointerdown",
            function () {
                if (wantOn() && audio.paused) play()
            },
            true,
        )
        window.addEventListener("popstate", syncBtn)
    }

    if (document.body) boot()
    else document.addEventListener("DOMContentLoaded", boot)
})()
