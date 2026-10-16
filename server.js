var express = require("express")
var server  = express()
server.listen(7701)
server.use(express.static("web"))
server.use(showError)

function showError(request, response) {
	var detail = { }
	detail.result = "ERROR"
	detail.reason = "Unsupported"
	response.send(detail)
}