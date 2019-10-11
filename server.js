// server.js
// where your node app starts

// init project
const express = require('express')
const app = express()
require('dotenv').config()

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.
var ideaBot = require('./ideaBot')

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'))

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html')
})

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port)
})

var bodyParser = require('body-parser')
app.use(bodyParser.json())
app.post(process.env.APP_ENDPOINT, function(req, res) {
  ideaBot.newIdea(req, res)
})
