import Strategy from './base'
import Decimal from 'decimal.js'

class Wisemen3Short extends Strategy {
  filter() {
    return this.breakoutCandle()
      && this.candleBelowAlligatorMouth()
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

    return currentPriceBelowFractal
  }

  /**
   * The current price must be below alligator mouth
   * 
   * @return {boolean}
   */
  candleBelowAlligatorMouth() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    const lastCandleHigh = new Decimal(lastCandle.high)
    const highBelowJaw = lastCandleHigh
      .lessThan(lastCandle.jaw)
    const highBelowTeeth = lastCandleHigh
      .lessThan(lastCandle.teeth)
    const highBelowLips = lastCandleHigh
      .lessThan(lastCandle.lips)

    return highBelowJaw && highBelowTeeth && highBelowLips
  }
}

export default Wisemen3Short