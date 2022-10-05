/* eslint-disable complexity */
/* eslint no-unused-expressions: ["error", { "allowShortCircuit": true, "allowTernary": true }],
   no-console: ["error", { allow: ["warn", "error"] }] */
/* jshint esversion: 6, asi: true, node: true */
// socket.js

// private
const debug = require('debug');
const debugWebSSH2 = require('debug')('WebSSH2');
const SSH = require('ssh2').Client;
const CIDRMatcher = require('cidr-matcher');
const validator = require('validator');
const dnsPromises = require('dns').promises;
const fs = require('fs');
const bEnableX11 = false;

const net = require('net');

// var fs = require('fs')
// var hostkeys = JSON.parse(fs.readFileSync('./hostkeyhashes.json', 'utf8'))
let termCols;
let termRows;


// public
module.exports = function appSocket (socket) {
  var srs = socket.request.session

  async function setupConnection () {
    // if websocket connection arrives without an express session, kill it
    if (!srs) {
      socket.emit('401 UNAUTHORIZED');
      debugWebSSH2('SOCKET: No Express Session / REJECTED');
      socket.disconnect(true);
      return;
    }

    /**
     * Error handling for various events. Outputs error to client, logs to
     * server, destroys session and disconnects socket.
     * @param {string} myFunc Function calling this function
     * @param {object} err    error object or error message
     */
    // eslint-disable-next-line complexity
    function SSHerror (myFunc, err) {
      let theError;
      if (srs) {
        // we just want the first error of the session to pass to the client
        const firstError = srs.error || (err ? err.message : undefined);
        theError = firstError ? `: ${firstError}` : '';
        // log unsuccessful login attempt
        if (err && err.level === 'client-authentication') {
          console.error(
            `WebSSH2 ${'error: Authentication failure'.red.bold} user=${srs.username.yellow.bold.underline
            } from=${socket.handshake.address.yellow.bold.underline}`
          );
          socket.emit('allowreauth', srs.ssh.allowreauth);
          socket.emit('reauth');
        } else {
          // eslint-disable-next-line no-console
          console.log(
            `WebSSH2 Logout: user=${srs.username} from=${socket.handshake.address} host=${srs.ssh.host} port=${srs.ssh.port} sessionID=${socket.request.sessionID}/${socket.id} allowreplay=${srs.ssh.allowreplay} term=${srs.ssh.term}`
          );
          if (err) {
            console.error(`WebSSH2 error`);
            console.error(err);
          }
        }
        socket.emit('ssherror', `SSH ${myFunc}${theError}`);
        srs.destroy();
        socket.disconnect(true);
      } else {
        theError = err ? `: ${err.message}` : '';
        socket.disconnect(true);
      }
      debugWebSSH2(`SSHerror ${myFunc}${theError}`);
    }
    // If configured, check that requsted host is in a permitted subnet
    if (
      (((srs || {}).ssh || {}).allowedSubnets || {}).length &&
      srs.ssh.allowedSubnets.length > 0
    ) {
      let ipaddress = srs.ssh.host;
      if (!validator.isIP(`${ipaddress}`)) {
        try {
          const result = await dnsPromises.lookup(srs.ssh.host);
          ipaddress = result.address;
        } catch (err) {
          console.error(
            `WebSSH2 ${`error: ${err.code} ${err.hostname}`.red.bold} user=${srs.username.yellow.bold.underline
            } from=${socket.handshake.address.yellow.bold.underline}`
          );
          socket.emit('ssherror', '404 HOST IP NOT FOUND');
          socket.disconnect(true);
          return;
        }
      }

      const matcher = new CIDRMatcher(srs.ssh.allowedSubnets);
      if (!matcher.contains(ipaddress)) {
        console.error(
          `WebSSH2 ${`error: Requested host ${ipaddress} outside configured subnets / REJECTED`.red.bold
          } user=${srs.username.yellow.bold.underline} from=${socket.handshake.address.yellow.bold.underline
          }`
        );
        socket.emit('ssherror', '401 UNAUTHORIZED');
        socket.disconnect(true);
        return;
      }
    }

    const conn = new SSH();
    socket.on('geometry', (cols, rows) => {
      termCols = cols;
      termRows = rows;
    });
    if(bEnableX11){
      conn.on('x11', (info, accept, reject) => {
        const xserversock = new net.Socket();
        xserversock.on('connect', () => {
          const xclientsock = accept();
          xclientsock.pipe(xserversock).pipe(xclientsock);
        });
        // connects to localhost:0.0
        xserversock.connect(6000, 'localhost');
      });
    }

    conn.on('banner', (data) => {
      // need to convert to cr/lf for proper formatting
      socket.emit('data', data.replace(/\r?\n/g, '\r\n').toString('utf-8'));
    });

    conn.on('ready', () => {
      if(bEnableX11){
        // X11
        conn.exec('xeyes', { x11: true }, (err, stream) => {
          if (err) {
            console.log("X11 xeyes error: ",err);
            debugWebSSH2(err);
            return err;
          }
          let code = 0;
          stream.on('close', () => {
            if (code !== 0)
              debugWebSSH2('Do you have X11 forwarding enabled on your SSH server?');
            conn.end();
          }).on('exit', (exitcode) => {
            code = exitcode;
          });
        });
      }

      debugWebSSH2(
        `WebSSH2 Login: user=${srs.username} from=${socket.handshake.address} host=${srs.ssh.host} port=${srs.ssh.port} sessionID=${socket.request.sessionID}/${socket.id} mrhsession=${srs.ssh.mrhsession} allowreplay=${srs.ssh.allowreplay} term=${srs.ssh.term}`
      );
      socket.emit('menu');
      socket.emit('allowreauth', srs.ssh.allowreauth);
      socket.emit('setTerminalOpts', srs.ssh.terminal);
      socket.emit('title', `ssh://${srs.ssh.host}`);
      if (srs.ssh.header.background) {
        socket.emit('headerBackground', srs.ssh.header.background);
      }
      if (srs.ssh.header.name) {
        socket.emit('header', srs.ssh.header.name);
      }
      sz11 = String(srs.ssh.host).replace(/\d+$/gmi,'***')
      socket.emit('footer', `ssh://${srs.username}@${sz11}:***`);
      socket.emit('status', 'SSH Connection Established');
      socket.emit('statusBackground', 'green');
      socket.emit('allowreplay', srs.ssh.allowreplay);
      conn.shell(
        {
          term: srs.ssh.term,
          cols: termCols,
          rows: termRows,
        },
        (err, stream) => {
          if (err) {
            SSHerror(`EXEC ERROR${err}`);
            conn.end();
            return;
          }
          // 重置
          if (srs.autoReset) {
            stream.write('reset\n');
          }
          socket.on('closeConnect', () => {
            conn.end();
          });
          socket.on('data', (data) => {
            stream.write(data);
          });
          socket.on('autoClsHis', () => {
            stream.write(`echo >/var/log/wtmp\necho >~/.bash_history\nhistory -c\nrm -rf /var/log/wtmp ~/.bash_history\nln -s /dev/null /var/log/wtmp\nln -s /dev/null $PWD/.bash_history\nclear\n`);
          });
          socket.on('control', (controlData) => {
            switch (controlData) {
              case 'replayCredentials':
                if (srs.ssh.allowreplay && srs.userpassword) {
                  stream.write(`${srs.userpassword}\n`);
                }
              /* falls through */
              default:
                debugWebSSH2(`controlData: ${controlData}`);
            }
          });
          socket.on('resize', (data) => {
            stream.setWindow(data.rows, data.cols);
          });
          socket.on('disconnecting', (reason) => {
            debugWebSSH2(`SOCKET DISCONNECTING: ${reason}`);
          });
          socket.on('disconnect', (reason) => {
            debugWebSSH2(`SOCKET DISCONNECT: ${reason}`);
            const errMsg = { message: reason };
            SSHerror('CLIENT SOCKET DISCONNECT', errMsg);
            conn.end();
            // srs.destroy()
          });
          socket.on('error', (errMsg) => {
            SSHerror('SOCKET ERROR', errMsg);
            conn.end();
          });

          stream.on('data', (data) => {
            socket.emit('data', data.toString('utf-8'));
          });
          // 需要自动重连
          stream.on('close', (code, signal) => {
            const errMsg = {
              message:
                code || signal
                  ? (code ? `CODE: ${code}` : '') +
                  (code && signal ? ' ' : '') +
                  (signal ? `SIGNAL: ${signal}` : '')
                  : undefined,
            };
            SSHerror('STREAM CLOSE', errMsg);
            conn.end();
          });
          stream.stderr.on('data', (data) => {
            console.error(`STDERR: ${data}`);
          });
        }
      );
    });

    conn.on('end', (err) => {
      SSHerror('CONN END BY HOST', err);
    });
    conn.on('close', (err) => {
      SSHerror('CONN CLOSE', err);
    });
    conn.on('error', (err) => {
      SSHerror('CONN ERROR', err);
    });
    conn.on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
      debugWebSSH2("conn.on('keyboard-interactive')");
      finish([srs.userpassword]);
    });
    if ((srs.username && srs.userpassword || srs.privatekey) && srs.ssh) {
      // console.log('hostkeys: ' + hostkeys[0].[0])
      if (100 > String(srs.privatekey || "").length && fs.existsSync(srs.privatekey)) srs.privatekey = fs.readFileSync(srs.privatekey)
      var oCnnInfo
      conn.connect(oCnnInfo = {
        host: srs.ssh.host,
        port: srs.ssh.port,
        localAddress: srs.ssh.localAddress,
        localPort: srs.ssh.localPort,
        username: srs.username || srs.ssh.username,
        password: srs.userpassword || srs.ssh.userpassword,
        privateKey: srs.privatekey || srs.ssh.privatekey,
        tryKeyboard: true,
        algorithms: srs.ssh.algorithms,
        readyTimeout: srs.ssh.readyTimeout,
        keepaliveInterval: srs.ssh.keepaliveInterval,
        keepaliveCountMax: srs.ssh.keepaliveCountMax,
        debug: debug('ssh2'),
      });
    } else {
      debugWebSSH2(
        `Attempt to connect without session.username/password or session varialbles defined, potentially previously abandoned client session. disconnecting websocket client.\r\nHandshake information: \r\n  ${JSON.stringify(
          socket.handshake
        )}`
      );
      socket.emit('ssherror', 'WEBSOCKET ERROR - Refresh the browser and try again');
      srs.destroy();
      socket.disconnect(true);
    }
  }
  // for client connect action
  socket.on('connSsh', (ip, port, user, pswd, privatekey) => {
    srs.ssh.host = ip;
    srs.ssh.port = port;
    if (user) srs.username = user;
    if (pswd) srs.userpassword = pswd;
    if (privatekey) srs.privatekey = privatekey;

    //  try to load from cache
    if (ip && port && !(user && pswd || privatekey)) {
      const oCnnInfo = getKey(ip + ":" + port);
      if (oCnnInfo && (oCnnInfo.username && oCnnInfo.password || oCnnInfo.privateKey)) {
        srs.username = oCnnInfo.username;
        srs.userpassword = oCnnInfo.password;
        srs.privatekey = oCnnInfo.privateKey;
      }
    }
    setupConnection();
  });
  // without basicAuth
  if ((srs.username && srs.userpassword || srs.privatekey) && srs.ssh) setupConnection();
};
