process.env.NODE_ENV = "test";

const chai = require("chai"),
  should = require("chai").should(),
  chaiHttp = require("chai-http"),
  serverInstance = require("../src/index");

chai.use(chaiHttp);

describe("server test", () => {
  before(async () => {
    try {
      await serverInstance.start();
    } catch (err) {
      console.error("Error on start HTTP server", err);
    }

    // make sure the server is running before starting the tests
    serverInstance.isRunning.should.be.true;
  });

  it("get main page", async () => {
    let res = await chai.request(serverInstance.httpServer).get("/");

    res.status.should.be.equal(200);
  });

  it("get unknown page ", async () => {
    let res = await chai
      .request(serverInstance.httpServer)
      .get("/get/any/page");

    res.status.should.be.equal(404);
  });

  it("post to unknown endpoint ", async () => {
    let res = await chai
      .request(serverInstance.httpServer)
      .post("/post/any/page");

    res.status.should.be.equal(404);
  });

  it("post to /data with broken request json in body ", async () => {
    let res = await chai
      .request(serverInstance.httpServer)
      .post("/data")
      .send('{"broken":payload');

    res.status.should.be.equal(500);
  });

  it("post to /data with empty request payload object ", async () => {
    let res = await chai
      .request(serverInstance.httpServer)
      .post("/data")
      .send("{}");

    res.status.should.be.equal(500);
  });
});
