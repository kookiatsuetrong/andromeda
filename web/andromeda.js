/*
 * The starting file of Andromeda system.
 * 
 * Andromeda can be run in either mode:
 * - desktop (full screen)
 * - region  (section)
 * 
 * The desktop mode:
 * - display as full screen
 * - user can move any window
 * - the launcher will be shown
 * 
 * The region mode:
 * - non-full screen
 * - fixed window
 * - no launcher displayed
 * 
 * The mode can be changed by calling:
 *   Screen.setMode("region")
 *   Screen.setMode("desktop")
 * 
 * By default, Andromeda runs in the full screen mode.
 * 
 */

/* A quick note for user interaction
 * 
 * mouse click  --> pointerdown, mousedown
 * finger touch --> pointerdown, mousedown, touchstart
 * pen tap      --> pointerdown, mousedown, touchstart
 *
 * mousedown     mousemove     mouseup         dblclick
 * touchstart    touchmove     touchend        (no)
 * pointerdown   pointermove   pointerup       (no)
 */

var Screen = { }

Screen.apps = [ ]			// list of apps
Screen.workers = { }		// mapping for mime and app
Screen.windows = [ ]		// list of opening window
Screen.windowNumber = 0

Screen.defaultWidth  = 600
Screen.defaultHeight = 400

Screen.andromeda = document.createElement("section")

/*
Screen.getDesktop = function() {
	return Screen.andromeda
}
*/

document.write("<script src='/andromeda-system.js'></script>")
document.write("<script src='/andromeda-screen.js'></script>")
document.write("<script src='/andromeda-window.js'></script>")
document.write("<script src='/andromeda-storage.js'></script>")
document.write("<script src='/andromeda-icon.js'></script>")
document.write("<script src='/andromeda-app.js'></script>")

window.addEventListener("load", e => Screen.start())

