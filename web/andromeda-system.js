var System = { }

System.getCurrentUser = async function() {
	var location = "/service-me"
	var response = await fetch(location)
	var detail   = await response.json()
	console.log(detail)
	return detail
}
