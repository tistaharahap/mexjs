class Strategy {
  /**
   * Constructor
   * 
   * @param {Array} candlesticks - OHLC3 candlesticks
   * @param {Object} feed - Bitmex websocket feed
   * 
   */
  constructor(candlesticks, feed) {
    if (this.constructor === Strategy) {
      throw new TypeError('Abstract class "Strategy" cannot be instantiated')
    }

    if (this.filter === undefined) {
      throw new TypeError('Classes extending the "Strategy" abstract class must implement the "filter" method')
    }

    /** 
     * @property {Array} candlesticks OHLC candlesticks
     */
    this.candlesticks = candlesticks

    /** 
     * @property {Object} name Bitmex WebSocket feed
     */
    this.feed = feed
  }
}

export default Strategy
