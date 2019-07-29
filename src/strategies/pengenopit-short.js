import Strategy from './base'
import Decimal from 'decimal.js'

class PengenOpitShort extends Strategy {
  filter() {
    return this.breakoutCandle()
      && (this.candleBelowAlligatorMouth() || this.candleBreakoutAlligatorMouth())
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
    const openAboveFractal = new Decimal(lastCandle.open)
      .greaterThan(lastCandle.lastDownFractal)

    return currentPriceBelowFractal && openAboveFractal
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
    const teethBelowJaw = new Decimal(lastCandle.jaw)
      .greaterThan(lastCandle.teeth)
    const teethAboveLips = new Decimal(lastCandle.teeth)
      .greaterThan(lastCandle.lips)

    return highBelowJaw && highBelowTeeth && highBelowLips && teethBelowJaw && teethAboveLips
  }

  /**
   * The current price must be breakout alligator mouth
   * 
   * @return {boolean}
   */
  candleBreakoutAlligatorMouth() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    const lastCandleLow = new Decimal(lastCandle.low)
    const lastCandleHigh = new Decimal(lastCandle.high)
    const lowBelowJaw = lastCandleLow
      .lessThan(lastCandle.jaw)
    const lowBelowTeeth = lastCandleLow
      .lessThan(lastCandle.teeth)
    const lowBelowLips = lastCandleLow
      .lessThan(lastCandle.lips)
    const highAboveJaw = lastCandleHigh
      .greaterThan(lastCandle.jaw)
    const highAboveTeeth = lastCandleHigh
      .greaterThan(lastCandle.teeth)
    const highAboveLips = lastCandleHigh
      .greaterThan(lastCandle.lips)

    return lowBelowJaw && lowBelowTeeth && lowBelowLips && highAboveJaw && highAboveTeeth && highAboveLips
  }
}

export default PengenOpitShort
