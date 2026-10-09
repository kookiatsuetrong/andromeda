
// mouse click  --> pointerdown, mousedown
// finger touch --> pointerdown, mousedown, touchstart
// pen tap      --> pointerdown, mousedown, touchstart

// mousedown     mousemove     mouseup         dblclick
// touchstart    touchmove     touchend        (no)
// pointerdown   pointermove   pointerup       (no)

var Screen = { }

Screen.apps = [ ]
Screen.workers = { }
Screen.windows = [ ]
Screen.windowNumber = 0

Screen.getSize = function() {
	var result    = { }
	result.width  = window.innerWidth
	result.height = window.innerHeight
	return result
}

Screen.start = async function() {

	console.log("Starting Operating System")

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

	var fonts = [ 
		{name: "open-sans",   url: "/fonts/OpenSans-Regular.ttf"   },
		{name: "sarabun",     url: "/fonts/Sarabun-Regular.ttf"    },
		{name: "roboto-mono", url: "/fonts/RobotoMono-Regular.ttf" }
	]
	
	fonts.forEach( e => {
		var f = new FontFace(e.name,
							"url(" + e.url + ")"
							)
		f.load().then( () => {
			console.log("adding font " + f.family)
			console.log(f)
			document.fonts.add(f)
		})
	})
	
	document.body.style.fontFamily = "open-sans, sarabun, " +
									"sans-serif, " +
									"roboto-mono"

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
			background: #ddd;
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
	`

	var style = document.createElement("style")
	style.appendChild(document.createTextNode(css))
	document.getElementsByTagName("head")
				[0].appendChild(style)

	Screen.createLauncher()
	
	window.addEventListener("drop", async e => {
		e.preventDefault()
		console.log(e)
		
		var files = [...e.dataTransfer.items]
					.map( item => item.getAsFile() )
					// .filter( item => item )
		console.log(files)
		
		files.forEach( f => {
			Screen.startAppByDataType(f.type, f)
		})

	})
	
	window.addEventListener("dragover", e => e.preventDefault() )
}

Screen.setDataType = function(name, mime) {
	Screen.workers[mime] = name
}

Screen.setExtension = function(name, extension) {
	Screen.workers[extension] = name
}

Screen.defaultWidth  = 600
Screen.defaultHeight = 400

Screen.registerApp = function(name, f) {

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
		bar.appendChild(element)

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

Screen.startAppByDataType = function(mime, data) {
	
	// 1. try to find the MIME file type (e.g. text/plain)
	var name = Screen.workers[mime]
	
	if (name == null) {
		// 2. try to find by file extension (e.g. .memo)
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

Screen.setIcon = function(name, icon) {
	
	// find the launcher
	var index = -1
	for (var i = 0; i < Screen.windows.length; i++) {
		if (Screen.windows[i].text == "Launcher") {
			index = i
		}
	}
	
	if (index >= 0) {
		var bar = Screen.windows[index].element.
						querySelector(".launcher")
		var element = bar.querySelector("[data-app-name='" + name + "']")
		
		var current = element.querySelector("img")
		element.removeChild(current)
		
		var item = document.createElement("img")
		item.src = icon
		element.appendChild(item)
	}
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

Screen.createDialog = function(text) {
	Screen.windowNumber++
	var page = { }
	page.text = text
	page.maximize = true
	page.identifier = Screen.windowNumber
	page.layer  = 1 + Screen.getActiveWindow()

	var size = Screen.getSize()

	page.element = document.createElement("section")
	page.element.classList.add("window")
	page.element.style.top    = 0 + "px"
	page.element.style.left   = 0 + "px"
	page.element.style.width  = size.width  + "px"
	page.element.style.height = size.height + "px"
	page.element.style.position = "absolute"
	page.element.style.background = "rgba(0,0,0, .66)"
	page.element.style.zIndex = page.layer

	var dialog = document.createElement("section")
	dialog.classList.add("dialog")

	dialog.style.position   = "absolute"
	dialog.style.background = "none"
	dialog.style.borderRadius = "1.5rem"
	dialog.style.border = ".5rem solid rgba(0, 0, 0, .01)"
	dialog.style.boxShadow = "0 0 .1rem rgba(0,0,0, .25)" +
							", 0 0 4rem rgba(255,255,255, .8)"
	dialog.style.color     = "#333"
	dialog.style.display   = "block"
	dialog.style.overflow  = "auto"
	
	var width  = 400
	var height = 240
	
	if (width  > size.width  - 32) {
		width  = size.width  - 64
	}
	
	if (height > size.height - 32) {
		height = size.height - 64
	}
	
	var x = (size.width  - width  - 16) / 2
	var y = (size.height - height - 16) / 2
	y = 80

	dialog.style.top    = y + "px"
	dialog.style.left   = x + "px"
	dialog.style.width  = width  + "px"
	dialog.style.height = height + "px"

	var container = document.createElement("section")
	container.classList.add("container")
	container.style.background = "rgba(255, 255, 255, 1)"
	container.style.height = "calc(100% - 5.85rem)"
	container.style.padding = ".75rem"
	container.innerHTML = text
	dialog.appendChild(container)

	var panel = document.createElement("section")
	panel.classList.add("button-bar")
	panel.style.background = "rgba(234, 234, 234, 1)"
	panel.style.padding = "1rem"
	panel.style.textAlign = "right"

	var okButton = document.createElement("button")
	okButton.innerText = "OK"
	okButton.style.marginLeft = ".75rem"
	panel.appendChild(okButton)

	var cancelButton = document.createElement("button")
	cancelButton.innerText = "Cancel"
	cancelButton.style.marginLeft = ".75rem"
	panel.appendChild(cancelButton)

	dialog.appendChild(panel)

	page.element.appendChild(dialog)
	Screen.windows.push(page)
	document.body.appendChild(page.element)

	var p = new Promise( (resolve, reject) => {

		/*
		dialog.addEventListener("click", e => {
			e.stopPropagation()
		})

		detail.element.addEventListener("click", e => {
			Screen.removeWindow(detail)
			resolve(false)
		})
		*/

		okButton.addEventListener("click", e => {
			e.stopPropagation()
			Screen.removeWindow(page)
			resolve(true)
		})

		cancelButton.addEventListener("click", e => {
			e.stopPropagation()
			Screen.removeWindow(page)
			resolve(false)
		})

	})

	return p
}

Screen.createWindow = function(text) {
	Screen.windowNumber++
	var detail = { }
	detail.text = text
	detail.identifier = Screen.windowNumber
	detail.layer  = 1 + Screen.getActiveWindow()

	detail.element = document.createElement("section")
	detail.element.classList.add("window")

	detail.element.style.position   = "absolute"
	detail.element.style.background = "none"
	detail.element.style.borderRadius = "1.5rem"
	detail.element.style.border = ".5rem solid rgba(0, 0, 0, .05)"
	detail.element.style.boxShadow = "0 0 .1rem rgba(0,0,0,.25)" +
							", 0 0 4rem rgba(255, 255, 255, .8)"
	detail.element.style.color     = "#333"
	detail.element.style.display   = "none"
	
	detail.element.style.overflow  = "hidden"
	/*
	detail.element.style.scrollbarColor =   "rgba(  0,  0,  0, 0.5) " +
											"rgba(255,255,255, 0.1)"
	detail.element.style.scrollbarWidth = "thin"
	*/
	
	var size = Screen.getSize()
	
	if (Screen.defaultWidth  > size.width  - 32) {
		Screen.defaultWidth  = size.width  - 64
	}
	
	if (Screen.defaultHeight > size.height - 32) {
		Screen.defaultHeight = size.height - 64
	}
	
	detail.x = (size.width  - Screen.defaultWidth  - 16) / 2
	detail.y = (size.height - Screen.defaultHeight - 16) / 2
	detail.width  = Screen.defaultWidth
	detail.height = Screen.defaultHeight

	detail.element.style.top    = detail.y + "px"
	detail.element.style.left   = detail.x + "px"
	detail.element.style.width  = detail.width  + "px"
	detail.element.style.height = detail.height + "px"

	detail.element.style.zIndex = detail.layer
	
	var bar = document.createElement("section")
	bar.classList.add("bar")
	bar.style.background = "rgba(255, 255, 255, .80)"
	bar.style.padding = ".25rem 0 .5rem .6rem"
	bar.style.margin = "0"
	bar.style.fontSize = "1.1rem"
	bar.innerText = text
	detail.element.appendChild(bar)

	var closeButton = document.createElement("img")
	closeButton.addEventListener("click", 
								e => Screen.removeWindow(detail))
	closeButton.addEventListener("touchend", 
								e => Screen.removeWindow(detail))
	closeButton.src = Icon.closeIcon
	closeButton.style.margin = "-.1rem .5rem 0 1rem"
	closeButton.style.float  = "right"
	bar.appendChild(closeButton)

	var maximizeButton = document.createElement("img")
	maximizeButton.addEventListener("click", 
								e => Screen.enlargeWindow(detail))
	maximizeButton.addEventListener("touchend", 
								e => Screen.enlargeWindow(detail))
								
	maximizeButton.src = Icon.enlargeIcon
	maximizeButton.style.margin = "-.1rem 0 0 1rem"
	maximizeButton.style.float  = "right"
	bar.appendChild(maximizeButton)

	var restoreButton = document.createElement("img")
	restoreButton.addEventListener("click", 
								e => Screen.restoreWindow(detail))
	restoreButton.addEventListener("touchend", 
								e => Screen.restoreWindow(detail))
	restoreButton.src = Icon.restoreIcon
	restoreButton.style.margin = "-.1rem 0 0 1rem"
	restoreButton.style.float  = "right"
	bar.appendChild(restoreButton)
	
	var container = document.createElement("section")
	container.classList.add("container")
	container.style.background = "rgba(255, 255, 255, .9)"
	container.style.minHeight = "calc(100% - 3.55rem)"
	container.style.height = "calc(100% - 3.555rem)"
	container.style.padding = ".75rem"
	container.style.overflow  = "auto"
	/*
	container.style.scrollbarColor =   "rgba(  0,  0,  0, 0.5) " +
										"rgba(255,255,255, 0.1)"
	container.style.scrollbarWidth = "thin"
	*/
	detail.element.appendChild(container)

	Screen.windows.push(detail)
	document.body.appendChild(detail.element)

	detail.element.style.opacity = 0
	detail.element.style.display = "block"
	detail.element.style.transition = "opacity .2s linear"
	setTimeout( e => {
		detail.element.style.opacity = 1
	}, 200)

	detail.element.addEventListener("mousedown", 
						e => Screen.startMouseResizeWindow(e, detail))
	detail.element.addEventListener("touchstart", 
						e => Screen.startFingerResizeWindow(e, detail))

	bar.addEventListener("mousedown", 
						e => Screen.activateWindow(detail))
	bar.addEventListener("touchstart",
						e => Screen.activateWindow(detail))
	
	bar.addEventListener("mousedown",
						e => Screen.startMouseMoveWindow(e, detail))
	bar.addEventListener("touchstart",
						e => Screen.startFingerMoveWindow(e, detail))
	
	return detail
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
	setTimeout( e => {
		panel.element.style.opacity = 1
	}, 200)
	
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

Screen.start()

var Icon = { }

Icon.enlargeIcon = "data:image/svg+xml," + 
		encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg"
			width="24" height="24" 
			viewBox="0 0 24 24" fill="none" stroke="#888" 
			stroke-width="2" stroke-linecap="round"
			stroke-linejoin="round">
			<path d="M7 17l9.2-9.2M17 17V7H7"/>
		</svg>`)


Icon.restoreIcon = "data:image/svg+xml," + 
		encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg"
			width="24" height="24" 
			viewBox="0 0 24 24" fill="none" stroke="#888" 
			stroke-width="2" stroke-linecap="round" 
			stroke-linejoin="round">
			<path d="M17 7l-9.2 9.2M7 7v10h10"/>
		</svg>`)

Icon.checkIcon = "data:image/svg+xml," + 
		encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" 
			width="24" height="24" 
			viewBox="0 0 24 24" fill="none" stroke="#888" 
			stroke-width="2" stroke-linecap="round" 
			stroke-linejoin="round">
			<polyline points="20 6 9 17 4 12"></polyline>
		</svg>`)

Icon.moveIcon = "data:image/svg+xml," + 
		encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" 
			width="24" height="24" 
			viewBox="0 0 24 24" fill="none" stroke="#888"
			stroke-width="2" stroke-linecap="round" 
			stroke-linejoin="round">
			<path d="M5.2 9l-3 3 3 3M9 5.2l3-3 3 
				3M15 18.9l-3 3-3-3M18.9 9l3 3-3 
				3M3.3 12h17.4M12 3.2v17.6" />
		</svg>`)

Icon.closeIcon = "data:image/svg+xml," + 
		encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" 
			width="24" height="24" 
			viewBox="0 0 24 24" fill="none" stroke="#888" 
			stroke-width="2" stroke-linecap="round" 
			stroke-linejoin="round">
			<line x1="18" y1="6" x2="6" y2="18" />
			<line x1="6" y1="6" x2="18" y2="18" />
		</svg>`)

Icon.documentIcon = "data:image/svg+xml," + 
		encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" 
			width="24" height="24" 
			viewBox="0 0 24 24" fill="none" stroke="#888" 
			stroke-width="2" stroke-linecap="round" 
			stroke-linejoin="round">
			<path d="M14 2H6a2 2 0 0 0-2 2v16c0 
				1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
			<path d="M14 3v5h5M16 13H8M16 17H8M10 9H8" />
		</svg>`)

Icon.photoIcon = "data:image/svg+xml," + 
		encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" 
			width="24" height="24" 
			viewBox="0 0 24 24" fill="none" stroke="#888" 
			stroke-width="2" stroke-linecap="round" 
			stroke-linejoin="round">
			<rect x="3" y="3" width="18" height="18" rx="2" />
			<circle cx="8.5" cy="8.5" r="1.5" />
			<path d="M20.4 14.5L16 10 4 20" />
		</svg>`)

Icon.signalIcon = "data:image/svg+xml," + 
		encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" 
			width="24" height="24" 
			viewBox="0 0 24 24" fill="none" stroke="#888" 
			stroke-width="2" stroke-linecap="round" 
			stroke-linejoin="round">
			<path d="M2 16.1A5 5 0 0 1 5.9 20M2 
				12.05A9 9 0 0 1 9.95 20M2 8V6a2 
				2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 
				2 0 0 1-2 2h-6" />
			<line x1="2" y1="20" x2="2.01" y2="20" />

		</svg>`)

Icon.appIcon = "data:image/svg+xml," + 
		encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" 
			width="24" height="24" 
			viewBox="0 0 24 24" fill="none" stroke="#888" 
			stroke-width="2" stroke-linecap="round" 
			stroke-linejoin="round">
			<rect x="3" y="3" width="18" height="18" rx="2" />
			<path d="M3 9h18" />
		</svg>`)

Icon.resizeIcon = "data:image/svg+xml," + 
		encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" 
			width="24" height="24" 
			viewBox="0 0 24 24" fill="none" stroke="#888" 
			stroke-width="2" stroke-linecap="round" 
			stroke-linejoin="round">
			<path d="M7 7l9.2 9.2M17 7v10H7" />
		</svg>`)

Icon.drawingIcon = "data:image/svg+xml," + 
		encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" 
			width="24" height="24" 
			viewBox="0 0 24 24" fill="none" stroke="#888" 
			stroke-width="2" stroke-linecap="round" 
			stroke-linejoin="round">
			<path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 
				2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
			<polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
		</svg>`)
