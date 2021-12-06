process.env.NODE_ENV = "test";

const chai = require("chai"),
  should = require("chai").should(),
  ServerLogic = require("../src/bll/ServerLogic");

describe("bll test", () => {
  it("apply statistics package", async () => {
    let serverLogic = new ServerLogic();

    serverLogic.applyStatisticData({
      pingId: 1,
      deliveryAttempt: 1,
      date: 1589877226614,
      responseTime: 247,
    });

    serverLogic.currentCacheLength.should.be.equal(1);
  });

  it("apply statistics with duplicate pingId packages", async () => {
    let serverLogic = new ServerLogic();

    // put the first statistic
    serverLogic.applyStatisticData({
      pingId: 1,
      deliveryAttempt: 1,
      date: 1589877226614,
      responseTime: 247,
    });

    // put the second element of statistics, but with the same id
    serverLogic.applyStatisticData({
      pingId: 1,
      deliveryAttempt: 1,
      date: 1589877236614,
      responseTime: 100500,
    });

    //check the length of the request cache
    serverLogic.currentCacheLength.should.be.equal(1);
  });

  it("add more packages than the cache length", async () => {
    let serverLogic = new ServerLogic(1000);

    // send more requests than the current cache length
    let countRequests = serverLogic.maxCacheLength + 3;

    for (let i = 0; i < countRequests; i++) {
      serverLogic.applyStatisticData({
        pingId: i,
        deliveryAttempt: 1,
        date: 1589877226614,
        responseTime: 247,
      });
    }

    serverLogic.currentCacheLength.should.be.equal(serverLogic.maxCacheLength);
  });

  it("checking statistic counting", async () => {
    let serverLogic = new ServerLogic(1000);

    // send responseTime for test as sequence - 1, 102, 103, 104
    serverLogic.applyStatisticData({
      pingId: 1,
      deliveryAttempt: 1,
      date: 1589877226614,
      responseTime: 1,
    });

    for (let i = 2; i < 5; i++) {
      serverLogic.applyStatisticData({
        pingId: i,
        deliveryAttempt: 1,
        date: 1589877226614,
        responseTime: 100 + i,
      });
    }

    serverLogic.currentCacheLength.should.be.equal(4);

    // reference median of (1, 102, 103, 104) = 102.5
    const referenceMedian = 102.5;

    // reference average of (1, 102, 103, 104) = 102.5
    const referenceAverage = 77.5;

    let statistic = serverLogic.getStat();
    statistic.average.should.be.equal(referenceAverage);
    statistic.median.should.be.equal(referenceMedian);
  });
});
