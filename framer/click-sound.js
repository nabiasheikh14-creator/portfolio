/**
 * Sitewide UI click sound — bodyStart custom code.
 * Always uses a short Web Audio synth tick so every page sounds the same
 * and navigation never cuts off a longer sample mid-play.
 */
(function () {
    if (window.__nabiaClickSound) return
    window.__nabiaClickSound = true

    var ctx = null
    var last = 0

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
        if (c.state === "suspended") c.resume().catch(function () {})
    }

    function playSynthTick() {
        var c = getCtx()
        if (!c) return
        if (c.state === "suspended") {
            c.resume().then(function () { playSynthTick() }).catch(function () {})
            return
        }
        var t = c.currentTime
        var bufferSize = Math.floor(c.sampleRate * 0.028)
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
        nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.035)
        noise.connect(nFilter)
        nFilter.connect(nGain)
        nGain.connect(c.destination)
        noise.start(t)
        noise.stop(t + 0.035)

        var osc = c.createOscillator()
        var oGain = c.createGain()
        osc.type = "triangle"
        osc.frequency.setValueAtTime(1600, t)
        osc.frequency.exponentialRampToValueAtTime(520, t + 0.05)
        oGain.gain.setValueAtTime(0.18, t)
        oGain.gain.exponentialRampToValueAtTime(0.001, t + 0.055)
        osc.connect(oGain)
        oGain.connect(c.destination)
        osc.start(t)
        osc.stop(t + 0.055)
    }

    function playClick() {
        var now = performance.now()
        if (now - last < 40) return
        last = now
        unlock()
        playSynthTick()
    }

    window.__nabiaPlayClick = playClick
    // Kept for DeskWorkspace compatibility; sitewide clicks always use synth.
    window.__nabiaSetTickSoundUrl = function () {
        window.__nabiaTickSoundUrl = ""
        try { sessionStorage.removeItem("__nabiaTickSoundUrl") } catch (_) {}
    }
    try { sessionStorage.removeItem("__nabiaTickSoundUrl") } catch (_) {}
    window.__nabiaTickSoundUrl = ""

    function isInteractive(el) {
        if (!el || el.nodeType !== 1) return false
        var node = el
        for (var i = 0; i < 10 && node; i++) {
            if (node === document.body || node === document.documentElement) break
            var tag = (node.tagName || "").toLowerCase()
            if (tag === "a" || tag === "button" || tag === "summary" || tag === "input" || tag === "select" || tag === "textarea" || tag === "label") return true
            var role = node.getAttribute && node.getAttribute("role")
            if (role === "button" || role === "link" || role === "tab" || role === "menuitem" || role === "option") return true
            if (node.hasAttribute) {
                if (node.hasAttribute("data-highlight")) return true
                if (node.getAttribute("tabindex") === "0") return true
            }
            try {
                if (window.getComputedStyle && window.getComputedStyle(node).cursor === "pointer") return true
            } catch (_) {}
            node = node.parentElement
        }
        return false
    }

    function onPointerDown(e) {
        if (e.button != null && e.button !== 0) return
        unlock()
        if (!isInteractive(e.target)) return
        try { playClick() } catch (_) {}
    }

    document.addEventListener("pointerdown", onPointerDown, true)
    document.addEventListener("pointerdown", unlock, { once: true, capture: true })
    document.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return
        unlock()
        if (!isInteractive(e.target)) return
        try { playClick() } catch (_) {}
    }, true)
})();
