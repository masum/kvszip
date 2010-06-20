require 'couchlib'

server = Couch::Server.new("localhost","5984")
res = server.get("/")
p res.body



doc = <<-JSON
{"key":"ddd","value":"ccc"}
JSON
doc = {}
doc["a"] = "a"
res = server.post("/adr",doc)
p res.body
