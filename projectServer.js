const express = require("express")
const http = require("http")
const fs = require("fs")
const port = 8080
const app = express();

const server = http.createServer(function(req, res) {
	res.sendFile("worldMap/worldMap.html", {"Content-Type": "text/html"})
})

var options = {
  key: fs.readFileSync(config.paths.certificate.key),
  cert: fs.readFileSync(config.paths.certificate.crt),
  requestCert: false,
  rejectUnauthorized: false
};

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS, POST, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Accept, Access-Control-Allow-Headers, Access-Control-Request-Headers, Access-Control-Request-Method, Authorization, Content-Type, Origin, X-Requested-With");
  next();
});

app.get('/favicon.ico', function(req, res) {
  res.status(404).send('No favicon found');
});

app.get('/:id', function(req, res, next) {
  id = req.params.id;

  if (id.search(/\w+\.[A-z]+$/g) < 0) {
    webId = id;
    res.sendFile('index.html', {root: config.paths.webs + id});
  } else {
    res.sendFile(id, {root: config.paths.webs});
  }
});

app.get('/:folder/:file', function(req, res) {
  let folder = req.params.folder;
  let file = req.params.file;

  res.sendFile(file, {root: config.paths.webs + webId + '/' + folder});
});


app.get('*', (request, response) => {
  response.send('GET request not found: ' + request.url);
});


app.use((err, request, response, next) => {
  response.status(500).send(err.message);
});

https.createServer(options, app).listen(443, function() {
  console.clear();
  console.log("NodeJS secure server started at port 443");
});