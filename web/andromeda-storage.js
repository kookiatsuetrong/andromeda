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

Storage.search = function() {
	return Storage.data
}

Storage.insert = function(detail) {
	detail.identifier = Storage.random()
	Storage.data.push(detail)
}

Storage.update = function(detail) {
	
}

Storage.delete = function(detail) {
	
}

