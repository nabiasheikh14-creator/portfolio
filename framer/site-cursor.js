/**
 * Sitewide pixel cursors — original pack, white fill + site-blue outline.
 * Arrow default; hand on clickables.
 */
(function () {
    if (window.__nabiaCursorReady) return
    window.__nabiaCursorReady = true

    var ARROW = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAABACAYAAACdp77qAAABP0lEQVR42u2awQ3DIAxFcZU96ADNZM04ZDI6QDMJvZQKUadATcC09imKcvji/zzbUUA963K9O39tjVYAAKpTnbCbPQXtiupdLEUBlqm4busZxD6OoibspjX6dT0vm3LOuZZv5pR6wBqt5mUT+8bJ1MeMqePbEemkjgr9uPbtVYiKmidXLCpmmCBh2EyFVsa4oEwWYl8T+z4VZRGpKqoWLiRTpMUhftWpFVuZwoXY1x0JFFw0EfXWjoKMYfySTOUMis2QUIILazQ/+wAA/gsJ0pClzXyTlVx0lC4RYl9V+/Ysw2jc5aQgqKHtw5ouu0ylRE41Bv2cHTCcQlLWCxJISPDDvPceVgaivOcp7+OsxZ+zf39KKOVKbSRUpXLu8hEiB8MNyxVLODWMKJbfElhmCjupwwY1yn8OEvSuoqht6gHGBoqVrlbbiQAAAABJRU5ErkJggg=='
    var HAND = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAABACAYAAACz4p94AAABQ0lEQVR42u2YXRKDIAyECcM96gHqyepx6snqAepJ0pc6pRYpoxgDbh51/PnIsgkxZmMwM5uDg3K85Hp7BkGGviEJCLtnBqSyRLlW/3G/fN1vu1EsIzbHS+YA82t7Z8SaCgIQgAAEIAABiOohnNSHQq0HEVExEH4zCDkdLae1540UyYlAhFr1FJktPVe8nELZc1p+LrTqbTf+nCBD2UOxU+VOzMwxF/h3X1purflIbOgbcszMIe1JFivIyRhjU2XiW5uG0WXUYmOFaZKcNnk5qc24pSKjAYytmoSkqu2d6paTP3r3q2GujafWnTQB1ulOJUoL7gQIQCRA8DuK7p1CZwzNToUxpmT4XbOvBOoLgojJ/Txy8udO04hH0ya3a9KHYgcIQCi33C0P+0PoPVxq7oJLBgM5AQIQaMXTnASZOCtEFfECmYCS5oIn/u8AAAAASUVORK5CYII='
    var AX = 2, AY = 0
    var HX = 16, HY = 0

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
