# andromeda
Andromeda operating system for web browser.

A simple program.

```javascript

function createEmptyApp() {
	var main = Screen.createWindow("Minimal")
}	

Screen.registerApp("Empty", e => createEmptyApp())

```

![](minimal.png)


Writing photo viewer.

```javascript

async function createPhotoViewer() {
	var viewer = Screen.createWindow("Photo Viewer")

	var image = document.createElement("img")
	image.src = "/sample-photo.jpg"
	image.style.display = "block"
	image.style.width   = "100%"

	var container = viewer.element.querySelector(".container")
	container.style.padding = 0
	Screen.addElement(viewer, image)
}

Screen.registerApp("Photo View", e => createPhotoViewer())

```

![](viewer.png)





