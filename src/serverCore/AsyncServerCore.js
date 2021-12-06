const { createServer } = require("http");
const url = require("url");

class AsyncServerCore {
  _config = {};
  _server = null;
  _started = false;
  _error = null;

  /**
   * @param {object} config
   * @param {number} config.port
   * @param {Array.<{method: string, path: string, controller: function}>} config.routes
   */
  constructor(config) {
    // attach config to the class
    this._config = config;
  }

  /**
   * Return http server state
   */
  get isRunning() {
    return this._started;
  }

  /**
   * Return http server object
   */
  get httpServer() {
    return this._server;
  }

  /**
   * Return server error value or null
   */
  get errorValue() {
    return this._error;
  }

  /**
   * Start current instance of the server
   * @returns {Promise}
   */
  start() {
    return new Promise((resolve, reject) => {
      try {
        if (this._started) {
          return reject(new Error("Server has been already started."));
        }

        // apply configurations
        const serverConfig = this.getVerifiedConfigObject(this._config);

        this._server = createServer((req, res) => {
          let rawPayload = "";
          //let routes = this._config.routes;

          // set default response header
          res.writeHead(200, { "Content-type": "text/plain" });

          // read data
          req.on("data", (data) => {
            rawPayload += data;
          });

          req.on("end", async () => {
            try {
              let payload = null;

              // on this server payload always json
              if (rawPayload.length > 0) {
                payload = JSON.parse(rawPayload);
              }

              AsyncServerCore.routing(req, res, payload, serverConfig.routes);
            } catch (e) {
              res.writeHead(500);
              res.end(`error 500 - ${e.toString()}`);
            }
          });
        });

        // bind events
        this._server.once("listening", () => {
          this._server.removeAllListeners("error");
          this._server.removeAllListeners("listening");
          this._started = true;
          this._error = null;

          return resolve(this);
        });

        this._server.once("error", (err) => {
          this._server.removeAllListeners("listening");
          this._server.removeAllListeners("error");
          this._started = false;
          this._error = err;

          return reject(err);
        });

        // try to start the server
        const listenOptions = {};

        // TCP/IP endpoint
        listenOptions.port = serverConfig.port;

        // start server
        this._server.listen(listenOptions);

        return resolve();
      } catch (err) {
        return reject(err);
      }
    });
  }

  /**
   * Stop current instance of the server
   * @returns {Promise}
   */
  stop() {
    return new Promise((resolve, reject) => {
      try {
        if (!this._started || !this._server) {
          this._started = false;
          this._server = null;
          return reject(new Error("Server is not started"));
        }

        this._server.close((err) => {
          if (err) {
            return reject(err);
          }

          this._started = false;
          this._server = null;

          return resolve();
        });
      } catch (err) {
        return reject(err);
      }
    });
  }

  /**
   * Routing
   *
   * @param {object} req http request object
   * @param {object} res http response object
   * @param {object} postData object of payload data
   * @param {Array.<{method: string, path: string, controller: function}>} routes
   */
  static routing(req, res, postData, routes) {
    const urlParsed = url.parse(req.url, true);

    let foundRoutes = routes.filter(
      (r) => r.method === req.method && urlParsed.pathname === r.path
    );

    if (foundRoutes.length === 1) {
      //execute the controller of the desired route
      let serverAnswer = foundRoutes[0].controller(postData);

      if (serverAnswer) {
        res.writeHead(serverAnswer.code);
        res.end(serverAnswer.message);
      }

      // if (!serverAnswer) server should not send response to the request by condition
    } else {
      res.writeHead(404);
      res.end("404 - method not found");
    }
  }

  /**
   * Return a server config object with verified values.
   * Notice: unix socket or windows pipe not implemented in this server.
   *
   * @param {number} conf.port
   * @param {Array.<{method: string, path: string, controller: function}>} conf.routes
   *
   * @returns {{port:number, handler:function }}
   */
  getVerifiedConfigObject(conf) {
    if (typeof conf !== "object" || Array.isArray(conf)) {
      throw new Error("configuration not defined.");
    }

    if (typeof conf.port === "string") {
      throw new Error(
        "Unix socket or windows pipe not implemented in this server."
      );
    }

    if (typeof conf.port !== "number") {
      throw new Error("Port is not a number in the config.");
    }

    if (!Array.isArray(conf.routes) || conf.routes.length === 0) {
      throw new Error("No routes is defined in the config.");
    }

    return {
      port: conf.port,
      routes: conf.routes,
    };
  }
}

module.exports = AsyncServerCore;
