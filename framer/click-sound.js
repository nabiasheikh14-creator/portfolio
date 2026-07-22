/**
 * Sitewide UI click sound — installed via Framer custom code (bodyStart).
 * Soft noise tick + sine chirp on pointerdown / Enter / Space for interactive
 * elements (links, buttons, role=button, cursor:pointer, etc.).
 *
 * Re-install with framer.setCustomCode({ location: "bodyStart", html: ... })
 * if the site custom code is cleared.
 */
(function () {
    if (window.__nabiaClickSound) return
    window.__nabiaClickSound = true

    let ctx = null
    let last = 0

    function getCtx() {
        if (ctx) return ctx
        const AC = window.AudioContext || window.webkitAudioContext
        if (!AC) return null
        ctx = new AC()
        return ctx
    }

    function playClick() {
        const c = getCtx()
        if (!c) return
        if (c.state === "suspended") c.resume()
        const now = performance.now()
        if (now - last < 30) return
        last = now
        const t = c.currentTime

        const bufferSize = Math.floor(c.sampleRate * 0.025)
        const buffer = c.createBuffer(1, bufferSize, c.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) {
            const env = 1 - i / bufferSize
            data[i] = (Math.random() * 2 - 1) * env * env
        }
        const noise = c.createBufferSource()
        noise.buffer = buffer
        const nFilter = c.createBiquadFilter()
        nFilter.type = "bandpass"
        nFilter.frequency.value = 1800
        nFilter.Q.value = 0.8
        const nGain = c.createGain()
        nGain.gain.setValueAtTime(0.045, t)
        nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03)
        noise.connect(nFilter)
        nFilter.connect(nGain)
        nGain.connect(c.destination)
        noise.start(t)
        noise.stop(t + 0.03)

        const osc = c.createOscillator()
        const oGain = c.createGain()
        osc.type = "sine"
        osc.frequency.setValueAtTime(1400, t)
        osc.frequency.exponentialRampToValueAtTime(520, t + 0.045)
        oGain.gain.setValueAtTime(0.035, t)
        oGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05)
        osc.connect(oGain)
        oGain.connect(c.destination)
        osc.start(t)
        osc.stop(t + 0.055)
    }

    function isInteractive(el) {
        if (!el || el.nodeType !== 1) return false
        let node = el
        for (let i = 0; i < 6 && node; i++) {
            if (node === document.body || node === document.documentElement) break
            const tag = (node.tagName || "").toLowerCase()
            if (tag === "a" || tag === "button" || tag === "summary") return true
            if (tag === "input" || tag === "select" || tag === "textarea" || tag === "label")
                return true
            const role = node.getAttribute && node.getAttribute("role")
            if (role === "button" || role === "link" || role === "tab" || role === "menuitem")
                return true
            const pe = window.getComputedStyle ? window.getComputedStyle(node).cursor : ""
            if (pe === "pointer") return true
            node = node.parentElement
        }
        return false
    }

    function onPointerDown(e) {
        if (e.button != null && e.button !== 0) return
        if (!isInteractive(e.target)) return
        try {
            playClick()
        } catch (_) {}
    }

    function unlock() {
        const c = getCtx()
        if (c && c.state === "suspended") c.resume()
    }

    document.addEventListener("pointerdown", onPointerDown, true)
    document.addEventListener("pointerdown", unlock, { once: true, capture: true })
    document.addEventListener(
        "keydown",
        (e) => {
            if (e.key !== "Enter" && e.key !== " ") return
            if (!isInteractive(e.target)) return
            try {
                playClick()
            } catch (_) {}
        },
        true,
    )
})()
