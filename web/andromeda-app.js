var App = { }

App.createFileManager = async function () {
	var main = Screen.createWindow("File Manager")
	main.element.style.width = "20rem"

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
				Screen.openFile(parts[1], file.number)
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
		var detail = await Storage.create(r)
		if (detail.result == "OK") {
			main.refresh()
		}
	}

	main.refresh = async function() {
		Screen.clearElement(main)
		var detail = await Storage.list()
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

	main.color = "rgba(10%, 50%, 99%, .90)"
	// main.color = "rgba(10%, 70%, 50%, .90)"
	// main.color = "dodgerblue"

	main.createTextArea = function(text) {
		var editor = document.createElement("textarea")
		editor.style.display      = "block"
		editor.style.padding      = "1.25rem 1.75rem .5rem 1.75rem"
		editor.style.margin       = "0 auto"
		editor.style.marginBottom = ".5rem"
		editor.style.border       = "none"
		editor.style.boxShadow    = "0 0 .1rem #bbb"

		editor.style.resize       = "none"
		editor.style.overflow     = "hidden"
		// editor.style.width     = "calc(100% - 1.50rem)"
		editor.style.width        = "26.5rem"
		editor.style.minHeight    = "2rem"
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

		if (text == null) text = ""
		var lines = text.split("\n")
		editor.style.height = lines.length * 1.5 + .8 + "rem"
		editor.value = text
		

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
	
	main.canvasWidth  = 960
	main.canvasHeight = 480
	
	main.dotColor = "#eee"
	main.dotSpace = 40
	
	main.distance = function(p, q) {
		var dx = p.x - q.x
		var dy = p.y - q.y
		return Math.sqrt( dx * dx + dy * dy )
	}
	
	main.createCanvas = function(empty) {
		var canvas = document.createElement("canvas")
		canvas.width  = main.canvasWidth
		canvas.height = main.canvasHeight
		// var bound = main.element.getBoundingClientRect()

		// create the real canvas
		canvas.style.display      = "block"
		canvas.style.background   = "#ffffff"
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
			var space = main.dotSpace
			for (var x = space; x < canvas.width; x += space) {
				for (var y = space; y < canvas.height; y += space) {
					ctx.beginPath()
					ctx.arc(x, y, 4, 0, 2 * Math.PI)
					ctx.fillStyle = main.dotColor
					ctx.fill()
				}
			}
		}

		canvas.addEventListener
					("contextmenu", e => e.preventDefault() )

		canvas.THRESHOLD = 0.1
		canvas.dots = [ ]
		
		canvas.addEventListener("click", e => {
			console.log("click")
			console.log(e) 
		})
		
		canvas.addEventListener("auxclick", e => {
			console.log("auxclick")
			console.log(e) 
		})

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
						var w = event.pressure

						if (event.pressure >= 0.0001) w = 0.00
						if (event.pressure >= 0.01)   w = 0.00
						if (event.pressure >= 0.10)   w = 2.00
						if (event.pressure >= 0.20)   w = 2.25
						if (event.pressure >= 0.30)   w = 2.50
						if (event.pressure >= 0.40)   w = 2.75
						if (event.pressure >= 0.50)   w = 3.00
						if (event.pressure >= 0.60)   w = 3.25
						if (event.pressure >= 0.70)   w = 3.50
						if (event.pressure >= 0.80)   w = 3.75
						if (event.pressure >= 0.90)   w = 4.00
						w *= 1.5
						// console.log("weight " + w)

						if (main.tool == "pen" && points.length > 1) {
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
						}
						
						if (main.tool == "eraser" && points.length > 1) {
							var w = 16
							/*
							ctx.beginPath()
							ctx.clearRect(
									p.x - w / 2, 
									p.y - w / 2, 
									w, w)
							*/
						   
							ctx.globalCompositeOperation = 
													'destination-out'
							ctx.beginPath()
							ctx.arc(p.x, p.y, w, 0, 2 * Math.PI)
							ctx.fill()
							ctx.globalCompositeOperation = 
											'source-over'

							var fx = parseInt(p.x / main.dotSpace)
							var fy = parseInt(p.y / main.dotSpace)
							
							var dx = p.x % main.dotSpace
							var dy = p.y % main.dotSpace
							if (dx > main.dotSpace / 2) fx++
							if (dy > main.dotSpace / 2) fy++
							
							var q = {x: fx * main.dotSpace,
									y:  fy * main.dotSpace}
							if (main.distance(p, q) <= w + 4) {
								canvas.dots.push(q)
							}

							for (var r of canvas.dots) {
								if (0 < r.x && r.x < canvas.width &&
									0 < r.y && r.y < canvas.height) {
									/*
									ctx.beginPath()
									ctx.clearRect(r.x - 4, r.y - 4, 8, 8)
									*/
									
									ctx.globalCompositeOperation = 
													'destination-out'
									ctx.beginPath()
									ctx.arc(r.x, r.y, 6, 0, 2 * Math.PI)
									ctx.fill()
									ctx.globalCompositeOperation = 
													'source-over'
									
									ctx.beginPath()
									ctx.arc(r.x, r.y, 4, 0, 2 * Math.PI)
									ctx.fillStyle = main.dotColor
									ctx.fill()
								}
							}
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
					// console.log("handleFinish()")
					
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
						/*
						ctx.beginPath()
						ctx.arc(p.x * 2, p.y * 2, 
								w, 0, 2 * Math.PI)
						ctx.fillStyle = main.color
						// ctx.fill()
						*/
						console.log("Pointing")
					}
					points = [ ]
					canvas.dots = [ ]
				}

				if (window.getSelection()) {
					window.getSelection().removeAllRanges()
				}
			})

		return canvas
	}
	
	main.encode = function(text) {
		var buffer = text
		buffer = buffer.replaceAll('"',  '\\"')
		buffer = buffer.replaceAll('\n', "\\n")
		buffer = buffer.replaceAll('\r', "\\r")
		buffer = buffer.replaceAll('\t', "\\t")
		return buffer
	}
	
	main.decode = function(text) {
		var buffer = text;
		buffer = buffer.replaceAll('\\"', '"')
		buffer = buffer.replaceAll("\\n", '\n')
		buffer = buffer.replaceAll("\\r", '\r')
		buffer = buffer.replaceAll("\\t", '\t')
		return buffer
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
			
			if (d.type == "text") {
				// create array of 60 characters per item
				// var encoded = encodeURIComponent(d.data)
				var encoded = main.encode(d.data)
				element.data = [ ]
				var size = 60
				var start = 0
				while (true) {
					var buffer = encoded.substring( start, start + size )
					if (buffer == "") break
					element.data.push(buffer)
					start += size
				}
			}
			
			if (d.type == "photo") {
				// create array of 60 characters per item
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
				buffer += '"data": [\n'
				for (var e of d.data) {
					buffer += '"' + e + '",\n'
				}
				buffer += '""]\n'
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
		await Storage.update(data)
	})
	
	main.display = function(detail) {
		if (detail.data == null) {
			detail.data = []
		}
		detail.data.forEach( e => {

			if (e.type == "text") {
				var buffer = ""
				for (var s of e.data) {
					buffer += s
				}
				// t.value = decodeURIComponent(buffer)
				var text = main.decode(buffer)
				main.createTextArea(text)
			}

			if (e.type == "photo") {
				e.image = ""
				for (var line of e.data) {
					e.image += line
				}
				var c = main.createCanvas()
				var image = document.createElement("img")
				image.onload = function() {
					var fixedWidth = 480
					var ratio = fixedWidth / image.width
					
					c.width = image.width
					c.height = image.height
					
					c.style.width  = fixedWidth + "px"
					c.style.height = image.height * ratio + "px"

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
		fileNumber = +file || 0
		var detail = await Storage.read(fileNumber)
		console.log(detail)
		var buffer = detail.data[0].text
		if (buffer == null || buffer == "") {
			buffer = "{}"
		}
		// console.log("The buffer is ")
		// console.log(buffer)
		main.display(JSON.parse(buffer))
	}
	
	Screen.addMenu(main, "Text", e => {
		main.createTextArea()
	})

	Screen.addMenu(main, "Canvas", e => {
		main.createCanvas(true)
	})
	
	main.tool = "pen"
	
	Screen.addMenu(main, "Eraser", e => {
		var current = main.tool
		if (current == "pen") {
			main.tool = "eraser"
			Screen.changeMenu(main, "Eraser", "Pen")
		}
		if (current == "eraser") {
			main.tool = "pen"
			Screen.changeMenu(main, "Pen", "Eraser")
		}
	})

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
		fileNumber = +file || 0
		var detail = await Storage.read(fileNumber)
		
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

		var detail = Storage.update(data)
		console.log(detail)
	})

	main.element.appendChild(editor)
}
