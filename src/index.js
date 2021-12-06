const AsyncServerCore = require("./serverCore/AsyncServerCore");
const exitHelper = require("./helpers/exitHelper");
const ServerLogic = require("./bll/ServerLogic");

// port value from test task
const PORT = 8080;
const MAX_CACHE_LENGTH = 1000;

const serverLogic = new ServerLogic(MAX_CACHE_LENGTH);

// Let's describe the routes used and their controllers
const routes = [
  {
    method: "GET",
    path: "/",
    controller: () => ({ code: 200, message: "server main page" }),
  },
  {
    method: "POST",
    path: "/data",
    controller: (data) => serverLogic.statisticsProcessing(data),
  },
];

const serverInstance = new AsyncServerCore({
  port: PORT,
  routes,
});

//in test mode, we don't need to start the serverInstance.
if (process.env.NODE_ENV !== "test") {
  // entry point to start server
  (async () => {
    try {
      await serverInstance.start();
      if (serverInstance.isRunning) {
        console.log(`server running on port ${PORT}`);
      } else {
        console.log(`server not running - "${serverInstance.errorValue}"`);
      }
    } catch (err) {
      console.error("Error on start HTTP server", err);
      process.exit(1);
    }
  })();

  // listen signal to stop events
  exitHelper((signal) => {
    console.error(`The server is shutting down - ${signal}`);

    console.log(`Requests cache size - ${serverLogic.currentCacheLength}`);

    console.log("View the collected statistics:");
    const statistic = serverLogic.getStat();

    console.log(`Average - ${statistic.average}`);
    console.log(`Median - ${statistic.median}`);

    process.exit(0);
  });
}

//export server instance for tests
module.exports = serverInstance;
