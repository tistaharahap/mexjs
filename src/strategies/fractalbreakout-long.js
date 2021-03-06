import Strategy from './base'
import Decimal from 'decimal.js'

class FractalBreakoutLong extends Strategy {
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
    const currentPrice = new Decimal(this.feed.data[0].price)
    return currentPrice.greaterThan(lastCandle.lastUpFractal)
  }
}

export default FractalBreakoutLong
