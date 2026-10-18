
Screen.createInputDialog = function(text) {
	Screen.windowNumber++
	var page = { }
	page.text = text
	page.maximize = true
	page.identifier = Screen.windowNumber
	page.layer  = 1 + Screen.getActiveWindow()

	var size = Screen.getSize()

	page.element = document.createElement("section")
	page.element.classList.add("window")
	page.element.classList.add("backdrop")
	page.element.style.zIndex = page.layer

	var dialog = document.createElement("section")
	dialog.classList.add("dialog")
	
	var width  = 400
	var height = 160
	
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
	// container.style.height = "calc(100% - 5.85rem)"
	container.style.height = "calc(100% - 5.85rem)"
	container.style.padding = ".75rem"
	container.innerHTML = text
	dialog.appendChild(container)
	
	var input = document.createElement("input")
	input.style.width = "calc(100% - 1.75rem)"
	input.style.border = ".05rem solid #bbb"
	input.style.borderRadius = ".5rem"
	input.style.padding = ".5rem .75rem"
	input.style.marginTop = ".5rem"
	input.style.display = "block"
	input.placeholder = "File Name"
	container.appendChild(input)
	
	setTimeout( e => input.focus(), 250)

	var panel = document.createElement("section")
	panel.classList.add("button-bar")
	panel.style.background = "rgba(240, 240, 240, .9)"
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

		okButton.addEventListener("click", e => {
			e.stopPropagation()
			Screen.removeWindow(page)
			resolve(input.value)
		})

		cancelButton.addEventListener("click", e => {
			e.stopPropagation()
			Screen.removeWindow(page)
			resolve(null)
		})

	})

	return p
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
	detail.element.style.border = ".5rem solid rgba(0, 0, 0, .001)"
	detail.element.style.boxShadow = "0 0 .1rem rgba(0,0,0, .2)" +
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
	bar.style.backdropFilter = "blur(2px)"
	bar.style.background = "rgba(255, 255, 255, .40)"
	// bar.style.background = "rgba(255, 255, 255, 1)"
	bar.style.padding = ".275rem 0 .475rem .6rem"
	bar.style.margin = "0 0 -0.1rem 0"
	bar.style.fontSize = "1.1rem"
	bar.innerText = text
	detail.element.appendChild(bar)

	var closeButton = document.createElement("img")
	closeButton.addEventListener("click", 
								e => Screen.removeWindow(detail))
	closeButton.addEventListener("touchend", 
								e => Screen.removeWindow(detail))
	closeButton.src = Icon.closeIcon
	closeButton.style.margin = "-0.1rem .5rem 0 1rem"
	closeButton.style.float  = "right"
	bar.appendChild(closeButton)

	var maximizeButton = document.createElement("img")
	maximizeButton.addEventListener("click", 
								e => Screen.enlargeWindow(detail))
	maximizeButton.addEventListener("touchend", 
								e => Screen.enlargeWindow(detail))
								
	maximizeButton.src = Icon.enlargeIcon
	maximizeButton.style.margin = "-0.1rem 0 0 1rem"
	maximizeButton.style.float  = "right"
	bar.appendChild(maximizeButton)

	var restoreButton = document.createElement("img")
	restoreButton.addEventListener("click", 
								e => Screen.restoreWindow(detail))
	restoreButton.addEventListener("touchend", 
								e => Screen.restoreWindow(detail))
	restoreButton.src = Icon.restoreIcon
	restoreButton.style.margin = "-0.1rem 0 0 1rem"
	restoreButton.style.float  = "right"
	bar.appendChild(restoreButton)
	
	var container = document.createElement("section")
	container.classList.add("container")
	// container.style.background = "rgba(255, 255, 255, .9)"
	container.style.background = "rgba(255, 255, 255, 1)"
	// container.style.minHeight  = "calc(100% - 3.0rem)"
	container.style.height     = "calc(100% - 3.25rem)"
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

