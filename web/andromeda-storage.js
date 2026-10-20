
Storage = { }

Storage.data = [ ]

Storage.random = function() {
	var size = 20
	var buffer = ""
	for (var i = 0; i < size; i++) {
		var r = Math.random() * 10
		var digit = parseInt(r)
		buffer += "" + digit
	}
	return buffer
}

Storage.create = async function(name) {
	var location = "/service-data-create?name=" + name
	var response = await fetch(location)
	var detail   = await response.json()
	return async
}

Storage.update = async function(data) {
	
	// data must be in the following format:
	// data.number = the unique number of this data file
	// data.text   = the data in text or json
	
	var location = "/service-data-update"
	var payload = { }
	payload.method = "POST"
	payload.headers = { }
	payload.headers["Content-Type"] = "application/json"
	payload.body = JSON.stringify(data)

	var response = await fetch(location, payload)
	var detail   = await response.text()

	console.log(detail)
}

Storage.read = async function(number) {
	var location = "/service-data-read?number=" + number
	var response = await fetch(location)
	var detail   = await response.json()
	return detail
}

Storage.list = async function() {
	var location = "/service-data-list"
	var response = await fetch(location)
	var detail   = await response.json()
	return detail
}

// Not ready to use
Storage.search = function() {
	return Storage.data
}

// Not ready to use
Storage.insert = function(detail) {
	// detail.identifier = Storage.random()
}

// Not ready to use
Storage.delete = function(detail) {
	
}

