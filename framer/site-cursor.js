/**
 * Sitewide pixel cursors (Kenney Cursor Pixel Pack, CC0).
 * White fill + site-blue outline. Arrow default; hand on clickables.
 */
(function () {
    if (window.__nabiaCursorReady) return
    window.__nabiaCursorReady = true

    var ARROW = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAABACAYAAABVy1Q8AAAAvUlEQVR42u3bsQ3CMBgFYRuxBwwAk8E4MBkMQCaB3gUIGZzf9vfKFBGn3IkoSnIqdjg9nqli9+s+pxW3SYMNUPTl2maiNUU5QNEaul12b09wPC+hmqIcoN4aitYU5QD13tDaTVEO0GgNtW6KcoBGb+jfTVEO0GwN/bopygGavaHapigHqPG20X9g2fCnpigHCBAgQP6Hau7FXCFAszfUuhnPFAD13pB3fSg3OZB3TikHqLKh8oBvHygH6Ku9ACv7SnaYuoaBAAAAAElFTkSuQmCC'
    var HAND = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABAklEQVR42u2bwQ3CMAxFE9Q9YACYrIwDk8EAdBI44wORZTtN8PvHVq3ap/wfO2lrMeq8vt6W65/3Uy076lCSCwDZAdTenh8tE7AAAJJr8b7h43b8ef5y3RgBAADAH2dAdG/hXSdgAQCQAXNJ24u0MgMLAIAM6Nvv9+4d5PvITMACAEiu6u35lqejpc0MLAAA6oB95+nouqL1fFgAAGTA3PM+IwAAAIjNADmPzu55RgAAAPC9HiAPaNcHRs8EegEsAABdBsyeCawJYgEA+PYCci+t996ht9gbxAIA0GWAdR6Orgus+xJYAAD0AjaNXhfwnSAWAEBsBoyWCdr/CbAAAJLrA4NxSe5JlFOYAAAAAElFTkSuQmCC'
    var AX = 4, AY = 0
    var HX = 23, HY = 0

    var css = ''
        + 'html, body {'
        + '  cursor: url("' + ARROW + '") ' + AX + ' ' + AY + ', auto !important;'
        + '}'
        + '*, *::before, *::after {'
        + '  cursor: inherit;'
        + '}'
        + 'a, a *, button, button *, [role="button"], [role="button"] *,'
        + 'input[type="button"], input[type="submit"], input[type="reset"],'
        + 'label[for], summary, select,'
        + '[data-framer-component-type="Link"], [data-framer-component-type="Link"] *,'
        + '[data-desk-modal] button, [data-desk-modal] button *,'
        + '[data-desk-modal] a, [data-desk-modal] a *,'
        + '[href], [href] *,'
        + '.nabia-clickable, .nabia-clickable * {'
        + '  cursor: url("' + HAND + '") ' + HX + ' ' + HY + ', pointer !important;'
        + '}'
        + 'input[type="text"], input[type="email"], input[type="search"],'
        + 'input[type="password"], input[type="url"], input[type="tel"],'
        + 'textarea, [contenteditable="true"] {'
        + '  cursor: text !important;'
        + '}'

    function inject() {
        var s = document.getElementById("nabia-cursor-style")
        if (!s) {
            s = document.createElement("style")
            s.id = "nabia-cursor-style"
            ;(document.head || document.documentElement).appendChild(s)
        }
        if (s.textContent !== css) s.textContent = css
    }

    if (document.documentElement) inject()
    else document.addEventListener("DOMContentLoaded", inject)
    setInterval(inject, 2000)
})()
