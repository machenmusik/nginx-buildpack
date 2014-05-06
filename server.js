/*
require('log-timestamp')('[%s] %s', function() {
  return new Date().toJSON();
});
*/

var http = require('http');
var fs = require('fs');
var env = {};

try { 
    env = JSON.parse(fs.readFileSync('/home/dotcloud/environment.json', 'utf-8')); 
    console.log("running on Dotcloud");
}
catch (err) {
    console.log("not running on Dotcloud"); // assume we're not dotcloud. // console.log(err);
}

var config = { 
    // external facing service host
    "host":env['DOTCLOUD_WWW_HTTP_HOST'] || process.env.HOST || "localhost",
    // actual listening host
    "listenhost":"0.0.0.0",
    // external facing service port
    "port":80,
    // actual listening port
    "listenport": env['PORT_WWW'] || process.env.PORT, 
};

function orelse(value, elsevalue) { return (typeof value === 'undefined') ? elsevalue : value; }

var listenhost = orelse(config.listenhost, config.host);
var listenport = orelse(config.listenport, config.port);

// okay, now that we've declared the app server, start it up and say so

var server = http.createServer(function(req,res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hi\n');
});

server.listen(listenport, listenhost);
console.info("ok, " + config.host + ":" + config.port + " listening on " + listenhost + ":" + listenport); 
console.info(JSON.stringify(process.env));

fs.open('/tmp/app-initialized', 'w', function(err,fd) { fs.close(fd); });

// this code is to keep the app from hibernating e.g. when running on Heroku
    
function startKeepAlive() {
    setInterval(function() {
        var options = {
            host: config.host,
            port: config.port,
            path: '/'
        };
        http.get(options, function(res) {
            res.on('data', function(chunk) {
                try {
                    // optional logging... disable after it's working
                    //console.log("KeepAlive RESPONSE: " + chunk);
                } catch (err) {
                    console.log(err.message);
                }
            });
        }).on('error', function(err) {
            console.log("Error: " + err.message);
        });
    }, 5 * 60 * 1000); // load every 5 minutes
}

startKeepAlive();

