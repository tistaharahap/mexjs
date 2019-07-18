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
    const beforeLastCandle = this.candlesticks[this.candlesticks.length - 2]
    const beforeBeforeLastCandle = this.candlesticks[this.candlesticks.length - 3]
    const currentPrice = new Decimal(this.feed.data[0].price)
    return currentPrice.greaterThan(lastCandle.lastUpFractal) &&
      currentPrice.greaterThan(beforeLastCandle.lastUpFractal) &&
      currentPrice.greaterThan(beforeBeforeLastCandle.lastUpFractal)
  }
}

export default FractalBreakoutLong
