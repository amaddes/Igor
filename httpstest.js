var https = require('https');
var fs = require('fs');

var httpsOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/butlerigor.ru/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/butlerigor.ru/cert.pem')
};

var app = function (req, res) {
  res.writeHead(200);
  res.end("hello world\n");
}

https.createServer(httpsOptions, app).listen(4433);
