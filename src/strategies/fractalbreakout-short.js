import Strategy from './base'
import Decimal from 'decimal.js'

class FractalBreakoutShort extends Strategy {
  filter() {
    return this.breakoutCandle()
  }

  /**
   * Current price must be higher than the last up fractal
   * 
   * @return {boolean}
   */
  breakoutCandle() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    const currentPrice = this.feed.data[0].price
    return new Decimal(currentPrice)
      .lessThan(lastCandle.lastDownFractal)
  }
}

export default FractalBreakoutShort
