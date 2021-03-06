const fs = require('fs');
const path = require('path');
const url = require('url');
const colors = require('colors');

const options = {
  key: fs.readFileSync(path.join(__dirname, 'fake-keys', 'privatekey.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'fake-keys', 'certificate.pem'))
};

let isUseHTTPs = false;
let port = process.env.PORT || 9001; //443

process.argv.forEach(val => {if (!!val && val === '--ssl') isUseHTTPs = true;});
const server = require(isUseHTTPs ? 'https' : 'http');

function serverHandler(request, response) {

  let ip = request.headers['x-forwarded-for'] ||
    request.connection.remoteAddress ||
    request.socket.remoteAddress ||
    (request.connection.socket ? request.connection.socket.remoteAddress : null);

  // console.log(ip);

  function sendResponse(statusCode, answer, contentType = 'text/plain') {
    response.writeHead(statusCode, {'Content-Type': contentType});
    response.write(answer, 'binary');
    response.end();
  }

  try {
    let uri = url.parse(request.url).pathname,
      filename = path.join(path.resolve(__dirname), '../front/', uri);

    if (filename && filename.search(/server.js|signalingServer.js/g) !== -1) return sendResponse(404, '404 Not Found: ' + path.join('/', uri) + '\n');
    try {
      if (fs.lstatSync(filename).isDirectory())
        return sendResponse(200, '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=/index.html"></head><body></body></html>', 'text/html');
    } catch (e) {
      return sendResponse(404, '404 Not Found: ' + path.join('/', uri) + '\n');
    }

    const fnLower = path.extname(filename).toLowerCase();
    let contentType = (fnLower === '.html' ? 'text/html' : fnLower === '.css' ? 'text/css' : (fnLower === '.png' || fnLower === '.jpg') ? 'image/png' : 'text/plain');

    fs.readFile(filename, 'binary', (err, file) =>
      err ? sendResponse(500, '404 Not Found: ' + path.join('/', uri) + '\n') : sendResponse(200, file, contentType));

  } catch (e) {
    sendResponse(404, '<h1>Unexpected error:</h1><br><br>' + e.stack || e.message || JSON.stringify(e));
  }
}

let app = isUseHTTPs ? server.createServer(options, serverHandler) : server.createServer(serverHandler);

function runServer() {
  app.on('error', err => {
    if (err.code === 'EADDRINUSE') {
      const socketURL = (isUseHTTPs ? 'https' : 'http') + '://' + err.address + ':' + err.port + '/';
      console.log(`Unable to listen on port: ${err.port}\n ${socketURL} is already in use. Please kill below processes using "kill -9 PID".\n\n`.bgRed);
    }
  });

  app = app.listen(port, process.env.IP || '0.0.0.0', error => {
    const addr = app.address();
    if (addr.address === '0.0.0.0') addr.address = 'localhost';

    var domainURL = (isUseHTTPs ? 'https' : 'http') + '://' + addr.address + ':' + addr.port + '/';

    console.log('------------------------------\nsocket.io is listening at:');
    console.log(`\t${domainURL} \n------------------------------`.green);
  });


  require('./signalingServer.js')(app, socket => {
    try {
      const params = socket.handshake.query;
      if (!params.socketCustomEvent) params.socketCustomEvent = 'custom-message';

      socket.on(params.socketCustomEvent, message => {
        console.log(`message ${JSON.stringify(message)}`.yellow);

        try {
          console.log(`socket.broadcast ${socket.broadcast}\n\n`);
          socket.broadcast.emit(params.socketCustomEvent, message);
        } catch (e) {
          console.log(`Error: ${e}`.bgRed);
        }
      });
    } catch (e) {
      console.log(`Error: ${e}`.bgRed);
    }
  });
}

runServer();
