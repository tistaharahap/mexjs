import Strategy from './base'
import Decimal from 'decimal.js'

class PengenOpitShort extends Strategy {
  filter() {
    return this.breakoutCandle()
      && this.candleBelowAlligatorMouth()
      && this.breakoutVWMA()
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
   * The current candle must be breakout vwma 21
   * 
   * @return {boolean}
   */
  breakoutVWMA() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    const lowBelowVWMA21 = new Decimal(lastCandle.low)
      .lessThan(lastCandle.vwma21)
    const highAboveVWMA21 = new Decimal(lastCandle.high)
      .greaterThan(lastCandle.vwma21)

    return lowBelowVWMA21 && highAboveVWMA21
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

export default PengenOpitShort