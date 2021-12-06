/**
 * bll - business logic layer
 * ServerLogic - class that implements the server logic.
 * - In 60% of requests, he answers `OK`.
 * - In 20% of requests, replies with `500` with an error.
 * - In 20% of requests "hangs" without answering anything and without closing connection.
 * The server write log to the terminal all received messages (those to which it responded with `OK`).
 */
class ServerLogic {
  _maxCacheLength = 1000;
  _requestsCache = [];

  constructor(maxCacheLength = 1000) {
    this._maxCacheLength = maxCacheLength;
  }

  /**
   * Return http maximum length of the requests cache
   * @returns {number}
   */
  get maxCacheLength() {
    return this._maxCacheLength;
  }

  /**
   * Return http maximum length of the requests cache
   * @returns {number}
   */
  get currentCacheLength() {
    return this._requestsCache.length;
  }

  /**
   * Return average value
   * @param {number[]} nums
   * @returns {number}
   */
  average(nums) {
    return nums.reduce((a, b) => a + b) / nums.length;
  }

  /**
   * Return median value
   * @param {number[]} nums
   * @returns {number}
   */
  median(nums) {
    const sorted = nums.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
  }

  /**
   * Returns the accumulated statistics of the request cache
   * @returns {{median:number, average:number }}
   */
  getStat() {
    let responseTimes = this._requestsCache.map((c) => c.responseTime);

    return {
      median: this.median(responseTimes),
      average: this.average(responseTimes),
    };
  }

  /**
   * Statistics request processing
   * @param {object} data
   * @param {number} data.pingId
   * @param {number} data.deliveryAttempt
   * @param {number} data.date
   * @param {number} data.responseTime
   * @returns {{code:number, message:string }}
   */
  statisticsProcessing(data) {
    let expectation = this.getRandomNumber(1, 100);

    if (process.env.NODE_ENV === "test") {
      //in test mode, we will exclude the possibility of broken and hung requests
      expectation = 1;
    }

    if (expectation <= 60) {
      // 60% of requests - we are Ok
      this.applyStatisticData(data);
      console.log(`apply statistic data - ${JSON.stringify(data)}`);
      return { code: 200, message: "OK" };
    } else if (expectation <= 80) {
      // 20% of requests - we are broken
      return { code: 500, message: "we are broken" };
    } else {
      // 20% of requests - we are "hangs"
      return null;
    }
  }

  /**
   * Random number from min to (max + 1)
   * @param {number} min minimum value
   * @param {number} max maximum value
   * @returns {number}
   */
  getRandomNumber(min, max) {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
  }

  /**
   * Validate request data. Nothing is returned or throw exception
   * @param {object} data
   * @param {number} data.pingId
   * @param {number} data.deliveryAttempt
   * @param {number} data.date
   * @param {number} data.responseTime
   */
  validateRequestData(data) {
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("data not defined.");
    }

    this.checkForNumber(data, "pingId");
    this.checkForNumber(data, "deliveryAttempt");
    this.checkForNumber(data, "date");
    this.checkForNumber(data, "responseTime");
  }

  /**
   * Check field <fieldName> from data<object> for a number.
   * Nothing is returned or throw exception
   **/
  checkForNumber(data, fieldName) {
    if (typeof data[fieldName] !== "number") {
      throw new Error(`${fieldName} is not a number`);
    }
  }

  /**
   * Remember the value of statistics
   * @param {object} data
   * @param {number} data.pingId
   * @param {number} data.deliveryAttempt
   * @param {number} data.date
   * @param {number} data.responseTime
   */
  applyStatisticData(data) {
    this.validateRequestData(data);

    //this request was processed earlier. just exit the method
    if (this._requestsCache.find((r) => r.pingId === data.pingId)) {
      return null;
    }
    this._requestsCache.push(data);

    if (this._requestsCache.length > this._maxCacheLength) {
      this._requestsCache.shift();
    }

    return null;
  }
}

module.exports = ServerLogic;
