/* jshint esversion: 6, asi: true, node: true */
/* eslint no-unused-expressions: ["error", { "allowShortCircuit": true, "allowTernary": true }],
   no-console: ["error", { allow: ["warn", "error"] }] */
// app.js

// eslint-disable-next-line import/order
const config = require('./config');
const path = require('path');

const nodeRoot = path.dirname(require.main.filename);
const publicPath = path.join(nodeRoot, 'client', 'public');
const express = require('express');
const logger = require('morgan');

const app = express();
const server = require('http').Server(app);
const validator = require('validator');
const favicon = require('serve-favicon');
const io = require('socket.io')(server, {
  serveClient: false,
  path: '/ssh/socket.io',
  origins: config.http.origins,
});
const session = require('express-session')({
  secret: config.session.secret,
  name: config.session.name,
  resave: true,
  saveUninitialized: false,
  unset: 'destroy',
});
const appSocket = require('./socket');
const expressOptions = require('./expressOptions');
const myutil = require('./util');

// set basicAuth default user and paswd
// myutil.setDefaultCredentials(
//   config.user.name,
//   config.user.password,
//   config.user.privatekey,
//   config.user.overridebasic
// );

// safe shutdown
let shutdownMode = false;
let shutdownInterval = 0;
let connectionCount = 0;
// eslint-disable-next-line consistent-return
function safeShutdownGuard (req, res, next) {
  if (shutdownMode) {
    res.status(503).end('Service unavailable: Server shutting down');
  } else {
    return next();
  }
}
// clean stop
function stopApp (reason) {
  shutdownMode = false;
  // eslint-disable-next-line no-console
  if (reason) console.log(`Stopping: ${reason}`);
  if (shutdownInterval) clearInterval(shutdownInterval);
  io.close();
  server.close();
}

module.exports = { server, config };
// express
app.use(safeShutdownGuard);
app.use(session);
// app.use(myutil.basicAuth);
if (config.accesslog) app.use(logger('common'));
app.disable('x-powered-by');

// static files
app.use('/ssh', express.static(publicPath, expressOptions));

// favicon from root if being pre-fetched by browser to prevent a 404
app.use(favicon(path.join(publicPath, 'favicon.ico')));

app.get('/ssh/reauth', (req, res) => {
  const r = req.headers.referer || '/';
  res
    .status(401)
    .send(
      `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${r}"></head><body bgcolor="#000"></body></html>`
    );
});

var fnSshCbk=function(req, res){
  if(req.query)
  {
    for(k in req.query)
    {
      if(req.query[k])req.params[k]=req.query[k]
    }
  }
  // console.log(req.query);
  res.sendFile(path.join(path.join(publicPath, 'client.htm')));
  // capture, assign, and validate variables
  // Optimized code to be more readable，Improve maintainability
  var configSsh = config.ssh, reqParams = req.params, reqQuery = req.query;
  reqQuery.port = reqParams.port || reqQuery.port;

  ct = config.terminal
  reqHeaders = req.headers

  rss = req.session.ssh = {
    autoReset: config.autoReset,
    username:req.params['username']||configSsh.username,
    host:
      configSsh.host ||
      (validator.isIP(`${reqParams.host}`) && reqParams.host) ||
      (validator.isFQDN(reqParams.host) && reqParams.host) ||
      (/^(([a-z]|[A-Z]|[0-9]|[!^(){}\-_~])+)?\w$/.test(reqParams.host) && reqParams.host),
    port:
      (validator.isInt(`${reqQuery.port}`, { min: 1, max: 65535 }) && reqQuery.port) ||
      configSsh.port,
    localAddress: configSsh.localAddress,
    localPort: configSsh.localPort,
    header: {
      name: reqQuery.header || config.header.text,
      background: reqQuery.headerBackground || config.header.background,
    },
    algorithms: config.algorithms,
    keepaliveInterval: configSsh.keepaliveInterval,
    keepaliveCountMax: configSsh.keepaliveCountMax,
    allowedSubnets: configSsh.allowedSubnets,
    term:
      (/^(([a-z]|[A-Z]|[0-9]|[!^(){}\-_~])+)?\w$/.test(reqQuery.sshterm) && reqQuery.sshterm) ||
      configSsh.term,
    terminal: {
      cursorBlink: validator.isBoolean(`${reqQuery.cursorBlink}`)
        ? myutil.parseBool(reqQuery.cursorBlink)
        : ct.cursorBlink,
      scrollback:
        validator.isInt(`${reqQuery.scrollback}`, { min: 1, max: 200000 }) && reqQuery.scrollback
          ? reqQuery.scrollback
          : ct.scrollback,
      tabStopWidth:
        validator.isInt(`${reqQuery.tabStopWidth}`, { min: 1, max: 100 }) && reqQuery.tabStopWidth
          ? reqQuery.tabStopWidth
          : ct.tabStopWidth,
      bellStyle:
        reqQuery.bellStyle && ['sound', 'none'].indexOf(reqQuery.bellStyle) > -1
          ? reqQuery.bellStyle
          : ct.bellStyle,
    },
    allowreplay:
      config.options.challengeButton ||
      (validator.isBoolean(`${reqHeaders.allowreplay}`)
        ? myutil.parseBool(reqHeaders.allowreplay)
        : false),
    allowreauth: config.options.allowreauth || false,
    mrhsession:
      validator.isAlphanumeric(`${reqHeaders.mrhsession}`) && reqHeaders.mrhsession
        ? reqHeaders.mrhsession
        : 'none',
    serverlog: {
      client: config.serverlog.client || false,
      server: config.serverlog.server || false,
    },
    readyTimeout:
      (validator.isInt(`${reqQuery.readyTimeout}`, { min: 1, max: 300000 }) &&
        reqQuery.readyTimeout) ||
      configSsh.readyTimeout,
  };
  
  rss.userpassword=reqParams.userpassword || reqQuery.userpassword||rss.userpassword;
  rss.privatekey=reqParams.privatekey || reqQuery.privatekey||rss.privatekey;
  req.session['username'] = rss['username']
  req.session['userpassword'] = rss['userpassword']
  req.session['privatekey'] = rss['privatekey']

  rssHd = rss.header
  if (rssHd.name) validator.escape(rssHd.name);
  if (rssHd.background) validator.escape(rssHd.background);
};
// eslint-disable-next-line complexity
app.post(/\/ssh\/host\/.*/, fnSshCbk);
app.get('/ssh/host/:host?', fnSshCbk);

// express error handling
app.use((req, res) => {
  res.status(404).send("Sorry, can't find that!");
});

app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// bring up socket
io.on('connection', appSocket);

// socket.io
// expose express session with socket.request.session
io.use((socket, next) => {
  socket.request.res ? session(socket.request, socket.request.res, next) : next(next); // eslint disable-line
});

io.on('connection', (socket) => {
  connectionCount += 1;

  socket.on('disconnect', () => {
    connectionCount -= 1;
    if (connectionCount <= 0 && shutdownMode) {
      stopApp('All clients disconnected');
    }
  });
});

const signals = ['SIGTERM', 'SIGINT'];
signals.forEach((signal) =>
  process.on(signal, () => {
    if (shutdownMode) stopApp('Safe shutdown aborted, force quitting');
    else if (connectionCount > 0) {
      let remainingSeconds = config.safeShutdownDuration;
      shutdownMode = true;
      const message =
        connectionCount === 1 ? ' client is still connected' : ' clients are still connected';
      console.error(connectionCount + message);
      console.error(`Starting a ${remainingSeconds} seconds countdown`);
      console.error('Press Ctrl+C again to force quit');

      shutdownInterval = setInterval(() => {
        remainingSeconds -= 1;
        if (remainingSeconds <= 0) {
          stopApp('Countdown is over');
        } else {
          io.sockets.emit('shutdownCountdownUpdate', remainingSeconds);
        }
      }, 1000);
    } else stopApp();
  })
);
