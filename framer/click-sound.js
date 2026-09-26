/**
 * Sitewide UI click sound — bodyStart custom code.
 * Short mechanical mouse-button click via Web Audio
 * (same on every page; never cuts off mid-sample on navigation).
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

    /** Plastic mouse-button: soft body thump + sharp tip click. */
    function playMouseClick() {
        var c = getCtx()
        if (!c) return
        if (c.state === "suspended") {
            c.resume().then(function () { playMouseClick() }).catch(function () {})
            return
        }

        var t = c.currentTime
        var master = c.createGain()
        master.gain.value = 0.55
        master.connect(c.destination)

        // 1) Soft body thump (button travel)
        var thump = c.createOscillator()
        var thumpGain = c.createGain()
        thump.type = "sine"
        thump.frequency.setValueAtTime(180, t)
        thump.frequency.exponentialRampToValueAtTime(70, t + 0.03)
        thumpGain.gain.setValueAtTime(0.0001, t)
        thumpGain.gain.exponentialRampToValueAtTime(0.35, t + 0.004)
        thumpGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045)
        thump.connect(thumpGain)
        thumpGain.connect(master)
        thump.start(t)
        thump.stop(t + 0.05)

        // 2) Sharp tip — brief filtered noise (plastic contact)
        var nLen = Math.floor(c.sampleRate * 0.018)
        var nBuf = c.createBuffer(1, nLen, c.sampleRate)
        var nData = nBuf.getChannelData(0)
        for (var i = 0; i < nLen; i++) {
            var env = Math.pow(1 - i / nLen, 3.2)
            nData[i] = (Math.random() * 2 - 1) * env
        }
        var noise = c.createBufferSource()
        noise.buffer = nBuf
        var hp = c.createBiquadFilter()
        hp.type = "bandpass"
        hp.frequency.value = 2800
        hp.Q.value = 1.4
        var nGain = c.createGain()
        nGain.gain.setValueAtTime(0.0001, t)
        nGain.gain.exponentialRampToValueAtTime(0.55, t + 0.0015)
        nGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.022)
        noise.connect(hp)
        hp.connect(nGain)
        nGain.connect(master)
        noise.start(t)
        noise.stop(t + 0.025)

        // 3) Tiny mid click transient (switch latch)
        var tip = c.createOscillator()
        var tipGain = c.createGain()
        tip.type = "triangle"
        tip.frequency.setValueAtTime(2400, t)
        tip.frequency.exponentialRampToValueAtTime(900, t + 0.012)
        tipGain.gain.setValueAtTime(0.0001, t)
        tipGain.gain.exponentialRampToValueAtTime(0.22, t + 0.001)
        tipGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.018)
        tip.connect(tipGain)
        tipGain.connect(master)
        tip.start(t)
        tip.stop(t + 0.02)
    }

    function playClick() {
        var now = performance.now()
        if (now - last < 45) return
        last = now
        unlock()
        playMouseClick()
    }

    window.__nabiaPlayClick = playClick
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
