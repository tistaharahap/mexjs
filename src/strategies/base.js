class Strategy {
  /**
   * Constructor
   * 
   * @param {Array} candlesticks - OHLC3 candlesticks
   * @param {Object} feed - Bitmex websocket feed
   * 
   */
  constructor(candlesticks, feed, indicators) {
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
     * @property {Object} feed Bitmex WebSocket feed
     */
    this.feed = feed

    /** 
     * @property {Object} indicators The collection of indicators for this strategy
     */
    this.indicators = indicators

    this.calculateIndicators()
  }

  calculateIndicators() {
    console.log('Calculating indicators')
    this.indicators.forEach((it) => {
      const [ indicatorFunc, values ] = it
      
      const results = indicatorFunc(...values)
        .slice(0, this.candlesticks.length - 1)
      results.forEach((v, n) => {
        this.candlesticks[n][indicatorFunc.name] = v
      })
    })
  }
}

export default Strategy
