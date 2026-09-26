/**
 * Sitewide desk radio — continues mid-track across Framer page navigations.
 * Injected via bodyStart custom code (alongside click sound).
 *
 * Framer navigations are full document loads, so Audio is recreated each page.
 * We persist want-on + currentTime in sessionStorage and keep re-applying the
 * seek until it sticks (browsers often ignore the first currentTime set).
 */
(function () {
    if (window.__nabiaRadioReady) return
    window.__nabiaRadioReady = true

    var DEFAULT_TRACK =
        "https://archive.org/download/BS2023-07-14.dpa/Belle_and_Sebastian_2023-07-14t02.mp3"
    var WANT_KEY = "__nabiaRadioWantOn"
    var TRACK_KEY = "__nabiaRadioTrackUrl"
    var TIME_KEY = "__nabiaRadioCurrentTime"

    var audio = new Audio()
    audio.loop = true
    audio.preload = "auto"
    audio.volume = 0.55
    audio.crossOrigin = "anonymous"

    // Pending mid-track resume target. While set, we must NOT overwrite TIME_KEY
    // with a near-zero currentTime from the freshly created Audio element.
    var resumeAt = 0
    var resumeTries = 0

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

    function savedTime() {
        try {
            var t = parseFloat(sessionStorage.getItem(TIME_KEY) || "0")
            return isFinite(t) && t > 0 ? t : 0
        } catch (_) {
            return 0
        }
    }

    function saveTime(force) {
        try {
            if (!audio || !isFinite(audio.currentTime)) return
            // Never clobber the stored resume point with a fresh 0→few-seconds playback.
            if (!force && resumeAt >= 0.5) return
            if (audio.currentTime > 0.25) {
                sessionStorage.setItem(TIME_KEY, String(audio.currentTime))
            }
        } catch (_) {}
    }

    function clearTime() {
        try {
            sessionStorage.removeItem(TIME_KEY)
        } catch (_) {}
        resumeAt = 0
    }

    function sameTrack(url) {
        var next = String(url || "").trim()
        if (!next || !audio.src) return false
        var file = next.split("/").pop() || ""
        if (!file) return false
        var cur = ""
        try {
            cur = decodeURIComponent(audio.src || "")
        } catch (_) {
            cur = audio.src || ""
        }
        return cur.indexOf(file) !== -1
    }

    function setTrack(url) {
        var next = String(url || "").trim() || DEFAULT_TRACK
        window.__nabiaRadioTrackUrl = next
        try {
            sessionStorage.setItem(TRACK_KEY, next)
        } catch (_) {}
        if (sameTrack(next)) return false
        // Only wipe position when swapping away from a different already-loaded track.
        // Fresh Audio (empty src) on a new page must KEEP the saved resume time.
        if (audio.src) {
            clearTime()
        }
        audio.src = next
        audio.load()
        return true
    }

    function armResumeFromStorage() {
        var t = savedTime()
        if (t >= 0.5) {
            resumeAt = t
            resumeTries = 0
        }
    }

    function applyResume() {
        if (resumeAt < 0.5) return false
        resumeTries += 1
        try {
            if (isFinite(audio.duration) && audio.duration > 0 && resumeAt >= audio.duration - 0.35) {
                resumeAt = 0
                return false
            }
            // Close enough — lock in and start persisting normally.
            if (Math.abs((audio.currentTime || 0) - resumeAt) < 1.25) {
                resumeAt = 0
                saveTime(true)
                return true
            }
            audio.currentTime = resumeAt
            // Give up after many tries so a broken seek can't loop forever.
            if (resumeTries > 40) {
                resumeAt = 0
            }
            return true
        } catch (_) {
            return false
        }
    }

    function whenReady(fn) {
        if (audio.readyState >= 1) return Promise.resolve(fn())
        return new Promise(function (resolve) {
            var done = false
            function finish() {
                if (done) return
                done = true
                audio.removeEventListener("loadedmetadata", finish)
                audio.removeEventListener("canplay", finish)
                resolve(fn())
            }
            audio.addEventListener("loadedmetadata", finish)
            audio.addEventListener("canplay", finish)
            setTimeout(finish, 2500)
        })
    }

    function emit() {
        var detail = {
            playing: !audio.paused,
            wantOn: wantOn(),
            currentTime: audio.currentTime || 0,
            resumeAt: resumeAt,
        }
        try {
            window.dispatchEvent(new CustomEvent("nabia-radio", { detail: detail }))
        } catch (_) {}
        syncBtn()
    }

    function play() {
        // Preserve any in-memory resume target across setTrack(same file).
        var keepResume = resumeAt
        setTrack(trackUrl())
        if (keepResume >= 0.5) resumeAt = keepResume
        else if (resumeAt < 0.5) armResumeFromStorage()

        setWant(true)
        if (!audio.paused && resumeAt < 0.5) {
            emit()
            return Promise.resolve(true)
        }
        return whenReady(function () {
            applyResume()
            return audio
                .play()
                .then(function () {
                    applyResume()
                    emit()
                    return true
                })
                .catch(function () {
                    emit()
                    return false
                })
        })
    }

    function pause() {
        saveTime(true)
        resumeAt = 0
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
    window.__nabiaRadioGetTime = function () {
        return audio.currentTime || 0
    }

    audio.addEventListener("loadedmetadata", applyResume)
    audio.addEventListener("canplay", applyResume)
    audio.addEventListener("playing", function () {
        applyResume()
        emit()
    })
    audio.addEventListener("seeked", applyResume)
    audio.addEventListener("pause", function () {
        saveTime(true)
        emit()
    })
    audio.addEventListener("ended", emit)
    audio.addEventListener("timeupdate", function () {
        applyResume()
        saveTime(false)
    })

    function flushBeforeLeave() {
        saveTime(true)
    }
    window.addEventListener("pagehide", flushBeforeLeave)
    window.addEventListener("beforeunload", flushBeforeLeave)
    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "hidden") flushBeforeLeave()
    })
    document.addEventListener(
        "click",
        function (e) {
            var t = e.target
            if (!t || !t.closest) return
            if (t.closest("a[href]")) flushBeforeLeave()
        },
        true,
    )

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
        // Arm resume BEFORE any play() so early timeupdate can't wipe the stamp.
        if (wantOn()) armResumeFromStorage()

        syncBtn()
        window.addEventListener("resize", syncBtn)
        setInterval(function () {
            syncBtn()
            applyResume()
            if (!audio.paused) saveTime(false)
        }, 400)

        if (wantOn()) play()

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
