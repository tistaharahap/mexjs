import Strategy from './base'
import Decimal from 'decimal.js'

class FractalligatorShort extends Strategy {
  filter() {
    return this.breakoutCandle()
  }

  /**
   * The current price must be breakout fractal
   * 
   * @return {boolean}
   */
  breakoutCandle() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    const currentPrice = new Decimal(this.feed.data[0].price)
    const currentPriceBelowFractal = currentPrice
      .lessThan(lastCandle.lastDownFractal)
    const highBelowTeeth = new Decimal(lastCandle.high)
      .lessThan(lastCandle.teeth)

    return currentPriceBelowFractal && highBelowTeeth
  }
}

export default FractalligatorShort