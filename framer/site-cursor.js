/**
 * Sitewide pixel cursors — original pack, white fill + site-blue outline.
 * Arrow default; hand on clickables.
 */
(function () {
    if (window.__nabiaCursorReady) return
    window.__nabiaCursorReady = true

    var ARROW = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAoCAYAAAAVBmHYAAAAzUlEQVR42u2W0Q2DMAxEz1X2oAPAZHQcmIwOQCdxP5CRVRUrNDE1avMFEZh3trkYAND2M7f9zKi8LnBcxwWX9DAzu5ETEdUInvTNNDQAgA5LcaehKfqQmfNSBendZi0Frt1C0iWa+HV1t8d6fR+vFII85TykFUkdchR8n9zqJEvBeY0rffpiTnpikucoiE1uKYhJrs0sXp9rui07/qHfX9IhZyczs96LRy50UiQaz2JcW20lM8ve3PuT75lFwljuP3i5n+sxWgpotbEr+ROPBGSOCJMmcAAAAABJRU5ErkJggg=='
    var HAND = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAoCAYAAAAG0SEsAAAA8UlEQVR42u1X2w2DMAy0UfaAAchkdByYDAYIk1w/qqA0ogKTFxXxH/7I+XE+G6aT1g8G7vcydUyB1lBBU5Ks57HdfJo+vpAKFM28glfw54Cr0AdClE/FzgYAfB8zcxJwV/WIiPRrpWKZ7wVlpdhvzX8T7ko1NBksU8dqj7Gx9vXlzAFAQp5g8C+SHAD7LD/yizKXBCIdx/vIqyWXJgNJ2bKMWqqAlD9eVo1yVKAeE5uwFCOcu3dz9D7rYrFiNY8t0QioEr22Ff4Jvkwdu8slRfmbMxHWOS9iANAPBletHwz2rqVGws7n/i7FvunuT7hU9gajY5zcpmzAeQAAAABJRU5ErkJggg=='
    var AX = 1, AY = 0
    var HX = 11, HY = 0

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
