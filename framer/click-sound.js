/**
 * Sitewide UI click sound — installed via Framer custom code (bodyStart).
 * Louder soft tick on pointerdown / Enter / Space for interactive UI.
 *
 * Re-install with framer.setCustomCode({ location: "bodyStart", html: ... })
 * if the site custom code is cleared.
 */
(function () {
    if (window.__nabiaClickSound) return
    window.__nabiaClickSound = true

    var ctx = null
    var last = 0
    var unlocked = false
    var fileAudio = null

    function getTickUrl() {
        if (window.__nabiaTickSoundUrl) return String(window.__nabiaTickSoundUrl)
        try {
            return sessionStorage.getItem("__nabiaTickSoundUrl") || ""
        } catch (_) {
            return ""
        }
    }

    function getCtx() {
        if (ctx) return ctx
        var AC = window.AudioContext || window.webkitAudioContext
        if (!AC) return null
        ctx = new AC()
        return ctx
    }

    function unlock() {
        var c = getCtx()
        if (!c) return
        if (c.state === "suspended") {
            c.resume().catch(function () {})
        }
        unlocked = true
    }

    function playFileTick(url) {
        try {
            if (!fileAudio || fileAudio.getAttribute("data-src") !== url) {
                fileAudio = new Audio(url)
                fileAudio.setAttribute("data-src", url)
                fileAudio.preload = "auto"
            }
            fileAudio.volume = 0.7
            fileAudio.currentTime = 0
            var p = fileAudio.play()
            if (p && p.catch) p.catch(function () {})
            return true
        } catch (_) {
            return false
        }
    }

    function playSynthTick() {
        var c = getCtx()
        if (!c) return
        if (c.state === "suspended") {
            c.resume()
                .then(function () {
                    playSynthTick()
                })
                .catch(function () {})
            return
        }
        var t = c.currentTime

        // Soft but audible UI tick (default when no file is set)
        var bufferSize = Math.floor(c.sampleRate * 0.03)
        var buffer = c.createBuffer(1, bufferSize, c.sampleRate)
        var data = buffer.getChannelData(0)
        for (var i = 0; i < bufferSize; i++) {
            var env = 1 - i / bufferSize
            data[i] = (Math.random() * 2 - 1) * env * env
        }
        var noise = c.createBufferSource()
        noise.buffer = buffer
        var nFilter = c.createBiquadFilter()
        nFilter.type = "bandpass"
        nFilter.frequency.value = 2200
        nFilter.Q.value = 0.9
        var nGain = c.createGain()
        nGain.gain.setValueAtTime(0.22, t)
        nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04)
        noise.connect(nFilter)
        nFilter.connect(nGain)
        nGain.connect(c.destination)
        noise.start(t)
        noise.stop(t + 0.04)

        var osc = c.createOscillator()
        var oGain = c.createGain()
        osc.type = "triangle"
        osc.frequency.setValueAtTime(1600, t)
        osc.frequency.exponentialRampToValueAtTime(480, t + 0.06)
        oGain.gain.setValueAtTime(0.18, t)
        oGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07)
        osc.connect(oGain)
        oGain.connect(c.destination)
        osc.start(t)
        osc.stop(t + 0.07)
    }

    function playClick() {
        var now = performance.now()
        if (now - last < 40) return
        last = now
        var url = getTickUrl()
        if (url && playFileTick(url)) return
        playSynthTick()
    }

    // Expose for React code components (desk hotspots, etc.)
    window.__nabiaPlayClick = playClick
    window.__nabiaSetTickSoundUrl = function (url) {
        var next = url ? String(url) : ""
        window.__nabiaTickSoundUrl = next
        try {
            if (next) sessionStorage.setItem("__nabiaTickSoundUrl", next)
            else sessionStorage.removeItem("__nabiaTickSoundUrl")
        } catch (_) {}
        fileAudio = null
    }

    function isInteractive(el) {
        if (!el || el.nodeType !== 1) return false
        var node = el
        for (var i = 0; i < 10 && node; i++) {
            if (node === document.body || node === document.documentElement) break
            var tag = (node.tagName || "").toLowerCase()
            if (
                tag === "a" ||
                tag === "button" ||
                tag === "summary" ||
                tag === "input" ||
                tag === "select" ||
                tag === "textarea" ||
                tag === "label"
            ) {
                return true
            }
            var role = node.getAttribute && node.getAttribute("role")
            if (
                role === "button" ||
                role === "link" ||
                role === "tab" ||
                role === "menuitem" ||
                role === "option"
            ) {
                return true
            }
            if (node.hasAttribute) {
                if (node.hasAttribute("data-highlight")) return true
                if (node.getAttribute("tabindex") === "0") return true
            }
            try {
                var pe = window.getComputedStyle
                    ? window.getComputedStyle(node).cursor
                    : ""
                if (pe === "pointer") return true
            } catch (_) {}
            node = node.parentElement
        }
        return false
    }

    function onPointerDown(e) {
        if (e.button != null && e.button !== 0) return
        unlock()
        if (!isInteractive(e.target)) return
        try {
            playClick()
        } catch (_) {}
    }

    document.addEventListener("pointerdown", onPointerDown, true)
    document.addEventListener("pointerdown", unlock, { once: true, capture: true })
    document.addEventListener(
        "keydown",
        function (e) {
            if (e.key !== "Enter" && e.key !== " ") return
            unlock()
            if (!isInteractive(e.target)) return
            try {
                playClick()
            } catch (_) {}
        },
        true,
    )
})()
