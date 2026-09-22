var express = require("express")
var server  = express()
server.listen(7701)
server.use(express.static("web"))
