var App = { }

App.createFileManager = async function () {
	var main = Screen.createWindow("File Manager")

	main.showFileList = function(data) {

		data.forEach( file => {

			var fileNameItems = file.path.split("/")

			var name = document.createElement("span")
			name.style.fontFamily = "roboto-mono, monospace"
			var parts = fileNameItems[3].split("\.")
			name.innerHTML = fileNameItems[3]

			var open = document.createElement("a")
			open.style.marginRight = "1rem"
			// open.href = ""
			open.innerHTML = "Open"
			open.addEventListener("click", async event => {
				if (parts[1] == "txt") {
					await App.createTextEditor(file.number)
				}
				if (parts[1] == "memo") {
					await App.createMemoApp(file.number)
				}
			})

			var line = document.createElement("section")
			line.style.padding = "1rem"

			line.appendChild(open)
			line.appendChild(name)
			Screen.addElement(main, line)
		})

	}

	main.createFile = async function(e) {	
		var r = await Screen.createInputDialog("Enter File Name:")

		if (r == null) {
			main.refresh()
			return
		}

		if (r == "") {
			console.log("Empty file name")
			main.refresh()
			return
		}

		// from this point, r is the file name

		var location = "/service-data-create?name=" + r
		var response = await fetch(location)
		var detail   = await response.json()

		if (detail.result == "OK") {
			main.refresh()
		}
	}

	main.refresh = async function() {
		Screen.clearElement(main)

		var location = "/service-data-list"
		var response = await fetch(location)
		var detail   = await response.json()

		if (detail.result == "OK") {
			main.showFileList(detail.data)
		}
	}

	Screen.addMenu(main, "New", main.createFile)
	main.refresh()

}

App.createMemoApp = async function(file) {
	var main = Screen.createWindow("Memo")
	var originalFileName = null

	main.color = "rgba(10%, 10%, 99%, .75)"
	main.color = "rgba(10%, 70%, 50%, .90)"
	main.color = "dodgerblue"

	main.createTextArea = function() {
		var editor = document.createElement("textarea")
		editor.style.display      = "block"
		editor.style.padding      = "1.25rem 1.75rem .75rem 1.75rem"
		editor.style.margin       = "0 auto"
		editor.style.marginBottom = ".5rem"
		editor.style.border       = "none"
		editor.style.boxShadow    = "0 0 .1rem #bbb"

		editor.style.resize       = "none"
		editor.style.overflow     = "hidden"
		// editor.style.width     = "calc(100% - 1.50rem)"
		editor.style.width        = "26.5rem"
		editor.style.minHeight    = "3.5rem"
		editor.style.lineHeight   = "1.5rem"
		editor.style.color        = "#333"
		editor.style.fontSize     = "1rem"
		editor.style.fontFamily   = "roboto-mono, sarabun, monospace"
		editor.style.borderRadius = ".5rem"
		editor.style.tabSize = 4

		editor.spellcheck = false
		editor.autofocus = true
		editor.focus()
		editor.placeholder = "Text"

		Screen.addElement(main, editor)

		editor.addEventListener("keyup", e => {
			var text = editor.value
			var lines = text.split("\n")
			var result = window.getComputedStyle(editor)					
			var h = parseInt(result.lineHeight) * lines.length
			h += 12
			editor.style.height = h + "px"
		})

		editor.addEventListener("keydown", e => {
			if (e.key == "Tab") {
				e.preventDefault()
				editor.setRangeText("\t", 
					editor.selectionStart, 
					editor.selectionEnd, "end")
			}
		})

		return editor
	}

	main.createCanvas = function(empty) {
		var canvas = document.createElement("canvas")
		canvas.width  = 960
		canvas.height = 960

		// var bound = main.element.getBoundingClientRect()

		canvas.style.display      = "block"
		canvas.style.background   = "#fcfcfc"
		canvas.style.margin       = "0 auto"
		canvas.style.marginBottom = ".5rem"
		canvas.style.border       = "none"
		canvas.style.boxShadow    = "0 0 .1rem #999"
		// canvas.style.width     = "calc(100% - .125rem)"
		canvas.style.width        = (canvas.width  / 2) + "px"
		canvas.style.height       = (canvas.height / 2) + "px"
		canvas.style.borderRadius = ".5rem"
		canvas.style.touchAction  = "none"
		canvas.style.userSelect   = "none"

		Screen.addElement(main, canvas)				

		/*
		var resizeObserver = new ResizeObserver( e => {
			console.log("Resizing")
			console.log(e[0].contentRect)
			canvas.width = e[0].contentRect.width - 24
			canvas.style.width = canvas.width + "px"
		})
		resizeObserver.observe(main.element)
		*/

		var points = [ ]
		var ctx = canvas.getContext("2d")
		if (empty == true) {
			for (var x = 40; x < canvas.width; x += 40) {
				for (var y = 40; y < canvas.height; y += 40) {
					ctx.beginPath()
					ctx.arc(x, y, 4, 0, 2 * Math.PI)
					ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
					ctx.fill()
				}
			}
		}

		canvas.addEventListener
					("contextmenu", e => e.preventDefault() )

		canvas.THRESHOLD = 0.1

		canvas.addEventListener("pointerdown", 
			function handleStart(event) {
				// console.log(event)
				// console.log(event.pointerType)
				// console.log(event.pressure)

				// try event.tiltX, event.tiltY
				// try event.pressure

				// event.preventDefault()
				// event.stopPropagation()

				if (event.pointerType == "pen") {
					event.preventDefault()
					// canvas.setPointerCapture(event.pointerId)
					// var bound = canvas.getBoundingClientRect()

					if (event.pressure >= canvas.THRESHOLD) {
						var p = { }
						p.x = event.offsetX * 2
						p.y = event.offsetY * 2
						points.push(p)
				   }
				}
			})

		canvas.addEventListener("pointermove", 
			function handleMove(event) {
				// event.preventDefault()
				// event.stopPropagation()

				if (event.pointerType == "pen") {
					event.preventDefault()
					// var bound = canvas.getBoundingClientRect()
					// console.log(event)
					
					if (event.pressure >= canvas.THRESHOLD) {
						var p = { }
						p.x = event.offsetX * 2
						p.y = event.offsetY * 2
						points.push(p)
						var pressure = event.pressure
						var w = pressure

						if (pressure >= 0.0001) w = 0.00
						if (pressure >= 0.01)   w = 0.00
						if (pressure >= 0.10)   w = 2.25
						if (pressure >= 0.20)   w = 2.50
						if (pressure >= 0.30)   w = 2.75
						if (pressure >= 0.40)   w = 3.00
						if (pressure >= 0.50)   w = 3.25
						if (pressure >= 0.60)   w = 3.50
						if (pressure >= 0.70)   w = 3.75
						if (pressure >= 0.80)   w = 4.00
						if (pressure >= 0.90)   w = 4.25
						w *= 1.5
						console.log("weight " + w)

						/*
						if (pressure >= 0.10)   w = 2.25
						if (pressure >= 0.25)   w = 2.50
						if (pressure >= 0.50)   w = 2.75
						if (pressure >= 0.75)   w = 3.00
						*/

						if (points.length > 1) {
							var last = points[points.length - 2]

							ctx.beginPath()
							ctx.arc(last.x, last.y, 
								w / 2 - 0.5, 0, 2 * Math.PI)
							ctx.fillStyle = main.color
							ctx.fill()

							ctx.beginPath()
							ctx.moveTo(last.x, last.y)
							ctx.lineTo(p.x, p.y)
							ctx.lineJoin = "round"
							ctx.lineWidth = w
							ctx.strokeStyle = main.color
							ctx.stroke()

							/*
							ctx.fillStyle = main.color
							ctx.fillRect(p.x, p.y, w, w)
							ctx.fill()
							*/
						}
					}
				}
			})

		canvas.addEventListener("pointerup", 
			function handleFinish(event) {

				// event.preventDefault()
				// event.stopPropagation()

				if (event.pointerType == "pen") {
					event.preventDefault()
					// canvas.releasePointerCapture(event.pointerId)

					if (points.length == 1) {
						var p = points[0]
						var w = 4
						/*
						ctx.beginPath()
						ctx.moveTo(p.x, p.y)
						ctx.lineTo(p.x+2, p.y+2)
						ctx.lineJoin = "round"
						ctx.lineWidth = w
						ctx.strokeStyle = main.color
						ctx.stroke()
						*/
						ctx.beginPath()
						ctx.arc(p.x * 2, p.y * 2, 
								w, 0, 2 * Math.PI)
						ctx.fillStyle = main.color
						// ctx.fill()
						
						console.log("Pointing")
					}
					points = [ ]
				}

				if (window.getSelection()) {
					window.getSelection().removeAllRanges()
				}
			})

		return canvas
	}
	
	main.prepareContent = function() {
		var content = main.element.querySelectorAll(".container > *")
		// console.log(content)
		var xml = ""              // for XML
		var detail = {}           // for JSON
		detail.data = [ ]
		for (var c of content) {
			if (c.tagName == "TEXTAREA") {
				xml += "<text>\n"
				xml += c.value + "\n"
				xml += "</text>\n"

				var text = { }
				text.type = "text"
				text.data = c.value
				detail.data.push(text)
			}
			if (c.tagName == "CANVAS") {
				xml += "<photo>\n"
				xml += c.toDataURL("image/png") + "\n"
				xml += "</photo>\n"

				var item = { }
				item.type = "photo"
				item.data = c.toDataURL("image/png")
				detail.data.push(item)
			}
		}
		// console.log(detail.data)
		
		var readable = { }
		readable.data = [ ]
		for (var d of detail.data) {
			var element = { }
			element.type = d.type
			element.data = d.data
			if (d.type == "photo") {
				element.data = [ ]
				var size = 60
				var start = 0
				while (true) {
					var buffer = d.data.substring( start, start + size )
					if (buffer == "") break
					element.data.push(buffer)
					start += size
				}
			}
			readable.data.push(element)
		}
		// console.log(readable)
		
		var buffer = ""
		buffer += '{"data": [\n'
		for (var d of readable.data) {
			buffer += "{\n"
			buffer += '"type": "' + d.type + '",\n'
			if (d.type == "text") {
				buffer += '"data": "' + d.data + '"'
			}
			if (d.type == "photo") {
				buffer += '"data": [\n'

				for (var e of d.data) {
					buffer += '"' + e + '",\n'
				}
				buffer += '""]\n'
			}
			
			buffer += "},\n"
		}
		buffer += "{}\n"
		buffer += "]\n"
		buffer += "}\n"
		
		return buffer
	}

	Screen.addMenu(main, "Download", e => {
		var buffer = main.prepareContent()
		var link = document.createElement("a")
		link.download = "sample.memo"

		var data = "data:application/memo;charset=utf-8,"
		data += buffer
		link.href = data
		link.click()
	})
	
	Screen.addMenu(main, "Save", async e => {
		var data = { }
		data.number = fileNumber
		data.text = main.prepareContent()
		console.log(data)

		var location = "/service-data-update"
		var payload = { }
		payload.method = "POST"
		payload.headers = { }
		payload.headers["Content-Type"] = "application/json"
		payload.body = JSON.stringify(data)

		var response = await fetch(location, payload)
		var detail   = await response.text()

		console.log(detail)
	})

	Screen.addMenu(main, "Text", e => {
		main.createTextArea()
	})

	Screen.addMenu(main, "Canvas", e => {
		main.createCanvas(true)
	})
	
	main.display = function(detail) {
		if (detail.data == null) {
			detail.data = []
		}
		detail.data.forEach( e => {

			if (e.type == "text") {
				var t = main.createTextArea()
				t.value = e.data
				console.log("TEXT " + e.data)
			}

			if (e.type == "photo") {
				e.image = ""
				for (var line of e.data) {
					e.image += line
				}
				var c = main.createCanvas()
				var image = document.createElement("img")
				image.onload = function() {
					var ctx = c.getContext("2d")
					ctx.drawImage(image, 0, 0, 
							image.width, image.height)
				}
				image.src = e.image
			}

		})

	}
	
	var originalFileName = ""     // for local file name
	var fileNumber = 0            // for server file number

	if (file instanceof File) {
		originalFileName = file.name
		var reader = new FileReader()
		reader.onload = function() {
			var buffer = reader.result
			if (buffer == null) {
				buffer = "{}"
			}
			main.display(JSON.parse(buffer))
		}
		reader.readAsText(file)
	}
	
	if (typeof file == "number") {
		fileNumber = file
		var location = "/service-data-read?number=" + fileNumber
		var response = await fetch(location)
		var detail   = await response.json()
		console.log(detail)
		var buffer = detail.data[0].text
		
		if (buffer == null || buffer == "") {
			buffer = "{}"
		}
		main.display(JSON.parse(buffer))
	}
}

App.createTextEditor = async function(file) {
	var main = Screen.createWindow("Text Editor")

	// remove existing container
	var container = main.element.querySelector(".container")
	main.element.removeChild(container)

	// use textarea as the container
	var editor = document.createElement("textarea")
	editor.style.display    = "block"
	editor.style.padding    = ".75rem"
	editor.style.margin     = 0
	editor.style.border     = "none"
	editor.style.resize     = "none"
	editor.style.width      = "calc(100% - 1.50rem)"
	editor.style.height     = "calc(100% - 3.25rem)"
	editor.style.opacity    = 0.95
	editor.style.color      = "#333"
	editor.style.lineHeight = "1.5rem"
	editor.style.fontSize   = "1rem"
	editor.style.fontFamily = "roboto-mono, sarabun, monospace"

	editor.spellcheck = false
	setTimeout(e => editor.focus(), 200)

	editor.style.tabSize = 4
	editor.addEventListener("keydown", e => {
		if (e.key == "Tab") {
			e.preventDefault()
			editor.setRangeText("\t", 
				editor.selectionStart, 
				editor.selectionEnd, "end")
		}
	})

	var originalFileName = ""     // for local file name
	var fileNumber = 0            // for server file number

	if (file instanceof File) {
		console.log(file)
		originalFileName = file.name
		var reader = new FileReader()
		reader.onload = function() {
			editor.value = reader.result
		}
		reader.readAsText(file)
	}

	if (typeof file == "number") {
		fileNumber = file
		var location = "/service-data-read?number=" + fileNumber
		var response = await fetch(location)
		var detail   = await response.json()
		if (detail.data[0].text == null) {
			detail.data[0].text = ""
		}
		editor.value = detail.data[0].text
	}

	Screen.addMenu(main, "Download", e => {
		var text = editor.value
		text = encodeURIComponent(text)
		var data = "data:text/plain;charset=utf-8," + text

		var link = document.createElement("a")
		if (originalFileName == "") {
			originalFileName = "sample.txt"
		}
		link.download = originalFileName
		link.href = data
		link.click()
	})

	Screen.addMenu(main, "Save", async e => {
		var data = { }
		data.number = fileNumber
		data.text = editor.value

		var location = "/service-data-update"
		var payload = { }
		payload.method = "POST"
		payload.headers = { }
		payload.headers["Content-Type"] = "application/json"
		payload.body = JSON.stringify(data)

		var response = await fetch(location, payload)
		var detail   = await response.text()

		console.log(detail)
	})

	main.element.appendChild(editor)
}
