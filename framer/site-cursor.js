/**
 * Sitewide pixel cursors — blue arrow default, blue hand on clickables.
 * Injected via bodyStart custom code.
 */
(function () {
    if (window.__nabiaCursorReady) return
    window.__nabiaCursorReady = true

    var ARROW = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAwCAYAAAACYxrZAAABNklEQVR4nOVXuw2DMBB9ROmo6TMAEzAJEiOwAiUrMEKkTJIJMgB96tSkiaMDzsYHZ8TntTY+vce7d3YEAGnZdvjh1dwiBMQl5OHbLJiWbZeWbfd4fjruA/WCobF6wQjou7QqEgBAfX//N2k6d3WGV9uCYQoANfT6dB+mWdIyVkkphvJSQ0mxHdNMgcqaZ7G3kcQFuT6VQEVSiYmsSSOBYVsVyaS8qqbx+ZeqBY20LolVJDXwCfz99CEHn8DfR3gvgaqkFJy8VZGEZ0idm2dxtE9JJUG+TYaUgSuJfC5YJ+5DWxDTnpqDIOPJhdF4MqAM6GA1ezmGPuPJ6VLJbcwXIkk1HqkjhkaKvBlvpozpvJMY6CR9qPXC5Wbg8OzjS3q8gsPenT3xuUBn14t+weAMh/G4uKA07r5nT4jITOvr1AAAAABJRU5ErkJggg=='
    var HAND = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAwCAYAAACWhbMrAAABPklEQVR4nO2YsQ2DMBBFvyM66vQMkAmYBCkjZIWUrMAIkZiECRggfWpqUkSXGOSYMzmcE/IrjbE+3+c7c0AgbTeMoe+EYrgT224YqzI3AHC63CfC+qZgr8PhwJ1IgtQ5Vd8eAIDr+Th5RuNSjrGdikkSxSWJ4pJEcckkF3MlVkq6IYiKoiT6K/vfPlf5mRdvwleSREWFMI8/O/aiifpWxF3sP6bWQA7WeMVe3xQms+9JLqRvlRx0bl9V5oaOre9ISyVGliiJReYfszS+hFeUvai0Uz7BOmMK+JwwOpZrbZdCr1PEO5FZ8UNjMd2bOFWVuVlzKZNG5fYlUVycyZNShK+psSXqnGq7Yfz7fWreRqoahU4BCwXZ7t7FjC2VTiVRXILqnGRs+Zq3QU7FKtYqty+J4rK6zGz5H6jSKZU8AQ9FeKPOuv10AAAAAElFTkSuQmCC'
    var AX = 1, AY = 0
    var HX = 12, HY = 0

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
