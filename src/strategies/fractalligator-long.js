import Strategy from './base'
import Decimal from 'decimal.js'

class FractalligatorLong extends Strategy {
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
    const currentPriceAboveFractal = currentPrice
      .greaterThan(lastCandle.lastUpFractal)
    const priceAboveTeeth = new Decimal(lastCandle.low)
      .greaterThan(lastCandle.teeth)

    return currentPriceAboveFractal && priceAboveTeeth
  }
}

export default FractalligatorLong