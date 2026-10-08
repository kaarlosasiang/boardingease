const http = require('node:http')

const hostname = "localhost";
const port = 4000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-type", "text/plain");
  res.end("Hello World!");
});

server.listen(port, hostname, () =>
  console.log(`server running on http://${hostname}:${port}/`),
);

