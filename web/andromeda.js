
// mouse click  --> pointerdown, mousedown
// finger touch --> pointerdown, mousedown, touchstart
// pen tap      --> pointerdown, mousedown, touchstart

// mousedown     mousemove     mouseup         dblclick
// touchstart    touchmove     touchend        (no)
// pointerdown   pointermove   pointerup       (no)

var Screen = { }

Screen.apps = [ ]			// list of apps
Screen.workers = { }		// mapping for mime and app
Screen.windows = [ ]		// list of opening window
Screen.windowNumber = 0

Screen.defaultWidth  = 600
Screen.defaultHeight = 400

Screen.getSize = function() {
	var result    = { }
	result.width  = window.innerWidth
	result.height = window.innerHeight
	return result
}

Screen.start = function() {

	console.log("Starting Operating System")

	// 1. Handle mouse, touch, and pen events
	
	/*
	window.addEventListener("touchstart", e => {
		console.log("touchstart")
		console.log(e.touches)
	})

	window.addEventListener("pointerdown", e => {
		console.log("pointerdown")
		console.log(e)
	})

	window.addEventListener("mousedown", e => {
		console.log("mousedown")
		console.log(e)
	})
	*/

	window.addEventListener("mousemove",
				e => Screen.continueMouseMoveWindow(e))
	window.addEventListener("mouseup",
				e => Screen.finishMouseMoveWindow(e))

	window.addEventListener("touchmove", 
				e => Screen.continueFingerMoveWindow(e))
	window.addEventListener("touchend", 
				e => Screen.finishFingerMoveWindow(e))

	// 2. Create whole system's CSS

	var css = `

		.background {
			width: 100dvw;
			height: 100dvh;
			background-image: url("/background-gray.png");
			background-size: cover;
		}
		a {
			text-decoration: none;
			color: #aaa;
		}
		a:visited {
			color: #aaa;
		}
		a:hover {
			color: #333;
			cursor: pointer;
		}
		
		button {
			background: #ccc;
			color: #333;
			border: .1rem solid #aaa;
			padding: .5rem 1rem;
			border-radius: .35rem;
		}
		button:hover {
			background: #eee;
		}
		button:active {
			border: .1rem solid #ddd;
		}
		
		.window .bar img {
			border-radius: 1rem;
			padding: .1rem;
		}

		.window .bar img:hover {
			background: rgba(0, 0, 0, .25);
			cursor: pointer;
		}
		.launcher img {
			transition: transform .1s linear;
		}
		.launcher img:hover {
			transform: scale(1.25);
		}
		.launcher img:active {
			transform: none;
		}
		.menu-item {
			color: #ccc;
			transition: color .1s linear;
			margin-left: 1rem;
		}
		.menu-item:hover {
			color: #333;
			cursor: pointer;
		}
	
		.window.backdrop {
			position: absolute;
			background: rgba(0, 0, 0, .66);
			top: 0px;
			left: 0px;
			width: 100%;
			height: 100%;
		}
		.dialog {
			position: absolute;
			background: none;
			border-radius: 1.5rem;
			border: 0.5rem solid rgba(0, 0, 0, .01);
			box-shadow: 0 0 .1rem rgba(0, 0, 0, .25),
						0 0 4rem rgba(255,255,255, .8);
			color: #333;
			display: block;
			overflow: auto;
		}
		`

	var style = document.createElement("style")
	style.appendChild(document.createTextNode(css))
	document.getElementsByTagName("head")
				[0].appendChild(style)

	// 3. Create the launcher

	Screen.createLauncher()
	
	// 4. Handle file dropping
	
	window.addEventListener("drop", async e => {
		e.preventDefault()
		console.log(e)
		
		var files = [...e.dataTransfer.items]
					.map( item => item.getAsFile() )
					// .filter( item => item )
		console.log(files)
		
		files.forEach( f => {
			Screen.openFile(f.type, f)
		})

	})
	
	window.addEventListener("dragover", e => e.preventDefault() )

	// 5. Load custom fonts
	var fonts = [ 
		{name: "open-sans",   url: "/fonts/OpenSans-Regular.ttf"   },
		{name: "sarabun",     url: "/fonts/Sarabun-Regular.ttf"    },
		{name: "roboto-mono", url: "/fonts/RobotoMono-Regular.ttf" }
	]
	
	fonts.forEach( e => {
		var f = new FontFace(e.name, "url(" + e.url + ")")
		f.load().then( () => {
			console.log("adding font " + f.family)
			console.log(f)
			document.fonts.add(f)
		})
	})
	
	document.body.style.fontFamily = "open-sans, sarabun, " +
									"sans-serif, " +
									"roboto-mono"

}

Screen.setDataType = function(name, mime) {
	Screen.workers[mime] = name
}

Screen.setExtension = function(name, extension) {
	Screen.workers[extension] = name
}

Screen.registerApp = function(name, f) {
	// searching the app by name (using name as identifier)
	var found = -1
	for (var i = 0; i < Screen.apps.length; i++) {
		if (name == Screen.apps[i].name) {
			found = i
		}
	}

	if (found == -1) {
		// create a new app
		var detail = { }
		detail.name = name
		detail.start = f
		detail.icon = Icon.appIcon
		Screen.apps.push(detail)
	}

	if (found >= 0) {
		// replace the existing app
		var detail = Screen.apps[found]
		detail.name = name
		detail.start = f
		Screen.apps[found] = detail
	}

	return

	// find the launcher
	var index = -1
	for (var i = 0; i < Screen.windows.length; i++) {
		if (Screen.windows[i].text == "Launcher") {
			index = i
		}
	}
	
	if (index >= 0) {
		var icon = document.createElement("img")
		icon.src = Icon.appIcon

		var element = document.createElement("button")
		element.style.border = "none"
		element.style.background = "white"
		element.style.borderRadius = ".5rem"
		element.style.margin = ".5rem .25rem"
		element.style.padding = "0"
		element.style.width  = "2.5rem"
		element.style.height = "2.5rem"
		element.setAttribute("data-app-name", name)
		element.appendChild(icon)
		element.addEventListener("click", e => f(e))

		var bar = Screen.windows[index].element.
						querySelector(".launcher")
		// bar.appendChild(element)

		// searching the app by name (using name as identifier)
		var found = -1
		for (var i = 0; i < Screen.apps.length; i++) {
			if (name == Screen.apps[i].name) {
				found = i
			}
		}
		
		if (found == -1) {
			// create a new app
			var detail = { }
			detail.name = name
			detail.start = f
			detail.icon = Icon.appIcon
			Screen.apps.push(detail)
		}
		
		if (found >= 0) {
			// replace the existing app
			var detail = Screen.apps[found]
			detail.name = name
			detail.start = f
			Screen.apps[found] = detail
		}
	}
}

Screen.setAppIcon = function(name, icon) {
	// searching the app by name (using name as identifier)
	var found = -1
	for (var i = 0; i < Screen.apps.length; i++) {
		if (name == Screen.apps[i].name) {
			found = i
		}
	}

	if (found >= 0) {
		// replace the existing app
		var detail = Screen.apps[found]
		detail.icon = icon
		Screen.apps[found] = detail
	}
	
	// replace icon the launcher
	var selector = ".launcher [data-app-name='" + name + "']"
	var element = document.querySelector(selector)

	if (element == null) return

	var current = element.querySelector("img")
	element.removeChild(current)

	var item = document.createElement("img")
	item.src = icon
	element.appendChild(item)
}

Screen.displayAppIcon = function(name) {

	// find the launcher
	var index = -1
	for (var i = 0; i < Screen.windows.length; i++) {
		if (Screen.windows[i].text == "Launcher") {
			index = i
		}
	}
	
	if (index < 0) return
	
	var found = -1
	for (var i = 0; i < Screen.apps.length; i++) {
		if (Screen.apps[i].name == name) {
			found = i
		}
	}
	
	if (found < 0) return

	var icon = document.createElement("img")
	icon.src = Screen.apps[found].icon

	var element = document.createElement("button")
	element.style.border       = "none"
	element.style.background   = "white"
	element.style.borderRadius = ".5rem"
	element.style.margin       = ".5rem .25rem"
	element.style.padding      = "0"
	element.style.width        = "2.5rem"
	element.style.height       = "2.5rem"
	element.setAttribute("data-app-name", name)
	element.appendChild(icon)
	element.addEventListener("click", e => {
		for (var i = 0; i < Screen.apps.length; i++) {
			if (Screen.apps[i].name == name) {
				Screen.apps[i].start(e)
			}
		}
	})

	var launcher = Screen.windows[index].element.
					querySelector(".launcher")
	launcher.appendChild(element)
}

Screen.openFile = function(mime, data) {
	
	// 1. try to find the MIME file type (e.g. text/plain)
	var name = Screen.workers[mime]
	
	// 2. try to find by file extension (e.g. .memo)
	if (name == null) {
		var fileName = data.name || ""
		var items = fileName.split(".")
		if (items.length >= 2) {
			name = Screen.workers[items[1]]
		}
	}
	
	if (name == null) {
		console.log("Unknown Data Type")
		// TODO: ask user to find new app
		return
	}
	
	var found = -1
	for (var i = 0; i < Screen.apps.length; i++) {
		if (Screen.apps[i].name == name) {
			found = i
		}
	}
	
	if (found < 0) {
		console.log("Unknown App")
		// TODO: display an error
		return
	}
	
	// from this point, found is valid
	Screen.apps[found].start(data)
}

Screen.getActiveWindow = function() {
	var m = 0
	for (var i = 0; i < Screen.windows.length; i++) {
		if (m < Screen.windows[i].layer) {
			m = Screen.windows[i].layer
		}
	}
	return m
}

Screen.startMouseResizeWindow = function(event, pane) {
	var bound = pane.element.getBoundingClientRect()
	
	var distanceX = Math.abs(event.offsetX - bound.width)
	var distanceY = Math.abs(event.offsetY - bound.height)

	if (distanceX <= 64 && distanceY <= 64) {
		event.preventDefault()
		console.log("Window resizing by mouse")
		window.resizing = pane
		window.resizingWidth  = bound.width
		window.resizingHeight = bound.height
	}
}

Screen.startMouseMoveWindow = function(event, pane) {
	event.preventDefault()
	event.stopPropagation()
	document.body.style.cursor = "move"
	
	window.moving  = pane
	window.movingX = event.screenX
	window.movingY = event.screenY

	var bound = pane.element.getBoundingClientRect()
	window.startX  = bound.x
	window.startY  = bound.y
}

Screen.continueMouseMoveWindow = function(event) {
	if (window.moving == null) { }
	if (window.moving != null) {
		event.preventDefault()
		window.moving.x = (event.screenX - window.movingX + window.startX)
		window.moving.y = (event.screenY - window.movingY + window.startY)
		window.moving.element.style.left = window.moving.x + "px"
		window.moving.element.style.top  = window.moving.y + "px"
	}
	if (window.resizing == null) { }
	if (window.resizing != null) {
		event.preventDefault()

		window.resizingWidth  += event.movementX
		window.resizingHeight += event.movementY
		
		if (window.resizingWidth  <= 320) window.resizingWidth  = 320
		if (window.resizingHeight <= 240) window.resizingHeight = 240
		
		window.resizing.element.style.width  = window.resizingWidth  + "px"
		window.resizing.element.style.height = window.resizingHeight + "px"
	}
}

Screen.finishMouseMoveWindow = function(event) {
	if (window.moving == null) { }
	if (window.moving != null) {
		event.preventDefault()
		document.body.style.cursor = "default"
		window.moving = null
	}
	if (window.resizing == null) { }
	if (window.resizing != null) {
		event.preventDefault()
		window.resizing = null
	}
}

Screen.startFingerResizeWindow = function(event, pane) {
	if (event.changedTouches.length == 0) return

	var bound = pane.element.getBoundingClientRect()
	var distanceX = Math.abs(event.changedTouches[0].clientX - 
											bound.width  - bound.x)
	var distanceY = Math.abs(event.changedTouches[0].clientY - 
											bound.height - bound.y)
	/*
	console.log(event.changedTouches[0])
	console.log(bound)
	console.log("distanceX ", distanceX)
	console.log("distanceY ", distanceY)
	*/

	if (distanceX <= 32 && distanceY <= 32) {
		event.preventDefault()
		console.log("Window resizing by finger")
		window.resizing = pane
		window.resizingWidth  = bound.width
		window.resizingHeight = bound.height
		window.touchIdentifier = event.changedTouches[0].identifier
		window.movingX = event.changedTouches[0].screenX
		window.movingY = event.changedTouches[0].screenY
	}
}

Screen.startFingerMoveWindow = function(event, pane) {
	if (event.changedTouches.length == 0) return
	
	event.preventDefault()

	window.moving  = pane
	window.touchIdentifier = event.changedTouches[0].identifier
	window.movingX = event.changedTouches[0].screenX
	window.movingY = event.changedTouches[0].screenY

	var bound = pane.element.getBoundingClientRect()
	window.startX  = bound.x
	window.startY  = bound.y
}

Screen.continueFingerMoveWindow = function(event) {
	if (event.touches.length == 0) return
	
	if (window.moving == null) { }
	if (window.moving != null) {
		var index = -1
		for (var i = 0; i < event.touches.length; i++) {
			var current = event.touches[i].identifier
			if (current == window.touchIdentifier) {
				index = i
			}
		}
		if (index >= 0) {
			var x = (event.touches[index].screenX - 
						window.movingX + window.startX)
			var y = (event.touches[index].screenY - 
						window.movingY + window.startY)
			window.moving.element.style.top  = y + "px"
			window.moving.element.style.left = x + "px"
			// event.preventDefault()
		}
	}

	if (window.resizing == null) { }
	if (window.resizing != null) {

		var index = -1
		for (var i = 0; i < event.touches.length; i++) {
			var current = event.touches[i].identifier
			if (current == window.touchIdentifier) {
				index = i
			}
		}
		if (index >= 0) {
			window.resizingWidth  += event.touches[index].screenX -
										window.movingX
			window.resizingHeight += event.touches[index].screenY-
										window.movingY

			if (window.resizingWidth  <= 320) window.resizingWidth  = 320
			if (window.resizingHeight <= 240) window.resizingHeight = 240
			
			window.movingX = event.touches[index].screenX
			window.movingY = event.touches[index].screenY

			window.resizing.element.style.width  = window.resizingWidth  + "px"
			window.resizing.element.style.height = window.resizingHeight + "px"
			// event.preventDefault()
		}
	}
}

Screen.finishFingerMoveWindow = function(event) {
	if (window.moving == null) { }
	if (window.moving != null) {
		var index = -1
		for (var i = 0; i < event.changedTouches.length; i++) {
			var current = event.changedTouches[i].identifier
			if (current == window.touchIdentifier) {
				index = i
			}
		}
		if (index >= 0) {
			window.moving = null
			event.preventDefault()
		}
	}
	
	if (window.resizing == null) { }
	if (window.resizing != null) {
		var index = -1
		for (var i = 0; i < event.changedTouches.length; i++) {
			var current = event.changedTouches[i].identifier
			if (current == window.touchIdentifier) {
				index = i
			}
		}
		if (index >= 0) {
			window.resizing = null
			event.preventDefault()
		}
	}
}

Screen.removeWindow = function(pane) {
	var found = -1
	for (var i = 0; i < Screen.windows.length; i++) {
		if (pane.identfier = Screen.windows[i].identifier) {
			found = i
		}
	}

	if (found >= 0) {

		for (var i = found; i < Screen.windows.length; i++) {
			Screen.windows[i] = Screen[i + 1]
		}
		Screen.windows.pop()

		pane.element.style.opacity = 0
		pane.element.style.transition = "opacity .2s linear"

		setTimeout( function() {
			pane.element.style.display = "none"
			document.body.removeChild(pane.element)
		}, 200)

	}
}

Screen.activateWindow = function(pane) {
	var found = -1
	for (var i = 0; i < Screen.windows.length; i++) {
		if (pane.identfier = Screen.windows[i].identifier) {
			found = i
		}
	}

	if (found >= 0) {
		pane.layer = 1 + Screen.getActiveWindow()
		pane.element.style.zIndex = pane.layer
	}
}

Screen.enlargeWindow = function(pane) {
	pane.element.style.top    = ".75rem"
	pane.element.style.left   = ".75rem"
	pane.element.style.width  = "calc(100dvw - 2.5rem)"
	pane.element.style.height = "calc(100dvh - 2.5rem)"
}

Screen.restoreWindow = function(pane) {
	var size = Screen.getSize()
	var y = (size.height - Screen.defaultHeight) / 2
	var x = (size.width  - Screen.defaultWidth)  / 2

	pane.element.style.top    = y - 8 + "px"
	pane.element.style.left   = x - 8 + "px"
	pane.element.style.width  = Screen.defaultWidth  + "px"
	pane.element.style.height = Screen.defaultHeight + "px"
}

Screen.centerWindow = function(pane) {
	var size = Screen.getSize()
	var bound = pane.element.getBoundingClientRect()			
	var x = (size.width - bound.width)  / 2
	pane.element.style.left   = x + "px"
}

Screen.createLauncher = function() {
	Screen.windowNumber++
	var panel = { }
	panel.text = "Launcher"
	panel.maximize = true
	panel.identifier = Screen.windowNumber
	panel.layer  = 1 + Screen.getActiveWindow()

	panel.element = document.createElement("section")
	panel.element.classList.add("window")

	panel.element.style.position  = "absolute"
	panel.element.style.border    = "none"
	panel.element.style.display   = "none"
	panel.element.style.overflow  = "auto"
	panel.element.style.textAlign = "center"

	var size = Screen.getSize()
	var height = 60

	panel.element.style.top    = (size.height - height - 16) + "px"
	panel.element.style.left   = 0 + "px"
	panel.element.style.width  = size.width  + "px"
	panel.element.style.height = height + "px"

	// detail.element.style.zIndex = detail.layer
	panel.element.style.zIndex = 0

	var bar = document.createElement("section")
	bar.classList.add("launcher")
	bar.style.background = "rgba(255,255,255, .5)"
	bar.style.position = "relative"
	bar.style.display = "inline-block"
	bar.style.padding = "0 .25rem"
	bar.style.borderRadius = "1rem"
	panel.element.appendChild(bar)

	Screen.windows.push(panel)
	document.body.appendChild(panel.element)

	panel.element.style.opacity = 0
	panel.element.style.display = "block"
	panel.element.style.transition = "opacity .2s linear"
	setTimeout( e => panel.element.style.opacity = 1, 200)
	
	window.addEventListener("resize", e => {
		var size = Screen.getSize()
		panel.element.style.top    = (size.height - height - 16) + "px"
		panel.element.style.width  = size.width  + "px"
	})

	return panel
}

Screen.addElement = function(pane, element) {
	var container = pane.element.querySelector(".container")
	container.appendChild(element)
}

Screen.clearElement = function(pane) {
	var container = pane.element.querySelector(".container")
	var all = container.children
	for (var i = all.length - 1; i >= 0; i--) {
		container.removeChild(all[i])
	}
}

Screen.addStyle = function(css) {
	var style = document.createElement("style")
	style.appendChild(document.createTextNode(css))
	document.getElementsByTagName("head")
				[0].appendChild(style)
}

Screen.addMenu = function(pane, text, f) {
	var menu = document.createElement("span")
	menu.classList.add("menu-item")
	menu.innerText = text
	menu.addEventListener("click", e => {
		f(e)
	})
	menu.addEventListener("touchend", e => {
		f(e)
	})

	var bar = pane.element.querySelector(".bar")
	bar.appendChild(menu)
}

Screen.changeMenu = function(pane, current, value) {
	var list = pane.element.querySelectorAll(".menu-item")
	for (var e of list) {
		var text = e.innerText
		if (text == current) {
			e.innerText = value
		}
	}
}

document.write("<script src='/andromeda-screen.js'></script>")
document.write("<script src='/andromeda-storage.js'></script>")
document.write("<script src='/andromeda-icon.js'></script>")
document.write("<script src='/andromeda-app.js'></script>")

Screen.start()
